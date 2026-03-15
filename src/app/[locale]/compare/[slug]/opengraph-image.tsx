import { ImageResponse } from "next/og";
import { allSpeciesComparisons, allTrees } from "contentlayer/generated";

export const alt = "Species comparison guide";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export function generateStaticParams() {
  return allSpeciesComparisons.map((comparison) => ({
    locale: comparison.locale,
    slug: comparison.slug,
  }));
}

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function Image({ params }: Props) {
  const { locale, slug } = await params;
  const comparison = allSpeciesComparisons.find(
    (c) => c.locale === locale && c.slug === slug
  );

  if (!comparison) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#5a3a1a",
          color: "white",
          fontSize: 48,
        }}
      >
        Comparison Not Found
      </div>,
      { ...size }
    );
  }

  // Resolve species common names from tree data
  const speciesNames = comparison.species.map((speciesSlug) => {
    const tree = allTrees.find(
      (t) => t.slug === speciesSlug && t.locale === locale
    );
    return tree
      ? { title: tree.title, scientificName: tree.scientificName }
      : { title: speciesSlug, scientificName: "" };
  });

  const DIFFICULTY_LABELS: Record<string, Record<string, string>> = {
    easy: { en: "Easy", es: "Fácil" },
    moderate: { en: "Moderate", es: "Moderado" },
    challenging: { en: "Challenging", es: "Desafiante" },
  };

  const difficultyLabelsForKey =
    comparison.difficulty &&
    Object.hasOwn(DIFFICULTY_LABELS, comparison.difficulty)
      ? DIFFICULTY_LABELS[comparison.difficulty]
      : undefined;

  const difficultyLabel =
    difficultyLabelsForKey &&
    (Object.hasOwn(difficultyLabelsForKey, locale)
      ? difficultyLabelsForKey[locale]
      : difficultyLabelsForKey.en ?? "");

  const GUIDE_LABEL: Record<string, string> = {
    en: "Comparison Guide",
    es: "Guía de Comparación",
  };

  const guideLabel = Object.hasOwn(GUIDE_LABEL, locale)
    ? GUIDE_LABEL[locale]
    : "";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: 60,
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(135deg, #8b5a2b 0%, #5a3a1a 50%, #2d5a27 100%)",
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
        {/* Top section with tags */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              padding: "8px 20px",
              borderRadius: 24,
              color: "#c9a227",
              fontSize: 24,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {`🔍 ${
              Object.hasOwn(GUIDE_LABEL, locale)
                ? GUIDE_LABEL[locale as keyof typeof GUIDE_LABEL]
                : GUIDE_LABEL.en
            }`}
          </div>
          {difficultyLabel && (
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                padding: "8px 20px",
                borderRadius: 24,
                color: "#ffffff",
                fontSize: 20,
              }}
            >
              {difficultyLabel}
            </div>
          )}
        </div>

        {/* Species names - VS layout */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  color: "#ffffff",
                  lineHeight: 1.1,
                }}
              >
                {speciesNames[0]?.title}
              </div>
              {speciesNames[0]?.scientificName && (
                <div
                  style={{
                    fontSize: 22,
                    fontStyle: "italic",
                    color: "#c9a227",
                    marginTop: 4,
                  }}
                >
                  {speciesNames[0].scientificName}
                </div>
              )}
            </div>

            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: "rgba(255, 255, 255, 0.5)",
                flexShrink: 0,
              }}
            >
              VS
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  color: "#ffffff",
                  lineHeight: 1.1,
                  textAlign: "right",
                }}
              >
                {speciesNames[1]?.title}
              </div>
              {speciesNames[1]?.scientificName && (
                <div
                  style={{
                    fontSize: 22,
                    fontStyle: "italic",
                    color: "#c9a227",
                    marginTop: 4,
                    textAlign: "right",
                  }}
                >
                  {speciesNames[1].scientificName}
                </div>
              )}
            </div>
          </div>

          {/* Key difference */}
          {comparison.keyDifference && (
            <div
              style={{
                fontSize: 20,
                color: "rgba(255, 255, 255, 0.75)",
                lineHeight: 1.4,
                marginTop: 8,
              }}
            >
              {comparison.keyDifference}
            </div>
          )}
        </div>

        {/* Bottom branding */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: "#ffffff",
              fontWeight: 600,
            }}
          >
            🌳 Costa Rica Tree Atlas
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
