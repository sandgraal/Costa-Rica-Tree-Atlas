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
const mdxCache = new Map<string, Awaited<ReturnType<typeof evaluate>>>();

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
      });

      // Cache the compiled result
      mdxCache.set(cacheKey, result);
    } catch (error) {
      // Gracefully handle MDX compilation/evaluation errors
      console.error("Failed to compile/evaluate MDX content:", error);
      return <MDXErrorFallback error={error} />;
    }
  }

  const { default: MDXContent } = result;

  // Merge default MDX components with any additional ones passed in
  const allComponents = { ...mdxComponents, ...components };

  // Render the MDX content with all components
  // This returns React elements that will be serialized and sent to the client
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
