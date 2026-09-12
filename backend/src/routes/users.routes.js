import { Router } from "express";
import { addToHistory, getUserHistory } from "../controllers/user.controller.js";
import { login, signup } from "../controllers/auth.controller.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticateToken } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, signupSchema, addToHistorySchema } from "../validators/auth.validator.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Backward-compatible aliases — redirect to auth controller
router.route("/login").post(authLimiter, validate(loginSchema), asyncHandler(login));
router.route("/signup").post(authLimiter, validate(signupSchema), asyncHandler(signup));
router.route("/register").post(authLimiter, validate(signupSchema), asyncHandler(signup));

// Protected history routes — require valid JWT
router
  .route("/add_to_activity")
  .post(authenticateToken, validate(addToHistorySchema), asyncHandler(addToHistory));
router
  .route("/get_all_activity")
  .get(authenticateToken, asyncHandler(getUserHistory));

export default router;
