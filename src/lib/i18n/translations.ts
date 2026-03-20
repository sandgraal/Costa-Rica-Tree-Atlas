/**
 * Centralized translation dictionary for component-level translations
 * These are dynamic translations that can't easily go in message files
 */

import type {
  Locale,
  Month,
  TreeTag,
  ConservationCategory,
  PopulationTrend,
} from "@/types/tree";

// ============================================================================
// Month Translations
// ============================================================================

export const MONTH_SHORT: Record<Locale, Record<Month, string>> = {
  en: {
    january: "Jan",
    february: "Feb",
    march: "Mar",
    april: "Apr",
    may: "May",
    june: "Jun",
    july: "Jul",
    august: "Aug",
    september: "Sep",
    october: "Oct",
    november: "Nov",
    december: "Dec",
    "all-year": "All",
  },
  es: {
    january: "Ene",
    february: "Feb",
    march: "Mar",
    april: "Abr",
    may: "May",
    june: "Jun",
    july: "Jul",
    august: "Ago",
    september: "Sep",
    october: "Oct",
    november: "Nov",
    december: "Dic",
    "all-year": "Todo",
  },
};

export const MONTH_FULL: Record<Locale, Record<Month, string>> = {
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
    "all-year": "Year-round",
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
    "all-year": "Todo el año",
  },
};

// ============================================================================
// Tag Translations
// ============================================================================

export interface TagDefinition {
  label: Record<Locale, string>;
  category: "origin" | "foliage" | "ecology" | "use" | "habitat";
  color: string;
  icon: string;
}

export const TAG_DEFINITIONS: Record<TreeTag, TagDefinition> = {
  native: {
    label: { en: "Native", es: "Nativo" },
    category: "origin",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    icon: "🌱",
  },
  endemic: {
    label: { en: "Endemic", es: "Endémico" },
    category: "origin",
    color:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    icon: "🏝️",
  },
  introduced: {
    label: { en: "Introduced", es: "Introducido" },
    category: "origin",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    icon: "✈️",
  },
  deciduous: {
    label: { en: "Deciduous", es: "Caducifolio" },
    category: "foliage",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    icon: "🍂",
  },
  evergreen: {
    label: { en: "Evergreen", es: "Perennifolio" },
    category: "foliage",
    color: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
    icon: "🌲",
  },
  flowering: {
    label: { en: "Flowering", es: "Floración" },
    category: "ecology",
    color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    icon: "🌸",
  },
  "fruit-bearing": {
    label: { en: "Fruit-bearing", es: "Fructífero" },
    category: "ecology",
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    icon: "🍎",
  },
  endangered: {
    label: { en: "Endangered", es: "En peligro" },
    category: "ecology",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    icon: "⚠️",
  },
  national: {
    label: { en: "National Symbol", es: "Símbolo Nacional" },
    category: "ecology",
    color:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    icon: "🇨🇷",
  },
  "nitrogen-fixing": {
    label: { en: "Nitrogen-fixing", es: "Fijador de nitrógeno" },
    category: "ecology",
    color: "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200",
    icon: "⚗️",
  },
  "shade-tree": {
    label: { en: "Shade Tree", es: "Árbol de sombra" },
    category: "use",
    color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    icon: "☂️",
  },
  "wildlife-food": {
    label: { en: "Wildlife Food", es: "Alimento silvestre" },
    category: "ecology",
    color:
      "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
    icon: "🐦",
  },
  "dry-forest": {
    label: { en: "Dry Forest", es: "Bosque seco" },
    category: "habitat",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    icon: "🏜️",
  },
  rainforest: {
    label: { en: "Rainforest", es: "Bosque lluvioso" },
    category: "habitat",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    icon: "🌴",
  },
  "cloud-forest": {
    label: { en: "Cloud Forest", es: "Bosque nuboso" },
    category: "habitat",
    color: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
    icon: "☁️",
  },
  timber: {
    label: { en: "Timber", es: "Maderable" },
    category: "use",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    icon: "🪵",
  },
  medicinal: {
    label: { en: "Medicinal", es: "Medicinal" },
    category: "use",
    color: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
    icon: "💊",
  },
  ornamental: {
    label: { en: "Ornamental", es: "Ornamental" },
    category: "use",
    color:
      "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200",
    icon: "🎨",
  },
};

