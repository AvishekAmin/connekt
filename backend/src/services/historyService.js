import { Meeting } from "../models/meeting.model.js";
import { AppError } from "../utils/AppError.js";

export const getUserMeetings = async (username) => {
  const meetings = await Meeting.find({ user_id: username });
  return meetings;
};

export const addMeetingToHistory = async (username, meetingCode) => {
  if (!meetingCode) {
    throw new AppError("Meeting code is required", 400);
  }

  const newMeeting = new Meeting({
    user_id: username,
    meetingCode: meetingCode,
  });

  await newMeeting.save();
  return { message: "Added code to history" };
};
