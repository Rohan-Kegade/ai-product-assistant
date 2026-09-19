import { EntitySchema } from "typeorm";

export const Product = new EntitySchema({
  name: "Product",
  tableName: "products",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    asin: {
      type: "varchar",
      length: 20,
      nullable: true,
      unique: true,
    },
    url: {
      type: "varchar",
      length: 2048,
      nullable: true,
    },
    title: {
      type: "varchar",
      length: 1024,
      nullable: true,
    },
    price: {
      type: "varchar",
      length: 64,
      nullable: true,
    },
    rating: {
      type: "varchar",
      length: 64,
      nullable: true,
    },
    reviewCount: {
      type: "varchar",
      length: 64,
      nullable: true,
      name: "review_count",
    },
    boughtLastMonth: {
      type: "varchar",
      length: 64,
      nullable: true,
      name: "bought_last_month",
    },
    color: {
      type: "varchar",
      length: 128,
      nullable: true,
    },
    size: {
      type: "varchar",
      length: 128,
      nullable: true,
    },
    about: {
      type: "text",
      nullable: true,
    },
    reviewSummary: {
      type: "text",
      nullable: true,
      name: "review_summary",
    },
    offers: {
      type: "json",
      nullable: true,
    },
    productDetails: {
      type: "json",
      nullable: true,
      name: "product_details",
    },
    techDetails: {
      type: "json",
      nullable: true,
      name: "tech_details",
    },
    scrapedAt: {
      type: "datetime",
      nullable: true,
      name: "scraped_at",
    },
    createdAt: {
      type: "datetime",
      createDate: true,
      name: "created_at",
    },
  },
  relations: {
    conversationProducts: {
      type: "one-to-many",
      target: "ConversationProduct",
      inverseSide: "product",
    },
  },
});
