import { setRequestLocale } from "next-intl/server";
import { Link } from "@i18n/navigation";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: locale === "es" ? "Casos de Uso" : "Use Cases",
    description:
      locale === "es"
        ? "Encuentra árboles organizados por necesidades comunes"
        : "Find trees organized by common needs",
    alternates: {
      languages: {
        en: "/en/use-cases",
        es: "/es/use-cases",
      },
    },
  };
}

// Define use case scenarios with search criteria
const USE_CASES = [
  {
    id: "shade-coffee",
    icon: "☕",
    tags: ["native", "nitrogen-fixer", "shade-tree"],
  },
  {
    id: "playground",
    icon: "🎡",
    tags: [],
    safetyFilter: {
      childSafe: true,
      petSafe: true,
    },
  },
  {
    id: "erosion-control",
    icon: "🌊",
    tags: ["erosion-control", "native", "pioneer", "fast-growing"],
  },
  {
    id: "windbreak",
    icon: "💨",
    tags: ["windbreak", "native", "evergreen", "fast-growing"],
  },
  {
    id: "urban-street",
    icon: "🏙️",
    tags: ["urban-tolerant", "drought-tolerant", "compact-crown", "native"],
  },
  {
    id: "wildlife-habitat",
    icon: "🦜",
    tags: ["native", "fruit-bearing", "flowering", "wildlife-food"],
  },
  {
    id: "reforestation",
    icon: "🌳",
    tags: ["native", "pioneer", "fast-growing", "nitrogen-fixer"],
  },
  {
    id: "timber-production",
    icon: "🪵",
    tags: ["timber", "hardwood", "native"],
  },
  {
    id: "edible-fruit",
    icon: "🍎",
    tags: ["fruit-bearing", "edible"],
  },
  {
    id: "drought-tolerant",
    icon: "☀️",
    tags: ["drought-tolerant", "native", "xerophytic"],
  },
  {
    id: "riparian-restoration",
    icon: "💧",
    tags: ["riparian", "native", "erosion-control"],
  },
  {
    id: "medicinal",
    icon: "🩺",
    tags: ["medicinal", "native"],
  },
];

