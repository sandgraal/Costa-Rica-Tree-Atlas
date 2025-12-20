/**
 * Component exports - clean, flat, no legacy
 */

// Store & state management
export { useStore, useFavorite, useThemeSync } from "@/lib/store";
export { StoreProvider, QueryProvider } from "./providers";

// Core tree components
export { TreeCard, TreeExplorer, TreeGrid } from "./tree";
export { DistributionMap } from "./geo";
export { BiodiversityInfo } from "./data";

// Layout components
export { Header } from "./Header";
export { Footer } from "./Footer";
export { ThemeToggle } from "./ThemeToggle";
export { LanguageSwitcher } from "./LanguageSwitcher";

// Tree display components
export {
  TreeTags,
  TreeTag,
  TAG_DEFINITIONS,
  getAllTags,
  getTagsByCategory,
} from "./TreeTags";
export { TreeGallery, ImageLightbox } from "./TreeGallery";
export { TreeComparison } from "./TreeComparison";
export { ConservationStatus, ConservationScale } from "./ConservationStatus";
export { SeasonalCalendar } from "./SeasonalCalendar";
export { SeasonalInfo } from "./SeasonalInfo";

// Interactive components
export { FavoriteButton } from "./FavoriteButton";
export { FavoritesLink } from "./FavoritesLink";
export { PrintButton } from "./PrintButton";
export { ShareButton } from "./ShareButton";
export { PronunciationButton } from "./PronunciationButton";
export { TrackView } from "./TrackView";
export { RecentlyViewedList } from "./RecentlyViewedList";
export { ExportFavoritesButton } from "./ExportFavoritesButton";
export { ScrollToTop } from "./ScrollToTop";

// Accessibility & utilities
export { KeyboardShortcuts } from "./KeyboardShortcuts";
export {
  AnnouncerProvider,
  useAnnounce,
  VisuallyHidden,
} from "./Accessibility";
export { Analytics } from "./Analytics";
export { PWARegister } from "./PWARegister";
export { QuickSearch } from "./QuickSearch";
export { MobileNav } from "./MobileNav";

// Content components
export { mdxComponents } from "./mdx";
export { MDXContent } from "./MDXContent";
export { OptimizedImage } from "./OptimizedImage";
