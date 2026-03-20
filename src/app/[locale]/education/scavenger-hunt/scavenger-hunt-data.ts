/**
 * Static lesson data for the Scavenger Hunt activity.
 *
 * This module is imported ONLY by the server-side page.tsx so that
 * the data is serialized in the RSC payload rather than shipped as
 * executable JavaScript in the client bundle.
 *
 * NOTE: Mission validator functions are NOT serializable and remain
 * in the client component. Only display data (labels, mission text,
 * configuration) is extracted here.
 */
/* eslint-disable security/detect-object-injection -- locale lookups are constrained to known bilingual keys */

import { normalizeLocale } from "@/lib/i18n";

// ============================================================================
// Types (re-exported for the client component)
// ============================================================================

export interface MissionDisplayData {
  id: string;
  type: "find" | "count" | "compare" | "photo" | "measure" | "quiz";
  title: string;
  description: string;
  hint: string;
  points: number;
  difficulty: "easy" | "medium" | "hard";
  icon: string;
  timeLimit?: number;
}

export interface ScavengerHuntLabels {
  title: string;
  subtitle: string;
  backToEducation: string;
  setupTeams: string;
  teamCount: string;
  teamName: string;
  teamNamePlaceholder: string;
  addMember: string;
  memberName: string;
  memberPlaceholder: string;
  difficulty: string;
  easy: string;
  medium: string;
  hard: string;
  mixed: string;
  missionCount: string;
  startHunt: string;
  currentTeam: string;
  selectMission: string;
  points: string;
  completed: string;
  hint: string;
  showHint: string;
  searchTrees: string;
  selectTree: string;
  submitAnswer: string;
  correct: string;
  incorrect: string;
  skipMission: string;
  nextTeam: string;
  leaderboard: string;
  endHunt: string;
  winner: string;
  finalResults: string;
  playAgain: string;
  streak: string;
  bonus: string;
  missionsCompleted: string;
  timeLeft: string;
  noResults: string;
  matchingTrees: string;
  remove: string;
  members: string;
  teams: string;
  defaultTeamName: string;
  backToMissions: string;
}

export interface ScavengerHuntLessonData {
  labels: ScavengerHuntLabels;
  missions: MissionDisplayData[];
}

// ============================================================================
// Mission display data (locale-resolved)
// ============================================================================

interface BilingualMission {
  id: string;
  type: "find" | "count" | "compare" | "photo" | "measure" | "quiz";
  title: { en: string; es: string };
  description: { en: string; es: string };
  hint: { en: string; es: string };
  points: number;
  difficulty: "easy" | "medium" | "hard";
  icon: string;
  timeLimit?: number;
}

