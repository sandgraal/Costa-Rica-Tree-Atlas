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

  const title =
    locale === "es"
      ? "Explorar Árboles de Costa Rica"
      : "Explore Costa Rica Trees";
  const count = allTrees.filter((t) => t.locale === locale).length;
  const subtitle =
    locale === "es"
      ? `${count} especies documentadas con información científica detallada`
      : `${count} species documented with detailed scientific information`;

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
