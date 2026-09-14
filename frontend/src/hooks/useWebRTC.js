import { useState, useRef, useCallback, useEffect } from "react";

const DEFAULT_ICE_SERVERS = [
  {
    urls: "stun:stun.l.google.com:19302",
  },
];

export function useWebRTC({ localStreamRef, socketRef, customIceServers }) {
  const peerConnections = useRef(new Map());
  const candidateQueues = useRef(new Map());
  const negotiationStates = useRef(new Map());
  const [participants, setParticipants] = useState([]);

  const iceServers = customIceServers?.length
    ? customIceServers
    : DEFAULT_ICE_SERVERS;

  const drainCandidateQueue = useCallback(async (remoteSocketId) => {
    const pc = peerConnections.current.get(remoteSocketId);
    const queue = candidateQueues.current.get(remoteSocketId) || [];
    if (!pc || queue.length === 0) return;

    while (queue.length > 0) {
      const candidate = queue.shift();
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn(
          `[WebRTC] Failed to add buffered ICE candidate for ${remoteSocketId}:`,
          err,
        );
      }
    }
  }, []);

  const getOrCreatePeerConnection = useCallback(
    (remoteSocketId, peerMetadata = {}) => {
      if (peerConnections.current.has(remoteSocketId)) {
        return peerConnections.current.get(remoteSocketId);
      }

      const socket = socketRef.current;
      if (!socket?.id) {
        console.warn(
          "[WebRTC] Cannot create peer connection: local socket not connected",
        );
        return null;
      }

      const pc = new RTCPeerConnection({ iceServers });
      peerConnections.current.set(remoteSocketId, pc);
      candidateQueues.current.set(remoteSocketId, []);

      const isPolite = socket.id > remoteSocketId;
      const state = {
        makingOffer: false,
        ignoreOffer: false,
        isSettingRemoteAnswerPending: false,
        isPolite,
      };
      negotiationStates.current.set(remoteSocketId, state);

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      pc.onnegotiationneeded = async () => {
        try {
          state.makingOffer = true;
          await pc.setLocalDescription();
          socket.emit("signal:offer", {
            to: remoteSocketId,
            sdp: pc.localDescription,
          });
        } catch (err) {
          console.error(
            `[WebRTC] Error during negotiationneeded for ${remoteSocketId}:`,
            err,
          );
        } finally {
          state.makingOffer = false;
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socket.connected) {
          socket.emit("signal:ice", {
            to: remoteSocketId,
            candidate: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        const remoteStream = event.streams[0] || new MediaStream([event.track]);

        setParticipants((prev) => {
          const existingIndex = prev.findIndex(
            (p) => p.socketId === remoteSocketId,
          );
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

      pc.onconnectionstatechange = () => {
        const connState = pc.connectionState;
        if (connState === "failed") {
          console.warn(
            `[WebRTC] Connection to ${remoteSocketId} failed. Attempting ICE restart...`,
          );
          try {
            pc.restartIce();
          } catch (restartErr) {
            console.error("[WebRTC] ICE restart failed:", restartErr);
          }
        }

        setParticipants((prev) =>
          prev.map((p) =>
            p.socketId === remoteSocketId
              ? { ...p, connectionState: connState }
              : p,
          ),
        );
      };

      return pc;
    },
    [iceServers, localStreamRef, socketRef],
  );

  const handleRemoteOffer = useCallback(
    async ({ from, sdp }) => {
      const pc = getOrCreatePeerConnection(from);
      if (!pc) return;

      const state = negotiationStates.current.get(from);
      if (!state) return;

      const offerCollision =
        pc.signalingState !== "stable" || state.makingOffer;
      state.ignoreOffer = !state.isPolite && offerCollision;

      if (state.ignoreOffer) {
        console.warn(
          `[WebRTC] Impolite peer ignoring offer collision from ${from}`,
        );
        return;
      }

      try {
        if (offerCollision) {
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
    [getOrCreatePeerConnection, drainCandidateQueue, socketRef],
  );

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
    [drainCandidateQueue],
  );

  const handleRemoteIceCandidate = useCallback(async ({ from, candidate }) => {
    if (!candidate) return;
    const pc = peerConnections.current.get(from);
    const state = negotiationStates.current.get(from);

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
  }, []);

  const replaceVideoTrack = useCallback(async (newTrack) => {
    const promises = [];
    peerConnections.current.forEach((pc) => {
      const sender = pc
        .getSenders()
        .find((s) => s.track && s.track.kind === "video");
      if (sender && newTrack) {
        promises.push(sender.replaceTrack(newTrack));
      }
    });
    await Promise.all(promises);
  }, []);

  const updateParticipantMediaState = useCallback((socketId, updates) => {
    setParticipants((prev) =>
      prev.map((p) => (p.socketId === socketId ? { ...p, ...updates } : p)),
    );
  }, []);

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

    setParticipants((prev) =>
      prev.filter((p) => p.socketId !== remoteSocketId),
    );
  }, []);

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
