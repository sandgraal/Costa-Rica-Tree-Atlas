"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "@i18n/navigation";
import Image from "next/image";
import { triggerConfetti, injectEducationStyles } from "@/lib/education";
import { createStorage, adoptedTreeSchema } from "@/lib/storage";
import { useDebounce } from "@/hooks/useDebounce";

interface Tree {
  title: string;
  scientificName: string;
  family: string;
  slug: string;
  featuredImage?: string;
  floweringSeason?: string[];
  fruitingSeason?: string[];
  maxHeight?: string;
}

interface JournalEntry {
  id: string;
  date: string;
  weather: "sunny" | "cloudy" | "rainy" | "stormy" | "foggy";
  temperature?: string;
  observation: string;
  leafStatus: "green" | "yellowing" | "bare" | "budding" | "full";
  hasFlowers: boolean;
  hasFruits: boolean;
  wildlife: string[];
  photo?: string;
  height?: string;
  circumference?: string;
  mood: "excited" | "curious" | "peaceful" | "amazed" | "thoughtful";
}

interface AdoptedTree {
  slug: string;
  nickname: string;
  adoptedDate: string;
  location: string;
  entries: JournalEntry[];
  badges: string[];
  totalObservations: number;
}

interface TreeJournalClientProps {
  trees: Tree[];
  locale: string;
}

const JOURNAL_STORAGE_KEY = "costa-rica-tree-atlas-tree-journal";

const WEATHER_OPTIONS = [
  { value: "sunny", emoji: "☀️", label: { en: "Sunny", es: "Soleado" } },
  { value: "cloudy", emoji: "☁️", label: { en: "Cloudy", es: "Nublado" } },
  { value: "rainy", emoji: "🌧️", label: { en: "Rainy", es: "Lluvioso" } },
  { value: "stormy", emoji: "⛈️", label: { en: "Stormy", es: "Tormentoso" } },
  { value: "foggy", emoji: "🌫️", label: { en: "Foggy", es: "Neblinoso" } },
];

const LEAF_STATUS_OPTIONS = [
  {
    value: "green",
    emoji: "🌿",
    label: { en: "Full Green", es: "Verde Completo" },
  },
  {
    value: "yellowing",
    emoji: "🍂",
    label: { en: "Yellowing", es: "Amarillento" },
  },
  { value: "bare", emoji: "🪵", label: { en: "Bare", es: "Sin Hojas" } },
  { value: "budding", emoji: "🌱", label: { en: "Budding", es: "Brotando" } },
  {
    value: "full",
    emoji: "🌳",
    label: { en: "Full Foliage", es: "Follaje Completo" },
  },
];

const MOOD_OPTIONS = [
  {
    value: "excited",
    emoji: "🤩",
    label: { en: "Excited", es: "Emocionado/a" },
  },
  { value: "curious", emoji: "🤔", label: { en: "Curious", es: "Curioso/a" } },
  {
    value: "peaceful",
    emoji: "😌",
    label: { en: "Peaceful", es: "Tranquilo/a" },
  },
  { value: "amazed", emoji: "😲", label: { en: "Amazed", es: "Asombrado/a" } },
  {
    value: "thoughtful",
    emoji: "🧐",
    label: { en: "Thoughtful", es: "Pensativo/a" },
  },
];

const WILDLIFE_OPTIONS = [
  { value: "birds", emoji: "🐦", label: { en: "Birds", es: "Aves" } },
  {
    value: "butterflies",
    emoji: "🦋",
    label: { en: "Butterflies", es: "Mariposas" },
  },
  { value: "insects", emoji: "🐛", label: { en: "Insects", es: "Insectos" } },
  {
    value: "squirrels",
    emoji: "🐿️",
    label: { en: "Squirrels", es: "Ardillas" },
  },
  { value: "monkeys", emoji: "🐒", label: { en: "Monkeys", es: "Monos" } },
  { value: "lizards", emoji: "🦎", label: { en: "Lizards", es: "Lagartijas" } },
  { value: "bees", emoji: "🐝", label: { en: "Bees", es: "Abejas" } },
  { value: "frogs", emoji: "🐸", label: { en: "Frogs", es: "Ranas" } },
];

