import { useEffect } from "react";
import { ConversationList } from "./ConversationList";
import { Logo } from "../common/Logo";

export function Sidebar({
  open,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onRenameConversation,
  onDeleteConversation,
}) {
  // Below `lg` the sidebar is an off-canvas drawer; Escape closes it.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
        />
      )}

      {/* Slides with `left` (not transform) so the fixed-position row menu
          inside keeps positioning against the viewport. */}
      <aside
        className={`fixed inset-y-0 z-40 w-[85vw] max-w-[350px] transition-[left,visibility] duration-200 lg:relative lg:left-0 lg:z-auto lg:w-[350px] lg:max-w-none lg:visible bg-[#0b0f19] text-white flex flex-col overflow-hidden shrink-0 ${
          open ? "left-0" : "-left-[90vw] invisible"
        }`}
      >
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-blue-600/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-violet-600/10 blur-[100px] rounded-full" />

        <div className="relative z-10 flex flex-col h-full">
          <div className="px-6 pt-6 pb-5">
            <div className="flex items-center gap-3">
              <Logo />
              <button
                onClick={onClose}
                aria-label="Close conversations"
                className="lg:hidden ml-auto w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="mx-6 border-t border-white/[0.06]" />

          <ConversationList
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={onSelectConversation}
            onNew={onNewConversation}
            onRename={onRenameConversation}
            onDelete={onDeleteConversation}
          />
        </div>
      </aside>
    </>
  );
}
