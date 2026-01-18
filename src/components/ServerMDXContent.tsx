/**
 * Server-side MDX Content Renderer
 *
 * This component renders MDX content on the server WITHOUT requiring
 * client-side JavaScript evaluation (no new Function() or eval()).
 *
 * WHY THIS EXISTS:
 * - Contentlayer2's getMDXComponent/useMDXComponent use `new Function()` to
 *   hydrate MDX content on the client, which violates strict CSP policies
 * - This approach pre-renders MDX to React elements entirely on the server
 * - No `unsafe-eval` is needed in the CSP
 * - The content is fully interactive (custom components work normally)
 *
 * HOW IT WORKS:
 * 1. Takes raw MDX source (from contentlayer's body.raw)
 * 2. Compiles and evaluates MDX on the Node.js server (no CSP restrictions)
 * 3. Returns pre-rendered React elements that hydrate normally on client
 *
 * SECURITY BENEFIT:
 * - Removes the need for 'unsafe-eval' in Content Security Policy
 * - MDX code execution happens only on the server, not in the browser
 * - Reduces attack surface for XSS vulnerabilities
 *
 * IMPORTANT: This is a React Server Component (RSC). It must NOT be marked
 * with "use client" and should only be used in server component contexts.
 */

import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { mdxComponents } from "@/components/mdx";
import { AutoGlossaryLink } from "@/components/AutoGlossaryLink";
import { createHash } from "crypto";

interface GlossaryTerm {
  term: string;
  slug: string;
  locale: string;
  simpleDefinition?: string;
}

interface ServerMDXContentProps {
  /** Raw MDX source content (from contentlayer body.raw) */
  source: string;
  /** Additional components to pass to MDX */
  components?: Record<string, React.ComponentType<unknown>>;
  /** Glossary terms for automatic linking */
  glossaryTerms?: GlossaryTerm[];
  /** Enable automatic glossary term linking */
  enableGlossaryLinks?: boolean;
}

// Cache for compiled MDX content - keyed by hash of source
// This prevents re-compilation on every render
// Note: For typical content volumes (hundreds of pages), this cache is manageable.
// In production environments with thousands of unique MDX sources, consider:
// - Implementing LRU (Least Recently Used) eviction
// - Setting a max cache size limit
// - Using external caching (Redis, etc.)
const mdxCache = new Map<string, Awaited<ReturnType<typeof evaluate>>>();

// Maximum cache size - prevents unbounded memory growth
const MAX_CACHE_SIZE = 1000;

/**
 * Evict oldest inserted entries when cache grows too large
 * Note: This is FIFO (First In, First Out) eviction, not LRU.
 * Map iteration order reflects insertion order, not access order.
 */
function evictOldestInsertedEntries() {
  if (mdxCache.size <= MAX_CACHE_SIZE) return;

  // Delete oldest 10% of entries
  const entriesToDelete = Math.floor(MAX_CACHE_SIZE * 0.1);
  const iterator = mdxCache.keys();

  for (let i = 0; i < entriesToDelete; i++) {
    const key = iterator.next().value;
    if (key) mdxCache.delete(key);
  }
}

/**
 * Generate a hash key for caching MDX compilation results
 */
function getCacheKey(source: string): string {
  return createHash("sha256").update(source).digest("hex");
}

/**
 * Error fallback component for MDX compilation failures
 */
function MDXErrorFallback({ error }: { error: unknown }) {
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div
      className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 my-4"
      role="alert"
    >
      <h3 className="text-lg font-semibold text-destructive mb-2">
        Content Rendering Error
      </h3>
      <p className="text-sm text-foreground/80 mb-3">
        We encountered an issue while rendering this content. Please try
        refreshing the page.
      </p>
      {isDevelopment && (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer font-medium mb-2">
            Technical Details (Development Only)
          </summary>
          <pre className="bg-muted p-3 rounded overflow-x-auto">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </details>
      )}
    </div>
  );
}

/**
 * Server-side MDX renderer that avoids eval()
 *
 * This is an async server component that compiles and renders MDX
 * content entirely on the server. The resulting React elements are
 * then sent to the client as pre-rendered HTML.
 *
 * SECURITY NOTE:
 * This component assumes MDX source comes from trusted sources (our own content files).
 * The `source` parameter should NEVER contain user-generated or external content.
 * If you need to render user-provided MDX, additional validation and sandboxing are required.
 *
 * Features:
 * - Caches compiled MDX by source hash to avoid repeated compilation
 * - Gracefully handles malformed MDX with error fallback UI
 * - Respects NODE_ENV for development mode features
 *
 * @param source - Raw MDX source string (use tree.body.raw)
 * @param components - Optional additional MDX components
 * @param glossaryTerms - Optional glossary terms for auto-linking
 * @param enableGlossaryLinks - Whether to enable glossary auto-linking
 */
export async function ServerMDXContent({
  source,
  components = {},
  glossaryTerms = [],
  enableGlossaryLinks = false,
}: ServerMDXContentProps) {
  const isDevelopment = process.env.NODE_ENV === "development";

  // Check cache first
  const cacheKey = getCacheKey(source);
  let result = mdxCache.get(cacheKey);

  // Merge default MDX components with any additional ones passed in
  const allComponents = { ...mdxComponents, ...components };

  if (!result) {
    try {
      // Evaluate MDX on the server - this compiles and runs in one step
      // The execution happens on Node.js where there are no CSP restrictions
      result = await evaluate(source, {
        // Spread the jsx-runtime to provide createElement, Fragment, etc.
        ...runtime,
        // Use development mode based on NODE_ENV for better errors/warnings in dev
        development: isDevelopment,
        // Required for import.meta resolution in compiled code
        baseUrl: import.meta.url,
        // Enable MDX provider support for component resolution
        providerImportSource: "@mdx-js/react",
        // Provide components using the useMDXComponents pattern
        // This allows MDX to find components when rendering JSX elements
        useMDXComponents: () => allComponents,
      });

      // Cache the compiled result
      mdxCache.set(cacheKey, result);

      // Evict old entries if cache is too large
      evictOldestInsertedEntries();
    } catch (error) {
      // Gracefully handle MDX compilation/evaluation errors
      // Only log in development to avoid exposing sensitive information
      if (isDevelopment) {
        console.error("Failed to compile/evaluate MDX content:", error);
      } else {
        // In production, log a sanitized version
        console.error("MDX compilation failed", {
          timestamp: new Date().toISOString(),
          sourceLength: source.length,
          // Don't log the actual source or detailed error message
        });
      }
      return <MDXErrorFallback error={error} />;
    }
  }

  const { default: MDXContent } = result;

  // Render the MDX content with components provided via the components prop
  // This is the standard MDX v3 pattern for providing custom components
  const content = <MDXContent components={allComponents} />;

  // Optionally wrap in AutoGlossaryLink for automatic term linking
  if (enableGlossaryLinks && glossaryTerms.length > 0) {
    return (
      <AutoGlossaryLink glossaryTerms={glossaryTerms}>
        {content}
      </AutoGlossaryLink>
    );
  }

  return content;
}
