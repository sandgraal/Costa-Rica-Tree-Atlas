// Re-export from new unified store and providers
export { useStore, useFavorite, useThemeSync } from "@/lib/store";
export { StoreProvider, QueryProvider } from "./providers";

// Re-export new component architecture
export { TreeCard, TreeExplorer } from "./tree";
export { DistributionMap } from "./geo";
export { BiodiversityInfo } from "./data";

// Active components (gradually migrating to new architecture)
export { ThemeToggle } from "./ThemeToggle";
export { LanguageSwitcher } from "./LanguageSwitcher";
export { Header } from "./Header";
export { Footer } from "./Footer";
export { AlphabeticalIndex } from "./AlphabeticalIndex";
export {
  TreeTags,
  TreeTag,
  TAG_DEFINITIONS,
  getAllTags,
  getTagsByCategory,
} from "./TreeTags";
export { TreeGallery, ImageLightbox } from "./TreeGallery";
export { PrintButton } from "./PrintButton";
export { TreeComparison } from "./TreeComparison";
export { IdentificationGuide } from "./IdentificationGuide";
export { PWARegister } from "./PWARegister";
export { Analytics, trackEvent, trackPageView } from "./Analytics";
export { ConservationStatus, ConservationScale } from "./ConservationStatus";
export { SeasonalCalendar } from "./SeasonalCalendar";
export { SeasonalInfo } from "./SeasonalInfo";
export { PronunciationButton } from "./PronunciationButton";
export { FavoriteButton } from "./FavoriteButton";
export { FavoritesLink } from "./FavoritesLink";
export { TreeCardWithFavorite } from "./TreeCardWithFavorite";
export { TrackView } from "./TrackView";
export { RecentlyViewedList } from "./RecentlyViewedList";
export { ExportFavoritesButton } from "./ExportFavoritesButton";
export { KeyboardShortcuts } from "./KeyboardShortcuts";
export {
  AnnouncerProvider,
  useAnnounce,
  VisuallyHidden,
} from "./Accessibility";
export { mdxComponents } from "./mdx";
export { MDXContent } from "./MDXContent";
export { OptimizedImage, IMAGE_SIZES } from "./OptimizedImage";

// Deprecated components - moved to ./deprecated/ folder
// TODO: Remove completely once all references are updated
export { TreeSearch } from "./deprecated/TreeSearch";
export { TreeFilters } from "./deprecated/TreeFilters";
export { TreeList } from "./deprecated/TreeList";
export { TreeCard as LegacyTreeCard } from "./deprecated/TreeCard";
export { DistributionMap as LegacyDistributionMap } from "./deprecated/DistributionMap";
export { BiodiversityInfo as LegacyBiodiversityInfo } from "./deprecated/BiodiversityInfo";
