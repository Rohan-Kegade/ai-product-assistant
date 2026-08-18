import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function analyzeProduct(product) {
  const prompt = `
    Normalize the raw e-commerce product data into a clean, well-structured JSON object.

    Rules:
    - Extract all meaningful facts with exact numbers, units, and qualifiers without inventing data.
    - Deduplicate repeat info, but do not omit unique technical details.
    - Convert unstructured text into structured fields.
    - Separate technical specs, commercial/offers data, ratings, and manufacturer details.
    - Group specs into logical nested objects (e.g., camera: { rear, front }, display: { size, refresh_rate }, specifications: { processor, memory }).

    Raw Product Data:
    ${JSON.stringify(product)}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    config: {
      responseMimeType: "application/json",
    },
    contents: prompt,
  });

  return JSON.parse(response.text);
}
