"use client";

import Image from "next/image";
import { useState } from "react";

interface HeroImageProps {
  priority?: boolean;
  fetchPriority?: "high" | "low" | "auto";
}

/**
 * Optimized Hero Image Component
 * Uses native <picture> element with responsive srcsets for optimal LCP
 */
export function HeroImage({
  priority = true,
  fetchPriority = "high",
}: HeroImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    // Fallback to solid color background
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30" />
    );
  }

  return (
    <picture className="absolute inset-0">
      {/* AVIF for best compression (newest browsers) */}
      <source
        type="image/avif"
        srcSet="
          /images/hero/guanacaste-mobile.avif 640w,
          /images/hero/guanacaste-mobile-lg.avif 828w,
          /images/hero/guanacaste-tablet.avif 1200w,
          /images/hero/guanacaste-desktop.avif 1920w
        "
        sizes="100vw"
      />

      {/* WebP for modern browsers */}
      <source
        type="image/webp"
        srcSet="
          /images/hero/guanacaste-mobile.webp 640w,
          /images/hero/guanacaste-mobile-lg.webp 828w,
          /images/hero/guanacaste-tablet.webp 1200w,
          /images/hero/guanacaste-desktop.webp 1920w
        "
        sizes="100vw"
      />

      {/* JPEG fallback for older browsers */}
      <Image
        src="/images/hero/guanacaste-desktop.jpg"
        alt="Guanacaste Tree - National Tree of Costa Rica"
        fill
        priority={priority}
        fetchPriority={fetchPriority}
        sizes="100vw"
        className="object-cover object-center"
        quality={85}
        onError={() => setError(true)}
      />
    </picture>
  );
}
