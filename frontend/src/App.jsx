import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const API_URL = "http://localhost:5000/api";

function App() {
  const [url, setUrl] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingProduct, setLoadingProduct] = useState(false);

  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [messages, setMessages] = useState([]);

  const addProductToDeck = async () => {
    if (!url.trim() || loadingProduct) return;

    setLoadingProduct(true);

    try {
      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to scrape product data.");
      }

      const data = await response.json();

      if (!data.product) {
        throw new Error("No product data received.");
      }

      setProducts((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...data.product,
        },
      ]);

      setUrl("");
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoadingProduct(false);
    }
  };

  const removeProduct = (id) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  const askQuestion = async () => {
    if (!question.trim() || products.length === 0 || asking) {
      return;
    }

    const userMessage = {
      role: "user",
      content: question.trim(),
    };

    const updatedHistory = [...messages, userMessage];

    setMessages(updatedHistory);
    setQuestion("");
    setAsking(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          products,
          history: updatedHistory,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response.");
      }

      const data = await response.json();

      setMessages([
        ...updatedHistory,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (error) {
      setMessages([
        ...updatedHistory,
        {
          role: "assistant",
          content: `Something went wrong: ${error.message}`,
        },
      ]);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <div className="flex h-screen overflow-hidden">
        {/* ================= SIDEBAR ================= */}

        <aside className="hidden lg:flex w-[350px] bg-[#0b0f19] text-white flex-col relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute -top-32 -left-32 w-72 h-72 bg-blue-600/20 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-violet-600/10 blur-[100px] rounded-full" />

          <div className="relative z-10 flex flex-col h-full">
            {/* Logo */}
            <div className="px-6 pt-6 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <svg
                    className="w-9 h-9 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M8 10h8M8 14h5m7-2a8 8 0 11-16 0 8 8 0 0116 0z"
                    />
                  </svg>
                </div>

                <div>
                  <h1 className="text-[17px] font-bold tracking-tight">
                    ProductIQ
                  </h1>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="mx-6 border-t border-white/[0.06]" />

            {/* Add product */}
            <div className="px-6 pt-6">
              <div className="mb-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
                    Product Deck
                  </h2>
                </div>

                <p className="text-[11px] text-slate-400 mt-1">
                  Add products to your research workspace
                </p>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.828 10.172a4 4 0 010 5.656l-1.414 1.414a4 4 0 01-5.656-5.656l1.414-1.414m4.242-4.242l1.414-1.414a4 4 0 015.656 5.656l-1.414 1.414m-5.656 5.656l4.242-4.242"
                    />
                  </svg>

                  <input
                    value={url}
                    disabled={loadingProduct}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addProductToDeck();
                      }
                    }}
                    placeholder="Paste Product URL..."
                    className="w-full h-8 pl-10 pr-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-blue-500/60 focus:bg-white/[0.07] focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50"
                  />
                </div>

                <button
                  onClick={addProductToDeck}
                  disabled={!url.trim() || loadingProduct}
                  className="w-full h-11 rounded-xl bg-white text-slate-900 hover:bg-slate-100 active:bg-slate-200 font-semibold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingProduct ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-slate-900 animate-spin" />
                      Adding product...
                    </>
                  ) : (
                    <>Add product</>
                  )}
                </button>
              </div>
            </div>

            {/* Products */}
            <div className="flex-1 min-h-0 px-6 pt-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-xs font-semibold text-slate-100 tracking-wider">
                    Product Count
                  </h2>
                </div>

                <div className="min-w-7 h-7 px-2 rounded-lg bg-white/[0.06] border border-white/[0.06] flex items-center justify-center">
                  <span className="text-xs font-semibold text-slate-400">
                    {products.length}
                  </span>
                </div>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-[calc(100%-55px)] pr-1">
                {products.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/[0.08] p-5 text-center">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
                      <svg
                        className="w-5 h-5 text-slate-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M20 13V7a2 2 0 00-2-2h-4l-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h5"
                        />
                      </svg>
                    </div>

                    <p className="text-xs text-slate-500">
                      Your research deck is empty
                    </p>
                  </div>
                ) : (
                  products.map((product, index) => (
                    <div
                      key={product.id}
                      className="group relative rounded-xl border border-white/[0.06] bg-white/[0.035] hover:bg-white/[0.06] transition p-3"
                    >
                      <div className="flex gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-bold text-slate-400">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1 pr-5">
                          <p className="text-xs font-medium text-slate-300 leading-5 line-clamp-2">
                            {product.title || "Amazon Product"}
                          </p>

                          {product.price && (
                            <p className="text-xs text-white font-semibold mt-1">
                              {product.price}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => removeProduct(product.id)}
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* ================= MAIN ================= */}

        <main className="flex-1 min-w-0 flex flex-col bg-[#f8fafc]">
          {/* Top bar */}
          <header className="h-[72px] shrink-0 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl flex items-center justify-between px-5 md:px-8">
            <div className="flex items-center gap-3">
              {/* Mobile logo */}
              <div className="lg:hidden w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 3v18m9-9H3"
                  />
                </svg>
              </div>

              <div>
                <h1 className="text-sm font-bold text-slate-900">
                  Product Research
                </h1>

                <p className="text-[11px] text-slate-400 mt-0.5">
                  Compare, analyze and understand products
                </p>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 min-h-0 p-4 md:p-6 lg:p-8 flex flex-col max-w-5xl mx-auto w-full">
            {/* Messages Stream */}
            <div className="flex-1 min-h-0 overflow-y-auto my-2">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center px-6">
                  <div className="relative mb-7">
                    <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full" />

                    <div className="relative w-20 h-20 rounded-[24px] bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center">
                      <svg
                        className="w-9 h-9 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M8 10h8M8 14h5m7-2a8 8 0 11-16 0 8 8 0 0116 0z"
                        />
                      </svg>
                    </div>
                  </div>

                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 text-center">
                    What would you like to know?
                  </h2>

                  <p className="text-sm text-slate-500 mt-2 text-center max-w-md leading-6">
                    Add products to your product deck and ask AI to analyze
                    features, compare specifications, evaluate value, or make a
                    recommendation.
                  </p>

                  <div className="flex flex-wrap justify-center gap-2 mt-6">
                    {[
                      "Summarize key features",
                      "Biggest pros and cons?",
                      "Is this worth buying?",
                      "What's in the box?",
                      "Compare these products",
                      "Which one is better?",
                      "Show key differences",
                      "Best value for money",
                    ].map((text) => (
                      <button
                        key={text}
                        onClick={() => {
                          if (products.length > 0) {
                            setQuestion(text);
                          }
                        }}
                        disabled={products.length === 0}
                        className="px-3.5 py-2 rounded-full border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 text-xs font-medium text-slate-900 transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 py-4">
                  {messages.map((message, index) => {
                    const isUser = message.role === "user";

                    return (
                      <div
                        key={index}
                        className={`flex ${
                          isUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isUser && (
                          <div className="w-8 h-8 rounded-lg bg-light border border-slate-300  flex items-center justify-center mr-3 shrink-0 mt-1 shadow-md shadow-blue-500/10">
                            <svg
                              className="w-9 h-9 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M8 10h8M8 14h5m7-2a8 8 0 11-16 0 8 8 0 0116 0z"
                              />
                            </svg>
                          </div>
                        )}

                        <div
                          className={`max-w-[82%] ${
                            isUser
                              ? "bg-slate-900 text-white rounded-2xl rounded-br-md shadow-sm"
                              : "bg-white border border-slate-200/80 text-slate-700 rounded-2xl rounded-bl-md shadow-sm"
                          } px-4 py-3.5`}
                        >
                          <div
                            className={`text-[12px] font-bold tracking-wider mb-1.5 ${
                              isUser ? "text-slate-100" : "text-blue-600"
                            }`}
                          >
                            {isUser ? "You" : "ProductIQ"}
                          </div>

                          <div
                            className={`text-sm prose max-w-none ${
                              message.role === "user"
                                ? "prose-invert"
                                : "prose-slate"
                            }`}
                          >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {asking && (
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-lg bg-light border border-slate-300  flex items-center justify-center mr-3 shrink-0">
                        <svg
                          className="w-9 h-9 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M8 10h8M8 14h5m7-2a8 8 0 11-16 0 8 8 0 0116 0z"
                          />
                        </svg>
                      </div>

                      <div className="px-4 py-3.5 rounded-2xl rounded-bl-md bg-white border border-slate-200/80 shadow-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="pt-3 border-t border-slate-200/60 shrink-0">
              <div
                className={`relative flex items-center rounded-2xl border transition shadow-sm ${
                  products.length === 0
                    ? "bg-slate-100/70 border-slate-200"
                    : "bg-white border-slate-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/10"
                }`}
              >
                <input
                  value={question}
                  disabled={products.length === 0 || asking}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      askQuestion();
                    }
                  }}
                  placeholder={
                    products.length === 0
                      ? "Add a product to start asking questions..."
                      : "Ask about your products..."
                  }
                  className="flex-1 h-14 bg-transparent px-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none disabled:cursor-not-allowed"
                />

                <button
                  onClick={askQuestion}
                  disabled={!question.trim() || products.length === 0 || asking}
                  className="mr-2 w-10 h-10 rounded-xl bg-slate-900 hover:bg-blue-600 text-white flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {asking ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 12h14m-6-6l6 6-6 6"
                      />
                    </svg>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-end mt-2 px-1">
                <span className="text-[10px] text-slate-400">
                  Press Enter to send
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
