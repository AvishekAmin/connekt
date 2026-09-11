import { Mic, MicOff } from "lucide-react";

export default function VideoTile({
  stream = null,
  isLocal = false,
  localRef = null,
  socketId = "",
  label = "Participant",
  isMuted = false,
}) {
  return (
    <div className="relative w-full h-full min-h-[160px] aspect-video rounded-2xl overflow-hidden bg-[#0D1527] border border-[#1E2B4D] shadow-xl flex items-center justify-center group">
      {/* Video Element */}
      {isLocal ? (
        <video
          ref={localRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover -scale-x-100"
        />
      ) : (
        <video
          data-socket={socketId}
          ref={(ref) => {
            if (ref && stream) {
              ref.srcObject = stream;
            }
          }}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      )}

      {/* Participant Identity Capsule Pill (Bottom Left) */}
      <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-[#050814]/85 backdrop-blur-md text-xs font-semibold text-white flex items-center gap-1.5 z-10 border border-[#1E2B4D] select-none shadow-md">
        {isMuted ? (
          <MicOff className="size-3 text-red-400" />
        ) : (
          <Mic className="size-3 text-[#00E599]" />
        )}
        <span className="truncate max-w-[120px] sm:max-w-[180px]">{label}</span>
      </div>
    </div>
  );
}
