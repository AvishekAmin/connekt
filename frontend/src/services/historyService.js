import apiClient from "./api";

export const getUserHistory = async (token) => {
  const response = await apiClient.get("/api/v1/users/get_all_activity", {
    params: { token },
  });
  return response.data;
};

export const addMeetingToHistory = async (token, meetingCode) => {
  const response = await apiClient.post("/api/v1/users/add_to_activity", {
    token,
    meeting_code: meetingCode,
  });
  return response.data;
};
