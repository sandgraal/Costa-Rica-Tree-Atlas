/**
 * Image utility functions for optimization and sizing
 */

/**
 * Generate blur data URL for image placeholder
 */
export function generateBlurDataURL(
  width: number = 10,
  height: number = 10
): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#e5e7eb"/>
    </svg>
  `;
  if (typeof Buffer !== "undefined") {
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  }
  // Fallback for environments without Buffer
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Calculate image sizes attribute based on layout
 */
export function calculateImageSizes(
  layout: "full" | "half" | "third" | "quarter"
): string {
  const sizeMap = {
    full: "100vw",
    half: "(max-width: 768px) 100vw, 50vw",
    third: "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw",
    quarter:
      "(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw",
  };
  return sizeMap[layout];
}

/**
 * Get optimized image URL from Cloudinary or similar CDN
 */
export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number;
    quality?: number;
    format?: "auto" | "webp" | "avif";
  } = {}
): string {
  const { width, quality = 80, format = "auto" } = options;

  // If using Cloudinary
  if (url.includes("cloudinary.com")) {
    const transformations = [
      width && `w_${width}`,
      `q_${quality}`,
      format !== "auto" && `f_${format}`,
    ]
      .filter(Boolean)
      .join(",");

    return url.replace("/upload/", `/upload/${transformations}/`);
  }

  // Return original URL if no CDN
  return url;
}

/**
 * Validate image URL is safe and allowed
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url, "https://example.com");

    // Check for allowed protocols
    if (!["http:", "https:", "data:"].includes(parsed.protocol)) {
      return false;
    }

    // Check for data URLs
    if (parsed.protocol === "data:") {
      // Only allow image data URLs
      return url.startsWith("data:image/");
    }

    return true;
  } catch {
    // If URL parsing fails, assume relative path is valid
    return !url.includes("javascript:") && !url.includes("data:text");
  }
}

/**
 * Get image dimensions from aspect ratio string
 */
export function getAspectRatioDimensions(
  aspectRatio: string,
  baseWidth: number = 100
): { width: number; height: number } {
  const parts = aspectRatio.split(/[/:]/);
  if (parts.length !== 2) {
    return { width: baseWidth, height: baseWidth };
  }

  const widthRatio = parseFloat(parts[0]);
  const heightRatio = parseFloat(parts[1]);

  if (isNaN(widthRatio) || isNaN(heightRatio)) {
    return { width: baseWidth, height: baseWidth };
  }

  const height = (baseWidth / widthRatio) * heightRatio;
  return { width: baseWidth, height: Math.round(height) };
}
