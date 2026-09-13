import axios from "axios";
import server from "@/config/environment";

let accessToken = null;
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

const apiClient = axios.create({
  baseURL: server,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor — attach Bearer token
apiClient.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 with silent refresh queue
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Immediate logout & queue rejection on refresh token reuse detection
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "REFRESH_TOKEN_REUSE"
    ) {
      processQueue(error, null);
      accessToken = null;
      window.dispatchEvent(new Event("auth:logout"));
      return Promise.reject(error);
    }

    // Only intercept 401 TOKEN_EXPIRED, and not on the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "TOKEN_EXPIRED" &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/v1/auth/refresh")
    ) {
      if (isRefreshing) {
        // Queue the request while refresh is in-flight
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const data = await executeRefreshToken();
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        accessToken = null;
        // Trigger a custom event so AuthContext can react
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Deduplicated refresh token promise runner
let refreshPromise = null;

export const executeRefreshToken = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await apiClient.post("/api/v1/auth/refresh");
      accessToken = response.data.accessToken;
      return response.data;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// Token accessors for AuthContext
export const setApiAccessToken = (token) => {
  accessToken = token;
};

export const getApiAccessToken = () => accessToken;

export const clearApiAccessToken = () => {
  accessToken = null;
};

export default apiClient;
