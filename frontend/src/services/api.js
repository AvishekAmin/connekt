import axios from "axios";
import server from "@/config/environment";

const apiClient = axios.create({
  baseURL: server,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
