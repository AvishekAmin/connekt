import mongoose from "mongoose";
import { config } from "./env.js";

export const connectDatabase = async () => {
  const connectionDb = await mongoose.connect(config.mongoUri);
  console.log(`MONGO connected DB Host: ${connectionDb.connection.host}`);
  return connectionDb;
};
