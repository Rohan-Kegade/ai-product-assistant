import * as conversationService from "../services/conversation.service.js";
import * as productService from "../services/product.service.js";
import * as messageService from "../services/message.service.js";

export const removeProductFromConversation = async (req, res, next) => {
  try {
    const { conversationId, productId } = req.params;

    const numericProductId = Number(productId);

    if (!Number.isInteger(numericProductId)) {
      return res.status(400).json({ message: "productId must be an integer" });
    }

    const conversation = await conversationService.getConversationById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    await productService.unlinkProductFromConversation(
      conversationId,
      numericProductId,
    );

    return res.status(204).send();
  } catch (error) {
    console.error("Failed to remove product from conversation:", error);

    return res.status(500).json({
      message: "Failed to remove product from conversation",
    });
  }
};

export const listConversations = async (req, res, next) => {
  try {
    const conversations = await conversationService.listConversations();

    return res.status(200).json({ conversations });
  } catch (error) {
    console.error("Failed to list conversations:", error);

    return res.status(500).json({ message: "Failed to list conversations" });
  }
};

export const deleteConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const conversation = await conversationService.getConversationById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // FKs cascade: removes the join rows and messages, keeps products rows.
    await conversationService.deleteConversation(conversationId);

    return res.status(204).send();
  } catch (error) {
    console.error("Failed to delete conversation:", error);

    return res.status(500).json({ message: "Failed to delete conversation" });
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const conversation = await conversationService.getConversationById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const [products, messages] = await Promise.all([
      productService.listProductsForConversation(conversationId),
      messageService.listMessagesForConversation(conversationId),
    ]);

    return res.status(200).json({
      conversationId: conversation.id,
      title: conversation.title,
      products: products.map(productService.toPublicProduct),
      messages: messages.map(({ id, role, content }) => ({ id, role, content })),
    });
  } catch (error) {
    console.error("Failed to load conversation:", error);

    return res.status(500).json({ message: "Failed to load conversation" });
  }
};
