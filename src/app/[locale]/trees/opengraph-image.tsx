import { allTrees } from "contentlayer/generated";
import { ImageResponse } from "next/og";

export const alt = "Costa Rica Tree Atlas - Browse Trees";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function OGImage({ params }: Props) {
  const { locale } = await params;

  const TITLES: Record<string, string> = {
    en: "Explore Costa Rica Trees",
    es: "Explorar Árboles de Costa Rica",
  };
  const count = allTrees.filter((tr) => tr.locale === locale).length;
  const SUBTITLES: Record<string, string> = {
    en: `${count} species documented with detailed scientific information`,
    es: `${count} especies documentadas con información científica detallada`,
  };
  const safeLocale = (Object.hasOwn(TITLES, locale) ? locale : "en") as keyof typeof TITLES;
  const title = TITLES[safeLocale];
  const subtitle = SUBTITLES[safeLocale];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #2d5a27 0%, #1a3d17 50%, #2d5a27 100%)",
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
          🌳 Costa Rica Tree Atlas
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
