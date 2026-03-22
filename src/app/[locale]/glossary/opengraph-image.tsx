import { allGlossaryTerms } from "contentlayer/generated";
import { ImageResponse } from "next/og";

export const alt =
  "Costa Rica botanical glossary / Glosario botánico de Costa Rica";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function OGImage({ params }: Props) {
  const { locale } = await params;

  const TITLES: Record<string, string> = {
    en: "Botanical Glossary",
    es: "Glosario Botánico",
  };
  const count = allGlossaryTerms.filter((tr) => tr.locale === locale).length;
  const SUBTITLES: Record<string, string> = {
    en: `${count} botanical terms with clear definitions and examples`,
    es: `${count} términos botánicos con definiciones claras y ejemplos`,
  };
  const title = Object.prototype.hasOwnProperty.call(TITLES, locale)
    ? TITLES[locale]
    : TITLES.en;
  const subtitle = Object.prototype.hasOwnProperty.call(SUBTITLES, locale)
    ? SUBTITLES[locale]
    : SUBTITLES.en;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #2d5a27 0%, #1a3d17 50%, #3a6b35 100%)",
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
          📖 Costa Rica Tree Atlas
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
