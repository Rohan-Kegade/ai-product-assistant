import "dotenv/config";

import express from "express";
import cors from "cors";

import { scrapeProduct } from "./services/amazonScraper.js";
import { analyzeProduct } from "./services/gemini.js";

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post("/api/products", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        message: "Product URL is required",
      });
    }

    console.log("Scraping product...");

    const product = await scrapeProduct(url);

    console.log("Sending product to Gemini...");

    const analysis = await analyzeProduct(product);

    res.json({
      analysis,
    });
  } catch (error) {
    console.error("Product analysis failed:", error);

    res.status(500).json({
      message: "Failed to analyze product",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
