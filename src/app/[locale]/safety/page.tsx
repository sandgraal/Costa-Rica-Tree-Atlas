import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import { SafeJsonLd } from "@/components/SafeJsonLd";
import { SafetyBadge, SafetyIcon } from "@/components/safety";
import { Link } from "@i18n/navigation";
import type { Metadata } from "next";
import type { ToxicityLevel } from "@/types/tree";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: locale === "es" ? "Seguridad de Árboles" : "Tree Safety",
    description:
      locale === "es"
        ? "Información de seguridad sobre árboles tóxicos y peligrosos en Costa Rica. Contactos de emergencia, primeros auxilios y datos de toxicidad."
        : "Safety information about toxic and hazardous trees in Costa Rica. Emergency contacts, first aid procedures, and toxicity data.",
    alternates: {
      languages: {
        en: "/en/safety",
        es: "/es/safety",
      },
    },
  };
}

// Helper to get toxicity level order for sorting
function getToxicityOrder(level?: ToxicityLevel): number {
  const order: Record<string, number> = {
    severe: 0,
    high: 1,
    moderate: 2,
    low: 3,
    none: 4,
  };
  return level ? (order[level] ?? 5) : 5;
}

export default async function SafetyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("safety");

  // Get trees for current locale with safety data
  const trees = allTrees
    .filter((tree) => tree.locale === locale)
    .filter((tree) => tree.toxicityLevel) // Only trees with safety data
    .sort(
      (a, b) =>
        getToxicityOrder(a.toxicityLevel) - getToxicityOrder(b.toxicityLevel)
    );

  // Group trees by toxicity level
  const severeRisk = trees.filter((t) => t.toxicityLevel === "severe");
  const highRisk = trees.filter((t) => t.toxicityLevel === "high");
  const moderateRisk = trees.filter((t) => t.toxicityLevel === "moderate");
  const lowRisk = trees.filter((t) => t.toxicityLevel === "low");
  const safe = trees.filter((t) => t.toxicityLevel === "none");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: locale === "es" ? "Seguridad de Árboles" : "Tree Safety",
    description:
      locale === "es"
        ? "Información de seguridad sobre árboles de Costa Rica"
        : "Safety information about Costa Rican trees",
  };

  return (
    <>
      <SafeJsonLd structuredData={structuredData} />

      <div className="mx-auto max-w-4xl space-y-12 px-4 py-8">
        {/* Header */}
        <header className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            {locale === "es" ? "Seguridad de Árboles" : "Tree Safety"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {locale === "es"
              ? "Información crítica de seguridad sobre árboles tóxicos y peligrosos en Costa Rica"
              : "Critical safety information about toxic and hazardous trees in Costa Rica"}
          </p>
        </header>

        {/* Emergency Contacts */}
        <section className="rounded-lg border border-red-500/20 bg-red-50 p-6 dark:bg-red-950/20">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-red-700 dark:text-red-400">
            <SafetyIcon level="severe" size="md" />
            {locale === "es" ? "Contactos de Emergencia" : "Emergency Contacts"}
          </h2>
          <dl className="space-y-3 text-red-900 dark:text-red-200">
            <div>
              <dt className="font-semibold">
                {locale === "es"
                  ? "Centro de Control de Envenenamiento de Costa Rica:"
                  : "Costa Rica Poison Control Center:"}
              </dt>
              <dd className="text-2xl font-bold">2223-1028</dd>
              <dd className="text-sm">
                {locale === "es" ? "24 horas, 7 días" : "24/7 Service"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold">
                {locale === "es"
                  ? "Servicios de Emergencia:"
                  : "Emergency Services:"}
              </dt>
              <dd className="text-2xl font-bold">911</dd>
            </div>
            <div>
              <dt className="font-semibold">
                {locale === "es"
                  ? "Instituto Nacional de Seguros:"
                  : "National Insurance Institute:"}
              </dt>
              <dd className="text-2xl font-bold">800-8000-911</dd>
            </div>
          </dl>
        </section>

        {/* First Aid Procedures */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">
            {locale === "es" ? "Primeros Auxilios" : "First Aid Procedures"}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Ingestion */}
            <div className="space-y-2 rounded-lg border bg-card p-4">
              <h3 className="font-semibold">
                {locale === "es" ? "Ingestión" : "Ingestion"}
              </h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>
                  {locale === "es"
                    ? "NO induzca el vómito a menos que lo indique control de envenenamiento"
                    : "DO NOT induce vomiting unless directed by poison control"}
                </li>
                <li>
                  {locale === "es"
                    ? "Enjuague la boca con agua"
                    : "Rinse mouth with water"}
                </li>
                <li>
                  {locale === "es"
                    ? "Identifique la planta si es posible"
                    : "Identify plant if possible"}
                </li>
                <li>
                  {locale === "es"
                    ? "Llame al 2223-1028 inmediatamente"
                    : "Call 2223-1028 immediately"}
                </li>
              </ul>
            </div>

            {/* Skin Contact */}
            <div className="space-y-2 rounded-lg border bg-card p-4">
              <h3 className="font-semibold">
                {locale === "es" ? "Contacto con la Piel" : "Skin Contact"}
              </h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>
                  {locale === "es"
                    ? "Lave el área afectada con agua y jabón abundante"
                    : "Wash affected area with soap and plenty of water"}
                </li>
                <li>
                  {locale === "es"
                    ? "Retire la ropa contaminada"
                    : "Remove contaminated clothing"}
                </li>
                <li>
                  {locale === "es"
                    ? "NO se frote - puede esparcir el irritante"
                    : "DO NOT rub - may spread irritant"}
                </li>
                <li>
                  {locale === "es"
                    ? "Busque atención médica si hay ampollas o dolor severo"
                    : "Seek medical attention if blistering or severe pain"}
                </li>
              </ul>
            </div>

            {/* Eye Contact */}
            <div className="space-y-2 rounded-lg border bg-card p-4">
              <h3 className="font-semibold">
                {locale === "es" ? "Contacto con los Ojos" : "Eye Contact"}
              </h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>
                  {locale === "es"
                    ? "Enjuague INMEDIATAMENTE con agua limpia durante 15-20 minutos"
                    : "Flush IMMEDIATELY with clean water for 15-20 minutes"}
                </li>
                <li>
                  {locale === "es"
                    ? "Mantenga los párpados abiertos durante el enjuague"
                    : "Hold eyelids open while flushing"}
                </li>
                <li>
                  {locale === "es" ? "NO se frote los ojos" : "DO NOT rub eyes"}
                </li>
                <li>
                  {locale === "es"
                    ? "Busque atención médica de emergencia"
                    : "Seek emergency medical care"}
                </li>
              </ul>
            </div>

            {/* Inhalation */}
            <div className="space-y-2 rounded-lg border bg-card p-4">
              <h3 className="font-semibold">
                {locale === "es"
                  ? "Inhalación (humo, polvo)"
                  : "Inhalation (smoke, dust)"}
              </h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>
                  {locale === "es"
                    ? "Muévase al aire fresco inmediatamente"
                    : "Move to fresh air immediately"}
                </li>
                <li>
                  {locale === "es"
                    ? "Afloje la ropa ajustada"
                    : "Loosen tight clothing"}
                </li>
                <li>
                  {locale === "es"
                    ? "Si hay dificultad para respirar, llame al 911"
                    : "If breathing difficulty, call 911"}
                </li>
                <li>
                  {locale === "es"
                    ? "Manténgase en reposo en posición cómoda"
                    : "Rest in comfortable position"}
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Trees by Toxicity Level */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold">
            {locale === "es"
              ? "Árboles por Nivel de Toxicidad"
              : "Trees by Toxicity Level"}
          </h2>

          {/* Severe */}
          {severeRisk.length > 0 && (
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-xl font-semibold text-red-700 dark:text-red-400">
                <SafetyIcon level="severe" size="sm" />
                {locale === "es" ? "Toxicidad Severa" : "Severe Toxicity"}
                <span className="text-sm font-normal text-muted-foreground">
                  ({severeRisk.length})
                </span>
              </h3>
              <p className="text-sm text-muted-foreground">
                {locale === "es"
                  ? "Extremadamente peligroso. Puede causar lesiones graves o la muerte. Evite todo contacto."
                  : "Extremely dangerous. Can cause serious injury or death. Avoid all contact."}
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {severeRisk.map((tree) => (
                  <li key={tree._id}>
                    <Link
                      href={`/trees/${tree.slug}`}
                      className="flex items-center gap-2 rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
                    >
                      <SafetyBadge level="severe" size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{tree.title}</div>
                        <div className="truncate text-sm italic text-muted-foreground">
                          {tree.scientificName}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* High */}
          {highRisk.length > 0 && (
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-xl font-semibold text-orange-700 dark:text-orange-400">
                <SafetyIcon level="high" size="sm" />
                {locale === "es" ? "Toxicidad Alta" : "High Toxicity"}
                <span className="text-sm font-normal text-muted-foreground">
                  ({highRisk.length})
                </span>
              </h3>
              <p className="text-sm text-muted-foreground">
                {locale === "es"
                  ? "Altamente tóxico. Requiere precauciones significativas."
                  : "Highly toxic. Requires significant precautions."}
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {highRisk.map((tree) => (
                  <li key={tree._id}>
                    <Link
                      href={`/trees/${tree.slug}`}
                      className="flex items-center gap-2 rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
                    >
                      <SafetyBadge level="high" size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{tree.title}</div>
                        <div className="truncate text-sm italic text-muted-foreground">
                          {tree.scientificName}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Moderate */}
          {moderateRisk.length > 0 && (
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-xl font-semibold text-yellow-700 dark:text-yellow-400">
                <SafetyIcon level="moderate" size="sm" />
                {locale === "es" ? "Toxicidad Moderada" : "Moderate Toxicity"}
                <span className="text-sm font-normal text-muted-foreground">
                  ({moderateRisk.length})
                </span>
              </h3>
              <p className="text-sm text-muted-foreground">
                {locale === "es"
                  ? "Puede causar molestias o reacciones. Use precaución."
                  : "May cause discomfort or reactions. Use caution."}
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {moderateRisk.map((tree) => (
                  <li key={tree._id}>
                    <Link
                      href={`/trees/${tree.slug}`}
                      className="flex items-center gap-2 rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
                    >
                      <SafetyBadge level="moderate" size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{tree.title}</div>
                        <div className="truncate text-sm italic text-muted-foreground">
                          {tree.scientificName}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Low */}
          {lowRisk.length > 0 && (
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-xl font-semibold text-blue-700 dark:text-blue-400">
                <SafetyIcon level="low" size="sm" />
                {locale === "es" ? "Toxicidad Baja" : "Low Toxicity"}
                <span className="text-sm font-normal text-muted-foreground">
                  ({lowRisk.length})
                </span>
              </h3>
              <p className="text-sm text-muted-foreground">
                {locale === "es"
                  ? "Riesgo mínimo. Generalmente seguro con manejo adecuado."
                  : "Minimal risk. Generally safe with proper handling."}
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {lowRisk.map((tree) => (
                  <li key={tree._id}>
                    <Link
                      href={`/trees/${tree.slug}`}
                      className="flex items-center gap-2 rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
                    >
                      <SafetyBadge level="low" size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{tree.title}</div>
                        <div className="truncate text-sm italic text-muted-foreground">
                          {tree.scientificName}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Safe */}
          {safe.length > 0 && (
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-xl font-semibold text-green-700 dark:text-green-400">
                <SafetyIcon level="none" size="sm" />
                {locale === "es" ? "Seguro" : "Safe"}
                <span className="text-sm font-normal text-muted-foreground">
                  ({safe.length})
                </span>
              </h3>
              <p className="text-sm text-muted-foreground">
                {locale === "es"
                  ? "No se conocen preocupaciones de toxicidad. Seguro para uso general."
                  : "No known toxicity concerns. Safe for general use."}
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {safe.map((tree) => (
                  <li key={tree._id}>
                    <Link
                      href={`/trees/${tree.slug}`}
                      className="flex items-center gap-2 rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
                    >
                      <SafetyBadge level="none" size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{tree.title}</div>
                        <div className="truncate text-sm italic text-muted-foreground">
                          {tree.scientificName}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Disclaimer */}
        <section className="rounded-lg border bg-muted/50 p-6">
          <h2 className="mb-3 font-semibold">
            {locale === "es" ? "Descargo de Responsabilidad" : "Disclaimer"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {locale === "es"
              ? "Esta información se proporciona con fines educativos. Siempre consulte a profesionales médicos o expertos en plantas para situaciones específicas. En caso de envenenamiento, contacte inmediatamente el Centro de Control de Envenenamiento de Costa Rica al 2223-1028 o servicios de emergencia al 911. Tenga precaución al manipular cualquier planta desconocida."
              : "This information is provided for educational purposes. Always consult medical professionals or plant experts for specific situations. In case of poisoning, immediately contact Costa Rica Poison Control at 2223-1028 or emergency services at 911. Exercise caution when handling any unfamiliar plant."}
          </p>
        </section>

        {/* Print Button */}
        <div className="flex justify-center print:hidden">
          <button
            onClick={() => window.print()}
            className="rounded-lg border bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {locale === "es" ? "Imprimir Esta Página" : "Print This Page"}
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          nav,
          footer,
          button {
            display: none !important;
          }

          body {
            background: white !important;
            color: black !important;
          }

          .dark\\:bg-red-950\\/20 {
            background: #fee2e2 !important;
          }

          a {
            color: inherit !important;
            text-decoration: none !important;
          }
        }
      `}</style>
    </>
  );
}
