import httpStatus from "http-status";
import { addMeetingToHistory, getUserMeetings } from "../services/historyService.js";

const getUserHistory = async (req, res) => {
  const meetings = await getUserMeetings(req.user.username);
  return res.status(httpStatus.OK).json(meetings);
};

const addToHistory = async (req, res) => {
  const { meeting_code } = req.body;
  const result = await addMeetingToHistory(req.user.username, meeting_code);
  return res.status(httpStatus.CREATED).json(result);
};

export { getUserHistory, addToHistory };
