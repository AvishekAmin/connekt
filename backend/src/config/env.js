import "dotenv/config";

export const config = {
  port: process.env.PORT || 8080,
  mongoUri: process.env.MONGO_URI,
  nodeEnv: process.env.NODE_ENV || "development",

  jwtAccessSecret:
    process.env.JWT_ACCESS_SECRET ||
    "dev-access-secret-change-in-production-min32chars",
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ||
    "dev-refresh-secret-change-in-production-min32chars",
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
  jwtRefreshExpiryMs: 7 * 24 * 60 * 60 * 1000,

  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  webrtcStunUrl: process.env.WEBRTC_STUN_URL || "stun:stun.l.google.com:19302",
  webrtcTurnUrl: process.env.WEBRTC_TURN_URL || "",
  webrtcTurnUsername: process.env.WEBRTC_TURN_USERNAME || "",
  webrtcTurnCredential: process.env.WEBRTC_TURN_CREDENTIAL || "",
};
