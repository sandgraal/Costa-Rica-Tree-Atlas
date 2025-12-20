/**
 * Shared image utilities
 * Centralized blur placeholder and image helpers
 */

/**
 * Default blur data URL for image loading placeholders
 * A subtle green-brown gradient matching the nature theme
 */
export const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMyZDVhMjciIG9wYWNpdHk9IjAuMSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzhiNWEyYiIgb3BhY2l0eT0iMC4xIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNnKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==";

/**
 * Get the optimized image URL for a tree
 */
export function getTreeImageUrl(
  slug: string,
  variant: "featured" | "gallery" = "featured"
): string {
  return `/images/trees/${slug}/${variant === "featured" ? "featured.jpg" : "gallery"}/`;
}

/**
 * Default image dimensions for tree photos
 */
export const IMAGE_DIMENSIONS = {
  thumbnail: { width: 200, height: 150 },
  card: { width: 400, height: 300 },
  featured: { width: 800, height: 600 },
  gallery: { width: 1200, height: 900 },
} as const;
