import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Session } from "../models/session.model.js";
import { AppError } from "../utils/AppError.js";
import { config } from "../config/env.js";

const BCRYPT_ROUNDS = 12;

// Dummy hash for timing-attack resistance when username doesn't exist
const DUMMY_HASH = "$2b$12$LJ3m4ys3GZxkFfnT8R0Oqu.INVALID.HASH.FOR.TIMING.RESIST";

/**
 * Generate a signed JWT access token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      username: user.username,
      name: user.name,
    },
    config.jwtAccessSecret,
    { expiresIn: config.jwtAccessExpiry }
  );
};

/**
 * Generate a cryptographically secure refresh token string
 */
const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString("hex");
};

/**
 * Hash a refresh token with SHA-256 for database storage
 */
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Create a session record in the database for a refresh token
 */
const createSession = async (userId, refreshToken, req, sessionId = null) => {
  const refreshTokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + config.jwtRefreshExpiryMs);

  const sessionData = {
    userId,
    refreshTokenHash,
    userAgent: req.headers["user-agent"] || "",
    ipAddress: req.ip || "",
    expiresAt,
    revokedAt: null,
    replacedBySessionId: null,
  };

  if (sessionId) {
    sessionData._id = sessionId;
  }

  return await Session.create(sessionData);
};

/**
 * Get cookie options based on environment
 */
const getCookieOptions = () => {
  const isProd = config.nodeEnv === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/api/v1/auth",
    maxAge: config.jwtRefreshExpiryMs,
  };
};

/**
 * Sign Up a new user
 */
export const signupUser = async (name, username, password) => {
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const newUser = new User({
    name,
    username,
    password: hashedPassword,
  });

  await newUser.save();
  return { message: "User signed up successfully" };
};

/**
 * Authenticate a user and return tokens + set cookie
 */
export const authenticateUser = async (username, password, req, res) => {
  // Find user with password field explicitly selected
  const user = await User.findOne({ username }).select("+password");

  if (!user) {
    // Timing-attack resistance: run a dummy bcrypt comparison
    await bcrypt.compare(password, DUMMY_HASH);
    throw new AppError("Invalid username or password", 401);
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new AppError("Invalid username or password", 401);
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  // Store hashed refresh token in session collection
  await createSession(user._id, refreshToken, req);

  // Set refresh token as HTTP-only cookie
  res.cookie("refreshToken", refreshToken, getCookieOptions());

  return {
    accessToken,
    user: {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
    },
  };
};

/**
 * Refresh the access token using a valid refresh token from the cookie
 * Implements revocation-based rotation and true reuse detection
 */
export const refreshAccessToken = async (refreshToken, req, res) => {
  if (!refreshToken) {
    throw new AppError("Refresh token required", 401);
  }

  const refreshTokenHash = hashToken(refreshToken);

  // Step 1: Find the session with this refresh token hash
  const session = await Session.findOne({ refreshTokenHash });

  // Step 2: Unknown random token
  if (!session) {
    throw new AppError("Invalid refresh token", 401);
  }

  // Step 3: TRUE REUSE DETECTION
  // If session exists AND revokedAt !== null, this is a previously valid token being replayed
  if (session.revokedAt !== null) {
    // Revoke ALL currently active sessions belonging to that user
    await Session.updateMany(
      {
        userId: session.userId,
        revokedAt: null,
      },
      {
        $set: { revokedAt: new Date() },
      }
    );

    // Clear the refresh-token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: config.nodeEnv === "production" ? "none" : "lax",
      path: "/api/v1/auth",
    });

    throw new AppError("Refresh token reuse detected", 401, "REFRESH_TOKEN_REUSE");
  }

  // Step 4: Check if session is expired (belt-and-suspenders with TTL)
  if (session.expiresAt < new Date()) {
    await Session.updateOne({ _id: session._id }, { $set: { revokedAt: new Date() } });
    throw new AppError("Refresh token expired", 401);
  }

  // Step 5: Find the user
  const user = await User.findById(session.userId);
  if (!user) {
    await Session.updateOne({ _id: session._id }, { $set: { revokedAt: new Date() } });
    throw new AppError("User not found", 401);
  }

  // Step 6: Atomic rotation with concurrency protection
  const newSessionId = new mongoose.Types.ObjectId();
  const newRefreshToken = generateRefreshToken();
  const now = new Date();

  const rotatedSession = await Session.findOneAndUpdate(
    {
      _id: session._id,
      revokedAt: null, // Atomic check: must still be active
    },
    {
      $set: {
        revokedAt: now,
        replacedBySessionId: newSessionId,
      },
    },
    { returnDocument: "before" }
  );

  if (!rotatedSession) {
    // A concurrent request already rotated/revoked this session: trigger reuse invalidation
    await Session.updateMany(
      {
        userId: session.userId,
        revokedAt: null,
      },
      {
        $set: { revokedAt: new Date() },
      }
    );

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: config.nodeEnv === "production" ? "none" : "lax",
      path: "/api/v1/auth",
    });

    throw new AppError("Refresh token reuse detected", 401, "REFRESH_TOKEN_REUSE");
  }

  // Create replacement session document (Session B)
  await createSession(user._id, newRefreshToken, req, newSessionId);

  // Generate new access token
  const accessToken = generateAccessToken(user);

  // Set new refresh token cookie
  res.cookie("refreshToken", newRefreshToken, getCookieOptions());

  return { accessToken };
};

/**
 * Logout — revoke current session and clear cookie
 */
export const logoutUser = async (refreshToken, res) => {
  if (refreshToken) {
    const refreshTokenHash = hashToken(refreshToken);
    await Session.updateOne(
      { refreshTokenHash, revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );
  }

  // Clear the refresh token cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: config.nodeEnv === "production" ? "none" : "lax",
    path: "/api/v1/auth",
  });

  return { message: "Logged out successfully" };
};

/**
 * Get the current user's profile from a verified access token
 */
export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    id: user._id.toString(),
    name: user.name,
    username: user.username,
  };
};