const BADGES = [
  {
    id: "first-entry",
    emoji: "📝",
    name: { en: "First Entry", es: "Primera Entrada" },
    requirement: 1,
  },
  {
    id: "week-streak",
    emoji: "🔥",
    name: { en: "Week Streak", es: "Racha Semanal" },
    requirement: 7,
  },
  {
    id: "botanist",
    emoji: "🔬",
    name: { en: "Junior Botanist", es: "Botánico Junior" },
    requirement: 10,
  },
  {
    id: "wildlife-spotter",
    emoji: "🦜",
    name: { en: "Wildlife Spotter", es: "Observador de Fauna" },
    requirement: 5,
  },
  {
    id: "flower-finder",
    emoji: "🌸",
    name: { en: "Flower Finder", es: "Buscador de Flores" },
    requirement: 1,
  },
  {
    id: "fruit-tracker",
    emoji: "🍎",
    name: { en: "Fruit Tracker", es: "Rastreador de Frutos" },
    requirement: 1,
  },
  {
    id: "all-weather",
    emoji: "🌦️",
    name: { en: "All Weather", es: "Todo Clima" },
    requirement: 5,
  },
  {
    id: "nature-master",
    emoji: "🏆",
    name: { en: "Nature Master", es: "Maestro de la Naturaleza" },
    requirement: 25,
  },
];

