import { ChatBubble } from "./ChatBubble";
import { LogoMark } from "../common/Logo";
import { useEffect } from "react";

const SINGLE_PRODUCT_PROMPTS = [
  "Summarize key features",
  "Biggest pros and cons?",
  "Is this worth buying?",
  "What's in the box?",
  "What do reviews say?",
  "Who is this best for?",
  "Any common complaints?",
  "Is the price fair?",
];

const MULTI_PRODUCT_PROMPTS = [
  "Compare these products",
  "Which one is better?",
  "Show key differences",
  "Best value for money",
  "Compare them in a table",
  "Which has better reviews?",
  "Which should I buy and why?",
  "Pros and cons of each",
];

export function ChatWindow({
  messages,
  asking,
  productsCount,
  onSelectPrompt,
  containerRef,
  loading,
  canRetry,
  onRetry,
}) {
  // Smoothly scroll the container to the maximum height on content change
  useEffect(() => {
    if (containerRef?.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, asking, containerRef]);

  if (loading) {
    return (
      <div
        className="space-y-6 py-4"
        aria-busy="true"
        aria-label="Loading conversation"
      >
        {[
          { align: "justify-end", width: "w-1/3" },
          { align: "justify-start", width: "w-2/3" },
          { align: "justify-end", width: "w-1/4" },
        ].map(({ align, width }, index) => (
          <div key={index} className={`flex ${align}`}>
            <div
              className={`${width} h-16 rounded-2xl bg-slate-200/70 animate-pulse`}
            />
          </div>
        ))}
      </div>
    );
  }

  const suggestedPrompts =
    productsCount > 1 ? MULTI_PRODUCT_PROMPTS : SINGLE_PRODUCT_PROMPTS;

  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6">
        <div className="relative mb-7">
          <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full" />
          <LogoMark size={80} className="relative drop-shadow-lg" />
        </div>

        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 text-center">
          What would you like to know?
        </h2>

        <p className="text-sm text-slate-500 mt-2 text-center max-w-md leading-6">
          Add products above and ask AI to analyze features, compare
          specifications, evaluate value, or make a recommendation.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {suggestedPrompts.map((text) => (
            <button
              key={text}
              onClick={() => onSelectPrompt(text)}
              disabled={productsCount === 0}
              className="px-3.5 py-2 rounded-full border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 text-xs font-medium text-slate-900 transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {text}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      {messages.map((message, index) => (
        <ChatBubble key={message.id ?? index} message={message} />
      ))}

      {canRetry && (
        <div className="flex justify-start pl-11">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:border-blue-300 hover:text-blue-600 text-xs font-medium text-slate-700 transition shadow-xs"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h5M20 20v-5h-5M5.6 15A8 8 0 0019 13M18.4 9A8 8 0 005 11"
              />
            </svg>
            Retry
          </button>
        </div>
      )}

      {asking && messages[messages.length - 1]?.role !== "assistant" && (
        <div className="flex items-start">
          <LogoMark size={32} className="mr-3" />

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
  );
}
