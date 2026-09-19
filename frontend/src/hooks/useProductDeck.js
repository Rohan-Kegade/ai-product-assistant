import { useEffect, useState } from "react";
import { productService } from "../services/api";

const CONVERSATION_KEY = "conversationId";

function readStoredConversationId() {
  try {
    return localStorage.getItem(CONVERSATION_KEY);
  } catch {
    return null;
  }
}

function storeConversationId(id) {
  try {
    if (id) localStorage.setItem(CONVERSATION_KEY, id);
    else localStorage.removeItem(CONVERSATION_KEY);
  } catch {
    // storage unavailable - the conversation just won't survive a refresh
  }
}

export function useProductDeck() {
  const [conversationId, setConversationId] = useState(readStoredConversationId);
  const [url, setUrl] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingProduct, setLoadingProduct] = useState(false);

  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);

  // Restore products + messages for a conversation saved before a refresh.
  useEffect(() => {
    const storedId = readStoredConversationId();
    if (!storedId) return;

    let cancelled = false;

    productService
      .getConversation(storedId)
      .then((data) => {
        if (cancelled) return;
        setProducts(data.products);
        setMessages(data.messages);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 404) {
          // Conversation no longer exists server-side - start fresh.
          storeConversationId(null);
          setConversationId(null);
        } else {
          setError(err.message || "Failed to restore conversation");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddProduct = async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl || loadingProduct) return;

    setLoadingProduct(true);
    setError(null);

    try {
      const data = await productService.addProductByUrl(
        trimmedUrl,
        conversationId,
      );

      if (data.conversationId !== conversationId) {
        setConversationId(data.conversationId);
        storeConversationId(data.conversationId);
      }

      setProducts((prev) =>
        prev.some((p) => p.id === data.product.id)
          ? prev
          : [...prev, data.product],
      );
      setUrl("");
    } catch (err) {
      setError(err.message || "Failed to add product");
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleRemoveProduct = async (id) => {
    setError(null);

    try {
      await productService.removeProduct(conversationId, id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.message || "Failed to remove product");
    }
  };

  const handleAskQuestion = async (questionText = question) => {
    const trimmedQuestion = questionText.trim();

    if (
      !trimmedQuestion ||
      !conversationId ||
      products.length === 0 ||
      asking
    )
      return;

    const userMessage = {
      role: "user",
      content: trimmedQuestion,
    };

    setMessages((prev) => [...prev, userMessage]);
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
      await productService.askQuestion(conversationId, trimmedQuestion, (chunk) => {
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
