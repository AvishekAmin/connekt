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

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

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

const getRefreshCookie = (res) => {
  const cookies = res.headers["set-cookie"];
  if (!cookies) return null;
  const cookieArr = Array.isArray(cookies) ? cookies : [cookies];
  const refreshCookie = cookieArr.find((c) => c.startsWith("refreshToken="));
  if (!refreshCookie) return null;
  return refreshCookie.split(";")[0].split("=").slice(1).join("=");
};

const waitForDb = () =>
  new Promise((resolve, reject) => {
    if (mongoose.connection.readyState === 1) return resolve();
    mongoose.connection.once("connected", resolve);
    mongoose.connection.once("error", reject);
  });

before(async () => {
  await waitForDb();
  await User.deleteMany({
    username: { $in: [TEST_USER.username, TEST_USER_B.username] },
  });
  await Meeting.deleteMany({
    user_id: { $in: [TEST_USER.username, TEST_USER_B.username] },
  });
});

after(async () => {
  await User.deleteMany({
    username: { $in: [TEST_USER.username, TEST_USER_B.username] },
  });
  await Meeting.deleteMany({
    user_id: { $in: [TEST_USER.username, TEST_USER_B.username] },
  });
  await Session.deleteMany({});
  if (server.listening) {
    server.close();
  }
  await mongoose.disconnect();
});

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
    const res = await request(app).post("/api/v1/auth/signup").send(TEST_USER);
    assert.equal(res.status, 201);
    assert.ok(res.body.message);
  });

  it("should reject duplicate username", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send(TEST_USER);
    assert.equal(res.status, 409);
  });
});

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

    const cookies = res.headers["set-cookie"];
    assert.ok(cookies, "Set-Cookie header should be present");
    const cookieStr = Array.isArray(cookies) ? cookies.join("; ") : cookies;
    assert.ok(
      cookieStr.includes("refreshToken="),
      "Should contain refreshToken cookie",
    );
    assert.ok(
      cookieStr.toLowerCase().includes("httponly"),
      "Cookie should be HttpOnly",
    );
  });
});

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

describe("Token Refresh", () => {
  it("should rotate refresh token and return new access token", async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: TEST_USER.username, password: TEST_USER.password });
    const refreshCookie = getRefreshCookie(loginRes);
    assert.ok(refreshCookie, "Should have refresh token cookie");

    const refreshRes = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", `refreshToken=${refreshCookie}`);
    assert.equal(refreshRes.status, 200);
    assert.ok(refreshRes.body.accessToken);

    const newRefreshCookie = getRefreshCookie(refreshRes);
    assert.ok(newRefreshCookie);
    assert.notEqual(
      newRefreshCookie,
      refreshCookie,
      "Refresh token should be rotated",
    );
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

    const sessionA = await Session.findOne({
      refreshTokenHash: hashToken(tokenA),
    });
    assert.ok(sessionA, "Session A should still exist in database");
    assert.ok(sessionA.revokedAt, "Session A.revokedAt should be populated");

    const sessionB = await Session.findOne({
      refreshTokenHash: hashToken(tokenB),
    });
    assert.ok(sessionB, "Session B should exist in database");
    assert.equal(sessionB.revokedAt, null, "Session B should be active");
    assert.equal(
      sessionA.replacedBySessionId.toString(),
      sessionB._id.toString(),
      "Session A.replacedBySessionId should point to Session B._id",
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

    const replayRes = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", `refreshToken=${tokenA}`);
    assert.equal(replayRes.status, 401);
    assert.equal(replayRes.body.code, "REFRESH_TOKEN_REUSE");
    assert.equal(replayRes.body.message, "Refresh token reuse detected");
  });

  it("TEST 3: Reuse invalidates all active sessions for that user", async () => {
    const loginA = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: TEST_USER.username, password: TEST_USER.password });
    const tokenA = getRefreshCookie(loginA);
    assert.ok(tokenA);

    const loginB = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: TEST_USER.username, password: TEST_USER.password });
    const tokenB = getRefreshCookie(loginB);
    assert.ok(tokenB);
    assert.notEqual(tokenA, tokenB);

    const refreshA = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", `refreshToken=${tokenA}`);
    assert.equal(refreshA.status, 200);

    const userDoc = await User.findOne({ username: TEST_USER.username });
    const activeSessionsBeforeReplay = await Session.find({
      userId: userDoc._id,
      revokedAt: null,
    });
    assert.ok(
      activeSessionsBeforeReplay.length >= 1,
      "There should be at least one active session (Session B)",
    );

    const replayRes = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", `refreshToken=${tokenA}`);
    assert.equal(replayRes.status, 401);
    assert.equal(replayRes.body.code, "REFRESH_TOKEN_REUSE");

    const activeSessionsAfterReplay = await Session.find({
      userId: userDoc._id,
      revokedAt: null,
    });
    assert.equal(
      activeSessionsAfterReplay.length,
      0,
      "All user sessions must now be revoked",
    );

    const refreshB = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", `refreshToken=${tokenB}`);

    assert.equal(refreshB.status, 401);
  });

  it("TEST 4: Unknown random token is distinguished from reuse and does NOT revoke user sessions", async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: TEST_USER.username, password: TEST_USER.password });
    const validToken = getRefreshCookie(loginRes);
    assert.ok(validToken);

    const userDoc = await User.findOne({ username: TEST_USER.username });
    const activeBefore = await Session.countDocuments({
      userId: userDoc._id,
      revokedAt: null,
    });
    assert.ok(activeBefore >= 1);

    const randomToken = "random_unknown_token_999999999999999999999999999999";
    const res = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", `refreshToken=${randomToken}`);

    assert.equal(res.status, 401);
    assert.equal(res.body.message, "Invalid refresh token");
    assert.notEqual(res.body.code, "REFRESH_TOKEN_REUSE");

    const activeAfter = await Session.countDocuments({
      userId: userDoc._id,
      revokedAt: null,
    });
    assert.equal(
      activeAfter,
      activeBefore,
      "Active sessions should NOT be revoked by a random token",
    );

    const refreshValid = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", `refreshToken=${validToken}`);
    assert.equal(refreshValid.status, 200);
  });
});

