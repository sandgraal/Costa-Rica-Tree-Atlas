// Re-export from new unified store and providers
export { useStore, useFavorite, useThemeSync } from "@/lib/store";
export { StoreProvider, QueryProvider } from "./providers";

// Re-export new component architecture
export { TreeCard, TreeExplorer } from "./tree";
export { DistributionMap } from "./geo";
export { BiodiversityInfo } from "./data";

// Legacy components (gradually migrating to new architecture)
export { ThemeToggle } from "./ThemeToggle";
export { LanguageSwitcher } from "./LanguageSwitcher";
export { Header } from "./Header";
export { Footer } from "./Footer";
export { TreeSearch } from "./TreeSearch";
export { TreeFilters } from "./TreeFilters";
export { AlphabeticalIndex } from "./AlphabeticalIndex";
export { TreeList } from "./TreeList";
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

// Deprecated components - retained for backwards compatibility
// TODO: Remove after full migration
export { TreeCard as LegacyTreeCard } from "./TreeCard";
export { DistributionMap as LegacyDistributionMap } from "./DistributionMap";
export { BiodiversityInfo as LegacyBiodiversityInfo } from "./BiodiversityInfo";
