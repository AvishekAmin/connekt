import { randomUUID } from "node:crypto";
import { roomManager } from "./roomManager.js";

const messageTimestamps = new Map();

const RATE_LIMIT_WINDOW_MS = 5000;
const MAX_MESSAGES_PER_WINDOW = 5;
const MAX_MESSAGE_LENGTH = 1000;

export const signupChatHandlers = (io, socket) => {
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

    const messagePayload = {
      id: randomUUID(),
      text: trimmed,
      sender: socket.user.name || socket.user.username || "Participant",
      userId: socket.user.id,
      timestamp: new Date().toISOString(),
    };

    io.to(roomCode).emit("chat:broadcast", messagePayload);
    io.to(roomCode).emit(
      "chat-message",
      trimmed,
      messagePayload.sender,
      socket.id,
    );
  };

  socket.on("chat:message", (data) => {
    const text = typeof data === "object" && data !== null ? data.text : data;
    handleMessage(text);
  });

  socket.on("chat-message", (data) => {
    handleMessage(data);
  });

  socket.on("disconnect", () => {
    messageTimestamps.delete(socket.id);
  });
};
