import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ChatBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-white border border-slate-300 flex items-center justify-center mr-3 shrink-0 mt-1 shadow-md shadow-blue-500/10">
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
          className={`text-[12px] font-bold tracking-wider mb-1.5 ${isUser ? "text-slate-100" : "text-blue-600"}`}
        >
          {isUser ? "You" : "ProductIQ"}
        </div>

        <div
          className={`text-sm prose max-w-none ${isUser ? "prose-invert" : "prose-slate"}`}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
