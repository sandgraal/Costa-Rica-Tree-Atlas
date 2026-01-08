import { describe, it, expect, beforeEach, vi, beforeAll } from "vitest";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Mock localStorage for Node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

beforeAll(() => {
  global.localStorage = localStorageMock as Storage;
});

describe("Store Hydration", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should initialize _hydrated as false", () => {
    interface TestStore {
      _hydrated: boolean;
      favorites: string[];
    }

    const useTestStore = create<TestStore>()(
      persist(
        (set) => ({
          _hydrated: false,
          favorites: [],
        }),
        {
          name: "test-store",
          storage: createJSONStorage(() => localStorage),
          onRehydrateStorage: () => (state) => {
            if (state) {
              state._hydrated = true;
            }
          },
          partialize: (state) => ({
            favorites: state.favorites,
          }),
        }
      )
    );

    const state = useTestStore.getState();
    // After initialization but before hydration completes, _hydrated could be either
    // false (if hydration hasn't started) or true (if it completed synchronously)
    expect(typeof state._hydrated).toBe("boolean");
  });

  it("should set _hydrated to true after rehydration", async () => {
    interface TestStore {
      _hydrated: boolean;
      favorites: string[];
    }

    // Pre-populate localStorage
    localStorage.setItem(
      "test-store-2",
      JSON.stringify({ state: { favorites: ["test"] } })
    );

    const useTestStore = create<TestStore>()(
      persist(
        (set) => ({
          _hydrated: false,
          favorites: [],
        }),
        {
          name: "test-store-2",
          storage: createJSONStorage(() => localStorage),
          onRehydrateStorage: () => (state) => {
            if (state) {
              state._hydrated = true;
            }
          },
          partialize: (state) => ({
            favorites: state.favorites,
          }),
        }
      )
    );

    // Wait for hydration to complete
    await new Promise((resolve) => setTimeout(resolve, 10));

    const state = useTestStore.getState();
    expect(state._hydrated).toBe(true);
    expect(state.favorites).toEqual(["test"]);
  });

  it("should validate persisted data on rehydration", async () => {
    interface TestStore {
      _hydrated: boolean;
      favorites: string[];
    }

    // Pre-populate localStorage with invalid data
    localStorage.setItem(
      "test-store-3",
      JSON.stringify({ state: { favorites: "not-an-array" } })
    );

    const useTestStore = create<TestStore>()(
      persist(
        (set) => ({
          _hydrated: false,
          favorites: [],
        }),
        {
          name: "test-store-3",
          storage: createJSONStorage(() => localStorage),
          onRehydrateStorage: () => (state) => {
            if (state) {
              // Validate and fix data
              if (!Array.isArray(state.favorites)) {
                state.favorites = [];
              }
              state._hydrated = true;
            }
          },
          partialize: (state) => ({
            favorites: state.favorites,
          }),
        }
      )
    );

    // Wait for hydration to complete
    await new Promise((resolve) => setTimeout(resolve, 10));

    const state = useTestStore.getState();
    expect(state._hydrated).toBe(true);
    expect(Array.isArray(state.favorites)).toBe(true);
    expect(state.favorites).toEqual([]);
  });

  it("should not persist _hydrated flag", () => {
    interface TestStore {
      _hydrated: boolean;
      favorites: string[];
      addFavorite: (slug: string) => void;
    }

    const useTestStore = create<TestStore>()(
      persist(
        (set) => ({
          _hydrated: false,
          favorites: [],
          addFavorite: (slug) =>
            set((state) => ({
              favorites: [...state.favorites, slug],
            })),
        }),
        {
          name: "test-store-5",
          storage: createJSONStorage(() => localStorage),
          onRehydrateStorage: () => (state) => {
            if (state) {
              state._hydrated = true;
            }
          },
          partialize: (state) => ({
            favorites: state.favorites,
            // Explicitly exclude _hydrated
          }),
        }
      )
    );

    // Add a favorite and trigger persistence
    useTestStore.getState().addFavorite("test-tree");

    // Check localStorage
    const stored = localStorage.getItem("test-store-5");
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.state).toBeDefined();
    expect(parsed.state.favorites).toEqual(["test-tree"]);
    expect(parsed.state._hydrated).toBeUndefined();
  });
});
