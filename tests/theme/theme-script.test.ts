/**
 * Theme Script Integration Tests
 *
 * These tests verify that the theme script:
 * 1. Generates valid JavaScript
 * 2. Correctly reads from localStorage
 * 3. Applies theme to DOM before first paint
 * 4. Handles edge cases gracefully
 */

import { describe, it, expect } from "vitest";
import { THEME_SCRIPT } from "@/lib/theme/theme-script";

describe("Theme Script", () => {
  describe("Script Generation", () => {
    it("should generate a non-empty script", () => {
      const script = THEME_SCRIPT;
      expect(script).toBeTruthy();
      expect(script.length).toBeGreaterThan(0);
    });

    it("should generate valid JavaScript syntax", () => {
      const script = THEME_SCRIPT;
      expect(() => new Function(script)).not.toThrow();
    });

    it("should be compact (< 2KB)", () => {
      const script = THEME_SCRIPT;
      expect(script.length).toBeLessThan(2000);
    });
  });

  describe("Script Content", () => {
    it("should include localStorage access", () => {
      const script = THEME_SCRIPT;
      expect(script).toContain("localStorage.getItem");
      expect(script).toContain("cr-tree-atlas");
    });

    it("should include DOM manipulation", () => {
      const script = THEME_SCRIPT;
      expect(script).toContain("classList.add");
      expect(script).toContain("setAttribute");
      expect(script).toContain("data-theme");
      expect(script).toContain("colorScheme");
    });

    it("should handle system preference", () => {
      const script = THEME_SCRIPT;
      expect(script).toContain("matchMedia");
      expect(script).toContain("prefers-color-scheme: dark");
    });

    it("should include error handling", () => {
      const script = THEME_SCRIPT;
      expect(script).toContain("try");
      expect(script).toContain("catch");
    });
  });

  describe("Script Execution Simulation", () => {
    it("should apply dark theme when stored", () => {
      const script = THEME_SCRIPT;
      const mockDOM: any = {
        documentElement: {
          classList: { add: (cls: string) => expect(cls).toBe("dark") },
          setAttribute: (attr: string, value: string) => {
            expect(attr).toBe("data-theme");
            expect(value).toBe("dark");
          },
          style: {},
        },
      };

      const mockEnv = {
        localStorage: {
          getItem: () => JSON.stringify({ state: { theme: "dark" } }),
        },
        window: {
          matchMedia: () => ({ matches: false }),
        },
        document: mockDOM,
        console: { error: () => {} },
      };

      const wrappedScript = `
        const localStorage = mockEnv.localStorage;
        const window = mockEnv.window;
        const document = mockEnv.document;
        const console = mockEnv.console;
        ${script}
      `;

      expect(() =>
        new Function("mockEnv", wrappedScript)(mockEnv)
      ).not.toThrow();
    });

    it("should apply light theme when stored", () => {
      const script = THEME_SCRIPT;
      const mockDOM: any = {
        documentElement: {
          classList: { add: (cls: string) => expect(cls).toBe("light") },
          setAttribute: (attr: string, value: string) => {
            expect(attr).toBe("data-theme");
            expect(value).toBe("light");
          },
          style: {},
        },
      };

      const mockEnv = {
        localStorage: {
          getItem: () => JSON.stringify({ state: { theme: "light" } }),
        },
        window: {
          matchMedia: () => ({ matches: true }),
        },
        document: mockDOM,
        console: { error: () => {} },
      };

      const wrappedScript = `
        const localStorage = mockEnv.localStorage;
        const window = mockEnv.window;
        const document = mockEnv.document;
        const console = mockEnv.console;
        ${script}
      `;

      expect(() =>
        new Function("mockEnv", wrappedScript)(mockEnv)
      ).not.toThrow();
    });

    it('should use system preference when theme is "system"', () => {
      const script = THEME_SCRIPT;
      const mockDOM: any = {
        documentElement: {
          classList: { add: (cls: string) => expect(cls).toBe("dark") },
          setAttribute: (attr: string, value: string) => {
            expect(attr).toBe("data-theme");
            expect(value).toBe("dark");
          },
          style: {},
        },
      };

      const mockEnv = {
        localStorage: {
          getItem: () => JSON.stringify({ state: { theme: "system" } }),
        },
        window: {
          matchMedia: () => ({ matches: true }), // Dark mode
        },
        document: mockDOM,
        console: { error: () => {} },
      };

      const wrappedScript = `
        const localStorage = mockEnv.localStorage;
        const window = mockEnv.window;
        const document = mockEnv.document;
        const console = mockEnv.console;
        ${script}
      `;

      expect(() =>
        new Function("mockEnv", wrappedScript)(mockEnv)
      ).not.toThrow();
    });

    it("should default to system preference when no stored theme", () => {
      const script = THEME_SCRIPT;
      const mockDOM: any = {
        documentElement: {
          classList: { add: (cls: string) => expect(cls).toBe("light") },
          setAttribute: (attr: string, value: string) => {
            expect(attr).toBe("data-theme");
            expect(value).toBe("light");
          },
          style: {},
        },
      };

      const mockEnv = {
        localStorage: {
          getItem: () => null, // No stored theme
        },
        window: {
          matchMedia: () => ({ matches: false }), // Light mode
        },
        document: mockDOM,
        console: { error: () => {} },
      };

      const wrappedScript = `
        const localStorage = mockEnv.localStorage;
        const window = mockEnv.window;
        const document = mockEnv.document;
        const console = mockEnv.console;
        ${script}
      `;

      expect(() =>
        new Function("mockEnv", wrappedScript)(mockEnv)
      ).not.toThrow();
    });

    it("should handle corrupted localStorage gracefully", () => {
      const script = THEME_SCRIPT;
      let errorCalled = false;
      const mockDOM: any = {
        documentElement: {
          classList: { add: () => {} },
          setAttribute: () => {},
          style: {},
        },
      };

      const mockEnv = {
        localStorage: {
          getItem: () => "invalid json",
        },
        window: {
          matchMedia: () => ({ matches: false }),
        },
        document: mockDOM,
        console: {
          error: () => {
            errorCalled = true;
          },
        },
      };

      const wrappedScript = `
        const localStorage = mockEnv.localStorage;
        const window = mockEnv.window;
        const document = mockEnv.document;
        const console = mockEnv.console;
        ${script}
      `;

      expect(() =>
        new Function("mockEnv", wrappedScript)(mockEnv)
      ).not.toThrow();
      expect(errorCalled).toBe(true);
    });
  });
});
