import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import withAuth from "@/utils/withAuth";
import Navbar from "@/components/layout/Navbar";
import { AuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  History as HistoryIcon,
  Calendar,
  Clock,
  Copy,
  Check,
  ArrowLeft,
  ArrowRight,
  Search,
  AlertCircle,
  RefreshCw,
  Video,
} from "lucide-react";

function HistoryComponent() {
  const { getHistoryOfUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const history = await getHistoryOfUser();
      if (Array.isArray(history)) {
        // Sort descending by date
        setMeetings([...history].reverse());
      } else {
        setMeetings([]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load your meeting history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const filteredMeetings = meetings.filter((m) =>
    (m.meetingCode || "").toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="min-h-screen bg-[#050814] text-white flex flex-col selection:bg-[#00D8F6]/20 selection:text-[#00D8F6]">
      {/* Navbar */}
      <Navbar showAppNav={true} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Top Back Navigation Pill & Header */}
        <div className="space-y-4">
          <Link
            to="/home"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white bg-[#0D1527] border border-[#1E2B4D] hover:bg-[#131D36] rounded-full px-4 py-2 w-fit transition-all"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
                <HistoryIcon className="size-7 text-[#00D8F6]" />
                <span>Meeting History</span>
              </h1>
              <p className="text-sm text-slate-400">
                All previously joined video conference rooms associated with your account.
              </p>
            </div>

            {/* Total Badge & Refresh Button */}
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-[#1E2B4D] bg-[#0D1527] hover:bg-[#131D36] text-white gap-1.5 text-xs px-4"
                onClick={fetchHistory}
                disabled={loading}
              >
                <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Search Pill Input */}
        {meetings.length > 0 && (
          <div className="relative max-w-md">
            <Search className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by meeting code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-full bg-[#0D1527] border-[#1E2B4D] pl-11 pr-4 h-11 text-sm text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-[#00D8F6] focus-visible:border-[#00D8F6]"
            />
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl bg-[#131D36]" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-red-950/20 border border-red-500/30 p-8 text-center space-y-4">
            <AlertCircle className="size-8 text-red-400 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-red-400">{error}</p>
              <p className="text-xs text-slate-400">Please verify your connection and try again.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchHistory}
              className="rounded-full border-red-500/40 hover:bg-red-950/30 text-xs px-4 text-white"
            >
              Retry
            </Button>
          </div>
        ) : filteredMeetings.length > 0 ? (
          <div className="space-y-3">
            {filteredMeetings.map((item, index) => (
              <div
                key={item._id || index}
                className="p-5 sm:p-6 rounded-2xl border border-[#1E2B4D] bg-[#0D1527] hover:border-slate-500 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-md"
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-base font-bold text-[#00D8F6] tracking-wide">
                      #{item.meetingCode}
                    </span>
                    <Badge variant="completed" className="text-[11px] px-2.5 py-0.5 gap-1.5">
                      <span className="size-1.5 rounded-full bg-[#00E599]" />
                      Completed
                    </Badge>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(item.meetingCode)}
                      className="text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-[#131D36]"
                      title="Copy meeting code"
                      aria-label="Copy meeting code"
                    >
                      {copiedCode === item.meetingCode ? (
                        <Check className="size-3.5 text-[#00E599]" />
                      ) : (
                        <Copy className="size-3.5 opacity-60 group-hover:opacity-100" />
                      )}
                    </button>
                    {copiedCode === item.meetingCode && (
                      <span className="text-[11px] text-[#00E599] font-medium">Copied!</span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-slate-400" />
                      <span>{formatDate(item.date)}</span>
                    </div>
                    {formatTime(item.date) && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="size-3.5 text-slate-400" />
                        <span>{formatTime(item.date)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    className="rounded-full bg-gradient-to-r from-[#00D8F6] to-[#7B61FF] text-black font-bold text-xs gap-1.5 h-9 px-5 shadow-md shadow-cyan-500/20 hover:brightness-110"
                    onClick={() => navigate(`/${item.meetingCode}`)}
                  >
                    <span>Rejoin Room</span>
                    <ArrowRight className="size-3.5 text-black stroke-[2.5]" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery ? (
          <div className="rounded-3xl bg-[#0D1527] border border-[#1E2B4D] p-12 text-center space-y-3 shadow-md">
            <Search className="size-8 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <p className="text-base font-medium text-white">No matching meetings</p>
              <p className="text-xs text-slate-400">
                No history entries matched "{searchQuery}".
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="rounded-full border-[#1E2B4D] bg-[#131D36] text-xs text-white"
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="rounded-3xl bg-[#0D1527] border border-[#1E2B4D] p-12 text-center space-y-4 shadow-md">
            <div className="size-12 rounded-full bg-[#131D36] text-[#00D8F6] flex items-center justify-center mx-auto border border-[#1E2B4D]">
              <Video className="size-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <p className="text-base font-medium text-white">No meeting history yet</p>
              <p className="text-xs text-slate-400">
                When you participate in video meetings on Connekt, they will be saved here for easy rejoining.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/home")}
              className="rounded-full bg-gradient-to-r from-[#00D8F6] to-[#7B61FF] text-black font-bold text-xs h-9 px-5"
            >
              Join a Meeting
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

export default withAuth(HistoryComponent);
