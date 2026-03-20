/**
 * Static lesson data for the Tree Journal activity.
 *
 * This module is imported ONLY by the server-side page.tsx so that
 * the data is serialized in the RSC payload rather than shipped as
 * executable JavaScript in the client bundle.
 */
/* eslint-disable security/detect-object-injection -- locale/lang lookups are constrained to known bilingual keys. */

import { normalizeLocale, selectLocalizedValue } from "@/lib/i18n";

// ============================================================================
// Types (re-exported for the client component)
// ============================================================================

export interface SelectOption {
  value: string;
  emoji: string;
  label: string;
}

export interface BadgeData {
  id: string;
  emoji: string;
  name: string;
  requirement: number;
}

export interface TreeJournalLabels {
  title: string;
  subtitle: string;
  backToEducation: string;
  adoptTree: string;
  chooseTree: string;
  nickname: string;
  nicknamePlaceholder: string;
  location: string;
  locationPlaceholder: string;
  startJournal: string;
  myJournal: string;
  timeline: string;
  badges: string;
  newEntry: string;
  searchTrees: string;
  weather: string;
  leafStatus: string;
  flowers: string;
  fruits: string;
  wildlife: string;
  observation: string;
  observationPlaceholder: string;
  mood: string;
  height: string;
  circumference: string;
  saveEntry: string;
  cancel: string;
  adoptedOn: string;
  totalEntries: string;
  viewDetails: string;
  yes: string;
  no: string;
  prompt: string;
  unlocked: string;
  locked: string;
  progress: string;
  congratsNewBadge: string;
  resetJournal: string;
  confirmReset: string;
  noEntries: string;
  seasonalTip: string;
  scientificName: string;
  family: string;
  awesome: string;
  timelineMinEntries: string;
  mostRecent: string;
  dismiss: string;
  corruptedDataCleared: string;
}

export interface TreeJournalLessonData {
  labels: TreeJournalLabels;
  weatherOptions: SelectOption[];
  leafStatusOptions: SelectOption[];
  moodOptions: SelectOption[];
  wildlifeOptions: SelectOption[];
  badges: BadgeData[];
  prompts: string[];
}

// ============================================================================
// Raw bilingual option data
// ============================================================================

const WEATHER_RAW = [
  { value: "sunny", emoji: "☀️", en: "Sunny", es: "Soleado" },
  { value: "cloudy", emoji: "☁️", en: "Cloudy", es: "Nublado" },
  { value: "rainy", emoji: "🌧️", en: "Rainy", es: "Lluvioso" },
  { value: "stormy", emoji: "⛈️", en: "Stormy", es: "Tormentoso" },
  { value: "foggy", emoji: "🌫️", en: "Foggy", es: "Neblinoso" },
];

const LEAF_STATUS_RAW = [
  { value: "green", emoji: "🌿", en: "Full Green", es: "Verde Completo" },
  { value: "yellowing", emoji: "🍂", en: "Yellowing", es: "Amarillento" },
  { value: "bare", emoji: "🪵", en: "Bare", es: "Sin Hojas" },
  { value: "budding", emoji: "🌱", en: "Budding", es: "Brotando" },
  {
    value: "full",
    emoji: "🌳",
    en: "Full Foliage",
    es: "Follaje Completo",
  },
];

const MOOD_RAW = [
  { value: "excited", emoji: "🤩", en: "Excited", es: "Emocionado/a" },
  { value: "curious", emoji: "🤔", en: "Curious", es: "Curioso/a" },
  { value: "peaceful", emoji: "😌", en: "Peaceful", es: "Tranquilo/a" },
  { value: "amazed", emoji: "😲", en: "Amazed", es: "Asombrado/a" },
  { value: "thoughtful", emoji: "🧐", en: "Thoughtful", es: "Pensativo/a" },
];

