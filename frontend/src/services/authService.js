import apiClient from "./api";

export const signupUser = async (name, username, password) => {
  const response = await apiClient.post("/api/v1/auth/signup", {
    name,
    username,
    password,
  });
  return response.data.message;
};

export const loginUser = async (username, password) => {
  const response = await apiClient.post("/api/v1/auth/login", {
    username,
    password,
  });
  return response.data;
};

export const refreshToken = async () => {
  const response = await apiClient.post("/api/v1/auth/refresh");
  return response.data;
};

export const logoutUser = async () => {
  const response = await apiClient.post("/api/v1/auth/logout");
  return response.data;
};

export const getMe = async () => {
  const response = await apiClient.get("/api/v1/auth/me");
  return response.data;
};