export default async function UseCasesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-dark dark:text-primary-light mb-4">
            {locale === "es"
              ? "Encuentra el Árbol Perfecto"
              : "Find the Perfect Tree"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {locale === "es"
              ? "Explora árboles organizados por necesidades comunes. Cada categoría muestra especies específicamente adecuadas para ese propósito."
              : "Explore trees organized by common needs. Each category shows species specifically suited for that purpose."}
          </p>
        </header>

        {/* Use Case Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {USE_CASES.map((useCase) => (
            <UseCaseCard key={useCase.id} useCase={useCase} locale={locale} />
          ))}
        </div>

        {/* Additional Tools */}
        <section className="mt-16 pt-12 border-t border-border">
          <h2 className="text-2xl font-bold text-primary-dark dark:text-primary-light mb-6">
            {locale === "es" ? "Más Herramientas" : "More Tools"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/wizard"
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all"
            >
              <div className="text-3xl mb-3">🧙</div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                {locale === "es" ? "Asistente de Selección" : "Tree Wizard"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {locale === "es"
                  ? "Responde algunas preguntas para obtener recomendaciones personalizadas"
                  : "Answer a few questions to get personalized recommendations"}
              </p>
            </Link>

            <Link
              href="/trees"
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all"
            >
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                {locale === "es"
                  ? "Explorar Todos los Árboles"
                  : "Browse All Trees"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {locale === "es"
                  ? "Explora el directorio completo con filtros avanzados"
                  : "Explore the full directory with advanced filtering"}
              </p>
            </Link>

            <Link
              href="/seasonal"
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all"
            >
              <div className="text-3xl mb-3">📅</div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                {locale === "es"
                  ? "Calendario Estacional"
                  : "Seasonal Calendar"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {locale === "es"
                  ? "Descubre qué árboles florecen y fructifican cada mes"
                  : "Discover which trees flower and fruit each month"}
              </p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function UseCaseCard({
  useCase,
  locale,
}: {
  useCase: (typeof USE_CASES)[0];
  locale: string;
}) {
  // Build search URL with tags
  const searchParams = new URLSearchParams();
  if (useCase.tags.length > 0) {
    useCase.tags.forEach((tag) => searchParams.append("tag", tag));
  }
  if (useCase.safetyFilter?.childSafe) {
    searchParams.append("childSafe", "true");
  }
  if (useCase.safetyFilter?.petSafe) {
    searchParams.append("petSafe", "true");
  }

  const searchUrl = `/trees?${searchParams.toString()}`;

  const titles: Record<string, { en: string; es: string }> = {
    "shade-coffee": {
      en: "Coffee Shade Trees",
      es: "Árboles de Sombra para Café",
    },
    playground: {
      en: "Safe for Playgrounds",
      es: "Seguros para Patios de Juego",
    },
    "erosion-control": {
      en: "Erosion Control",
      es: "Control de Erosión",
    },
    windbreak: {
      en: "Windbreaks",
      es: "Cortavientos",
    },
    "urban-street": {
      en: "Urban Street Trees",
      es: "Árboles Urbanos",
    },
    "wildlife-habitat": {
      en: "Wildlife Habitat",
      es: "Hábitat para Fauna",
    },
    reforestation: {
      en: "Reforestation",
      es: "Reforestación",
    },
    "timber-production": {
      en: "Timber Production",
      es: "Producción Maderera",
    },
    "edible-fruit": {
      en: "Edible Fruits",
      es: "Frutas Comestibles",
    },
    "drought-tolerant": {
      en: "Drought Tolerant",
      es: "Tolerantes a Sequía",
    },
    "riparian-restoration": {
      en: "Riparian Restoration",
      es: "Restauración Ribereña",
    },
    medicinal: {
      en: "Medicinal Uses",
      es: "Usos Medicinales",
    },
  };

  const descriptions: Record<string, { en: string; es: string }> = {
    "shade-coffee": {
      en: "Trees that provide ideal canopy for coffee cultivation while fixing nitrogen and protecting soil",
      es: "Árboles que proporcionan dosel ideal para cultivo de café mientras fijan nitrógeno y protegen el suelo",
    },
    playground: {
      en: "Non-toxic trees safe for children and pets, without hazardous spines or falling branches",
      es: "Árboles no tóxicos seguros para niños y mascotas, sin espinas peligrosas ni ramas que caigan",
    },
    "erosion-control": {
      en: "Fast-growing species with strong root systems that stabilize slopes and prevent soil loss",
      es: "Especies de crecimiento rápido con sistemas radiculares fuertes que estabilizan pendientes y previenen pérdida de suelo",
    },
    windbreak: {
      en: "Tall, dense trees that provide wind protection for crops, homes, and sensitive areas",
      es: "Árboles altos y densos que proporcionan protección contra viento para cultivos, hogares y áreas sensibles",
    },
    "urban-street": {
      en: "Compact, low-maintenance trees suitable for streets, parks, and urban landscapes",
      es: "Árboles compactos de bajo mantenimiento adecuados para calles, parques y paisajes urbanos",
    },
    "wildlife-habitat": {
      en: "Native species that provide food, shelter, and nesting sites for birds and wildlife",
      es: "Especies nativas que proporcionan alimento, refugio y sitios de anidación para aves y fauna",
    },
    reforestation: {
      en: "Pioneer species ideal for restoring degraded lands and establishing forest succession",
      es: "Especies pioneras ideales para restaurar tierras degradadas y establecer sucesión forestal",
    },
    "timber-production": {
      en: "Valuable hardwood species for sustainable timber production and agroforestry",
      es: "Especies de madera dura valiosa para producción maderera sostenible y agroforestería",
    },
    "edible-fruit": {
      en: "Trees producing safe, edible fruits for human consumption and food security",
      es: "Árboles que producen frutas seguras y comestibles para consumo humano y seguridad alimentaria",
    },
    "drought-tolerant": {
      en: "Species adapted to dry seasons and water scarcity, ideal for Guanacaste and Pacific regions",
      es: "Especies adaptadas a estaciones secas y escasez de agua, ideales para Guanacaste y regiones del Pacífico",
    },
    "riparian-restoration": {
      en: "Trees suited for riverbanks and wetlands that filter water and prevent erosion",
      es: "Árboles adecuados para riberas de ríos y humedales que filtran agua y previenen erosión",
    },
    medicinal: {
      en: "Species with documented traditional medicinal properties used in Costa Rican folk medicine",
      es: "Especies con propiedades medicinales tradicionales documentadas usadas en medicina popular costarricense",
    },
  };

  const title = titles[useCase.id]?.[locale as "en" | "es"] || useCase.id;
  const description = descriptions[useCase.id]?.[locale as "en" | "es"] || "";

  return (
    <Link
      href={searchUrl}
      className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all"
    >
      <div className="text-4xl mb-4">{useCase.icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-primary-dark dark:text-primary-light group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <div className="flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all">
        <span>{locale === "es" ? "Ver árboles" : "View trees"}</span>
        <ArrowRightIcon className="h-4 w-4" />
      </div>
    </Link>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
