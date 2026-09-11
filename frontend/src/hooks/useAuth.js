import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { loginUser, registerUser } from "@/services/authService";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const { token, isAuthenticated, setAuthToken, clearAuthToken } = context;

  const login = async (username, password) => {
    const data = await loginUser(username, password);
    if (data?.token) {
      setAuthToken(data.token);
    }
    return data;
  };

  const register = async (name, username, password) => {
    return await registerUser(name, username, password);
  };

  const logout = () => {
    clearAuthToken();
  };

  return {
    token,
    isAuthenticated,
    login,
    register,
    logout,
    // Aliases for atomic migration safety
    handleLogin: login,
    handleRegister: register,
  };
};
