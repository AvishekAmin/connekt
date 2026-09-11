import apiClient from "./api";

export const registerUser = async (name, username, password) => {
  const response = await apiClient.post("/api/v1/users/register", {
    name,
    username,
    password,
  });
  return response.data.message;
};

export const loginUser = async (username, password) => {
  const response = await apiClient.post("/api/v1/users/login", {
    username,
    password,
  });
  return response.data;
};