const WILDLIFE_RAW = [
  { value: "birds", emoji: "🐦", en: "Birds", es: "Aves" },
  { value: "butterflies", emoji: "🦋", en: "Butterflies", es: "Mariposas" },
  { value: "insects", emoji: "🐛", en: "Insects", es: "Insectos" },
  { value: "squirrels", emoji: "🐿️", en: "Squirrels", es: "Ardillas" },
  { value: "monkeys", emoji: "🐒", en: "Monkeys", es: "Monos" },
  { value: "lizards", emoji: "🦎", en: "Lizards", es: "Lagartijas" },
  { value: "bees", emoji: "🐝", en: "Bees", es: "Abejas" },
  { value: "frogs", emoji: "🐸", en: "Frogs", es: "Ranas" },
];

const BADGES_RAW = [
  {
    id: "first-entry",
    emoji: "📝",
    en: "First Entry",
    es: "Primera Entrada",
    requirement: 1,
  },
  {
    id: "week-streak",
    emoji: "🔥",
    en: "Week Streak",
    es: "Racha Semanal",
    requirement: 7,
  },
  {
    id: "botanist",
    emoji: "🔬",
    en: "Junior Botanist",
    es: "Botánico Junior",
    requirement: 10,
  },
  {
    id: "wildlife-spotter",
    emoji: "🦜",
    en: "Wildlife Spotter",
    es: "Observador de Fauna",
    requirement: 5,
  },
  {
    id: "flower-finder",
    emoji: "🌸",
    en: "Flower Finder",
    es: "Buscador de Flores",
    requirement: 1,
  },
  {
    id: "fruit-tracker",
    emoji: "🍎",
    en: "Fruit Tracker",
    es: "Rastreador de Frutos",
    requirement: 1,
  },
  {
    id: "all-weather",
    emoji: "🌦️",
    en: "All Weather",
    es: "Todo Clima",
    requirement: 5,
  },
  {
    id: "nature-master",
    emoji: "🏆",
    en: "Nature Master",
    es: "Maestro de la Naturaleza",
    requirement: 25,
  },
];

// ============================================================================
// Data builder (called from server component)
// ============================================================================

function resolveOptions(
  raw: { value: string; emoji: string; en: string; es: string }[],
  lang: "en" | "es"
): SelectOption[] {
  return raw.map((item) => ({
    value: item.value,
    emoji: item.emoji,
    label: item[lang],
  }));
}

