import express from "express";
import { createServer } from "node:http";
import cors from "cors";
import { config } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { connectToSocket } from "./sockets/socketManager.js";
import { errorHandler } from "./middleware/errorHandler.js";
import userRoutes from "./routes/users.routes.js";
import healthRoutes from "./routes/health.routes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", config.port);
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/health", healthRoutes);
app.use("/api/v1/users", userRoutes);

app.use(errorHandler);

const start = async () => {
  await connectDatabase();

  server.listen(app.get("port"), () => {
    console.log(`Server is listening on port ${app.get("port")}`);
  });
};

start();

export { app, server, io };
