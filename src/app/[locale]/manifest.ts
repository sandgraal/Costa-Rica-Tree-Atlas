import type { MetadataRoute } from "next";
import { routing, type Locale } from "@i18n/routing";

const MANIFEST_CONTENT: Record<
  Locale,
  {
    name: string;
    shortName: string;
    description: string;
  }
> = {
  en: {
    name: "Costa Rica Tree Atlas",
    shortName: "CR Trees",
    description: "Discover the trees of Costa Rica",
  },
  es: {
    name: "Atlas de Árboles de Costa Rica",
    shortName: "Árboles CR",
    description: "Descubre los árboles de Costa Rica",
  },
};

type ManifestProps = {
  params: Promise<{ locale: string }> | { locale: string };
};

function resolveLocale(localeParam: string): Locale {
  return routing.locales.includes(localeParam as Locale)
    ? (localeParam as Locale)
    : routing.defaultLocale;
}

function getManifestContent(locale: Locale) {
  switch (locale) {
    case "es":
      return MANIFEST_CONTENT.es;
    case "en":
    default:
      return MANIFEST_CONTENT.en;
  }
}

export default async function manifest({
  params,
}: ManifestProps): Promise<MetadataRoute.Manifest> {
  const { locale: localeParam } = await Promise.resolve(params);
  const locale = resolveLocale(localeParam);
  const manifestContent = getManifestContent(locale);

  return {
    id: `/${locale}`,
    name: manifestContent.name,
    short_name: manifestContent.shortName,
    description: manifestContent.description,
    lang: locale,
    start_url: `/${locale}`,
    scope: `/${locale}`,
    display: "standalone",
    background_color: "#faf6f0",
    theme_color: "#2d5a27",
    orientation: "portrait-primary",
    dir: "ltr",
    categories: ["education", "nature", "reference"],
    icons: [
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  };
}
