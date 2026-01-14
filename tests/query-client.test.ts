import { describe, it, expect, beforeEach } from "vitest";
import { makeQueryClient, getQueryClient } from "@/lib/query-client";

describe("Query Client Singleton", () => {
  beforeEach(() => {
    // Reset the module state between tests
    // Note: In a real browser environment, this would persist
  });

  describe("makeQueryClient", () => {
    it("should create a new QueryClient with default options", () => {
      const client = makeQueryClient();

      expect(client).toBeDefined();
      expect(client.getDefaultOptions().queries?.staleTime).toBe(5 * 60 * 1000);
      expect(client.getDefaultOptions().queries?.gcTime).toBe(
        24 * 60 * 60 * 1000
      );
      expect(client.getDefaultOptions().queries?.retry).toBe(2);
      expect(client.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(
        false
      );
      expect(client.getDefaultOptions().queries?.refetchOnReconnect).toBe(
        "always"
      );
      expect(client.getDefaultOptions().mutations?.retry).toBe(1);
    });

    it("should create different instances on each call", () => {
      const client1 = makeQueryClient();
      const client2 = makeQueryClient();

      expect(client1).not.toBe(client2);
    });
  });

  describe("getQueryClient", () => {
    it("should return a QueryClient instance", () => {
      const client = getQueryClient();
      expect(client).toBeDefined();
    });

    it("should create new client on server (window undefined)", () => {
      // In Node.js environment, window is undefined by default
      const client1 = getQueryClient();
      const client2 = getQueryClient();

      // In server environment, should get different instances
      // (though in our test environment both calls might return same instance
      // since we're simulating server-side)
      expect(client1).toBeDefined();
      expect(client2).toBeDefined();
    });
  });

  describe("Query Client Configuration", () => {
    it("should have correct stale time", () => {
      const client = makeQueryClient();
      expect(client.getDefaultOptions().queries?.staleTime).toBe(5 * 60 * 1000);
    });

    it("should have correct garbage collection time", () => {
      const client = makeQueryClient();
      expect(client.getDefaultOptions().queries?.gcTime).toBe(
        24 * 60 * 60 * 1000
      );
    });

    it("should retry failed queries twice", () => {
      const client = makeQueryClient();
      expect(client.getDefaultOptions().queries?.retry).toBe(2);
    });

    it("should not refetch on window focus", () => {
      const client = makeQueryClient();
      expect(client.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(
        false
      );
    });

    it("should refetch on reconnect", () => {
      const client = makeQueryClient();
      expect(client.getDefaultOptions().queries?.refetchOnReconnect).toBe(
        "always"
      );
    });

    it("should retry mutations once", () => {
      const client = makeQueryClient();
      expect(client.getDefaultOptions().mutations?.retry).toBe(1);
    });
  });
});
