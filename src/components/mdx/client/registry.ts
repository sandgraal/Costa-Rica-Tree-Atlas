/**
 * MDX Client Components Registry
 *
 * Provides the component-name-to-component mapping used by the MDX renderer.
 * Importing this file pulls in all client components, but each one is in its own
 * "use client" module, allowing the bundler to split them into separate chunks.
 */

import { AccordionItem } from "./AccordionItem";
import { ImageCard } from "./ImageCard";
import { ImageGallery } from "./ImageGallery";
import { Tabs } from "./Tabs";
import { GlossaryTooltip } from "./GlossaryTooltip";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { SideBySideImages } from "./SideBySideImages";
import { FeatureAnnotation } from "./FeatureAnnotation";

export const mdxClientComponents = {
  AccordionItem,
  ImageCard,
  ImageGallery,
  Tabs,
  GlossaryTooltip,
  // Comparison components
  BeforeAfterSlider,
  SideBySideImages,
  FeatureAnnotation,
};
