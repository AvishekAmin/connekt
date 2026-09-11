import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { getUserHistory, addMeetingToHistory } from "@/services/historyService";

export const useMeetingHistory = () => {
  const { token } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = useCallback(async () => {
    if (!token) {
      setMeetings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getUserHistory(token);
      if (Array.isArray(data)) {
        setMeetings([...data].reverse());
      } else {
        setMeetings([]);
      }
    } catch (err) {
      console.error("Failed to load meeting history:", err);
      setError("Failed to load your meeting history. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const addToHistory = async (meetingCode) => {
    if (!token || !meetingCode) return;
    try {
      await addMeetingToHistory(token, meetingCode);
    } catch (err) {
      console.error("Failed to add meeting to history:", err);
    }
  };

  return {
    meetings,
    loading,
    error,
    refetch: fetchHistory,
    addToHistory,
  };
};