// ============================================================================
// Conservation Status Translations
// ============================================================================

export interface ConservationDefinition {
  code: ConservationCategory;
  label: Record<Locale, string>;
  description: Record<Locale, string>;
  color: string;
  priority: number;
}

export const CONSERVATION_CATEGORIES: Record<
  ConservationCategory,
  ConservationDefinition
> = {
  EX: {
    code: "EX",
    label: { en: "Extinct", es: "Extinto" },
    description: { en: "No individuals remaining", es: "No quedan individuos" },
    color: "#000000",
    priority: 8,
  },
  EW: {
    code: "EW",
    label: { en: "Extinct in the Wild", es: "Extinto en estado silvestre" },
    description: {
      en: "Only survives in captivity",
      es: "Solo sobrevive en cautiverio",
    },
    color: "#542344",
    priority: 7,
  },
  CR: {
    code: "CR",
    label: { en: "Critically Endangered", es: "En peligro crítico" },
    description: {
      en: "Extremely high risk of extinction",
      es: "Riesgo extremadamente alto de extinción",
    },
    color: "#D81E05",
    priority: 6,
  },
  EN: {
    code: "EN",
    label: { en: "Endangered", es: "En peligro" },
    description: {
      en: "High risk of extinction",
      es: "Alto riesgo de extinción",
    },
    color: "#FC7F3F",
    priority: 5,
  },
  VU: {
    code: "VU",
    label: { en: "Vulnerable", es: "Vulnerable" },
    description: {
      en: "High risk of endangerment",
      es: "Alto riesgo de amenaza",
    },
    color: "#F9E814",
    priority: 4,
  },
  NT: {
    code: "NT",
    label: { en: "Near Threatened", es: "Casi amenazado" },
    description: {
      en: "Likely to become endangered",
      es: "Probable que se vuelva amenazado",
    },
    color: "#CCE226",
    priority: 3,
  },
  LC: {
    code: "LC",
    label: { en: "Least Concern", es: "Preocupación menor" },
    description: {
      en: "Low risk of extinction",
      es: "Bajo riesgo de extinción",
    },
    color: "#60C659",
    priority: 2,
  },
  DD: {
    code: "DD",
    label: { en: "Data Deficient", es: "Datos insuficientes" },
    description: { en: "Not enough data", es: "No hay suficientes datos" },
    color: "#D1D1C6",
    priority: 1,
  },
  NE: {
    code: "NE",
    label: { en: "Not Evaluated", es: "No evaluado" },
    description: { en: "Has not been assessed", es: "No ha sido evaluado" },
    color: "#FFFFFF",
    priority: 0,
  },
};

export const POPULATION_TRENDS: Record<
  PopulationTrend,
  { label: Record<Locale, string>; icon: string }
> = {
  decreasing: {
    label: { en: "Decreasing", es: "Disminuyendo" },
    icon: "↓",
  },
  stable: {
    label: { en: "Stable", es: "Estable" },
    icon: "→",
  },
  increasing: {
    label: { en: "Increasing", es: "Aumentando" },
    icon: "↑",
  },
  unknown: {
    label: { en: "Unknown", es: "Desconocido" },
    icon: "?",
  },
};

// ============================================================================
// Common UI Translations
// ============================================================================

export const UI_LABELS: Record<string, Record<Locale, string>> = {
  // Actions
  clearAll: { en: "Clear all", es: "Limpiar todo" },
  clearFilters: { en: "Clear filters", es: "Limpiar filtros" },
  showMore: { en: "Show more", es: "Ver más" },
  showLess: { en: "Show less", es: "Ver menos" },
  learnMore: { en: "Learn more", es: "Saber más" },
  viewAll: { en: "View all", es: "Ver todo" },
  backToTop: { en: "Back to top", es: "Volver arriba" },
  close: { en: "Close", es: "Cerrar" },
  search: { en: "Search", es: "Buscar" },
  filter: { en: "Filter", es: "Filtrar" },
  sort: { en: "Sort", es: "Ordenar" },

  // Status
  loading: { en: "Loading...", es: "Cargando..." },
  noResults: { en: "No results found", es: "No se encontraron resultados" },
  error: { en: "An error occurred", es: "Ocurrió un error" },

  // Seasonal
  flowering: { en: "Flowering", es: "Floración" },
  fruiting: { en: "Fruiting", es: "Fructificación" },
  yearRound: { en: "Year-round", es: "Todo el año" },

  // Distribution
  present: { en: "Present", es: "Presente" },
  notRecorded: { en: "Not recorded", es: "No registrado" },
  elevation: { en: "Elevation", es: "Elevación" },

  // Data sources
  observations: { en: "Observations", es: "Observaciones" },
  researchGrade: { en: "Research grade", es: "Grado de investigación" },
  globalRecords: { en: "Global records", es: "Registros globales" },

  // Conservation status
  lowerRisk: { en: "Lower risk", es: "Menor riesgo" },
  higherRisk: { en: "Higher risk", es: "Mayor riesgo" },
};

