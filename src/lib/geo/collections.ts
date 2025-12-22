/**
 * Regional Discovery Collections
 * Shareable, experience-focused tree collections by region and theme
 */

import type { Locale, Province, Region, TreeTag, Month } from "@/types/tree";

export type CollectionType =
  | "endemic"
  | "giants"
  | "flowering"
  | "wildlife"
  | "hiking"
  | "endangered"
  | "seasonal"
  | "photography"
  | "iconic";

export interface DiscoveryCollection {
  id: string;
  type: CollectionType;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  shareText: Record<Locale, string>;
  regions: Region[];
  provinces: Province[];
  icon: string;
  tags?: TreeTag[];
  filterFn?: string; // Name of filter function to apply
  maxTrees?: number;
  featured?: boolean;
  seasonal?: {
    months: Month[];
    highlight: Record<Locale, string>;
  };
}

// Regional Collections - shareable, themed discoveries
export const DISCOVERY_COLLECTIONS: DiscoveryCollection[] = [
  // === MONTEVERDE / CLOUD FOREST ===
  {
    id: "monteverde-cloud-forest-treasures",
    type: "endemic",
    title: {
      en: "Trees You'll Only Find in Monteverde Cloud Forest",
      es: "Árboles que Solo Encontrarás en el Bosque Nuboso de Monteverde",
    },
    description: {
      en: "Discover the mystical trees draped in moss and orchids that thrive in Costa Rica's famous cloud forest ecosystem.",
      es: "Descubre los místicos árboles cubiertos de musgo y orquídeas que prosperan en el famoso ecosistema de bosque nuboso de Costa Rica.",
    },
    shareText: {
      en: "🌲 Check out these incredible cloud forest trees from Monteverde! #CostaRica #CloudForest",
      es: "🌲 ¡Mira estos increíbles árboles del bosque nuboso de Monteverde! #CostaRica #BosqueNuboso",
    },
    regions: ["central-valley"],
    provinces: ["puntarenas", "alajuela"],
    icon: "🌲",
    tags: ["cloud-forest"],
    featured: true,
  },

  // === PACIFIC COAST ===
  {
    id: "pacific-coast-hiking-giants",
    type: "hiking",
    title: {
      en: "Top 5 Trees Along Pacific Coast Hikes",
      es: "Los 5 Mejores Árboles en Senderos de la Costa Pacífica",
    },
    description: {
      en: "These magnificent trees will greet you on hikes through Guanacaste and the Pacific lowlands. Learn to identify them!",
      es: "Estos magníficos árboles te darán la bienvenida en caminatas por Guanacaste y las tierras bajas del Pacífico. ¡Aprende a identificarlos!",
    },
    shareText: {
      en: "🥾 Planning a Pacific Coast hike in Costa Rica? Meet the amazing trees you'll encounter! #Hiking #CostaRica",
      es: "🥾 ¿Planeas una caminata por la Costa Pacífica? ¡Conoce los increíbles árboles que encontrarás! #Senderismo #CostaRica",
    },
    regions: ["pacific-coast"],
    provinces: ["guanacaste", "puntarenas"],
    icon: "🥾",
    tags: ["dry-forest"],
    maxTrees: 5,
    featured: true,
  },
  {
    id: "guanacaste-dry-forest-survivors",
    type: "iconic",
    title: {
      en: "Dry Forest Survivors: Guanacaste's Remarkable Trees",
      es: "Sobrevivientes del Bosque Seco: Los Notables Árboles de Guanacaste",
    },
    description: {
      en: "Meet the tough, beautiful trees that thrive in Costa Rica's seasonal dry forest. These species have adapted to months without rain.",
      es: "Conoce los árboles resistentes y hermosos que prosperan en el bosque seco estacional de Costa Rica. Estas especies se han adaptado a meses sin lluvia.",
    },
    shareText: {
      en: "🌵 These incredible trees survive Costa Rica's dry season without a drop of rain! #DryForest #Guanacaste",
      es: "🌵 ¡Estos increíbles árboles sobreviven la época seca sin una gota de lluvia! #BosqueSeco #Guanacaste",
    },
    regions: ["pacific-coast"],
    provinces: ["guanacaste"],
    icon: "🌵",
    tags: ["dry-forest", "deciduous"],
  },
  {
    id: "pacific-golden-bloom",
    type: "flowering",
    title: {
      en: "The Golden March: Guanacaste's Spectacular Flowering",
      es: "El Marzo Dorado: La Espectacular Floración de Guanacaste",
    },
    description: {
      en: "Every March, Guanacaste transforms into a sea of yellow and pink as Cortez Amarillo and other trees burst into bloom.",
      es: "Cada marzo, Guanacaste se transforma en un mar de amarillo y rosa cuando el Cortez Amarillo y otros árboles estallan en floración.",
    },
    shareText: {
      en: "🌼 March in Guanacaste = Nature's most spectacular flower show! See which trees bloom. #Flowering #CostaRica",
      es: "🌼 ¡Marzo en Guanacaste = El espectáculo de flores más espectacular de la naturaleza! #Floración #CostaRica",
    },
    regions: ["pacific-coast"],
    provinces: ["guanacaste", "puntarenas"],
    icon: "🌼",
    tags: ["flowering", "deciduous"],
    seasonal: {
      months: ["february", "march", "april"],
      highlight: {
        en: "Peak bloom: February-April",
        es: "Floración máxima: Febrero-Abril",
      },
    },
    featured: true,
  },

  // === CARIBBEAN COAST ===
  {
    id: "caribbean-rainforest-giants",
    type: "giants",
    title: {
      en: "Giants of the Caribbean Rainforest",
      es: "Gigantes del Bosque Lluvioso Caribeño",
    },
    description: {
      en: "The tallest, most magnificent trees of Costa Rica grow in the Caribbean lowlands. Some tower over 60 meters!",
      es: "Los árboles más altos y magníficos de Costa Rica crecen en las tierras bajas del Caribe. ¡Algunos superan los 60 metros!",
    },
    shareText: {
      en: "🌴 These Caribbean rainforest giants can reach over 60 meters tall! #Rainforest #CostaRica #Trees",
      es: "🌴 ¡Estos gigantes del bosque lluvioso caribeño pueden superar los 60 metros! #BosqueLluvioso #CostaRica",
    },
    regions: ["caribbean-coast"],
    provinces: ["limon"],
    icon: "🌴",
    tags: ["rainforest"],
    filterFn: "filterByHeight",
  },
  {
    id: "tortuguero-wildlife-trees",
    type: "wildlife",
    title: {
      en: "Wildlife Magnets: Trees That Feed Tortuguero",
      es: "Imanes de Vida Silvestre: Árboles que Alimentan Tortuguero",
    },
    description: {
      en: "Toucans, monkeys, and macaws depend on these fruit-bearing trees. Spot wildlife by knowing where they feed!",
      es: "Tucanes, monos y guacamayas dependen de estos árboles frutales. ¡Avista vida silvestre sabiendo dónde se alimentan!",
    },
    shareText: {
      en: "🦜 Want to spot wildlife in Costa Rica? Find these trees! #Wildlife #Tortuguero #BirdWatching",
      es: "🦜 ¿Quieres ver vida silvestre en Costa Rica? ¡Busca estos árboles! #VidaSilvestre #Tortuguero",
    },
    regions: ["caribbean-coast"],
    provinces: ["limon"],
    icon: "🦜",
    tags: ["wildlife-food", "fruit-bearing"],
    featured: true,
  },
  {
    id: "caribbean-cacao-heritage",
    type: "iconic",
    title: {
      en: "The Chocolate Trail: Cacao Trees of Caribbean Costa Rica",
      es: "La Ruta del Chocolate: Árboles de Cacao del Caribe Costarricense",
    },
    description: {
      en: "Follow the ancient cacao trail through Limón and learn about the trees that gave us chocolate.",
      es: "Sigue la antigua ruta del cacao por Limón y aprende sobre los árboles que nos dieron el chocolate.",
    },
    shareText: {
      en: "🍫 Did you know? Costa Rica's Caribbean coast has ancient cacao trees! #Chocolate #Cacao #CostaRica",
      es: "🍫 ¿Sabías? ¡La costa caribeña de Costa Rica tiene antiguos árboles de cacao! #Chocolate #Cacao #CostaRica",
    },
    regions: ["caribbean-coast"],
    provinces: ["limon"],
    icon: "🍫",
  },

  // === OSA PENINSULA / SOUTHERN PACIFIC ===
  {
    id: "osa-endangered-treasures",
    type: "endangered",
    title: {
      en: "Endangered Treasures of the Osa Peninsula",
      es: "Tesoros en Peligro de la Península de Osa",
    },
    description: {
      en: "The Osa Peninsula harbors 2.5% of world's biodiversity. These rare trees need our protection.",
      es: "La Península de Osa alberga el 2.5% de la biodiversidad mundial. Estos árboles raros necesitan nuestra protección.",
    },
    shareText: {
      en: "⚠️ These endangered trees survive only in places like Corcovado. Help protect them! #Conservation #Osa",
      es: "⚠️ Estos árboles en peligro sobreviven solo en lugares como Corcovado. ¡Ayuda a protegerlos! #Conservación #Osa",
    },
    regions: ["pacific-coast"],
    provinces: ["puntarenas"],
    icon: "⚠️",
    tags: ["endangered", "rainforest"],
    featured: true,
  },
  {
    id: "osa-photography-spots",
    type: "photography",
    title: {
      en: "Instagram-Worthy Trees of Corcovado",
      es: "Árboles de Corcovado Dignos de Instagram",
    },
    description: {
      en: "From massive strangler figs to buttressed giants - these photogenic trees will make your camera sing!",
      es: "Desde enormes higueras estranguladoras hasta gigantes con contrafuertes - ¡estos fotogénicos árboles harán cantar tu cámara!",
    },
    shareText: {
      en: "📸 The most photogenic trees in Costa Rica! Perfect for your next adventure. #Photography #Nature #CostaRica",
      es: "📸 ¡Los árboles más fotogénicos de Costa Rica! Perfectos para tu próxima aventura. #Fotografía #Naturaleza",
    },
    regions: ["pacific-coast"],
    provinces: ["puntarenas"],
    icon: "📸",
    tags: ["rainforest"],
  },

  // === CENTRAL VALLEY ===
  {
    id: "central-valley-urban-trees",
    type: "iconic",
    title: {
      en: "Urban Treasures: Trees of San José & the Central Valley",
      es: "Tesoros Urbanos: Árboles de San José y el Valle Central",
    },
    description: {
      en: "You don't have to leave the city! Discover the magnificent trees growing in parks, streets, and gardens of the Central Valley.",
      es: "¡No tienes que salir de la ciudad! Descubre los magníficos árboles que crecen en parques, calles y jardines del Valle Central.",
    },
    shareText: {
      en: "🌳 Amazing trees right in Costa Rica's capital! Urban nature at its finest. #SanJose #UrbanNature",
      es: "🌳 ¡Increíbles árboles en la capital de Costa Rica! Naturaleza urbana en su máxima expresión. #SanJose #NaturalezaUrbana",
    },
    regions: ["central-valley"],
    provinces: ["san-jose", "heredia", "alajuela", "cartago"],
    icon: "🏙️",
    tags: ["ornamental", "shade-tree"],
  },
  {
    id: "coffee-shade-trees",
    type: "iconic",
    title: {
      en: "The Coffee Forest: Shade Trees of Costa Rica's Coffee Farms",
      es: "El Bosque del Café: Árboles de Sombra de las Fincas Cafetaleras",
    },
    description: {
      en: "Costa Rica's famous coffee grows under a canopy of carefully selected shade trees. Meet them!",
      es: "El famoso café de Costa Rica crece bajo un dosel de árboles de sombra cuidadosamente seleccionados. ¡Conócelos!",
    },
    shareText: {
      en: "☕ The trees that make Costa Rica's coffee possible! #Coffee #ShadeGrown #CostaRica",
      es: "☕ ¡Los árboles que hacen posible el café de Costa Rica! #Café #SombraCultivada #CostaRica",
    },
    regions: ["central-valley"],
    provinces: ["alajuela", "heredia", "san-jose", "cartago"],
    icon: "☕",
    tags: ["shade-tree", "nitrogen-fixing"],
    featured: true,
  },

  // === NORTHERN ZONE ===
  {
    id: "arenal-volcano-trees",
    type: "hiking",
    title: {
      en: "Trees of Arenal: Where Rainforest Meets Volcano",
      es: "Árboles de Arenal: Donde el Bosque Lluvioso Encuentra el Volcán",
    },
    description: {
      en: "The lush forests around Arenal Volcano host an incredible diversity of trees. Perfect for the volcano hiker!",
      es: "Los exuberantes bosques alrededor del Volcán Arenal albergan una increíble diversidad de árboles. ¡Perfecto para el excursionista!",
    },
    shareText: {
      en: "🌋 Hiking around Arenal Volcano? Don't miss these amazing trees! #Arenal #Volcano #Hiking",
      es: "🌋 ¿Caminando por el Volcán Arenal? ¡No te pierdas estos increíbles árboles! #Arenal #Volcán #Senderismo",
    },
    regions: ["northern-zone"],
    provinces: ["alajuela"],
    icon: "🌋",
    tags: ["rainforest"],
  },
  {
    id: "sarapiqui-biodiversity",
    type: "wildlife",
    title: {
      en: "Sarapiquí: Where the Trees Have More Wildlife Than You Can Count",
      es: "Sarapiquí: Donde los Árboles Tienen Más Vida Silvestre de la que Puedes Contar",
    },
    description: {
      en: "The Sarapiquí region is a birdwatcher's and nature lover's paradise. These trees are the reason why.",
      es: "La región de Sarapiquí es un paraíso para observadores de aves y amantes de la naturaleza. Estos árboles son la razón.",
    },
    shareText: {
      en: "🐒 Sarapiquí = Wildlife heaven! Meet the trees that make it possible. #Sarapiqui #Wildlife #BirdWatching",
      es: "🐒 ¡Sarapiquí = Paraíso de vida silvestre! Conoce los árboles que lo hacen posible. #Sarapiqui #VidaSilvestre",
    },
    regions: ["northern-zone"],
    provinces: ["heredia", "alajuela"],
    icon: "🐒",
    tags: ["wildlife-food", "rainforest"],
  },

  // === SEASONAL / THEMATIC ===
  {
    id: "flowering-now",
    type: "seasonal",
    title: {
      en: "Blooming Now: What's Flowering This Month",
      es: "Floreciendo Ahora: Qué Está en Flor Este Mes",
    },
    description: {
      en: "Don't miss the spectacular flower shows happening right now across Costa Rica!",
      es: "¡No te pierdas los espectaculares shows de flores que están ocurriendo ahora mismo en Costa Rica!",
    },
    shareText: {
      en: "🌸 These trees are blooming RIGHT NOW in Costa Rica! Go see them! #Flowers #Blooming #CostaRica",
      es: "🌸 ¡Estos árboles están floreciendo AHORA MISMO en Costa Rica! ¡Ve a verlos! #Flores #Floración #CostaRica",
    },
    regions: [
      "pacific-coast",
      "caribbean-coast",
      "central-valley",
      "northern-zone",
    ],
    provinces: [
      "guanacaste",
      "puntarenas",
      "limon",
      "alajuela",
      "heredia",
      "san-jose",
      "cartago",
    ],
    icon: "🌸",
    tags: ["flowering"],
    filterFn: "filterByCurrentFlowering",
    featured: true,
  },
  {
    id: "fruiting-now",
    type: "seasonal",
    title: {
      en: "Fruiting Season: Trees Bearing Fruit Now",
      es: "Temporada de Frutos: Árboles con Fruta Ahora",
    },
    description: {
      en: "Wildlife congregates around fruiting trees. Find out what's fruiting to spot more animals!",
      es: "La vida silvestre se congrega alrededor de árboles frutales. ¡Descubre qué está fructificando para ver más animales!",
    },
    shareText: {
      en: "🍎 Wildlife alert! These trees are fruiting now - best time to spot animals! #Wildlife #Fruiting #CostaRica",
      es: "🍎 ¡Alerta de vida silvestre! Estos árboles están fructificando - ¡mejor momento para ver animales! #VidaSilvestre",
    },
    regions: [
      "pacific-coast",
      "caribbean-coast",
      "central-valley",
      "northern-zone",
    ],
    provinces: [
      "guanacaste",
      "puntarenas",
      "limon",
      "alajuela",
      "heredia",
      "san-jose",
      "cartago",
    ],
    icon: "🍎",
    tags: ["fruit-bearing", "wildlife-food"],
    filterFn: "filterByCurrentFruiting",
  },
  {
    id: "national-symbols",
    type: "iconic",
    title: {
      en: "National Pride: Costa Rica's Symbolic Trees",
      es: "Orgullo Nacional: Los Árboles Simbólicos de Costa Rica",
    },
    description: {
      en: "The trees that represent Costa Rica's natural heritage and cultural identity.",
      es: "Los árboles que representan el patrimonio natural y la identidad cultural de Costa Rica.",
    },
    shareText: {
      en: "🇨🇷 Meet Costa Rica's national trees - symbols of natural heritage! #CostaRica #NationalSymbols",
      es: "🇨🇷 ¡Conoce los árboles nacionales de Costa Rica - símbolos del patrimonio natural! #CostaRica #SímbolosNacionales",
    },
    regions: [
      "pacific-coast",
      "caribbean-coast",
      "central-valley",
      "northern-zone",
    ],
    provinces: [
      "guanacaste",
      "puntarenas",
      "limon",
      "alajuela",
      "heredia",
      "san-jose",
      "cartago",
    ],
    icon: "🇨🇷",
    tags: ["national"],
    featured: true,
  },
  {
    id: "medicinal-forest",
    type: "iconic",
    title: {
      en: "Nature's Pharmacy: Medicinal Trees of Costa Rica",
      es: "La Farmacia de la Naturaleza: Árboles Medicinales de Costa Rica",
    },
    description: {
      en: "Traditional medicine meets modern science. Discover trees that have been healing for generations.",
      es: "La medicina tradicional se encuentra con la ciencia moderna. Descubre árboles que han estado sanando por generaciones.",
    },
    shareText: {
      en: "💊 These Costa Rican trees have been used as medicine for centuries! #TraditionalMedicine #Plants",
      es: "💊 ¡Estos árboles costarricenses se han usado como medicina por siglos! #MedicinaTradicional #Plantas",
    },
    regions: [
      "pacific-coast",
      "caribbean-coast",
      "central-valley",
      "northern-zone",
    ],
    provinces: [
      "guanacaste",
      "puntarenas",
      "limon",
      "alajuela",
      "heredia",
      "san-jose",
      "cartago",
    ],
    icon: "💊",
    tags: ["medicinal"],
  },
];

// Helper to get featured collections
export function getFeaturedCollections(): DiscoveryCollection[] {
  return DISCOVERY_COLLECTIONS.filter((c) => c.featured);
}

// Helper to get collections by region
export function getCollectionsByRegion(region: Region): DiscoveryCollection[] {
  return DISCOVERY_COLLECTIONS.filter((c) => c.regions.includes(region));
}

// Helper to get collections by province
export function getCollectionsByProvince(
  province: Province
): DiscoveryCollection[] {
  return DISCOVERY_COLLECTIONS.filter((c) => c.provinces.includes(province));
}

// Helper to get collection by ID
export function getCollectionById(id: string): DiscoveryCollection | undefined {
  return DISCOVERY_COLLECTIONS.find((c) => c.id === id);
}

// Helper to get seasonal collections
export function getSeasonalCollections(): DiscoveryCollection[] {
  return DISCOVERY_COLLECTIONS.filter((c) => c.type === "seasonal");
}

// Get current month for seasonal filtering
export function getCurrentMonth(): Month {
  const months: Month[] = [
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
  return months[new Date().getMonth()];
}
