import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Session } from "../models/session.model.js";
import { AppError } from "../utils/AppError.js";
import { config } from "../config/env.js";

const BCRYPT_ROUNDS = 12;

const DUMMY_HASH =
  "$2b$12$LJ3m4ys3GZxkFfnT8R0Oqu.INVALID.HASH.FOR.TIMING.RESIST";

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      username: user.username,
      name: user.name,
    },
    config.jwtAccessSecret,
    { expiresIn: config.jwtAccessExpiry },
  );
};

const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString("hex");
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

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

export const authenticateUser = async (username, password, req, res) => {
  const user = await User.findOne({ username }).select("+password");

  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH);
    throw new AppError("Invalid username or password", 401);
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new AppError("Invalid username or password", 401);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  await createSession(user._id, refreshToken, req);

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

export const refreshAccessToken = async (refreshToken, req, res) => {
  if (!refreshToken) {
    throw new AppError("Refresh token required", 401);
  }

  const refreshTokenHash = hashToken(refreshToken);

  const session = await Session.findOne({ refreshTokenHash });

  if (!session) {
    throw new AppError("Invalid refresh token", 401);
  }

  if (session.revokedAt !== null) {
    await Session.updateMany(
      {
        userId: session.userId,
        revokedAt: null,
      },
      {
        $set: { revokedAt: new Date() },
      },
    );

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: config.nodeEnv === "production" ? "none" : "lax",
      path: "/api/v1/auth",
    });

    throw new AppError(
      "Refresh token reuse detected",
      401,
      "REFRESH_TOKEN_REUSE",
    );
  }

  if (session.expiresAt < new Date()) {
    await Session.updateOne(
      { _id: session._id },
      { $set: { revokedAt: new Date() } },
    );
    throw new AppError("Refresh token expired", 401);
  }

  const user = await User.findById(session.userId);
  if (!user) {
    await Session.updateOne(
      { _id: session._id },
      { $set: { revokedAt: new Date() } },
    );
    throw new AppError("User not found", 401);
  }

  const newSessionId = new mongoose.Types.ObjectId();
  const newRefreshToken = generateRefreshToken();
  const now = new Date();

  const rotatedSession = await Session.findOneAndUpdate(
    {
      _id: session._id,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: now,
        replacedBySessionId: newSessionId,
      },
    },
    { returnDocument: "before" },
  );

  if (!rotatedSession) {
    await Session.updateMany(
      {
        userId: session.userId,
        revokedAt: null,
      },
      {
        $set: { revokedAt: new Date() },
      },
    );

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: config.nodeEnv === "production" ? "none" : "lax",
      path: "/api/v1/auth",
    });

    throw new AppError(
      "Refresh token reuse detected",
      401,
      "REFRESH_TOKEN_REUSE",
    );
  }

  await createSession(user._id, newRefreshToken, req, newSessionId);

  const accessToken = generateAccessToken(user);

  res.cookie("refreshToken", newRefreshToken, getCookieOptions());

  return { accessToken };
};

export const logoutUser = async (refreshToken, res) => {
  if (refreshToken) {
    const refreshTokenHash = hashToken(refreshToken);
    await Session.updateOne(
      { refreshTokenHash, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: config.nodeEnv === "production" ? "none" : "lax",
    path: "/api/v1/auth",
  });

  return { message: "Logged out successfully" };
};

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
