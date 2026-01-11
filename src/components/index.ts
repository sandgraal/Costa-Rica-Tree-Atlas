/**
 * Component exports barrel
 * Only exports actually used elsewhere in the codebase
 */

// Providers (used in layout.tsx)
export { StoreProvider, QueryProvider } from "./providers";

// Core tree components (used in pages)
export { TreeCard, TreeExplorer, TreeGrid } from "./tree";
export { DistributionMap } from "./geo";
export { BiodiversityInfo } from "./data";

// Layout components (used in layout.tsx and pages)
export { Header } from "./Header";
export { Footer } from "./Footer";
export { ThemeToggle } from "./ThemeToggle";
export { LanguageSwitcher } from "./LanguageSwitcher";

// Tree display (used in tree pages and comparison)
export { TreeTags } from "./TreeTags";
export { TreeGallery } from "./TreeGallery";
export { TreeComparison } from "./TreeComparison";
export { ConservationStatus } from "./ConservationStatus";
export { SeasonalCalendar } from "./SeasonalCalendar";
export { SeasonalInfo } from "./SeasonalInfo";

// Virtualization components (used for performance optimization)
export { VirtualizedGrid } from "./VirtualizedGrid";
export { ResponsiveVirtualizedGrid } from "./ResponsiveVirtualizedGrid";
export { VirtualizedTreeList } from "./VirtualizedTreeList";

// Interactive components (used in tree pages and favorites)
export { FavoriteButton } from "./FavoriteButton";
export { FavoritesLink } from "./FavoritesLink";
export { PrintButton } from "./PrintButton";
export { ShareButton } from "./ShareButton";
export { PronunciationButton } from "./PronunciationButton";
export { TrackView } from "./TrackView";
export { RecentlyViewedList } from "./RecentlyViewedList";
export { ExportFavoritesButton } from "./ExportFavoritesButton";
export { ScrollToTop } from "./ScrollToTop";

// Utilities (used in layout.tsx)
export { KeyboardShortcuts } from "./KeyboardShortcuts";
export { Analytics } from "./Analytics";
export { PWARegister } from "./PWARegister";
export { QuickSearch } from "./QuickSearch";
export { MobileNav } from "./MobileNav";

// Content (used in MDXContent and tree pages)
export { mdxComponents } from "./mdx";
export { MDXContent } from "./MDXContent";
export { MDXRenderer } from "./MDXRenderer";
export { AutoGlossaryLink } from "./AutoGlossaryLink";
export { GlossaryTooltip } from "./GlossaryTooltip";
export { OptimizedImage, IMAGE_SIZES } from "./OptimizedImage";
export { ResponsiveImage } from "./ResponsiveImage";
export { SafeImage } from "./SafeImage";
export { SafeJsonLd } from "./SafeJsonLd";
export { ImageErrorBoundary } from "./ImageErrorBoundary";
export { ShareCollectionButton } from "./ShareCollectionButton";
export {
  EducationProgressProvider,
  useEducationProgress,
} from "./EducationProgress";
