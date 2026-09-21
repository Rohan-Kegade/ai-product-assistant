import express from "express";
import { streamChatReply } from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/", streamChatReply);

export default router;
