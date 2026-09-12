import { createContext, useState, useEffect, useCallback } from "react";
import { setApiAccessToken, clearApiAccessToken } from "@/services/api";
import { refreshToken as refreshTokenService } from "@/services/authService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const setAuthData = useCallback((accessToken, userData) => {
    setApiAccessToken(accessToken);
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const clearAuthData = useCallback(() => {
    clearApiAccessToken();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Silent refresh on boot — try to get a new access token from the HTTP-only cookie
  useEffect(() => {
    let mounted = true;

    const silentRefresh = async () => {
      try {
        const data = await refreshTokenService();
        if (mounted && data.accessToken) {
          setApiAccessToken(data.accessToken);
          setIsAuthenticated(true);
          // We don't have user data from refresh — we'll get it via /me or next login
          // For now, mark as authenticated; useAuth will fill user data
        }
      } catch {
        // No valid refresh token — user is not authenticated
        if (mounted) {
          clearApiAccessToken();
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    silentRefresh();

    return () => {
      mounted = false;
    };
  }, []);

  // Listen for forced logout from Axios interceptor
  useEffect(() => {
    const handleLogout = () => {
      clearAuthData();
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, [clearAuthData]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    setAuthData,
    clearAuthData,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
