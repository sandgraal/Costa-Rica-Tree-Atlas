import { describe, it, expect, vi } from "vitest";
import type { QueryClient } from "@tanstack/react-query";
import * as queryClientModule from "@/lib/query-client";

describe("Query Helpers", () => {
  describe("invalidateTreeQueries", () => {
    it("should call invalidateQueries with tree queryKey", async () => {
      const mockInvalidate = vi.fn();
      const mockClient = {
        invalidateQueries: mockInvalidate,
      } as unknown as QueryClient;

      vi.spyOn(queryClientModule, "getQueryClient").mockReturnValue(mockClient);

      const { invalidateTreeQueries } = await import("@/lib/query-helpers");

      invalidateTreeQueries();

      expect(mockInvalidate).toHaveBeenCalledWith({ queryKey: ["trees"] });

      vi.restoreAllMocks();
    });
  });

  describe("clearQueryCache", () => {
    it("should clear all cached queries", async () => {
      const mockClear = vi.fn();
      const mockClient = {
        clear: mockClear,
      } as unknown as QueryClient;

      vi.spyOn(queryClientModule, "getQueryClient").mockReturnValue(mockClient);

      const { clearQueryCache } = await import("@/lib/query-helpers");

      clearQueryCache();

      expect(mockClear).toHaveBeenCalled();

      vi.restoreAllMocks();
    });
  });

  describe("prefetchTree", () => {
    it("should call prefetchQuery with correct parameters", async () => {
      const mockPrefetch = vi.fn();
      const mockClient = {
        prefetchQuery: mockPrefetch,
      } as unknown as QueryClient;

      vi.spyOn(queryClientModule, "getQueryClient").mockReturnValue(mockClient);

      const { prefetchTree } = await import("@/lib/query-helpers");

      await prefetchTree("ceiba", "en");

      expect(mockPrefetch).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ["tree", "ceiba", "en"],
          staleTime: 5 * 60 * 1000,
        })
      );

      vi.restoreAllMocks();
    });
  });
});
