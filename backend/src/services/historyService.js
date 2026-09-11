import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import { Meeting } from "../models/meeting.model.js";
import { AppError } from "../utils/AppError.js";

export const getUserMeetings = async (token) => {
  if (!token) {
    throw new AppError("Authentication token required", httpStatus.UNAUTHORIZED);
  }

  const user = await User.findOne({ token });
  if (!user) {
    throw new AppError("Invalid or expired token", httpStatus.UNAUTHORIZED);
  }

  const meetings = await Meeting.find({ user_id: user.username });
  return meetings;
};

export const addMeetingToHistory = async (token, meetingCode) => {
  if (!token) {
    throw new AppError("Authentication token required", httpStatus.UNAUTHORIZED);
  }

  if (!meetingCode) {
    throw new AppError("Meeting code is required", httpStatus.BAD_REQUEST);
  }

  const user = await User.findOne({ token });
  if (!user) {
    throw new AppError("Invalid or expired token", httpStatus.UNAUTHORIZED);
  }

  const newMeeting = new Meeting({
    user_id: user.username,
    meetingCode: meetingCode,
  });

  await newMeeting.save();
  return { message: "Added code to history" };
};