const MISSIONS_BILINGUAL: BilingualMission[] = [
  {
    id: "tall-tree",
    type: "find",
    title: { en: "Giant Hunter", es: "Cazador de Gigantes" },
    description: {
      en: "Find a tree that grows taller than 30 meters",
      es: "Encuentra un árbol que crezca más de 30 metros",
    },
    hint: {
      en: "Look for trees like Ceiba or Almendro",
      es: "Busca árboles como Ceiba o Almendro",
    },
    points: 100,
    difficulty: "easy",
    icon: "📏",
  },
  {
    id: "flowering-tree",
    type: "find",
    title: { en: "Flower Spotter", es: "Cazador de Flores" },
    description: {
      en: "Find a tree that flowers in the current season",
      es: "Encuentra un árbol que florezca en esta temporada",
    },
    hint: {
      en: "Check the seasonal calendar for help",
      es: "Consulta el calendario estacional",
    },
    points: 100,
    difficulty: "easy",
    icon: "🌸",
  },
  {
    id: "fruit-tree",
    type: "find",
    title: { en: "Fruit Finder", es: "Buscador de Frutos" },
    description: {
      en: "Find a tree with edible fruits",
      es: "Encuentra un árbol con frutos comestibles",
    },
    hint: {
      en: "Look for trees tagged as having edible fruit",
      es: "Busca árboles etiquetados con frutos comestibles",
    },
    points: 100,
    difficulty: "easy",
    icon: "🍎",
  },
  {
    id: "endangered-tree",
    type: "find",
    title: { en: "Conservation Hero", es: "Héroe de Conservación" },
    description: {
      en: "Find a tree with a threatened conservation status",
      es: "Encuentra un árbol con estado de conservación amenazado",
    },
    hint: {
      en: "Look for Vulnerable, Endangered, or Critically Endangered species",
      es: "Busca especies Vulnerables, En Peligro o En Peligro Crítico",
    },
    points: 150,
    difficulty: "medium",
    icon: "🛡️",
  },
  {
    id: "medicinal-tree",
    type: "find",
    title: { en: "Nature's Pharmacy", es: "Farmacia Natural" },
    description: {
      en: "Find a tree with medicinal uses",
      es: "Encuentra un árbol con usos medicinales",
    },
    hint: {
      en: "Many traditional trees have healing properties",
      es: "Muchos árboles tradicionales tienen propiedades curativas",
    },
    points: 150,
    difficulty: "medium",
    icon: "💊",
  },
  {
    id: "three-families",
    type: "count",
    title: { en: "Family Explorer", es: "Explorador de Familias" },
    description: {
      en: "Find trees from 3 different botanical families",
      es: "Encuentra árboles de 3 familias botánicas diferentes",
    },
    hint: {
      en: "Each family has unique characteristics",
      es: "Cada familia tiene características únicas",
    },
    points: 200,
    difficulty: "medium",
    icon: "🌿",
  },
  {
    id: "native-tree",
    type: "find",
    title: { en: "Local Legend", es: "Leyenda Local" },
    description: {
      en: "Find a tree native to Costa Rica",
      es: "Encuentra un árbol nativo de Costa Rica",
    },
    hint: { en: "Look for the 'native' tag", es: "Busca la etiqueta 'nativo'" },
    points: 100,
    difficulty: "easy",
    icon: "🇨🇷",
  },
  {
    id: "timber-tree",
    type: "find",
    title: { en: "Timber Tracker", es: "Rastreador de Madera" },
    description: {
      en: "Find a tree valued for its timber",
      es: "Encuentra un árbol valorado por su madera",
    },
    hint: {
      en: "Many hardwood trees are prized for furniture",
      es: "Muchos árboles de madera dura son preciados para muebles",
    },
    points: 100,
    difficulty: "easy",
    icon: "🪵",
  },
  {
    id: "shade-tree",
    type: "find",
    title: { en: "Shade Seeker", es: "Buscador de Sombra" },
    description: {
      en: "Find a tree used for shade",
      es: "Encuentra un árbol usado para dar sombra",
    },
    hint: {
      en: "These trees have wide spreading canopies",
      es: "Estos árboles tienen copas amplias y extendidas",
    },
    points: 100,
    difficulty: "easy",
    icon: "☂️",
  },
  {
    id: "wildlife-tree",
    type: "find",
    title: { en: "Wildlife Hotel", es: "Hotel de Vida Silvestre" },
    description: {
      en: "Find a tree that provides habitat for wildlife",
      es: "Encuentra un árbol que proporcione hábitat para la vida silvestre",
    },
    hint: {
      en: "Look for trees that attract birds and animals",
      es: "Busca árboles que atraigan aves y animales",
    },
    points: 150,
    difficulty: "medium",
    icon: "🦜",
  },
  {
    id: "compound-leaves",
    type: "find",
    title: { en: "Leaf Detective", es: "Detective de Hojas" },
    description: {
      en: "Find a tree with compound leaves",
      es: "Encuentra un árbol con hojas compuestas",
    },
    hint: {
      en: "Compound leaves have multiple leaflets",
      es: "Las hojas compuestas tienen múltiples folíolos",
    },
    points: 150,
    difficulty: "medium",
    icon: "🍃",
  },
  {
    id: "buttress-roots",
    type: "find",
    title: { en: "Root Explorer", es: "Explorador de Raíces" },
    description: {
      en: "Find a tree with buttress roots",
      es: "Encuentra un árbol con raíces tabulares",
    },
    hint: {
      en: "Large tropical trees often have these distinctive roots",
      es: "Los grandes árboles tropicales suelen tener estas raíces distintivas",
    },
    points: 200,
    difficulty: "hard",
    icon: "🌳",
  },
  {
    id: "dry-forest",
    type: "find",
    title: { en: "Dry Forest Dweller", es: "Habitante del Bosque Seco" },
    description: {
      en: "Find a tree adapted to dry forests",
      es: "Encuentra un árbol adaptado a bosques secos",
    },
    hint: {
      en: "These trees survive with less water",
      es: "Estos árboles sobreviven con menos agua",
    },
    points: 150,
    difficulty: "medium",
    icon: "🏜️",
  },
  {
    id: "fast-growing",
    type: "find",
    title: { en: "Speed Demon", es: "Demonio de Velocidad" },
    description: {
      en: "Find a fast-growing pioneer tree",
      es: "Encuentra un árbol pionero de crecimiento rápido",
    },
    hint: {
      en: "Pioneer species colonize open areas quickly",
      es: "Las especies pioneras colonizan áreas abiertas rápidamente",
    },
    points: 150,
    difficulty: "medium",
    icon: "⚡",
  },
  {
    id: "nitrogen-fixer",
    type: "find",
    title: { en: "Soil Builder", es: "Constructor de Suelo" },
    description: {
      en: "Find a nitrogen-fixing tree",
      es: "Encuentra un árbol fijador de nitrógeno",
    },
    hint: {
      en: "These trees enrich the soil naturally",
      es: "Estos árboles enriquecen el suelo naturalmente",
    },
    points: 200,
    difficulty: "hard",
    icon: "🧪",
  },
];

