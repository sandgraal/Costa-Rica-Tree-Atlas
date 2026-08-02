import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce, useDebouncedCallback } from "../useDebounce";

/**
 * These replace three tests that asserted only:
 *   expect(typeof useDebounce).toBe("function")
 *   expect(useDebounce).toBeDefined()
 *   expect(useDebounce.length).toBe(1)
 *   expect(useDebounce).toBeTypeOf("function")
 *
 * The hook was never rendered, debouncing was never exercised, and no timers
 * were faked. You could have replaced the entire body with `return value` —
 * removing debouncing altogether — and all three still passed. `useDebounce`
 * sits on the critical path of the global search (QuickSearch.tsx).
 */
describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 300));
    expect(result.current).toBe("initial");
  });

  it("does NOT update before the delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "first" } }
    );

    rerender({ value: "second" });
    expect(result.current).toBe("first");

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe("first");
  });

  it("updates once the delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "first" } }
    );

    rerender({ value: "second" });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("second");
  });

  it("collapses rapid changes into the final value only", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } }
    );

    // Typing: each keystroke restarts the timer.
    for (const value of ["ab", "abc", "abcd"]) {
      rerender({ value });
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(result.current).toBe("a");
    }

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("abcd");
  });

  it("honours a custom delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 1000),
      { initialProps: { value: "first" } }
    );

    rerender({ value: "second" });
    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(result.current).toBe("first");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("second");
  });

  it("defaults to a 300ms delay", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: "first" },
    });

    rerender({ value: "second" });
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe("first");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("second");
  });

  it("works for non-string values", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: { count: 1 } } }
    );

    const next = { count: 2 };
    rerender({ value: next });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe(next);
  });
});

describe("useDebouncedCallback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("invokes the callback once, after the delay, with the last args", () => {
    const spy = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(spy, 200));

    act(() => {
      result.current("a");
      result.current("b");
      result.current("c");
    });
    expect(spy).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("c");
  });

  it("keeps a stable identity across renders", () => {
    // The previous implementation returned a fresh closure every render, which
    // silently defeated memoization in any consumer.
    const { result, rerender } = renderHook(
      ({ cb }) => useDebouncedCallback(cb, 200),
      { initialProps: { cb: vi.fn() } }
    );

    const first = result.current;
    rerender({ cb: vi.fn() });
    expect(result.current).toBe(first);
  });

  it("calls the latest callback, not the one captured at first render", () => {
    const stale = vi.fn();
    const fresh = vi.fn();
    const { result, rerender } = renderHook(
      ({ cb }) => useDebouncedCallback(cb, 200),
      { initialProps: { cb: stale } }
    );

    rerender({ cb: fresh });
    act(() => {
      result.current();
      vi.advanceTimersByTime(200);
    });

    expect(stale).not.toHaveBeenCalled();
    expect(fresh).toHaveBeenCalledTimes(1);
  });

  it("does not fire after unmount", () => {
    // The previous implementation never cleared its timer, so a pending
    // callback could run against a torn-down component.
    const spy = vi.fn();
    const { result, unmount } = renderHook(() =>
      useDebouncedCallback(spy, 200)
    );

    act(() => {
      result.current();
    });
    unmount();
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(spy).not.toHaveBeenCalled();
  });
});
