import * as scraperService from "../services/scraper.service.js";
import { AppDataSource } from "../db/data-source.js";
import { Product } from "../db/entities/Product.js";
import { ConversationProduct } from "../db/entities/ConversationProduct.js";
import { touchConversation } from "./conversation.service.js";

const productRepository = () => AppDataSource.getRepository(Product);
const conversationProductRepository = () =>
  AppDataSource.getRepository(ConversationProduct);

export const scrapeProductData = async (url) => {
  console.log(`Scraping product from URL: ${url}`);

  const product = await scraperService.scrapeProduct(url);

  // The scraper returns an all-null object (rather than throwing) for pages
  // that aren't real product pages, e.g. an unknown ASIN.
  if (!product || !product.title) {
    throw new Error("Unable to extract product data from URL");
  }

  return product;
};

export async function findProductByAsin(asin) {
  if (!asin) return null;

  return productRepository().findOneBy({ asin });
}

// Persists a freshly scraped product. `scraped` is the raw shape returned by
// scrapeProductData/scraper.service.js.
export async function saveProduct({ asin, url, scraped }) {
  const product = productRepository().create({
    asin,
    url,
    title: scraped.title,
    price: scraped.price,
    rating: scraped.rating,
    reviewCount: scraped.reviewCount,
    boughtLastMonth: scraped.boughtLastMonth,
    color: scraped.color,
    size: scraped.size,
    about: scraped.about,
    reviewSummary: scraped.reviewSummary,
    offers: scraped.offers,
    productDetails: scraped.productDetails,
    techDetails: scraped.techDetails,
    scrapedAt: new Date(),
  });

  return productRepository().save(product);
}

// Idempotent: linking the same product to the same conversation twice is a
// no-op, backed by the (conversation_id, product_id) unique constraint.
export async function linkProductToConversation(conversationId, productId) {
  const existingLink = await conversationProductRepository().findOneBy({
    conversationId,
    productId,
  });

  if (existingLink) {
    return existingLink;
  }

  const link = conversationProductRepository().create({
    conversationId,
    productId,
  });

  const saved = await conversationProductRepository().save(link);
  await touchConversation(conversationId);

  return saved;
}

export async function unlinkProductFromConversation(conversationId, productId) {
  await conversationProductRepository().delete({ conversationId, productId });
}

export async function listProductsForConversation(conversationId) {
  const links = await conversationProductRepository().find({
    where: { conversationId },
    relations: { product: true },
    order: { addedAt: "ASC" },
  });

  return links.map((link) => link.product);
}

// Only the fields the frontend actually renders (sidebar product card) -
// everything else (offers, productDetails, techDetails, etc.) now lives in
// the DB and is pulled server-side when building the LLM prompt.
export function toPublicProduct(product) {
  return {
    id: product.id,
    title: product.title,
    price: product.price,
    rating: product.rating,
    reviewCount: product.reviewCount,
    url: product.url,
  };
}
