import * as productService from "../services/product.service.js";
import * as conversationService from "../services/conversation.service.js";
import { validateAmazonProductUrl } from "../utils/amazonUrl.js";

export const addProduct = async (req, res, next) => {
  try {
    const { url, conversationId } = req.body;

    if (!url) {
      return res.status(400).json({
        message: "Product URL is required",
      });
    }

    const validation = await validateAmazonProductUrl(url);

    if (!validation.valid) {
      return res.status(400).json({
        message: `Invalid Amazon product URL: ${validation.reason}`,
      });
    }

    let conversation = null;

    if (conversationId) {
      conversation = await conversationService.getConversationById(conversationId);

      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
    }

    let product = await productService.findProductByAsin(validation.asin);
    const cached = Boolean(product);

    if (!product) {
      const scraped = await productService.scrapeProductData(validation.url);
      product = await productService.saveProduct({
        asin: validation.asin,
        url: validation.url,
        scraped,
      });
    }

    // Create the conversation only after the product is in hand, so a failed
    // scrape doesn't leave an empty conversation behind.
    if (!conversation) {
      conversation = await conversationService.createConversation();
    }

    await productService.linkProductToConversation(conversation.id, product.id);

    return res.status(200).json({
      conversationId: conversation.id,
      product: productService.toPublicProduct(product),
      cached,
    });
  } catch (error) {
    console.error("Product scraping failed:", error);

    return res.status(500).json({
      message: "Failed to scrape product data",
    });
  }
};
