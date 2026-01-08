"use client";

import { useEffect } from "react";
import { Link } from "@i18n/navigation";
import Image from "next/image";
import { triggerConfetti, injectEducationStyles } from "@/lib/education";
import { createStorage, huntSessionSchema } from "@/lib/storage";
import { useDebounce } from "@/hooks/useDebounce";

interface Tree {
  title: string;
  scientificName: string;
  family: string;
  slug: string;
  featuredImage?: string;
  tags?: string[];
  conservationStatus?: string;
  nativeRegion?: string;
  maxHeight?: string;
  floweringSeason?: string[];
  fruitingSeason?: string[];
  uses?: string[];
}

interface Mission {
  id: string;
  type: "find" | "count" | "compare" | "photo" | "measure" | "quiz";
  title: { en: string; es: string };
  description: { en: string; es: string };
  hint: { en: string; es: string };
  points: number;
  difficulty: "easy" | "medium" | "hard";
  icon: string;
  validator: (trees: Tree[], answer?: string) => Tree[];
  timeLimit?: number; // minutes
}

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
}

interface CompletedMission {
  missionId: string;
  treeSlug?: string;
  answer?: string;
  timestamp: string;
  pointsEarned: number;
  bonusPoints: number;
}

interface Team {
  id: string;
  name: string;
  color: string;
  members: TeamMember[];
  completedMissions: CompletedMission[];
  totalPoints: number;
  streak: number;
}

interface HuntSession {
  teams: Team[];
  currentTeamIndex: number;
  startTime: string;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  activeMissions: string[];
  completedMissions: string[];
}

interface ScavengerHuntClientProps {
  trees: Tree[];
  locale: string;
}

const STORAGE_KEY = "costa-rica-tree-atlas-scavenger-hunt";

const AVATARS = [
  "🦜",
  "🦋",
  "🐸",
  "🦎",
  "🐒",
  "🦥",
  "🐦",
  "🦆",
  "🦢",
  "🦚",
  "🌺",
  "🌸",
];

const TEAM_COLORS = [
  {
    name: "green",
    bg: "bg-green-500",
    text: "text-green-500",
    light: "bg-green-50 dark:bg-green-900/20",
  },
  {
    name: "blue",
    bg: "bg-blue-500",
    text: "text-blue-500",
    light: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    name: "orange",
    bg: "bg-orange-500",
    text: "text-orange-500",
    light: "bg-orange-50 dark:bg-orange-900/20",
  },
  {
    name: "purple",
    bg: "bg-purple-500",
    text: "text-purple-500",
    light: "bg-purple-50 dark:bg-purple-900/20",
  },
];

// Mission definitions
const MISSIONS: Mission[] = [
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
    validator: (trees) =>
      trees.filter((t) => {
        const height = parseInt(t.maxHeight || "0");
        return height >= 30;
      }),
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
    validator: (trees) => {
      const month = new Date().getMonth() + 1;
      const monthNames = [
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
      const currentMonth = monthNames[month - 1];
      return trees.filter((t) =>
        t.floweringSeason?.some((s) => s.toLowerCase().includes(currentMonth))
      );
    },
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
    validator: (trees) => trees.filter((t) => t.tags?.includes("edible-fruit")),
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
    validator: (trees) =>
      trees.filter((t) =>
        [
          "Vulnerable",
          "Endangered",
          "Critically Endangered",
          "Near Threatened",
        ].some((status) => t.conservationStatus?.includes(status))
      ),
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
    validator: (trees) => trees.filter((t) => t.tags?.includes("medicinal")),
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
    validator: (trees) => trees, // Special handling in component
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
    validator: (trees) => trees.filter((t) => t.tags?.includes("native")),
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
    validator: (trees) => trees.filter((t) => t.tags?.includes("timber")),
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
    validator: (trees) => trees.filter((t) => t.tags?.includes("shade-tree")),
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
    validator: (trees) =>
      trees.filter(
        (t) =>
          t.tags?.includes("wildlife-habitat") ||
          t.tags?.includes("attracts-birds")
      ),
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
    validator: (trees) =>
      trees.filter((t) => t.tags?.includes("compound-leaves")),
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
    validator: (trees) =>
      trees.filter((t) => t.tags?.includes("buttress-roots")),
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
    validator: (trees) => trees.filter((t) => t.tags?.includes("dry-forest")),
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
    validator: (trees) =>
      trees.filter(
        (t) => t.tags?.includes("fast-growing") || t.tags?.includes("pioneer")
      ),
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
    validator: (trees) =>
      trees.filter((t) => t.tags?.includes("nitrogen-fixing")),
  },
];

