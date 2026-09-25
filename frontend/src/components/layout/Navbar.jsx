import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Keyboard,
  Video,
  Plus,
  History,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar({ _showAuth = false, _showAppNav = false }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const [meetingInput, setMeetingInput] = useState("");
  const [inputError, setInputError] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const extractMeetingCode = (input) => {
    if (!input) return "";
    let clean = input.trim();
    clean = clean.replace(/\/+$/, "");
    if (clean.includes("/")) {
      try {
        const parsed =
          clean.startsWith("http://") || clean.startsWith("https://")
            ? new URL(clean)
            : new URL(`https://dummy.com/${clean}`);
        clean = parsed.pathname.split("/").filter(Boolean).pop() || "";
      } catch {
        clean = clean.split("/").filter(Boolean).pop() || "";
      }
    }
    clean = clean.split("?")[0].split("#")[0].trim();
    return clean;
  };

  const generateMeetingCode = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    const segment = (len) =>
      Array.from(
        { length: len },
        () => chars[Math.floor(Math.random() * chars.length)],
      ).join("");
    return `${segment(3)}-${segment(4)}-${segment(3)}`;
  };

  const handleJoinMeeting = (e) => {
    if (e) e.preventDefault();
    const code = extractMeetingCode(meetingInput);
    if (!code) {
      setInputError(true);
      setTimeout(() => setInputError(false), 2000);
      return;
    }
    setMeetingInput("");
    setMobileMenuOpen(false);
    const meetingPath = ROUTES.getMeetingPath(code);

    if (!isAuthenticated) {
      navigate(ROUTES.AUTH, {
        state: { redirectTo: meetingPath, formState: 0 },
      });
    } else {
      navigate(meetingPath);
    }
  };

  const handleCreateMeeting = () => {
    const newCode = generateMeetingCode();
    setMobileMenuOpen(false);
    const meetingPath = ROUTES.getMeetingPath(newCode);

    if (!isAuthenticated) {
      navigate(ROUTES.AUTH, {
        state: { redirectTo: meetingPath, formState: 0 },
      });
    } else {
      navigate(meetingPath);
    }
  };

  const handleNavigateToAuth = (tabState) => {
    setMobileMenuOpen(false);
    navigate(ROUTES.AUTH, { state: { formState: tabState } });
  };

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate(ROUTES.LANDING, { replace: true });
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full px-3 py-3 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto rounded-2xl md:rounded-full border border-white/10 bg-[#121212]/90 backdrop-blur-xl px-4 py-2.5 sm:px-6 flex items-center justify-between gap-3 sm:gap-4 shadow-2xl shadow-black/60 transition-all">
        <Link
          to={ROUTES.LANDING}
          className="flex items-center gap-2.5 shrink-0 focus:outline-none group"
        >
          <div className="relative flex items-center justify-center">
            <svg
              className="size-7 text-[#00D8F6] transition-transform group-hover:scale-105"
              style={{ filter: "drop-shadow(0 0 7px rgba(0, 216, 255, 0.65))" }}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M4.5 5A2.5 2.5 0 0 0 2 7.5v9A2.5 2.5 0 0 0 4.5 19h9a2.5 2.5 0 0 0 2.5-2.5v-1.8l3.3 2.2a1 1 0 0 0 1.55-.83V7.93a1 1 0 0 0-1.55-.83L16 9.3V7.5A2.5 2.5 0 0 0 13.5 5h-9z" />
            </svg>
          </div>

          <span
            className="text-xl sm:text-2xl font-extrabold tracking-tight text-white transition-colors group-hover:text-cyan-300"
            style={{ textShadow: "0 0 20px rgba(0, 216, 255, 0.28)" }}
          >
            Connekt
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-3 flex-1 justify-center max-w-2xl">
          <form
            onSubmit={handleJoinMeeting}
            className={`flex items-center rounded-full border bg-[#181818] px-3.5 py-1.5 transition-all shadow-inner ${
              inputError
                ? "border-red-500/80 ring-1 ring-red-500/50"
                : "border-white/10 focus-within:border-[#00D8F6]/80 focus-within:ring-1 focus-within:ring-[#00D8F6]/40"
            }`}
          >
            <Keyboard className="size-4 text-slate-400 shrink-0 mr-2.5" />
            <input
              type="text"
              value={meetingInput}
              onChange={(e) => {
                setMeetingInput(e.target.value);
                setInputError(false);
              }}
              placeholder={
                inputError
                  ? "Please enter valid code or link"
                  : "Enter meeting code or link"
              }
              className="bg-transparent text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none w-48 sm:w-56 md:w-64"
            />
            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-[#00D8F6] to-[#7B61FF] text-black font-bold text-xs px-4 py-1.5 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-cyan-500/20 shrink-0 ml-2"
            >
              Join
            </button>
          </form>

          <button
            type="button"
            onClick={handleCreateMeeting}
            className="h-[38px] rounded-full border border-[#00D8F6]/45 hover:border-[#00D8F6] bg-[#181818] hover:bg-[#222222] text-white px-4 py-2 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow-cyan-500/15 active:scale-95 shrink-0 group"
          >
            <div className="relative flex items-center justify-center text-[#00D8F6]">
              <Video className="size-4 text-[#00D8F6]" />
              <Plus className="size-2.5 text-[#00D8F6] absolute -top-1 -right-1 font-bold stroke-[3]" />
            </div>
            <span>Create a meeting</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {isLoading ? (
            <div className="size-9 rounded-full bg-[#1a1a1a] border border-white/10 animate-pulse" />
          ) : !isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => handleNavigateToAuth(1)}
                className="hidden sm:inline-flex rounded-full bg-gradient-to-r from-[#00D8F6] to-[#7B61FF] text-black font-bold text-xs sm:text-sm px-5 py-2 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-cyan-500/20"
              >
                Sign Up
              </button>

              <button
                type="button"
                onClick={() => handleNavigateToAuth(0)}
                className="rounded-full bg-gradient-to-r from-[#00D8F6] to-[#7B61FF] text-black font-bold text-xs sm:text-sm px-5 py-2 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-cyan-500/20"
              >
                Log In
              </button>
            </>
          ) : (
            <>
              <Link
                to={ROUTES.HISTORY}
                className="h-[38px] hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#141414] hover:bg-[#1f1f1f] hover:border-[#00D8F6]/40 text-slate-200 hover:text-white px-4 py-2 text-xs sm:text-sm font-semibold transition-all shrink-0 active:scale-95"
              >
                <History className="size-4 text-[#00D8F6]" />
                <span>History</span>
              </Link>

              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="size-9 rounded-full bg-gradient-to-r from-[#00D8F6] to-[#7B61FF] text-black font-extrabold flex items-center justify-center text-sm shadow-md shadow-cyan-500/25 hover:brightness-110 transition-all focus:outline-none active:scale-95"
                  aria-label="User profile menu"
                >
                  {user?.name?.charAt(0)?.toUpperCase() ||
                    user?.username?.charAt(0)?.toUpperCase() ||
                    "U"}
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-52 rounded-2xl border border-white/10 bg-[#141414]/95 backdrop-blur-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-xs font-bold text-white truncate">
                        {user?.name || user?.username}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        @{user?.username}
                      </p>
                    </div>

                    <div className="pt-1.5 space-y-0.5">
                      <Link
                        to={ROUTES.DASHBOARD}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-[#1f1f1f] rounded-xl transition-all"
                      >
                        <LayoutDashboard className="size-3.5 text-[#00D8F6]" />
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        to={ROUTES.HISTORY}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-[#1f1f1f] rounded-xl transition-all"
                      >
                        <History className="size-3.5 text-[#00D8F6]" />
                        <span>Meeting History</span>
                      </Link>

                      <hr className="border-white/10 my-1" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-left"
                      >
                        <LogOut className="size-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full border border-white/10 bg-[#141414] hover:bg-[#1f1f1f] text-slate-300 hover:text-white transition-all"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="size-4" />
            ) : (
              <Menu className="size-4" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden max-w-7xl mx-auto mt-2 rounded-2xl border border-white/10 bg-[#141414]/95 backdrop-blur-2xl p-4 shadow-2xl space-y-3.5 animate-in fade-in duration-150">
          <form
            onSubmit={handleJoinMeeting}
            className="flex items-center rounded-full border border-white/10 bg-[#181818] px-3.5 py-1.5"
          >
            <Keyboard className="size-4 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              value={meetingInput}
              onChange={(e) => setMeetingInput(e.target.value)}
              placeholder="Enter meeting code or link"
              className="bg-transparent text-xs text-white placeholder:text-slate-400 focus:outline-none w-full"
            />
            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-[#00D8F6] to-[#7B61FF] text-black font-bold text-xs px-3.5 py-1 shrink-0 ml-2"
            >
              Join
            </button>
          </form>

          <button
            type="button"
            onClick={handleCreateMeeting}
            className="w-full rounded-full border border-[#00D8F6]/45 bg-[#1a1a1a] text-white py-2 text-xs font-semibold flex items-center justify-center gap-2"
          >
            <Video className="size-4 text-[#00D8F6]" />
            <span>Create a meeting</span>
          </button>

          {!isLoading && !isAuthenticated && (
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
              <button
                type="button"
                onClick={() => handleNavigateToAuth(1)}
                className="rounded-full bg-gradient-to-r from-[#00D8F6] to-[#7B61FF] text-black font-bold text-xs py-2 text-center"
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => handleNavigateToAuth(0)}
                className="rounded-full bg-gradient-to-r from-[#00D8F6] to-[#7B61FF] text-black font-bold text-xs py-2 text-center"
              >
                Log In
              </button>
            </div>
          )}

          {!isLoading && isAuthenticated && (
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="flex items-center gap-3 px-1">
                <div className="size-9 rounded-full bg-gradient-to-r from-[#00D8F6] to-[#7B61FF] text-black font-extrabold flex items-center justify-center text-sm shadow-md shadow-cyan-500/25 shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase() ||
                    user?.username?.charAt(0)?.toUpperCase() ||
                    "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">
                    {user?.name || user?.username}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    @{user?.username}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  to={ROUTES.DASHBOARD}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-[#1a1a1a] text-white py-2 text-xs font-medium text-center hover:bg-[#262626] transition-all"
                >
                  <LayoutDashboard className="size-3.5 text-[#00D8F6]" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to={ROUTES.HISTORY}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-[#1a1a1a] text-white py-2 text-xs font-medium text-center hover:bg-[#262626] transition-all"
                >
                  <History className="size-3.5 text-[#00D8F6]" />
                  <span>History</span>
                </Link>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 py-2 text-xs font-medium text-center transition-all"
              >
                <LogOut className="size-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
