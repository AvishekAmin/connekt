import { roomManager } from "./roomManager.js";

export const signupSignalingHandlers = (io, socket) => {
  socket.on("signal:offer", (payload) => {
    if (!payload || typeof payload !== "object") return;
    const { to, sdp } = payload;

    if (!to || typeof to !== "string" || !sdp || typeof sdp !== "object") {
      return;
    }

    if (JSON.stringify(sdp).length > 65536) {
      console.warn(`[Signaling] Oversized SDP offer from ${socket.id}`);
      return;
    }

    if (!roomManager.isPeerInSameRoom(socket.id, to)) {
      console.warn(
        `[Security] Blocked unauthorized cross-room offer from ${socket.id} to ${to}`,
      );
      return;
    }

    io.to(to).emit("signal:offer", {
      from: socket.id,
      sdp,
    });
  });

  socket.on("signal:answer", (payload) => {
    if (!payload || typeof payload !== "object") return;
    const { to, sdp } = payload;

    if (!to || typeof to !== "string" || !sdp || typeof sdp !== "object") {
      return;
    }

    if (JSON.stringify(sdp).length > 65536) {
      console.warn(`[Signaling] Oversized SDP answer from ${socket.id}`);
      return;
    }

    if (!roomManager.isPeerInSameRoom(socket.id, to)) {
      console.warn(
        `[Security] Blocked unauthorized cross-room answer from ${socket.id} to ${to}`,
      );
      return;
    }

    io.to(to).emit("signal:answer", {
      from: socket.id,
      sdp,
    });
  });

  socket.on("signal:ice", (payload) => {
    if (!payload || typeof payload !== "object") return;
    const { to, candidate } = payload;

    if (!to || typeof to !== "string" || !candidate) {
      return;
    }

    if (JSON.stringify(candidate).length > 8192) {
      console.warn(`[Signaling] Oversized ICE candidate from ${socket.id}`);
      return;
    }

    if (!roomManager.isPeerInSameRoom(socket.id, to)) {
      console.warn(
        `[Security] Blocked unauthorized cross-room ICE candidate from ${socket.id} to ${to}`,
      );
      return;
    }

    io.to(to).emit("signal:ice", {
      from: socket.id,
      candidate,
    });
  });

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
