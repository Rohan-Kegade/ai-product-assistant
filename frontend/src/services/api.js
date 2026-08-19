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
   * Sends conversational history and product context for AI analysis.
   */
  async askQuestion(products, history) {
    const data = await request("/chat", {
      method: "POST",
      body: JSON.stringify({ products, history }),
    });

    return data.reply;
  },
};