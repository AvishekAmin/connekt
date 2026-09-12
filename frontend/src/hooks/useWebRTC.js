import { useState, useRef, useCallback, useEffect } from "react";

const DEFAULT_ICE_SERVERS = [
  {
    urls: "stun:stun.l.google.com:19302",
  },
];

/**
 * Custom hook implementing a modern full-mesh WebRTC engine.
 * Features:
 * - W3C Perfect Negotiation Pattern with explicit rollback on offer collision
 * - Early ICE candidate buffering before remoteDescription
 * - addTrack / ontrack API (replacing deprecated addStream / onaddstream)
 * - RTCRtpSender.replaceTrack for seamless screen sharing without renegotiation
 * - Instance-scoped connection state (no module-level or window globals)
 *
 * @param {Object} params
 * @param {import("react").MutableRefObject<MediaStream>} params.localStreamRef
 * @param {import("react").MutableRefObject<import("socket.io-client").Socket>} params.socketRef
 * @param {Array<RTCIceServer>} [params.customIceServers]
 */
export function useWebRTC({ localStreamRef, socketRef, customIceServers }) {
  // Map<remoteSocketId, RTCPeerConnection>
  const peerConnections = useRef(new Map());
  // Map<remoteSocketId, RTCIceCandidateInit[]>
  const candidateQueues = useRef(new Map());
  // Map<remoteSocketId, { makingOffer: boolean, ignoreOffer: boolean, isSettingRemoteAnswerPending: boolean }>
  const negotiationStates = useRef(new Map());

  // Array of participant objects with live MediaStreams and metadata for UI rendering
  const [participants, setParticipants] = useState([]);

  const iceServers = customIceServers?.length ? customIceServers : DEFAULT_ICE_SERVERS;

  /**
   * Drain any buffered ICE candidates that arrived before remoteDescription was set.
   */
  const drainCandidateQueue = useCallback(async (remoteSocketId) => {
    const pc = peerConnections.current.get(remoteSocketId);
    const queue = candidateQueues.current.get(remoteSocketId) || [];
    if (!pc || queue.length === 0) return;

    while (queue.length > 0) {
      const candidate = queue.shift();
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn(`[WebRTC] Failed to add buffered ICE candidate for ${remoteSocketId}:`, err);
      }
    }
  }, []);

  /**
   * Create or retrieve an RTCPeerConnection for a remote peer with the Perfect Negotiation pattern.
   */
  const getOrCreatePeerConnection = useCallback(
    (remoteSocketId, peerMetadata = {}) => {
      if (peerConnections.current.has(remoteSocketId)) {
        return peerConnections.current.get(remoteSocketId);
      }

      const socket = socketRef.current;
      if (!socket?.id) {
        console.warn("[WebRTC] Cannot create peer connection: local socket not connected");
        return null;
      }

      const pc = new RTCPeerConnection({ iceServers });
      peerConnections.current.set(remoteSocketId, pc);
      candidateQueues.current.set(remoteSocketId, []);

      // Perfect Negotiation state machine
      const isPolite = socket.id > remoteSocketId;
      const state = {
        makingOffer: false,
        ignoreOffer: false,
        isSettingRemoteAnswerPending: false,
        isPolite,
      };
      negotiationStates.current.set(remoteSocketId, state);

      // 1. Attach local tracks to peer connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      // 2. Handle negotiation needed (triggers offer generation)
      pc.onnegotiationneeded = async () => {
        try {
          state.makingOffer = true;
          await pc.setLocalDescription();
          socket.emit("signal:offer", {
            to: remoteSocketId,
            sdp: pc.localDescription,
          });
        } catch (err) {
          console.error(`[WebRTC] Error during negotiationneeded for ${remoteSocketId}:`, err);
        } finally {
          state.makingOffer = false;
        }
      };

      // 3. Handle local ICE candidates and emit to remote peer
      pc.onicecandidate = (event) => {
        if (event.candidate && socket.connected) {
          socket.emit("signal:ice", {
            to: remoteSocketId,
            candidate: event.candidate,
          });
        }
      };

      // 4. Handle incoming remote tracks (ontrack)
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0] || new MediaStream([event.track]);

        setParticipants((prev) => {
          const existingIndex = prev.findIndex((p) => p.socketId === remoteSocketId);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              stream: remoteStream,
              ...peerMetadata,
            };
            return updated;
          }

          return [
            ...prev,
            {
              socketId: remoteSocketId,
              userId: peerMetadata.userId || "",
              name: peerMetadata.name || "Participant",
              username: peerMetadata.username || "",
              stream: remoteStream,
              micActive: peerMetadata.micActive ?? true,
              cameraActive: peerMetadata.cameraActive ?? true,
              isScreenSharing: peerMetadata.isScreenSharing ?? false,
              connectionState: pc.connectionState,
            },
          ];
        });
      };

      // 5. Connection state monitoring
      pc.onconnectionstatechange = () => {
        const connState = pc.connectionState;
        if (connState === "failed") {
          console.warn(`[WebRTC] Connection to ${remoteSocketId} failed. Attempting ICE restart...`);
          try {
            pc.restartIce();
          } catch (restartErr) {
            console.error("[WebRTC] ICE restart failed:", restartErr);
          }
        }

        setParticipants((prev) =>
          prev.map((p) =>
            p.socketId === remoteSocketId ? { ...p, connectionState: connState } : p
          )
        );
      };

      return pc;
    },
    [iceServers, localStreamRef, socketRef]
  );

  /**
   * Handle incoming SDP Offer from remote peer.
   */
  const handleRemoteOffer = useCallback(
    async ({ from, sdp }) => {
      const pc = getOrCreatePeerConnection(from);
      if (!pc) return;

      const state = negotiationStates.current.get(from);
      if (!state) return;

      const offerCollision = pc.signalingState !== "stable" || state.makingOffer;
      state.ignoreOffer = !state.isPolite && offerCollision;

      if (state.ignoreOffer) {
        console.warn(`[WebRTC] Impolite peer ignoring offer collision from ${from}`);
        return;
      }

      try {
        if (offerCollision) {
          // Spec-compliant rollback: reset local offer before processing remote offer
          await pc.setLocalDescription({ type: "rollback" });
        }

        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        await drainCandidateQueue(from);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socketRef.current?.emit("signal:answer", {
          to: from,
          sdp: pc.localDescription,
        });
      } catch (err) {
        console.error(`[WebRTC] Error handling offer from ${from}:`, err);
      }
    },
    [getOrCreatePeerConnection, drainCandidateQueue, socketRef]
  );

  /**
   * Handle incoming SDP Answer from remote peer.
   */
  const handleRemoteAnswer = useCallback(
    async ({ from, sdp }) => {
      const pc = peerConnections.current.get(from);
      if (!pc) return;

      const state = negotiationStates.current.get(from);
      if (state) state.isSettingRemoteAnswerPending = true;

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        await drainCandidateQueue(from);
      } catch (err) {
        console.error(`[WebRTC] Error handling answer from ${from}:`, err);
      } finally {
        if (state) state.isSettingRemoteAnswerPending = false;
      }
    },
    [drainCandidateQueue]
  );

  /**
   * Handle incoming ICE Candidate from remote peer.
   */
  const handleRemoteIceCandidate = useCallback(
    async ({ from, candidate }) => {
      if (!candidate) return;
      const pc = peerConnections.current.get(from);
      const state = negotiationStates.current.get(from);

      // If remoteDescription is not yet established, buffer candidate
      if (!pc || !pc.remoteDescription || !pc.remoteDescription.type) {
        if (!candidateQueues.current.has(from)) {
          candidateQueues.current.set(from, []);
        }
        candidateQueues.current.get(from).push(candidate);
        return;
      }

      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        if (!state?.ignoreOffer) {
          console.warn(`[WebRTC] Error adding ICE candidate from ${from}:`, err);
        }
      }
    },
    []
  );

  /**
   * Replace outgoing video track on all active peer senders (used for Screen Share without renegotiation).
   */
  const replaceVideoTrack = useCallback(async (newTrack) => {
    const promises = [];
    peerConnections.current.forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
      if (sender && newTrack) {
        promises.push(sender.replaceTrack(newTrack));
      }
    });
    await Promise.all(promises);
  }, []);

  /**
   * Update participant media indicators in local React state.
   */
  const updateParticipantMediaState = useCallback((socketId, updates) => {
    setParticipants((prev) =>
      prev.map((p) => (p.socketId === socketId ? { ...p, ...updates } : p))
    );
  }, []);

  /**
   * Close a specific peer connection and cleanup its resources.
   */
  const closePeer = useCallback((remoteSocketId) => {
    const pc = peerConnections.current.get(remoteSocketId);
    if (pc) {
      pc.onnegotiationneeded = null;
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      pc.close();
      peerConnections.current.delete(remoteSocketId);
    }
    candidateQueues.current.delete(remoteSocketId);
    negotiationStates.current.delete(remoteSocketId);

    setParticipants((prev) => prev.filter((p) => p.socketId !== remoteSocketId));
  }, []);

  /**
   * Cleanly close all active peer connections on call end or unmount.
   */
  const closeAllPeers = useCallback(() => {
    peerConnections.current.forEach((pc) => {
      pc.onnegotiationneeded = null;
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      pc.close();
    });
    peerConnections.current.clear();
    candidateQueues.current.clear();
    negotiationStates.current.clear();
    setParticipants([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closeAllPeers();
    };
  }, [closeAllPeers]);

  return {
    participants,
    getOrCreatePeerConnection,
    handleRemoteOffer,
    handleRemoteAnswer,
    handleRemoteIceCandidate,
    replaceVideoTrack,
    updateParticipantMediaState,
    closePeer,
    closeAllPeers,
  };
}
