// Remembers which conversation is open, in two places:
//  - the URL hash (#/c/<id>), so a link resumes it, e.g. in another tab
//  - localStorage, so a bare URL reopens the last conversation
// The hash wins on load.

const STORAGE_KEY = "conversationId";
const HASH_PATTERN = /^#\/c\/([0-9a-f-]{36})$/i;

function readHash() {
  const match = window.location.hash.match(HASH_PATTERN);
  return match ? match[1] : null;
}

function readStorage() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeHash(id) {
  const next = id ? `#/c/${id}` : "";
  if (window.location.hash === next) return;
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${window.location.search}${next}`,
  );
}

function writeStorage(id) {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage unavailable - the conversation just won't survive a refresh
  }
}

export const readHashConversationId = readHash;

export function loadActiveConversationId() {
  return readHash() || readStorage();
}

export function saveActiveConversationId(id) {
  writeStorage(id);
  writeHash(id);
}
