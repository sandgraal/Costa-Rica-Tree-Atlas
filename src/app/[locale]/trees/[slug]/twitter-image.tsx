import { ImageResponse } from "next/og";
import { allTrees } from "contentlayer/generated";

export const alt = "Tree profile image";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export function generateStaticParams() {
  return allTrees.map((tree) => ({
    locale: tree.locale,
    slug: tree.slug,
  }));
}

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function Image({ params }: Props) {
  const { locale, slug } = await params;
  const tree = allTrees.find((t) => t.locale === locale && t.slug === slug);

  if (!tree) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#2d5a27",
          color: "white",
          fontSize: 48,
        }}
      >
        Tree Not Found
      </div>,
      { ...size }
    );
  }

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#1a3d17",
        padding: 60,
      }}
    >
      {/* Background gradient overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(135deg, #2d5a27 0%, #1a3d17 50%, #8b5a2b 100%)",
          opacity: 0.9,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        {/* Top section with family tag */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              padding: "8px 20px",
              borderRadius: 24,
              color: "#c9a227",
              fontSize: 24,
              fontWeight: 600,
            }}
          >
            {tree.family}
          </div>
          {tree.conservationStatus && (
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                padding: "8px 20px",
                borderRadius: 24,
                color: "#ffffff",
                fontSize: 20,
              }}
            >
              {tree.conservationStatus}
            </div>
          )}
        </div>

        {/* Main title section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.1,
            }}
          >
            {tree.title}
          </div>
          <div
            style={{
              fontSize: 36,
              fontStyle: "italic",
              color: "#c9a227",
            }}
          >
            {tree.scientificName}
          </div>
        </div>

        {/* Bottom section with branding */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                fontSize: 28,
                color: "#ffffff",
                fontWeight: 600,
              }}
            >
              🌳 Costa Rica Tree Atlas
            </div>
          </div>
          <div
            style={{
              fontSize: 20,
              color: "rgba(255, 255, 255, 0.7)",
            }}
          >
            costaricatreeatlas.com
          </div>
        </div>
      </div>
    </div>,
    { ...size }
  );
}
