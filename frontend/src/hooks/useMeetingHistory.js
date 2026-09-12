import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { getUserHistory, addMeetingToHistory } from "@/services/historyService";

export const useMeetingHistory = () => {
  const { isAuthenticated } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) {
      setMeetings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getUserHistory();
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
  }, [isAuthenticated]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const addToHistory = async (meetingCode) => {
    if (!isAuthenticated || !meetingCode) return;
    try {
      await addMeetingToHistory(meetingCode);
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
