import { allSpeciesComparisons } from "contentlayer/generated";
import { ImageResponse } from "next/og";

export const alt =
  "Costa Rica tree comparison guides / Guías de comparación de árboles de Costa Rica";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function OGImage({ params }: Props) {
  const { locale } = await params;

  const SUPPORTED_LOCALES = ["en", "es"] as const;
  type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

  const normalizedLocale: SupportedLocale = SUPPORTED_LOCALES.includes(
    locale as SupportedLocale
  )
    ? (locale as SupportedLocale)
    : "en";

  const TITLES: Record<SupportedLocale, string> = {
    en: "Compare Costa Rica Trees",
    es: "Comparar Árboles de Costa Rica",
  };
  const count = allSpeciesComparisons.filter(
    (c) => c.locale === normalizedLocale
  ).length;
  const SUBTITLES: Record<SupportedLocale, string> = {
    en: `${count} side-by-side species comparison guides`,
    es: `${count} guías de comparación de especies lado a lado`,
  };
  const title = TITLES[normalizedLocale];
  const subtitle = SUBTITLES[normalizedLocale];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #8b5a2b 0%, #5a3a1a 50%, #2d5a27 100%)",
        padding: 60,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div
          style={{
            fontSize: 32,
            color: "#c9a227",
            fontWeight: 600,
          }}
        >
          🔍 Costa Rica Tree Atlas
        </div>
        <div
          style={{
            fontSize: 56,
            color: "white",
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 28,
            color: "rgba(255, 255, 255, 0.8)",
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>,
    { ...size }
  );
}
