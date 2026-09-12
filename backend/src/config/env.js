import "dotenv/config";

export const config = {
  port: process.env.PORT || 8080,
  mongoUri: process.env.MONGO_URI,
  nodeEnv: process.env.NODE_ENV || "development",

  // JWT
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret-change-in-production-min32chars",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-in-production-min32chars",
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
  jwtRefreshExpiryMs: 7 * 24 * 60 * 60 * 1000,

  // Frontend URL for CORS
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
};
