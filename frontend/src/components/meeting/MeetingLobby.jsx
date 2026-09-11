import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  ArrowRight,
  Shield,
  ArrowLeft,
  User,
  Sparkles,
} from "lucide-react";

export default function MeetingLobby({
  username = "",
  setUsername,
  localVideoRef,
  onConnect,
  meetingCode = "",
  videoAvailable = true,
  audioAvailable = true,
  isVideoOn = true,
  isAudioOn = true,
  onToggleVideo,
  onToggleAudio,
}) {
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!username.trim()) return;
    onConnect();
  };

  return (
    <div className="min-h-screen bg-[#050814] text-white flex flex-col items-center justify-between p-4 sm:p-8 selection:bg-[#00D8F6]/20 selection:text-[#00D8F6]">
      {/* Top Header */}
      <div className="w-full max-w-5xl flex items-center justify-between">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white bg-[#0D1527] border border-[#1E2B4D] hover:bg-[#131D36] rounded-full px-4 py-2 transition-all group"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Leave Lobby</span>
        </Link>

        {/* Room Code Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D1527] border border-[#1E2B4D] text-xs font-mono text-slate-400">
          <span>Room:</span>
          <span className="font-bold text-[#00D8F6]">#{meetingCode}</span>
        </div>
      </div>

      {/* Main Centered Content */}
      <main className="w-full max-w-4xl my-auto py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Video Preview Card (Visual Focus) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-[#0D1527] border border-[#1E2B4D] shadow-2xl flex items-center justify-center">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover -scale-x-100 ${
                  !isVideoOn || !videoAvailable ? "hidden" : "block"
                }`}
              />

              {/* Video Off Fallback Avatar */}
              {(!isVideoOn || !videoAvailable) && (
                <div className="flex flex-col items-center justify-center text-slate-400 space-y-2 select-none">
                  <div className="size-16 rounded-full bg-[#131D36] border border-[#1E2B4D] flex items-center justify-center text-[#00D8F6]">
                    <User className="size-8" />
                  </div>
                  <span className="text-xs font-medium">Camera is off</span>
                </div>
              )}

              {/* Floating Quick Controls on Preview */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-[#050814]/85 backdrop-blur-md border border-[#1E2B4D] z-10 shadow-lg">
                <button
                  type="button"
                  onClick={onToggleAudio}
                  className={`size-10 rounded-full flex items-center justify-center transition-all ${
                    isAudioOn && audioAvailable
                      ? "bg-[#131D36] border border-[#1E2B4D] hover:bg-[#1A2642] text-white"
                      : "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/30"
                  }`}
                  title={isAudioOn ? "Mute mic" : "Unmute mic"}
                  aria-label={isAudioOn ? "Mute mic" : "Unmute mic"}
                >
                  {isAudioOn && audioAvailable ? (
                    <Mic className="size-4 text-[#00E599]" />
                  ) : (
                    <MicOff className="size-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={onToggleVideo}
                  className={`size-10 rounded-full flex items-center justify-center transition-all ${
                    isVideoOn && videoAvailable
                      ? "bg-[#131D36] border border-[#1E2B4D] hover:bg-[#1A2642] text-white"
                      : "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/30"
                  }`}
                  title={isVideoOn ? "Turn off camera" : "Turn on camera"}
                  aria-label={isVideoOn ? "Turn off camera" : "Turn on camera"}
                >
                  {isVideoOn && videoAvailable ? (
                    <Video className="size-4 text-[#00D8F6]" />
                  ) : (
                    <VideoOff className="size-4" />
                  )}
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Preview your video and microphone before entering
            </p>
          </div>

          {/* Join Info & Username Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00D8F6]">
                <Sparkles className="size-3.5" />
                <span>Ready to Join?</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Meeting Lobby</h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Enter your display name so other participants in the room can identify you.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Your Display Name
                </label>
                <Input
                  required
                  autoFocus
                  type="text"
                  placeholder="e.g. Alex"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded-full bg-[#131D36] border-[#1E2B4D] text-white px-5 h-12 text-sm placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-[#00D8F6] focus-visible:border-[#00D8F6]"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={!username.trim()}
                className="w-full rounded-full bg-gradient-to-r from-[#00D8F6] to-[#7B61FF] text-black font-bold h-12 shadow-lg shadow-cyan-500/25 hover:brightness-110 gap-2 text-base transition-all"
              >
                <span>Enter Meeting</span>
                <ArrowRight className="size-4 text-black stroke-[2.5]" />
              </Button>
            </form>

            <div className="p-3.5 rounded-2xl bg-[#0D1527] border border-[#1E2B4D] text-xs text-slate-400 flex items-center gap-2.5">
              <Shield className="size-4 text-[#00D8F6] shrink-0" />
              <span>Peer-to-peer WebRTC connection begins as soon as you enter.</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer note */}
      <div className="text-center text-xs text-slate-500">
        Connekt Conferencing • Room Code: <span className="font-mono text-[#00D8F6]">#{meetingCode}</span>
      </div>
    </div>
  );
}
