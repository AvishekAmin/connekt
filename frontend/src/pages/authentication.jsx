import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Loader2,
} from "lucide-react";

export default function Authentication() {
  const navigate = useNavigate();
  const { handleRegister, handleLogin } = useContext(AuthContext);

  const [formState, setFormState] = useState(0); // 0 = Login, 1 = Sign Up
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      if (formState === 0) {
        await handleLogin(username, password);
        navigate("/home");
      } else {
        const result = await handleRegister(name, username, password);
        setUsername("");
        setPassword("");
        setName("");
        setSuccessMessage(result || "Account created successfully! You can now log in.");
        setFormState(0);
      }
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message || "Something went wrong. Please check your credentials.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050814] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-[#00D8F6]/20 selection:text-[#00D8F6]">
      {/* Subtle Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#00D8F6]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] bg-[#7B61FF]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Navigation Bar */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white bg-[#0D1527] border border-[#1E2B4D] hover:bg-[#131D36] rounded-full px-4 py-2 transition-all"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to home</span>
        </Link>

        {/* Brand Logo in header */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/favicon.svg"
            alt="Connekt"
            className="size-7 rounded-md"
          />
          <span className="font-bold text-lg text-white">Connekt</span>
        </Link>
      </div>

      {/* Center Auth Card Modal */}
      <div className="w-full max-w-md mx-auto my-8">
        <div className="bg-[#0D1527]/95 border border-[#1E2B4D] rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black/80 backdrop-blur-md">
          {/* Brand Wordmark with Havenly multi-color gradient */}
          <div className="text-center space-y-1 mb-6">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#00D8F6] via-[#6366F1] to-[#EC4899]">
              Connekt
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white pt-2">
              {formState === 0 ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 pt-1">
              {formState === 0
                ? "Enter your credentials to access your meetings"
                : "Fill in the information below to get started with Connekt"}
            </p>
          </div>

          {/* Segmented Capsule Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#0A1020] rounded-full border border-[#1E2B4D] mb-6">
            <button
              type="button"
              className={`py-2 text-xs sm:text-sm font-bold rounded-full transition-all ${
                formState === 0
                  ? "bg-gradient-to-r from-[#00D8F6] to-[#7B61FF] text-black shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
              onClick={() => {
                setFormState(0);
                setError("");
                setSuccessMessage("");
              }}
            >
              Login
            </button>
            <button
              type="button"
              className={`py-2 text-xs sm:text-sm font-bold rounded-full transition-all ${
                formState === 1
                  ? "bg-gradient-to-r from-[#00D8F6] to-[#7B61FF] text-black shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
              onClick={() => {
                setFormState(1);
                setError("");
                setSuccessMessage("");
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Success Alert */}
          {successMessage && (
            <div className="mb-4 p-3.5 rounded-2xl border border-[#00E599]/30 bg-[#052E16]/70 text-[#00E599] text-xs sm:text-sm flex items-start gap-2.5">
              <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3.5 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Actual Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {formState === 1 && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Full Name
                </label>
                <Input
                  required
                  type="text"
                  placeholder="e.g. Alex Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="bg-[#131D36] border-[#1E2B4D] focus-visible:ring-1 focus-visible:ring-[#00D8F6] focus-visible:border-[#00D8F6] rounded-xl h-11 text-sm text-white placeholder:text-slate-500"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Username
              </label>
              <Input
                required
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="bg-[#131D36] border-[#1E2B4D] focus-visible:ring-1 focus-visible:ring-[#00D8F6] focus-visible:border-[#00D8F6] rounded-xl h-11 text-sm text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-[#131D36] border-[#1E2B4D] focus-visible:ring-1 focus-visible:ring-[#00D8F6] focus-visible:border-[#00D8F6] rounded-xl h-11 pr-10 text-sm text-white placeholder:text-slate-500"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Gradient Pill Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-gradient-to-r from-[#00D8F6] to-[#7B61FF] text-black font-bold h-12 shadow-lg shadow-cyan-500/25 hover:brightness-110 text-sm sm:text-base gap-2 mt-4 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin text-black" />
                  <span>{formState === 0 ? "Logging in..." : "Signing up..."}</span>
                </>
              ) : (
                <span>{formState === 0 ? "Login" : "Sign Up"}</span>
              )}
            </Button>
          </form>

          {/* Footer toggle */}
          <div className="mt-6 text-center text-xs sm:text-sm text-slate-400">
            {formState === 0 ? (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setFormState(1);
                    setError("");
                    setSuccessMessage("");
                  }}
                  className="text-[#00D8F6] font-bold hover:underline focus:outline-none"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setFormState(0);
                    setError("");
                    setSuccessMessage("");
                  }}
                  className="text-[#00D8F6] font-bold hover:underline focus:outline-none"
                >
                  Login
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom subtle copyright */}
      <div className="text-center text-xs text-slate-500 py-2">
        Protected by Connekt real-time platform security
      </div>
    </div>
  );
}
