import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { ROUTES } from "@/constants/routes";
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

  return (
    <div className="min-h-screen bg-[#050814] text-white flex flex-col selection:bg-[#00D8F6]/20 selection:text-[#00D8F6]">
      {/* Sticky Navbar */}
      <Navbar showAuth={true} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-[#00D8F6]/10 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-1/3 left-1/3 w-[320px] h-[320px] bg-[#7B61FF]/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Hero Copy */}
              <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
                  Connekt with your{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D8F6] via-[#6366F1] to-[#EC4899]">
                    Loved Ones
                  </span>
                </h1>

                <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start pt-2">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#00D8F6] to-[#7B61FF] text-black font-bold px-8 h-12 shadow-xl shadow-cyan-500/25 hover:brightness-110 gap-2 text-base rounded-full"
                    onClick={() => navigate(ROUTES.AUTH)}
                  >
                    <span>Get Started — It's Free</span>
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
    </div>
  );
}
