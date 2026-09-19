import { ConversationList } from "./ConversationList";

export function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onRenameConversation,
  onDeleteConversation,
}) {
  return (
    <aside className="hidden lg:flex w-[350px] bg-[#0b0f19] text-white flex-col relative overflow-hidden shrink-0">
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-blue-600/20 blur-[100px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-violet-600/10 blur-[100px] rounded-full" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-blue-500/20">
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
            <h1 className="text-[17px] font-bold tracking-tight">ProductIQ</h1>
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
  );
}
