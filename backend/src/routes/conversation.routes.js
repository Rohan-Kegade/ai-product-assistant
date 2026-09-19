import express from "express";
import { removeProductFromConversation } from "../controllers/conversation.controller.js";

const router = express.Router();

router.delete("/:conversationId/products/:productId", removeProductFromConversation);

export default router;
