// Costa Rica events and holidays - comprehensive calendar for planning
// Includes national holidays, environmental events, festivals, tourism seasons, and more

import { normalizeLocale } from "@/lib/i18n";

export interface CostaRicaEvent {
  id: string;
  month: string;
  day?: number; // Optional - some events span the whole month
  endDay?: number; // For multi-day events
  type:
    | "holiday"
    | "environmental"
    | "cultural"
    | "festival"
    | "agricultural"
    | "tourism"
    | "school"
    | "weather";
  relatedTrees?: string[]; // Slugs of related trees
  icon?: string;
  isOfficial?: boolean; // Official national holiday (banks/govt closed)
}

export interface LocalizedEventInfo {
  name: string;
  description: string;
  tip?: string;
}

// Event definitions with month keys matching MONTHS array
export const COSTA_RICA_EVENTS: CostaRicaEvent[] = [
  // ============ JANUARY ============
  {
    id: "new-year",
    month: "january",
    day: 1,
    type: "holiday",
    icon: "🎆",
    isOfficial: true,
  },
  {
    id: "dry-season-start",
    month: "january",
    type: "environmental",
    icon: "☀️",
    relatedTrees: ["guayacan", "cortez-amarillo", "roble-sabana"],
  },
  {
    id: "high-season-peak",
    month: "january",
    type: "tourism",
    icon: "✈️",
  },
  {
    id: "school-vacation-jan",
    month: "january",
    day: 1,
    endDay: 31,
    type: "school",
    icon: "🏖️",
  },
  {
    id: "whale-watching-south",
    month: "january",
    type: "environmental",
    icon: "🐋",
  },
  {
    id: "palmares-festival",
    month: "january",
    day: 10,
    endDay: 22,
    type: "festival",
    icon: "🎪",
  },

  // ============ FEBRUARY ============
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
  {
    id: "school-year-start",
    month: "february",
    day: 8,
    type: "school",
    icon: "📚",
  },
  {
    id: "valentines-day",
    month: "february",
    day: 14,
    type: "cultural",
    icon: "❤️",
  },
  {
    id: "envision-festival",
    month: "february",
    day: 20,
    endDay: 25,
    type: "festival",
    icon: "🎶",
  },
  {
    id: "best-beach-weather",
    month: "february",
    type: "weather",
    icon: "🏝️",
  },

  // ============ MARCH ============
  {
    id: "dry-season-peak",
    month: "march",
    type: "weather",
    icon: "🔥",
  },
  {
    id: "semana-santa",
    month: "march",
    day: 24,
    endDay: 31,
    type: "holiday",
    icon: "⛪",
    isOfficial: true,
  },
  {
    id: "mango-season",
    month: "march",
    type: "agricultural",
    icon: "🥭",
    relatedTrees: ["mango"],
  },
  {
    id: "international-womens-day",
    month: "march",
    day: 8,
    type: "cultural",
    icon: "👩",
  },
  {
    id: "sea-turtle-nesting-caribbean",
    month: "march",
    type: "environmental",
    icon: "🐢",
  },
  {
    id: "leatherback-turtle-peak",
    month: "march",
    day: 1,
    endDay: 31,
    type: "environmental",
    icon: "🐢",
  },

  // ============ APRIL ============
  {
    id: "juan-santamaria",
    month: "april",
    day: 11,
    type: "holiday",
    icon: "🇨🇷",
    isOfficial: true,
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
  {
    id: "easter-tourism",
    month: "april",
    day: 1,
    endDay: 7,
    type: "tourism",
    icon: "🐰",
  },
  {
    id: "transition-to-green",
    month: "april",
    type: "weather",
    icon: "🌦️",
  },
  {
    id: "oxcart-day",
    month: "april",
    day: 15,
    type: "cultural",
    icon: "🐂",
  },

  // ============ MAY ============
  {
    id: "labor-day",
    month: "may",
    day: 1,
    type: "holiday",
    icon: "👷",
    isOfficial: true,
  },
  {
    id: "green-season-start",
    month: "may",
    type: "weather",
    icon: "🌧️",
  },
  {
    id: "reforestation-month",
    month: "may",
    type: "environmental",
    icon: "🌱",
  },
  {
    id: "low-season-begins",
    month: "may",
    type: "tourism",
    icon: "💰",
  },
  {
    id: "green-season-deals",
    month: "may",
    type: "tourism",
    icon: "🏨",
  },
  {
    id: "mother-nature-month",
    month: "may",
    type: "environmental",
    icon: "🌿",
  },

  // ============ JUNE ============
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
  {
    id: "fathers-day-cr",
    month: "june",
    day: 15,
    type: "cultural",
    icon: "👨",
  },
  {
    id: "ocean-day",
    month: "june",
    day: 8,
    type: "environmental",
    icon: "🌊",
  },
  {
    id: "veranillo",
    month: "june",
    day: 24,
    endDay: 30,
    type: "weather",
    icon: "☀️",
  },
  {
    id: "school-mid-year-break",
    month: "june",
    day: 28,
    endDay: 30,
    type: "school",
    icon: "🎒",
  },

  // ============ JULY ============
  {
    id: "virgin-sea",
    month: "july",
    day: 16,
    type: "festival",
    icon: "🌊",
  },
  {
    id: "annexation-day",
    month: "july",
    day: 25,
    type: "holiday",
    icon: "🇨🇷",
    isOfficial: true,
  },
  {
    id: "cas-season",
    month: "july",
    type: "agricultural",
    icon: "🍋",
    relatedTrees: ["cas"],
  },
  {
    id: "school-vacation-july",
    month: "july",
    day: 1,
    endDay: 14,
    type: "school",
    icon: "📖",
  },
  {
    id: "liberia-festival",
    month: "july",
    day: 25,
    type: "festival",
    icon: "🎉",
  },
  {
    id: "whale-watching-pacific",
    month: "july",
    type: "environmental",
    icon: "🐋",
  },
  {
    id: "green-season-wildlife",
    month: "july",
    type: "tourism",
    icon: "🦜",
  },

  // ============ AUGUST ============
  {
    id: "mother-day",
    month: "august",
    day: 15,
    type: "holiday",
    icon: "👩",
    isOfficial: true,
  },
  {
    id: "virgin-angels",
    month: "august",
    day: 2,
    type: "cultural",
    icon: "⛪",
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
    type: "weather",
    icon: "🌴",
  },
  {
    id: "whale-watching-peak",
    month: "august",
    type: "environmental",
    icon: "🐋",
  },
  {
    id: "international-youth-day",
    month: "august",
    day: 12,
    type: "cultural",
    icon: "👦",
  },

  // ============ SEPTEMBER ============
  {
    id: "independence-day",
    month: "september",
    day: 15,
    type: "holiday",
    icon: "🇨🇷",
    isOfficial: true,
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
  {
    id: "lantern-parade",
    month: "september",
    day: 14,
    type: "cultural",
    icon: "🏮",
  },
  {
    id: "international-peace-day",
    month: "september",
    day: 21,
    type: "cultural",
    icon: "☮️",
  },
  {
    id: "national-parks-day",
    month: "september",
    day: 24,
    type: "environmental",
    icon: "🏞️",
  },
  {
    id: "olive-ridley-arrival",
    month: "september",
    type: "environmental",
    icon: "🐢",
  },

  // ============ OCTOBER ============
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
  {
    id: "limon-carnival",
    month: "october",
    day: 12,
    endDay: 20,
    type: "festival",
    icon: "💃",
  },
  {
    id: "halloween-cr",
    month: "october",
    day: 31,
    type: "cultural",
    icon: "🎃",
  },
  {
    id: "turtle-arribada",
    month: "october",
    type: "environmental",
    icon: "🐢",
  },
  {
    id: "wettest-month",
    month: "october",
    type: "weather",
    icon: "🌧️",
  },

  // ============ NOVEMBER ============
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
    type: "weather",
    icon: "🍂",
  },
  {
    id: "coffee-flowering",
    month: "november",
    type: "agricultural",
    icon: "🌸",
    relatedTrees: ["cafe"],
  },
  {
    id: "school-exams-final",
    month: "november",
    day: 15,
    endDay: 30,
    type: "school",
    icon: "📝",
  },
  {
    id: "black-friday-cr",
    month: "november",
    day: 29,
    type: "cultural",
    icon: "🛍️",
  },
  {
    id: "high-season-begins",
    month: "november",
    type: "tourism",
    icon: "📈",
  },
  {
    id: "thanksgiving-tourism",
    month: "november",
    day: 28,
    type: "tourism",
    icon: "🦃",
  },

  // ============ DECEMBER ============
  {
    id: "christmas",
    month: "december",
    day: 25,
    type: "holiday",
    icon: "🎄",
    isOfficial: true,
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
    type: "weather",
    icon: "☀️",
  },
  {
    id: "school-vacation-dec",
    month: "december",
    day: 14,
    endDay: 31,
    type: "school",
    icon: "🎉",
  },
  {
    id: "festival-luz",
    month: "december",
    day: 14,
    type: "festival",
    icon: "💡",
  },
  {
    id: "tope-nacional",
    month: "december",
    day: 26,
    type: "festival",
    icon: "🐴",
  },
  {
    id: "carnival-san-jose",
    month: "december",
    day: 27,
    type: "festival",
    icon: "🎭",
  },
  {
    id: "new-years-eve",
    month: "december",
    day: 31,
    type: "holiday",
    icon: "🎇",
  },
  {
    id: "peak-tourism-season",
    month: "december",
    day: 15,
    endDay: 31,
    type: "tourism",
    icon: "✈️",
  },
  {
    id: "zapote-festival",
    month: "december",
    day: 25,
    endDay: 31,
    type: "festival",
    icon: "🎡",
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
  // New events translations
  "high-season-peak": {
    en: {
      name: "Peak Tourism Season",
      description:
        "High season for tourism - beaches and parks are busy but weather is perfect",
      tip: "Book accommodations and tours well in advance",
    },
    es: {
      name: "Temporada Alta de Turismo",
      description:
        "Temporada alta - playas y parques concurridos pero clima perfecto",
      tip: "Reserve alojamiento y tours con anticipación",
    },
  },
  "school-vacation-jan": {
    en: {
      name: "School Vacation",
      description: "Costa Rican schools are on summer vacation",
      tip: "Expect more local families at beaches and parks",
    },
    es: {
      name: "Vacaciones Escolares",
      description: "Las escuelas costarricenses están en vacaciones de verano",
      tip: "Espere más familias locales en playas y parques",
    },
  },
  "whale-watching-south": {
    en: {
      name: "Whale Watching (South)",
      description:
        "Humpback whales from Antarctica visible on southern Pacific coast",
      tip: "Visit Osa Peninsula or Uvita for best whale sightings",
    },
    es: {
      name: "Avistamiento de Ballenas (Sur)",
      description:
        "Ballenas jorobadas de la Antártida visibles en la costa pacífica sur",
      tip: "Visita la Península de Osa o Uvita para mejores avistamientos",
    },
  },
  "palmares-festival": {
    en: {
      name: "Fiestas de Palmares",
      description:
        "Costa Rica's largest folk festival with concerts, bulls, and carnival rides",
      tip: "Experience authentic Tico culture - one of Central America's biggest fests",
    },
    es: {
      name: "Fiestas de Palmares",
      description:
        "El festival popular más grande de Costa Rica con conciertos, toros y feria",
      tip: "Vive la cultura tica auténtica - una de las fiestas más grandes de Centroamérica",
    },
  },
  "school-year-start": {
    en: {
      name: "School Year Begins",
      description: "Costa Rican public schools start the new academic year",
      tip: "Traffic increases in mornings and afternoons near schools",
    },
    es: {
      name: "Inicio del Año Escolar",
      description:
        "Las escuelas públicas costarricenses inician el nuevo año académico",
      tip: "El tráfico aumenta en las mañanas y tardes cerca de escuelas",
    },
  },
  "valentines-day": {
    en: {
      name: "Valentine's Day",
      description:
        "Day of Love and Friendship - widely celebrated in Costa Rica",
      tip: "Restaurants are busy - make reservations!",
    },
    es: {
      name: "Día del Amor y la Amistad",
      description: "Día de San Valentín - muy celebrado en Costa Rica",
      tip: "Los restaurantes están llenos - ¡haz reservaciones!",
    },
  },
  "envision-festival": {
    en: {
      name: "Envision Festival",
      description:
        "International transformational arts and music festival in Uvita",
      tip: "Tickets sell out months in advance - plan early",
    },
    es: {
      name: "Festival Envision",
      description:
        "Festival internacional de artes transformativas y música en Uvita",
      tip: "Las entradas se agotan meses antes - planifica con tiempo",
    },
  },
  "best-beach-weather": {
    en: {
      name: "Best Beach Weather",
      description:
        "Perfect sunny days with minimal rain - ideal for Pacific coast beaches",
      tip: "Both coasts have excellent conditions this month",
    },
    es: {
      name: "Mejor Clima de Playa",
      description:
        "Días soleados perfectos con mínima lluvia - ideal para playas del Pacífico",
      tip: "Ambas costas tienen excelentes condiciones este mes",
    },
  },
  "international-womens-day": {
    en: {
      name: "International Women's Day",
      description: "Celebrating women's achievements and rights",
      tip: "Various cultural events and activities nationwide",
    },
    es: {
      name: "Día Internacional de la Mujer",
      description: "Celebrando los logros y derechos de las mujeres",
      tip: "Varios eventos culturales y actividades en todo el país",
    },
  },
  "sea-turtle-nesting-caribbean": {
    en: {
      name: "Sea Turtle Nesting Begins",
      description:
        "Green and hawksbill turtles begin nesting on Caribbean beaches",
      tip: "Tortuguero is the best place to witness this amazing event",
    },
    es: {
      name: "Comienza Anidación de Tortugas",
      description:
        "Tortugas verdes y carey comienzan a anidar en playas del Caribe",
      tip: "Tortuguero es el mejor lugar para presenciar este increíble evento",
    },
  },
  "leatherback-turtle-peak": {
    en: {
      name: "Leatherback Turtle Peak",
      description: "Peak season for leatherback sea turtle nesting",
      tip: "Visit Playa Grande or Las Baulas National Park for night tours",
    },
    es: {
      name: "Pico de Tortuga Baula",
      description: "Temporada alta de anidación de tortuga baula",
      tip: "Visita Playa Grande o el Parque Nacional Las Baulas para tours nocturnos",
    },
  },
  "easter-tourism": {
    en: {
      name: "Easter Tourism Week",
      description: "High domestic tourism as Costa Ricans travel for Holy Week",
      tip: "Beaches are very crowded - consider less popular destinations",
    },
    es: {
      name: "Semana de Turismo de Pascua",
      description:
        "Alto turismo doméstico mientras los ticos viajan en Semana Santa",
      tip: "Las playas están muy llenas - considera destinos menos populares",
    },
  },
  "transition-to-green": {
    en: {
      name: "Transition to Green Season",
      description: "First rains begin appearing, especially in afternoons",
      tip: "Still mostly dry mornings - plan outdoor activities early",
    },
    es: {
      name: "Transición a Estación Verde",
      description:
        "Las primeras lluvias comienzan a aparecer, especialmente en las tardes",
      tip: "Aún mañanas secas - planifica actividades al aire libre temprano",
    },
  },
  "oxcart-day": {
    en: {
      name: "National Oxcart Day",
      description:
        "Celebrating Costa Rica's traditional painted oxcarts (carretas)",
      tip: "Visit Sarchí to see artisans making these UNESCO-recognized crafts",
    },
    es: {
      name: "Día Nacional de la Carreta",
      description:
        "Celebrando las carretas pintadas tradicionales de Costa Rica",
      tip: "Visita Sarchí para ver artesanos haciendo estas artesanías reconocidas por UNESCO",
    },
  },
  "low-season-begins": {
    en: {
      name: "Low Season Begins",
      description: "Tourism low season starts - fewer crowds and lower prices",
      tip: "Great deals on hotels and tours - embrace the green season!",
    },
    es: {
      name: "Comienza Temporada Baja",
      description:
        "Comienza la temporada baja de turismo - menos multitudes y precios bajos",
      tip: "Grandes ofertas en hoteles y tours - ¡abraza la estación verde!",
    },
  },
  "green-season-deals": {
    en: {
      name: "Green Season Deals",
      description: "Best hotel and tour discounts of the year",
      tip: "Many hotels offer 30-50% discounts during green season",
    },
    es: {
      name: "Ofertas de Estación Verde",
      description: "Los mejores descuentos del año en hoteles y tours",
      tip: "Muchos hoteles ofrecen 30-50% de descuento en estación verde",
    },
  },
  "mother-nature-month": {
    en: {
      name: "Month of Nature",
      description: "Various environmental activities and tree planting events",
      tip: "Join a reforestation project or environmental cleanup",
    },
    es: {
      name: "Mes de la Naturaleza",
      description:
        "Varias actividades ambientales y eventos de siembra de árboles",
      tip: "Únete a un proyecto de reforestación o limpieza ambiental",
    },
  },
  "fathers-day-cr": {
    en: {
      name: "Father's Day (Costa Rica)",
      description: "Third Sunday of June - celebrating fathers",
      tip: "Restaurants and family attractions are busy",
    },
    es: {
      name: "Día del Padre",
      description: "Tercer domingo de junio - celebrando a los padres",
      tip: "Restaurantes y atracciones familiares están llenos",
    },
  },
  "ocean-day": {
    en: {
      name: "World Ocean Day",
      description:
        "Celebrating ocean conservation - important for Costa Rica's marine parks",
      tip: "Beach cleanups and marine conservation events nationwide",
    },
    es: {
      name: "Día Mundial del Océano",
      description:
        "Celebrando la conservación marina - importante para los parques marinos",
      tip: "Limpiezas de playa y eventos de conservación marina en todo el país",
    },
  },
  veranillo: {
    en: {
      name: "Veranillo de San Juan",
      description:
        "Brief dry spell in the middle of rainy season - 'little summer'",
      tip: "Take advantage of this sunny break for outdoor activities",
    },
    es: {
      name: "Veranillo de San Juan",
      description: "Breve período seco en medio de la estación lluviosa",
      tip: "Aprovecha este descanso soleado para actividades al aire libre",
    },
  },
  "school-mid-year-break": {
    en: {
      name: "Mid-Year School Break",
      description: "Short vacation between school semesters",
      tip: "Local tourism increases briefly",
    },
    es: {
      name: "Vacaciones de Medio Año",
      description: "Vacaciones cortas entre semestres escolares",
      tip: "El turismo local aumenta brevemente",
    },
  },
  "school-vacation-july": {
    en: {
      name: "School Vacation",
      description: "Two-week mid-year school vacation period",
      tip: "Popular time for local family travel",
    },
    es: {
      name: "Vacaciones Escolares",
      description: "Período de vacaciones escolares de dos semanas",
      tip: "Tiempo popular para viajes familiares locales",
    },
  },
  "liberia-festival": {
    en: {
      name: "Guanacaste Day Festival",
      description:
        "Major celebrations in Liberia for Guanacaste annexation anniversary",
      tip: "Experience traditional sabanero culture, folk dancing, and rodeos",
    },
    es: {
      name: "Fiestas de Guanacaste",
      description:
        "Grandes celebraciones en Liberia por el aniversario de la anexión",
      tip: "Vive la cultura sabanera tradicional, bailes folklóricos y topes",
    },
  },
  "whale-watching-pacific": {
    en: {
      name: "Whale Watching Season (North)",
      description: "Humpback whales from Alaska arrive on the Pacific coast",
      tip: "Marino Ballena National Park offers excellent viewing",
    },
    es: {
      name: "Temporada de Ballenas (Norte)",
      description:
        "Ballenas jorobadas de Alaska llegan a la costa del Pacífico",
      tip: "El Parque Nacional Marino Ballena ofrece excelente observación",
    },
  },
  "green-season-wildlife": {
    en: {
      name: "Peak Wildlife Activity",
      description: "Many animals are more active during green season",
      tip: "Excellent time for wildlife watching - animals are breeding and feeding",
    },
    es: {
      name: "Actividad de Fauna Máxima",
      description:
        "Muchos animales están más activos durante la estación verde",
      tip: "Excelente tiempo para observar fauna - animales reproduciendo y alimentándose",
    },
  },
  "virgin-angels": {
    en: {
      name: "Virgen de los Ángeles",
      description:
        "Costa Rica's patron saint day - major pilgrimage to Cartago",
      tip: "Thousands walk to Cartago's Basilica - witness this spiritual tradition",
    },
    es: {
      name: "Día de la Virgen de los Ángeles",
      description:
        "Día de la santa patrona de Costa Rica - gran peregrinación a Cartago",
      tip: "Miles caminan a la Basílica de Cartago - presencia esta tradición espiritual",
    },
  },
  "whale-watching-peak": {
    en: {
      name: "Whale Watching Peak",
      description: "Best month for whale watching as both populations overlap",
      tip: "Book whale watching tours from Drake Bay, Uvita, or Dominical",
    },
    es: {
      name: "Pico de Avistamiento de Ballenas",
      description:
        "Mejor mes para ver ballenas cuando ambas poblaciones se superponen",
      tip: "Reserva tours desde Bahía Drake, Uvita o Dominical",
    },
  },
  "international-youth-day": {
    en: {
      name: "International Youth Day",
      description: "Celebrating young people and their contributions",
      tip: "Youth-focused events and activities at cultural centers",
    },
    es: {
      name: "Día Internacional de la Juventud",
      description: "Celebrando a los jóvenes y sus contribuciones",
      tip: "Eventos y actividades enfocadas en jóvenes en centros culturales",
    },
  },
  "lantern-parade": {
    en: {
      name: "Independence Lantern Parade",
      description: "Children parade with handmade lanterns on independence eve",
      tip: "Join local communities for this beautiful tradition",
    },
    es: {
      name: "Desfile de Faroles",
      description:
        "Niños desfilan con faroles hechos a mano en víspera de independencia",
      tip: "Únete a las comunidades locales para esta hermosa tradición",
    },
  },
  "international-peace-day": {
    en: {
      name: "International Day of Peace",
      description: "Costa Rica, with no army, celebrates peace especially",
      tip: "Special significance in a country that abolished its military",
    },
    es: {
      name: "Día Internacional de la Paz",
      description:
        "Costa Rica, sin ejército, celebra la paz de manera especial",
      tip: "Significado especial en un país que abolió su ejército",
    },
  },
  "national-parks-day": {
    en: {
      name: "National Parks Day",
      description: "Celebrating Costa Rica's incredible park system",
      tip: "Many parks offer free entry or special programs",
    },
    es: {
      name: "Día de Parques Nacionales",
      description: "Celebrando el increíble sistema de parques de Costa Rica",
      tip: "Muchos parques ofrecen entrada gratis o programas especiales",
    },
  },
  "olive-ridley-arrival": {
    en: {
      name: "Olive Ridley Turtle Arrival",
      description: "Massive olive ridley turtle arribadas begin at Ostional",
      tip: "Witness thousands of turtles nesting simultaneously",
    },
    es: {
      name: "Llegada de Tortuga Lora",
      description:
        "Comienzan las arribadas masivas de tortuga lora en Ostional",
      tip: "Presencia miles de tortugas anidando simultáneamente",
    },
  },
  "limon-carnival": {
    en: {
      name: "Limón Carnival",
      description: "Caribbean carnival celebrating Afro-Costa Rican culture",
      tip: "Experience Caribbean music, dance, and cuisine",
    },
    es: {
      name: "Carnaval de Limón",
      description: "Carnaval caribeño celebrando la cultura afro-costarricense",
      tip: "Vive la música, baile y cocina caribeña",
    },
  },
  "halloween-cr": {
    en: {
      name: "Halloween",
      description:
        "Increasingly popular celebration, especially in urban areas",
      tip: "Shopping centers and neighborhoods have trick-or-treating events",
    },
    es: {
      name: "Halloween",
      description:
        "Celebración cada vez más popular, especialmente en áreas urbanas",
      tip: "Centros comerciales y vecindarios tienen eventos de dulce o truco",
    },
  },
  "turtle-arribada": {
    en: {
      name: "Turtle Arribada Peak",
      description: "Peak month for massive turtle nesting events at Ostional",
      tip: "Join a guided night tour to witness this natural wonder",
    },
    es: {
      name: "Pico de Arribadas",
      description: "Mes pico para eventos masivos de anidación en Ostional",
      tip: "Únete a un tour nocturno guiado para presenciar esta maravilla natural",
    },
  },
  "wettest-month": {
    en: {
      name: "Wettest Month",
      description: "Peak rainfall - expect daily afternoon showers",
      tip: "Plan morning activities and enjoy the lush green landscapes",
    },
    es: {
      name: "Mes Más Lluvioso",
      description: "Máxima lluvia - espera lluvias vespertinas diarias",
      tip: "Planifica actividades matutinas y disfruta los paisajes verdes exuberantes",
    },
  },
  "coffee-flowering": {
    en: {
      name: "Coffee Flowering",
      description: "Coffee plants bloom with fragrant white flowers",
      tip: "Visit coffee regions for beautiful flowering displays",
    },
    es: {
      name: "Floración del Café",
      description: "Las plantas de café florecen con fragantes flores blancas",
      tip: "Visita regiones cafetaleras para hermosas exhibiciones de flores",
    },
  },
  "school-exams-final": {
    en: {
      name: "Final School Exams",
      description: "End of year examinations for Costa Rican students",
      tip: "Students are focused on studies - quiet time for families",
    },
    es: {
      name: "Exámenes Finales",
      description: "Exámenes de fin de año para estudiantes costarricenses",
      tip: "Los estudiantes enfocados en estudios - tiempo tranquilo para familias",
    },
  },
  "black-friday-cr": {
    en: {
      name: "Black Friday (Costa Rica)",
      description: "Shopping event with major discounts at stores and malls",
      tip: "Good deals available, though not as extreme as US sales",
    },
    es: {
      name: "Viernes Negro",
      description:
        "Evento de compras con grandes descuentos en tiendas y centros comerciales",
      tip: "Buenas ofertas disponibles, aunque no tan extremas como en EE.UU.",
    },
  },
  "high-season-begins": {
    en: {
      name: "High Season Begins",
      description: "Tourist high season kicks off with dry weather returning",
      tip: "Book popular tours and hotels in advance",
    },
    es: {
      name: "Comienza Temporada Alta",
      description:
        "La temporada alta de turismo comienza con el regreso del clima seco",
      tip: "Reserva tours populares y hoteles con anticipación",
    },
  },
  "thanksgiving-tourism": {
    en: {
      name: "US Thanksgiving Tourism",
      description: "Influx of North American tourists for Thanksgiving holiday",
      tip: "Popular tourist areas get busier - book ahead",
    },
    es: {
      name: "Turismo de Thanksgiving",
      description:
        "Llegada de turistas norteamericanos por Día de Acción de Gracias",
      tip: "Las áreas turísticas populares se llenan - reserva con tiempo",
    },
  },
  "school-vacation-dec": {
    en: {
      name: "Summer Vacation Begins",
      description: "Costa Rican schools close for summer vacation",
      tip: "Beaches and family destinations become crowded",
    },
    es: {
      name: "Comienzan Vacaciones de Verano",
      description:
        "Las escuelas costarricenses cierran por vacaciones de verano",
      tip: "Las playas y destinos familiares se llenan",
    },
  },
  "festival-luz": {
    en: {
      name: "Festival de la Luz",
      description:
        "Spectacular Christmas parade with illuminated floats in San José",
      tip: "Arrive early to get a good viewing spot on Paseo Colón",
    },
    es: {
      name: "Festival de la Luz",
      description:
        "Espectacular desfile navideño con carrozas iluminadas en San José",
      tip: "Llega temprano para conseguir un buen lugar en Paseo Colón",
    },
  },
  "tope-nacional": {
    en: {
      name: "Tope Nacional",
      description:
        "National horse parade with thousands of horses through San José",
      tip: "See beautiful Costa Rican horses and traditional sabanero attire",
    },
    es: {
      name: "Tope Nacional",
      description:
        "Desfile nacional de caballos con miles de caballos por San José",
      tip: "Ve hermosos caballos costarricenses y vestimenta sabanera tradicional",
    },
  },
  "carnival-san-jose": {
    en: {
      name: "San José Carnival",
      description: "Street carnival with music, dance, and celebration",
      tip: "Join the festive atmosphere in downtown San José",
    },
    es: {
      name: "Carnaval de San José",
      description: "Carnaval callejero con música, baile y celebración",
      tip: "Únete al ambiente festivo en el centro de San José",
    },
  },
  "new-years-eve": {
    en: {
      name: "New Year's Eve",
      description: "Celebrate the end of the year Costa Rican style",
      tip: "Enjoy fireworks, grapes at midnight, and running around the block with luggage!",
    },
    es: {
      name: "Nochevieja",
      description: "Celebra el fin de año al estilo costarricense",
      tip: "¡Disfruta fuegos artificiales, uvas a medianoche y correr con maletas!",
    },
  },
  "peak-tourism-season": {
    en: {
      name: "Peak Tourism Season",
      description: "Busiest tourism period with perfect dry season weather",
      tip: "Book everything well in advance - popular spots fill up quickly",
    },
    es: {
      name: "Pico de Temporada Turística",
      description:
        "Período turístico más ocupado con clima perfecto de estación seca",
      tip: "Reserva todo con anticipación - los lugares populares se llenan rápido",
    },
  },
  "zapote-festival": {
    en: {
      name: "Fiestas de Zapote",
      description:
        "Year-end festival with bull riding, carnival, and traditional food",
      tip: "Experience traditional Tico toros a la tica - bulls aren't harmed!",
    },
    es: {
      name: "Fiestas de Zapote",
      description:
        "Festival de fin de año con toros, feria y comida tradicional",
      tip: "Vive los tradicionales toros a la tica - ¡no se daña a los toros!",
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
  if (!Object.hasOwn(EVENT_TRANSLATIONS, eventId)) return undefined;
  const eventTranslations =
    EVENT_TRANSLATIONS[eventId as keyof typeof EVENT_TRANSLATIONS];
  const loc = normalizeLocale(locale);
  return eventTranslations[loc];
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
    text: "text-blue-800 dark:text-blue-300",
    border: "border-blue-300 dark:border-blue-700",
  },
  environmental: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-300",
    border: "border-green-300 dark:border-green-700",
  },
  cultural: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-800 dark:text-purple-300",
    border: "border-purple-300 dark:border-purple-700",
  },
  festival: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-800 dark:text-amber-300",
    border: "border-amber-300 dark:border-amber-700",
  },
  agricultural: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-800 dark:text-yellow-300",
    border: "border-yellow-300 dark:border-yellow-700",
  },
  tourism: {
    bg: "bg-cyan-100 dark:bg-cyan-900/30",
    text: "text-cyan-800 dark:text-cyan-300",
    border: "border-cyan-300 dark:border-cyan-700",
  },
  school: {
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    text: "text-indigo-800 dark:text-indigo-300",
    border: "border-indigo-300 dark:border-indigo-700",
  },
  weather: {
    bg: "bg-slate-200 dark:bg-slate-900/30",
    text: "text-slate-800 dark:text-slate-300",
    border: "border-slate-300 dark:border-slate-700",
  },
};
