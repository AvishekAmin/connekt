import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { ROUTES } from "@/constants/routes";
import {
  Video,
  ArrowLeft,
  Target,
  BookOpen,
  Heart,
  ShieldCheck,
  Zap,
  Users,
  Sparkles,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050814] text-white flex flex-col selection:bg-[#00D8F6]/20 selection:text-[#00D8F6]">
      {/* Navbar */}
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            to={ROUTES.LANDING}
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white bg-[#0D1527] border border-[#1E2B4D] hover:bg-[#131D36] rounded-full px-4 py-2 w-fit transition-all"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to home</span>
          </Link>
        </div>

        {/* Hero Header */}
        <div className="text-center space-y-3 py-6 relative">
          <div className="size-14 rounded-2xl bg-[#00D8F6]/10 border border-[#00D8F6]/30 text-[#00D8F6] flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/10">
            <Video className="size-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            About Connekt
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Redefining modern video meetings with instant browser-based WebRTC connectivity. Seamless, private, and built for real-time collaboration.
          </p>
        </div>

        {/* Our Story */}
        <div className="rounded-3xl bg-[#0D1527] border border-[#1E2B4D] p-6 sm:p-10 shadow-xl space-y-4">
          <div className="flex items-center gap-3 border-b border-[#1E2B4D] pb-4">
            <BookOpen className="size-6 text-[#00D8F6]" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">Our Story</h2>
          </div>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Connekt was created with a clear and ambitious vision: to eliminate the friction, bloated installers, and privacy concerns of legacy video conferencing platforms. We believed that connecting face-to-face with friends, colleagues, and loved ones should happen instantly within any web browser — without downloading heavy desktop clients, fighting paywalls, or compromising on security.
          </p>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Engineered with modern full-mesh WebRTC protocols, secure WebSocket signaling, and authenticated session management, Connekt routes media streams directly between peers. The result is ultra-low latency audio, crisp high-definition video, fluid screen sharing, and real-time messaging that just works.
          </p>
        </div>

        {/* Our Mission */}
        <div className="rounded-3xl bg-[#0D1527] border border-[#1E2B4D] p-6 sm:p-10 shadow-xl space-y-4">
          <div className="flex items-center gap-3 border-b border-[#1E2B4D] pb-4">
            <Target className="size-6 text-[#7B61FF]" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">Our Mission</h2>
          </div>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Our mission is to make seamless, high-fidelity real-time communication accessible to everyone worldwide. Whether you are running a quick team standup, presenting a project screen share, or catching up across continents, Connekt delivers a lightweight, reliable, and privacy-preserving room at the click of a button.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-[#0D1527] border border-[#1E2B4D] p-6 text-center space-y-1 hover:border-[#00D8F6]/40 transition-all">
            <span className="text-3xl font-extrabold text-[#00D8F6] font-mono">&lt; 50ms</span>
            <p className="text-xs text-slate-400 font-medium">Peer Latency</p>
          </div>
          <div className="rounded-2xl bg-[#0D1527] border border-[#1E2B4D] p-6 text-center space-y-1 hover:border-[#00D8F6]/40 transition-all">
            <span className="text-3xl font-extrabold text-[#00D8F6] font-mono">99.99%</span>
            <p className="text-xs text-slate-400 font-medium">Signaling Uptime</p>
          </div>
          <div className="rounded-2xl bg-[#0D1527] border border-[#1E2B4D] p-6 text-center space-y-1 hover:border-[#00D8F6]/40 transition-all">
            <span className="text-3xl font-extrabold text-[#00D8F6] font-mono">100k+</span>
            <p className="text-xs text-slate-400 font-medium">Video Minutes</p>
          </div>
          <div className="rounded-2xl bg-[#0D1527] border border-[#1E2B4D] p-6 text-center space-y-1 hover:border-[#00D8F6]/40 transition-all">
            <span className="text-3xl font-extrabold text-[#00D8F6] font-mono">0</span>
            <p className="text-xs text-slate-400 font-medium">Installs Needed</p>
          </div>
        </div>

        {/* Core Values */}
        <div className="rounded-3xl bg-[#0D1527] border border-[#1E2B4D] p-6 sm:p-10 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-[#1E2B4D] pb-4">
            <Heart className="size-6 text-[#EC4899]" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">Our Values</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Every feature we design is driven by principles of privacy, speed, and intuitive user experience.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-[#131D36]/60 border border-[#1E2B4D] p-5 space-y-2 hover:border-[#00D8F6]/40 transition-all">
              <div className="size-10 rounded-xl bg-[#00D8F6]/10 text-[#00D8F6] flex items-center justify-center">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="text-base font-bold text-white">Privacy by Default</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Direct peer-to-peer encrypted media streams (DTLS/SRTP). Your conversations are never stored or inspected on central video servers.
              </p>
            </div>

            <div className="rounded-2xl bg-[#131D36]/60 border border-[#1E2B4D] p-5 space-y-2 hover:border-[#00D8F6]/40 transition-all">
              <div className="size-10 rounded-xl bg-[#7B61FF]/10 text-[#7B61FF] flex items-center justify-center">
                <Zap className="size-5" />
              </div>
              <h3 className="text-base font-bold text-white">Instant &amp; Frictionless</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                No apps to download, no plugins to configure. Generate a room code or link and jump on a call in seconds.
              </p>
            </div>

            <div className="rounded-2xl bg-[#131D36]/60 border border-[#1E2B4D] p-5 space-y-2 hover:border-[#00D8F6]/40 transition-all">
              <div className="size-10 rounded-xl bg-[#00E599]/10 text-[#00E599] flex items-center justify-center">
                <Users className="size-5" />
              </div>
              <h3 className="text-base font-bold text-white">Human Connection</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Clear audio, high frame-rate screen sharing, and adaptive video layout designed to keep the focus on people.
              </p>
            </div>

            <div className="rounded-2xl bg-[#131D36]/60 border border-[#1E2B4D] p-5 space-y-2 hover:border-[#00D8F6]/40 transition-all">
              <div className="size-10 rounded-xl bg-[#EC4899]/10 text-[#EC4899] flex items-center justify-center">
                <Sparkles className="size-5" />
              </div>
              <h3 className="text-base font-bold text-white">Continuous Innovation</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                W3C Perfect Negotiation, intelligent bandwidth management, and token reuse detection built on enterprise-grade web engineering.
              </p>
            </div>
          </div>
        </div>

        {/* Meet the Team */}
        <div className="rounded-3xl bg-[#0D1527] border border-[#1E2B4D] p-6 sm:p-10 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-[#1E2B4D] pb-4">
            <Users className="size-6 text-[#00D8F6]" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">Meet the Creator</h2>
          </div>
          <div className="max-w-md mx-auto p-6 rounded-2xl bg-[#131D36]/60 border border-[#1E2B4D] text-center space-y-3 hover:border-[#00D8F6]/40 transition-all">
            <div className="size-16 rounded-full bg-gradient-to-tr from-[#00D8F6] to-[#7B61FF] text-black font-extrabold text-xl flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
              AA
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Avishek Amin</h3>
              <p className="text-xs text-[#00D8F6] font-medium">Founder &amp; Full Stack Architect</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Passionate about building responsive, real-time web platforms, modern distributed architectures, and intuitive collaborative user interfaces.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
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
            <Link to={ROUTES.ABOUT} className="text-[#00D8F6] font-medium transition-colors">
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
