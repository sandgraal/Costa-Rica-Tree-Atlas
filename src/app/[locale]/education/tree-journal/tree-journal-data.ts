/**
 * Static lesson data for the Tree Journal activity.
 *
 * This module is imported ONLY by the server-side page.tsx so that
 * the data is serialized in the RSC payload rather than shipped as
 * executable JavaScript in the client bundle.
 */

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
  const isEs = locale === "es";
  const lang: "en" | "es" = isEs ? "es" : "en";

  const labels: TreeJournalLabels = {
    title: isEs ? "Diario del Árbol 🌳" : "Tree Journal 🌳",
    subtitle: isEs
      ? "Adopta un árbol y observa cómo cambia durante el año"
      : "Adopt a tree and watch it change throughout the year",
    backToEducation: isEs ? "← Volver a Educación" : "← Back to Education",
    adoptTree: isEs ? "Adoptar un Árbol" : "Adopt a Tree",
    chooseTree: isEs ? "Elige tu árbol" : "Choose your tree",
    nickname: isEs ? "Dale un nombre a tu árbol" : "Give your tree a nickname",
    nicknamePlaceholder: isEs ? "Ej: El Gran Roble" : "E.g. The Great Oak",
    location: isEs ? "¿Dónde está tu árbol?" : "Where is your tree?",
    locationPlaceholder: isEs ? "Ej: Patio de la escuela" : "E.g. School yard",
    startJournal: isEs ? "🌱 Comenzar Diario" : "🌱 Start Journal",
    myJournal: isEs ? "Mi Diario" : "My Journal",
    timeline: isEs ? "Línea de Tiempo" : "Timeline",
    badges: isEs ? "Insignias" : "Badges",
    newEntry: isEs ? "📝 Nueva Entrada" : "📝 New Entry",
    searchTrees: isEs ? "Buscar árboles..." : "Search trees...",
    weather: isEs ? "¿Cómo está el clima?" : "What's the weather like?",
    leafStatus: isEs ? "Estado de las hojas" : "Leaf Status",
    flowers: isEs ? "¿Hay flores?" : "Any flowers?",
    fruits: isEs ? "¿Hay frutos?" : "Any fruits?",
    wildlife: isEs ? "¿Qué animales viste?" : "What wildlife did you see?",
    observation: isEs ? "Tu observación" : "Your observation",
    observationPlaceholder: isEs
      ? "Escribe lo que observaste hoy..."
      : "Write what you observed today...",
    mood: isEs ? "¿Cómo te sientes?" : "How do you feel?",
    height: isEs ? "Altura estimada (metros)" : "Estimated height (meters)",
    circumference: isEs
      ? "Circunferencia del tronco (cm)"
      : "Trunk circumference (cm)",
    saveEntry: isEs ? "💾 Guardar Entrada" : "💾 Save Entry",
    cancel: isEs ? "Cancelar" : "Cancel",
    adoptedOn: isEs ? "Adoptado el" : "Adopted on",
    totalEntries: isEs ? "entradas totales" : "total entries",
    viewDetails: isEs ? "Ver en el Atlas" : "View in Atlas",
    yes: isEs ? "Sí" : "Yes",
    no: isEs ? "No" : "No",
    prompt: isEs ? "💡 Sugerencia del día" : "💡 Today's prompt",
    unlocked: isEs ? "Desbloqueada" : "Unlocked",
    locked: isEs ? "Bloqueada" : "Locked",
    progress: isEs ? "Progreso" : "Progress",
    congratsNewBadge: isEs
      ? "¡Nueva insignia desbloqueada!"
      : "New badge unlocked!",
    resetJournal: isEs ? "Reiniciar Diario" : "Reset Journal",
    confirmReset: isEs
      ? "¿Estás seguro? Esto borrará todos tus datos."
      : "Are you sure? This will delete all your data.",
    noEntries: isEs
      ? "Aún no tienes entradas. ¡Haz tu primera observación!"
      : "No entries yet. Make your first observation!",
    seasonalTip: isEs ? "Consejo estacional" : "Seasonal tip",
    scientificName: isEs ? "Nombre científico" : "Scientific name",
    family: isEs ? "Familia" : "Family",
    awesome: isEs ? "¡Genial!" : "Awesome!",
    timelineMinEntries: isEs
      ? "Necesitas al menos 2 entradas para ver la línea de tiempo"
      : "You need at least 2 entries to see the timeline",
    mostRecent: isEs ? "↑ Más reciente" : "↑ Most recent",
    dismiss: isEs ? "Cerrar" : "Dismiss",
    corruptedDataCleared: isEs
      ? "Se detectaron datos corruptos y fueron eliminados"
      : "Corrupted data was detected and cleared",
  };

  const prompts = isEs
    ? [
        "Dibuja las hojas de tu árbol. ¿Qué forma tienen?",
        "Cuenta cuántas ramas principales tiene tu árbol.",
        "¿Puedes encontrar insectos viviendo en tu árbol?",
        "Mide la sombra de tu árbol al mediodía.",
        "Describe el sonido que hace el viento en las hojas.",
        "¿De qué color es la corteza? ¿Es lisa o rugosa?",
        "Busca señales de vida animal (nidos, agujeros, huellas).",
        "¿Tu árbol tiene algún aroma especial?",
        "Compara tu árbol con uno cercano. ¿En qué se diferencian?",
        "¿Cómo crees que se verá tu árbol en la próxima estación?",
      ]
    : [
        "Draw your tree's leaves. What shape are they?",
        "Count how many main branches your tree has.",
        "Can you find any insects living on your tree?",
        "Measure your tree's shadow at noon.",
        "Describe the sound the wind makes in the leaves.",
        "What color is the bark? Is it smooth or rough?",
        "Look for signs of animal life (nests, holes, tracks).",
        "Does your tree have any special smell?",
        "Compare your tree with a nearby one. How are they different?",
        "How do you think your tree will look next season?",
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
