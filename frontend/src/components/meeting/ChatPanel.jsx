import { useEffect, useRef } from "react";
import { X, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChatPanel({
  isOpen = false,
  onClose,
  messages = [],
  messageText = "",
  setMessageText,
  onSendMessage,
  currentUser = "",
}) {
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom whenever new messages arrive or panel opens, and autofocus input
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <aside
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-80 md:w-96 bg-[#0D1527]/98 backdrop-blur-xl border-l border-[#1E2B4D] flex flex-col shadow-2xl transition-transform animate-in slide-in-from-right duration-200 select-text"
      aria-label="In-call chat drawer"
    >
      {/* Header */}
      <div className="h-14 px-4 border-b border-[#1E2B4D] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4 text-[#00D8F6]" />
          <h2 className="text-sm font-semibold text-white">In-Call Messages</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="size-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#131D36] transition-colors"
          title="Close chat"
          aria-label="Close chat"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
        {messages.length > 0 ? (
          messages.map((item, index) => {
            const isMe =
              currentUser &&
              item.sender &&
              item.sender.toLowerCase().trim() === currentUser.toLowerCase().trim();

            return (
              <div
                key={index}
                className={`flex flex-col space-y-1 ${
                  isMe ? "items-end" : "items-start"
                }`}
              >
                <span className="text-[11px] font-semibold text-slate-400 px-1">
                  {isMe ? "You" : item.sender || "Participant"}
                </span>

                <div
                  className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                    isMe
                      ? "bg-gradient-to-r from-[#00D8F6] to-[#7B61FF] text-black font-semibold rounded-tr-xs shadow-md"
                      : "bg-[#131D36] text-white border border-[#1E2B4D] rounded-tl-xs"
                  }`}
                >
                  {item.data}
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
            <div className="size-10 rounded-full bg-[#131D36] flex items-center justify-center text-[#00D8F6]">
              <MessageSquare className="size-5" />
            </div>
            <p className="text-sm font-medium text-white">No messages yet</p>
            <p className="text-xs">
              Messages sent during this call will appear here for all participants.
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Area */}
      <div className="p-3 border-t border-[#1E2B4D] bg-[#0D1527] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <Input
            ref={inputRef}
            type="text"
            placeholder="Send a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="rounded-full bg-[#131D36] border-[#1E2B4D] text-sm text-white px-4 h-10 placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-[#00D8F6] focus-visible:border-[#00D8F6] flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!messageText.trim()}
            className="rounded-full bg-gradient-to-r from-[#00D8F6] to-[#7B61FF] text-black size-10 shrink-0 flex items-center justify-center shadow-md shadow-cyan-500/20 hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            title="Send message"
            aria-label="Send message"
          >
            <Send className="size-4 text-black stroke-[2.5]" />
          </Button>
        </form>
      </div>
    </aside>
  );
}
