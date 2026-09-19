import express from "express";
import {
  deleteConversation,
  getConversation,
  listConversations,
  removeProductFromConversation,
} from "../controllers/conversation.controller.js";

const router = express.Router();

router.get("/", listConversations);
router.get("/:conversationId", getConversation);
router.delete("/:conversationId", deleteConversation);
router.delete("/:conversationId/products/:productId", removeProductFromConversation);

export default router;
