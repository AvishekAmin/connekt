import { createContext, useState, useEffect, useCallback } from "react";
import { setApiAccessToken, clearApiAccessToken } from "@/services/api";
import {
  refreshToken as refreshTokenService,
  getMe,
} from "@/services/authService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const setAuthData = useCallback((accessToken, userData) => {
    setApiAccessToken(accessToken);
    setUser(userData);
    setIsAuthenticated(true);
    setIsLoggingOut(false);
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
        if (data?.accessToken) {
          setApiAccessToken(data.accessToken);
          try {
            const meData = await getMe();
            if (mounted && meData) {
              setUser(meData);
            }
          } catch (meErr) {
            console.warn("Could not retrieve user profile during silent refresh:", meErr);
          }
          if (mounted) {
            setIsAuthenticated(true);
          }
        }
      } catch {
        // No valid refresh token — user is not authenticated
        if (mounted) {
          clearApiAccessToken();
          setIsAuthenticated(false);
          setUser(null);
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
    isLoggingOut,
    setIsLoggingOut,
    setAuthData,
    clearAuthData,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
