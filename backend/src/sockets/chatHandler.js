import { randomUUID } from "node:crypto";
import { roomManager } from "./roomManager.js";

// Map<socketId, number[]> for sliding-window rate limiting
const messageTimestamps = new Map();

const RATE_LIMIT_WINDOW_MS = 5000;
const MAX_MESSAGES_PER_WINDOW = 5;
const MAX_MESSAGE_LENGTH = 1000;

/**
 * Validates, rate-limits, and broadcasts in-call chat messages.
 * Enforces server-side identity (socket.user.name and socket.user.id) and timestamps.
 *
 * @param {import("socket.io").Server} io
 * @param {import("socket.io").Socket} socket
 */
export const registerChatHandlers = (io, socket) => {
  const handleMessage = (rawText) => {
    const roomCode = socket.roomCode || roomManager.getSocketRoom(socket.id);
    if (!roomCode) {
      socket.emit("chat:error", { message: "You are not in an active room." });
      return;
    }

    if (typeof rawText !== "string") {
      return;
    }

    const trimmed = rawText.trim();
    if (!trimmed || trimmed.length === 0) {
      return;
    }

    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      socket.emit("chat:error", {
        message: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters.`,
      });
      return;
    }

    // --- Rate Limiting (Sliding Window) ---
    const now = Date.now();
    let timestamps = messageTimestamps.get(socket.id) || [];
    timestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

    if (timestamps.length >= MAX_MESSAGES_PER_WINDOW) {
      socket.emit("chat:error", {
        message: "You are sending messages too quickly. Please wait a moment.",
      });
      return;
    }

    timestamps.push(now);
    messageTimestamps.set(socket.id, timestamps);

    // --- Construct Server-Stamped Message ---
    const messagePayload = {
      id: randomUUID(),
      text: trimmed,
      sender: socket.user.name || socket.user.username || "Participant",
      userId: socket.user.id,
      timestamp: new Date().toISOString(),
    };

    // Broadcast to everyone in the room (including sender)
    io.to(roomCode).emit("chat:broadcast", messagePayload);

    // Also support legacy client listener event name for smooth migration
    io.to(roomCode).emit("chat-message", trimmed, messagePayload.sender, socket.id);
  };

  // Modern event: chat:message
  socket.on("chat:message", (data) => {
    const text = typeof data === "object" && data !== null ? data.text : data;
    handleMessage(text);
  });

  // Legacy event: chat-message (data, clientSender) -> ignores clientSender!
  socket.on("chat-message", (data) => {
    handleMessage(data);
  });

  // Cleanup rate limiter on disconnect
  socket.on("disconnect", () => {
    messageTimestamps.delete(socket.id);
  });
};
