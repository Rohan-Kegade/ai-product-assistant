import { useEffect, useState, useSyncExternalStore } from "react";
import { ConversationList } from "./ConversationList";
import { Logo, LogoMark } from "../common/Logo";

const COLLAPSED_KEY = "sidebarCollapsed";
const DESKTOP_QUERY = "(min-width: 1024px)";

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

function writeCollapsed(value) {
  try {
    localStorage.setItem(COLLAPSED_KEY, value ? "1" : "0");
  } catch {
    // storage unavailable - the choice just won't survive a reload
  }
}

// Tracks the `lg` breakpoint in JS: the collapsed rail only exists on
// desktop, and the hidden layer must be `inert` (not just transparent) so it
// leaves the tab order.
function useIsDesktop() {
  return useSyncExternalStore(
    (notify) => {
      const query = window.matchMedia(DESKTOP_QUERY);
      query.addEventListener("change", notify);
      return () => query.removeEventListener("change", notify);
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}

function IconButton({ label, onClick, className = "", children }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-9 h-9 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition ${className}`}
    >
      <svg
        className="w-5 h-5 lg:w-4 lg:h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {children}
      </svg>
    </button>
  );
}

const pathProps = {
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: 2,
};

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
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const isDesktop = useIsDesktop();
  // Collapsing only applies on desktop; on phones it is always the drawer.
  const railMode = collapsed && isDesktop;

  const setCollapsedPersisted = (value) => {
    setCollapsed(value);
    writeCollapsed(value);
  };

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
          inside keeps positioning against the viewport. On desktop the width
          animates between the full sidebar and a slim rail. */}
      <aside
        className={`fixed inset-y-0 z-40 w-[85vw] max-w-[300px] transition-[left,visibility] duration-200 lg:relative lg:left-0 lg:z-auto lg:max-w-none lg:visible lg:transition-[width] lg:duration-300 lg:ease-in-out bg-[#0b0f19] text-white overflow-hidden shrink-0 ${
          railMode ? "lg:w-[68px]" : "lg:w-[280px]"
        } ${open ? "left-0" : "-left-[90vw] invisible"}`}
      >
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-blue-600/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-violet-600/10 blur-[100px] rounded-full" />

        {/* Expanded layer: fixed width so the content is clipped, not
            reflowed, while the aside animates. */}
        <div
          inert={railMode}
          className={`absolute inset-y-0 left-0 z-10 flex w-[85vw] max-w-[300px] flex-col transition-opacity duration-200 lg:w-[280px] lg:max-w-none ${
            railMode ? "opacity-0 pointer-events-none" : "opacity-100 delay-100"
          }`}
        >
          <div className="px-5 pt-6 pb-5">
            <div className="flex items-center gap-3">
              <Logo />

              <IconButton
                label="Close conversations"
                onClick={onClose}
                className="lg:hidden ml-auto"
              >
                <path {...pathProps} d="M6 18L18 6M6 6l12 12" />
              </IconButton>

              <IconButton
                label="Collapse sidebar"
                onClick={() => setCollapsedPersisted(true)}
                className="hidden lg:flex ml-auto"
              >
                <path {...pathProps} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </IconButton>
            </div>
          </div>

          <div className="mx-5 border-t border-white/[0.06]" />

          <ConversationList
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={onSelectConversation}
            onNew={onNewConversation}
            onRename={onRenameConversation}
            onDelete={onDeleteConversation}
          />
        </div>

        {/* Collapsed rail (desktop only). */}
        <div
          inert={!railMode}
          className={`absolute inset-y-0 left-0 z-10 hidden w-[68px] flex-col items-center gap-2 pt-6 transition-opacity duration-200 lg:flex ${
            railMode ? "opacity-100 delay-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <LogoMark size={40} className="mb-4" />

          <IconButton
            label="Expand sidebar"
            onClick={() => setCollapsedPersisted(false)}
          >
            <path {...pathProps} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </IconButton>

          <IconButton label="New conversation" onClick={onNewConversation}>
            <path {...pathProps} d="M12 5v14M5 12h14" />
          </IconButton>
        </div>
      </aside>
    </>
  );
}
