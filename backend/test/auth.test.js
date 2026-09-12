process.env.NODE_ENV = "test";

import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import crypto from "crypto";
import { app, server } from "../src/app.js";
import { User } from "../src/models/user.model.js";
import { Session } from "../src/models/session.model.js";
import { Meeting } from "../src/models/meeting.model.js";

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const TEST_USER = {
  name: "Test User",
  username: "testuser_phase3",
  password: "TestPass123",
};

const TEST_USER_B = {
  name: "User B",
  username: "userb_phase3",
  password: "TestPass456",
};

// Helper to extract refresh token cookie from response
const getRefreshCookie = (res) => {
  const cookies = res.headers["set-cookie"];
  if (!cookies) return null;
  const cookieArr = Array.isArray(cookies) ? cookies : [cookies];
  const refreshCookie = cookieArr.find((c) => c.startsWith("refreshToken="));
  if (!refreshCookie) return null;
  return refreshCookie.split(";")[0].split("=").slice(1).join("=");
};

// Wait for DB connection
const waitForDb = () =>
  new Promise((resolve) => {
    if (mongoose.connection.readyState === 1) return resolve();
    mongoose.connection.once("connected", resolve);
  });

before(async () => {
  await waitForDb();
  // Clean up test data
  await User.deleteMany({ username: { $in: [TEST_USER.username, TEST_USER_B.username] } });
  await Meeting.deleteMany({ user_id: { $in: [TEST_USER.username, TEST_USER_B.username] } });
});

after(async () => {
  // Clean up test data
  await User.deleteMany({ username: { $in: [TEST_USER.username, TEST_USER_B.username] } });
  await Meeting.deleteMany({ user_id: { $in: [TEST_USER.username, TEST_USER_B.username] } });
  await Session.deleteMany({});
  if (server.listening) {
    server.close();
  }
  await mongoose.disconnect();
});

// ============================================================
// 1. Registration Validation
// ============================================================
describe("Registration Validation", () => {
  it("should reject registration with weak password (no number)", async () => {
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send({ name: "Test", username: "weakpwduser", password: "abcdefgh" });
    assert.equal(res.status, 400);
    assert.ok(res.body.message);
  });

  it("should reject registration with missing fields", async () => {
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send({ username: "missingfields" });
    assert.equal(res.status, 400);
    assert.ok(res.body.message);
  });

  it("should reject registration with short username", async () => {
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send({ name: "Test", username: "ab", password: "TestPass123" });
    assert.equal(res.status, 400);
    assert.ok(res.body.message.toLowerCase().includes("username"));
  });

  it("should succeed with valid registration data", async () => {
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send(TEST_USER);
    assert.equal(res.status, 201);
    assert.ok(res.body.message);
  });

  it("should reject duplicate username", async () => {
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send(TEST_USER);
    assert.equal(res.status, 409);
  });
});

// ============================================================
// 2. Login & Credentials
// ============================================================
describe("Login & Credentials", () => {
  it("should fail login with wrong password (401)", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: TEST_USER.username, password: "WrongPass999" });
    assert.equal(res.status, 401);
    assert.ok(res.body.message.toLowerCase().includes("invalid"));
  });

  it("should fail login with non-existent user (401)", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: "nonexistentuser999", password: "TestPass123" });
    assert.equal(res.status, 401);
    assert.ok(res.body.message.toLowerCase().includes("invalid"));
  });

  it("should return JWT access token and set HTTP-only refresh cookie on valid login", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: TEST_USER.username, password: TEST_USER.password });
    assert.equal(res.status, 200);
    assert.ok(res.body.accessToken);
    assert.ok(res.body.user);
    assert.equal(res.body.user.username, TEST_USER.username);

    // Check Set-Cookie header for httpOnly refresh token
    const cookies = res.headers["set-cookie"];
    assert.ok(cookies, "Set-Cookie header should be present");
    const cookieStr = Array.isArray(cookies) ? cookies.join("; ") : cookies;
    assert.ok(cookieStr.includes("refreshToken="), "Should contain refreshToken cookie");
    assert.ok(cookieStr.toLowerCase().includes("httponly"), "Cookie should be HttpOnly");
  });
});

// ============================================================
// 3. Protected Route Access
// ============================================================
describe("Protected Route Access", () => {
  it("should reject request without Bearer token (401)", async () => {
    const res = await request(app).get("/api/v1/users/get_all_activity");
    assert.equal(res.status, 401);
  });

  it("should reject request with invalid Bearer token (401)", async () => {
    const res = await request(app)
      .get("/api/v1/users/get_all_activity")
      .set("Authorization", "Bearer invalidtoken123");
    assert.equal(res.status, 401);
  });

  it("should return data with valid Bearer token", async () => {
    // Login first
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: TEST_USER.username, password: TEST_USER.password });
    const token = loginRes.body.accessToken;

    const res = await request(app)
      .get("/api/v1/users/get_all_activity")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
  });
});

