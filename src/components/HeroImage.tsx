import Image from "next/image";
import { getLocalizedText, normalizeLocale } from "@/lib/i18n";

const HERO_ALT: Record<"en" | "es", string> = {
  en: "Guanacaste Tree - National Tree of Costa Rica",
  es: "Árbol de Guanacaste - Árbol Nacional de Costa Rica",
};

interface HeroImageProps {
  priority?: boolean;
  fetchPriority?: "high" | "low" | "auto";
  locale?: "en" | "es";
}

/**
 * Optimized Hero Image Component (Server Component)
 *
 * Uses native <picture> element with responsive srcsets for optimal LCP.
 * Rendered entirely on the server — zero client-side JavaScript.
 * The parent element should provide a gradient fallback background
 * so that if the image fails to load, the page still looks good.
 */
export function HeroImage({
  priority = true,
  fetchPriority = "high",
  locale = "en",
}: HeroImageProps) {
  const alt = getLocalizedText(HERO_ALT, normalizeLocale(locale));
  return (
    <picture className="absolute inset-0">
      {/* AVIF for best compression (newest browsers) */}
      <source
        type="image/avif"
        srcSet="
          /images/hero/guanacaste-mobile.avif 640w,
          /images/hero/guanacaste-mobile-lg.avif 828w,
          /images/hero/guanacaste-desktop.avif 1200w
        "
        sizes="100vw"
      />

      {/* WebP for modern browsers */}
      <source
        type="image/webp"
        srcSet="
          /images/hero/guanacaste-mobile.webp 640w,
          /images/hero/guanacaste-mobile-lg.webp 828w,
          /images/hero/guanacaste-desktop.webp 1200w
        "
        sizes="100vw"
      />

      {/* JPEG fallback for older browsers */}
      <Image
        src="/images/hero/guanacaste-desktop.jpg"
        alt={alt}
        fill
        priority={priority}
        fetchPriority={fetchPriority}
        sizes="100vw"
        className="object-cover object-center"
        quality={60}
      />
    </picture>
  );
}
