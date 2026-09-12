import { Router } from "express";
import { login, signup, refresh, logout, me } from "../controllers/auth.controller.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticateToken } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, signupSchema } from "../validators/auth.validator.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/signup", authLimiter, validate(signupSchema), asyncHandler(signup));
router.post("/register", authLimiter, validate(signupSchema), asyncHandler(signup));
router.post("/login", authLimiter, validate(loginSchema), asyncHandler(login));
router.post("/refresh", authLimiter, asyncHandler(refresh));
router.post("/logout", asyncHandler(logout));
router.get("/me", authenticateToken, asyncHandler(me));

export default router;
