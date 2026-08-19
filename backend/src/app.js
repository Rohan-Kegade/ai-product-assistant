import "dotenv/config";
import express from "express";
import cors from "cors";
import productRouter from "./routes/product.routes.js";
import chatRouter from "./routes/chat.routes.js";

const PORT = process.env.port;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/products", productRouter);
app.use("/api/chat", chatRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
