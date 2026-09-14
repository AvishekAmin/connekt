import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  MonitorUp,
  MessageSquare,
  ArrowRight,
  Mic,
  PhoneOff,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
    };
  }, []);

  return (
    <div className="h-screen h-[100dvh] overflow-hidden bg-[#050814] text-white flex flex-col justify-between selection:bg-[#00D8F6]/20 selection:text-[#00D8F6]">
      {/* Sticky Navbar */}
      <Navbar />

      <main className="flex-1 flex items-center justify-center overflow-hidden">
        {/* Hero Section */}
        <section className="w-full relative overflow-hidden py-4 sm:py-6 lg:py-8">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-[#00D8F6]/10 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-1/3 left-1/3 w-[320px] h-[320px] bg-[#7B61FF]/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Hero Copy */}
              <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D8F6] via-[#6366F1] to-[#EC4899]">
                    Connekt
                  </span>{" "}
                  with your loved ones
                </h1>

                <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start pt-2">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#00D8F6] to-[#7B61FF] text-black font-bold px-8 h-12 shadow-xl shadow-cyan-500/25 hover:brightness-110 gap-2 text-base rounded-full"
                    onClick={() => navigate(isAuthenticated ? ROUTES.DASHBOARD : ROUTES.AUTH)}
                  >
                    <span>{isAuthenticated ? "Go to Dashboard" : "Get Started — It's Free"}</span>
                    <ArrowRight className="size-4 text-black stroke-[2.5]" />
                  </Button>
                </div>
              </div>

              {/* Hero Visual Mockup */}
              <div className="lg:col-span-6">
                <div className="relative mx-auto max-w-lg lg:max-w-none">
                  {/* Decorative Border Glow */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00D8F6]/25 to-[#7B61FF]/25 rounded-3xl blur-md -z-10" />

                  {/* UI Shell */}
                  <div className="rounded-3xl border border-[#1E2B4D] bg-[#0D1527]/95 backdrop-blur-md p-4 sm:p-5 shadow-2xl shadow-black/80">
                    {/* Mockup Header */}
                    <div className="flex items-center justify-between pb-3.5 border-b border-[#1E2B4D]">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <span className="size-2.5 rounded-full bg-red-500/80" />
                          <span className="size-2.5 rounded-full bg-yellow-500/80" />
                          <span className="size-2.5 rounded-full bg-green-500/80" />
                        </div>
                        <span className="text-xs font-mono text-slate-400 ml-2">
                          room: connekt-team-sync
                        </span>
                      </div>
                      <Badge variant="completed" className="text-[11px] px-3 py-0.5 gap-1.5">
                        <span className="size-1.5 rounded-full bg-[#00E599] animate-ping" />
                        Live
                      </Badge>
                    </div>

                    {/* Mockup Video Grid */}
                    <div className="grid grid-cols-2 gap-3 my-4">
                      {/* Tile 1 */}
                      <div className="relative aspect-video rounded-2xl bg-[#131D36] flex items-center justify-center border border-[#1E2B4D] overflow-hidden group">
                        <div className="size-12 rounded-full bg-cyan-500/15 text-[#00D8F6] flex items-center justify-center font-bold text-base border border-[#00D8F6]/30 shadow-inner">
                          AA
                        </div>
                        <div className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#050814]/85 backdrop-blur-sm text-[11px] font-medium text-white flex items-center gap-1.5 border border-white/10">
                          <Mic className="size-3 text-[#00E599]" />
                          <span>You</span>
                        </div>
                      </div>

                      {/* Tile 2 */}
                      <div className="relative aspect-video rounded-2xl bg-[#0E162B] flex items-center justify-center border border-[#1E2B4D] overflow-hidden">
                        <div className="size-12 rounded-full bg-indigo-500/15 text-[#7B61FF] flex items-center justify-center font-bold text-base border border-[#7B61FF]/30 shadow-inner">
                          JS
                        </div>
                        <div className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#050814]/85 backdrop-blur-sm text-[11px] font-medium text-white flex items-center gap-1.5 border border-white/10">
                          <Mic className="size-3 text-[#00E599]" />
                          <span>Participant 2</span>
                        </div>
                      </div>
                    </div>

                    {/* Mockup Call Controls */}
                    <div className="flex items-center justify-center gap-2.5 pt-2">
                      <div className="rounded-full bg-[#0A1020] border border-[#1E2B4D] p-1.5 px-3 flex items-center gap-2 shadow-inner">
                        <div className="size-8 rounded-full bg-[#131D36] border border-[#1E2B4D] flex items-center justify-center text-slate-300">
                          <Mic className="size-4" />
                        </div>
                        <div className="size-8 rounded-full bg-[#131D36] border border-[#1E2B4D] flex items-center justify-center text-slate-300">
                          <Video className="size-4" />
                        </div>
                        <div className="size-8 rounded-full bg-[#131D36] border border-[#1E2B4D] flex items-center justify-center text-slate-300">
                          <MonitorUp className="size-4" />
                        </div>
                        <div className="size-8 rounded-full bg-[#131D36] border border-[#1E2B4D] flex items-center justify-center text-slate-300">
                          <MessageSquare className="size-4" />
                        </div>
                        <div className="size-8 rounded-full bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30">
                          <PhoneOff className="size-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer / Bottom Bar */}
      <footer className="w-full border-t border-[#1E2B4D]/60 bg-[#070D1C]/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          {/* Left Aligned: Social Media Links */}
          <div className="flex items-center gap-2 justify-center md:justify-start flex-1">
            <a
              href="https://www.facebook.com/avishek207"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="size-8 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-[#00D8F6] hover:bg-[#00D8F6]/10 text-slate-400 hover:text-[#00D8F6] hover:-translate-y-0.5 hover:shadow-[0_0_12px_rgba(0,216,255,0.35)] transition-all flex items-center justify-center"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/avishek.______"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="size-8 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-[#00D8F6] hover:bg-[#00D8F6]/10 text-slate-400 hover:text-[#00D8F6] hover:-translate-y-0.5 hover:shadow-[0_0_12px_rgba(0,216,255,0.35)] transition-all flex items-center justify-center"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/avishekamin"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="size-8 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-[#00D8F6] hover:bg-[#00D8F6]/10 text-slate-400 hover:text-[#00D8F6] hover:-translate-y-0.5 hover:shadow-[0_0_12px_rgba(0,216,255,0.35)] transition-all flex items-center justify-center"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
            <a
              href="https://x.com/avishek______"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="size-8 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-[#00D8F6] hover:bg-[#00D8F6]/10 text-slate-400 hover:text-[#00D8F6] hover:-translate-y-0.5 hover:shadow-[0_0_12px_rgba(0,216,255,0.35)] transition-all flex items-center justify-center"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://www.youtube.com/@Avishekkk"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="size-8 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-[#00D8F6] hover:bg-[#00D8F6]/10 text-slate-400 hover:text-[#00D8F6] hover:-translate-y-0.5 hover:shadow-[0_0_12px_rgba(0,216,255,0.35)] transition-all flex items-center justify-center"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a
              href="mailto:avishekamin207@gmail.com"
              aria-label="Email"
              className="size-8 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-[#00D8F6] hover:bg-[#00D8F6]/10 text-slate-400 hover:text-[#00D8F6] hover:-translate-y-0.5 hover:shadow-[0_0_12px_rgba(0,216,255,0.35)] transition-all flex items-center justify-center"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </a>
          </div>

          {/* Center Aligned: Copyright */}
          <div className="text-center font-normal text-slate-400 flex-1 whitespace-nowrap">
            © 2026 Connekt. All rights reserved.
          </div>

          {/* Right Aligned: Links */}
          <div className="flex items-center gap-2.5 justify-center md:justify-end flex-1 whitespace-nowrap">
            <Link to={ROUTES.PRIVACY} className="hover:text-[#00D8F6] transition-colors">
              Terms &amp; Privacy
            </Link>
            <span className="text-slate-600">•</span>
            <Link to={ROUTES.ABOUT} className="hover:text-[#00D8F6] transition-colors">
              About Us
            </Link>
            <span className="text-slate-600">•</span>
            <Link to={ROUTES.CONTACT} className="hover:text-[#00D8F6] transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
