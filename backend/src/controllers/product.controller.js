import * as productService from "../services/product.service.js";
import { validateAmazonProductUrl } from "../utils/amazonUrl.js";

export const addProduct = async (req, res, next) => {
  try {
    const { url } = req.body;

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

    const product = await productService.scrapeProductData(validation.url);

    return res.status(200).json({
      product,
    });
  } catch (error) {
    console.error("Product scraping failed:", error);

    return res.status(500).json({
      message: "Failed to scrape product data",
    });
  }
};
