import { Router } from "express";
import {
  addToHistory,
  getUserHistory,
  login,
  register,
} from "../controllers/user.controller.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.route("/login").post(asyncHandler(login));
router.route("/signup").post(asyncHandler(register));
router.route("/register").post(asyncHandler(register));
router.route("/add_to_activity").post(asyncHandler(addToHistory));
router.route("/get_all_activity").get(asyncHandler(getUserHistory));

export default router;
