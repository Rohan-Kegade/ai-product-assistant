import { LoadingSpinner } from "../common/LoadingSpinner";

export function ChatInput({
  questionDraft,
  setQuestionDraft,
  onAskQuestion,
  productCount,
  isAnswering,
  isLoadingConversation,
}) {
  const isDisabled = productCount === 0 || isAnswering || isLoadingConversation;

  return (
    <div className="pt-3 pb-[env(safe-area-inset-bottom)] border-t border-slate-200/60 shrink-0">
      <div
        className={`relative flex items-center rounded-2xl border transition shadow-sm ${
          productCount === 0
            ? "bg-slate-100/70 border-slate-200"
            : "bg-white border-slate-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/10"
        }`}
      >
        <input
          value={questionDraft}
          disabled={isDisabled}
          onChange={(e) => setQuestionDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onAskQuestion();
            }
          }}
          placeholder={
            isLoadingConversation
              ? "Loading conversation..."
              : productCount === 0
                ? "Add a product to start..."
                : "Ask about your products..."
          }
          className="min-w-0 flex-1 h-12 sm:h-14 bg-transparent px-4 text-base sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none disabled:cursor-not-allowed"
        />

        <button
          onClick={onAskQuestion}
          disabled={!questionDraft.trim() || isDisabled}
          className="mr-2 w-10 h-10 rounded-xl bg-slate-900 hover:bg-blue-600 text-white flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isAnswering ? (
            <LoadingSpinner size="sm" color="white" />
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

      <div className="hidden sm:flex [@media(max-height:500px)]:hidden items-center justify-end mt-2 px-1">
        <span className="text-[10px] text-slate-400">Press Enter to send</span>
      </div>
    </div>
  );
}
