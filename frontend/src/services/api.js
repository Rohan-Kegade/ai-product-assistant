const API_BASE_URL = import.meta.env.VITE_API_URL;

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Called when the server rejects the session (expired or logged out
// elsewhere), so the app can send the user back to the login page.
let onUnauthorized = () => {};

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

async function throwIfNotOk(response, { notifyUnauthorized = true } = {}) {
  if (response.ok) return;

  if (response.status === 401 && notifyUnauthorized) onUnauthorized();

  const errorData = await response.json().catch(() => ({}));
  throw new ApiError(
    errorData.message || `Request failed with status ${response.status}`,
    response.status
  );
}

// `notifyUnauthorized: false` is for the auth calls themselves, where a 401
// is an expected answer (wrong password, not logged in) rather than an
// expired session.
async function request(endpoint, { notifyUnauthorized, ...options } = {}) {
  const config = {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  await throwIfNotOk(response, { notifyUnauthorized });

  if (response.status === 204) return null;

  return response.json();
}

export const api = {
  /**
   * Creates an account and logs it in. Resolves to { id, name, email }.
   */
  async signup({ name, email, password }) {
    const data = await request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
      notifyUnauthorized: false,
    });
    return data.user;
  },

  /**
   * Logs in. Resolves to { id, name, email }.
   */
  async login({ email, password }) {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      notifyUnauthorized: false,
    });
    return data.user;
  },

  async logout() {
    await request("/auth/logout", { method: "POST", notifyUnauthorized: false });
  },

  /**
   * Resolves to the logged-in user, or null if there is no valid session.
   */
  async getCurrentUser() {
    try {
      const data = await request("/auth/me", { notifyUnauthorized: false });
      return data.user;
    } catch (err) {
      if (err.status === 401) return null;
      throw err;
    }
  },

  /**
   * Changes the user's name. Resolves to the updated user.
   */
  async updateProfile({ name }) {
    const data = await request("/account/profile", {
      method: "PATCH",
      body: JSON.stringify({ name }),
    });
    return data.user;
  },

  async changePassword({ currentPassword, newPassword }) {
    await request("/account/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  /**
   * Lists every product in the user's conversations, each with
   * `conversationCount`.
   */
  async listMyProducts() {
    const data = await request("/account/products");
    return data.products;
  },

  /**
   * Removes a product from all of the user's conversations.
   */
  async removeMyProduct(productId) {
    await request(`/account/products/${productId}`, { method: "DELETE" });
  },

  /**
   * Permanently deletes the account and all its conversations. The server
   * also clears the session cookie.
   */
  async deleteAccount({ password }) {
    await request("/account", {
      method: "DELETE",
      body: JSON.stringify({ password }),
    });
  },

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
      credentials: "include",
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