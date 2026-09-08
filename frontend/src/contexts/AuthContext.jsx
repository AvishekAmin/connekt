import axios from "axios";
import { createContext, useState } from "react";

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: "http://localhost:8080/api/v1/users",
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);

  const handleRegister = async (name, username, password) => {
    const request = await client.post("/register", {
      name,
      username,
      password,
    });

    if (request.status === 201) {
      return request.data.message;
    }
  };

  const handleLogin = async (username, password) => {
    const request = await client.post("/login", {
      username,
      password,
    });

    if (request.status === 200) {
      localStorage.setItem("token", request.data.token);
    }
  };

  const data = {
    userData,
    setUserData,
    handleRegister,
    handleLogin,
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};
