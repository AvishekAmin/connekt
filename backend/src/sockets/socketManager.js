import { Server } from "socket.io";
import { config } from "../config/env.js";
import { socketAuthMiddleware } from "./socketAuth.js";
import { roomManager } from "./roomManager.js";
import { signupSignalingHandlers } from "./signalingHandler.js";
import { signupChatHandlers } from "./chatHandler.js";

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://localhost:3000",
  "https://connekt-avishek.onrender.com",
  config.frontendUrl,
].filter(Boolean);

/**
 * Sanitizes and extracts meeting room code from raw input (supports plain codes and full URLs).
 * @param {string} raw
 * @returns {string|null}
 */
const sanitizeRoomCode = (raw) => {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // If input is a URL (legacy frontend passed window.location.href), extract last path segment
  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      const url = new URL(trimmed);
      const segments = url.pathname.split("/").filter(Boolean);
      const last = segments[segments.length - 1];
      if (last && /^[a-zA-Z0-9_-]{3,64}$/.test(last)) {
        return last;
      }
    }
  } catch {
    // Not a valid URL, treat as raw code
  }

  // Strip leading slashes if present
  const cleaned = trimmed.replace(/^\/+/, "");
  if (/^[a-zA-Z0-9_-]{3,64}$/.test(cleaned)) {
    return cleaned;
  }
  return null;
};

/**
 * Initializes and attaches the Socket.IO server with JWT authentication,
 * encapsulated room management, scoped signaling, and rate-limited chat.
 *
 * @param {import("node:http").Server} server
 * @returns {import("socket.io").Server}
 */
export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // --- Handshake Authentication Middleware ---
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    // --- Room Admission (Modern: room:join, Legacy: join-call) ---
    const handleJoin = (rawRoomCode, initialMediaState = {}) => {
      const roomCode = sanitizeRoomCode(rawRoomCode);
      if (!roomCode) {
        socket.emit("room:error", {
          message: "Invalid room code format. Must be 3-64 alphanumeric characters.",
        });
        return;
      }

      const { participant, existingParticipants, leftPreviousRoom } =
        roomManager.joinRoom(socket, roomCode, initialMediaState);

      // If socket was in a previous room, notify old room participants
      if (leftPreviousRoom) {
        socket.to(leftPreviousRoom.roomCode).emit("peer:left", {
          socketId: socket.id,
          userId: socket.user.id,
        });
        socket.to(leftPreviousRoom.roomCode).emit("user-left", socket.id);
      }

      // Acknowledge join to the connecting socket with current room state
      socket.emit("room:joined", {
        roomCode,
        participant,
        existingParticipants,
      });

      // Broadcast new entrant to all existing participants in this room
      socket.to(roomCode).emit("peer:joined", {
        participant,
      });

      // Support legacy client user-joined event for backward compatibility
      const allSocketIds = roomManager
        .getRoomParticipants(roomCode)
        .map((p) => p.socketId);
      io.to(roomCode).emit("user-joined", socket.id, allSocketIds);
    };

    socket.on("room:join", (payload) => {
      const roomCode = typeof payload === "object" ? payload.meetingCode : payload;
      const mediaState = typeof payload === "object" ? payload.mediaState : {};
      handleJoin(roomCode, mediaState);
    });

    socket.on("join-call", (path) => {
      handleJoin(path);
    });

    // --- Room Departure ---
    const handleLeave = () => {
      const left = roomManager.leaveRoom(socket);
      if (left) {
        socket.to(left.roomCode).emit("peer:left", {
          socketId: left.socketId,
          userId: left.userId,
        });
        socket.to(left.roomCode).emit("user-left", left.socketId);
      }
    };

    socket.on("room:leave", () => {
      handleLeave();
    });

    // --- Wire Signaling & Chat Handlers ---
    signupSignalingHandlers(io, socket);
    signupChatHandlers(io, socket);

    // --- Disconnect Handling ---
    socket.on("disconnect", () => {
      handleLeave();
    });
  });

  return io;
};
