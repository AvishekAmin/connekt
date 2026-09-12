import {
  authenticateUser,
  signupUser,
  refreshAccessToken,
  logoutUser,
  getCurrentUser,
} from "../services/authService.js";

export const login = async (req, res) => {
  const { username, password } = req.body;
  const result = await authenticateUser(username, password, req, res);
  return res.status(200).json(result);
};

export const signup = async (req, res) => {
  const { name, username, password } = req.body;
  const result = await signupUser(name, username, password);
  return res.status(201).json(result);
};

export const refresh = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  const result = await refreshAccessToken(refreshToken, req, res);
  return res.status(200).json(result);
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  const result = await logoutUser(refreshToken, res);
  return res.status(200).json(result);
};

export const me = async (req, res) => {
  const user = await getCurrentUser(req.user.id);
  return res.status(200).json(user);
};
