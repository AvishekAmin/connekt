import { useState } from "react";
import { Users, Copy, Check } from "lucide-react";

export default function MeetingHeader({ meetingCode = "", participantCount = 1 }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!meetingCode) return;
    navigator.clipboard.writeText(meetingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="h-14 px-4 sm:px-6 bg-[#050814]/85 backdrop-blur-md border-b border-[#1E2B4D] flex items-center justify-between z-30 shrink-0 select-none">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <img
          src="/favicon.svg"
          alt="Connekt"
          className="size-7 rounded-md"
        />
        <span className="font-bold text-sm sm:text-base tracking-tight text-white hidden sm:inline">
          Connekt
        </span>
      </div>

      {/* Meeting Code Pill (Click to Copy) */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0D1527] hover:bg-[#131D36] border border-[#1E2B4D] text-xs font-mono text-white transition-all group"
          title="Click to copy meeting code"
          aria-label="Click to copy meeting code"
        >
          <span className="text-slate-400 hidden xs:inline">Room:</span>
          <span className="font-bold text-[#00D8F6]">#{meetingCode || "connekt"}</span>
          {copied ? (
            <Check className="size-3.5 text-[#00E599]" />
          ) : (
            <Copy className="size-3.5 text-slate-400 group-hover:text-white transition-colors" />
          )}
        </button>
        {copied && (
          <span className="text-[11px] text-[#00E599] font-medium hidden sm:inline">
            Copied!
          </span>
        )}
      </div>

      {/* Participant Counter */}
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D1527] border border-[#1E2B4D] text-xs text-slate-300 font-semibold">
          <Users className="size-3.5 text-[#00D8F6]" />
          <span>{participantCount}</span>
        </div>
      </div>
    </header>
  );
}
