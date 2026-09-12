import apiClient from "./api";

export const getUserHistory = async () => {
  const response = await apiClient.get("/api/v1/users/get_all_activity");
  return response.data;
};

export const addMeetingToHistory = async (meetingCode) => {
  const response = await apiClient.post("/api/v1/users/add_to_activity", {
    meeting_code: meetingCode,
  });
  return response.data;
};
