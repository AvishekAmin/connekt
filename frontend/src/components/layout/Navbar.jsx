import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { History, LogOut } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar({ showAuth = false, showAppNav = false }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.AUTH);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1E2B4D] bg-[#050814]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to={showAppNav ? ROUTES.HOME : ROUTES.LANDING}
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full px-2 py-1 transition-all"
        >
          <img
            src="/favicon.svg"
            alt="Connekt Logo"
            className="size-8 sm:size-9 rounded-lg group-hover:scale-105 transition-transform"
          />
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-white">
              Connekt
            </span>
            <span className="size-1.5 rounded-full bg-[#00D8F6] animate-pulse shadow-[0_0_8px_#00D8F6]" />
          </div>
        </Link>

        {/* Right Navigation */}
        <nav className="flex items-center gap-2.5 sm:gap-3">
          {showAuth && (
            <Button
              variant="outline"
              size="sm"
              className="border-[#1E2B4D] bg-[#0D1527] hover:bg-[#131D36] text-white text-xs font-semibold px-5 rounded-full shadow-sm"
              onClick={() => navigate(ROUTES.AUTH)}
            >
              Login
            </Button>
          )}

          {showAppNav && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="border-[#1E2B4D] bg-[#0D1527] hover:bg-[#131D36] text-slate-200 hover:text-white rounded-full px-4 text-xs font-medium gap-2"
                onClick={() => navigate(ROUTES.HISTORY)}
              >
                <History className="size-3.5 text-[#00D8F6]" />
                <span className="hidden sm:inline">Meeting History</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="border-[#1E2B4D] bg-[#131D36] hover:bg-red-950/40 hover:text-red-400 hover:border-red-500/30 text-slate-300 rounded-full px-3.5 text-xs font-medium gap-1.5 transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
