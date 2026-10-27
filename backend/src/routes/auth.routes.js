import express from "express";
import {
  getCurrentUser,
  login,
  logout,
  signup,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireAuth, getCurrentUser);

export default router;
