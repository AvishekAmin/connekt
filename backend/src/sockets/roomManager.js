/**
 * Process-local RoomManager for Connekt real-time conferencing.
 * Encapsulates room membership, participant metadata, single-room-per-socket enforcement,
 * and automatic memory garbage collection when rooms empty.
 */
class RoomManager {
  constructor() {
    // Map<roomCode, Map<socketId, ParticipantState>>
    this.rooms = new Map();
    // Map<socketId, roomCode> for O(1) reverse lookup
    this.socketToRoom = new Map();
  }

  /**
   * Add a socket to a room.
   * Enforces the single-room-per-socket rule: if the socket is already in another room,
   * it leaves the previous room first.
   *
   * @param {import("socket.io").Socket} socket
   * @param {string} roomCode
   * @param {Object} [initialMediaState={}]
   * @returns {{ roomCode: string, participant: Object, existingParticipants: Array, leftPreviousRoom: Object|null }}
   */
  joinRoom(socket, roomCode, initialMediaState = {}) {
    let leftPreviousRoom = null;
    const currentRoom = this.socketToRoom.get(socket.id);

    // If already in a room, cleanly depart previous room first
    if (currentRoom) {
      if (currentRoom === roomCode) {
        // Already in this room, return current state
        const roomMap = this.rooms.get(roomCode);
        const participant = roomMap.get(socket.id);
        const existingParticipants = Array.from(roomMap.values()).filter(
          (p) => p.socketId !== socket.id
        );
        return { roomCode, participant, existingParticipants, leftPreviousRoom: null };
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

    // Existing participants in the room before this user entered
    const existingParticipants = Array.from(roomMap.values());

    roomMap.set(socket.id, participant);
    this.socketToRoom.set(socket.id, roomCode);

    // Join native Socket.IO room and store roomCode on socket
    socket.join(roomCode);
    socket.roomCode = roomCode;

    return {
      roomCode,
      participant,
      existingParticipants,
      leftPreviousRoom,
    };
  }

  /**
   * Remove a socket from its active room.
   * Performs automatic garbage collection if the room becomes empty.
   *
   * @param {import("socket.io").Socket} socket
   * @returns {{ roomCode: string, socketId: string, userId: string, isEmpty: boolean }|null}
   */
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

  /**
   * Get all participant states in a given room.
   * @param {string} roomCode
   * @returns {Array}
   */
  getRoomParticipants(roomCode) {
    const roomMap = this.rooms.get(roomCode);
    if (!roomMap) return [];
    return Array.from(roomMap.values());
  }

  /**
   * Get a specific participant's state.
   * @param {string} roomCode
   * @param {string} socketId
   * @returns {Object|null}
   */
  getParticipant(roomCode, socketId) {
    const roomMap = this.rooms.get(roomCode);
    if (!roomMap) return null;
    return roomMap.get(socketId) || null;
  }

  /**
   * Get the roomCode for a given socketId.
   * @param {string} socketId
   * @returns {string|null}
   */
  getSocketRoom(socketId) {
    return this.socketToRoom.get(socketId) || null;
  }

  /**
   * Verify whether two sockets currently belong to the same room.
   * @param {string} socketIdA
   * @param {string} socketIdB
   * @returns {boolean}
   */
  isPeerInSameRoom(socketIdA, socketIdB) {
    const roomA = this.socketToRoom.get(socketIdA);
    const roomB = this.socketToRoom.get(socketIdB);
    return Boolean(roomA && roomB && roomA === roomB);
  }

  /**
   * Update participant media state (camera, mic, screen sharing).
   * @param {string} socketId
   * @param {Object} updates
   * @returns {Object|null}
   */
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
