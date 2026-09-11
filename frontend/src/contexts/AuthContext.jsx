import { createContext, useState } from "react";
import { STORAGE_KEYS } from "@/constants/routes";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN) || null;
  });

  const setAuthToken = (newToken) => {
    if (newToken) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
      setToken(newToken);
    } else {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      setToken(null);
    }
  };

  const clearAuthToken = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    setToken(null);
  };

  const value = {
    token,
    isAuthenticated: Boolean(token),
    setAuthToken,
    clearAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