export default function ScavengerHuntClient({
  trees,
  locale,
}: ScavengerHuntClientProps) {
  const [view, setView] = useState<"setup" | "hunt" | "mission" | "results">(
    "setup"
  );
  const [session, setSession] = useState<HuntSession | null>(null);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [_missionAnswer, setMissionAnswer] = useState<string>("");
  const [showHint, setShowHint] = useState(false);
  const [missionTimer, setMissionTimer] = useState<number | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Setup state
  const [teamCount, setTeamCount] = useState(2);
  const [teamNames, setTeamNames] = useState<string[]>(["", ""]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[][]>([[], []]);
  const [difficulty, setDifficulty] = useState<
    "easy" | "medium" | "hard" | "mixed"
  >("mixed");
  const [missionCount, setMissionCount] = useState(5);
  const [newMemberName, setNewMemberName] = useState("");
  const [editingTeam, setEditingTeam] = useState<number | null>(null);

  // Create storage instance with error handling
  const huntStorage = useMemo(
    () =>
      createStorage({
        key: STORAGE_KEY,
        schema: huntSessionSchema,
        onError: (error) => {
          setStorageError(
            locale === "es"
              ? "Se detectaron datos corruptos y fueron eliminados"
              : "Corrupted data was detected and cleared"
          );
        },
      }),
    [locale]
  );

  const t = {
    title: locale === "es" ? "Búsqueda del Tesoro 🗺️" : "Scavenger Hunt 🗺️",
    subtitle:
      locale === "es"
        ? "¡Encuentra árboles con características específicas y gana puntos!"
        : "Find trees with specific characteristics and earn points!",
    backToEducation:
      locale === "es" ? "← Volver a Educación" : "← Back to Education",
    setupTeams: locale === "es" ? "Configurar Equipos" : "Setup Teams",
    teamCount: locale === "es" ? "Número de Equipos" : "Number of Teams",
    teamName: locale === "es" ? "Nombre del Equipo" : "Team Name",
    teamNamePlaceholder:
      locale === "es" ? "Ej: Los Jaguares" : "E.g. The Jaguars",
    addMember: locale === "es" ? "Agregar Miembro" : "Add Member",
    memberName: locale === "es" ? "Nombre del Miembro" : "Member Name",
    memberPlaceholder:
      locale === "es" ? "Nombre del estudiante" : "Student name",
    difficulty: locale === "es" ? "Dificultad" : "Difficulty",
    easy: locale === "es" ? "Fácil" : "Easy",
    medium: locale === "es" ? "Medio" : "Medium",
    hard: locale === "es" ? "Difícil" : "Hard",
    mixed: locale === "es" ? "Mixto" : "Mixed",
    missionCount: locale === "es" ? "Número de Misiones" : "Number of Missions",
    startHunt: locale === "es" ? "🎯 Comenzar Búsqueda" : "🎯 Start Hunt",
    currentTeam: locale === "es" ? "Turno del Equipo" : "Current Team",
    selectMission:
      locale === "es" ? "Selecciona una Misión" : "Select a Mission",
    points: locale === "es" ? "puntos" : "points",
    completed: locale === "es" ? "completada" : "completed",
    hint: locale === "es" ? "Pista" : "Hint",
    showHint:
      locale === "es" ? "Mostrar Pista (-20 pts)" : "Show Hint (-20 pts)",
    searchTrees: locale === "es" ? "Buscar árboles..." : "Search trees...",
    selectTree: locale === "es" ? "Seleccionar este árbol" : "Select this tree",
    submitAnswer: locale === "es" ? "Enviar Respuesta" : "Submit Answer",
    correct: locale === "es" ? "¡Correcto! 🎉" : "Correct! 🎉",
    incorrect: locale === "es" ? "¡Inténtalo de nuevo!" : "Try again!",
    skipMission: locale === "es" ? "Saltar Misión" : "Skip Mission",
    nextTeam: locale === "es" ? "Siguiente Equipo" : "Next Team",
    leaderboard: locale === "es" ? "Tabla de Posiciones" : "Leaderboard",
    endHunt: locale === "es" ? "Terminar Búsqueda" : "End Hunt",
    winner: locale === "es" ? "¡Ganador!" : "Winner!",
    finalResults: locale === "es" ? "Resultados Finales" : "Final Results",
    playAgain: locale === "es" ? "Jugar de Nuevo" : "Play Again",
    streak: locale === "es" ? "Racha" : "Streak",
    bonus: locale === "es" ? "Bonus" : "Bonus",
    missionsCompleted:
      locale === "es" ? "Misiones Completadas" : "Missions Completed",
    timeLeft: locale === "es" ? "Tiempo restante" : "Time left",
    noResults: locale === "es" ? "No se encontraron árboles" : "No trees found",
    matchingTrees: locale === "es" ? "árboles coinciden" : "trees match",
    remove: locale === "es" ? "Quitar" : "Remove",
    members: locale === "es" ? "miembros" : "members",
  };

  // Load saved session
  useEffect(() => {
    injectEducationStyles();
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        dispatch({ type: "LOAD_SESSION", payload: data });
      }
    } catch (e) {
      console.error("Failed to load session:", e);
    }
  }, [huntStorage]);

  // Save session
  useEffect(() => {
    if (state.session) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.session));
      } catch (e) {
        console.error("Failed to save session:", e);
      }
    }
  }, [state.session]);

  // Mission timer
  useEffect(() => {
    if (state.missionTimer === null || state.missionTimer <= 0) return;

    const interval = setInterval(() => {
      dispatch({
        type: "SET_TIMER",
        payload: state.missionTimer !== null ? state.missionTimer - 1 : null,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.missionTimer]);

  const handleTeamCountChange = (count: number) => {
    dispatch({ type: "SET_TEAM_COUNT", payload: count });
  };

  const addTeamMember = (teamIndex: number) => {
    if (!state.setup.newMemberName.trim()) return;

    const member = {
      id: Date.now().toString(),
      name: state.setup.newMemberName.trim(),
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    };

    dispatch({ type: "ADD_TEAM_MEMBER", payload: { teamIndex, member } });
  };

  const removeTeamMember = (teamIndex: number, memberId: string) => {
    dispatch({ type: "REMOVE_TEAM_MEMBER", payload: { teamIndex, memberId } });
  };

  const startHunt = () => {
    // Filter missions by difficulty
    const availableMissions = MISSIONS.filter(
      (m) =>
        state.setup.difficulty === "mixed" ||
        m.difficulty === state.setup.difficulty
    );

    // Randomly select missions
    const shuffled = [...availableMissions].sort(() => Math.random() - 0.5);
    const selectedMissions = shuffled.slice(0, state.setup.missionCount);

    const newSession: HuntSession = {
      teams: state.setup.teamNames.map((name, i) => ({
        id: `team-${i}`,
        name: name || `${locale === "es" ? "Equipo" : "Team"} ${i + 1}`,
        color: TEAM_COLORS[i % TEAM_COLORS.length].name,
        members: state.setup.teamMembers[i],
        completedMissions: [],
        totalPoints: 0,
        streak: 0,
      })),
      currentTeamIndex: 0,
      startTime: new Date().toISOString(),
      difficulty: state.setup.difficulty,
      activeMissions: selectedMissions.map((m) => m.id),
      completedMissions: [],
    };

    dispatch({ type: "START_SESSION", payload: newSession });
  };

  const selectMissionHandler = (mission: Mission) => {
    dispatch({ type: "SELECT_MISSION", payload: mission.id });
    dispatch({
      type: "SET_TIMER",
      payload: mission.timeLimit ? mission.timeLimit * 60 : null,
    });
  };

  const submitMissionAnswer = (treeSlug: string) => {
    if (!state.session || !state.selectedMission) return;

    const mission = MISSIONS.find((m) => m.id === state.selectedMission);
    if (!mission) return;

    const validTrees = mission.validator(trees);
    const isCorrect = validTrees.some((t) => t.slug === treeSlug);

    if (isCorrect) {
      dispatch({
        type: "COMPLETE_MISSION",
        payload: {
          missionId: mission.id,
          treeSlug,
          points: mission.points,
        },
      });
      triggerConfetti();
    }
  };

  const skipMission = () => {
    dispatch({ type: "SKIP_MISSION" });
  };

  const endHunt = () => {
    dispatch({ type: "END_SESSION" });
  };

  const resetHunt = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear hunt data:", e);
    }
    dispatch({ type: "RESET" });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Setup view
  if (state.view === "setup") {
    return (
      <div className="py-8 px-4 min-h-screen bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/20">
        {/* Storage Error Alert */}
        {storageError && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-400 px-4 py-3 fixed top-4 left-1/2 transform -translate-x-1/2 z-50 rounded-lg shadow-lg max-w-md">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm">{storageError}</p>
              <button
                onClick={() => setStorageError(null)}
                className="text-sm underline hover:no-underline"
              >
                {locale === "es" ? "Cerrar" : "Dismiss"}
              </button>
            </div>
          </div>
        )}

        <div className="container mx-auto max-w-4xl">
          <Link
            href="/education"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
          >
            {t.backToEducation}
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t.title}
            </h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>

          <div className="bg-card rounded-2xl p-8 border border-border shadow-lg space-y-8">
            {/* Team Count */}
            <div>
              <label className="block text-sm font-medium mb-3">
                {t.teamCount}
              </label>
              <div className="flex gap-2">
                {[2, 3, 4].map((count) => (
                  <button
                    key={count}
                    onClick={() => handleTeamCountChange(count)}
                    className={`flex-1 py-3 rounded-lg border transition-all font-medium ${
                      state.setup.teamCount === count
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {count} {locale === "es" ? "Equipos" : "Teams"}
                  </button>
                ))}
              </div>
            </div>

            {/* Teams */}
            <div className="space-y-4">
              {Array.from({ length: state.setup.teamCount }).map((_, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border ${TEAM_COLORS[i % TEAM_COLORS.length].light} border-${TEAM_COLORS[i % TEAM_COLORS.length].name}-200`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-4 h-4 rounded-full ${TEAM_COLORS[i % TEAM_COLORS.length].bg}`}
                    />
                    <input
                      type="text"
                      placeholder={`${t.teamNamePlaceholder} ${i + 1}`}
                      value={state.setup.teamNames[i]}
                      onChange={(e) => {
                        dispatch({
                          type: "UPDATE_TEAM_NAME",
                          payload: { index: i, name: e.target.value },
                        });
                      }}
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-background"
                    />
                  </div>

                  {/* Members */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {state.setup.teamMembers[i].map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-1 px-3 py-1 bg-background rounded-full border border-border"
                      >
                        <span>{member.avatar}</span>
                        <span className="text-sm">{member.name}</span>
                        <button
                          onClick={() => removeTeamMember(i, member.id)}
                          className="ml-1 text-muted-foreground hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {state.setup.editingTeam === i ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={t.memberPlaceholder}
                        value={state.setup.newMemberName}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_NEW_MEMBER_NAME",
                            payload: e.target.value,
                          })
                        }
                        onKeyDown={(e) => e.key === "Enter" && addTeamMember(i)}
                        className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                        autoFocus
                      />
                      <button
                        onClick={() => addTeamMember(i)}
                        className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
                      >
                        +
                      </button>
                      <button
                        onClick={() =>
                          dispatch({ type: "SET_EDITING_TEAM", payload: null })
                        }
                        className="px-3 py-2 border border-border rounded-lg text-sm"
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        dispatch({ type: "SET_EDITING_TEAM", payload: i })
                      }
                      className="text-sm text-primary hover:underline"
                    >
                      + {t.addMember}
                    </button>
                  )}

                  <div className="text-xs text-muted-foreground mt-2">
                    {state.setup.teamMembers[i].length} {t.members}
                  </div>
                </div>
              ))}
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium mb-3">
                {t.difficulty}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["easy", "medium", "hard", "mixed"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() =>
                      dispatch({
                        type: "UPDATE_SETUP",
                        payload: { difficulty: d },
                      })
                    }
                    className={`py-3 rounded-lg border transition-all text-sm font-medium ${
                      state.setup.difficulty === d
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {d === "easy" && "🟢"} {d === "medium" && "🟡"}{" "}
                    {d === "hard" && "🔴"} {d === "mixed" && "🎲"}
                    <br />
                    {t[d]}
                  </button>
                ))}
              </div>
            </div>

            {/* Mission Count */}
            <div>
              <label className="block text-sm font-medium mb-3">
                {t.missionCount}
              </label>
              <div className="flex gap-2">
                {[3, 5, 7, 10].map((count) => (
                  <button
                    key={count}
                    onClick={() =>
                      dispatch({
                        type: "UPDATE_SETUP",
                        payload: { missionCount: count },
                      })
                    }
                    className={`flex-1 py-3 rounded-lg border transition-all font-medium ${
                      state.setup.missionCount === count
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startHunt}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-orange-600 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {t.startHunt}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Hunt view (mission selection)
  if (state.view === "hunt" && state.session) {
    const currentTeam = state.session.teams[state.session.currentTeamIndex];
    const teamColor =
      TEAM_COLORS.find((c) => c.name === currentTeam.color) || TEAM_COLORS[0];
    const availableMissions = MISSIONS.filter((m) =>
      state.session!.activeMissions.includes(m.id)
    );

    return (
      <div className="py-8 px-4 min-h-screen bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/20">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/education"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
          >
            {t.backToEducation}
          </Link>

          {/* Current Team Banner */}
          <div
            className={`${teamColor.light} rounded-2xl p-6 mb-6 border border-${currentTeam.color}-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.currentTeam}</p>
                <h2 className={`text-2xl font-bold ${teamColor.text}`}>
                  {currentTeam.name}
                </h2>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span>
                    🏆 {currentTeam.totalPoints} {t.points}
                  </span>
                  {currentTeam.streak > 0 && (
                    <span className="text-orange-500">
                      🔥 {t.streak}: {currentTeam.streak}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                {currentTeam.members.slice(0, 4).map((m) => (
                  <span key={m.id} className="text-2xl" title={m.name}>
                    {m.avatar}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard Mini */}
          <div className="bg-card rounded-xl p-4 mb-6 border border-border">
            <h3 className="text-sm font-medium mb-3">{t.leaderboard}</h3>
            <div className="flex gap-4">
              {[...state.session.teams]
                .sort((a, b) => b.totalPoints - a.totalPoints)
                .map((team, i) => {
                  const color = TEAM_COLORS.find((c) => c.name === team.color);
                  return (
                    <div key={team.id} className="flex items-center gap-2">
                      <span className="font-bold">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                      </span>
                      <div className={`w-3 h-3 rounded-full ${color?.bg}`} />
                      <span className="text-sm">{team.name}</span>
                      <span className="text-sm font-medium">
                        {team.totalPoints}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Mission Selection */}
          <h2 className="text-xl font-semibold mb-4">{t.selectMission}</h2>

          <div className="grid gap-4 md:grid-cols-2">
            {availableMissions.map((mission) => (
              <button
                key={mission.id}
                onClick={() => selectMissionHandler(mission)}
                className="bg-card rounded-xl p-5 border border-border hover:border-primary/50 hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{mission.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {mission.title[locale as "en" | "es"]}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          mission.difficulty === "easy"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : mission.difficulty === "medium"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {t[mission.difficulty]}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {mission.description[locale as "en" | "es"]}
                    </p>
                    <p className="text-sm font-medium text-primary mt-2">
                      +{mission.points} {t.points}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Progress */}
          <div className="mt-8 bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between text-sm">
              <span>
                {t.missionsCompleted}: {state.session.completedMissions.length}/
                {state.session.activeMissions.length +
                  state.session.completedMissions.length}
              </span>
              <button
                onClick={endHunt}
                className="text-red-500 hover:text-red-600"
              >
                {t.endHunt}
              </button>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                style={{
                  width: `${(state.session.completedMissions.length / (state.session.activeMissions.length + state.session.completedMissions.length)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mission view
  if (state.view === "mission" && state.session && state.selectedMission) {
    const mission = MISSIONS.find((m) => m.id === state.selectedMission);
    if (!mission) return null;

    const validTrees = mission.validator(trees);
    const filteredTrees = trees.filter(
      (tree) =>
        tree.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        tree.scientificName
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase())
    );

    return (
      <div className="py-8 px-4 min-h-screen bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/20">
        <div className="container mx-auto max-w-4xl">
          <button
            onClick={() => dispatch({ type: "SET_VIEW", payload: "hunt" })}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
          >
            ← {locale === "es" ? "Volver a Misiones" : "Back to Missions"}
          </button>

          {/* Mission Header */}
          <div className="bg-card rounded-2xl p-6 mb-6 border border-border">
            <div className="flex items-start gap-4">
              <span className="text-5xl">{mission.icon}</span>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-1">
                  {mission.title[locale as "en" | "es"]}
                </h1>
                <p className="text-muted-foreground mb-3">
                  {mission.description[locale as "en" | "es"]}
                </p>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                    +{mission.points} {t.points}
                  </span>
                  {state.missionTimer !== null && (
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        state.missionTimer < 60
                          ? "bg-red-100 text-red-700"
                          : "bg-muted"
                      }`}
                    >
                      ⏱️ {t.timeLeft}: {formatTime(state.missionTimer)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Hint */}
            {!state.showHint ? (
              <button
                onClick={() => dispatch({ type: "TOGGLE_HINT" })}
                className="mt-4 text-sm text-muted-foreground hover:text-primary"
              >
                💡 {t.showHint}
              </button>
            ) : (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  💡 {mission.hint[locale as "en" | "es"]}
                </p>
              </div>
            )}
          </div>

          {/* Tree Selection */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="mb-4">
              <input
                type="text"
                placeholder={t.searchTrees}
                value={state.searchQuery}
                onChange={(e) =>
                  dispatch({
                    type: "SET_SEARCH_QUERY",
                    payload: e.target.value,
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {validTrees.length} {t.matchingTrees}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {filteredTrees.map((tree) => {
                const isValid = validTrees.some((t) => t.slug === tree.slug);
                return (
                  <button
                    key={tree.slug}
                    onClick={() => submitMissionAnswer(tree.slug)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isValid
                        ? "border-green-300 bg-green-50/50 dark:bg-green-900/10 hover:border-green-500"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {tree.featuredImage && (
                        <div className="w-12 h-12 relative rounded-lg overflow-hidden shrink-0">
                          <Image
                            src={tree.featuredImage}
                            alt={tree.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {tree.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate italic">
                          {tree.scientificName}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredTrees.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {t.noResults}
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={skipMission}
              className="text-sm text-muted-foreground hover:text-red-500"
            >
              {t.skipMission}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results view
  if (state.view === "results" && state.session) {
    const sortedTeams = [...state.session.teams].sort(
      (a, b) => b.totalPoints - a.totalPoints
    );
    const winner = sortedTeams[0];

    return (
      <div className="py-8 px-4 min-h-screen bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/20">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">🏆 {t.finalResults}</h1>
            <div className="text-6xl mb-4">
              {sortedTeams.length > 1 &&
              sortedTeams[0].totalPoints > sortedTeams[1].totalPoints
                ? "🎉"
                : "🤝"}
            </div>
          </div>

          {/* Winner */}
          <div className="bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-2xl p-8 mb-8 border-2 border-amber-300 dark:border-amber-700 text-center">
            <p className="text-sm text-amber-700 dark:text-amber-400 mb-2">
              {t.winner}
            </p>
            <h2 className="text-3xl font-bold text-amber-800 dark:text-amber-200 mb-2">
              {winner.name}
            </h2>
            <p className="text-4xl font-bold text-amber-600">
              {winner.totalPoints} {t.points}
            </p>
            <div className="flex justify-center gap-2 mt-4">
              {winner.members.map((m) => (
                <span key={m.id} className="text-3xl" title={m.name}>
                  {m.avatar}
                </span>
              ))}
            </div>
          </div>

          {/* All Teams */}
          <div className="space-y-4 mb-8">
            {sortedTeams.map((team, i) => {
              const color = TEAM_COLORS.find((c) => c.name === team.color);
              return (
                <div
                  key={team.id}
                  className={`${color?.light} rounded-xl p-4 border border-border flex items-center gap-4`}
                >
                  <span className="text-3xl">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅"}
                  </span>
                  <div className={`w-4 h-4 rounded-full ${color?.bg}`} />
                  <div className="flex-1">
                    <h3 className="font-semibold">{team.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {team.completedMissions.length} {t.missionsCompleted}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{team.totalPoints}</p>
                    <p className="text-xs text-muted-foreground">{t.points}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={resetHunt}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all"
            >
              {t.playAgain}
            </button>
            <Link
              href="/education"
              className="px-8 py-3 border border-border rounded-xl font-semibold hover:bg-muted transition-all"
            >
              {t.backToEducation}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
