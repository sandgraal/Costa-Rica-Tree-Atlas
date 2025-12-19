import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@i18n/navigation";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: locale === "es" ? "Sobre Nosotros" : "About Us",
    description:
      locale === "es"
        ? "Conoce más sobre el Atlas de Árboles de Costa Rica, un proyecto de código abierto dedicado a documentar la flora arbórea costarricense."
        : "Learn more about the Costa Rica Tree Atlas, an open-source project dedicated to documenting Costa Rican trees.",
    alternates: {
      languages: {
        en: "/en/about",
        es: "/es/about",
      },
    },
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <AboutContent />
      </div>
    </div>
  );
}

function AboutContent() {
  const t = useTranslations("about");

  return (
    <article className="prose prose-lg dark:prose-invert mx-auto">
      {/* Header */}
      <div className="text-center mb-12 not-prose">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-10 h-10 text-primary"
          >
            <path d="M12 2C9.5 2 7 4 7 7c0 1.5.5 2.5 1 3.5-1.5.5-3 1.5-3 4 0 2 1 3.5 2.5 4.5-.5 1-1 2-1 3.5v.5h11v-.5c0-1.5-.5-2.5-1-3.5 1.5-1 2.5-2.5 2.5-4.5 0-2.5-1.5-3.5-3-4C16.5 9.5 17 8.5 17 7c0-3-2.5-5-5-5z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-primary-dark dark:text-primary-light mb-4">
          {t("title")}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
      </div>

      {/* Mission */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-primary-dark dark:text-primary-light">
          {t("mission.title")}
        </h2>
        <p>{t("mission.description")}</p>
      </section>

      {/* What We Offer */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-primary-dark dark:text-primary-light">
          {t("features.title")}
        </h2>
        <div className="grid md:grid-cols-2 gap-6 not-prose mt-6">
          <FeatureCard
            icon="🌐"
            title={t("features.bilingual.title")}
            description={t("features.bilingual.description")}
          />
          <FeatureCard
            icon="📚"
            title={t("features.comprehensive.title")}
            description={t("features.comprehensive.description")}
          />
          <FeatureCard
            icon="🔬"
            title={t("features.scientific.title")}
            description={t("features.scientific.description")}
          />
          <FeatureCard
            icon="💻"
            title={t("features.openSource.title")}
            description={t("features.openSource.description")}
          />
        </div>
      </section>

      {/* Why Costa Rica */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-primary-dark dark:text-primary-light">
          {t("whyCostaRica.title")}
        </h2>
        <p>{t("whyCostaRica.description")}</p>
        <div className="not-prose grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <StatCard value="5%" label={t("whyCostaRica.stats.biodiversity")} />
          <StatCard value="500+" label={t("whyCostaRica.stats.treeSpecies")} />
          <StatCard value="12" label={t("whyCostaRica.stats.lifeZones")} />
          <StatCard value="25%+" label={t("whyCostaRica.stats.protected")} />
        </div>
      </section>

      {/* Contributing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-primary-dark dark:text-primary-light">
          {t("contributing.title")}
        </h2>
        <p>{t("contributing.description")}</p>
        <div className="not-prose flex flex-wrap gap-4 mt-6">
          <a
            href="https://github.com/sandgraal/Costa-Rica-Tree-Atlas"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            {t("contributing.github")}
          </a>
          <Link
            href="/trees"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-primary-dark rounded-lg font-medium hover:bg-accent-light transition-colors"
          >
            {t("contributing.explore")}
          </Link>
        </div>
      </section>

      {/* Acknowledgments */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-primary-dark dark:text-primary-light">
          {t("acknowledgments.title")}
        </h2>
        <p>{t("acknowledgments.description")}</p>
        <ul>
          <li>{t("acknowledgments.inaturalist")}</li>
          <li>{t("acknowledgments.sinac")}</li>
          <li>{t("acknowledgments.community")}</li>
        </ul>
      </section>

      {/* License */}
      <section className="not-prose">
        <div className="bg-muted rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">{t("license.title")}</h3>
          <p className="text-muted-foreground">{t("license.description")}</p>
        </div>
      </section>
    </article>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-primary/5 rounded-xl p-4 text-center">
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
