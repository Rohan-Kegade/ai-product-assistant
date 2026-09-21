import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../services/api";
import {
  loadActiveConversationId,
  readHashConversationId,
  saveActiveConversationId,
} from "./activeConversationStore";

// Adds `text` to the assistant message `id` (creating it on first use), so
// streamed chunks and errors share one code path. Derived purely from
// `messages`, since React StrictMode runs state updaters twice in dev.
function upsertAssistantMessage(messages, id, text, { separator = "", error } = {}) {
  const index = messages.findIndex((msg) => msg.id === id);

  if (index === -1) {
    return [...messages, { id, role: "assistant", content: text, error }];
  }

  const updated = [...messages];
  const existing = updated[index];
  updated[index] = {
    ...existing,
    content: existing.content + separator + text,
    error: error ?? existing.error,
  };
  return updated;
}

export function useProductDeck() {
  const [conversationId, setConversationId] = useState(loadActiveConversationId);
  const [conversations, setConversations] = useState([]);
  const [isLoadingConversation, setIsLoadingConversation] = useState(() =>
    Boolean(loadActiveConversationId()),
  );
  const [removingProductIds, setRemovingProductIds] = useState([]);
  // Products whose last add was served from the server-side cache. Add-time
  // only: not stored, cleared when the conversation changes.
  const [cachedProductIds, setCachedProductIds] = useState([]);
  const [productUrl, setProductUrl] = useState("");
  const [products, setProducts] = useState([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const [questionDraft, setQuestionDraft] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);

  // Always holds the conversation the user is currently looking at, so async
  // work started in one conversation can tell it is no longer the active one.
  const activeConversationIdRef = useRef(conversationId);

  const refreshConversations = useCallback(async () => {
    try {
      setConversations(await api.listConversations());
    } catch {
      // the list is a convenience - don't surface an error banner for it
    }
  }, []);

  // Makes `id` (or nothing, for a new conversation) the active one and clears
  // the view; the caller loads its contents if needed.
  const setActiveConversation = useCallback((id) => {
    activeConversationIdRef.current = id;
    setConversationId(id);
    saveActiveConversationId(id);
    setProducts([]);
    setMessages([]);
    setCachedProductIds([]);
    setRemovingProductIds([]);
    setQuestionDraft("");
    setIsAnswering(false);
    setIsLoadingConversation(false);
    setError(null);
  }, []);

  // Fetches a conversation's contents into view. Assumes `id` is already the
  // active one (see `setActiveConversation`).
  const loadConversationContents = useCallback(
    async (id) => {
      try {
        const data = await api.getConversation(id);
        // Ignore the response if the user has since switched away.
        if (activeConversationIdRef.current !== id) return;
        saveActiveConversationId(id);
        setProducts(data.products);
        setMessages(data.messages);
      } catch (err) {
        if (activeConversationIdRef.current !== id) return;
        if (err.status === 404) {
          // Conversation no longer exists server-side - start fresh.
          setActiveConversation(null);
        } else {
          setError(err.message || "Failed to load conversation");
        }
      } finally {
        if (activeConversationIdRef.current === id) setIsLoadingConversation(false);
      }
    },
    [setActiveConversation],
  );

  const openConversation = useCallback(
    (id) => {
      setActiveConversation(id);
      setIsLoadingConversation(true);
      return loadConversationContents(id);
    },
    [setActiveConversation, loadConversationContents],
  );

  const startNewConversation = () => setActiveConversation(null);

  const switchConversation = (id) => {
    if (id === activeConversationIdRef.current) return;
    openConversation(id);
  };

  const renameConversation = async (id, title) => {
    try {
      const renamed = await api.renameConversation(id, title);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: renamed.title } : c)),
      );
    } catch (err) {
      setError(err.message || "Failed to rename conversation");
    }
  };

  const removeConversation = async (id) => {
    try {
      await api.deleteConversation(id);
    } catch (err) {
      // Already gone server-side counts as deleted.
      if (err.status !== 404) {
        setError(err.message || "Failed to delete conversation");
        return;
      }
    }

    if (activeConversationIdRef.current === id) setActiveConversation(null);
    refreshConversations();
  };

  // Restore the conversation saved before a refresh (or named in the URL) and
  // load the conversation list.
  useEffect(() => {
    const initialId = activeConversationIdRef.current;
    if (initialId) loadConversationContents(initialId);
    refreshConversations();
  }, [loadConversationContents, refreshConversations]);

  // Follow manual hash edits / back-forward navigation.
  useEffect(() => {
    const onHashChange = () => {
      const id = readHashConversationId();
      if (id && id !== activeConversationIdRef.current) openConversation(id);
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [openConversation]);

  const addProduct = async () => {
    const trimmedUrl = productUrl.trim();
    if (!trimmedUrl || isAddingProduct || isLoadingConversation) return;

    const startedInConversationId = activeConversationIdRef.current;

    setIsAddingProduct(true);
    setError(null);

    try {
      const data = await api.addProductByUrl(trimmedUrl, startedInConversationId);

      refreshConversations();

      // The user switched conversations while this was in flight - the
      // product is saved server-side, but don't show it in the wrong view.
      if (activeConversationIdRef.current !== startedInConversationId) return;

      if (data.conversationId !== startedInConversationId) {
        activeConversationIdRef.current = data.conversationId;
        setConversationId(data.conversationId);
        saveActiveConversationId(data.conversationId);
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
      setProductUrl("");
    } catch (err) {
      if (activeConversationIdRef.current === startedInConversationId) {
        setError(err.message || "Failed to add product");
      }
    } finally {
      setIsAddingProduct(false);
    }
  };

  const removeProduct = async (id) => {
    if (removingProductIds.includes(id)) return;

    const startedInConversationId = activeConversationIdRef.current;
    setError(null);
    setRemovingProductIds((prev) => [...prev, id]);

    try {
      await api.removeProduct(startedInConversationId, id);
      refreshConversations();
      if (activeConversationIdRef.current !== startedInConversationId) return;
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      if (activeConversationIdRef.current === startedInConversationId) {
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
      isAnswering ||
      isLoadingConversation
    )
      return;

    const askedInConversationId = conversationId;

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

    setQuestionDraft("");
    setIsAnswering(true);
    setError(null);

    const assistantMessageId = `assistant-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Drop chunks that arrive after the user switched conversations; the full
    // reply is saved server-side and shows up when they switch back.
    const appendToAssistant = (text) => {
      if (activeConversationIdRef.current !== askedInConversationId) return;
      setMessages((prev) => upsertAssistantMessage(prev, assistantMessageId, text));
    };

    try {
      await api.streamAnswer(
        conversationId,
        trimmedQuestion,
        (chunk) => appendToAssistant(chunk),
        { retry },
      );
    } catch (err) {
      if (activeConversationIdRef.current !== askedInConversationId) return;

      const errorMessage = err.message || "Failed to fetch response.";
      setMessages((prev) =>
        upsertAssistantMessage(
          prev,
          assistantMessageId,
          `**Error:** ${errorMessage}`,
          { separator: "\n\n", error: true },
        ),
      );
    } finally {
      if (activeConversationIdRef.current === askedInConversationId) setIsAnswering(false);
      refreshConversations();
    }
  };

  const askQuestion = (questionText = questionDraft) =>
    sendQuestion(questionText);

  // A question is unanswered when the last message is the user's (e.g. after
  // a refresh) or is an errored assistant reply.
  const lastMessage = messages[messages.length - 1];
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  const canRetry =
    !isAnswering &&
    !isLoadingConversation &&
    products.length > 0 &&
    Boolean(lastUserMessage) &&
    (lastMessage?.role === "user" || Boolean(lastMessage?.error));

  const retryLastQuestion = () => {
    if (canRetry) sendQuestion(lastUserMessage.content, { retry: true });
  };

  return {
    conversationId,
    conversations,
    switchConversation,
    startNewConversation,
    renameConversation,
    removeConversation,
    productUrl,
    setProductUrl,
    products,
    isAddingProduct,
    questionDraft,
    setQuestionDraft,
    isAnswering,
    messages,
    error,
    clearError: () => setError(null),
    addProduct,
    removeProduct,
    askQuestion,
    retryLastQuestion,
    canRetry,
    isLoadingConversation,
    removingProductIds,
    cachedProductIds,
  };
}
