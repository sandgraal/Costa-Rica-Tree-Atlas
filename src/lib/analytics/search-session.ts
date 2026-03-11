/** Lazy-initialised anonymous session ID (persisted in sessionStorage) */
let inMemorySearchSessionId: string | null = null;

export function getSearchSessionId(): string {
  const KEY = "search_session_id";
  if (typeof window === "undefined") return "ssr";

  // If we already have an in-memory ID, prefer returning it to avoid
  // repeatedly touching storage/crypto in constrained environments.
  if (inMemorySearchSessionId) {
    return inMemorySearchSessionId;
  }

  try {
    const storage = window.sessionStorage;
    if (!storage) {
      throw new Error("sessionStorage unavailable");
    }

    let id = storage.getItem(KEY);
    if (!id) {
      const cryptoObj = window.crypto as Crypto | undefined;
      if (!cryptoObj || typeof cryptoObj.getRandomValues !== "function") {
        throw new Error("crypto.getRandomValues unavailable");
      }
      const arr = new Uint8Array(32);
      cryptoObj.getRandomValues(arr);
      id = Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
      storage.setItem(KEY, id);
    }

    inMemorySearchSessionId = id;
    return id;
  } catch {
    // Fallback: generate a non-cryptographic, in-memory-only ID so that
    // analytics can proceed without throwing, even if storage/crypto fail.
    if (!inMemorySearchSessionId) {
      inMemorySearchSessionId = `fallback-${Math.random().toString(36).slice(2)}`;
    }
    return inMemorySearchSessionId;
  }
}
