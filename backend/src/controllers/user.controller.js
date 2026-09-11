import httpStatus from "http-status";
import { authenticateUser, registerUser } from "../services/authService.js";
import { addMeetingToHistory, getUserMeetings } from "../services/historyService.js";

const login = async (req, res) => {
  const { username, password } = req.body;
  const result = await authenticateUser(username, password);
  return res.status(httpStatus.OK).json(result);
};

const register = async (req, res) => {
  const { name, username, password } = req.body;
  const result = await registerUser(name, username, password);
  return res.status(httpStatus.CREATED).json(result);
};

const signUp = register;

const getUserHistory = async (req, res) => {
  const { token } = req.query;
  const meetings = await getUserMeetings(token);
  return res.status(httpStatus.OK).json(meetings);
};

const addToHistory = async (req, res) => {
  const { token, meeting_code } = req.body;
  const result = await addMeetingToHistory(token, meeting_code);
  return res.status(httpStatus.CREATED).json(result);
};

export { login, register, signUp, getUserHistory, addToHistory };
