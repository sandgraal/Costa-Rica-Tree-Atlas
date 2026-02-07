import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useScrollLock, scrollLock } from "../useScrollLock";

// Mock window.scrollY
Object.defineProperty(window, "scrollY", {
  writable: true,
  configurable: true,
  value: 0,
});

describe("useScrollLock", () => {
  beforeEach(() => {
    // Reset body styles
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    delete document.body.dataset.scrollY;

    // Reset lock count by unlocking multiple times
    while (scrollLock.getCount() > 0) {
      scrollLock.unlock();
    }

    // Reset window properties
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  it("locks scroll when active", () => {
    renderHook(() => {
      useScrollLock(true);
    });
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.position).toBe("fixed");
  });

  it("does not lock scroll when inactive", () => {
    renderHook(() => {
      useScrollLock(false);
    });
    expect(document.body.style.overflow).toBe("");
    expect(document.body.style.position).toBe("");
  });

  it("unlocks scroll on unmount", () => {
    const { unmount } = renderHook(() => {
      useScrollLock(true);
    });
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("");
    expect(document.body.style.position).toBe("");
  });

  it("handles multiple locks correctly", () => {
    const { unmount: unmount1 } = renderHook(() => {
      useScrollLock(true);
    });
    const { unmount: unmount2 } = renderHook(() => {
      useScrollLock(true);
    });

    expect(scrollLock.getCount()).toBe(2);
    expect(document.body.style.overflow).toBe("hidden");

    // Unmount first - scroll should stay locked
    unmount1();
    expect(scrollLock.getCount()).toBe(1);
    expect(document.body.style.overflow).toBe("hidden");

    // Unmount second - now scroll unlocks
    unmount2();
    expect(scrollLock.getCount()).toBe(0);
    expect(document.body.style.overflow).toBe("");
  });

  it("toggles lock when active changes", () => {
    const { rerender } = renderHook(
      ({ active }) => {
        useScrollLock(active);
      },
      {
        initialProps: { active: true },
      }
    );

    expect(document.body.style.overflow).toBe("hidden");

    rerender({ active: false });
    expect(document.body.style.overflow).toBe("");
  });

  it("respects disableOnMobile option", () => {
    // Mock mobile viewport
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });

    renderHook(() => {
      useScrollLock(true, { disableOnMobile: true });
    });
    expect(document.body.style.overflow).toBe("");
  });

  it("uses custom mobile breakpoint", () => {
    // Mock viewport at 900px
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 900,
    });

    renderHook(() => {
      useScrollLock(true, { disableOnMobile: true, mobileBreakpoint: 1000 });
    });
    expect(document.body.style.overflow).toBe("");
  });

  it("saves and restores scroll position for iOS", () => {
    // Mock scroll position
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 150,
    });

    const scrollToSpy = vi.fn();
    window.scrollTo = scrollToSpy;

    const { unmount } = renderHook(() => useScrollLock(true));

    // Check that scroll position was saved
    expect(document.body.dataset.scrollY).toBe("150");
    expect(document.body.style.top).toBe("-150px");

    unmount();

    // Check that scroll position was restored
    expect(scrollToSpy).toHaveBeenCalledWith(0, 150);
    expect(document.body.dataset.scrollY).toBeUndefined();
  });

  it("preserves original overflow value", () => {
    document.body.style.overflow = "auto";

    const { unmount } = renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("auto");
  });

  it("handles case where component toggles active multiple times", () => {
    const { rerender } = renderHook(({ active }) => useScrollLock(active), {
      initialProps: { active: false },
    });

    // Should not lock
    expect(scrollLock.getCount()).toBe(0);
    expect(document.body.style.overflow).toBe("");

    // Lock
    rerender({ active: true });
    expect(scrollLock.getCount()).toBe(1);
    expect(document.body.style.overflow).toBe("hidden");

    // Unlock
    rerender({ active: false });
    expect(scrollLock.getCount()).toBe(0);
    expect(document.body.style.overflow).toBe("");

    // Lock again
    rerender({ active: true });
    expect(scrollLock.getCount()).toBe(1);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("defaults to active=true when no parameter provided", () => {
    renderHook(() => {
      useScrollLock();
    });
    expect(document.body.style.overflow).toBe("hidden");
    expect(scrollLock.getCount()).toBe(1);
  });

  it("imperative API works correctly", () => {
    expect(scrollLock.getCount()).toBe(0);

    scrollLock.lock();
    expect(scrollLock.getCount()).toBe(1);
    expect(document.body.style.overflow).toBe("hidden");

    scrollLock.lock();
    expect(scrollLock.getCount()).toBe(2);

    scrollLock.unlock();
    expect(scrollLock.getCount()).toBe(1);
    expect(document.body.style.overflow).toBe("hidden");

    scrollLock.unlock();
    expect(scrollLock.getCount()).toBe(0);
    expect(document.body.style.overflow).toBe("");
  });

  it("handles negative lock count gracefully", () => {
    expect(scrollLock.getCount()).toBe(0);

    // Attempt to unlock when already at 0
    scrollLock.unlock();
    expect(scrollLock.getCount()).toBe(0);

    // Lock and unlock should still work normally
    scrollLock.lock();
    expect(scrollLock.getCount()).toBe(1);

    scrollLock.unlock();
    expect(scrollLock.getCount()).toBe(0);
  });

  it("sets width to 100% on body when locked", () => {
    renderHook(() => useScrollLock(true));
    expect(document.body.style.width).toBe("100%");
  });

  it("clears width on body when unlocked", () => {
    const { unmount } = renderHook(() => useScrollLock(true));
    expect(document.body.style.width).toBe("100%");

    unmount();
    expect(document.body.style.width).toBe("");
  });
});
