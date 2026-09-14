import VideoTile from "./VideoTile";

export default function VideoGrid({
  participants = [],
  videos = [],
  localStream = null,
  localVideoRef = null,
  isAudioMuted = false,
  isVideoOff = false,
  isScreenSharing = false,
  localName = "You",
}) {
  const remotePeers = participants.length > 0 ? participants : videos;
  const totalParticipants = remotePeers.length + 1;

  const getGridClasses = () => {
    if (totalParticipants === 1) {
      return "grid grid-cols-1 max-w-3xl w-full";
    }
    if (totalParticipants === 2) {
      return "grid grid-cols-1 md:grid-cols-2 max-w-5xl w-full";
    }
    if (totalParticipants <= 4) {
      return "grid grid-cols-1 sm:grid-cols-2 max-w-5xl w-full";
    }
    return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full";
  };

  return (
    <div className="flex-1 w-full h-full p-3 sm:p-6 flex items-center justify-center overflow-y-auto">
      <div
        className={`gap-3 sm:gap-4 ${getGridClasses()} transition-all duration-300`}
      >
        <VideoTile
          isLocal={true}
          stream={localStream}
          localRef={localVideoRef}
          label={localName || "You"}
          isMuted={isAudioMuted}
          isCameraOff={isVideoOff}
          isScreenSharing={isScreenSharing}
        />

        {remotePeers.map((peer, index) => {
          const displayName =
            peer.name ||
            peer.username ||
            (remotePeers.length === 1
              ? "Participant"
              : `Participant ${index + 2}`);
          const isPeerMuted =
            typeof peer.micActive === "boolean" ? !peer.micActive : false;
          const isPeerCameraOff =
            typeof peer.cameraActive === "boolean" ? !peer.cameraActive : false;

          return (
            <VideoTile
              key={peer.socketId || index}
              stream={peer.stream}
              socketId={peer.socketId}
              label={displayName}
              isLocal={false}
              isMuted={isPeerMuted}
              isCameraOff={isPeerCameraOff}
              isScreenSharing={peer.isScreenSharing}
            />
          );
        })}
      </div>
    </div>
  );
}
