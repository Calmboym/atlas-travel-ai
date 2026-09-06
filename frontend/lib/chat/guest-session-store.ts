import type { Conversation } from "@/lib/chat/types";

/**
 * ATLAS-P1-MEM-01 — sessionStorage-backed store for the guest chat
 * session (17_AI_EXPERIENCE.md §Memory: "Guest users: Session memory
 * until browser close"). A plain, `useSyncExternalStore`-compatible
 * vanilla store — not React state directly. This is the same pattern
 * components/providers/theme-provider.tsx and components/layout/
 * sidebar.tsx already established in this codebase for browser-only
 * persisted state, chosen over a useEffect+setState mount-hydration
 * approach: sidebar.tsx's own history comment records that the earlier
 * useEffect+setState version of that exact problem violated
 * react-hooks/set-state-in-effect and was fixed at the root by moving
 * to useSyncExternalStore, not by suppressing the rule. Same fix
 * applied here from the start.
 *
 * Unlike theme/sidebar, this store's value is a growing, actively
 * mutated object (not a single toggled primitive), so — unlike those
 * two — it needs an actual cached module-level snapshot rather than
 * reading straight through to storage on every call: re-parsing JSON
 * on every getSnapshot() would hand back a new object reference every
 * time even when nothing changed, which is exactly what
 * useSyncExternalStore's own "getSnapshot should be cached" guard
 * exists to catch.
 *
 * sessionStorage (not localStorage) is what gives the "until browser
 * close" behavior — the browser clears it itself; nothing here needs
 * to. It's also inherently per-tab, so unlike theme/sidebar there is no
 * cross-tab `storage` event to listen for, and no synthetic same-tab
 * event is needed either: nothing outside this module ever writes this
 * key, so there is nothing external to subscribe to beyond this
 * store's own update() calls notifying its own listeners.
 */

export interface GuestSession {
  conversations: Conversation[];
  activeConversationId: string;
}

const STORAGE_KEY = "atlas-chat-guest-session";

function isGuestSession(value: unknown): value is GuestSession {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<GuestSession>;
  return (
    Array.isArray(candidate.conversations) &&
    candidate.conversations.length > 0 &&
    typeof candidate.activeConversationId === "string"
  );
}

function readFromStorage(): GuestSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isGuestSession(parsed) ? parsed : null;
  } catch {
    // Corrupted JSON, or storage unavailable/disabled (private browsing,
    // quota) — fall back to a fresh session rather than ever throwing
    // out of a render.
    return null;
  }
}

function writeToStorage(session: GuestSession): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Same rationale as theme-provider.tsx's setTheme(): storage can
    // throw (private browsing, full quota). The in-memory store below
    // still serves the rest of this tab's session either way — losing
    // only the "survives a refresh" guarantee, not current
    // functionality.
  }
}

let cachedSession: GuestSession | null = null;
let serverSnapshot: GuestSession | null = null;
const listeners = new Set<() => void>();

/**
 * Read via useSyncExternalStore. `makeDefault` is supplied by the
 * caller (use-chat-session.ts owns conversation-shape concerns like
 * INITIAL_CONVERSATION_ID; this module stays generic) and is only ever
 * invoked the first time this module has no cached or persisted
 * session to return — every call after that returns the same
 * (potentially since-mutated) cached reference, never re-reading
 * storage.
 */
export function getGuestSessionSnapshot(
  makeDefault: () => GuestSession,
): GuestSession {
  cachedSession ??= readFromStorage() ?? makeDefault();
  return cachedSession;
}

/**
 * A fixed, referentially-stable value shared by every call during both
 * the server render and the client's hydration-reconciling render —
 * React's own contract for useSyncExternalStore calls this instead of
 * getGuestSessionSnapshot() for that first pass specifically, so both
 * sides render identical output and hydration never mismatches.
 */
export function getGuestSessionServerSnapshot(
  makeDefault: () => GuestSession,
): GuestSession {
  serverSnapshot ??= makeDefault();
  return serverSnapshot;
}

export function subscribeToGuestSession(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/** Every mutation (sendMessage, streaming chunks, startNewConversation,
 *  selectConversation, ...) goes through here: updates the cached
 *  value, persists it, and notifies useSyncExternalStore subscribers
 *  so React re-renders with the new snapshot. */
export function updateGuestSession(
  updater: (current: GuestSession) => GuestSession,
): void {
  if (!cachedSession) return; // Unreachable in practice — a snapshot is
  // always read (populating the cache) before any handler that could
  // call update() can fire.
  const next = updater(cachedSession);
  cachedSession = next;
  writeToStorage(next);
  listeners.forEach((listener) => listener());
}

/**
 * Test-only reset. Module-level state (`cachedSession`, `serverSnapshot`,
 * `listeners`) would otherwise leak between unrelated test cases within
 * the same test file — never called from application code.
 */
export function __resetGuestSessionStoreForTests(): void {
  cachedSession = null;
  serverSnapshot = null;
  listeners.clear();
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
