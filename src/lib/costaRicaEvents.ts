// Costa Rica events and holidays relevant to trees and nature
// These are cultural and environmental events that connect to the seasonal calendar

export interface CostaRicaEvent {
  id: string;
  month: string;
  day?: number; // Optional - some events span the whole month
  endDay?: number; // For multi-day events
  type: "holiday" | "environmental" | "cultural" | "festival" | "agricultural";
  relatedTrees?: string[]; // Slugs of related trees
  icon?: string;
}

export interface LocalizedEventInfo {
  name: string;
  description: string;
  tip?: string;
}

// Event definitions with month keys matching MONTHS array
export const COSTA_RICA_EVENTS: CostaRicaEvent[] = [
  // January
  {
    id: "new-year",
    month: "january",
    day: 1,
    type: "holiday",
    icon: "🎆",
  },
  {
    id: "dry-season-start",
    month: "january",
    type: "environmental",
    icon: "☀️",
    relatedTrees: ["guayacan", "cortez-amarillo", "roble-sabana"],
  },

  // February
  {
    id: "national-tree-day",
    month: "february",
    day: 15,
    type: "environmental",
    icon: "🌳",
    relatedTrees: ["guanacaste"],
  },
  {
    id: "peak-flowering",
    month: "february",
    type: "environmental",
    icon: "🌸",
    relatedTrees: ["cortez-amarillo", "roble-sabana", "poró"],
  },

  // March
  {
    id: "dry-season-peak",
    month: "march",
    type: "environmental",
    icon: "🔥",
  },
  {
    id: "semana-santa",
    month: "march",
    day: 15,
    endDay: 31,
    type: "holiday",
    icon: "⛪",
  },
  {
    id: "mango-season",
    month: "march",
    type: "agricultural",
    icon: "🥭",
    relatedTrees: ["mango"],
  },

  // April
  {
    id: "juan-santamaria",
    month: "april",
    day: 11,
    type: "holiday",
    icon: "🇨🇷",
  },
  {
    id: "earth-day",
    month: "april",
    day: 22,
    type: "environmental",
    icon: "🌍",
  },
  {
    id: "jacaranda-bloom",
    month: "april",
    type: "environmental",
    icon: "💜",
    relatedTrees: ["jacaranda"],
  },

  // May
  {
    id: "labor-day",
    month: "may",
    day: 1,
    type: "holiday",
    icon: "👷",
  },
  {
    id: "green-season-start",
    month: "may",
    type: "environmental",
    icon: "🌧️",
  },
  {
    id: "reforestation-month",
    month: "may",
    type: "environmental",
    icon: "🌱",
  },

  // June
  {
    id: "environment-day",
    month: "june",
    day: 5,
    type: "environmental",
    icon: "🌿",
  },
  {
    id: "fruiting-season-start",
    month: "june",
    type: "environmental",
    icon: "🍇",
  },

  // July
  {
    id: "virgin-sea",
    month: "july",
    day: 16,
    type: "cultural",
    icon: "🌊",
  },
  {
    id: "annexation-day",
    month: "july",
    day: 25,
    type: "holiday",
    icon: "🇨🇷",
  },
  {
    id: "cas-season",
    month: "july",
    type: "agricultural",
    icon: "🍋",
    relatedTrees: ["cas"],
  },

  // August
  {
    id: "mother-day",
    month: "august",
    day: 15,
    type: "holiday",
    icon: "👩",
  },
  {
    id: "cacao-harvest",
    month: "august",
    type: "agricultural",
    icon: "🍫",
    relatedTrees: ["cacao"],
  },
  {
    id: "peak-green-season",
    month: "august",
    type: "environmental",
    icon: "🌴",
  },

  // September
  {
    id: "independence-day",
    month: "september",
    day: 15,
    type: "holiday",
    icon: "🇨🇷",
  },
  {
    id: "children-day",
    month: "september",
    day: 9,
    type: "cultural",
    icon: "👶",
  },
  {
    id: "migration-season",
    month: "september",
    type: "environmental",
    icon: "🦅",
  },

  // October
  {
    id: "cultures-day",
    month: "october",
    day: 12,
    type: "cultural",
    icon: "🎭",
  },
  {
    id: "rainforest-peak",
    month: "october",
    type: "environmental",
    icon: "🌲",
  },
  {
    id: "jocote-season",
    month: "october",
    type: "agricultural",
    icon: "🔴",
    relatedTrees: ["jocote"],
  },

  // November
  {
    id: "all-souls",
    month: "november",
    day: 2,
    type: "cultural",
    icon: "🕯️",
  },
  {
    id: "transition-season",
    month: "november",
    type: "environmental",
    icon: "🍂",
  },

  // December
  {
    id: "christmas",
    month: "december",
    day: 25,
    type: "holiday",
    icon: "🎄",
  },
  {
    id: "malinche-bloom",
    month: "december",
    type: "environmental",
    icon: "🔴",
    relatedTrees: ["malinche"],
  },
  {
    id: "coffee-harvest",
    month: "december",
    type: "agricultural",
    icon: "☕",
    relatedTrees: ["cafe"],
  },
  {
    id: "dry-season-begins",
    month: "december",
    type: "environmental",
    icon: "☀️",
  },
];

