import * as productService from "../services/product.service.js";
import * as conversationService from "../services/conversation.service.js";
import { validateAmazonProductUrl } from "../utils/amazonUrl.js";

// Only the fields the frontend actually renders (sidebar product card) -
// everything else (offers, productDetails, techDetails, etc.) now lives in
// the DB and is pulled server-side when building the LLM prompt.
function toPublicProduct(product) {
  return {
    id: product.id,
    title: product.title,
    price: product.price,
  };
}

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

    let conversation;

    if (conversationId) {
      conversation = await conversationService.getConversationById(conversationId);

      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
    } else {
      conversation = await conversationService.createConversation();
    }

    let product = await productService.findProductByAsin(validation.asin);

    if (!product) {
      const scraped = await productService.scrapeProductData(validation.url);
      product = await productService.saveProduct({
        asin: validation.asin,
        url: validation.url,
        scraped,
      });
    }

    await productService.linkProductToConversation(conversation.id, product.id);

    return res.status(200).json({
      conversationId: conversation.id,
      product: toPublicProduct(product),
    });
  } catch (error) {
    console.error("Product scraping failed:", error);

    return res.status(500).json({
      message: "Failed to scrape product data",
    });
  }
};
