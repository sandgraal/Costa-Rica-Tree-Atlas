/**
 * Static lesson data for the Tree Identification lesson.
 *
 * This module is imported ONLY by the server-side page.tsx so that
 * the data is serialized in the RSC payload rather than shipped as
 * executable JavaScript in the client bundle.
 */

import { normalizeLocale } from "@/lib/i18n";

// ============================================================================
// Types (re-exported for the client component)
// ============================================================================

export interface FeatureDef {
  key: string;
  label: string;
  icon: string;
}

export interface TreeIdentificationLabels {
  title: string;
  subtitle: string;
  backToLessons: string;
  learn: string;
  quiz: string;
  match: string;
  learnTitle: string;
  learnDesc: string;
  quizTitle: string;
  quizDesc: string;
  matchTitle: string;
  matchDesc: string;
  whichTree: string;
  correct: string;
  wrong: string;
  score: string;
  streak: string;
  round: string;
  moves: string;
  playAgain: string;
  nextQuestion: string;
  startQuiz: string;
  startMatch: string;
  features: string;
  family: string;
  height: string;
  flowering: string;
  fruiting: string;
  all: string;
  treesLearned: string;
  points: string;
  congratulations: string;
  matchComplete: string;
  quizComplete: string;
  perfectScore: string;
  greatJob: string;
  keepPracticing: string;
  viewDetails: string;
  close: string;
  clickToLearn: string;
  nextLesson: string;
  filterByFamily: string;
  grades: string;
  pairs: string;
  exit: string;
}

export interface TreeIdentificationLessonData {
  labels: TreeIdentificationLabels;
  features: FeatureDef[];
}

// ============================================================================
// Data builder (called from server component)
// ============================================================================

export function getTreeIdentificationLessonData(
  locale: string
): TreeIdentificationLessonData {
  const lang: "en" | "es" = normalizeLocale(locale);
  const t = (en: string, es: string): string => {
    if (lang === "es") {
      return es;
    }

    return en;
  };

  const labels: TreeIdentificationLabels = {
    title: t("Tree Identification Skills", "Habilidades de Identificación"),
    subtitle: t(
      "Learn to recognize trees by their features",
      "Aprende a reconocer árboles por sus características"
    ),
    backToLessons: t("← Back to Lessons", "← Volver a Lecciones"),
    learn: t("📚 Learn", "📚 Aprender"),
    quiz: "🎯 Quiz",
    match: t("🃏 Memory", "🃏 Memoria"),
    learnTitle: t("Meet the Trees", "Conoce los Árboles"),
    learnDesc: t(
      "Explore and learn the features of each tree",
      "Explora y aprende las características de cada árbol"
    ),
    quizTitle: t("Test Your Knowledge", "Prueba tus Conocimientos"),
    quizDesc: t(
      "Can you identify the tree from its image?",
      "¿Puedes identificar el árbol por su imagen?"
    ),
    matchTitle: t("Memory Game", "Juego de Memoria"),
    matchDesc: t(
      "Match the trees with their names",
      "Encuentra los pares de árboles y sus nombres"
    ),
    whichTree: t("Which tree is this?", "¿Qué árbol es este?"),
    correct: t("Correct!", "¡Correcto!"),
    wrong: t("Try again!", "¡Inténtalo de nuevo!"),
    score: t("Score", "Puntuación"),
    streak: t("🔥 Streak", "🔥 Racha"),
    round: t("Round", "Ronda"),
    moves: t("Moves", "Movimientos"),
    playAgain: t("🔄 Play Again", "🔄 Jugar de nuevo"),
    nextQuestion: t("Next →", "Siguiente →"),
    startQuiz: t("Start Quiz", "Comenzar Quiz"),
    startMatch: t("Start Game", "Comenzar Juego"),
    features: t("Features", "Características"),
    family: t("Family", "Familia"),
    height: t("Height", "Altura"),
    flowering: t("Flowering", "Floración"),
    fruiting: t("Fruiting", "Fructificación"),
    all: t("All", "Todos"),
    treesLearned: t("Trees Learned", "Árboles Aprendidos"),
    points: t("points", "puntos"),
    congratulations: t("Congratulations!", "¡Felicidades!"),
    matchComplete: t(
      "You completed the memory game!",
      "¡Completaste el juego de memoria!"
    ),
    quizComplete: t("You completed the quiz!", "¡Completaste el quiz!"),
    perfectScore: t("Perfect Score!", "¡Puntuación Perfecta!"),
    greatJob: t("Great job!", "¡Excelente trabajo!"),
    keepPracticing: t("Keep practicing!", "¡Sigue practicando!"),
    viewDetails: t("View Details", "Ver Detalles"),
    close: t("Close", "Cerrar"),
    clickToLearn: t("Click to learn", "Clic para aprender"),
    nextLesson: t("Next Lesson →", "Siguiente Lección →"),
    filterByFamily: t("Filter by family", "Filtrar por familia"),
    grades: t("Grades 4-6", "Grados 4-6"),
    pairs: t("Pairs", "Pares"),
    exit: t("Exit", "Salir"),
  };

  const features: FeatureDef[] = [
    { key: "all", label: labels.all, icon: "🌳" },
    { key: "flowering", label: labels.flowering, icon: "🌸" },
    { key: "fruiting", label: labels.fruiting, icon: "🍎" },
    { key: "tall", label: t("Tall (>20m)", "Altos (>20m)"), icon: "📏" },
  ];

  return { labels, features };
}