// ============================================================
// 4. Token Refresh
// ============================================================
describe("Token Refresh", () => {
  it("should rotate refresh token and return new access token", async () => {
    // Login
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: TEST_USER.username, password: TEST_USER.password });
    const refreshCookie = getRefreshCookie(loginRes);
    assert.ok(refreshCookie, "Should have refresh token cookie");

    // Refresh
    const refreshRes = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", `refreshToken=${refreshCookie}`);
    assert.equal(refreshRes.status, 200);
    assert.ok(refreshRes.body.accessToken);

    // New cookie should be different (rotation)
    const newRefreshCookie = getRefreshCookie(refreshRes);
    assert.ok(newRefreshCookie);
    assert.notEqual(newRefreshCookie, refreshCookie, "Refresh token should be rotated");
  });

  it("should reject refresh with no cookie", async () => {
    const res = await request(app).post("/api/v1/auth/refresh");
    assert.equal(res.status, 401);
  });

  it("should reject refresh with invalid cookie", async () => {
    const res = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", "refreshToken=invalidtoken");
    assert.equal(res.status, 401);
  });
});

// ============================================================
// 5. Token Reuse Detection
// ============================================================
describe("Token Reuse Detection", () => {
  it("TEST 1: Rotation retains old session with revokedAt and replacedBySessionId", async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: TEST_USER.username, password: TEST_USER.password });
    const tokenA = getRefreshCookie(loginRes);
    assert.ok(tokenA, "Token A should be returned on login");

    const refreshRes = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", `refreshToken=${tokenA}`);
    assert.equal(refreshRes.status, 200);

    const tokenB = getRefreshCookie(refreshRes);
    assert.ok(tokenB, "Token B should be returned on refresh");
    assert.notEqual(tokenA, tokenB);

    // Confirm Session A still exists
    const sessionA = await Session.findOne({ refreshTokenHash: hashToken(tokenA) });
    assert.ok(sessionA, "Session A should still exist in database");
    assert.ok(sessionA.revokedAt, "Session A.revokedAt should be populated");

    // Confirm replacement session exists and matches replacedBySessionId
    const sessionB = await Session.findOne({ refreshTokenHash: hashToken(tokenB) });
    assert.ok(sessionB, "Session B should exist in database");
    assert.equal(sessionB.revokedAt, null, "Session B should be active");
    assert.equal(
      sessionA.replacedBySessionId.toString(),
      sessionB._id.toString(),
      "Session A.replacedBySessionId should point to Session B._id"
    );
  });

  it("TEST 2: Replayed rotated token is detected with 401 and code REFRESH_TOKEN_REUSE", async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: TEST_USER.username, password: TEST_USER.password });
    const tokenA = getRefreshCookie(loginRes);
    assert.ok(tokenA);

    const refreshRes = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", `refreshToken=${tokenA}`);
    assert.equal(refreshRes.status, 200);

    // Replay old Token A
    const replayRes = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", `refreshToken=${tokenA}`);
    assert.equal(replayRes.status, 401);
    assert.equal(replayRes.body.code, "REFRESH_TOKEN_REUSE");
    assert.equal(replayRes.body.message, "Refresh token reuse detected");
  });

  it("TEST 3: Reuse invalidates all active sessions for that user", async () => {
    // 1. Login to create Session A
    const loginA = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: TEST_USER.username, password: TEST_USER.password });
    const tokenA = getRefreshCookie(loginA);
    assert.ok(tokenA);

    // 2. Login again as same user to create Session B
    const loginB = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: TEST_USER.username, password: TEST_USER.password });
    const tokenB = getRefreshCookie(loginB);
    assert.ok(tokenB);
    assert.notEqual(tokenA, tokenB);

    // 3. Refresh Session A so A becomes rotated/revoked, creating replacement, while B remains active
    const refreshA = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", `refreshToken=${tokenA}`);
    assert.equal(refreshA.status, 200);

    // Session B should still be active at this point
    const userDoc = await User.findOne({ username: TEST_USER.username });
    const activeSessionsBeforeReplay = await Session.find({
      userId: userDoc._id,
      revokedAt: null,
    });
    assert.ok(activeSessionsBeforeReplay.length >= 1, "There should be at least one active session (Session B)");

    // 4. Replay old Token A
    const replayRes = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", `refreshToken=${tokenA}`);
    assert.equal(replayRes.status, 401);
    assert.equal(replayRes.body.code, "REFRESH_TOKEN_REUSE");

    // 5. Confirm ALL active sessions for that user are now revoked
    const activeSessionsAfterReplay = await Session.find({
      userId: userDoc._id,
      revokedAt: null,
    });
    assert.equal(activeSessionsAfterReplay.length, 0, "All user sessions must now be revoked");

    // 6. Attempt refresh using Session B's refresh token
    const refreshB = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", `refreshToken=${tokenB}`);

    // 7. Confirm it now fails
    assert.equal(refreshB.status, 401);
  });

  it("TEST 4: Unknown random token is distinguished from reuse and does NOT revoke user sessions", async () => {
    // 1. Create a valid active session
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: TEST_USER.username, password: TEST_USER.password });
    const validToken = getRefreshCookie(loginRes);
    assert.ok(validToken);

    const userDoc = await User.findOne({ username: TEST_USER.username });
    const activeBefore = await Session.countDocuments({ userId: userDoc._id, revokedAt: null });
    assert.ok(activeBefore >= 1);

    // 2. Submit completely random refresh token
    const randomToken = "random_unknown_token_999999999999999999999999999999";
    const res = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", `refreshToken=${randomToken}`);

    // 3. Confirm response is 401 with "Invalid refresh token" (NOT REFRESH_TOKEN_REUSE)
    assert.equal(res.status, 401);
    assert.equal(res.body.message, "Invalid refresh token");
    assert.notEqual(res.body.code, "REFRESH_TOKEN_REUSE");

    // 4. Confirm user's valid session is NOT globally revoked
    const activeAfter = await Session.countDocuments({ userId: userDoc._id, revokedAt: null });
    assert.equal(activeAfter, activeBefore, "Active sessions should NOT be revoked by a random token");

    // 5. Confirm the valid token still works
    const refreshValid = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", `refreshToken=${validToken}`);
    assert.equal(refreshValid.status, 200);
  });
});

