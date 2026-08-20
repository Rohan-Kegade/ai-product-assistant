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

    try {
      const reply = await productService.askQuestion(products, updatedHistory);

      setMessages([
        ...updatedHistory,
        {
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (err) {
      const errorMessage = err.message || "Failed to fetch response.";

      setMessages([
        ...updatedHistory,
        {
          role: "assistant",
          content: `**Error:** ${errorMessage}`,
        },
      ]);
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
