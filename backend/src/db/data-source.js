import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";
import { Conversation } from "./entities/Conversation.js";
import { Product } from "./entities/Product.js";
import { ConversationProduct } from "./entities/ConversationProduct.js";
import { Message } from "./entities/Message.js";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ai_product_assistant",
  entities: [Conversation, Product, ConversationProduct, Message],
  migrations: ["src/db/migrations/*.js"],
  synchronize: false,
});
