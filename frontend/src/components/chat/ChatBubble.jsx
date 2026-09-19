import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { LogoMark } from "../common/Logo";

export function ChatBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && <LogoMark size={32} className="hidden sm:block mr-3 mt-1" />}

      <div
        className={`min-w-0 max-w-[94%] sm:max-w-[82%] [overflow-wrap:anywhere] ${
          isUser
            ? "bg-slate-900 text-white rounded-2xl rounded-br-md shadow-sm"
            : "bg-white border border-slate-200/80 text-slate-700 rounded-2xl rounded-bl-md shadow-sm"
        } px-3.5 py-3 sm:px-4 sm:py-3.5`}
      >
        <div
          className={`text-[12px] font-bold tracking-wider mb-1.5 ${isUser ? "text-slate-100" : "text-blue-600"}`}
        >
          {isUser ? "You" : "ProductIQ"}
        </div>

        <div
          className={`text-sm prose max-w-none ${isUser ? "prose-invert" : "prose-slate"}`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Wide tables scroll sideways instead of squeezing every
              // column to a sliver on a phone.
              table: ({ children }) => (
                <div className="overflow-x-auto [&_th]:min-w-[7rem] [&_td]:min-w-[7rem]">
                  <table>{children}</table>
                </div>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
