/** Lazy-initialised anonymous session ID (persisted in sessionStorage) */
export function getSearchSessionId(): string {
  const KEY = "search_session_id";
  if (typeof window === "undefined") return "ssr";
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    id = Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
    sessionStorage.setItem(KEY, id);
  }
  return id;
}
