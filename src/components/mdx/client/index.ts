/**
 * MDX Client Components — Barrel Export
 *
 * Each component lives in its own file with its own "use client" boundary.
 * This enables per-component code-splitting: only the client components
 * actually rendered in a given MDX page are included in that page's bundle.
 */

export { AccordionItem } from "./AccordionItem";
export { ImageCard } from "./ImageCard";
export type { ImageCardProps } from "./ImageCard";
export { ImageGallery } from "./ImageGallery";
export { Tabs } from "./Tabs";
export { GlossaryTooltip } from "./GlossaryTooltip";
export { BeforeAfterSlider } from "./BeforeAfterSlider";
export { SideBySideImages } from "./SideBySideImages";
export { FeatureAnnotation } from "./FeatureAnnotation";

/**
 * Combined object of all MDX client components.
 * Used by the component registry and tests.
 */
export { mdxClientComponents } from "./registry";
