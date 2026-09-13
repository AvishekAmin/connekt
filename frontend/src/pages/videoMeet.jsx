import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import withAuth from "@/utils/withAuth";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

import MeetingLobby from "@/components/meeting/MeetingLobby";
import MeetingHeader from "@/components/meeting/MeetingHeader";
import VideoGrid from "@/components/meeting/VideoGrid";
import MeetingControls from "@/components/meeting/MeetingControls";
import ChatPanel from "@/components/meeting/ChatPanel";

import { useMediaStream } from "@/hooks/useMediaStream";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useMeetingSocket } from "@/hooks/useMeetingSocket";

/**
 * VideoMeetComponent — Primary presenter and orchestrator for Connekt conferencing.
 * Coordinates local media devices (useMediaStream), real-time signaling & rooms (useMeetingSocket),
 * and full-mesh WebRTC peer negotiation (useWebRTC).
 */
function VideoMeetComponent() {
  const { url: routeMeetingCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [inCall, setInCall] = useState(false);
  const [username, setUsername] = useState(user?.name || user?.username || "");
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");

  // 1. Local Media Stream & Devices
  const {
    localVideoRef,
    localStream,
    screenStream,
    mediaStream,
    videoAvailable,
    audioAvailable,
    screenAvailable,
    isVideoOn,
    isAudioOn,
    isScreenSharing,
    initializeMedia,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
    stopAllTracks,
  } = useMediaStream();

  const activeLocalStream = isScreenSharing && screenStream?.current ? screenStream.current : mediaStream;

  // Initialize camera and microphone on lobby mount
  useEffect(() => {
    initializeMedia();
  }, [initializeMedia]);

  // Ensure local video element always receives the active stream (camera or screen)
  useEffect(() => {
    if (localVideoRef.current && activeLocalStream) {
      if (localVideoRef.current.srcObject !== activeLocalStream) {
        localVideoRef.current.srcObject = activeLocalStream;
      }
    }
  }, [inCall, activeLocalStream, localVideoRef]);

  // Update lobby display name when auth user profile resolves
  useEffect(() => {
    if (user && !username) {
      setUsername(user.name || user.username || "");
    }
  }, [user, username]);

  // Forward declarations for WebRTC handlers
  const onOfferRef = React.useRef();
  const onAnswerRef = React.useRef();
  const onIceCandidateRef = React.useRef();

  // 2. Authenticated Real-Time Socket Layer
  const {
    socketRef,
    currentUser,
    messages,
    unreadCount,
    setChatOpen,
    connectSocket,
    disconnectSocket,
    sendMessage,
    sendMediaState,
  } = useMeetingSocket({
    meetingCode: routeMeetingCode,
    initialMediaState: {
      micActive: isAudioOn,
      cameraActive: isVideoOn,
      isScreenSharing: false,
    },
    onRoomJoined: ({ existingParticipants }) => {
      // Connect to all existing peers in the room
      existingParticipants.forEach((peer) => {
        getOrCreatePeerConnection(peer.socketId, peer);
      });
    },
    onPeerJoined: (peer) => {
      // New entrant detected, initialize peer connection
      getOrCreatePeerConnection(peer.socketId, peer);
    },
    onPeerLeft: ({ socketId }) => {
      closePeer(socketId);
    },
    onPeerMediaState: ({ socketId, ...updates }) => {
      updateParticipantMediaState(socketId, updates);
    },
    onOffer: (payload) => onOfferRef.current?.(payload),
    onAnswer: (payload) => onAnswerRef.current?.(payload),
    onIceCandidate: (payload) => onIceCandidateRef.current?.(payload),
  });

  // 3. Modern Full-Mesh WebRTC Engine
  const {
    participants,
    getOrCreatePeerConnection,
    handleRemoteOffer,
    handleRemoteAnswer,
    handleRemoteIceCandidate,
    replaceVideoTrack,
    updateParticipantMediaState,
    closePeer,
    closeAllPeers,
  } = useWebRTC({
    localStreamRef: localStream,
    socketRef,
  });

  // Keep callback refs in sync
  useEffect(() => {
    onOfferRef.current = handleRemoteOffer;
    onAnswerRef.current = handleRemoteAnswer;
    onIceCandidateRef.current = handleRemoteIceCandidate;
  }, [handleRemoteOffer, handleRemoteAnswer, handleRemoteIceCandidate]);

  // Handle entering meeting from lobby
  const handleEnterMeeting = useCallback(() => {
    setInCall(true);
    connectSocket();
  }, [connectSocket]);

  // Handle camera video toggle
  const handleToggleVideo = useCallback(() => {
    const nextState = toggleVideo();
    sendMediaState({ cameraActive: nextState });
  }, [toggleVideo, sendMediaState]);

  // Handle microphone audio toggle
  const handleToggleAudio = useCallback(() => {
    const nextState = toggleAudio();
    sendMediaState({ micActive: nextState });
  }, [toggleAudio, sendMediaState]);

  // Handle seamless screen share via RTCRtpSender.replaceTrack
  const handleToggleScreen = useCallback(async () => {
    if (isScreenSharing) {
      stopScreenShare();
      const cameraTrack = localStream.current?.getVideoTracks()[0];
      if (cameraTrack) {
        await replaceVideoTrack(cameraTrack);
      }
      sendMediaState({ isScreenSharing: false });
    } else {
      const screenTrack = await startScreenShare(async () => {
        // Native browser "Stop sharing" clicked
        const camTrack = localStream.current?.getVideoTracks()[0];
        if (camTrack) {
          await replaceVideoTrack(camTrack);
        }
        sendMediaState({ isScreenSharing: false });
      });

      if (screenTrack) {
        await replaceVideoTrack(screenTrack);
        sendMediaState({ isScreenSharing: true });
      }
    }
  }, [
    isScreenSharing,
    stopScreenShare,
    startScreenShare,
    replaceVideoTrack,
    sendMediaState,
    localStream,
  ]);

  // Handle chat drawer toggle
  const handleToggleChat = useCallback(
    (explicitState) => {
      const next = typeof explicitState === "boolean" ? explicitState : !showChat;
      setShowChat(next);
      setChatOpen(next);
    },
    [showChat, setChatOpen]
  );

  // Handle sending chat message
  const handleSendMessage = useCallback(() => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setChatInput("");
  }, [chatInput, sendMessage]);

  // Handle call departure and teardown
  const handleEndCall = useCallback(() => {
    stopAllTracks();
    closeAllPeers();
    disconnectSocket();
    navigate(ROUTES.DASHBOARD);
  }, [stopAllTracks, closeAllPeers, disconnectSocket, navigate]);

  return (
    <div>
      {!inCall ? (
        <MeetingLobby
          username={username}
          setUsername={setUsername}
          localVideoRef={localVideoRef}
          stream={mediaStream}
          onConnect={handleEnterMeeting}
          meetingCode={routeMeetingCode || "Room"}
          videoAvailable={videoAvailable}
          audioAvailable={audioAvailable}
          isVideoOn={isVideoOn}
          isAudioOn={isAudioOn}
          onToggleVideo={handleToggleVideo}
          onToggleAudio={handleToggleAudio}
        />
      ) : (
        <div className="relative w-screen h-screen bg-[#050814] text-white flex flex-col overflow-hidden select-none selection:bg-[#00D8F6]/20 selection:text-[#00D8F6]">
          {/* Top Bar with Room Code and Participant Count */}
          <MeetingHeader
            meetingCode={routeMeetingCode || "Room"}
            participantCount={participants.length + 1}
          />

          {/* Conference Video Stage */}
          <main className="flex-1 relative flex overflow-hidden">
            <VideoGrid
              participants={participants}
              localStream={activeLocalStream}
              localVideoRef={localVideoRef}
              isAudioMuted={!isAudioOn}
              isVideoOff={!isVideoOn}
              isScreenSharing={isScreenSharing}
              localName={username || currentUser?.name || "You"}
            />

            {/* In-Call Chat Drawer */}
            <ChatPanel
              isOpen={showChat}
              onClose={() => handleToggleChat(false)}
              messages={messages}
              messageText={chatInput}
              setMessageText={setChatInput}
              onSendMessage={handleSendMessage}
              currentUser={username || currentUser?.name || "You"}
            />
          </main>

          {/* Bottom Call Controls */}
          <MeetingControls
            videoState={isVideoOn}
            audioState={isAudioOn}
            screenState={isScreenSharing}
            screenAvailable={screenAvailable}
            unreadCount={unreadCount}
            isChatOpen={showChat}
            onToggleVideo={handleToggleVideo}
            onToggleAudio={handleToggleAudio}
            onToggleScreen={handleToggleScreen}
            onToggleChat={() => handleToggleChat()}
            onEndCall={handleEndCall}
          />
        </div>
      )}
    </div>
  );
}

export default withAuth(VideoMeetComponent);
