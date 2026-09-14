import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  username: z
    .string({ required_error: "Username is required" })
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least 1 letter")
    .regex(/[0-9]/, "Password must contain at least 1 number"),
});

export const loginSchema = z.object({
  username: z
    .string({ required_error: "Username is required" })
    .min(1, "Username is required"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

export const addToHistorySchema = z.object({
  meeting_code: z
    .string({ required_error: "Meeting code is required" })
    .trim()
    .min(3, "Meeting code must be at least 3 characters")
    .max(50, "Meeting code must be at most 50 characters")
    .regex(
      /^[a-zA-Z0-9-]+$/,
      "Meeting code can only contain letters, numbers, and dashes",
    ),
});
