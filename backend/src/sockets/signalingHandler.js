import { roomManager } from "./roomManager.js";

/**
 * Validates and relays WebRTC signaling messages between peers in the same room.
 * Rejects cross-room injection and malformed payloads.
 *
 * @param {import("socket.io").Server} io
 * @param {import("socket.io").Socket} socket
 */
export const registerSignalingHandlers = (io, socket) => {
  // --- SDP Offer ---
  socket.on("signal:offer", (payload) => {
    if (!payload || typeof payload !== "object") return;
    const { to, sdp } = payload;

    if (!to || typeof to !== "string" || !sdp || typeof sdp !== "object") {
      return;
    }

    // Size limit check (< 64 KB)
    if (JSON.stringify(sdp).length > 65536) {
      console.warn(`[Signaling] Oversized SDP offer from ${socket.id}`);
      return;
    }

    // Room boundary enforcement
    if (!roomManager.isPeerInSameRoom(socket.id, to)) {
      console.warn(
        `[Security] Blocked unauthorized cross-room offer from ${socket.id} to ${to}`
      );
      return;
    }

    io.to(to).emit("signal:offer", {
      from: socket.id,
      sdp,
    });
  });

  // --- SDP Answer ---
  socket.on("signal:answer", (payload) => {
    if (!payload || typeof payload !== "object") return;
    const { to, sdp } = payload;

    if (!to || typeof to !== "string" || !sdp || typeof sdp !== "object") {
      return;
    }

    // Size limit check (< 64 KB)
    if (JSON.stringify(sdp).length > 65536) {
      console.warn(`[Signaling] Oversized SDP answer from ${socket.id}`);
      return;
    }

    // Room boundary enforcement
    if (!roomManager.isPeerInSameRoom(socket.id, to)) {
      console.warn(
        `[Security] Blocked unauthorized cross-room answer from ${socket.id} to ${to}`
      );
      return;
    }

    io.to(to).emit("signal:answer", {
      from: socket.id,
      sdp,
    });
  });

  // --- ICE Candidate ---
  socket.on("signal:ice", (payload) => {
    if (!payload || typeof payload !== "object") return;
    const { to, candidate } = payload;

    if (!to || typeof to !== "string" || !candidate) {
      return;
    }

    // Size limit check (< 8 KB)
    if (JSON.stringify(candidate).length > 8192) {
      console.warn(`[Signaling] Oversized ICE candidate from ${socket.id}`);
      return;
    }

    // Room boundary enforcement
    if (!roomManager.isPeerInSameRoom(socket.id, to)) {
      console.warn(
        `[Security] Blocked unauthorized cross-room ICE candidate from ${socket.id} to ${to}`
      );
      return;
    }

    io.to(to).emit("signal:ice", {
      from: socket.id,
      candidate,
    });
  });

  // --- Media State Synchronization (Mute / Camera Toggle / Screen Share) ---
  socket.on("media:state", (updates) => {
    if (!updates || typeof updates !== "object") return;

    const validatedUpdates = {};
    if (typeof updates.micActive === "boolean") {
      validatedUpdates.micActive = updates.micActive;
    }
    if (typeof updates.cameraActive === "boolean") {
      validatedUpdates.cameraActive = updates.cameraActive;
    }
    if (typeof updates.isScreenSharing === "boolean") {
      validatedUpdates.isScreenSharing = updates.isScreenSharing;
    }

    const updated = roomManager.updateMediaState(socket.id, validatedUpdates);
    if (!updated) return;

    const roomCode = socket.roomCode;
    if (roomCode) {
      socket.to(roomCode).emit("peer:media-state", {
        socketId: socket.id,
        ...validatedUpdates,
      });
    }
  });
};
