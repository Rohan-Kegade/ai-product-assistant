import "dotenv/config";
import express from "express";
import cors from "cors";

import { scrapeProduct } from "./services/amazonScraper.js";
import { askMultiProductFollowUp } from "./services/gemini.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Endpoint 1: Scrape Amazon product data and return directly to deck
app.post("/api/products", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        message: "Product URL is required",
      });
    }

    console.log(`Scraping product from URL: ${url}`);
    const product = await scrapeProduct(url);

    res.json({
      product,
    });
  } catch (error) {
    console.error("Product scraping failed:", error);

    res.status(500).json({
      message: "Failed to scrape product data",
    });
  }
});

// Endpoint 2: Multi-product chat and comparison
app.post("/api/chat", async (req, res) => {
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

    console.log(
      `Processing question across ${products.length} active product(s)...`,
    );

    const reply = await askMultiProductFollowUp(products, history);

    res.json({ reply });
  } catch (error) {
    console.error("Chat request failed:", error);

    res.status(500).json({
      message: "Failed to process chat question",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
