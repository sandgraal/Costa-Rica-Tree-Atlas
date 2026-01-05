"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";

// ============================================================================
// Types
// ============================================================================

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallback?: "placeholder" | "hide";
  onErrorCallback?: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * SafeImage - Error-resilient image component
 *
 * Wraps Next.js Image with error handling and loading state tracking to gracefully
 * handle broken images and ensure proper rendering on initial page load.
 * Shows a placeholder icon or hides entirely when image fails to load or src is empty.
 *
 * @param fallback - "placeholder" (default) shows tree icon, "hide" hides entirely
 * @param onErrorCallback - Optional callback when image fails to load
 */
export function SafeImage({
  src,
  alt,
  fallback = "placeholder",
  onErrorCallback,
  className = "",
  ...props
}: SafeImageProps) {
  const [error, setError] = useState(false);

  const handleError = () => {
    setError(true);
    if (onErrorCallback) {
      onErrorCallback();
    }
  };

  // Better empty check - trim whitespace and handle StaticImport
  const isEmpty = !src || (typeof src === "string" && src.trim() === "");

  // Check BEFORE attempting to render
  if (isEmpty || error) {
    if (fallback === "hide") {
      return null;
    }

    // Show placeholder
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 ${className}`}
        aria-label={alt}
      >
        <TreePlaceholderIcon />
      </div>
    );
  }

  // Render image with error handler
  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}

// ============================================================================
// Placeholder Icon
// ============================================================================

function TreePlaceholderIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-12 h-12 text-primary/30"
      aria-hidden="true"
    >
      <path d="M12 2C9.5 2 7 4 7 7c0 1.5.5 2.5 1 3.5-1.5.5-3 1.5-3 4 0 2 1 3.5 2.5 4.5-.5 1-1 2-1 3.5v.5h11v-.5c0-1.5-.5-2.5-1-3.5 1.5-1 2.5-2.5 2.5-4.5 0-2.5-1.5-3.5-3-4C16.5 9.5 17 8.5 17 7c0-3-2.5-5-5-5z" />
    </svg>
  );
}
