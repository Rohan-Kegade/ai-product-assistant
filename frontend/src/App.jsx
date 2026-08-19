import { Sidebar } from "./components/sidebar/Sidebar";
import { ChatWindow } from "./components/chat/ChatWindow";
import { ChatInput } from "./components/chat/ChatInput";
import { useProductDeck } from "./hooks/useProductDeck";
import { useRef } from "react";

export default function App() {
  const {
    url,
    setUrl,
    products,
    loadingProduct,
    question,
    setQuestion,
    asking,
    messages,
    error,
    clearError,
    handleAddProduct,
    handleRemoveProduct,
    handleAskQuestion,
  } = useProductDeck();

  const chatContainerRef = useRef(null);

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          url={url}
          setUrl={setUrl}
          products={products}
          loadingProduct={loadingProduct}
          onAddProduct={handleAddProduct}
          onRemoveProduct={handleRemoveProduct}
        />

        {/* Main Workspace */}
        <main className="flex-1 min-w-0 flex flex-col bg-[#f8fafc]">
          <header className="h-[72px] shrink-0 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl flex items-center justify-between px-5 md:px-8">
            <div className="flex items-center gap-3">
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
                <h1 className="text-sm font-bold uppercase text-slate-900">
                  Product Research
                </h1>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Compare, analyze, and understand products
                </p>
              </div>
            </div>
          </header>

          {/* Toast Notification Banner */}
          {error && (
            <div className="bg-red-50 border-b border-red-200 px-6 py-2.5 flex items-center justify-between">
              <p className="text-xs text-red-700 font-medium">{error}</p>
              <button
                onClick={clearError}
                className="text-xs text-red-500 hover:text-red-800 font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Chat Workspace */}
          <div className="flex-1 min-h-0 p-4 md:p-6 lg:p-8 flex flex-col max-w-5xl mx-auto w-full">
            <div
              ref={chatContainerRef}
              className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:none]"
            >
              <ChatWindow
                messages={messages}
                asking={asking}
                productsCount={products.length}
                onSelectPrompt={(promptText) => setQuestion(promptText)}
                containerRef={chatContainerRef}
              />
            </div>

            <ChatInput
              question={question}
              setQuestion={setQuestion}
              onAskQuestion={handleAskQuestion}
              productsCount={products.length}
              asking={asking}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
