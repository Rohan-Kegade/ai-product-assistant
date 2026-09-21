import * as scraperService from "../services/scraper.service.js";
import { AppDataSource } from "../db/data-source.js";
import { Product } from "../db/entities/Product.js";
import { ConversationProduct } from "../db/entities/ConversationProduct.js";
import { bumpConversationUpdatedAt } from "./conversation.service.js";

const productRepository = () => AppDataSource.getRepository(Product);
const conversationProductRepository = () =>
  AppDataSource.getRepository(ConversationProduct);

export const scrapeAndValidateProduct = async (url) => {
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
// scrapeAndValidateProduct/scraper.service.js.
export async function saveProduct({ asin, url, scraped }) {
  const product = productRepository().create({
    ...scraped,
    asin,
    url,
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
  await bumpConversationUpdatedAt(conversationId);

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

// Only the fields the frontend renders (the product card). The rest stays in
// the DB and is added to the LLM prompt server-side.
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
