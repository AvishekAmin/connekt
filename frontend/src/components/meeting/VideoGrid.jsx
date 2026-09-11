import VideoTile from "./VideoTile";

export default function VideoGrid({
  videos = [],
  localVideoRef = null,
  isAudioMuted = false,
}) {
  const totalParticipants = videos.length + 1;

  // Compute adaptive layout class based on participant count
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
      <div className={`gap-3 sm:gap-4 ${getGridClasses()} transition-all duration-300`}>
        {/* Local Video Tile */}
        <VideoTile
          isLocal={true}
          localRef={localVideoRef}
          label="You"
          isMuted={isAudioMuted}
        />

        {/* Remote Video Tiles */}
        {videos.map((videoItem, index) => (
          <VideoTile
            key={videoItem.socketId || index}
            stream={videoItem.stream}
            socketId={videoItem.socketId}
            label={videos.length === 1 ? "Participant" : `Participant ${index + 2}`}
            isLocal={false}
          />
        ))}
      </div>
    </div>
  );
}
