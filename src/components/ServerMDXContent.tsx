/**
 * Server-side MDX Content Renderer
 *
 * This component renders MDX content on the server using next-mdx-remote/rsc,
 * which is designed specifically for Next.js App Router's Server Components architecture.
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
 * 2. Uses next-mdx-remote/rsc's compileMDX to compile MDX on the server
 * 3. Properly handles client components through Next.js RSC architecture
 * 4. Returns pre-rendered React elements that hydrate normally on client
 *
 * SECURITY BENEFIT:
 * - Removes the need for 'unsafe-eval' in Content Security Policy
 * - MDX code execution happens only on the server, not in the browser
 * - Reduces attack surface for XSS vulnerabilities
 *
 * IMPORTANT: This is a React Server Component (RSC). It must NOT be marked
 * with "use client" and should only be used in server component contexts.
 */

import { compileMDX } from "next-mdx-remote/rsc";
import { mdxServerComponents } from "@/components/mdx/server-components";
import { AccordionItem } from "@/components/mdx/client/AccordionItem";
import { ImageCard } from "@/components/mdx/client/ImageCard";
import { ImageGallery } from "@/components/mdx/client/ImageGallery";
import { Tabs } from "@/components/mdx/client/Tabs";
import { GlossaryTooltip } from "@/components/mdx/client/GlossaryTooltip";
import { BeforeAfterSlider } from "@/components/mdx/client/BeforeAfterSlider";
import { SideBySideImages } from "@/components/mdx/client/SideBySideImages";
import { FeatureAnnotation } from "@/components/mdx/client/FeatureAnnotation";
import { AutoGlossaryLink } from "@/components/AutoGlossaryLink";
import { TreeGallery } from "@/components/TreeGallery";

interface GlossaryTerm {
  term: string;
  slug: string;
  locale: string;
  simpleDefinition?: string;
}

interface ServerMDXContentProps {
  /** Raw MDX source content (from contentlayer body.raw) */
  source: string;
  /** Current locale for localization */
  locale?: string;
  /** Additional components to pass to MDX */
  components?: Record<string, React.ComponentType<unknown>>;
  /** Glossary terms for automatic linking */
  glossaryTerms?: GlossaryTerm[];
  /** Enable automatic glossary term linking */
  enableGlossaryLinks?: boolean;
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
 * Server-side MDX renderer using next-mdx-remote/rsc
 *
 * This is an async server component that compiles and renders MDX
 * content entirely on the server using next-mdx-remote/rsc's compileMDX,
 * which properly handles the client/server component boundary in Next.js App Router.
 *
 * SECURITY NOTE:
 * This component assumes MDX source comes from trusted sources (our own content files).
 * The `source` parameter should NEVER contain user-generated or external content.
 * If you need to render user-provided MDX, additional validation and sandboxing are required.
 *
 * Features:
 * - Works seamlessly with both server and client components
 * - Properly handles the RSC architecture in Next.js App Router
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
  locale = "en",
  components = {},
  glossaryTerms = [],
  enableGlossaryLinks = false,
}: ServerMDXContentProps) {
  const isDevelopment = process.env.NODE_ENV === "development";

  // Create locale-aware wrappers for legacy components that need localization
  // These components are imported from server-components and have a locale prop
  const localizedComponents = {
    SafetyCard: (
      props: React.ComponentProps<typeof mdxServerComponents.SafetyCard>
    ) =>
      mdxServerComponents.SafetyCard({
        ...props,
        locale: locale as "en" | "es",
      }),
    ConservationStatus: (
      props: React.ComponentProps<typeof mdxServerComponents.ConservationStatus>
    ) =>
      mdxServerComponents.ConservationStatus({
        ...props,
        locale: locale as "en" | "es",
      }),
    CareCalendar: (
      props: React.ComponentProps<typeof mdxServerComponents.CareCalendar>
    ) =>
      mdxServerComponents.CareCalendar({
        ...props,
        locale: locale as "en" | "es",
      }),
  };

  // Merge server MDX components with client components and any additional ones passed in
  // Client components are imported from individual files for per-component code-splitting
  const allComponents = {
    ...mdxServerComponents,
    ...localizedComponents,
    AccordionItem,
    ImageCard,
    ImageGallery,
    Tabs,
    GlossaryTooltip,
    // Comparison-specific components (only hydrated when actually rendered in MDX)
    BeforeAfterSlider,
    SideBySideImages,
    FeatureAnnotation,
    TreeGallery,
    ...components,
  };

  let content: React.ReactElement;

  try {
    // Compile the MDX content using next-mdx-remote/rsc
    // This properly handles the client/server component boundary
    const result = await compileMDX({
      source,
      components: allComponents,
      options: {
        mdxOptions: {
          development: isDevelopment,
        },
      },
    });

    content = result.content;
  } catch (error) {
    // Gracefully handle MDX compilation/rendering errors
    // Only log in development to avoid exposing sensitive information
    if (isDevelopment) {
      console.error("Failed to compile/render MDX content:", error);
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

  // Optionally wrap in AutoGlossaryLink for automatic term linking
  // This is done outside the try/catch to avoid ESLint error
  if (enableGlossaryLinks && glossaryTerms.length > 0) {
    return (
      <AutoGlossaryLink glossaryTerms={glossaryTerms}>
        {content}
      </AutoGlossaryLink>
    );
  }

  return content;
}
