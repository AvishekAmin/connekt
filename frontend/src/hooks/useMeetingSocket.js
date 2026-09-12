import { useState, useRef, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import server from "@/config/environment";
import apiClient, { getApiAccessToken } from "@/services/api";

/**
 * Custom hook for authenticated Socket.IO connection and room lifecycle management.
 * Integrates with Phase 3 JWT authentication and silent token refresh on reconnection.
 *
 * @param {Object} params
 * @param {string} params.meetingCode
 * @param {Object} [params.initialMediaState={}]
 * @param {Function} [params.onRoomJoined]
 * @param {Function} [params.onPeerJoined]
 * @param {Function} [params.onPeerLeft]
 * @param {Function} [params.onPeerMediaState]
 * @param {Function} [params.onOffer]
 * @param {Function} [params.onAnswer]
 * @param {Function} [params.onIceCandidate]
 */
export function useMeetingSocket({
  meetingCode,
  initialMediaState = {},
  onRoomJoined,
  onPeerJoined,
  onPeerLeft,
  onPeerMediaState,
  onOffer,
  onAnswer,
  onIceCandidate,
}) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const isChatOpenRef = useRef(false);

  // Keep latest callbacks in refs to avoid socket listener teardown loops
  const callbacksRef = useRef({
    onRoomJoined,
    onPeerJoined,
    onPeerLeft,
    onPeerMediaState,
    onOffer,
    onAnswer,
    onIceCandidate,
  });

  useEffect(() => {
    callbacksRef.current = {
      onRoomJoined,
      onPeerJoined,
      onPeerLeft,
      onPeerMediaState,
      onOffer,
      onAnswer,
      onIceCandidate,
    };
  }, [
    onRoomJoined,
    onPeerJoined,
    onPeerLeft,
    onPeerMediaState,
    onOffer,
    onAnswer,
    onIceCandidate,
  ]);

  /**
   * Connect to Socket.IO and register authenticated room lifecycle listeners.
   */
  const connectSocket = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = io(server, {
      auth: (cb) => {
        cb({ token: `Bearer ${getApiAccessToken() || ""}` });
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // --- Connection & Authentication Handshake ---
    socket.on("connect", () => {
      setIsConnected(true);
      if (meetingCode) {
        socket.emit("room:join", {
          meetingCode,
          mediaState: initialMediaState,
        });
      }
    });

    // Reconnection handling with Phase 3 silent refresh integration
    socket.on("connect_error", async (err) => {
      console.warn("[Socket] Connection error:", err.message);

      if (err.data?.code === "TOKEN_EXPIRED") {
        try {
          // Trigger Phase 3 silent refresh through existing apiClient queue
          const refreshRes = await apiClient.post("/api/v1/auth/refresh");
          if (refreshRes.data?.accessToken) {
            // Update auth token for socket reconnection attempt
            socket.auth = { token: `Bearer ${refreshRes.data.accessToken}` };
            socket.connect();
          }
        } catch (refreshErr) {
          console.error("[Socket] Reconnection refresh failed:", refreshErr);
          window.dispatchEvent(new Event("auth:logout"));
        }
      }
    });

    // --- Room Lifecycle Events ---
    socket.on("room:joined", (data) => {
      setCurrentUser(data.participant);
      if (callbacksRef.current.onRoomJoined) {
        callbacksRef.current.onRoomJoined(data);
      }
    });

    socket.on("peer:joined", (data) => {
      if (callbacksRef.current.onPeerJoined) {
        callbacksRef.current.onPeerJoined(data.participant);
      }
    });

    socket.on("peer:left", (data) => {
      if (callbacksRef.current.onPeerLeft) {
        callbacksRef.current.onPeerLeft(data);
      }
    });

    socket.on("peer:media-state", (data) => {
      if (callbacksRef.current.onPeerMediaState) {
        callbacksRef.current.onPeerMediaState(data);
      }
    });

    // --- Signaling Events ---
    socket.on("signal:offer", (data) => {
      if (callbacksRef.current.onOffer) {
        callbacksRef.current.onOffer(data);
      }
    });

    socket.on("signal:answer", (data) => {
      if (callbacksRef.current.onAnswer) {
        callbacksRef.current.onAnswer(data);
      }
    });

    socket.on("signal:ice", (data) => {
      if (callbacksRef.current.onIceCandidate) {
        callbacksRef.current.onIceCandidate(data);
      }
    });

    // --- In-Call Chat Events ---
    socket.on("chat:broadcast", (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          id: msg.id,
          sender: msg.sender,
          userId: msg.userId,
          data: msg.text,
          timestamp: msg.timestamp,
        },
      ]);

      if (!isChatOpenRef.current) {
        setUnreadCount((c) => c + 1);
      }
    });

    socket.on("chat:error", (err) => {
      console.warn("[Chat Error]:", err.message);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });
  }, [meetingCode, initialMediaState]);

  /**
   * Send a chat message through validated socket handler.
   */
  const sendMessage = useCallback((text) => {
    if (!text?.trim() || !socketRef.current?.connected) return;
    socketRef.current.emit("chat:message", { text: text.trim() });
  }, []);

  /**
   * Emit media state change (mic, camera, screen-share).
   */
  const sendMediaState = useCallback((updates) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit("media:state", updates);
  }, []);

  /**
   * Set chat open state and reset unread badge when opened.
   */
  const setChatOpen = useCallback((isOpen) => {
    isChatOpenRef.current = isOpen;
    if (isOpen) {
      setUnreadCount(0);
    }
  }, []);

  /**
   * Clean departure and socket disconnection.
   */
  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit("room:leave");
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Teardown on unmount
  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, [disconnectSocket]);

  return {
    socketRef,
    isConnected,
    currentUser,
    messages,
    unreadCount,
    setChatOpen,
    connectSocket,
    disconnectSocket,
    sendMessage,
    sendMediaState,
  };
}
