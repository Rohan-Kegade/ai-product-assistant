import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askMultiProductFollowUp(productsList, history) {
  // 1. Convert React role names ("assistant") to Gemini role names ("model")
  // 2. Omit the last message from history array so it can be passed to sendMessage
  const formattedHistory = history.slice(0, -1).map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  // Build system instruction combining data across all active products
  const systemInstruction = `You are a helpful e-commerce product expert.
    You have access to structured data for ${productsList.length} active product(s):

    ${productsList
      .map(
        (prod, index) =>
          `=== PRODUCT ${index + 1}: ${prod.title || "Amazon Product"} ===\n${JSON.stringify(
            prod,
            null,
            2,
          )}`,
      )
      .join("\n\n")}

    Instructions:
    - Answer questions, evaluate specs, or highlight pros/cons strictly based on these products.
    - When comparing multiple products, use clear Markdown tables for side-by-side spec comparisons.
    - If the user asks general knowledge questions, personal questions, coding queries, or anything unrelated to the active product deck, politely decline by stating: "I can only answer questions related to the active products in your deck."`;

  // Create a multi-turn chat instance loaded with product context and history
  const chat = ai.chats.create({
    model: "gemini-3.5-flash-lite",
    history: formattedHistory,
    config: {
      systemInstruction: systemInstruction,
    },
  });

  // Extract the latest user question
  const lastUserMessage = history[history.length - 1].content;

  // Send the latest user prompt to the active session
  const response = await chat.sendMessage({
    message: lastUserMessage,
  });

  return response.text;
}
