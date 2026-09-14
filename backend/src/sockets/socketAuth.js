import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export const socketAuthMiddleware = (socket, next) => {
  const tokenHeader =
    socket.handshake.auth?.token || socket.handshake.headers?.authorization;

  if (!tokenHeader || !tokenHeader.startsWith("Bearer ")) {
    const err = new Error(
      "AUTH_REQUIRED: Access token required for real-time connection",
    );
    err.data = { code: "AUTH_REQUIRED" };
    return next(err);
  }

  const token = tokenHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwtAccessSecret);
    socket.user = {
      id: decoded.sub,
      username: decoded.username,
      name: decoded.name,
    };
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      const error = new Error("TOKEN_EXPIRED");
      error.data = { code: "TOKEN_EXPIRED" };
      return next(error);
    }
    const error = new Error("INVALID_TOKEN: Invalid access token");
    error.data = { code: "INVALID_TOKEN" };
    return next(error);
  }
};
