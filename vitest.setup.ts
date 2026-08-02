import "@testing-library/jest-dom/vitest";

/**
 * In-memory localStorage / sessionStorage.
 *
 * This jsdom build does not provide Web Storage unless Node is started with
 * `--localstorage-file`, which is why runs print:
 *
 *   ExperimentalWarning: localStorage is not available because
 *   --localstorage-file was not provided.
 *
 * Anything touching persistence (the zustand store, education progress, the
 * search-session id) therefore had no storage to talk to under test, so those
 * paths were effectively untestable. Installed here rather than per-file
 * because module-level code runs before a file's own `beforeAll`.
 */
function createMemoryStorage(): Storage {
  let entries = new Map<string, string>();

  return {
    get length() {
      return entries.size;
    },
    key: (index: number) => [...entries.keys()][index] ?? null,
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => {
      entries.set(key, String(value));
    },
    removeItem: (key: string) => {
      entries.delete(key);
    },
    clear: () => {
      entries = new Map<string, string>();
    },
  };
}

for (const name of ["localStorage", "sessionStorage"] as const) {
  // Only install when absent — never shadow a real implementation.
  const existing = (globalThis as Record<string, unknown>)[name];
  if (existing) continue;

  const storage = createMemoryStorage();
  for (const target of [
    globalThis,
    typeof window !== "undefined" ? window : null,
  ]) {
    if (!target) continue;
    Object.defineProperty(target, name, {
      value: storage,
      configurable: true,
      writable: true,
    });
  }
}
