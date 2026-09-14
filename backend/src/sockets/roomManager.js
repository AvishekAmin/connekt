class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.socketToRoom = new Map();
  }

  joinRoom(socket, roomCode, initialMediaState = {}) {
    let leftPreviousRoom = null;
    const currentRoom = this.socketToRoom.get(socket.id);

    if (currentRoom) {
      if (currentRoom === roomCode) {
        const roomMap = this.rooms.get(roomCode);
        const participant = roomMap.get(socket.id);
        const existingParticipants = Array.from(roomMap.values()).filter(
          (p) => p.socketId !== socket.id,
        );
        return {
          roomCode,
          participant,
          existingParticipants,
          leftPreviousRoom: null,
        };
      }
      leftPreviousRoom = this.leaveRoom(socket);
    }

    if (!this.rooms.has(roomCode)) {
      this.rooms.set(roomCode, new Map());
    }

    const roomMap = this.rooms.get(roomCode);

    const participant = {
      socketId: socket.id,
      userId: socket.user.id,
      name: socket.user.name,
      username: socket.user.username,
      micActive: Boolean(initialMediaState.micActive ?? true),
      cameraActive: Boolean(initialMediaState.cameraActive ?? true),
      isScreenSharing: Boolean(initialMediaState.isScreenSharing ?? false),
      joinedAt: new Date(),
    };

    const existingParticipants = Array.from(roomMap.values());

    roomMap.set(socket.id, participant);
    this.socketToRoom.set(socket.id, roomCode);

    socket.join(roomCode);
    socket.roomCode = roomCode;

    return {
      roomCode,
      participant,
      existingParticipants,
      leftPreviousRoom,
    };
  }

  leaveRoom(socket) {
    const roomCode = this.socketToRoom.get(socket.id) || socket.roomCode;
    if (!roomCode) return null;

    const roomMap = this.rooms.get(roomCode);
    let isEmpty = false;

    if (roomMap) {
      roomMap.delete(socket.id);
      if (roomMap.size === 0) {
        this.rooms.delete(roomCode);
        isEmpty = true;
      }
    }

    this.socketToRoom.delete(socket.id);
    socket.leave(roomCode);
    socket.roomCode = null;

    return {
      roomCode,
      socketId: socket.id,
      userId: socket.user?.id,
      isEmpty,
    };
  }

  getRoomParticipants(roomCode) {
    const roomMap = this.rooms.get(roomCode);
    if (!roomMap) return [];
    return Array.from(roomMap.values());
  }

  getParticipant(roomCode, socketId) {
    const roomMap = this.rooms.get(roomCode);
    if (!roomMap) return null;
    return roomMap.get(socketId) || null;
  }

  getSocketRoom(socketId) {
    return this.socketToRoom.get(socketId) || null;
  }

  isPeerInSameRoom(socketIdA, socketIdB) {
    const roomA = this.socketToRoom.get(socketIdA);
    const roomB = this.socketToRoom.get(socketIdB);
    return Boolean(roomA && roomB && roomA === roomB);
  }

  updateMediaState(socketId, updates = {}) {
    const roomCode = this.socketToRoom.get(socketId);
    if (!roomCode) return null;

    const roomMap = this.rooms.get(roomCode);
    if (!roomMap) return null;

    const participant = roomMap.get(socketId);
    if (!participant) return null;

    if (typeof updates.micActive === "boolean") {
      participant.micActive = updates.micActive;
    }
    if (typeof updates.cameraActive === "boolean") {
      participant.cameraActive = updates.cameraActive;
    }
    if (typeof updates.isScreenSharing === "boolean") {
      participant.isScreenSharing = updates.isScreenSharing;
    }

    return { ...participant };
  }
}

export const roomManager = new RoomManager();
