import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Phone,
  MessageSquare,
  ArrowLeft,
  Building,
  Clock,
  MapPin,
  Send,
  CheckCircle,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col selection:bg-[#00D8F6]/20 selection:text-[#00D8F6]">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16 space-y-8">
        <div>
          <Link
            to={ROUTES.LANDING}
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white bg-[#141414] border border-white/10 hover:bg-[#1f1f1f] rounded-full px-4 py-2 w-fit transition-all"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to home</span>
          </Link>
        </div>

        <div className="text-center space-y-3 py-6 relative">
          <div className="size-14 rounded-2xl bg-[#00D8F6]/10 border border-[#00D8F6]/30 text-[#00D8F6] flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/10">
            <Mail className="size-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Get in Touch
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Have a question, feedback, or need technical assistance with your
            video meetings? We'd love to hear from you. Reach out and our team
            will respond promptly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-[#141414] border border-white/10 p-6 text-center space-y-2 hover:border-[#00D8F6]/40 transition-all">
            <div className="size-12 rounded-xl bg-[#00D8F6]/10 text-[#00D8F6] flex items-center justify-center mx-auto">
              <Mail className="size-5" />
            </div>
            <h3 className="text-base font-bold text-white">Email Us</h3>
            <a
              href="mailto:avishekamin207@gmail.com"
              className="text-xs sm:text-sm text-[#00D8F6] hover:underline font-mono"
            >
              avishekamin207@gmail.com
            </a>
            <p className="text-xs text-slate-500">
              Typically respond within 2–4 hours
            </p>
          </div>

          <div className="rounded-2xl bg-[#141414] border border-white/10 p-6 text-center space-y-2 hover:border-[#00D8F6]/40 transition-all">
            <div className="size-12 rounded-xl bg-[#7B61FF]/10 text-[#7B61FF] flex items-center justify-center mx-auto">
              <Phone className="size-5" />
            </div>
            <h3 className="text-base font-bold text-white">Call Us</h3>
            <a
              href="tel:+919876543210"
              className="text-xs sm:text-sm text-[#7B61FF] hover:underline font-mono"
            >
              +91 98765 43210
            </a>
            <p className="text-xs text-slate-500">
              Mon–Sat, 9:00 AM – 8:00 PM IST
            </p>
          </div>

          <div className="rounded-2xl bg-[#141414] border border-white/10 p-6 text-center space-y-2 hover:border-[#00D8F6]/40 transition-all">
            <div className="size-12 rounded-xl bg-[#00E599]/10 text-[#00E599] flex items-center justify-center mx-auto">
              <MessageSquare className="size-5" />
            </div>
            <h3 className="text-base font-bold text-white">Live Support</h3>
            <p className="text-xs sm:text-sm text-[#00E599] font-medium">
              Available 24/7
            </p>
            <p className="text-xs text-slate-500">
              Instant support &amp; room diagnostics
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-[#141414] border border-white/10 p-6 sm:p-10 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Send className="size-6 text-[#00D8F6]" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Send Us a Message
            </h2>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-[#00E599]/10 border border-[#00E599]/30 text-center space-y-3">
              <CheckCircle className="size-10 text-[#00E599] mx-auto" />
              <h3 className="text-lg font-bold text-white">
                Message Sent Successfully!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                Thank you for reaching out. We have received your message and
                our team will get back to you shortly.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubmitted(false)}
                className="rounded-full border-white/10 bg-[#1a1a1a] text-white hover:bg-[#262626] text-xs"
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Full Name <span className="text-[#00D8F6]">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="rounded-xl bg-[#1a1a1a] border-white/10 text-white h-11 text-sm placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-[#00D8F6]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Email Address <span className="text-[#00D8F6]">*</span>
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="rounded-xl bg-[#1a1a1a] border-white/10 text-white h-11 text-sm placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-[#00D8F6]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Subject / Topic <span className="text-[#00D8F6]">*</span>
                </label>
                <select
                  required
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full rounded-xl bg-[#1a1a1a] border border-white/10 text-white h-11 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#00D8F6]"
                >
                  <option value="" disabled>
                    Select a topic
                  </option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Message <span className="text-[#00D8F6]">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tell us how we can help you..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full rounded-xl bg-[#1a1a1a] border border-white/10 text-white p-3 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#00D8F6] resize-y"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="rounded-full bg-gradient-to-r from-[#00D8F6] to-[#7B61FF] text-black font-bold px-8 h-11 shadow-lg shadow-cyan-500/20 hover:brightness-110 gap-2 text-sm transition-all"
              >
                <span>{loading ? "Sending..." : "Send Message"}</span>
                <Send className="size-3.5" />
              </Button>
            </form>
          )}
        </div>

        <div className="rounded-3xl bg-[#141414] border border-white/10 p-6 sm:p-10 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Building className="size-6 text-[#00D8F6]" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Our Office
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#00D8F6] font-semibold">
                <MapPin className="size-4" />
                <span>Headquarters</span>
              </div>
              <p className="text-slate-400 pl-6 leading-relaxed">
                Connekt Technologies Pvt. Ltd.
                <br />
                123 Innovation Drive, 4th Floor
                <br />
                Koramangala, Bengaluru
                <br />
                Karnataka 560001, India
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#00D8F6] font-semibold">
                <Clock className="size-4" />
                <span>Operating Hours</span>
              </div>
              <p className="text-slate-400 pl-6 leading-relaxed">
                <strong className="text-white">Monday – Friday:</strong> 9:00 AM
                – 7:00 PM IST
                <br />
                <strong className="text-white">Saturday:</strong> 10:00 AM –
                5:00 PM IST
                <br />
                <strong className="text-white">Sunday:</strong> Closed
                <br />
                <em className="text-xs text-slate-500">
                  Online support is active 24/7.
                </em>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-400">
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
              <svg
                className="size-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </a>
          </div>

          <div className="text-center font-normal text-slate-400 flex-1 whitespace-nowrap">
            © 2026 Connekt. All rights reserved.
          </div>

          <div className="flex items-center gap-2.5 justify-center md:justify-end flex-1 whitespace-nowrap">
            <Link
              to={ROUTES.PRIVACY}
              className="hover:text-[#00D8F6] transition-colors"
            >
              Terms &amp; Privacy
            </Link>
            <span className="text-slate-600">•</span>
            <Link
              to={ROUTES.ABOUT}
              className="hover:text-[#00D8F6] transition-colors"
            >
              About Us
            </Link>
            <span className="text-slate-600">•</span>
            <Link
              to={ROUTES.CONTACT}
              className="text-[#00D8F6] font-medium transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
