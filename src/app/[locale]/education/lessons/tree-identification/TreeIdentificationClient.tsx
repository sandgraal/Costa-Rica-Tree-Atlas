"use client";

import { useState, useEffect, useCallback } from "react";
import { Link } from "@i18n/navigation";
import Image from "next/image";
import {
  EducationProgressProvider,
  useEducationProgress,
} from "@/components/EducationProgress";
import {
  triggerConfetti,
  injectEducationStyles,
  type LessonTreeData,
} from "@/lib/education";

interface TreeIdentificationClientProps {
  trees: LessonTreeData[];
  locale: string;
  totalSpecies: number;
  totalFamilies: number;
}

export default function TreeIdentificationClient(
  props: TreeIdentificationClientProps
) {
  return (
    <EducationProgressProvider>
      <TreeIdentificationContent {...props} />
    </EducationProgressProvider>
  );
}

function TreeIdentificationContent({
  trees,
  locale,
}: TreeIdentificationClientProps) {
  const { markLessonComplete } = useEducationProgress();
  const [_currentStep, _setCurrentStep] = useState(0);
  const [gameMode, setGameMode] = useState<"learn" | "quiz" | "match">("learn");
  const [currentQuizTree, setCurrentQuizTree] = useState<LessonTreeData | null>(
    null
  );
  const [quizOptions, setQuizOptions] = useState<LessonTreeData[]>([]);
  const [quizScore, setQuizScore] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [quizRound, setQuizRound] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showFeedback, setShowFeedback] = useState<"correct" | "wrong" | null>(
    null
  );
  const [selectedFeature, setSelectedFeature] = useState<string>("all");
  const [matchCards, setMatchCards] = useState<
    {
      id: string;
      tree: LessonTreeData;
      type: "image" | "name";
      matched: boolean;
      flipped: boolean;
    }[]
  >([]);
  const [matchFirst, setMatchFirst] = useState<string | null>(null);
  const [matchMoves, setMatchMoves] = useState(0);
  const [_matchComplete, setMatchComplete] = useState(false);
  const [learnedTrees, setLearnedTrees] = useState<Set<string>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const [selectedLearnTree, setSelectedLearnTree] =
    useState<LessonTreeData | null>(null);

  useEffect(() => {
    injectEducationStyles();
  }, []);

  const t = {
    title:
      locale === "es"
        ? "Habilidades de Identificación"
        : "Tree Identification Skills",
    subtitle:
      locale === "es"
        ? "Aprende a reconocer árboles por sus características"
        : "Learn to recognize trees by their features",
    backToLessons:
      locale === "es" ? "← Volver a Lecciones" : "← Back to Lessons",
    learn: locale === "es" ? "📚 Aprender" : "📚 Learn",
    quiz: locale === "es" ? "🎯 Quiz" : "🎯 Quiz",
    match: locale === "es" ? "🃏 Memoria" : "🃏 Memory",
    learnTitle: locale === "es" ? "Conoce los Árboles" : "Meet the Trees",
    learnDesc:
      locale === "es"
        ? "Explora y aprende las características de cada árbol"
        : "Explore and learn the features of each tree",
    quizTitle:
      locale === "es" ? "Prueba tus Conocimientos" : "Test Your Knowledge",
    quizDesc:
      locale === "es"
        ? "¿Puedes identificar el árbol por su imagen?"
        : "Can you identify the tree from its image?",
    matchTitle: locale === "es" ? "Juego de Memoria" : "Memory Game",
    matchDesc:
      locale === "es"
        ? "Encuentra los pares de árboles y sus nombres"
        : "Match the trees with their names",
    whichTree: locale === "es" ? "¿Qué árbol es este?" : "Which tree is this?",
    correct: locale === "es" ? "¡Correcto!" : "Correct!",
    wrong: locale === "es" ? "¡Inténtalo de nuevo!" : "Try again!",
    score: locale === "es" ? "Puntuación" : "Score",
    streak: locale === "es" ? "🔥 Racha" : "🔥 Streak",
    round: locale === "es" ? "Ronda" : "Round",
    moves: locale === "es" ? "Movimientos" : "Moves",
    playAgain: locale === "es" ? "🔄 Jugar de nuevo" : "🔄 Play Again",
    nextQuestion: locale === "es" ? "Siguiente →" : "Next →",
    startQuiz: locale === "es" ? "Comenzar Quiz" : "Start Quiz",
    startMatch: locale === "es" ? "Comenzar Juego" : "Start Game",
    features: locale === "es" ? "Características" : "Features",
    family: locale === "es" ? "Familia" : "Family",
    height: locale === "es" ? "Altura" : "Height",
    flowering: locale === "es" ? "Floración" : "Flowering",
    fruiting: locale === "es" ? "Fructificación" : "Fruiting",
    all: locale === "es" ? "Todos" : "All",
    treesLearned: locale === "es" ? "Árboles Aprendidos" : "Trees Learned",
    points: locale === "es" ? "puntos" : "points",
    congratulations: locale === "es" ? "¡Felicidades!" : "Congratulations!",
    matchComplete:
      locale === "es"
        ? "¡Completaste el juego de memoria!"
        : "You completed the memory game!",
    quizComplete:
      locale === "es" ? "¡Completaste el quiz!" : "You completed the quiz!",
    perfectScore: locale === "es" ? "¡Puntuación Perfecta!" : "Perfect Score!",
    greatJob: locale === "es" ? "¡Excelente trabajo!" : "Great job!",
    keepPracticing:
      locale === "es" ? "¡Sigue practicando!" : "Keep practicing!",
    viewDetails: locale === "es" ? "Ver Detalles" : "View Details",
    close: locale === "es" ? "Cerrar" : "Close",
    clickToLearn: locale === "es" ? "Clic para aprender" : "Click to learn",
    nextLesson: locale === "es" ? "Siguiente Lección →" : "Next Lesson →",
    filterByFamily:
      locale === "es" ? "Filtrar por familia" : "Filter by family",
  };

  const features = [
    { key: "all", label: t.all, icon: "🌳" },
    { key: "flowering", label: t.flowering, icon: "🌸" },
    { key: "fruiting", label: t.fruiting, icon: "🍎" },
    {
      key: "tall",
      label: locale === "es" ? "Altos (>20m)" : "Tall (>20m)",
      icon: "📏",
    },
  ];

  const filteredTrees = trees.filter((tree) => {
    if (selectedFeature === "all") return true;
    if (selectedFeature === "flowering")
      return tree.floweringSeason && tree.floweringSeason.length > 0;
    if (selectedFeature === "fruiting")
      return tree.fruitingSeason && tree.fruitingSeason.length > 0;
    if (selectedFeature === "tall") {
      const height = parseInt(tree.maxHeight || "0");
      return height >= 20;
    }
    return true;
  });

  const generateQuizQuestion = useCallback(() => {
    const treesWithImages = trees.filter((t) => t.featuredImage);
    if (treesWithImages.length < 4) return;

    const shuffled = [...treesWithImages].sort(() => Math.random() - 0.5);
    const correctTree = shuffled[0];
    const options = shuffled.slice(0, 4).sort(() => Math.random() - 0.5);

    setCurrentQuizTree(correctTree);
    setQuizOptions(options);
    setShowFeedback(null);
  }, [trees]);

  const handleQuizAnswer = (tree: LessonTreeData) => {
    if (showFeedback) return;

    const isCorrect = tree.slug === currentQuizTree?.slug;
    setShowFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      const points = 10 * (quizStreak + 1);
      setQuizScore((prev) => prev + 1);
      setQuizStreak((prev) => prev + 1);
      setTotalPoints((prev) => prev + points);
      setLearnedTrees((prev) => new Set([...prev, tree.slug]));
      if (quizStreak >= 2) triggerConfetti();
    } else {
      setQuizStreak(0);
    }

    setTimeout(() => {
      if (quizRound < 9) {
        setQuizRound((prev) => prev + 1);
        generateQuizQuestion();
      } else {
        const finalScore = isCorrect ? quizScore + 1 : quizScore;
        const percentage = Math.round((finalScore / 10) * 100);
        // Note: totalPoints is already updated by now through setTotalPoints
        markLessonComplete(
          "tree-identification",
          percentage,
          totalPoints + (isCorrect ? 10 * (quizStreak + 1) : 0)
        );
        setShowResults(true);
        if (finalScore >= 7) triggerConfetti();
      }
    }, 1500);
  };

  const initializeMatchGame = useCallback(() => {
    const treesWithImages = trees.filter((t) => t.featuredImage);
    const selectedTrees = [...treesWithImages]
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);

    const cards: typeof matchCards = [];
    selectedTrees.forEach((tree, i) => {
      cards.push({
        id: `img-${i}`,
        tree,
        type: "image",
        matched: false,
        flipped: false,
      });
      cards.push({
        id: `name-${i}`,
        tree,
        type: "name",
        matched: false,
        flipped: false,
      });
    });

    setMatchCards(cards.sort(() => Math.random() - 0.5));
    setMatchFirst(null);
    setMatchMoves(0);
    setMatchComplete(false);
  }, [trees]);

  const handleCardClick = (cardId: string) => {
    const card = matchCards.find((c) => c.id === cardId);
    if (!card || card.matched || card.flipped) return;

    const newCards = matchCards.map((c) =>
      c.id === cardId ? { ...c, flipped: true } : c
    );
    setMatchCards(newCards);

    if (!matchFirst) {
      setMatchFirst(cardId);
    } else {
      setMatchMoves((prev) => prev + 1);
      const firstCard = matchCards.find((c) => c.id === matchFirst);

      if (
        firstCard &&
        firstCard.tree.slug === card.tree.slug &&
        firstCard.type !== card.type
      ) {
        // Match found!
        setTimeout(() => {
          setMatchCards((prev) =>
            prev.map((c) =>
              c.tree.slug === card.tree.slug ? { ...c, matched: true } : c
            )
          );
          setLearnedTrees((prev) => new Set([...prev, card.tree.slug]));
          setTotalPoints((prev) => prev + 15);

          const unmatchedCount = newCards.filter(
            (c) => !c.matched && c.tree.slug !== card.tree.slug
          ).length;
          if (unmatchedCount === 0) {
            setMatchComplete(true);
            triggerConfetti();
          }
        }, 500);
      } else {
        // No match - flip back
        setTimeout(() => {
          setMatchCards((prev) =>
            prev.map((c) =>
              (c.id === cardId || c.id === matchFirst) && !c.matched
                ? { ...c, flipped: false }
                : c
            )
          );
        }, 1000);
      }
      setMatchFirst(null);
    }
  };

  const startQuiz = () => {
    setQuizScore(0);
    setQuizStreak(0);
    setQuizRound(0);
    setShowResults(false);
    generateQuizQuestion();
    setGameMode("quiz");
  };

  const startMatchGame = () => {
    initializeMatchGame();
    setShowResults(false);
    setGameMode("match");
  };

  const resetAll = () => {
    setGameMode("learn");
    setShowResults(false);
    setQuizScore(0);
    setQuizStreak(0);
    setQuizRound(0);
    setMatchComplete(false);
    setMatchMoves(0);
  };

  // Group trees by family for learning
  const familyGroups = filteredTrees.reduce(
    (acc, tree) => {
      if (!acc[tree.family]) acc[tree.family] = [];
      acc[tree.family].push(tree);
      return acc;
    },
    {} as Record<string, LessonTreeData[]>
  );

  if (showResults) {
    const isQuiz = gameMode === "quiz";
    const percentage = isQuiz
      ? Math.round((quizScore / 10) * 100)
      : Math.round(((6 - matchMoves / 3) / 6) * 100);
    const message =
      percentage >= 90
        ? t.perfectScore
        : percentage >= 70
          ? t.greatJob
          : t.keepPracticing;

    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="text-center animate-bounce-in">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full mb-8 shadow-lg animate-pulse-glow">
            <span className="text-7xl">{percentage >= 70 ? "🏆" : "🌟"}</span>
          </div>

          <h1 className="text-4xl font-bold text-primary mb-2">
            {t.congratulations}
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            {isQuiz ? t.quizComplete : t.matchComplete}
          </p>
          <p className="text-2xl font-semibold text-foreground mb-8">
            {message}
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20">
              <div className="text-5xl font-bold text-green-600 mb-2">
                {isQuiz ? `${quizScore}/10` : matchMoves}
              </div>
              <div className="text-muted-foreground">
                {isQuiz ? t.score : t.moves}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-blue-500/20">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {learnedTrees.size}
              </div>
              <div className="text-muted-foreground">{t.treesLearned}</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl p-6 border border-yellow-500/20">
              <div className="text-5xl font-bold text-yellow-600 mb-2">
                {totalPoints}
              </div>
              <div className="text-muted-foreground">{t.points}</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={resetAll}
              className="px-6 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors"
            >
              {t.playAgain}
            </button>
            <Link
              href="/education/lessons/conservation"
              className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
            >
              {t.nextLesson}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/education/lessons"
          className="text-sm text-muted-foreground hover:text-primary mb-4 inline-flex items-center gap-1 transition-colors"
        >
          {t.backToLessons}
        </Link>
        <div className="flex items-start gap-4 mt-4">
          <div className="text-5xl animate-bounce-in">🔍</div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-primary mb-2">{t.title}</h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">
                {locale === "es" ? "Grados 4-6" : "Grades 4-6"}
              </span>
              <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full">
                ⏱️ 30-45 min
              </span>
              {totalPoints > 0 && (
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 rounded-full font-medium">
                  ⭐ {totalPoints} {t.points}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Game Mode Selector */}
      <div className="flex justify-center gap-4 mb-8">
        {[
          { mode: "learn" as const, label: t.learn, icon: "📚" },
          { mode: "quiz" as const, label: t.quiz, icon: "🎯" },
          { mode: "match" as const, label: t.match, icon: "🃏" },
        ].map(({ mode, label, icon }) => (
          <button
            key={mode}
            onClick={() =>
              mode === "quiz"
                ? startQuiz()
                : mode === "match"
                  ? startMatchGame()
                  : setGameMode(mode)
            }
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
              gameMode === mode
                ? "bg-primary text-white shadow-lg scale-105"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Game Stats Bar */}
      {(gameMode === "quiz" || gameMode === "match") && (
        <div className="bg-card border border-border rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {gameMode === "quiz" && (
              <>
                <div>
                  <span className="text-muted-foreground text-sm">
                    {t.round}
                  </span>
                  <span className="ml-2 text-xl font-bold text-foreground">
                    {quizRound + 1}/10
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">
                    {t.score}
                  </span>
                  <span className="ml-2 text-xl font-bold text-green-600">
                    {quizScore}
                  </span>
                </div>
                {quizStreak > 0 && (
                  <div className="px-3 py-1 bg-orange-500/20 text-orange-600 rounded-full font-medium animate-bounce-in">
                    {t.streak} {quizStreak}
                  </div>
                )}
              </>
            )}
            {gameMode === "match" && (
              <>
                <div>
                  <span className="text-muted-foreground text-sm">
                    {t.moves}
                  </span>
                  <span className="ml-2 text-xl font-bold text-foreground">
                    {matchMoves}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">
                    {locale === "es" ? "Pares" : "Pairs"}
                  </span>
                  <span className="ml-2 text-xl font-bold text-green-600">
                    {matchCards.filter((c) => c.matched).length / 2}/6
                  </span>
                </div>
              </>
            )}
          </div>
          <button
            onClick={resetAll}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ✕ {locale === "es" ? "Salir" : "Exit"}
          </button>
        </div>
      )}

      {/* Learn Mode */}
      {gameMode === "learn" && (
        <div className="animate-slide-up">
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
              <span>📚</span> {t.learnTitle}
            </h2>
            <p className="text-muted-foreground mb-4">{t.learnDesc}</p>

            {/* Feature Filter */}
            <div className="flex flex-wrap gap-2">
              {features.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedFeature(key);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedFeature === key
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <span>{icon}</span> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Trees by Family */}
          <div className="space-y-8">
            {Object.entries(familyGroups).map(([family, familyTrees]) => (
              <div key={family} className="animate-slide-up">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    🌿
                  </span>
                  {family}
                  <span className="text-sm text-muted-foreground font-normal">
                    ({familyTrees.length})
                  </span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {familyTrees.map((tree) => (
                    <button
                      key={tree.slug}
                      onClick={() => {
                        setSelectedLearnTree(tree);
                      }}
                      className={`group relative p-3 rounded-xl border-2 text-left transition-all ${
                        learnedTrees.has(tree.slug)
                          ? "border-green-500/50 bg-green-500/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      {learnedTrees.has(tree.slug) && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs z-10">
                          ✓
                        </div>
                      )}
                      {tree.featuredImage && (
                        <div className="aspect-square relative rounded-lg overflow-hidden mb-2">
                          <Image
                            src={tree.featuredImage}
                            alt={tree.title}
                            fill
                            sizes="150px"
                            className="object-cover group-hover:scale-110 transition-transform"
                          />
                        </div>
                      )}
                      <div className="text-sm font-medium truncate">
                        {tree.title}
                      </div>
                      <div className="text-xs text-muted-foreground italic truncate">
                        {tree.scientificName}
                      </div>
                      <div className="text-xs text-primary mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {t.clickToLearn}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="mt-8 bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">{t.treesLearned}</span>
              <span className="font-medium">
                {learnedTrees.size}/{trees.length}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                style={{
                  width: `${(learnedTrees.size / trees.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quiz Mode */}
      {gameMode === "quiz" && currentQuizTree && (
        <div className="animate-slide-up">
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold text-foreground mb-4 text-center">
              {t.whichTree}
            </h2>

            {currentQuizTree.featuredImage && (
              <div className="aspect-video relative rounded-xl overflow-hidden mb-6 max-w-2xl mx-auto shadow-lg">
                <Image
                  src={currentQuizTree.featuredImage}
                  alt="Mystery tree"
                  fill
                  className="object-cover"
                />
                {showFeedback && (
                  <div
                    className={`absolute inset-0 flex items-center justify-center ${
                      showFeedback === "correct"
                        ? "bg-green-500/80"
                        : "bg-red-500/80"
                    } animate-bounce-in`}
                  >
                    <div className="text-white text-center">
                      <div className="text-6xl mb-2">
                        {showFeedback === "correct" ? "✓" : "✗"}
                      </div>
                      <div className="text-2xl font-bold">
                        {showFeedback === "correct" ? t.correct : t.wrong}
                      </div>
                      {showFeedback === "correct" && (
                        <div className="mt-2 text-lg">
                          {currentQuizTree.title}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
              {quizOptions.map((option) => {
                const isCorrect = option.slug === currentQuizTree.slug;
                const showResult = showFeedback !== null;

                return (
                  <button
                    key={option.slug}
                    onClick={() => {
                      handleQuizAnswer(option);
                    }}
                    disabled={showFeedback !== null}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      showResult
                        ? isCorrect
                          ? "border-green-500 bg-green-500/10"
                          : "border-border opacity-50"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="font-medium">{option.title}</div>
                    <div className="text-sm text-muted-foreground italic">
                      {option.scientificName}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Match Game Mode */}
      {gameMode === "match" && (
        <div className="animate-slide-up">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {matchCards.map((card) => (
              <button
                key={card.id}
                onClick={() => {
                  handleCardClick(card.id);
                }}
                disabled={card.matched || card.flipped}
                className={`aspect-square rounded-xl border-2 transition-all transform ${
                  card.matched
                    ? "border-green-500 bg-green-500/10 scale-95"
                    : card.flipped
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted hover:border-primary/50"
                } ${!card.matched && !card.flipped ? "cursor-pointer" : ""}`}
              >
                {card.flipped || card.matched ? (
                  <div className="w-full h-full flex items-center justify-center p-2 animate-bounce-in">
                    {card.type === "image" && card.tree.featuredImage ? (
                      <div className="relative w-full h-full rounded-lg overflow-hidden">
                        <Image
                          src={card.tree.featuredImage}
                          alt={card.tree.title}
                          fill
                          sizes="150px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="font-medium text-sm">
                          {card.tree.title}
                        </div>
                        <div className="text-xs text-muted-foreground italic mt-1">
                          {card.tree.scientificName}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl">🌳</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tree Detail Modal */}
      {selectedLearnTree && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setSelectedLearnTree(null);
          }}
        >
          <div
            className="bg-card rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto animate-bounce-in"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {selectedLearnTree.featuredImage && (
              <div className="aspect-video relative rounded-xl overflow-hidden mb-4">
                <Image
                  src={selectedLearnTree.featuredImage}
                  alt={selectedLearnTree.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {selectedLearnTree.title}
            </h3>
            <p className="text-muted-foreground italic mb-3">
              {selectedLearnTree.scientificName}
            </p>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌿</span>
                <span className="text-muted-foreground">{t.family}:</span>
                <span className="font-medium">{selectedLearnTree.family}</span>
              </div>
              {selectedLearnTree.maxHeight && (
                <div className="flex items-center gap-2">
                  <span className="text-lg">📏</span>
                  <span className="text-muted-foreground">{t.height}:</span>
                  <span className="font-medium">
                    {selectedLearnTree.maxHeight}
                  </span>
                </div>
              )}
              {selectedLearnTree.floweringSeason &&
                selectedLearnTree.floweringSeason.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌸</span>
                    <span className="text-muted-foreground">
                      {t.flowering}:
                    </span>
                    <span className="font-medium capitalize">
                      {selectedLearnTree.floweringSeason.join(", ")}
                    </span>
                  </div>
                )}
              {selectedLearnTree.fruitingSeason &&
                selectedLearnTree.fruitingSeason.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🍎</span>
                    <span className="text-muted-foreground">{t.fruiting}:</span>
                    <span className="font-medium capitalize">
                      {selectedLearnTree.fruitingSeason.join(", ")}
                    </span>
                  </div>
                )}
              {selectedLearnTree.tags && selectedLearnTree.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedLearnTree.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-muted rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {selectedLearnTree.description}
            </p>

            <div className="flex gap-2">
              <Link
                href={`/trees/${selectedLearnTree.slug}`}
                className="flex-1 py-2 bg-primary text-white rounded-lg text-center hover:bg-primary/90 transition-colors"
                onClick={() => {
                  setLearnedTrees(
                    (prev) => new Set([...prev, selectedLearnTree.slug])
                  );
                  setTotalPoints((prev) => prev + 5);
                }}
              >
                {t.viewDetails}
              </Link>
              <button
                onClick={() => {
                  setLearnedTrees(
                    (prev) => new Set([...prev, selectedLearnTree.slug])
                  );
                  setTotalPoints((prev) => prev + 5);
                  setSelectedLearnTree(null);
                }}
                className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
