import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { AppDataSource } from "./db/data-source.js";
import productRouter from "./routes/product.routes.js";
import chatRouter from "./routes/chat.routes.js";
import conversationRouter from "./routes/conversation.routes.js";
import authRouter from "./routes/auth.routes.js";
import { requireAuth } from "./middleware/requireAuth.js";

const PORT = process.env.PORT;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set; add it to backend/.env");
  process.exit(1);
}

const app = express();

// `credentials` lets the frontend send the session cookie cross-origin.
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/products", requireAuth, productRouter);
app.use("/api/chat", requireAuth, chatRouter);
app.use("/api/conversations", requireAuth, conversationRouter);

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
