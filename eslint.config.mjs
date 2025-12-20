import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated files
    ".contentlayer/**",
    // Service worker (vanilla JS)
    "public/sw.js",
    // Scripts
    "scripts/**",
  ]),
  // Custom rule overrides
  {
    rules: {
      // Allow setState in useEffect for localStorage hydration patterns
      "react-hooks/set-state-in-effect": "off",
      // Allow dynamic component creation from useMDXComponent
      "react-hooks/static-components": "off",
    },
  },
]);

export default eslintConfig;