// Localized event information
export const EVENT_TRANSLATIONS: Record<
  string,
  { en: LocalizedEventInfo; es: LocalizedEventInfo }
> = {
  "new-year": {
    en: {
      name: "New Year's Day",
      description: "Start of a new year and the dry season",
      tip: "Perfect time to see deciduous trees without leaves",
    },
    es: {
      name: "Año Nuevo",
      description: "Inicio de un nuevo año y la estación seca",
      tip: "Momento perfecto para ver árboles de hoja caduca sin hojas",
    },
  },
  "dry-season-start": {
    en: {
      name: "Dry Season Begins",
      description:
        "The 'verano' begins, triggering spectacular tree blooms across the country",
      tip: "Watch for Guayacán and Corteza Amarilla starting to bloom",
    },
    es: {
      name: "Comienza la Estación Seca",
      description:
        "El 'verano' comienza, desencadenando espectaculares floraciones",
      tip: "Observe el Guayacán y la Corteza Amarilla comenzando a florecer",
    },
  },
  "national-tree-day": {
    en: {
      name: "National Tree Day",
      description:
        "Costa Rica celebrates its National Tree - the Guanacaste (Enterolobium cyclocarpum)",
      tip: "Visit a Guanacaste tree today and learn about its cultural significance!",
    },
    es: {
      name: "Día del Árbol Nacional",
      description:
        "Costa Rica celebra su Árbol Nacional - el Guanacaste (Enterolobium cyclocarpum)",
      tip: "¡Visita un árbol de Guanacaste hoy y aprende sobre su significado cultural!",
    },
  },
  "peak-flowering": {
    en: {
      name: "Peak Flowering Season",
      description:
        "Many deciduous trees are in full bloom, painting landscapes yellow, pink and orange",
      tip: "Best month for tree photography! Look for Corteza Amarilla and Roble de Sabana",
    },
    es: {
      name: "Temporada Alta de Floración",
      description:
        "Muchos árboles caducos están en plena floración, pintando paisajes de amarillo, rosa y naranja",
      tip: "¡Mejor mes para fotografía de árboles! Busca Corteza Amarilla y Roble de Sabana",
    },
  },
  "dry-season-peak": {
    en: {
      name: "Dry Season Peak",
      description:
        "Hottest and driest month - many trees shed leaves to conserve water",
      tip: "Many flowering trees are still blooming, creating stunning displays",
    },
    es: {
      name: "Pico de Estación Seca",
      description:
        "Mes más caliente y seco - muchos árboles pierden hojas para conservar agua",
      tip: "Muchos árboles florecidos aún en su esplendor",
    },
  },
  "semana-santa": {
    en: {
      name: "Holy Week (Semana Santa)",
      description:
        "Major holiday period when many Costa Ricans travel to see nature",
      tip: "Visit Guanacaste to see spectacular tree blooms at their peak",
    },
    es: {
      name: "Semana Santa",
      description:
        "Período festivo importante cuando muchos costarricenses viajan a ver la naturaleza",
      tip: "Visita Guanacaste para ver espectaculares floraciones en su apogeo",
    },
  },
  "mango-season": {
    en: {
      name: "Mango Season Begins",
      description: "Wild and cultivated mango trees start producing fruit",
      tip: "Look for fruiting mango trees and enjoy fresh Costa Rican mangoes!",
    },
    es: {
      name: "Comienza Temporada de Mango",
      description:
        "Árboles de mango silvestres y cultivados comienzan a producir fruta",
      tip: "¡Busca árboles de mango fructificando y disfruta mangos frescos!",
    },
  },
  "juan-santamaria": {
    en: {
      name: "Juan Santamaría Day",
      description: "National hero day - celebrating Costa Rican heritage",
      tip: "A great day to appreciate Costa Rica's natural heritage too",
    },
    es: {
      name: "Día de Juan Santamaría",
      description:
        "Día del héroe nacional - celebrando la herencia costarricense",
      tip: "Un gran día para apreciar también la herencia natural de Costa Rica",
    },
  },
  "earth-day": {
    en: {
      name: "Earth Day",
      description:
        "Global celebration of environmental protection - perfect for tree appreciation",
      tip: "Plant a native tree or visit a conservation area today!",
    },
    es: {
      name: "Día de la Tierra",
      description:
        "Celebración global de la protección ambiental - perfecto para apreciar árboles",
      tip: "¡Planta un árbol nativo o visita un área de conservación hoy!",
    },
  },
  "jacaranda-bloom": {
    en: {
      name: "Jacaranda Blooming",
      description:
        "Beautiful purple Jacaranda trees bloom across the Central Valley",
      tip: "Visit San José parks to see stunning purple blooms",
    },
    es: {
      name: "Floración de Jacaranda",
      description:
        "Hermosos árboles de Jacaranda púrpura florecen en el Valle Central",
      tip: "Visita parques de San José para ver impresionantes flores púrpuras",
    },
  },
  "labor-day": {
    en: {
      name: "Labor Day",
      description: "Workers' Day holiday in Costa Rica",
      tip: "Many parks remain open - great day for nature walks",
    },
    es: {
      name: "Día del Trabajo",
      description: "Feriado del Día de los Trabajadores en Costa Rica",
      tip: "Muchos parques permanecen abiertos - gran día para caminatas",
    },
  },
  "green-season-start": {
    en: {
      name: "Green Season Begins",
      description: "Rainy season starts, bringing lush greenery to all forests",
      tip: "Watch trees transform as new leaves emerge with the rains",
    },
    es: {
      name: "Comienza la Estación Verde",
      description:
        "Comienza la estación lluviosa, trayendo verdor exuberante a los bosques",
      tip: "Observe los árboles transformarse con nuevas hojas con las lluvias",
    },
  },
  "reforestation-month": {
    en: {
      name: "Reforestation Month",
      description: "Many reforestation programs are active - plant a tree!",
      tip: "Join a local reforestation program or plant a native tree at home",
    },
    es: {
      name: "Mes de la Reforestación",
      description:
        "Muchos programas de reforestación están activos - ¡planta un árbol!",
      tip: "Únete a un programa local de reforestación o planta un árbol nativo en casa",
    },
  },
  "environment-day": {
    en: {
      name: "World Environment Day",
      description:
        "UN day celebrating environmental action - Costa Rica leads by example",
      tip: "Learn about Costa Rica's commitment to carbon neutrality",
    },
    es: {
      name: "Día Mundial del Medio Ambiente",
      description:
        "Día de la ONU celebrando acción ambiental - Costa Rica da el ejemplo",
      tip: "Aprende sobre el compromiso de Costa Rica con la neutralidad de carbono",
    },
  },
  "fruiting-season-start": {
    en: {
      name: "Fruiting Season Begins",
      description:
        "Many tree species begin producing fruit as rains nourish the forests",
      tip: "Wildlife viewing improves as animals seek fruiting trees",
    },
    es: {
      name: "Comienza Temporada de Fructificación",
      description:
        "Muchas especies de árboles comienzan a producir frutos con las lluvias",
      tip: "Mejora la observación de fauna mientras los animales buscan árboles fructificando",
    },
  },
  "virgin-sea": {
    en: {
      name: "Virgen del Mar Festival",
      description: "Celebration in Puntarenas with ocean and nature connection",
      tip: "Coastal trees like almendro de playa are beautiful this time of year",
    },
    es: {
      name: "Festival Virgen del Mar",
      description: "Celebración en Puntarenas con conexión oceánica y natural",
      tip: "Árboles costeros como el almendro de playa están hermosos en esta época",
    },
  },
  "annexation-day": {
    en: {
      name: "Guanacaste Day",
      description:
        "Celebrating Guanacaste's annexation to Costa Rica - named after the national tree!",
      tip: "Perfect day to learn about the Guanacaste tree and its cultural importance",
    },
    es: {
      name: "Día de Guanacaste",
      description:
        "Celebrando la anexión de Guanacaste a Costa Rica - ¡nombrado por el árbol nacional!",
      tip: "Día perfecto para aprender sobre el árbol de Guanacaste y su importancia cultural",
    },
  },
  "cas-season": {
    en: {
      name: "Cas Fruit Season",
      description:
        "The beloved cas fruit (Psidium friedrichsthalianum) is in season",
      tip: "Try fresh cas juice - a uniquely Costa Rican flavor!",
    },
    es: {
      name: "Temporada de Cas",
      description:
        "El querido fruto del cas (Psidium friedrichsthalianum) está en temporada",
      tip: "¡Prueba jugo de cas fresco - un sabor únicamente costarricense!",
    },
  },
  "mother-day": {
    en: {
      name: "Mother's Day (Costa Rica)",
      description: "Costa Rica celebrates mothers on August 15",
      tip: "Give a native tree seedling as a meaningful gift",
    },
    es: {
      name: "Día de la Madre",
      description: "Costa Rica celebra a las madres el 15 de agosto",
      tip: "Regala una plántula de árbol nativo como regalo significativo",
    },
  },
  "cacao-harvest": {
    en: {
      name: "Cacao Harvest Season",
      description: "Costa Rica's cacao trees are producing pods for harvest",
      tip: "Visit a cacao farm to learn about chocolate from tree to bar",
    },
    es: {
      name: "Temporada de Cosecha de Cacao",
      description:
        "Los árboles de cacao de Costa Rica producen mazorcas para cosechar",
      tip: "Visita una finca de cacao para aprender sobre chocolate del árbol a la barra",
    },
  },
  "peak-green-season": {
    en: {
      name: "Peak Green Season",
      description:
        "Forests are at their lushest - maximum chlorophyll activity",
      tip: "Rainforests are most vibrant now, despite afternoon showers",
    },
    es: {
      name: "Pico de Estación Verde",
      description:
        "Los bosques están más exuberantes - máxima actividad de clorofila",
      tip: "Los bosques lluviosos están más vibrantes, a pesar de lluvias vespertinas",
    },
  },
  "independence-day": {
    en: {
      name: "Independence Day",
      description: "Costa Rica's Independence Day - national celebration",
      tip: "Appreciate the national tree (Guanacaste) as part of the celebration",
    },
    es: {
      name: "Día de la Independencia",
      description:
        "Día de la Independencia de Costa Rica - celebración nacional",
      tip: "Aprecia el árbol nacional (Guanacaste) como parte de la celebración",
    },
  },
  "children-day": {
    en: {
      name: "Children's Day",
      description: "Celebrating children - great day for nature education",
      tip: "Take kids on a tree identification walk in a local park",
    },
    es: {
      name: "Día del Niño",
      description: "Celebrando a los niños - gran día para educación ambiental",
      tip: "Lleva a los niños a una caminata de identificación de árboles",
    },
  },
  "migration-season": {
    en: {
      name: "Bird Migration Season",
      description: "Migratory birds arrive, many feeding on fruiting trees",
      tip: "Watch fruiting trees for migrant bird activity",
    },
    es: {
      name: "Temporada de Migración de Aves",
      description:
        "Llegan aves migratorias, muchas alimentándose en árboles fructificando",
      tip: "Observa árboles fructificando para ver actividad de aves migratorias",
    },
  },
  "cultures-day": {
    en: {
      name: "Day of Cultures",
      description: "Celebrating cultural diversity and indigenous heritage",
      tip: "Learn about traditional uses of native trees by indigenous peoples",
    },
    es: {
      name: "Día de las Culturas",
      description: "Celebrando la diversidad cultural y herencia indígena",
      tip: "Aprende sobre usos tradicionales de árboles nativos por pueblos indígenas",
    },
  },
  "rainforest-peak": {
    en: {
      name: "Rainforest at Its Best",
      description: "October brings peak forest activity and fruiting",
      tip: "Great time for forest walks - fruits attract abundant wildlife",
    },
    es: {
      name: "Bosque Lluvioso en su Mejor Momento",
      description: "Octubre trae actividad forestal y fructificación máxima",
      tip: "Gran momento para caminatas - los frutos atraen abundante fauna",
    },
  },
  "jocote-season": {
    en: {
      name: "Jocote Season",
      description: "The popular jocote fruit is ripening on trees",
      tip: "Look for jocote vendors and try this unique Costa Rican fruit",
    },
    es: {
      name: "Temporada de Jocote",
      description: "El popular fruto del jocote está madurando en los árboles",
      tip: "Busca vendedores de jocote y prueba esta fruta única costarricense",
    },
  },
  "all-souls": {
    en: {
      name: "All Souls' Day",
      description: "Day to honor ancestors with traditional cemetery visits",
      tip: "Many cemeteries feature beautiful old trees worth observing",
    },
    es: {
      name: "Día de los Difuntos",
      description:
        "Día para honrar a los ancestros con visitas tradicionales al cementerio",
      tip: "Muchos cementerios tienen hermosos árboles antiguos que observar",
    },
  },
  "transition-season": {
    en: {
      name: "Season Transition",
      description: "Rains decreasing as dry season approaches",
      tip: "Trees begin preparing for the dry season flowering period",
    },
    es: {
      name: "Transición de Estación",
      description: "Las lluvias disminuyen mientras la estación seca se acerca",
      tip: "Los árboles comienzan a prepararse para el período de floración seca",
    },
  },
  christmas: {
    en: {
      name: "Christmas",
      description: "Holiday season with traditional Costa Rican celebrations",
      tip: "The Malinche tree blooms red during Christmas - nature's decoration!",
    },
    es: {
      name: "Navidad",
      description:
        "Temporada festiva con celebraciones tradicionales costarricenses",
      tip: "¡El árbol de Malinche florece rojo durante Navidad - decoración natural!",
    },
  },
  "malinche-bloom": {
    en: {
      name: "Malinche Blooming",
      description: "The flame tree (Malinche) produces spectacular red flowers",
      tip: "Look for red-flowering trees in urban and rural areas",
    },
    es: {
      name: "Floración del Malinche",
      description:
        "El árbol de fuego (Malinche) produce espectaculares flores rojas",
      tip: "Busca árboles con flores rojas en áreas urbanas y rurales",
    },
  },
  "coffee-harvest": {
    en: {
      name: "Coffee Harvest",
      description: "Costa Rica's famous coffee berries are being picked",
      tip: "Visit a coffee plantation to see the harvest process",
    },
    es: {
      name: "Cosecha de Café",
      description:
        "Los famosos granos de café de Costa Rica se están cosechando",
      tip: "Visita una plantación de café para ver el proceso de cosecha",
    },
  },
  "dry-season-begins": {
    en: {
      name: "Dry Season Begins",
      description: "The 'verano' returns, trees start their flowering cycle",
      tip: "Watch for early bloomers preparing their spectacular displays",
    },
    es: {
      name: "Comienza la Estación Seca",
      description:
        "El 'verano' regresa, los árboles inician su ciclo de floración",
      tip: "Observe los primeros en florecer preparando sus espectaculares exhibiciones",
    },
  },
};

