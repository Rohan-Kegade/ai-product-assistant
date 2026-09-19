import { useEffect, useState } from "react";

function formatRelativeTime(value) {
  const seconds = Math.max(0, (Date.now() - new Date(value).getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const MENU_WIDTH = 144;
const MENU_HEIGHT = 84;

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDelete,
}) {
  // Two-step delete: choosing Delete arms the row, a second click confirms.
  const [confirmingId, setConfirmingId] = useState(null);
  // The "..." menu is positioned with `fixed` from the button's rect so the
  // scrolling list can't clip it.
  const [menu, setMenu] = useState(null); // { id, top, left }
  const [renamingId, setRenamingId] = useState(null);
  const [draftTitle, setDraftTitle] = useState("");

  useEffect(() => {
    if (!menu) return;

    const close = () => setMenu(null);
    const onKeyDown = (event) => event.key === "Escape" && close();

    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", close);

    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", close);
    };
  }, [menu]);

  const openMenu = (event, id) => {
    if (menu?.id === id) {
      setMenu(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const opensUp = rect.bottom + MENU_HEIGHT + 8 > window.innerHeight;

    setMenu({
      id,
      top: opensUp ? rect.top - MENU_HEIGHT - 4 : rect.bottom + 4,
      left: Math.max(8, rect.right - MENU_WIDTH),
    });
  };

  const startRename = (conversation) => {
    setMenu(null);
    setConfirmingId(null);
    setDraftTitle(conversation.title);
    setRenamingId(conversation.id);
  };

  const commitRename = (conversation) => {
    const next = draftTitle.replace(/\s+/g, " ").trim();
    setRenamingId(null);

    if (next && next !== conversation.title) {
      onRename(conversation.id, next);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col px-6 pt-5">
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
        <ul
          onScroll={() => setMenu(null)}
          className="space-y-1 flex-1 min-h-0 overflow-y-auto pr-1 pb-4"
        >
          {conversations.map((conversation) => {
            const isActive = conversation.id === activeId;
            const isConfirming = conversation.id === confirmingId;
            const isRenaming = conversation.id === renamingId;

            return (
              <li
                key={conversation.id}
                className={`group flex items-center gap-2 rounded-lg px-3 py-2 transition ${
                  isActive
                    ? "bg-white/[0.09] border border-white/[0.1]"
                    : "border border-transparent hover:bg-white/[0.05]"
                }`}
              >
                {isRenaming ? (
                  <input
                    autoFocus
                    value={draftTitle}
                    maxLength={255}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename(conversation);
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                    onBlur={() => setRenamingId(null)}
                    aria-label="Conversation name"
                    className="min-w-0 flex-1 h-7 px-2 rounded-md bg-white/[0.07] border border-blue-500/50 text-xs text-white outline-none"
                  />
                ) : (
                  <button
                    onClick={() => onSelect(conversation.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p
                      title={conversation.title}
                      className="text-xs font-medium text-slate-200 truncate"
                    >
                      {conversation.title}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {conversation.productCount}{" "}
                      {conversation.productCount === 1 ? "product" : "products"}
                      {" · "}
                      {formatRelativeTime(conversation.updatedAt)}
                    </p>
                  </button>
                )}

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
                  !isRenaming && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        // mousedown on the button must not reach the
                        // document listener that closes the menu, or a
                        // second click would reopen it right after closing.
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => openMenu(e, conversation.id)}
                        aria-label="Conversation options"
                        aria-haspopup="menu"
                        aria-expanded={menu?.id === conversation.id}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/[0.08] transition"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="5" cy="12" r="1.7" />
                          <circle cx="12" cy="12" r="1.7" />
                          <circle cx="19" cy="12" r="1.7" />
                        </svg>
                      </button>
                    </div>
                  )
                )}
              </li>
            );
          })}
        </ul>
      )}

      {menu && (
        <div
          role="menu"
          onMouseDown={(e) => e.stopPropagation()}
          style={{ top: menu.top, left: menu.left, width: MENU_WIDTH }}
          className="fixed z-50 rounded-lg border border-white/[0.1] bg-[#151b2b] shadow-xl shadow-black/40 py-1"
        >
          <button
            role="menuitem"
            onClick={() => {
              const target = conversations.find((c) => c.id === menu.id);
              if (target) startRename(target);
            }}
            className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-white/[0.07] transition"
          >
            Rename
          </button>
          <button
            role="menuitem"
            onClick={() => {
              setConfirmingId(menu.id);
              setMenu(null);
            }}
            className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-white/[0.07] transition"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
