import express from "express";
import {
  getConversation,
  removeProductFromConversation,
} from "../controllers/conversation.controller.js";

const router = express.Router();

router.get("/:conversationId", getConversation);
router.delete("/:conversationId/products/:productId", removeProductFromConversation);

export default router;