export default function TreeJournalClient({
  trees,
  locale,
}: TreeJournalClientProps) {
  const [adoptedTree, setAdoptedTree] = useState<AdoptedTree | null>(null);
  const [view, setView] = useState<
    "adopt" | "journal" | "timeline" | "badges" | "entry"
  >("adopt");
  const [selectedTreeSlug, setSelectedTreeSlug] = useState<string>("");
  const [nickname, setNickname] = useState("");
  const [location, setLocation] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newEntry, setNewEntry] = useState<Partial<JournalEntry>>({
    weather: "sunny",
    leafStatus: "green",
    hasFlowers: false,
    hasFruits: false,
    wildlife: [],
    mood: "curious",
  });
  const [newBadge, setNewBadge] = useState<string | null>(null);
  const [promptIndex, setPromptIndex] = useState(0);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Create storage instance with error handling
  const journalStorage = useMemo(
    () =>
      createStorage({
        key: JOURNAL_STORAGE_KEY,
        schema: adoptedTreeSchema,
        onError: (_error) => {
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
    title: locale === "es" ? "Diario del Árbol 🌳" : "Tree Journal 🌳",
    subtitle:
      locale === "es"
        ? "Adopta un árbol y observa cómo cambia durante el año"
        : "Adopt a tree and watch it change throughout the year",
    backToEducation:
      locale === "es" ? "← Volver a Educación" : "← Back to Education",
    adoptTree: locale === "es" ? "Adoptar un Árbol" : "Adopt a Tree",
    chooseTree: locale === "es" ? "Elige tu árbol" : "Choose your tree",
    nickname:
      locale === "es"
        ? "Dale un nombre a tu árbol"
        : "Give your tree a nickname",
    nicknamePlaceholder:
      locale === "es" ? "Ej: El Gran Roble" : "E.g. The Great Oak",
    location: locale === "es" ? "¿Dónde está tu árbol?" : "Where is your tree?",
    locationPlaceholder:
      locale === "es" ? "Ej: Patio de la escuela" : "E.g. School yard",
    startJournal: locale === "es" ? "🌱 Comenzar Diario" : "🌱 Start Journal",
    myJournal: locale === "es" ? "Mi Diario" : "My Journal",
    timeline: locale === "es" ? "Línea de Tiempo" : "Timeline",
    badges: locale === "es" ? "Insignias" : "Badges",
    newEntry: locale === "es" ? "📝 Nueva Entrada" : "📝 New Entry",
    searchTrees: locale === "es" ? "Buscar árboles..." : "Search trees...",
    weather:
      locale === "es" ? "¿Cómo está el clima?" : "What's the weather like?",
    leafStatus: locale === "es" ? "Estado de las hojas" : "Leaf Status",
    flowers: locale === "es" ? "¿Hay flores?" : "Any flowers?",
    fruits: locale === "es" ? "¿Hay frutos?" : "Any fruits?",
    wildlife:
      locale === "es" ? "¿Qué animales viste?" : "What wildlife did you see?",
    observation: locale === "es" ? "Tu observación" : "Your observation",
    observationPlaceholder:
      locale === "es"
        ? "Escribe lo que observaste hoy..."
        : "Write what you observed today...",
    mood: locale === "es" ? "¿Cómo te sientes?" : "How do you feel?",
    height:
      locale === "es"
        ? "Altura estimada (metros)"
        : "Estimated height (meters)",
    circumference:
      locale === "es"
        ? "Circunferencia del tronco (cm)"
        : "Trunk circumference (cm)",
    saveEntry: locale === "es" ? "💾 Guardar Entrada" : "💾 Save Entry",
    cancel: locale === "es" ? "Cancelar" : "Cancel",
    adoptedOn: locale === "es" ? "Adoptado el" : "Adopted on",
    totalEntries: locale === "es" ? "entradas totales" : "total entries",
    viewDetails: locale === "es" ? "Ver en el Atlas" : "View in Atlas",
    yes: locale === "es" ? "Sí" : "Yes",
    no: locale === "es" ? "No" : "No",
    prompt: locale === "es" ? "💡 Sugerencia del día" : "💡 Today's prompt",
    unlocked: locale === "es" ? "Desbloqueada" : "Unlocked",
    locked: locale === "es" ? "Bloqueada" : "Locked",
    progress: locale === "es" ? "Progreso" : "Progress",
    congratsNewBadge:
      locale === "es" ? "¡Nueva insignia desbloqueada!" : "New badge unlocked!",
    resetJournal: locale === "es" ? "Reiniciar Diario" : "Reset Journal",
    confirmReset:
      locale === "es"
        ? "¿Estás seguro? Esto borrará todos tus datos."
        : "Are you sure? This will delete all your data.",
    noEntries:
      locale === "es"
        ? "Aún no tienes entradas. ¡Haz tu primera observación!"
        : "No entries yet. Make your first observation!",
    seasonalTip: locale === "es" ? "Consejo estacional" : "Seasonal tip",
    scientificName: locale === "es" ? "Nombre científico" : "Scientific name",
    family: locale === "es" ? "Familia" : "Family",
  };

  const prompts =
    locale === "es"
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

  // Load saved data
  useEffect(() => {
    injectEducationStyles();
    if (typeof window === "undefined") return;

    const data = journalStorage.get();
    if (data) {
      setAdoptedTree(data);
      setView("journal");
    }

    // Rotate prompt daily
    const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    setPromptIndex(day % prompts.length);
  }, [journalStorage, prompts.length]);

  // Save data
  useEffect(() => {
    if (adoptedTree) {
      journalStorage.set(adoptedTree);
    }
  }, [adoptedTree, journalStorage]);

  const selectedTree = trees.find((t) => t.slug === selectedTreeSlug);
  const adoptedTreeData = trees.find((t) => t.slug === adoptedTree?.slug);

  // Filter trees using debounced search
  const filteredTrees = trees.filter(
    (tree) =>
      tree.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      tree.scientificName.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const checkBadges = useCallback((tree: AdoptedTree): string[] => {
    const newBadges: string[] = [];
    const entries = tree.entries;

    // First entry badge
    if (entries.length >= 1 && !tree.badges.includes("first-entry")) {
      newBadges.push("first-entry");
    }

    // Week streak (7+ entries)
    if (entries.length >= 7 && !tree.badges.includes("week-streak")) {
      newBadges.push("week-streak");
    }

    // Botanist (10+ entries)
    if (entries.length >= 10 && !tree.badges.includes("botanist")) {
      newBadges.push("botanist");
    }

    // Nature master (25+ entries)
    if (entries.length >= 25 && !tree.badges.includes("nature-master")) {
      newBadges.push("nature-master");
    }

    // Wildlife spotter (5+ different wildlife observations)
    const allWildlife = new Set(entries.flatMap((e) => e.wildlife));
    if (allWildlife.size >= 5 && !tree.badges.includes("wildlife-spotter")) {
      newBadges.push("wildlife-spotter");
    }

    // Flower finder
    if (
      entries.some((e) => e.hasFlowers) &&
      !tree.badges.includes("flower-finder")
    ) {
      newBadges.push("flower-finder");
    }

    // Fruit tracker
    if (
      entries.some((e) => e.hasFruits) &&
      !tree.badges.includes("fruit-tracker")
    ) {
      newBadges.push("fruit-tracker");
    }

    // All weather (5 different weather conditions)
    const allWeather = new Set(entries.map((e) => e.weather));
    if (allWeather.size >= 5 && !tree.badges.includes("all-weather")) {
      newBadges.push("all-weather");
    }

    return newBadges;
  }, []);

  const handleAdopt = () => {
    if (!selectedTreeSlug || !nickname || !location) return;

    const newTree: AdoptedTree = {
      slug: selectedTreeSlug,
      nickname,
      adoptedDate: new Date().toISOString(),
      location,
      entries: [],
      badges: [],
      totalObservations: 0,
    };

    setAdoptedTree(newTree);
    setView("journal");
  };

  const handleSaveEntry = () => {
    if (!adoptedTree || !newEntry.observation) return;

    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      weather: newEntry.weather as JournalEntry["weather"],
      temperature: newEntry.temperature,
      observation: newEntry.observation,
      leafStatus: newEntry.leafStatus as JournalEntry["leafStatus"],
      hasFlowers: newEntry.hasFlowers || false,
      hasFruits: newEntry.hasFruits || false,
      wildlife: newEntry.wildlife || [],
      mood: newEntry.mood as JournalEntry["mood"],
      height: newEntry.height,
      circumference: newEntry.circumference,
    };

    const updatedTree = {
      ...adoptedTree,
      entries: [entry, ...adoptedTree.entries],
      totalObservations: adoptedTree.totalObservations + 1,
    };

    // Check for new badges
    const earnedBadges = checkBadges(updatedTree);
    if (earnedBadges.length > 0) {
      updatedTree.badges = [...updatedTree.badges, ...earnedBadges];
      setNewBadge(earnedBadges[0]);
      triggerConfetti();
    }

    setAdoptedTree(updatedTree);
    setNewEntry({
      weather: "sunny",
      leafStatus: "green",
      hasFlowers: false,
      hasFruits: false,
      wildlife: [],
      mood: "curious",
    });
    setView("journal");
  };

  const handleReset = () => {
    if (window.confirm(t.confirmReset)) {
      journalStorage.clear();
      setAdoptedTree(null);
      setView("adopt");
      setSelectedTreeSlug("");
      setNickname("");
      setLocation("");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === "es" ? "es-CR" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Render adopt view
  if (view === "adopt" && !adoptedTree) {
    return (
      <div className="py-8 px-4 min-h-screen bg-gradient-to-b from-green-50/50 to-background dark:from-green-950/20">
        {/* Storage Error Alert */}
        {storageError && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-400 px-4 py-3 fixed top-4 left-1/2 transform -translate-x-1/2 z-50 rounded-lg shadow-lg max-w-md">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm">{storageError}</p>
              <button
                onClick={() => {
                  setStorageError(null);
                }}
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

          <div className="bg-card rounded-2xl p-8 border border-border shadow-lg">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="text-2xl">🌱</span> {t.adoptTree}
            </h2>

            {/* Tree Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                {t.chooseTree}
              </label>
              <input
                type="text"
                placeholder={t.searchTrees}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary mb-4"
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
                {filteredTrees.slice(0, 18).map((tree) => (
                  <button
                    key={tree.slug}
                    onClick={() => {
                      setSelectedTreeSlug(tree.slug);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedTreeSlug === tree.slug
                        ? "border-primary bg-primary/10 ring-2 ring-primary/50"
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
                ))}
              </div>
            </div>

            {/* Nickname */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                {t.nickname}
              </label>
              <input
                type="text"
                placeholder={t.nicknamePlaceholder}
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                }}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>

            {/* Location */}
            <div className="mb-8">
              <label className="block text-sm font-medium mb-2">
                {t.location}
              </label>
              <input
                type="text"
                placeholder={t.locationPlaceholder}
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                }}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>

            {/* Selected Tree Preview */}
            {selectedTree && (
              <div className="mb-8 p-4 bg-primary/5 rounded-xl border border-primary/20">
                <div className="flex items-center gap-4">
                  {selectedTree.featuredImage && (
                    <div className="w-20 h-20 relative rounded-xl overflow-hidden">
                      <Image
                        src={selectedTree.featuredImage}
                        alt={selectedTree.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedTree.title}
                    </h3>
                    <p className="text-sm text-muted-foreground italic">
                      {selectedTree.scientificName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t.family}: {selectedTree.family}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleAdopt}
              disabled={!selectedTreeSlug || !nickname || !location}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {t.startJournal}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render new entry form
  if (view === "entry" && adoptedTree) {
    return (
      <div className="py-8 px-4 min-h-screen bg-gradient-to-b from-green-50/50 to-background dark:from-green-950/20">
        <div className="container mx-auto max-w-2xl">
          <button
            onClick={() => {
              setView("journal");
            }}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
          >
            ← {t.cancel}
          </button>

          <h1 className="text-2xl font-bold mb-6">{t.newEntry}</h1>

          {/* Daily Prompt */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
              <span>💡</span> {t.prompt}:
            </p>
            <p className="text-yellow-700 dark:text-yellow-300 mt-1">
              {prompts[promptIndex]}
            </p>
          </div>

          <div className="space-y-6 bg-card rounded-2xl p-6 border border-border">
            {/* Weather */}
            <div>
              <label className="block text-sm font-medium mb-3">
                {t.weather}
              </label>
              <div className="flex flex-wrap gap-2">
                {WEATHER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      setNewEntry((prev) => ({
                        ...prev,
                        weather: option.value as JournalEntry["weather"],
                      }))
                    }
                    className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                      newEntry.weather === option.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span>{option.emoji}</span>
                    <span className="text-sm">
                      {option.label[locale as "en" | "es"]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Leaf Status */}
            <div>
              <label className="block text-sm font-medium mb-3">
                {t.leafStatus}
              </label>
              <div className="flex flex-wrap gap-2">
                {LEAF_STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      setNewEntry((prev) => ({
                        ...prev,
                        leafStatus: option.value as JournalEntry["leafStatus"],
                      }))
                    }
                    className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                      newEntry.leafStatus === option.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span>{option.emoji}</span>
                    <span className="text-sm">
                      {option.label[locale as "en" | "es"]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Flowers & Fruits */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-3">
                  {t.flowers}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setNewEntry((prev) => ({ ...prev, hasFlowers: true }));
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                      newEntry.hasFlowers
                        ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20"
                        : "border-border"
                    }`}
                  >
                    🌸 {t.yes}
                  </button>
                  <button
                    onClick={() => {
                      setNewEntry((prev) => ({ ...prev, hasFlowers: false }));
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                      !newEntry.hasFlowers
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                  >
                    {t.no}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-3">
                  {t.fruits}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setNewEntry((prev) => ({ ...prev, hasFruits: true }));
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                      newEntry.hasFruits
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                        : "border-border"
                    }`}
                  >
                    🍎 {t.yes}
                  </button>
                  <button
                    onClick={() => {
                      setNewEntry((prev) => ({ ...prev, hasFruits: false }));
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                      !newEntry.hasFruits
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                  >
                    {t.no}
                  </button>
                </div>
              </div>
            </div>

            {/* Wildlife */}
            <div>
              <label className="block text-sm font-medium mb-3">
                {t.wildlife}
              </label>
              <div className="flex flex-wrap gap-2">
                {WILDLIFE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      const current = newEntry.wildlife || [];
                      const updated = current.includes(option.value)
                        ? current.filter((w) => w !== option.value)
                        : [...current, option.value];
                      setNewEntry((prev) => ({ ...prev, wildlife: updated }));
                    }}
                    className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                      newEntry.wildlife?.includes(option.value)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span>{option.emoji}</span>
                    <span className="text-sm">
                      {option.label[locale as "en" | "es"]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div>
              <label className="block text-sm font-medium mb-3">{t.mood}</label>
              <div className="flex flex-wrap gap-2">
                {MOOD_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      setNewEntry((prev) => ({
                        ...prev,
                        mood: option.value as JournalEntry["mood"],
                      }))
                    }
                    className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                      newEntry.mood === option.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="text-xl">{option.emoji}</span>
                    <span className="text-sm">
                      {option.label[locale as "en" | "es"]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Measurements */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t.height}
                </label>
                <input
                  type="text"
                  value={newEntry.height || ""}
                  onChange={(e) => {
                    setNewEntry((prev) => ({
                      ...prev,
                      height: e.target.value,
                    }));
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  placeholder="~"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t.circumference}
                </label>
                <input
                  type="text"
                  value={newEntry.circumference || ""}
                  onChange={(e) =>
                    setNewEntry((prev) => ({
                      ...prev,
                      circumference: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  placeholder="~"
                />
              </div>
            </div>

            {/* Observation */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t.observation}
              </label>
              <textarea
                value={newEntry.observation || ""}
                onChange={(e) =>
                  setNewEntry((prev) => ({
                    ...prev,
                    observation: e.target.value,
                  }))
                }
                rows={5}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background resize-none focus:ring-2 focus:ring-primary/50"
                placeholder={t.observationPlaceholder}
              />
            </div>

            <button
              onClick={handleSaveEntry}
              disabled={!newEntry.observation}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {t.saveEntry}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main journal view
  if (adoptedTree && adoptedTreeData) {
    return (
      <div className="py-8 px-4 min-h-screen bg-gradient-to-b from-green-50/50 to-background dark:from-green-950/20">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/education"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
          >
            {t.backToEducation}
          </Link>

          {/* New Badge Modal */}
          {newBadge && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-card rounded-2xl p-8 max-w-sm text-center animate-bounce-in">
                <div className="text-6xl mb-4">
                  {BADGES.find((b) => b.id === newBadge)?.emoji}
                </div>
                <h3 className="text-xl font-bold mb-2">{t.congratsNewBadge}</h3>
                <p className="text-lg font-medium text-primary">
                  {
                    BADGES.find((b) => b.id === newBadge)?.name[
                      locale as "en" | "es"
                    ]
                  }
                </p>
                <button
                  onClick={() => {
                    setNewBadge(null);
                  }}
                  className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                  {locale === "es" ? "¡Genial!" : "Awesome!"}
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="bg-card rounded-2xl p-6 border border-border mb-6">
            <div className="flex items-start gap-4">
              {adoptedTreeData.featuredImage && (
                <div className="w-24 h-24 relative rounded-xl overflow-hidden shrink-0">
                  <Image
                    src={adoptedTreeData.featuredImage}
                    alt={adoptedTreeData.title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{adoptedTree.nickname}</h1>
                <p className="text-muted-foreground">{adoptedTreeData.title}</p>
                <p className="text-sm text-muted-foreground italic">
                  {adoptedTreeData.scientificName}
                </p>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                  <span>📍 {adoptedTree.location}</span>
                  <span>
                    📅 {t.adoptedOn}: {formatDate(adoptedTree.adoptedDate)}
                  </span>
                  <span>
                    📝 {adoptedTree.entries.length} {t.totalEntries}
                  </span>
                </div>
              </div>
              <Link
                href={`/trees/${adoptedTree.slug}`}
                className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm hover:bg-primary/20"
              >
                {t.viewDetails}
              </Link>
            </div>

            {/* Badges Preview */}
            {adoptedTree.badges.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  {adoptedTree.badges.slice(0, 5).map((badgeId) => {
                    const badge = BADGES.find((b) => b.id === badgeId);
                    return badge ? (
                      <span
                        key={badgeId}
                        className="text-2xl"
                        title={badge.name[locale as "en" | "es"]}
                      >
                        {badge.emoji}
                      </span>
                    ) : null;
                  })}
                  {adoptedTree.badges.length > 5 && (
                    <span className="text-sm text-muted-foreground">
                      +{adoptedTree.badges.length - 5}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setView("journal")}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                view === "journal"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border"
              }`}
            >
              📖 {t.myJournal}
            </button>
            <button
              onClick={() => {
                setView("timeline");
              }}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                view === "timeline"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border"
              }`}
            >
              📊 {t.timeline}
            </button>
            <button
              onClick={() => {
                setView("badges");
              }}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                view === "badges"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border"
              }`}
            >
              🏅 {t.badges}
            </button>
            <button
              onClick={() => {
                setView("entry");
              }}
              className="px-4 py-2 rounded-lg font-medium whitespace-nowrap bg-green-600 text-white hover:bg-green-700"
            >
              {t.newEntry}
            </button>
          </div>

          {/* Journal Entries */}
          {view === "journal" && (
            <div className="space-y-4">
              {/* Daily Prompt */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                  <span>💡</span> {t.prompt}:
                </p>
                <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                  {prompts[promptIndex]}
                </p>
              </div>

              {adoptedTree.entries.length === 0 ? (
                <div className="bg-card rounded-xl p-12 border border-border text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-muted-foreground">{t.noEntries}</p>
                  <button
                    onClick={() => setView("entry")}
                    className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg"
                  >
                    {t.newEntry}
                  </button>
                </div>
              ) : (
                adoptedTree.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-card rounded-xl p-6 border border-border"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-medium">{formatDate(entry.date)}</p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span>
                            {
                              WEATHER_OPTIONS.find(
                                (w) => w.value === entry.weather
                              )?.emoji
                            }
                          </span>
                          <span>
                            {
                              LEAF_STATUS_OPTIONS.find(
                                (l) => l.value === entry.leafStatus
                              )?.emoji
                            }
                          </span>
                          {entry.hasFlowers && <span>🌸</span>}
                          {entry.hasFruits && <span>🍎</span>}
                        </div>
                      </div>
                      <span className="text-2xl">
                        {
                          MOOD_OPTIONS.find((m) => m.value === entry.mood)
                            ?.emoji
                        }
                      </span>
                    </div>

                    <p className="text-foreground whitespace-pre-wrap">
                      {entry.observation}
                    </p>

                    {entry.wildlife.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {entry.wildlife.map((w) => (
                          <span
                            key={w}
                            className="px-2 py-1 bg-primary/10 rounded text-sm"
                          >
                            {
                              WILDLIFE_OPTIONS.find((opt) => opt.value === w)
                                ?.emoji
                            }{" "}
                            {
                              WILDLIFE_OPTIONS.find((opt) => opt.value === w)
                                ?.label[locale as "en" | "es"]
                            }
                          </span>
                        ))}
                      </div>
                    )}

                    {(entry.height || entry.circumference) && (
                      <div className="mt-3 text-sm text-muted-foreground">
                        {entry.height && <span>📏 {entry.height}m</span>}
                        {entry.height && entry.circumference && (
                          <span> • </span>
                        )}
                        {entry.circumference && (
                          <span>⭕ {entry.circumference}cm</span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Timeline View */}
          {view === "timeline" && (
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-xl font-semibold mb-6">{t.timeline}</h2>

              {adoptedTree.entries.length < 2 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>
                    {locale === "es"
                      ? "Necesitas al menos 2 entradas para ver la línea de tiempo"
                      : "You need at least 2 entries to see the timeline"}
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-6">
                    {adoptedTree.entries.map((entry, index) => (
                      <div key={entry.id} className="relative pl-14">
                        <div className="absolute left-4 w-5 h-5 rounded-full bg-primary border-4 border-background" />
                        <div className="text-sm text-muted-foreground mb-1">
                          {formatDate(entry.date)}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xl">
                            {
                              WEATHER_OPTIONS.find(
                                (w) => w.value === entry.weather
                              )?.emoji
                            }
                          </span>
                          <span className="text-xl">
                            {
                              LEAF_STATUS_OPTIONS.find(
                                (l) => l.value === entry.leafStatus
                              )?.emoji
                            }
                          </span>
                          {entry.hasFlowers && (
                            <span className="text-xl">🌸</span>
                          )}
                          {entry.hasFruits && (
                            <span className="text-xl">🍎</span>
                          )}
                          {entry.wildlife.map((w) => (
                            <span key={w} className="text-xl">
                              {
                                WILDLIFE_OPTIONS.find((opt) => opt.value === w)
                                  ?.emoji
                              }
                            </span>
                          ))}
                        </div>
                        {index === 0 && adoptedTree.entries.length > 1 && (
                          <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                            {locale === "es"
                              ? "↑ Más reciente"
                              : "↑ Most recent"}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Badges View */}
          {view === "badges" && (
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-xl font-semibold mb-6">{t.badges}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {BADGES.map((badge) => {
                  const unlocked = adoptedTree.badges.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        unlocked
                          ? "border-primary bg-primary/5"
                          : "border-border bg-muted/50 opacity-60"
                      }`}
                    >
                      <div
                        className={`text-4xl mb-2 ${unlocked ? "" : "grayscale"}`}
                      >
                        {badge.emoji}
                      </div>
                      <p className="font-medium text-sm">
                        {badge.name[locale as "en" | "es"]}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {unlocked
                          ? t.unlocked
                          : `${t.progress}: ${adoptedTree.entries.length}/${badge.requirement}`}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <button
                  onClick={handleReset}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  {t.resetJournal}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