// ============================================================
// 6. Authorization Enforcement
// ============================================================
describe("Authorization Enforcement", () => {
  let tokenA;
  let tokenB;

  before(async () => {
    // Sign Up User B
    await request(app).post("/api/v1/auth/signup").send(TEST_USER_B);

    // Login both users
    const loginA = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: TEST_USER.username, password: TEST_USER.password });
    tokenA = loginA.body.accessToken;

    const loginB = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: TEST_USER_B.username, password: TEST_USER_B.password });
    tokenB = loginB.body.accessToken;

    // Add a meeting for User A
    await request(app)
      .post("/api/v1/users/add_to_activity")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ meeting_code: "meeting-auth-test" });
  });

  it("User A should see their own meeting", async () => {
    const res = await request(app)
      .get("/api/v1/users/get_all_activity")
      .set("Authorization", `Bearer ${tokenA}`);
    assert.equal(res.status, 200);
    const meetings = res.body;
    assert.ok(meetings.some((m) => m.meetingCode === "meeting-auth-test"));
  });

  it("User B should NOT see User A's meetings", async () => {
    const res = await request(app)
      .get("/api/v1/users/get_all_activity")
      .set("Authorization", `Bearer ${tokenB}`);
    assert.equal(res.status, 200);
    const meetings = res.body;
    assert.ok(!meetings.some((m) => m.meetingCode === "meeting-auth-test"));
  });
});

// ============================================================
// 7. Logout
// ============================================================
describe("Logout", () => {
  it("should invalidate session and clear cookie", async () => {
    // Login
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: TEST_USER.username, password: TEST_USER.password });
    const refreshCookie = getRefreshCookie(loginRes);

    // Logout
    const logoutRes = await request(app)
      .post("/api/v1/auth/logout")
      .set("Cookie", `refreshToken=${refreshCookie}`);
    assert.equal(logoutRes.status, 200);

    // Subsequent refresh with same cookie should fail
    const refreshRes = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", `refreshToken=${refreshCookie}`);
    assert.equal(refreshRes.status, 401);
  });
});

// ============================================================
// 8. /me Endpoint
// ============================================================
describe("GET /api/v1/auth/me", () => {
  it("should return user profile with valid token", async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: TEST_USER.username, password: TEST_USER.password });
    const token = loginRes.body.accessToken;

    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.username, TEST_USER.username);
    assert.equal(res.body.name, TEST_USER.name);
    assert.ok(res.body.id);
  });

  it("should reject without token", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    assert.equal(res.status, 401);
  });
});

// ============================================================
// 9. Backward Compatibility Aliases
// ============================================================
describe("Backward Compatibility (/api/v1/users/*)", () => {
  it("POST /api/v1/users/login should work as alias", async () => {
    const res = await request(app)
      .post("/api/v1/users/login")
      .send({ username: TEST_USER.username, password: TEST_USER.password });
    assert.equal(res.status, 200);
    assert.ok(res.body.accessToken);
  });

  it("POST /api/v1/users/signup should work as alias", async () => {
    const res = await request(app)
      .post("/api/v1/users/signup")
      .send({ name: "Alias Test", username: "aliastest_phase3", password: "AliasPass123" });
    // Either 201 (created) or 409 (already exists from repeated test runs)
    assert.ok([201, 409].includes(res.status));

    // Cleanup
    await User.deleteOne({ username: "aliastest_phase3" });
  });

  it("POST /api/v1/users/signup should work as alias", async () => {
    const res = await request(app)
      .post("/api/v1/users/signup")
      .send({ name: "Signup Test", username: "signuptest_phase3", password: "SignupPass123" });
    assert.ok([201, 409].includes(res.status));

    // Cleanup
    await User.deleteOne({ username: "signuptest_phase3" });
  });
});

// ============================================================
// 10. Health Endpoint (Sanity)
// ============================================================
describe("Health Endpoint", () => {
  it("GET /health should return ok", async () => {
    const res = await request(app).get("/health");
    assert.equal(res.status, 200);
    assert.equal(res.body.status, "ok");
  });
});
