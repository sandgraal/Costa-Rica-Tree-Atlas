/**
 * MDX Components - Main Export
 *
 * This file re-exports MDX components from server and client modules,
 * maintaining backward compatibility while enabling proper RSC architecture.
 *
 * Server components are in server-components.tsx (no "use client")
 * Client components are split into individual files in client/ directory,
 * each with its own "use client" boundary for per-component code-splitting.
 */

import { mdxServerComponents } from "./server-components";
import { mdxClientComponents } from "./client";

/**
 * Combined MDX components object
 * Merges server and client components for use in MDX content
 */
export const mdxComponents = {
  ...mdxServerComponents,
  ...mdxClientComponents,
};

// Re-export individual components for direct imports (backward compatibility)
export * from "./server-components";
export * from "./client";