// ============================================================================
// Data builder (called from server component)
// ============================================================================

export function getScavengerHuntLessonData(
  locale: string
): ScavengerHuntLessonData {
  const lang: "en" | "es" = normalizeLocale(locale);
  const t = (en: string, es: string): string => {
    if (lang === "es") {
      return es;
    }

    return en;
  };

  const labels: ScavengerHuntLabels = {
    title: t("Scavenger Hunt 🗺️", "Búsqueda del Tesoro 🗺️"),
    subtitle: t(
      "Find trees with specific characteristics and earn points!",
      "¡Encuentra árboles con características específicas y gana puntos!"
    ),
    backToEducation: t("← Back to Education", "← Volver a Educación"),
    setupTeams: t("Setup Teams", "Configurar Equipos"),
    teamCount: t("Number of Teams", "Número de Equipos"),
    teamName: t("Team Name", "Nombre del Equipo"),
    teamNamePlaceholder: t("E.g. The Jaguars", "Ej: Los Jaguares"),
    addMember: t("Add Member", "Agregar Miembro"),
    memberName: t("Member Name", "Nombre del Miembro"),
    memberPlaceholder: t("Student name", "Nombre del estudiante"),
    difficulty: t("Difficulty", "Dificultad"),
    easy: t("Easy", "Fácil"),
    medium: t("Medium", "Medio"),
    hard: t("Hard", "Difícil"),
    mixed: t("Mixed", "Mixto"),
    missionCount: t("Number of Missions", "Número de Misiones"),
    startHunt: t("🎯 Start Hunt", "🎯 Comenzar Búsqueda"),
    currentTeam: t("Current Team", "Turno del Equipo"),
    selectMission: t("Select a Mission", "Selecciona una Misión"),
    points: t("points", "puntos"),
    completed: t("completed", "completada"),
    hint: t("Hint", "Pista"),
    showHint: t("Show Hint (-20 pts)", "Mostrar Pista (-20 pts)"),
    searchTrees: t("Search trees...", "Buscar árboles..."),
    selectTree: t("Select this tree", "Seleccionar este árbol"),
    submitAnswer: t("Submit Answer", "Enviar Respuesta"),
    correct: t("Correct! 🎉", "¡Correcto! 🎉"),
    incorrect: t("Try again!", "¡Inténtalo de nuevo!"),
    skipMission: t("Skip Mission", "Saltar Misión"),
    nextTeam: t("Next Team", "Siguiente Equipo"),
    leaderboard: t("Leaderboard", "Tabla de Posiciones"),
    endHunt: t("End Hunt", "Terminar Búsqueda"),
    winner: t("Winner!", "¡Ganador!"),
    finalResults: t("Final Results", "Resultados Finales"),
    playAgain: t("Play Again", "Jugar de Nuevo"),
    streak: t("Streak", "Racha"),
    bonus: t("Bonus", "Bono"),
    missionsCompleted: t("Missions Completed", "Misiones Completadas"),
    timeLeft: t("Time left", "Tiempo restante"),
    noResults: t("No trees found", "No se encontraron árboles"),
    matchingTrees: t("trees match", "árboles coinciden"),
    remove: t("Remove", "Quitar"),
    members: t("members", "miembros"),
    teams: t("Teams", "Equipos"),
    defaultTeamName: t("Team", "Equipo"),
    backToMissions: t("Back to Missions", "Volver a Misiones"),
  };

  const missions: MissionDisplayData[] = MISSIONS_BILINGUAL.map((m) => ({
    id: m.id,
    type: m.type,
    title: m.title[lang],
    description: m.description[lang],
    hint: m.hint[lang],
    points: m.points,
    difficulty: m.difficulty,
    icon: m.icon,
    timeLimit: m.timeLimit,
  }));

  return { labels, missions };
}