describe("Authorization Enforcement", () => {
  let tokenA;
  let tokenB;

  before(async () => {
    await request(app).post("/api/v1/auth/signup").send(TEST_USER_B);

    const loginA = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: TEST_USER.username, password: TEST_USER.password });
    tokenA = loginA.body.accessToken;

    const loginB = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: TEST_USER_B.username, password: TEST_USER_B.password });
    tokenB = loginB.body.accessToken;

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

describe("Logout", () => {
  it("should invalidate session and clear cookie", async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: TEST_USER.username, password: TEST_USER.password });
    const refreshCookie = getRefreshCookie(loginRes);

    const logoutRes = await request(app)
      .post("/api/v1/auth/logout")
      .set("Cookie", `refreshToken=${refreshCookie}`);
    assert.equal(logoutRes.status, 200);

    const refreshRes = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", `refreshToken=${refreshCookie}`);
    assert.equal(refreshRes.status, 401);
  });
});

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

describe("Backward Compatibility (/api/v1/users/*)", () => {
  it("POST /api/v1/users/login should work as alias", async () => {
    const res = await request(app)
      .post("/api/v1/users/login")
      .send({ username: TEST_USER.username, password: TEST_USER.password });
    assert.equal(res.status, 200);
    assert.ok(res.body.accessToken);
  });

  it("POST /api/v1/users/signup should work as alias", async () => {
    const res = await request(app).post("/api/v1/users/signup").send({
      name: "Alias Test",
      username: "aliastest_phase3",
      password: "AliasPass123",
    });
    assert.ok([201, 409].includes(res.status));

    await User.deleteOne({ username: "aliastest_phase3" });
  });

  it("POST /api/v1/users/signup should work as alias", async () => {
    const res = await request(app).post("/api/v1/users/signup").send({
      name: "Signup Test",
      username: "signuptest_phase3",
      password: "SignupPass123",
    });
    assert.ok([201, 409].includes(res.status));

    await User.deleteOne({ username: "signuptest_phase3" });
  });
});

describe("Health Endpoint", () => {
  it("GET /health should return ok", async () => {
    const res = await request(app).get("/health");
    assert.equal(res.status, 200);
    assert.equal(res.body.status, "ok");
  });
});