const DATE_LOCALES: Record<Locale, string> = {
  en: "en-US",
  es: "es-CR",
};

const OPEN_GRAPH_LOCALES: Record<Locale, string> = {
  en: "en_US",
  es: "es_CR",
};

const OPEN_GRAPH_ALTERNATE_LOCALES: Record<Locale, string> = {
  en: "es_CR",
  es: "en_US",
};

// ============================================================================
// Helper Functions
// ============================================================================

export function normalizeLocale(locale: string | Locale): Locale {
  if (locale === "es") {
    return "es";
  }

  return "en";
}

export function getAlternateLocale(locale: string | Locale): Locale {
  if (normalizeLocale(locale) === "es") {
    return "en";
  }

  return "es";
}

export function selectLocalizedValue<T>(
  en: T,
  es: T,
  locale: string | Locale
): T {
  return normalizeLocale(locale) === "es" ? es : en;
}

export function getLocalizedText(
  label: Record<Locale, string>,
  locale: Locale
): string {
  // eslint-disable-next-line security/detect-object-injection
  return label[locale] ?? label.en;
}

/**
 * Get the Intl-compatible date locale string for the given app locale.
 */
export function getDateLocale(locale: Locale): string {
  return DATE_LOCALES[locale];
}

export function getOpenGraphLocale(locale: string | Locale): string {
  return OPEN_GRAPH_LOCALES[normalizeLocale(locale)];
}

export function getAlternateOpenGraphLocale(locale: string | Locale): string {
  return OPEN_GRAPH_ALTERNATE_LOCALES[normalizeLocale(locale)];
}

function getMonthFromDictionary(
  dict: Record<Month, string>,
  month: Month
): string {
  switch (month) {
    case "january":
      return dict.january;
    case "february":
      return dict.february;
    case "march":
      return dict.march;
    case "april":
      return dict.april;
    case "may":
      return dict.may;
    case "june":
      return dict.june;
    case "july":
      return dict.july;
    case "august":
      return dict.august;
    case "september":
      return dict.september;
    case "october":
      return dict.october;
    case "november":
      return dict.november;
    case "december":
      return dict.december;
    case "all-year":
      return dict["all-year"];
  }
}

function getTagDefinition(tag: TreeTag): TagDefinition {
  switch (tag) {
    case "native":
      return TAG_DEFINITIONS.native;
    case "endemic":
      return TAG_DEFINITIONS.endemic;
    case "introduced":
      return TAG_DEFINITIONS.introduced;
    case "deciduous":
      return TAG_DEFINITIONS.deciduous;
    case "evergreen":
      return TAG_DEFINITIONS.evergreen;
    case "flowering":
      return TAG_DEFINITIONS.flowering;
    case "fruit-bearing":
      return TAG_DEFINITIONS["fruit-bearing"];
    case "endangered":
      return TAG_DEFINITIONS.endangered;
    case "national":
      return TAG_DEFINITIONS.national;
    case "nitrogen-fixing":
      return TAG_DEFINITIONS["nitrogen-fixing"];
    case "shade-tree":
      return TAG_DEFINITIONS["shade-tree"];
    case "wildlife-food":
      return TAG_DEFINITIONS["wildlife-food"];
    case "dry-forest":
      return TAG_DEFINITIONS["dry-forest"];
    case "rainforest":
      return TAG_DEFINITIONS.rainforest;
    case "cloud-forest":
      return TAG_DEFINITIONS["cloud-forest"];
    case "timber":
      return TAG_DEFINITIONS.timber;
    case "medicinal":
      return TAG_DEFINITIONS.medicinal;
    case "ornamental":
      return TAG_DEFINITIONS.ornamental;
  }
}