// Helper function to get events for a specific month
export function getEventsForMonth(month: string): CostaRicaEvent[] {
  return COSTA_RICA_EVENTS.filter((event) => event.month === month);
}

// Helper function to get event translation
export function getEventTranslation(
  eventId: string,
  locale: string
): LocalizedEventInfo | undefined {
  const eventTranslations = EVENT_TRANSLATIONS[eventId];
  if (!eventTranslations) return undefined;
  return locale === "es" ? eventTranslations.es : eventTranslations.en;
}

// Get events happening on a specific date
export function getEventsForDate(month: string, day: number): CostaRicaEvent[] {
  return COSTA_RICA_EVENTS.filter((event) => {
    if (event.month !== month) return false;
    if (!event.day) return false; // Month-long events don't match specific dates
    if (event.endDay) {
      return day >= event.day && day <= event.endDay;
    }
    return event.day === day;
  });
}

// Get all events for a month (including month-long events)
export function getAllEventsForMonth(month: string): CostaRicaEvent[] {
  return COSTA_RICA_EVENTS.filter((event) => event.month === month);
}

// Event type colors for UI
export const EVENT_TYPE_COLORS: Record<
  CostaRicaEvent["type"],
  { bg: string; text: string; border: string }
> = {
  holiday: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-300 dark:border-blue-700",
  },
  environmental: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-300",
    border: "border-green-300 dark:border-green-700",
  },
  cultural: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-300 dark:border-purple-700",
  },
  festival: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-300 dark:border-amber-700",
  },
  agricultural: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-300",
    border: "border-yellow-300 dark:border-yellow-700",
  },
};
