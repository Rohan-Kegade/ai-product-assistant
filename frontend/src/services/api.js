const API_BASE_URL = import.meta.env.VITE_API_URL;

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || `Request failed with status ${response.status}`,
      response.status
    );
  }

  return response.json();
}

export const productService = {
  /**
   * Scrapes and retrieves product metadata by URL.
   */
  async addProductByUrl(url) {
    const data = await request("/products", {
      method: "POST",
      body: JSON.stringify({ url }),
    });

    if (!data.product) {
      throw new ApiError("Invalid response format from server.", 500);
    }

    return data.product;
  },

  /**
   * Sends conversational history and product context for AI analysis and
   * streams the reply, invoking onChunk(text) for each incremental piece
   * of text as it arrives from the server.
   */
  async askQuestion(products, history, onChunk) {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products, history }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `Request failed with status ${response.status}`,
        response.status
      );
    }

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