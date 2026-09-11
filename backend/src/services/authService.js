import bcrypt from "bcrypt";
import crypto from "crypto";
import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";

export const registerUser = async (name, username, password) => {
  if (!name || !username || !password) {
    throw new AppError("Please provide all required fields", httpStatus.BAD_REQUEST);
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new AppError("User already exists", httpStatus.CONFLICT);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    name,
    username,
    password: hashedPassword,
  });

  await newUser.save();
  return { message: "User signed up successfully" };
};

export const authenticateUser = async (username, password) => {
  if (!username || !password) {
    throw new AppError("Please provide username and password", httpStatus.BAD_REQUEST);
  }

  const user = await User.findOne({ username });
  if (!user) {
    throw new AppError("User Not Found", httpStatus.NOT_FOUND);
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new AppError("Invalid Username or Password", httpStatus.UNAUTHORIZED);
  }

  const token = crypto.randomBytes(20).toString("hex");
  user.token = token;
  await user.save();

  return { token };
};
