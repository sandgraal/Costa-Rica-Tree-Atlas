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

/**
 * Server-side MDX renderer that avoids eval()
 *
 * This is an async server component that compiles and renders MDX
 * content entirely on the server. The resulting React elements are
 * then sent to the client as pre-rendered HTML.
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
  // Evaluate MDX on the server - this compiles and runs in one step
  // The execution happens on Node.js where there are no CSP restrictions
  const { default: MDXContent } = await evaluate(source, {
    // Spread the jsx-runtime to provide createElement, Fragment, etc.
    ...runtime,
    // Use production React runtime
    development: false,
    // Required for import.meta resolution in compiled code
    baseUrl: import.meta.url,
  });

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
