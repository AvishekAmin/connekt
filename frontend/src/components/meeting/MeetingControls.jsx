import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  MonitorOff,
  MessageSquare,
  PhoneOff,
} from "lucide-react";

export default function MeetingControls({
  videoState = true,
  audioState = true,
  screenState = false,
  screenAvailable = true,
  unreadCount = 0,
  isChatOpen = false,
  onToggleVideo,
  onToggleAudio,
  onToggleScreen,
  onToggleChat,
  onEndCall,
}) {
  return (
    <div className="py-3 px-4 flex items-center justify-center shrink-0 z-30 select-none">
      <div className="inline-flex items-center gap-2.5 sm:gap-3.5 px-4 sm:px-6 py-2 rounded-full bg-[#0D1527]/95 backdrop-blur-xl border border-[#1E2B4D] shadow-2xl shadow-black/80">
        {/* Microphone Toggle */}
        <button
          type="button"
          onClick={onToggleAudio}
          className={`size-11 rounded-full flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D8F6] ${
            audioState
              ? "bg-[#131D36] border border-[#1E2B4D] hover:bg-[#1A2642] text-white"
              : "bg-red-950/40 text-red-400 border border-red-500/40 hover:bg-red-900/50"
          }`}
          title={audioState ? "Mute microphone" : "Unmute microphone"}
          aria-label={audioState ? "Mute microphone" : "Unmute microphone"}
        >
          {audioState ? <Mic className="size-5 text-[#00E599]" /> : <MicOff className="size-5" />}
        </button>

        {/* Video Toggle */}
        <button
          type="button"
          onClick={onToggleVideo}
          className={`size-11 rounded-full flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D8F6] ${
            videoState
              ? "bg-[#131D36] border border-[#1E2B4D] hover:bg-[#1A2642] text-white"
              : "bg-red-950/40 text-red-400 border border-red-500/40 hover:bg-red-900/50"
          }`}
          title={videoState ? "Turn off camera" : "Turn on camera"}
          aria-label={videoState ? "Turn off camera" : "Turn on camera"}
        >
          {videoState ? <Video className="size-5 text-[#00D8F6]" /> : <VideoOff className="size-5" />}
        </button>

        {/* Screen Share (Conditional on API availability) */}
        {screenAvailable && (
          <button
            type="button"
            onClick={onToggleScreen}
            className={`size-11 rounded-full flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D8F6] ${
              screenState
                ? "bg-gradient-to-r from-[#00D8F6] to-[#7B61FF] text-black font-bold shadow-md shadow-cyan-500/30"
                : "bg-[#131D36] border border-[#1E2B4D] hover:bg-[#1A2642] text-white"
            }`}
            title={screenState ? "Stop sharing screen" : "Share screen"}
            aria-label={screenState ? "Stop sharing screen" : "Share screen"}
          >
            {screenState ? (
              <MonitorOff className="size-5 text-black" />
            ) : (
              <MonitorUp className="size-5" />
            )}
          </button>
        )}

        {/* Chat Toggle with Unread Badge */}
        <div className="relative">
          <button
            type="button"
            onClick={onToggleChat}
            className={`size-11 rounded-full flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D8F6] ${
              isChatOpen
                ? "bg-gradient-to-r from-[#00D8F6] to-[#7B61FF] text-black font-bold shadow-md shadow-cyan-500/30"
                : "bg-[#131D36] border border-[#1E2B4D] hover:bg-[#1A2642] text-white"
            }`}
            title="Toggle in-call chat"
            aria-label="Toggle in-call chat"
          >
            <MessageSquare className={`size-5 ${isChatOpen ? "text-black" : ""}`} />
          </button>

          {/* Unread Counter Badge */}
          {!isChatOpen && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 size-5 bg-gradient-to-r from-[#00D8F6] to-[#7B61FF] text-black font-bold rounded-full text-[10px] flex items-center justify-center border-2 border-[#0D1527] pointer-events-none animate-bounce">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-[#1E2B4D] mx-0.5" />

        {/* End Call Button */}
        <button
          type="button"
          onClick={onEndCall}
          className="size-11 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          title="Leave meeting"
          aria-label="Leave meeting"
        >
          <PhoneOff className="size-5" />
        </button>
      </div>
    </div>
  );
}
