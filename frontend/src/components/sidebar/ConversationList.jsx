import { useState } from "react";

function formatRelativeTime(value) {
  const seconds = Math.max(0, (Date.now() - new Date(value).getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}) {
  // Two-step delete: first click arms the row, second click confirms.
  const [confirmingId, setConfirmingId] = useState(null);

  return (
    <div className="px-6 pt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
          Conversations
        </h2>
        <button
          onClick={onNew}
          className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition"
        >
          + New
        </button>
      </div>

      {conversations.length === 0 ? (
        <p className="text-xs text-slate-500 rounded-xl border border-dashed border-white/[0.08] p-3 text-center">
          No conversations yet
        </p>
      ) : (
        <ul className="space-y-1 max-h-[26vh] overflow-y-auto pr-1">
          {conversations.map((conversation) => {
            const isActive = conversation.id === activeId;
            const isConfirming = conversation.id === confirmingId;

            return (
              <li
                key={conversation.id}
                className={`group flex items-center gap-2 rounded-lg px-3 py-2 transition ${
                  isActive
                    ? "bg-white/[0.09] border border-white/[0.1]"
                    : "border border-transparent hover:bg-white/[0.05]"
                }`}
              >
                <button
                  onClick={() => onSelect(conversation.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="text-xs font-medium text-slate-200 truncate">
                    {conversation.title}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {conversation.productCount}{" "}
                    {conversation.productCount === 1 ? "product" : "products"}
                    {" · "}
                    {formatRelativeTime(conversation.updatedAt)}
                  </p>
                </button>

                {isConfirming ? (
                  <div className="flex items-center gap-2 shrink-0 text-[11px] font-semibold">
                    <button
                      onClick={() => {
                        setConfirmingId(null);
                        onDelete(conversation.id);
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmingId(null)}
                      className="text-slate-500 hover:text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmingId(conversation.id)}
                    aria-label="Delete conversation"
                    className="shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-600 hover:text-red-400 transition"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
