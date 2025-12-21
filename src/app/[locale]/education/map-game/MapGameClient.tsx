"use client";

import { useState, useEffect } from "react";
import { Link } from "@i18n/navigation";
import Image from "next/image";

interface Tree {
  title: string;
  scientificName: string;
  slug: string;
  nativeRegion?: string;
  tags?: string[];
  featuredImage?: string;
}

interface MapGameClientProps {
  trees: Tree[];
  locale: string;
}

interface Region {
  id: string;
  name: { en: string; es: string };
  path: string;
  color: string;
  description: { en: string; es: string };
  climate: { en: string; es: string };
  icon: string;
}

const REGIONS: Region[] = [
  {
    id: "central-valley",
    name: { en: "Central Valley", es: "Valle Central" },
    path: "M 180 180 L 220 170 L 250 185 L 240 215 L 200 220 L 175 200 Z",
    color: "#22c55e",
    description: {
      en: "Temperate highland climate with major cities",
      es: "Clima templado de tierras altas con ciudades principales",
    },
    climate: { en: "Temperate", es: "Templado" },
    icon: "🏔️",
  },
  {
    id: "caribbean",
    name: { en: "Caribbean Lowlands", es: "Llanuras del Caribe" },
    path: "M 250 100 L 350 80 L 380 150 L 350 200 L 280 190 L 250 150 Z",
    color: "#0ea5e9",
    description: {
      en: "Hot and humid rainforest region",
      es: "Región de selva tropical caliente y húmeda",
    },
    climate: { en: "Tropical Wet", es: "Tropical Húmedo" },
    icon: "🌴",
  },
  {
    id: "north-pacific",
    name: { en: "North Pacific", es: "Pacífico Norte" },
    path: "M 50 100 L 150 80 L 180 150 L 150 190 L 80 180 L 40 140 Z",
    color: "#f59e0b",
    description: {
      en: "Dry tropical forest with distinct seasons",
      es: "Bosque tropical seco con estaciones marcadas",
    },
    climate: { en: "Tropical Dry", es: "Tropical Seco" },
    icon: "🌵",
  },
  {
    id: "central-pacific",
    name: { en: "Central Pacific", es: "Pacífico Central" },
    path: "M 80 200 L 150 190 L 180 230 L 160 280 L 100 270 L 60 230 Z",
    color: "#84cc16",
    description: {
      en: "Coastal rainforest with beaches",
      es: "Selva costera con playas",
    },
    climate: { en: "Tropical Moist", es: "Tropical Húmedo" },
    icon: "🏖️",
  },
  {
    id: "south-pacific",
    name: { en: "South Pacific", es: "Pacífico Sur" },
    path: "M 160 280 L 220 260 L 280 300 L 260 350 L 180 340 L 140 310 Z",
    color: "#14b8a6",
    description: {
      en: "Pristine rainforests and Osa Peninsula",
      es: "Selvas vírgenes y Península de Osa",
    },
    climate: { en: "Tropical Very Wet", es: "Tropical Muy Húmedo" },
    icon: "🦜",
  },
  {
    id: "northern-zone",
    name: { en: "Northern Zone", es: "Zona Norte" },
    path: "M 150 60 L 250 50 L 280 100 L 250 140 L 180 130 L 140 90 Z",
    color: "#8b5cf6",
    description: {
      en: "Volcanic highlands and cloud forests",
      es: "Tierras altas volcánicas y bosques nubosos",
    },
    climate: { en: "Tropical Highland", es: "Tropical de Altura" },
    icon: "🌋",
  },
];

const MAP_GAME_STORAGE_KEY = "costa-rica-tree-atlas-map-game";

