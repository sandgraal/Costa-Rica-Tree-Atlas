import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContributeClient } from "./ContributeClient";
import { allTrees, type Tree } from "contentlayer/generated";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contribute" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ContributePage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contribute" });

  // Get list of trees for the current locale (for correction/knowledge forms)
  const trees = allTrees
    .filter((tree: Tree) => tree.locale === locale)
    .map((tree: Tree) => ({
      slug: tree.slug,
      title: tree.title,
      scientificName: tree.scientificName,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>

        {/* Contribution options */}
        <ContributeClient
          trees={trees}
          translations={{
            chooseType: t("chooseType"),
            newSpecies: {
              title: t("newSpecies.title"),
              description: t("newSpecies.description"),
              icon: "🌱",
            },
            correction: {
              title: t("correction.title"),
              description: t("correction.description"),
              icon: "✏️",
            },
            localKnowledge: {
              title: t("localKnowledge.title"),
              description: t("localKnowledge.description"),
              icon: "🧠",
            },
            photo: {
              title: t("photo.title"),
              description: t("photo.description"),
              icon: "📸",
            },
            form: {
              selectTree: t("form.selectTree"),
              searchTrees: t("form.searchTrees"),
              title: t("form.title"),
              titlePlaceholder: t("form.titlePlaceholder"),
              description: t("form.description"),
              descriptionPlaceholder: t("form.descriptionPlaceholder"),
              evidence: t("form.evidence"),
              evidencePlaceholder: t("form.evidencePlaceholder"),
              scientificName: t("form.scientificName"),
              scientificNamePlaceholder: t("form.scientificNamePlaceholder"),
              commonNameEn: t("form.commonNameEn"),
              commonNameEs: t("form.commonNameEs"),
              family: t("form.family"),
              familyPlaceholder: t("form.familyPlaceholder"),
              whereFound: t("form.whereFound"),
              whereFoundPlaceholder: t("form.whereFoundPlaceholder"),
              targetField: t("form.targetField"),
              knowledgeType: t("form.knowledgeType"),
              region: t("form.region"),
              regionPlaceholder: t("form.regionPlaceholder"),
              contributorName: t("form.contributorName"),
              contributorNamePlaceholder: t("form.contributorNamePlaceholder"),
              contributorEmail: t("form.contributorEmail"),
              contributorEmailPlaceholder: t(
                "form.contributorEmailPlaceholder"
              ),
              optional: t("form.optional"),
              submit: t("form.submit"),
              submitting: t("form.submitting"),
              cancel: t("form.cancel"),
              back: t("form.back"),
            },
            fields: {
              title: t("fields.title"),
              scientificName: t("fields.scientificName"),
              description: t("fields.description"),
              family: t("fields.family"),
              nativeRegion: t("fields.nativeRegion"),
              distribution: t("fields.distribution"),
              habitat: t("fields.habitat"),
              cultivation: t("fields.cultivation"),
              uses: t("fields.uses"),
              ecology: t("fields.ecology"),
              conservation: t("fields.conservation"),
              taxonomy: t("fields.taxonomy"),
              etymology: t("fields.etymology"),
              other: t("fields.other"),
            },
            knowledgeTypes: {
              traditional_uses: t("knowledgeTypes.traditional_uses"),
              local_names: t("knowledgeTypes.local_names"),
              folklore: t("knowledgeTypes.folklore"),
              preparation: t("knowledgeTypes.preparation"),
              harvesting: t("knowledgeTypes.harvesting"),
              cultivation_tips: t("knowledgeTypes.cultivation_tips"),
              wildlife: t("knowledgeTypes.wildlife"),
              other: t("knowledgeTypes.other"),
            },
            success: {
              title: t("success.title"),
              message: t("success.message"),
              another: t("success.another"),
            },
            error: {
              title: t("error.title"),
              tryAgain: t("error.tryAgain"),
            },
          }}
        />
      </div>
    </main>
  );
}
