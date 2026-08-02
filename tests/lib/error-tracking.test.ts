import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ErrorTrackingAdapter } from "@/lib/error-tracking";

/**
 * Guards the error-reporting seam.
 *
 * Before this, `__CRTA_ERROR_TRACKING_ADAPTER__` was read by
 * `getErrorTrackingAdapter()` and written by nothing in the repo, while
 * `src/instrumentation.ts` was an empty `register()`. Combined with
 * `compiler.removeConsole: true`, production reported no errors at all.
 */

type AdapterGlobal = typeof globalThis & {
  __CRTA_ERROR_TRACKING_ADAPTER__?: unknown;
};

function clearAdapter() {
  delete (globalThis as AdapterGlobal).__CRTA_ERROR_TRACKING_ADAPTER__;
}

describe("error tracking adapter registration", () => {
  beforeEach(() => {
    clearAdapter();
    vi.resetModules();
  });

  afterEach(() => {
    clearAdapter();
    vi.restoreAllMocks();
  });

  it("installs an adapter on the global", async () => {
    const { installConsoleErrorTracking } =
      await import("@/lib/error-tracking");

    expect(
      (globalThis as AdapterGlobal).__CRTA_ERROR_TRACKING_ADAPTER__
    ).toBeUndefined();

    installConsoleErrorTracking();

    expect(
      (globalThis as AdapterGlobal).__CRTA_ERROR_TRACKING_ADAPTER__
    ).toBeDefined();
  });

  it("is idempotent, so a real provider registered first is not clobbered", async () => {
    const { installConsoleErrorTracking, registerErrorTrackingAdapter } =
      await import("@/lib/error-tracking");

    const provider: ErrorTrackingAdapter = {
      withScope: vi.fn((cb) =>
        cb({
          setLevel: vi.fn(),
          setTag: vi.fn(),
          setExtra: vi.fn(),
          setUser: vi.fn(),
        })
      ),
      captureException: vi.fn(),
      captureMessage: vi.fn(),
    };

    registerErrorTrackingAdapter(provider);
    installConsoleErrorTracking();

    expect((globalThis as AdapterGlobal).__CRTA_ERROR_TRACKING_ADAPTER__).toBe(
      provider
    );
  });

  it("forwards captureException to the registered adapter with its tags", async () => {
    const { captureException, registerErrorTrackingAdapter } =
      await import("@/lib/error-tracking");
    vi.spyOn(console, "error").mockImplementation(() => {});

    const setTag = vi.fn();
    const captured: Error[] = [];
    registerErrorTrackingAdapter({
      withScope: (cb) =>
        cb({
          setLevel: vi.fn(),
          setTag,
          setExtra: vi.fn(),
          setUser: vi.fn(),
        }),
      captureException: (error) => captured.push(error),
      captureMessage: vi.fn(),
    });

    captureException(new Error("boom"), { tags: { area: "test" } });

    expect(captured).toHaveLength(1);
    expect(captured[0].message).toBe("boom");
    expect(setTag).toHaveBeenCalledWith("area", "test");
  });

  it("emits one structured JSON line per captured exception", async () => {
    const { captureException, installConsoleErrorTracking } =
      await import("@/lib/error-tracking");
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    installConsoleErrorTracking();
    captureException(new Error("kaboom"), {
      tags: { route: "/api/thing" },
    });

    const adapterLines = spy.mock.calls
      .map((args) => String(args[0]))
      .filter((line) => line.includes("crta.error-tracking"));

    expect(adapterLines).toHaveLength(1);
    const parsed = JSON.parse(adapterLines[0]);
    expect(parsed.kind).toBe("exception");
    expect(parsed.payload).toContain("kaboom");
    expect(parsed.tags).toMatchObject({ route: "/api/thing" });
  });
});
