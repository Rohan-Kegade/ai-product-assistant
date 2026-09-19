import { useCallback, useEffect, useRef, useState } from "react";
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

// The active conversation is mirrored in the URL hash (#/c/<id>) so a link
// resumes it, e.g. in another tab; the hash wins over localStorage on load.
const HASH_PATTERN = /^#\/c\/([0-9a-f-]{36})$/i;

function readHashConversationId() {
  const match = window.location.hash.match(HASH_PATTERN);
  return match ? match[1] : null;
}

function writeHashConversationId(id) {
  const next = id ? `#/c/${id}` : "";
  if (window.location.hash === next) return;
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${window.location.search}${next}`,
  );
}

function initialConversationId() {
  return readHashConversationId() || readStoredConversationId();
}

export function useProductDeck() {
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [conversations, setConversations] = useState([]);
  const [url, setUrl] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingProduct, setLoadingProduct] = useState(false);

  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);

  // Always holds the conversation the user is currently looking at, so async
  // work started in one conversation can tell it is no longer the active one.
  const activeIdRef = useRef(conversationId);

  const refreshConversations = useCallback(async () => {
    try {
      setConversations(await productService.listConversations());
    } catch {
      // the list is a convenience - don't surface an error banner for it
    }
  }, []);

  // Makes `id` (or nothing, for a new conversation) the active one and clears
  // the view; the caller loads its contents if needed.
  const activate = useCallback((id) => {
    activeIdRef.current = id;
    setConversationId(id);
    storeConversationId(id);
    writeHashConversationId(id);
    setProducts([]);
    setMessages([]);
    setQuestion("");
    setAsking(false);
    setError(null);
  }, []);

  // Fetches a conversation's contents into view. Assumes `id` is already the
  // active one (see `activate`).
  const fetchConversation = useCallback(
    async (id) => {
      try {
        const data = await productService.getConversation(id);
        // Ignore the response if the user has since switched away.
        if (activeIdRef.current !== id) return;
        storeConversationId(id);
        setProducts(data.products);
        setMessages(data.messages);
      } catch (err) {
        if (activeIdRef.current !== id) return;
        if (err.status === 404) {
          // Conversation no longer exists server-side - start fresh.
          activate(null);
        } else {
          setError(err.message || "Failed to load conversation");
        }
      }
    },
    [activate],
  );

  const loadConversation = useCallback(
    (id) => {
      activate(id);
      return fetchConversation(id);
    },
    [activate, fetchConversation],
  );

  const startNewConversation = () => activate(null);

  const switchConversation = (id) => {
    if (id === activeIdRef.current) return;
    loadConversation(id);
  };

  const removeConversation = async (id) => {
    try {
      await productService.deleteConversation(id);
    } catch (err) {
      // Already gone server-side counts as deleted.
      if (err.status !== 404) {
        setError(err.message || "Failed to delete conversation");
        return;
      }
    }

    if (activeIdRef.current === id) activate(null);
    refreshConversations();
  };

  // Restore the conversation saved before a refresh (or named in the URL) and
  // load the conversation list.
  useEffect(() => {
    const initialId = activeIdRef.current;
    if (initialId) fetchConversation(initialId);
    refreshConversations();
  }, [fetchConversation, refreshConversations]);

  // Follow manual hash edits / back-forward navigation.
  useEffect(() => {
    const onHashChange = () => {
      const id = readHashConversationId();
      if (id && id !== activeIdRef.current) loadConversation(id);
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [loadConversation]);

  const handleAddProduct = async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl || loadingProduct) return;

    const startedIn = activeIdRef.current;

    setLoadingProduct(true);
    setError(null);

    try {
      const data = await productService.addProductByUrl(trimmedUrl, startedIn);

      refreshConversations();

      // The user switched conversations while this was in flight - the
      // product is saved server-side, but don't show it in the wrong view.
      if (activeIdRef.current !== startedIn) return;

      if (data.conversationId !== startedIn) {
        activeIdRef.current = data.conversationId;
        setConversationId(data.conversationId);
        storeConversationId(data.conversationId);
        writeHashConversationId(data.conversationId);
      }

      setProducts((prev) =>
        prev.some((p) => p.id === data.product.id)
          ? prev
          : [...prev, data.product],
      );
      setUrl("");
    } catch (err) {
      if (activeIdRef.current === startedIn) {
        setError(err.message || "Failed to add product");
      }
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleRemoveProduct = async (id) => {
    const startedIn = activeIdRef.current;
    setError(null);

    try {
      await productService.removeProduct(startedIn, id);
      refreshConversations();
      if (activeIdRef.current !== startedIn) return;
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      if (activeIdRef.current === startedIn) {
        setError(err.message || "Failed to remove product");
      }
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

    const askedIn = conversationId;

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
      // Drop chunks that arrive after the user switched conversations; the
      // full reply is saved server-side and shows up when they switch back.
      if (activeIdRef.current !== askedIn) return;

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
      if (activeIdRef.current !== askedIn) return;

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
      if (activeIdRef.current === askedIn) setAsking(false);
      refreshConversations();
    }
  };

  return {
    conversationId,
    conversations,
    switchConversation,
    startNewConversation,
    removeConversation,
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
