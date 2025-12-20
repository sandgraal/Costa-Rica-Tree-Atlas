import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import { IdentificationGuide } from "@/components/IdentificationGuide";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "identification" });
  const siteT = await getTranslations({ locale });

  return {
    title: `${t("title")} | ${siteT("siteTitle")}`,
    description: t("subtitle"),
  };
}

export default async function IdentifyPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Get all trees for the current locale
  const trees = allTrees
    .filter((tree) => tree.locale === locale)
    .sort((a, b) => a.title.localeCompare(b.title));

  return <IdentifyPageClient locale={locale} trees={trees} />;
}

function IdentifyPageClient({
  locale,
  trees,
}: {
  locale: string;
  trees: (typeof allTrees)[number][];
}) {
  const t = useTranslations("identification");

  const translations = {
    title: t("title"),
    subtitle: t("subtitle"),
    restart: t("restart"),
    resultsTitle: t("resultsTitle"),
    noResults: t("noResults"),
    matchingTrees: t("matchingTrees"),
    confidence: t("confidence"),
    questions: {
      foliage: {
        question: t("questions.foliage.question"),
        options: {
          deciduous: t("questions.foliage.options.deciduous"),
          evergreen: t("questions.foliage.options.evergreen"),
          unknown: t("questions.foliage.options.unknown"),
        },
      },
      flowering: {
        question: t("questions.flowering.question"),
        options: {
          showy: t("questions.flowering.options.showy"),
          inconspicuous: t("questions.flowering.options.inconspicuous"),
          unknown: t("questions.flowering.options.unknown"),
        },
      },
      fruit: {
        question: t("questions.fruit.question"),
        options: {
          edible: t("questions.fruit.options.edible"),
          nonEdible: t("questions.fruit.options.nonEdible"),
          unknown: t("questions.fruit.options.unknown"),
        },
      },
      origin: {
        question: t("questions.origin.question"),
        options: {
          native: t("questions.origin.options.native"),
          introduced: t("questions.origin.options.introduced"),
          unknown: t("questions.origin.options.unknown"),
        },
      },
      size: {
        question: t("questions.size.question"),
        options: {
          tall: t("questions.size.options.tall"),
          medium: t("questions.size.options.medium"),
          unknown: t("questions.size.options.unknown"),
        },
      },
      habitat: {
        question: t("questions.habitat.question"),
        options: {
          dryForest: t("questions.habitat.options.dryForest"),
          rainforest: t("questions.habitat.options.rainforest"),
          coastal: t("questions.habitat.options.coastal"),
          highland: t("questions.habitat.options.highland"),
          unknown: t("questions.habitat.options.unknown"),
        },
      },
      uses: {
        question: t("questions.uses.question"),
        options: {
          timber: t("questions.uses.options.timber"),
          medicinal: t("questions.uses.options.medicinal"),
          ornamental: t("questions.uses.options.ornamental"),
          ecological: t("questions.uses.options.ecological"),
          unknown: t("questions.uses.options.unknown"),
        },
      },
    },
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <IdentificationGuide
        trees={trees}
        locale={locale}
        translations={translations}
      />
    </main>
  );
}
