import "dotenv/config";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./db/data-source.js";
import productRouter from "./routes/product.routes.js";
import chatRouter from "./routes/chat.routes.js";
import conversationRouter from "./routes/conversation.routes.js";

const PORT = process.env.PORT;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

const app = express();

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.use("/api/products", productRouter);
app.use("/api/chat", chatRouter);
app.use("/api/conversations", conversationRouter);

AppDataSource.initialize()
  .then(() => {
    console.log("Database connection established");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  });
