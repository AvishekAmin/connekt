import express from "express";
import { createServer } from "node:http";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { config } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { connectToSocket } from "./sockets/socketManager.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import userRoutes from "./routes/users.routes.js";
import authRoutes from "./routes/auth.routes.js";
import healthRoutes from "./routes/health.routes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

// Trust proxy for Render deployment (needed for rate limiter and req.ip)
app.set("trust proxy", 1);
app.set("port", config.port);

// Security headers
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS with credentials and origin whitelist
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://localhost:3000",
  "https://connekt-avishek.onrender.com",
  config.frontendUrl,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

// Body parsing & cookies
app.use(cookieParser());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// Routes
app.use("/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", apiLimiter, userRoutes);

// Centralized error handler
app.use(errorHandler);

const start = async () => {
  await connectDatabase();

  if (process.env.NODE_ENV !== "test") {
    server.listen(app.get("port"), () => {
      console.log(`Server is listening on port ${app.get("port")}`);
    });
  }
};

start();

export { app, server, io };
