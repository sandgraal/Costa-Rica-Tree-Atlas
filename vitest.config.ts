import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // `.spec.tsx` was silently unmatched, so such a file would never have run.
    include: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
    // Without an explicit exclude, the walker descends into build output.
    exclude: ["node_modules/**", ".next/**", ".contentlayer/**", "dist/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        ".next/",
        "**/*.config.*",
        "**/types/**",
        "**/*.d.ts",
      ],
      /**
       * Ratchet, not an aspiration.
       *
       * Coverage was collected and nothing was required to meet it, so
       * `npm run test:coverage` printed numbers no one had to act on and
       * nothing blocked a regression. These are set just under the current
       * measured values: the point is to stop coverage sliding backwards, not
       * to assert the suite is comprehensive — it is not (see tests/CLAUDE.md).
       *
       * Raise them when you add coverage. Never lower them to make a build pass.
       */
      thresholds: {
        lines: 55,
        functions: 50,
        branches: 50,
        statements: 55,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@i18n": path.resolve(__dirname, "./i18n"),
      "contentlayer/generated": path.resolve(
        __dirname,
        "./.contentlayer/generated"
      ),
    },
  },
});
