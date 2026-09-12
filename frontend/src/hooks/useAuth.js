import { useContext, useCallback } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { loginUser, signupUser, logoutUser, getMe } from "@/services/authService";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const { user, isAuthenticated, isLoading, setAuthData, clearAuthData, setUser } = context;

  const login = useCallback(async (username, password) => {
    const data = await loginUser(username, password);
    if (data?.accessToken) {
      setAuthData(data.accessToken, data.user);
    }
    return data;
  }, [setAuthData]);

  const signup = useCallback(async (name, username, password) => {
    return await signupUser(name, username, password);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Even if the server call fails, clear local state
    }
    clearAuthData();
  }, [clearAuthData]);

  const fetchUser = useCallback(async () => {
    try {
      const userData = await getMe();
      setUser(userData);
      return userData;
    } catch {
      return null;
    }
  }, [setUser]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    fetchUser,
    // Aliases for backward compatibility
    handleLogin: login,
    handleSignup: signup,
  };
};
