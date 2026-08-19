import { ChatBubble } from "./ChatBubble";
import { useEffect } from "react";

const SUGGESTED_PROMPTS = [
  "Summarize key features",
  "Biggest pros and cons?",
  "Is this worth buying?",
  "What's in the box?",
  "Compare these products",
  "Which one is better?",
  "Show key differences",
  "Best value for money",
];

export function ChatWindow({
  messages,
  asking,
  productsCount,
  onSelectPrompt,
  containerRef,
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

  if (messages.length === 0) {
    return (
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
          Add products to your product deck and ask AI to analyze features,
          compare specifications, evaluate value, or make a recommendation.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {SUGGESTED_PROMPTS.map((text) => (
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
        <ChatBubble key={index} message={message} />
      ))}

      {asking && (
        <div className="flex items-start">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-300 flex items-center justify-center mr-3 shrink-0">
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
  );
}
