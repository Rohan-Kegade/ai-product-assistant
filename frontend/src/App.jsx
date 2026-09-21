import { useRef, useState } from "react";
import { Sidebar } from "./components/sidebar/Sidebar";
import { ChatWindow } from "./components/chat/ChatWindow";
import { ChatInput } from "./components/chat/ChatInput";
import { DeckStrip } from "./components/deck/DeckStrip";
import { useProductDeck } from "./hooks/useProductDeck";

export default function App() {
  const {
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
    clearError,
    addProduct,
    removeProduct,
    askQuestion,
    retryLastQuestion,
    canRetry,
    isLoadingConversation,
    removingProductIds,
    cachedProductIds,
  } = useProductDeck();

  const chatContainerRef = useRef(null);
  // Off-canvas sidebar on screens narrower than `lg`.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = () => setSidebarOpen(false);

  // The title comes from the conversation list (the LLM-generated title, or
  // the first product's title until one exists). The list refreshes after
  // every add/remove/chat, so a new conversation's name shows up shortly after.
  const activeTitle =
    conversations.find((c) => c.id === conversationId)?.title ||
    "New conversation";

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <div className="flex h-dvh overflow-hidden">
        <Sidebar
          open={sidebarOpen}
          onClose={closeSidebar}
          conversations={conversations}
          activeConversationId={conversationId}
          onSelectConversation={(id) => {
            switchConversation(id);
            closeSidebar();
          }}
          onNewConversation={() => {
            startNewConversation();
            closeSidebar();
          }}
          onRenameConversation={renameConversation}
          onDeleteConversation={removeConversation}
        />

        <main className="flex-1 min-w-0 flex flex-col bg-[#f8fafc]">
          <header className="h-14 [@media(max-height:500px)]:h-11 shrink-0 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Open conversations"
                className="lg:hidden w-10 h-10 -ml-2 shrink-0 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 transition"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <div>
                <h1
                  title={activeTitle}
                  className="text-sm font-bold text-slate-900 truncate max-w-[60vw] md:max-w-xl"
                >
                  {activeTitle}
                </h1>
              </div>
            </div>
          </header>

          {/* Product deck for the active conversation */}
          <DeckStrip
            products={products}
            isLoadingConversation={isLoadingConversation}
            productUrl={productUrl}
            setProductUrl={setProductUrl}
            isAddingProduct={isAddingProduct}
            removingProductIds={removingProductIds}
            cachedProductIds={cachedProductIds}
            onAddProduct={addProduct}
            onRemoveProduct={removeProduct}
          />

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

          <div className="flex-1 min-h-0 px-4 md:px-6 lg:px-8 pb-3 flex flex-col max-w-5xl mx-auto w-full">
            <div
              ref={chatContainerRef}
              className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:none]"
            >
              <ChatWindow
                messages={messages}
                isAnswering={isAnswering}
                productCount={products.length}
                onSelectPrompt={askQuestion}
                containerRef={chatContainerRef}
                isLoadingConversation={isLoadingConversation}
                canRetry={canRetry}
                onRetry={retryLastQuestion}
              />
            </div>

            <ChatInput
              questionDraft={questionDraft}
              setQuestionDraft={setQuestionDraft}
              onAskQuestion={askQuestion}
              productCount={products.length}
              isAnswering={isAnswering}
              isLoadingConversation={isLoadingConversation}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
