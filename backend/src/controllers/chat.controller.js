import * as chatService from "../services/chat.service.js";

export const chatWithAI = async (req, res, next) => {
  try {
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

    const reply = await chatService.processMultiProductChat(products, history);

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat request failed:", error);

    return res.status(500).json({
      message: "Failed to process chat question",
    });
  }
};
