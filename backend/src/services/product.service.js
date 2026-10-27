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

// Every product linked to at least one of the user's conversations, most
// recently added first, with how many of those conversations use it.
export async function listProductsForUser(userId) {
  const rows = await AppDataSource.query(
    `SELECT p.id, p.title, p.price, p.rating, p.review_count AS reviewCount,
            p.url,
            COUNT(DISTINCT cp.conversation_id) AS conversationCount,
            MAX(cp.added_at) AS lastAddedAt
       FROM products p
       JOIN conversation_products cp ON cp.product_id = p.id
       JOIN conversations c ON c.id = cp.conversation_id
      WHERE c.user_id = ?
      GROUP BY p.id, p.title, p.price, p.rating, p.review_count, p.url
      ORDER BY lastAddedAt DESC, p.id DESC`,
    [userId],
  );

  return rows.map((row) => ({
    ...toPublicProduct(row),
    conversationCount: Number(row.conversationCount),
    lastAddedAt: row.lastAddedAt,
  }));
}

// Removes the product from all of the user's conversations. Returns how many
// conversations it was removed from.
export async function unlinkProductFromUser(userId, productId) {
  const result = await AppDataSource.query(
    `DELETE cp FROM conversation_products cp
       JOIN conversations c ON c.id = cp.conversation_id
      WHERE c.user_id = ? AND cp.product_id = ?`,
    [userId, productId],
  );

  return result.affectedRows ?? 0;
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
