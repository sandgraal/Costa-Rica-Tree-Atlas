/**
 * MDX Client Components — Re-export shim
 *
 * DEPRECATED: This file now re-exports from individual component files in ./client/.
 * Each component has its own "use client" boundary, enabling per-component
 * code-splitting so only actually-rendered widgets are included in the page bundle.
 *
 * Import from this file for backward compatibility, or import directly from
 * "@/components/mdx/client/ComponentName" for explicit tree-shaking.
 */

export {
  AccordionItem,
  ImageCard,
  ImageGallery,
  Tabs,
  GlossaryTooltip,
  BeforeAfterSlider,
  SideBySideImages,
  FeatureAnnotation,
  mdxClientComponents,
} from "./client";
export type { ImageCardProps } from "./client";
