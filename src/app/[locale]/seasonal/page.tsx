import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SeasonalCalendar } from "@/components/SeasonalCalendar";
import { SafeJsonLd } from "@/components/SafeJsonLd";
import { allTrees } from "contentlayer/generated";
import {
  getEventsForMonth,
  getEventTranslation,
  COSTA_RICA_EVENTS,
} from "@/lib/costaRicaEvents";

interface SeasonalPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ month?: string; event?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: SeasonalPageProps): Promise<Metadata> {
  const { locale } = await params;
  const { month, event } = await searchParams;
  const t = await getTranslations({ locale, namespace: "seasonal" });

  // If there's a specific event, customize the metadata
  if (event) {
    const eventData = COSTA_RICA_EVENTS.find((e) => e.id === event);
    const eventInfo = eventData ? getEventTranslation(event, locale) : null;
    if (eventInfo) {
      return {
        title: `${eventInfo.name} - ${t("pageTitle")}`,
        description: eventInfo.description,
        alternates: {
          canonical: `/${locale}/seasonal?event=${event}`,
          languages: {
            en: `/en/seasonal?event=${event}`,
            es: `/es/seasonal?event=${event}`,
          },
        },
        openGraph: {
          title: `${eventInfo.name} - Costa Rica Tree Atlas`,
          description: eventInfo.description,
        },
      };
    }
  }

  // If there's a specific month, customize the metadata
  if (month) {
    const monthNames: Record<string, Record<string, string>> = {
      en: {
        january: "January",
        february: "February",
        march: "March",
        april: "April",
        may: "May",
        june: "June",
        july: "July",
        august: "August",
        september: "September",
        october: "October",
        november: "November",
        december: "December",
      },
      es: {
        january: "Enero",
        february: "Febrero",
        march: "Marzo",
        april: "Abril",
        may: "Mayo",
        june: "Junio",
        july: "Julio",
        august: "Agosto",
        september: "Septiembre",
        october: "Octubre",
        november: "Noviembre",
        december: "Diciembre",
      },
    };
    const monthName = monthNames[locale]?.[month] || month;

    return {
      title: `${monthName} - ${t("title")}`,
      description:
        locale === "es"
          ? `Descubre qué árboles de Costa Rica están floreciendo y fructificando en ${monthName}.`
          : `Discover which Costa Rican trees are flowering and fruiting in ${monthName}.`,
      alternates: {
        canonical: `/${locale}/seasonal?month=${month}`,
        languages: {
          en: `/en/seasonal?month=${month}`,
          es: `/es/seasonal?month=${month}`,
        },
      },
    };
  }

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/seasonal`,
      languages: {
        en: "/en/seasonal",
        es: "/es/seasonal",
      },
    },
  };
}

export default async function SeasonalPage({
  params,
  searchParams,
}: SeasonalPageProps) {
  const { locale } = await params;
  const { month: initialMonth, event: initialEvent } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "seasonal" });

  // Get trees for this locale with seasonal data
  const trees = allTrees
    .filter((tree) => tree.locale === locale)
    .map((tree) => ({
      title: tree.title,
      slug: tree.slug,
      scientificName: tree.scientificName,
      featuredImage: tree.featuredImage,
      floweringSeason: tree.floweringSeason,
      fruitingSeason: tree.fruitingSeason,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

  // Generate Event structured data for seasonal calendar
  const currentMonth = new Date()
    .toLocaleString("en", { month: "long" })
    .toLowerCase();
  const treesFloweringNow = trees.filter((tree) =>
    tree.floweringSeason?.includes(currentMonth)
  );
  const treesFruitingNow = trees.filter((tree) =>
    tree.fruitingSeason?.includes(currentMonth)
  );

  // Get events for the current month
  const currentMonthEvents = getEventsForMonth(currentMonth);
  const eventItems = currentMonthEvents.slice(0, 5).map((event, index) => {
    const eventInfo = getEventTranslation(event.id, locale);
    return {
      "@type": "Event",
      name: eventInfo?.name || event.id,
      description: eventInfo?.description || "",
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    };
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name:
      locale === "es"
        ? "Calendario Estacional de Árboles"
        : "Seasonal Tree Calendar",
    description:
      locale === "es"
        ? "Descubre cuándo florecen y fructifican los árboles de Costa Rica"
        : "Discover when Costa Rica's trees flower and fruit",
    mainEntity: {
      "@type": "ItemList",
      name:
        locale === "es"
          ? "Árboles activos este mes"
          : "Trees active this month",
      numberOfItems:
        treesFloweringNow.length + treesFruitingNow.length + eventItems.length,
      itemListElement: [
        ...treesFloweringNow.slice(0, 10).map((tree, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Thing",
            name: tree.title,
            description:
              locale === "es"
                ? `${tree.title} está floreciendo`
                : `${tree.title} is flowering`,
            url: `https://costaricatreeatlas.com/${locale}/trees/${tree.slug}`,
          },
        })),
        ...eventItems.map((event, index) => ({
          "@type": "ListItem",
          position: treesFloweringNow.slice(0, 10).length + index + 1,
          item: event,
        })),
      ],
    },
  };

  return (
    <>
      <SafeJsonLd data={structuredData} />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t("pageTitle")}
          </h1>
          <p className="text-muted-foreground">{t("pageDescription")}</p>
        </div>

        <SeasonalCalendar trees={trees} locale={locale} />

        {/* Costa Rica Climate Info */}
        <section className="mt-12 bg-muted rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">{t("climateTitle")}</h2>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p>{t("climateDescription")}</p>
            <div className="grid md:grid-cols-2 gap-4 mt-4 not-prose">
              <div className="bg-background rounded-lg p-4">
                <h3 className="font-medium text-primary mb-2">
                  {t("drySeason")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("drySeasonMonths")}
                </p>
                <p className="text-xs mt-2">{t("drySeasonNote")}</p>
              </div>
              <div className="bg-background rounded-lg p-4">
                <h3 className="font-medium text-primary mb-2">
                  {t("wetSeason")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("wetSeasonMonths")}
                </p>
                <p className="text-xs mt-2">{t("wetSeasonNote")}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}