export function getTreeJournalLessonData(
  locale: string
): TreeJournalLessonData {
  const lang: "en" | "es" = normalizeLocale(locale);
  const t = (en: string, es: string): string =>
    selectLocalizedValue(en, es, lang);

  const labels: TreeJournalLabels = {
    title: t("Tree Journal 🌳", "Diario del Árbol 🌳"),
    subtitle: t(
      "Adopt a tree and watch it change throughout the year",
      "Adopta un árbol y observa cómo cambia durante el año"
    ),
    backToEducation: t("← Back to Education", "← Volver a Educación"),
    adoptTree: t("Adopt a Tree", "Adoptar un Árbol"),
    chooseTree: t("Choose your tree", "Elige tu árbol"),
    nickname: t("Give your tree a nickname", "Dale un nombre a tu árbol"),
    nicknamePlaceholder: t("E.g. The Great Oak", "Ej: El Gran Roble"),
    location: t("Where is your tree?", "¿Dónde está tu árbol?"),
    locationPlaceholder: t("E.g. School yard", "Ej: Patio de la escuela"),
    startJournal: t("🌱 Start Journal", "🌱 Comenzar Diario"),
    myJournal: t("My Journal", "Mi Diario"),
    timeline: t("Timeline", "Línea de Tiempo"),
    badges: t("Badges", "Insignias"),
    newEntry: t("📝 New Entry", "📝 Nueva Entrada"),
    searchTrees: t("Search trees...", "Buscar árboles..."),
    weather: t("What's the weather like?", "¿Cómo está el clima?"),
    leafStatus: t("Leaf Status", "Estado de las hojas"),
    flowers: t("Any flowers?", "¿Hay flores?"),
    fruits: t("Any fruits?", "¿Hay frutos?"),
    wildlife: t("What wildlife did you see?", "¿Qué animales viste?"),
    observation: t("Your observation", "Tu observación"),
    observationPlaceholder: t(
      "Write what you observed today...",
      "Escribe lo que observaste hoy..."
    ),
    mood: t("How do you feel?", "¿Cómo te sientes?"),
    height: t("Estimated height (meters)", "Altura estimada (metros)"),
    circumference: t(
      "Trunk circumference (cm)",
      "Circunferencia del tronco (cm)"
    ),
    saveEntry: t("💾 Save Entry", "💾 Guardar Entrada"),
    cancel: t("Cancel", "Cancelar"),
    adoptedOn: t("Adopted on", "Adoptado el"),
    totalEntries: t("total entries", "entradas totales"),
    viewDetails: t("View in Atlas", "Ver en el Atlas"),
    yes: t("Yes", "Sí"),
    no: t("No", "No"),
    prompt: t("💡 Today's prompt", "💡 Sugerencia del día"),
    unlocked: t("Unlocked", "Desbloqueada"),
    locked: t("Locked", "Bloqueada"),
    progress: t("Progress", "Progreso"),
    congratsNewBadge: t("New badge unlocked!", "¡Nueva insignia desbloqueada!"),
    resetJournal: t("Reset Journal", "Reiniciar Diario"),
    confirmReset: t(
      "Are you sure? This will delete all your data.",
      "¿Estás seguro? Esto borrará todos tus datos."
    ),
    noEntries: t(
      "No entries yet. Make your first observation!",
      "Aún no tienes entradas. ¡Haz tu primera observación!"
    ),
    seasonalTip: t("Seasonal tip", "Consejo estacional"),
    scientificName: t("Scientific name", "Nombre científico"),
    family: t("Family", "Familia"),
    awesome: t("Awesome!", "¡Genial!"),
    timelineMinEntries: t(
      "You need at least 2 entries to see the timeline",
      "Necesitas al menos 2 entradas para ver la línea de tiempo"
    ),
    mostRecent: t("↑ Most recent", "↑ Más reciente"),
    dismiss: t("Dismiss", "Cerrar"),
    corruptedDataCleared: t(
      "Corrupted data was detected and cleared",
      "Se detectaron datos corruptos y fueron eliminados"
    ),
  };

  const prompts = [
    t(
      "Draw your tree's leaves. What shape are they?",
      "Dibuja las hojas de tu árbol. ¿Qué forma tienen?"
    ),
    t(
      "Count how many main branches your tree has.",
      "Cuenta cuántas ramas principales tiene tu árbol."
    ),
    t(
      "Can you find any insects living on your tree?",
      "¿Puedes encontrar insectos viviendo en tu árbol?"
    ),
    t(
      "Measure your tree's shadow at noon.",
      "Mide la sombra de tu árbol al mediodía."
    ),
    t(
      "Describe the sound the wind makes in the leaves.",
      "Describe el sonido que hace el viento en las hojas."
    ),
    t(
      "What color is the bark? Is it smooth or rough?",
      "¿De qué color es la corteza? ¿Es lisa o rugosa?"
    ),
    t(
      "Look for signs of animal life (nests, holes, tracks).",
      "Busca señales de vida animal (nidos, agujeros, huellas)."
    ),
    t(
      "Does your tree have any special smell?",
      "¿Tu árbol tiene algún aroma especial?"
    ),
    t(
      "Compare your tree with a nearby one. How are they different?",
      "Compara tu árbol con uno cercano. ¿En qué se diferencian?"
    ),
    t(
      "How do you think your tree will look next season?",
      "¿Cómo crees que se verá tu árbol en la próxima estación?"
    ),
  ];

  return {
    labels,
    weatherOptions: resolveOptions(WEATHER_RAW, lang),
    leafStatusOptions: resolveOptions(LEAF_STATUS_RAW, lang),
    moodOptions: resolveOptions(MOOD_RAW, lang),
    wildlifeOptions: resolveOptions(WILDLIFE_RAW, lang),
    badges: BADGES_RAW.map((b) => ({
      id: b.id,
      emoji: b.emoji,
      name: b[lang],
      requirement: b.requirement,
    })),
    prompts,
  };
}
