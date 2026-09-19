import * as chatService from "../services/chat.service.js";

export const chatWithAI = async (req, res, next) => {
  const { products, history } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({
      message: "At least one product is required in the products array.",
    });
  }

  if (!history || !Array.isArray(history) || history.length === 0) {
    return res.status(400).json({
      message: "Message history array is required.",
    });
  }

  // Stream the reply to the client as Server-Sent Events so tokens render
  // as they arrive instead of waiting for the full response.
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  try {
    for await (const textChunk of chatService.streamMultiProductChat(
      products,
      history,
    )) {
      res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
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
