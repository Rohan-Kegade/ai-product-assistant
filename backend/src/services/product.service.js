import * as scraperService from "../services/scraper.service.js";

export const scrapeProductData = async (url) => {
  console.log(`Scraping product from URL: ${url}`);

  const product = await scraperService.scrapeProduct(url);

  if (!product) {
    throw new Error("Unable to extract product data from URL");
  }

  return product;
};
