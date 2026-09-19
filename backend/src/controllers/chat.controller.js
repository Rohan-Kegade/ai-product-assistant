import * as chatService from "../services/chat.service.js";
import * as conversationService from "../services/conversation.service.js";
import * as productService from "../services/product.service.js";
import * as messageService from "../services/message.service.js";

export const chatWithAI = async (req, res, next) => {
  const { conversationId, message, retry } = req.body;

  if (!conversationId || typeof conversationId !== "string") {
    return res.status(400).json({ message: "conversationId is required." });
  }

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ message: "message is required." });
  }

  let products;
  let history;

  try {
    const conversation =
      await conversationService.getConversationById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    products = await productService.listProductsForConversation(conversationId);

    if (products.length === 0) {
      return res.status(400).json({
        message: "Add at least one product to the conversation before chatting.",
      });
    }

    // Persist the user message first so it is part of the history loaded below
    // (the AI service treats the last history entry as the new question).
    // On retry the question is already stored (a previous attempt failed before
    // any reply was saved), so don't insert it a second time.
    const trimmedMessage = message.trim();
    let stored = await messageService.listMessagesForConversation(conversationId);
    const last = stored[stored.length - 1];
    const isRetryOfLast =
      retry === true && last?.role === "user" && last.content === trimmedMessage;

    if (!isRetryOfLast) {
      await messageService.createMessage(conversationId, "user", trimmedMessage);
      stored = await messageService.listMessagesForConversation(conversationId);
    }

    history = stored;
  } catch (error) {
    console.error("Chat setup failed:", error);

    return res.status(500).json({ message: "Failed to process chat question" });
  }

  // Stream the reply to the client as Server-Sent Events so tokens render
  // as they arrive instead of waiting for the full response.
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  try {
    let fullReply = "";

    for await (const textChunk of chatService.streamMultiProductChat(
      products,
      history,
    )) {
      fullReply += textChunk;
      res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
    }

    // Only a fully completed reply is persisted; on error nothing is saved.
    if (fullReply) {
      await messageService.createMessage(conversationId, "assistant", fullReply);
    }

    res.write(`event: done\ndata: {}\n\n`);
  } catch (error) {
    console.error("Chat request failed:", error);

    res.write(
      `event: error\ndata: ${JSON.stringify({ message: "Failed to process chat question" })}\n\n`,
    );
  } finally {
    res.end();
  }
};
