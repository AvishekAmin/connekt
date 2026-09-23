import { test, describe, before, after, afterEach } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import jwt from "jsonwebtoken";
import { io as Client } from "socket.io-client";
import { config } from "../src/config/env.js";
import { connectToSocket } from "../src/sockets/socketManager.js";
import { roomManager } from "../src/sockets/roomManager.js";

describe("Socket.IO Real-Time & WebRTC Infrastructure Tests", () => {
  let server;
  let serverPort;
  let serverUrl;
  let io;

  const generateToken = (payload, options = {}) => {
    return jwt.sign(payload, config.jwtAccessSecret, {
      expiresIn: options.expiresIn || "15m",
      ...options,
    });
  };

  const userAlice = {
    sub: "user-alice-123",
    username: "alice",
    name: "Alice Smith",
  };

  const userBob = {
    sub: "user-bob-456",
    username: "bob",
    name: "Bob Jones",
  };

  const userCharlie = {
    sub: "user-charlie-789",
    username: "charlie",
    name: "Charlie Brown",
  };

  before(async () => {
    server = createServer();
    io = connectToSocket(server);

    await new Promise((resolve) => {
      server.listen(0, () => {
        serverPort = server.address().port;
        serverUrl = `http://localhost:${serverPort}`;
        resolve();
      });
    });
  });

  after(async () => {
    io.close();
    await new Promise((resolve) => server.close(resolve));
  });

  const createTestClient = (token, options = {}) => {
    return Client(serverUrl, {
      auth: token ? { token: `Bearer ${token}` } : {},
      transports: ["websocket"],
      forceNew: true,
      reconnection: false,
      ...options,
    });
  };

  describe("1. Socket Handshake Authentication", () => {
    test("should reject connection when no token is provided", (t, done) => {
      const client = Client(serverUrl, {
        auth: {},
        transports: ["websocket"],
        forceNew: true,
        reconnection: false,
      });

      client.on("connect_error", (err) => {
        assert.ok(err.message.includes("AUTH_REQUIRED"));
        client.disconnect();
        done();
      });
    });

    test("should reject connection when token is signed with wrong secret", (t, done) => {
      const forgedToken = jwt.sign(userAlice, "wrong-forged-secret", {
        expiresIn: "15m",
      });
      const client = createTestClient(forgedToken);

      client.on("connect_error", (err) => {
        assert.ok(err.message.includes("INVALID_TOKEN"));
        client.disconnect();
        done();
      });
    });

    test("should reject connection when token is expired", (t, done) => {
      const expiredToken = generateToken(userAlice, { expiresIn: "-1s" });
      const client = createTestClient(expiredToken);

      client.on("connect_error", (err) => {
        assert.strictEqual(err.data?.code, "TOKEN_EXPIRED");
        client.disconnect();
        done();
      });
    });

    test("should accept connection with valid JWT and establish socket.user", (t, done) => {
      const validToken = generateToken(userAlice);
      const client = createTestClient(validToken);

      client.on("connect", () => {
        assert.ok(client.id);
        client.disconnect();
        done();
      });
    });
  });

  describe("2. Room Authorization & Single-Room Enforcement", () => {
    let clientAlice;
    let clientBob;

    afterEach(() => {
      if (clientAlice?.connected) clientAlice.disconnect();
      if (clientBob?.connected) clientBob.disconnect();
    });

    test("should allow authenticated user to join room and receive room:joined", (t, done) => {
      clientAlice = createTestClient(generateToken(userAlice));

      clientAlice.on("connect", () => {
        clientAlice.emit("room:join", { meetingCode: "test-room-1" });
      });

      clientAlice.on("room:joined", (data) => {
        assert.strictEqual(data.roomCode, "test-room-1");
        assert.strictEqual(data.participant.userId, userAlice.sub);
        assert.strictEqual(data.participant.name, userAlice.name);
        assert.strictEqual(data.existingParticipants.length, 0);
        done();
      });
    });

    test("should notify existing peers with peer:joined when second user enters", (t, done) => {
      clientAlice = createTestClient(generateToken(userAlice));
      clientBob = createTestClient(generateToken(userBob));

      clientAlice.on("connect", () => {
        clientAlice.emit("room:join", { meetingCode: "test-room-multi" });
      });

      clientAlice.on("room:joined", () => {
        clientBob.emit("room:join", { meetingCode: "test-room-multi" });
      });

      clientAlice.on("peer:joined", ({ participant }) => {
        assert.strictEqual(participant.userId, userBob.sub);
        assert.strictEqual(participant.name, userBob.name);
        done();
      });
    });

    test("should enforce single-room-per-socket: auto-leave Room A when joining Room B", (t, done) => {
      clientAlice = createTestClient(generateToken(userAlice));
      clientBob = createTestClient(generateToken(userBob));

      clientAlice.on("connect", () => {
        clientAlice.emit("room:join", { meetingCode: "room-alpha" });
      });

      clientAlice.on("room:joined", () => {
        clientBob.emit("room:join", { meetingCode: "room-alpha" });
      });

      clientBob.on("room:joined", () => {
        clientAlice.emit("room:join", { meetingCode: "room-beta" });
      });

      clientBob.on("peer:left", (leftData) => {
        assert.strictEqual(leftData.userId, userAlice.sub);
        assert.strictEqual(
          roomManager.getSocketRoom(clientAlice.id),
          "room-beta",
        );
        done();
      });
    });
  });

  describe("3. Scoped Signaling Isolation", () => {
    let clientAlice;
    let clientBob;
    let clientCharlie;

    afterEach(() => {
      if (clientAlice?.connected) clientAlice.disconnect();
      if (clientBob?.connected) clientBob.disconnect();
      if (clientCharlie?.connected) clientCharlie.disconnect();
    });

    test("should route signaling (offer, answer, ICE) between peers in same room", (t, done) => {
      clientAlice = createTestClient(generateToken(userAlice));
      clientBob = createTestClient(generateToken(userBob));

      clientAlice.on("connect", () => {
        clientAlice.emit("room:join", { meetingCode: "signal-room" });
      });

      clientAlice.on("room:joined", () => {
        clientBob.emit("room:join", { meetingCode: "signal-room" });
      });

      clientBob.on("room:joined", (bobData) => {
        const aliceId = bobData.existingParticipants[0].socketId;
        clientBob.emit("signal:offer", {
          to: aliceId,
          sdp: { type: "offer", sdp: "v=0\r\no=alice..." },
        });
      });

      clientAlice.on("signal:offer", ({ from, sdp }) => {
        assert.strictEqual(from, clientBob.id);
        assert.strictEqual(sdp.type, "offer");
        done();
      });
    });

    test("should block cross-room signal injection", (t, done) => {
      clientAlice = createTestClient(generateToken(userAlice));
      clientCharlie = createTestClient(generateToken(userCharlie));

      let aliceReceivedSignal = false;

      clientAlice.on("connect", () => {
        clientAlice.emit("room:join", { meetingCode: "room-one" });
      });

      clientAlice.on("room:joined", () => {
        clientCharlie.emit("room:join", { meetingCode: "room-two" });
      });

      clientCharlie.on("room:joined", () => {
        clientCharlie.emit("signal:offer", {
          to: clientAlice.id,
          sdp: { type: "offer", sdp: "malicious-offer" },
        });

        setTimeout(() => {
          assert.strictEqual(aliceReceivedSignal, false);
          done();
        }, 300);
      });

      clientAlice.on("signal:offer", () => {
        aliceReceivedSignal = true;
      });
    });
  });

  describe("4. Chat Validation & Rate Limiting", () => {
    let clientAlice;
    let clientBob;

    afterEach(() => {
      if (clientAlice?.connected) clientAlice.disconnect();
      if (clientBob?.connected) clientBob.disconnect();
    });

    test("should stamp server-verified name & userId and ignore client spoofing", (t, done) => {
      clientAlice = createTestClient(generateToken(userAlice));
      clientBob = createTestClient(generateToken(userBob));

      clientAlice.on("connect", () => {
        clientAlice.emit("room:join", { meetingCode: "chat-room" });
      });

      clientAlice.on("room:joined", () => {
        clientBob.emit("room:join", { meetingCode: "chat-room" });
      });

      clientBob.on("room:joined", () => {
        clientAlice.emit("chat:message", {
          text: "Hello room!",
          sender: "Administrator",
        });
      });

      clientBob.on("chat:broadcast", (msg) => {
        assert.strictEqual(msg.text, "Hello room!");
        assert.strictEqual(msg.sender, userAlice.name);
        assert.strictEqual(msg.userId, userAlice.sub);
        assert.ok(msg.timestamp);
        assert.ok(msg.id);
        done();
      });
    });

    test("should reject messages exceeding 1000 characters with chat:error", (t, done) => {
      clientAlice = createTestClient(generateToken(userAlice));

      clientAlice.on("connect", () => {
        clientAlice.emit("room:join", { meetingCode: "chat-limit-room" });
      });

      clientAlice.on("room:joined", () => {
        const longMessage = "a".repeat(1001);
        clientAlice.emit("chat:message", { text: longMessage });
      });

      clientAlice.on("chat:error", (err) => {
        assert.ok(err.message.includes("exceeds maximum length"));
        done();
      });
    });

    test("should enforce sliding-window rate limit (max 5 msgs / 5s)", (t, done) => {
      clientAlice = createTestClient(generateToken(userAlice));

      clientAlice.on("connect", () => {
        clientAlice.emit("room:join", { meetingCode: "chat-flood-room" });
      });

      clientAlice.on("room:joined", () => {
        for (let i = 0; i < 6; i++) {
          clientAlice.emit("chat:message", { text: `Message ${i + 1}` });
        }
      });

      clientAlice.on("chat:error", (err) => {
        assert.ok(err.message.includes("sending messages too quickly"));
        done();
      });
    });
  });

  describe("5. Presence & Disconnect Cleanup", () => {
    let clientAlice;
    let clientBob;

    test("should broadcast peer:left on disconnect and garbage collect empty rooms", (t, done) => {
      clientAlice = createTestClient(generateToken(userAlice));
      clientBob = createTestClient(generateToken(userBob));

      clientAlice.on("connect", () => {
        clientAlice.emit("room:join", { meetingCode: "cleanup-room" });
      });

      clientAlice.on("room:joined", () => {
        clientBob.emit("room:join", { meetingCode: "cleanup-room" });
      });

      clientBob.on("room:joined", () => {
        clientAlice.disconnect();
      });

      clientBob.on("peer:left", (leftData) => {
        assert.strictEqual(leftData.userId, userAlice.sub);

        clientBob.disconnect();

        setTimeout(() => {
          assert.strictEqual(
            roomManager.getRoomParticipants("cleanup-room").length,
            0,
          );
          assert.strictEqual(roomManager.rooms.has("cleanup-room"), false);
          done();
        }, 100);
      });
    });
  });
});
