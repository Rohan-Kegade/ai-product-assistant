const API_BASE_URL = import.meta.env.VITE_API_URL;

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function throwIfNotOk(response) {
  if (response.ok) return;

  const errorData = await response.json().catch(() => ({}));
  throw new ApiError(
    errorData.message || `Request failed with status ${response.status}`,
    response.status
  );
}

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  await throwIfNotOk(response);

  if (response.status === 204) return null;

  return response.json();
}

export const api = {
  /**
   * Scrapes (or reuses) a product and links it to a conversation. Omit
   * conversationId to start a new conversation. Resolves to
   * { conversationId, product }.
   */
  async addProductByUrl(url, conversationId) {
    const data = await request("/products", {
      method: "POST",
      body: JSON.stringify({ url, conversationId }),
    });

    if (!data.product || !data.conversationId) {
      throw new ApiError("Invalid response format from server.", 500);
    }

    return data;
  },

  /**
   * Unlinks a product from a conversation.
   */
  async removeProduct(conversationId, productId) {
    await request(`/conversations/${conversationId}/products/${productId}`, {
      method: "DELETE",
    });
  },

  /**
   * Lists past conversations, newest activity first.
   */
  async listConversations() {
    const data = await request("/conversations");
    return data.conversations;
  },

  /**
   * Renames a conversation. Resolves to { id, title } (title as cleaned by
   * the server).
   */
  async renameConversation(conversationId, title) {
    return request(`/conversations/${conversationId}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    });
  },

  /**
   * Deletes a conversation (its messages and product links; the scraped
   * products themselves are kept server-side).
   */
  async deleteConversation(conversationId) {
    await request(`/conversations/${conversationId}`, { method: "DELETE" });
  },

  /**
   * Loads a conversation's products and messages (used to restore state
   * after a page refresh).
   */
  async getConversation(conversationId) {
    return request(`/conversations/${conversationId}`);
  },

  /**
   * Sends a new user message to a conversation and streams the reply,
   * invoking onChunk(text) for each incremental piece of text as it
   * arrives from the server. Products and history are loaded server-side.
   * Pass { retry: true } to re-run a question whose previous attempt failed,
   * so the server doesn't store the user message a second time.
   */
  async streamAnswer(conversationId, message, onChunk, { retry = false } = {}) {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, message, retry }),
    });

    await throwIfNotOk(response);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let boundary;
      while ((boundary = buffer.indexOf("\n\n")) !== -1) {
        const rawEvent = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);

        let eventType = "message";
        let dataLine = "";

        for (const line of rawEvent.split("\n")) {
          if (line.startsWith("event:")) eventType = line.slice(6).trim();
          if (line.startsWith("data:")) dataLine = line.slice(5).trim();
        }

        if (!dataLine) continue;

        const payload = JSON.parse(dataLine);

        if (eventType === "error") {
          throw new ApiError(payload.message || "Streaming error", 500);
        }

        if (eventType === "done") {
          return;
        }

        if (payload.text) {
          onChunk(payload.text);
        }
      }
    }
  },
};