export default function MapGameClient({ trees, locale }: MapGameClientProps) {
  const [gameMode, setGameMode] = useState<"learn" | "quiz" | "results">(
    "learn"
  );
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questions, setQuestions] = useState<
    { tree: Tree; correctRegion: Region; options: Region[] }[]
  >([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [totalGames, setTotalGames] = useState(0);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem(MAP_GAME_STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setHighScore(data.highScore || 0);
      setTotalGames(data.totalGames || 0);
    }
  }, []);

  const t = {
    title:
      locale === "es" ? "Juego del Mapa de Costa Rica" : "Costa Rica Map Game",
    subtitle:
      locale === "es"
        ? "¿Dónde crecen los árboles de Costa Rica?"
        : "Where do Costa Rica's trees grow?",
    backToEducation:
      locale === "es" ? "← Volver a Educación" : "← Back to Education",
    learnMode: locale === "es" ? "📚 Aprender Regiones" : "📚 Learn Regions",
    quizMode: locale === "es" ? "🎯 Jugar Quiz" : "🎯 Play Quiz",
    selectRegion:
      locale === "es"
        ? "Haz clic en una región para aprender más"
        : "Click a region to learn more",
    climate: locale === "es" ? "Clima" : "Climate",
    treesFound:
      locale === "es" ? "Árboles encontrados aquí" : "Trees found here",
    close: locale === "es" ? "Cerrar" : "Close",
    question: locale === "es" ? "Pregunta" : "Question",
    whereGrows:
      locale === "es"
        ? "¿En qué región crece este árbol?"
        : "In which region does this tree grow?",
    correct: locale === "es" ? "¡Correcto!" : "Correct!",
    incorrect: locale === "es" ? "Incorrecto" : "Incorrect",
    theCorrectAnswer:
      locale === "es" ? "La respuesta correcta es" : "The correct answer is",
    nextQuestion: locale === "es" ? "Siguiente →" : "Next →",
    score: locale === "es" ? "Puntuación" : "Score",
    streak: locale === "es" ? "🔥 Racha" : "🔥 Streak",
    highScore: locale === "es" ? "Récord" : "High Score",
    quizComplete: locale === "es" ? "¡Quiz Completado!" : "Quiz Complete!",
    yourScore: locale === "es" ? "Tu puntuación" : "Your score",
    newHighScore: locale === "es" ? "🎉 ¡Nuevo Récord!" : "🎉 New High Score!",
    playAgain: locale === "es" ? "🔄 Jugar de Nuevo" : "🔄 Play Again",
    backToLearn: locale === "es" ? "📚 Volver a Aprender" : "📚 Back to Learn",
    points: locale === "es" ? "puntos" : "points",
    gamesPlayed: locale === "es" ? "partidas jugadas" : "games played",
    hint: locale === "es" ? "Pista" : "Hint",
    nativeRegion: locale === "es" ? "Región nativa" : "Native region",
    commonTrees: locale === "es" ? "Árboles comunes" : "Common trees",
  };

  // Map trees to regions based on their nativeRegion tag
  const getTreesForRegion = (regionId: string): Tree[] => {
    const regionKeywords: Record<string, string[]> = {
      "central-valley": [
        "central",
        "valle",
        "valley",
        "highlands",
        "altiplano",
      ],
      caribbean: ["caribbean", "caribe", "atlantic", "atlántico", "lowlands"],
      "north-pacific": ["guanacaste", "pacific", "pacífico", "dry", "seco"],
      "central-pacific": ["pacific", "pacífico", "coastal", "costero"],
      "south-pacific": ["osa", "south", "sur", "pacific", "pacífico"],
      "northern-zone": ["northern", "norte", "volcanic", "volcánico", "cloud"],
    };

    const keywords = regionKeywords[regionId] || [];
    return trees.filter((tree) => {
      const region = (tree.nativeRegion || "").toLowerCase();
      const tags = (tree.tags || []).map((t) => t.toLowerCase());
      return keywords.some(
        (kw) => region.includes(kw) || tags.some((tag) => tag.includes(kw))
      );
    });
  };

  const generateQuestions = () => {
    // Create questions for trees that have region data
    const questionsData: {
      tree: Tree;
      correctRegion: Region;
      options: Region[];
    }[] = [];

    REGIONS.forEach((region) => {
      const regionTrees = getTreesForRegion(region.id);
      regionTrees.slice(0, 2).forEach((tree) => {
        // Get 3 wrong options
        const wrongOptions = REGIONS.filter((r) => r.id !== region.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        // Combine with correct answer and shuffle
        const options = [...wrongOptions, region].sort(
          () => Math.random() - 0.5
        );

        questionsData.push({
          tree,
          correctRegion: region,
          options,
        });
      });
    });

    // If not enough region-specific trees, add generic questions
    if (questionsData.length < 10) {
      const genericTrees = trees
        .filter((t) => t.featuredImage)
        .sort(() => Math.random() - 0.5)
        .slice(0, 10 - questionsData.length);

      genericTrees.forEach((tree) => {
        const randomRegion =
          REGIONS[Math.floor(Math.random() * REGIONS.length)];
        const wrongOptions = REGIONS.filter((r) => r.id !== randomRegion.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        const options = [...wrongOptions, randomRegion].sort(
          () => Math.random() - 0.5
        );

        questionsData.push({
          tree,
          correctRegion: randomRegion,
          options,
        });
      });
    }

    // Shuffle and limit to 10 questions
    return questionsData.sort(() => Math.random() - 0.5).slice(0, 10);
  };

  const startQuiz = () => {
    setQuestions(generateQuestions());
    setCurrentQuestion(0);
    setScore(0);
    setStreak(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setGameMode("quiz");
  };

  const handleAnswer = (regionId: string) => {
    if (showFeedback) return;

    setSelectedAnswer(regionId);
    setShowFeedback(true);

    const isCorrect = regionId === questions[currentQuestion].correctRegion.id;
    if (isCorrect) {
      const points = 10 * (streak + 1);
      setScore((prev) => prev + points);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      // Quiz complete
      const finalScore = score;
      if (finalScore > highScore) {
        setHighScore(finalScore);
      }
      setTotalGames((prev) => prev + 1);
      localStorage.setItem(
        MAP_GAME_STORAGE_KEY,
        JSON.stringify({
          highScore: Math.max(finalScore, highScore),
          totalGames: totalGames + 1,
        })
      );
      setGameMode("results");
    }
  };

  // Learn Mode
  if (gameMode === "learn") {
    return (
      <div className="py-8 px-4 min-h-screen bg-gradient-to-b from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto max-w-5xl">
          <Link
            href="/education"
            className="text-muted-foreground hover:text-primary text-sm mb-6 inline-block"
          >
            {t.backToEducation}
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-3">
              <span>🗺️</span> {t.title}
            </h1>
            <p className="text-muted-foreground mt-2">{t.subtitle}</p>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-6 mb-8">
            <div className="bg-card rounded-xl px-6 py-3 border border-border text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {highScore}
              </div>
              <div className="text-xs text-muted-foreground">{t.highScore}</div>
            </div>
            <div className="bg-card rounded-xl px-6 py-3 border border-border text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalGames}
              </div>
              <div className="text-xs text-muted-foreground">
                {t.gamesPlayed}
              </div>
            </div>
          </div>

          {/* Mode Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold"
              disabled
            >
              {t.learnMode}
            </button>
            <button
              onClick={startQuiz}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              {t.quizMode}
            </button>
          </div>

          {/* Map SVG */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <p className="text-center text-muted-foreground mb-4">
              {t.selectRegion}
            </p>
            <svg
              viewBox="0 0 420 400"
              className="w-full max-w-lg mx-auto"
              style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" }}
            >
              {/* Costa Rica outline shape (simplified) */}
              <path
                d="M 40 80 Q 80 40 180 50 Q 280 30 380 80 Q 400 150 380 200 Q 350 280 280 340 Q 200 380 140 340 Q 80 300 50 230 Q 30 160 40 80 Z"
                fill="#e5e7eb"
                stroke="#9ca3af"
                strokeWidth="2"
              />

              {/* Regions */}
              {REGIONS.map((region) => (
                <path
                  key={region.id}
                  d={region.path}
                  fill={
                    selectedRegion?.id === region.id
                      ? region.color
                      : `${region.color}66`
                  }
                  stroke={region.color}
                  strokeWidth="2"
                  className="cursor-pointer transition-all hover:opacity-80"
                  onClick={() => setSelectedRegion(region)}
                />
              ))}

              {/* Region Labels */}
              {REGIONS.map((region) => {
                // Calculate center of path (simplified)
                const coords = region.path.match(/\d+/g)?.map(Number) || [];
                const xs = coords.filter((_, i) => i % 2 === 0);
                const ys = coords.filter((_, i) => i % 2 === 1);
                const cx = xs.reduce((a, b) => a + b, 0) / xs.length;
                const cy = ys.reduce((a, b) => a + b, 0) / ys.length;

                return (
                  <text
                    key={`label-${region.id}`}
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    className="pointer-events-none text-xs font-medium fill-white"
                    style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
                  >
                    {region.icon}
                  </text>
                );
              })}
            </svg>

            {/* Legend */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-6">
              {REGIONS.map((region) => (
                <button
                  key={region.id}
                  onClick={() => setSelectedRegion(region)}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                    selectedRegion?.id === region.id
                      ? "bg-primary/10 border-2 border-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: region.color }}
                  />
                  <span className="text-sm">
                    {locale === "es" ? region.name.es : region.name.en}
                  </span>
                  <span>{region.icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Region Info */}
          {selectedRegion && (
            <div className="bg-card rounded-2xl border border-border p-6 animate-in slide-in-from-bottom-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <span>{selectedRegion.icon}</span>
                    {locale === "es"
                      ? selectedRegion.name.es
                      : selectedRegion.name.en}
                  </h2>
                  <p className="text-muted-foreground">
                    {locale === "es"
                      ? selectedRegion.description.es
                      : selectedRegion.description.en}
                  </p>
                </div>
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: selectedRegion.color }}
                />
              </div>

              <div className="bg-muted/50 rounded-xl p-4 mb-4">
                <div className="text-sm text-muted-foreground">{t.climate}</div>
                <div className="font-medium">
                  {locale === "es"
                    ? selectedRegion.climate.es
                    : selectedRegion.climate.en}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">{t.commonTrees}:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {getTreesForRegion(selectedRegion.id)
                    .slice(0, 6)
                    .map((tree) => (
                      <Link
                        key={tree.slug}
                        href={`/trees/${tree.slug}`}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        {tree.featuredImage && (
                          <div className="w-10 h-10 relative rounded overflow-hidden shrink-0">
                            <Image
                              src={tree.featuredImage}
                              alt={tree.title}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                        )}
                        <span className="text-sm truncate">{tree.title}</span>
                      </Link>
                    ))}
                </div>
                {getTreesForRegion(selectedRegion.id).length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    {locale === "es"
                      ? "Explora el atlas para descubrir árboles de esta región"
                      : "Explore the atlas to discover trees from this region"}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Quiz Mode
  if (gameMode === "quiz" && questions.length > 0) {
    const currentQ = questions[currentQuestion];
    const isCorrect = selectedAnswer === currentQ.correctRegion.id;

    return (
      <div className="py-8 px-4 min-h-screen bg-gradient-to-b from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto max-w-3xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-muted-foreground">
              {t.question} {currentQuestion + 1}/{questions.length}
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-yellow-500/20 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                {t.score}: {score}
              </div>
              {streak > 0 && (
                <div className="bg-orange-500/20 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                  {t.streak} {streak}
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-muted rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Question */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <h2 className="text-xl font-bold text-center mb-6">
              {t.whereGrows}
            </h2>

            {/* Tree Card */}
            <div className="bg-muted/50 rounded-xl p-4 mb-6 flex items-center gap-4">
              {currentQ.tree.featuredImage && (
                <div className="w-20 h-20 relative rounded-xl overflow-hidden shrink-0">
                  <Image
                    src={currentQ.tree.featuredImage}
                    alt={currentQ.tree.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold">{currentQ.tree.title}</h3>
                <p className="text-sm text-muted-foreground italic">
                  {currentQ.tree.scientificName}
                </p>
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              {currentQ.options.map((region) => {
                const isSelected = selectedAnswer === region.id;
                const isCorrectAnswer = region.id === currentQ.correctRegion.id;

                return (
                  <button
                    key={region.id}
                    onClick={() => handleAnswer(region.id)}
                    disabled={showFeedback}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      showFeedback
                        ? isCorrectAnswer
                          ? "border-green-500 bg-green-500/10"
                          : isSelected
                            ? "border-red-500 bg-red-500/10"
                            : "border-border opacity-50"
                        : isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{region.icon}</span>
                      <div>
                        <div className="font-medium">
                          {locale === "es" ? region.name.es : region.name.en}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {locale === "es"
                            ? region.climate.es
                            : region.climate.en}
                        </div>
                      </div>
                      {showFeedback && isCorrectAnswer && (
                        <span className="ml-auto text-green-500">✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {showFeedback && (
              <div
                className={`mt-6 p-4 rounded-xl ${
                  isCorrect
                    ? "bg-green-500/10 border border-green-500/30"
                    : "bg-red-500/10 border border-red-500/30"
                }`}
              >
                <div className="font-bold mb-1">
                  {isCorrect ? t.correct : t.incorrect}
                </div>
                {!isCorrect && (
                  <p className="text-sm">
                    {t.theCorrectAnswer}:{" "}
                    <strong>
                      {locale === "es"
                        ? currentQ.correctRegion.name.es
                        : currentQ.correctRegion.name.en}
                    </strong>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Next Button */}
          {showFeedback && (
            <button
              onClick={nextQuestion}
              className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              {currentQuestion < questions.length - 1
                ? t.nextQuestion
                : locale === "es"
                  ? "Ver Resultados"
                  : "See Results"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Results
  if (gameMode === "results") {
    const isNewHighScore = score > highScore - score; // Compare to previous high score

    return (
      <div className="py-12 px-4 min-h-screen bg-gradient-to-b from-yellow-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto max-w-md text-center">
          <div className="text-6xl mb-6">
            {score >= 80 ? "🏆" : score >= 50 ? "🎉" : "💪"}
          </div>
          <h1 className="text-3xl font-bold mb-2">{t.quizComplete}</h1>

          {isNewHighScore && score > 0 && (
            <div className="text-yellow-600 font-bold text-xl mb-4">
              {t.newHighScore}
            </div>
          )}

          <div className="bg-card rounded-2xl border border-border p-8 mb-6">
            <div className="text-5xl font-bold text-primary mb-2">{score}</div>
            <div className="text-muted-foreground">{t.points}</div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-muted/50 rounded-xl p-4">
                <div className="text-2xl font-bold">
                  {
                    questions.filter(
                      (q, i) =>
                        i < currentQuestion + 1 &&
                        selectedAnswer === q.correctRegion.id
                    ).length
                  }
                  /{questions.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  {locale === "es" ? "Correctas" : "Correct"}
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-4">
                <div className="text-2xl font-bold">{highScore}</div>
                <div className="text-xs text-muted-foreground">
                  {t.highScore}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={startQuiz}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              {t.playAgain}
            </button>
            <button
              onClick={() => setGameMode("learn")}
              className="w-full py-3 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80 transition-colors"
            >
              {t.backToLearn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
