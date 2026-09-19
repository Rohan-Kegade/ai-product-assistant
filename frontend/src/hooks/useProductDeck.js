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
  const [loadingConversation, setLoadingConversation] = useState(() =>
    Boolean(initialConversationId()),
  );
  const [removingProductIds, setRemovingProductIds] = useState([]);
  // Products whose last add was served from the server-side cache. Add-time
  // only: not stored, cleared when the conversation changes.
  const [cachedProductIds, setCachedProductIds] = useState([]);
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
    setCachedProductIds([]);
    setRemovingProductIds([]);
    setQuestion("");
    setAsking(false);
    setLoadingConversation(false);
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
      } finally {
        if (activeIdRef.current === id) setLoadingConversation(false);
      }
    },
    [activate],
  );

  const loadConversation = useCallback(
    (id) => {
      activate(id);
      setLoadingConversation(true);
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
    if (!trimmedUrl || loadingProduct || loadingConversation) return;

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
      setCachedProductIds((prev) => {
        const rest = prev.filter((id) => id !== data.product.id);
        return data.cached ? [...rest, data.product.id] : rest;
      });
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
    if (removingProductIds.includes(id)) return;

    const startedIn = activeIdRef.current;
    setError(null);
    setRemovingProductIds((prev) => [...prev, id]);

    try {
      await productService.removeProduct(startedIn, id);
      refreshConversations();
      if (activeIdRef.current !== startedIn) return;
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      if (activeIdRef.current === startedIn) {
        setError(err.message || "Failed to remove product");
      }
    } finally {
      setRemovingProductIds((prev) => prev.filter((pid) => pid !== id));
    }
  };

  // `retry` re-runs the last question after a failed attempt: no new user
  // bubble is added, and a trailing errored assistant bubble is dropped.
  const sendQuestion = async (questionText, { retry = false } = {}) => {
    const trimmedQuestion = questionText.trim();

    if (
      !trimmedQuestion ||
      !conversationId ||
      products.length === 0 ||
      asking ||
      loadingConversation
    )
      return;

    const askedIn = conversationId;

    if (retry) {
      setMessages((prev) =>
        prev[prev.length - 1]?.error ? prev.slice(0, -1) : prev,
      );
    } else {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: trimmedQuestion },
      ]);
    }

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
      await productService.askQuestion(
        conversationId,
        trimmedQuestion,
        (chunk) => appendToAssistant(chunk),
        { retry },
      );
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
              error: true,
            },
          ];
        }

        const updated = [...prev];
        const existing = updated[existingIndex];
        updated[existingIndex] = {
          ...existing,
          content: `${existing.content}\n\n**Error:** ${errorMessage}`,
          error: true,
        };
        return updated;
      });
    } finally {
      if (activeIdRef.current === askedIn) setAsking(false);
      refreshConversations();
    }
  };

  const handleAskQuestion = (questionText = question) =>
    sendQuestion(questionText);

  // A question is unanswered when the last message is the user's (e.g. after
  // a refresh) or is an errored assistant reply.
  const lastMessage = messages[messages.length - 1];
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  const canRetry =
    !asking &&
    !loadingConversation &&
    products.length > 0 &&
    Boolean(lastUserMessage) &&
    (lastMessage?.role === "user" || Boolean(lastMessage?.error));

  const handleRetry = () => {
    if (canRetry) sendQuestion(lastUserMessage.content, { retry: true });
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
    handleRetry,
    canRetry,
    loadingConversation,
    removingProductIds,
    cachedProductIds,
  };
}
