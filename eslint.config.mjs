import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import security from "eslint-plugin-security";
import noSecrets from "eslint-plugin-no-secrets";

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
  // Security plugins
  {
    plugins: {
      security,
      "no-secrets": noSecrets,
    },
  },
  // Custom rule overrides
  {
    rules: {
      // React Hooks rules - enforce correct dependencies
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      // Allow setState in useEffect for localStorage hydration patterns
      "react-hooks/set-state-in-effect": "off",
      // Allow dynamic component creation from useMDXComponent
      "react-hooks/static-components": "off",
      // Allow unused vars prefixed with underscore
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Security rules
      "security/detect-object-injection": "warn",
      "security/detect-non-literal-regexp": "warn",
      "security/detect-unsafe-regex": "error",
      "security/detect-buffer-noassert": "error",
      "security/detect-child-process": "warn",
      "security/detect-disable-mustache-escape": "error",
      "security/detect-eval-with-expression": "error",
      "security/detect-no-csrf-before-method-override": "error",
      "security/detect-possible-timing-attacks": "warn",
      "security/detect-pseudoRandomBytes": "error",
      // Secret detection
      "no-secrets/no-secrets": ["error", { "tolerance": 5.0 }],
      // TypeScript security
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unsafe-assignment": "off", // Too strict for Next.js
      "@typescript-eslint/no-unsafe-member-access": "off",
      // React security
      "react/no-danger": "warn",
      "react/no-danger-with-children": "error",
    },
  },
]);

export default eslintConfig;
