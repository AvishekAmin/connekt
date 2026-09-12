import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Custom hook for local media device lifecycle (Camera, Microphone, and Screen Sharing).
 * Uses native MediaStreamTrack.enabled toggling for mute/unmute (eliminating canvas black
 * and audio oscillator workarounds) and avoids any window-global stream pollution.
 */
export function useMediaStream() {
  const localVideoRef = useRef(null);
  const localStream = useRef(null);
  const screenStream = useRef(null);

  const [videoAvailable, setVideoAvailable] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(false);

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  /**
   * Initializes user media stream (camera + microphone) with graceful fallbacks.
   */
  const initializeMedia = useCallback(async () => {
    // Check screen sharing API support
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getDisplayMedia) {
      setScreenAvailable(true);
    }

    try {
      // First attempt: Request both video and audio
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStream.current = stream;
      setVideoAvailable(true);
      setAudioAvailable(true);
      setIsVideoOn(true);
      setIsAudioOn(true);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (fullError) {
      console.warn(
        "[MediaStream] Both video & audio could not be acquired simultaneously. Trying individually...",
        fullError
      );

      // Second attempt: Try acquiring video alone
      let videoTrack = null;
      try {
        const vStream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoTrack = vStream.getVideoTracks()[0];
        setVideoAvailable(true);
        setIsVideoOn(true);
      } catch (vErr) {
        console.warn("[MediaStream] Camera unavailable:", vErr);
        setVideoAvailable(false);
        setIsVideoOn(false);
      }

      // Third attempt: Try acquiring audio alone
      let audioTrack = null;
      try {
        const aStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioTrack = aStream.getAudioTracks()[0];
        setAudioAvailable(true);
        setIsAudioOn(true);
      } catch (aErr) {
        console.warn("[MediaStream] Microphone unavailable:", aErr);
        setAudioAvailable(false);
        setIsAudioOn(false);
      }

      // Assemble fallback MediaStream
      const fallbackTracks = [videoTrack, audioTrack].filter(Boolean);
      const compositeStream = new MediaStream(fallbackTracks);
      localStream.current = compositeStream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = compositeStream;
      }
      return compositeStream;
    }
  }, []);

  /**
   * Native camera toggle using track.enabled.
   * Returns the new boolean state.
   */
  const toggleVideo = useCallback(() => {
    if (!localStream.current) return isVideoOn;
    const videoTrack = localStream.current.getVideoTracks()[0];
    if (videoTrack) {
      const nextState = !videoTrack.enabled;
      videoTrack.enabled = nextState;
      setIsVideoOn(nextState);
      return nextState;
    }
    return isVideoOn;
  }, [isVideoOn]);

  /**
   * Native microphone toggle using track.enabled.
   * Returns the new boolean state.
   */
  const toggleAudio = useCallback(() => {
    if (!localStream.current) return isAudioOn;
    const audioTrack = localStream.current.getAudioTracks()[0];
    if (audioTrack) {
      const nextState = !audioTrack.enabled;
      audioTrack.enabled = nextState;
      setIsAudioOn(nextState);
      return nextState;
    }
    return isAudioOn;
  }, [isAudioOn]);

  /**
   * Stops screen share tracks and resets state.
   */
  const stopScreenShare = useCallback(() => {
    if (screenStream.current) {
      screenStream.current.getTracks().forEach((track) => track.stop());
      screenStream.current = null;
    }
    setIsScreenSharing(false);
  }, []);

  /**
   * Captures screen video via getDisplayMedia.
   * Attaches an onended handler to automatically revert when user clicks browser "Stop sharing".
   */
  const startScreenShare = useCallback(
    async (onEndedCallback) => {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false, // Display video only to prevent competing audio tracks
        });

        screenStream.current = displayStream;
        const screenTrack = displayStream.getVideoTracks()[0];

        setIsScreenSharing(true);

        screenTrack.onended = () => {
          stopScreenShare();
          if (typeof onEndedCallback === "function") {
            onEndedCallback();
          }
        };

        return screenTrack;
      } catch (err) {
        if (err.name !== "NotAllowedError") {
          console.error("[MediaStream] Error acquiring screen stream:", err);
        }
        return null;
      }
    },
    [stopScreenShare]
  );

  /**
   * Completely shuts down all media hardware tracks on unmount / end-call.
   */
  const stopAllTracks = useCallback(() => {
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
      localStream.current = null;
    }
    if (screenStream.current) {
      screenStream.current.getTracks().forEach((track) => track.stop());
      screenStream.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  }, []);

  // Cleanup on hook unmount
  useEffect(() => {
    return () => {
      stopAllTracks();
    };
  }, [stopAllTracks]);

  return {
    localVideoRef,
    localStream,
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
  };
}
