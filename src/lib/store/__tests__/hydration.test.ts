import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { STORE_KEY } from "../index";

/**
 * Tests the REAL store.
 *
 * The previous version of this file never imported `@/lib/store`. Each of its
 * four tests built a fresh inline zustand store with its own three-line
 * `onRehydrateStorage` and its own `partialize`, then asserted against those.
 * So "should validate persisted data on rehydration" validated the test's own
 * `if (!Array.isArray(...)) state.favorites = []` — not the ~145-line
 * production validator in src/lib/store/index.ts, which handles heightRange,
 * useCategory, family, conservationStatus, tags, distribution, scalar→array
 * migration, theme sync, and sort validation.
 *
 * The entire production rehydration path could have been deleted and every one
 * of those tests would still have passed. The store is consumed by 12 files and
 * had, in effect, zero coverage.
 */

function seedStorage(value: unknown) {
  localStorage.setItem(STORE_KEY, JSON.stringify({ state: value, version: 0 }));
}

/**
 * Import the store fresh so `persist` rehydrates from whatever we just seeded.
 * zustand hydrates at module-evaluation time, so the reset must come first.
 */
async function loadStore() {
  vi.resetModules();
  const mod = await import("../index");
  return mod.useStore;
}

describe("store rehydration (real store)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("marks itself hydrated and does not persist the _hydrated flag", async () => {
    const useStore = await loadStore();
    expect(useStore.getState()._hydrated).toBe(true);

    useStore.getState().addFavorite("ceiba");

    const persisted = JSON.parse(localStorage.getItem(STORE_KEY) as string);
    expect(persisted.state.favorites).toContain("ceiba");
    expect(persisted.state).not.toHaveProperty("_hydrated");
  });

  it("repairs a non-array favorites list", async () => {
    seedStorage({ favorites: "not-an-array", recentlyViewed: [] });
    const useStore = await loadStore();
    expect(useStore.getState().favorites).toEqual([]);
  });

  it("repairs a non-array recentlyViewed list", async () => {
    seedStorage({ favorites: [], recentlyViewed: { nope: true } });
    const useStore = await loadStore();
    expect(useStore.getState().recentlyViewed).toEqual([]);
  });

  it("falls back to the system theme when the persisted theme is invalid", async () => {
    seedStorage({ favorites: [], recentlyViewed: [], theme: "chartreuse" });
    const useStore = await loadStore();
    expect(useStore.getState().theme).toBe("system");
  });

  it("nulls a savedSearchFilter that is not a plain object", async () => {
    seedStorage({
      favorites: [],
      recentlyViewed: [],
      savedSearchFilter: ["not", "an", "object"],
    });
    const useStore = await loadStore();
    expect(useStore.getState().savedSearchFilter).toBeNull();
  });

  it("drops invalid heightRange entries", async () => {
    seedStorage({
      favorites: [],
      recentlyViewed: [],
      savedSearchFilter: { heightRange: ["large", "definitely-not-a-range"] },
    });
    const useStore = await loadStore();

    const filter = useStore.getState().savedSearchFilter;
    expect(filter?.heightRange).toEqual(["large"]);
  });

  it("migrates a legacy scalar heightRange to an array", async () => {
    // Older builds persisted a single string here. This migration is one of the
    // behaviours the old fake-store tests could not have exercised at all.
    seedStorage({
      favorites: [],
      recentlyViewed: [],
      savedSearchFilter: { heightRange: "large" },
    });
    const useStore = await loadStore();

    const filter = useStore.getState().savedSearchFilter;
    expect(Array.isArray(filter?.heightRange)).toBe(true);
    expect(filter?.heightRange).toEqual(["large"]);
  });

  it("survives corrupted JSON without throwing", async () => {
    localStorage.setItem(STORE_KEY, "{ this is not json");
    const useStore = await loadStore();

    expect(useStore.getState().favorites).toEqual([]);

    // Resolved on a microtask: with no parsable state there is no object for
    // onRehydrateStorage to mutate, so the flag is set through the store API.
    await Promise.resolve();
    expect(useStore.getState()._hydrated).toBe(true);
  });
});
