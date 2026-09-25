import { Mic, MicOff, User } from "lucide-react";

export default function VideoTile({
  stream = null,
  isLocal = false,
  localRef = null,
  socketId = "",
  label = "Participant",
  isMuted = false,
  isCameraOff = false,
  isScreenSharing = false,
}) {
  const getInitials = (name) => {
    if (!name) return "P";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="relative w-full h-full min-h-[180px] aspect-video rounded-2xl overflow-hidden bg-[#141414] border border-white/10 shadow-xl flex items-center justify-center group">
      {isLocal ? (
        <video
          ref={(el) => {
            if (localRef) {
              if (typeof localRef === "function") {
                localRef(el);
              } else {
                localRef.current = el;
              }
            }
            if (el && stream && el.srcObject !== stream) {
              el.srcObject = stream;
            }
          }}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${
            isScreenSharing ? "" : "-scale-x-100"
          } ${isCameraOff ? "hidden" : "block"}`}
        />
      ) : (
        <video
          data-socket={socketId}
          ref={(el) => {
            if (el && stream && el.srcObject !== stream) {
              el.srcObject = stream;
            }
          }}
          autoPlay
          playsInline
          className={`w-full h-full object-cover ${
            isCameraOff ? "hidden" : "block"
          }`}
        />
      )}

      {isCameraOff && (
        <div className="flex flex-col items-center justify-center space-y-2 select-none">
          <div className="size-16 sm:size-20 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-[#00D8F6] font-bold text-lg sm:text-xl shadow-lg">
            {label && label !== "You" ? (
              getInitials(label)
            ) : (
              <User className="size-8" />
            )}
          </div>
          <span className="text-xs font-medium text-slate-400">{label}</span>
        </div>
      )}

      <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-[#0a0a0a]/85 backdrop-blur-md text-xs font-semibold text-white flex items-center gap-1.5 z-10 border border-white/10 select-none shadow-md">
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
