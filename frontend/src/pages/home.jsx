import React, { useContext, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import withAuth from "@/utils/withAuth";
import Navbar from "@/components/layout/Navbar";
import { AuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Video,
  ArrowRight,
  History,
  Calendar,
  Clock,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";

function HomeComponent() {
  const navigate = useNavigate();
  const { addToUserHistory, getHistoryOfUser } = useContext(AuthContext);

  const [meetingCode, setMeetingCode] = useState("");
  const [error, setError] = useState("");
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    const loadRecent = async () => {
      try {
        const history = await getHistoryOfUser();
        if (Array.isArray(history)) {
          // Take the 4 most recent meetings
          const sorted = [...history].reverse().slice(0, 4);
          setRecentMeetings(sorted);
        }
      } catch (err) {
        console.error("Failed to load meeting history", err);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadRecent();
  }, []);

  const handleCreateInstantMeeting = async () => {
    const randomCode = Math.random().toString(36).substring(2, 9);
    try {
      await addToUserHistory(randomCode);
      navigate(`/${randomCode}`);
    } catch (err) {
      console.error(err);
      navigate(`/${randomCode}`);
    }
  };

  const handleJoinVideoCall = async (e) => {
    if (e) e.preventDefault();
    const cleanCode = meetingCode.trim();

    if (!cleanCode) {
      setError("Please enter a meeting code");
      return;
    }

    try {
      await addToUserHistory(cleanCode);
      navigate(`/${cleanCode}`);
    } catch (err) {
      console.error(err);
      // Even if adding to history fails, proceed to meeting room
      navigate(`/${cleanCode}`);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-[#050814] text-white flex flex-col selection:bg-[#00D8F6]/20 selection:text-[#00D8F6]">
      {/* Navigation */}
      <Navbar showAppNav={true} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Welcome Dashboard Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-[#1E2B4D] bg-[#0D1527] p-6 sm:p-8 shadow-xl">
          <div className="absolute right-0 top-0 w-96 h-96 bg-[#00D8F6]/10 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-[#7B61FF]/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#062436] border border-[#00D8F6]/30 text-xs font-semibold text-[#00D8F6]">
              <Sparkles className="size-3" />
              <span>Connekt Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="text-sm sm:text-base text-slate-400">
              Join an existing room using your unique meeting code, create an instant session, or review your recent call activity.
            </p>
          </div>
        </div>



        {/* Core Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Join Meeting Card (Main Action) */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-[#0D1527] border border-[#1E2B4D] p-6 sm:p-8 shadow-xl space-y-6">
              <div className="space-y-1">
                <div className="size-10 rounded-full bg-cyan-500/10 text-[#00D8F6] flex items-center justify-center border border-[#00D8F6]/30 mb-2">
                  <Video className="size-5" />
                </div>
                <h2 className="text-xl font-bold text-white">Join a Meeting</h2>
                <p className="text-sm text-slate-400">
                  Enter an invitation or room code to instantly connect with peers.
                </p>
              </div>

              <form onSubmit={handleJoinVideoCall} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Meeting Code
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="e.g. project-standup"
                      value={meetingCode}
                      onChange={(e) => {
                        setMeetingCode(e.target.value);
                        if (error) setError("");
                      }}
                      className="rounded-full bg-[#131D36] border-[#1E2B4D] text-white px-5 h-12 text-sm sm:text-base font-mono placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-[#00D8F6] focus-visible:border-[#00D8F6]"
                    />
                  </div>
                  {error && (
                    <p className="text-xs text-red-400 font-medium mt-1">
                      {error}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-full bg-gradient-to-r from-[#00D8F6] to-[#7B61FF] text-black font-bold h-12 shadow-lg shadow-cyan-500/25 hover:brightness-110 gap-2 text-base transition-all"
                >
                  <span>Join Meeting</span>
                  <ArrowRight className="size-4 text-black stroke-[2.5]" />
                </Button>
              </form>

              <div className="pt-2 border-t border-[#1E2B4D]/60 flex items-center justify-between">
                <span className="text-xs text-slate-400">Need a new room right away?</span>
                <button
                  type="button"
                  onClick={handleCreateInstantMeeting}
                  className="rounded-full bg-[#131D36] border border-[#1E2B4D] hover:bg-[#1A2642] text-slate-200 hover:text-white px-4 py-2 text-xs font-semibold transition-all"
                >
                  + Instant Room
                </button>
              </div>
            </div>
          </div>

          {/* Recent Meetings Panel */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="size-4 text-[#00D8F6]" />
                <h2 className="text-base font-bold tracking-tight text-white">
                  Recent Meetings
                </h2>
              </div>
              <Link
                to="/history"
                className="text-xs font-semibold text-[#00D8F6] hover:underline"
              >
                View all history →
              </Link>
            </div>

            {loadingHistory ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-2xl bg-[#131D36]" />
                ))}
              </div>
            ) : recentMeetings.length > 0 ? (
              <div className="space-y-3">
                {recentMeetings.map((item, idx) => (
                  <div
                    key={item._id || idx}
                    className="p-4 rounded-2xl border border-[#1E2B4D] bg-[#0D1527] hover:border-slate-500 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-[#00D8F6] tracking-wide truncate">
                          #{item.meetingCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(item.meetingCode)}
                          className="text-slate-400 hover:text-white transition-colors p-1"
                          title="Copy meeting code"
                          aria-label="Copy meeting code"
                        >
                          {copiedCode === item.meetingCode ? (
                            <Check className="size-3.5 text-[#00E599]" />
                          ) : (
                            <Copy className="size-3.5 opacity-60 group-hover:opacity-100" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Calendar className="size-3 text-slate-400" />
                        <span>{formatDate(item.date)}</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full bg-[#131D36] border-[#1E2B4D] hover:bg-[#1A2642] hover:border-slate-500 text-white text-xs font-semibold px-4 py-2 shrink-0"
                      onClick={() => navigate(`/${item.meetingCode}`)}
                    >
                      Rejoin
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl bg-[#0D1527] border border-[#1E2B4D] p-8 text-center space-y-3 shadow-md">
                <div className="size-10 rounded-full bg-[#131D36] text-slate-400 flex items-center justify-center mx-auto">
                  <Clock className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">No recent meetings</p>
                  <p className="text-xs text-slate-400">
                    Joined calls will appear here for quick one-click access.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(HomeComponent);
