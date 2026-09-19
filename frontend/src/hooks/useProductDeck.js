import { useState } from "react";
import { productService } from "../services/api";

export function useProductDeck() {
  const [url, setUrl] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingProduct, setLoadingProduct] = useState(false);

  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);

  const handleAddProduct = async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl || loadingProduct) return;

    setLoadingProduct(true);
    setError(null);

    try {
      const productData = await productService.addProductByUrl(trimmedUrl);
      setProducts((prev) => [...prev, { id: Date.now(), ...productData }]);
      setUrl("");
    } catch (err) {
      setError(err.message || "Failed to add product");
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleRemoveProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAskQuestion = async (questionText = question) => {
    const trimmedQuestion = questionText.trim();

    if (!trimmedQuestion || products.length === 0 || asking) return;

    const userMessage = {
      role: "user",
      content: trimmedQuestion,
    };

    const updatedHistory = [...messages, userMessage];

    setMessages(updatedHistory);
    setQuestion("");
    setAsking(true);
    setError(null);

    // Stable id for the assistant message being streamed in, so the update
    // is derived purely from `prev` - React 18 StrictMode invokes setState
    // updaters twice in dev, so mutating an outer variable here (instead of
    // reading it back from `prev`) would misattribute the second chunk.
    const assistantMessageId = `assistant-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const appendToAssistant = (text) => {
      setMessages((prev) => {
        const existingIndex = prev.findIndex(
          (msg) => msg.id === assistantMessageId,
        );

        if (existingIndex === -1) {
          return [
            ...prev,
            { id: assistantMessageId, role: "assistant", content: text },
          ];
        }

        const updated = [...prev];
        const existing = updated[existingIndex];
        updated[existingIndex] = {
          ...existing,
          content: existing.content + text,
        };
        return updated;
      });
    };

    try {
      await productService.askQuestion(products, updatedHistory, (chunk) => {
        appendToAssistant(chunk);
      });
    } catch (err) {
      const errorMessage = err.message || "Failed to fetch response.";
      setMessages((prev) => {
        const existingIndex = prev.findIndex(
          (msg) => msg.id === assistantMessageId,
        );

        if (existingIndex === -1) {
          return [
            ...prev,
            {
              id: assistantMessageId,
              role: "assistant",
              content: `**Error:** ${errorMessage}`,
            },
          ];
        }

        const updated = [...prev];
        const existing = updated[existingIndex];
        updated[existingIndex] = {
          ...existing,
          content: `${existing.content}\n\n**Error:** ${errorMessage}`,
        };
        return updated;
      });
    } finally {
      setAsking(false);
    }
  };

  return {
    url,
    setUrl,
    products,
    loadingProduct,
    question,
    setQuestion,
    asking,
    messages,
    error,
    clearError: () => setError(null),
    handleAddProduct,
    handleRemoveProduct,
    handleAskQuestion,
  };
}