function getConservationDefinition(
  category: ConservationCategory
): ConservationDefinition {
  switch (category) {
    case "EX":
      return CONSERVATION_CATEGORIES.EX;
    case "EW":
      return CONSERVATION_CATEGORIES.EW;
    case "CR":
      return CONSERVATION_CATEGORIES.CR;
    case "EN":
      return CONSERVATION_CATEGORIES.EN;
    case "VU":
      return CONSERVATION_CATEGORIES.VU;
    case "NT":
      return CONSERVATION_CATEGORIES.NT;
    case "LC":
      return CONSERVATION_CATEGORIES.LC;
    case "DD":
      return CONSERVATION_CATEGORIES.DD;
    case "NE":
      return CONSERVATION_CATEGORIES.NE;
  }
}

function getUILabelEntry(key: string): Record<Locale, string> | null {
  if (Object.hasOwn(UI_LABELS, key)) {
    // eslint-disable-next-line security/detect-object-injection
    return UI_LABELS[key] ?? null;
  }

  return null;
}

export function getMonthLabel(
  month: Month,
  locale: Locale,
  format: "short" | "full" = "short"
): string {
  const localeDict =
    format === "short" ? MONTH_SHORT[locale] : MONTH_FULL[locale];

  return getMonthFromDictionary(localeDict, month);
}

export function getTagLabel(tag: TreeTag, locale: Locale): string {
  return getLocalizedText(getTagDefinition(tag).label, locale);
}

export function getConservationLabel(
  category: ConservationCategory,
  locale: Locale
): string {
  return getLocalizedText(getConservationDefinition(category).label, locale);
}

export function getUILabel(key: string, locale: Locale): string {
  const label = getUILabelEntry(key);
  if (!label) return key;
  return getLocalizedText(label, locale);
}

// Legacy IUCN_CATEGORIES format for backwards compatibility
export const IUCN_CATEGORIES: Record<
  string,
  { code: string; name: string; color: string; priority: number }
> = Object.fromEntries(
  Object.entries(CONSERVATION_CATEGORIES).map(([key, val]) => [
    key,
    {
      code: val.code,
      name: val.label.en,
      color: val.color,
      priority: val.priority,
    },
  ])
);

// Legacy IUCN labels function
const IUCN_UI: Record<string, Record<Locale, string>> = {
  conservationStatus: {
    en: "Conservation Status",
    es: "Estado de Conservación",
  },
  populationTrend: {
    en: "Population Trend",
    es: "Tendencia Poblacional",
  },
  assessedBy: {
    en: "Assessed by",
    es: "Evaluado por",
  },
  viewOn: {
    en: "View on",
    es: "Ver en",
  },
  decreasing: {
    en: "Decreasing",
    es: "En disminución",
  },
  stable: {
    en: "Stable",
    es: "Estable",
  },
  increasing: {
    en: "Increasing",
    es: "En aumento",
  },
  unknown: {
    en: "Unknown",
    es: "Desconocida",
  },
  iucnRedList: {
    en: "IUCN Red List",
    es: "Lista Roja de la UICN",
  },
};

export function getIUCNLabels(locale: string) {
  const loc = normalizeLocale(locale);

  return {
    conservationStatus: getLocalizedText(IUCN_UI.conservationStatus, loc),
    populationTrend: getLocalizedText(IUCN_UI.populationTrend, loc),
    assessedBy: getLocalizedText(IUCN_UI.assessedBy, loc),
    viewOn: getLocalizedText(IUCN_UI.viewOn, loc),
    iucnRedList: getLocalizedText(IUCN_UI.iucnRedList, loc),
    decreasing: getLocalizedText(IUCN_UI.decreasing, loc),
    stable: getLocalizedText(IUCN_UI.stable, loc),
    increasing: getLocalizedText(IUCN_UI.increasing, loc),
    unknown: getLocalizedText(IUCN_UI.unknown, loc),
    categories: Object.fromEntries(
      Object.entries(CONSERVATION_CATEGORIES).map(([key, val]) => [
        key,
        val.label[loc],
      ])
    ) as Record<string, string>,
  };
}

// Ordered months for calendar display
export const ORDERED_MONTHS: Month[] = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];
