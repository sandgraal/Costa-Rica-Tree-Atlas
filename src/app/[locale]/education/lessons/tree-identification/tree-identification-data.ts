/**
 * Static lesson data for the Tree Identification lesson.
 *
 * This module is imported ONLY by the server-side page.tsx so that
 * the data is serialized in the RSC payload rather than shipped as
 * executable JavaScript in the client bundle.
 */

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
  const isEs = locale === "es";

  const labels: TreeIdentificationLabels = {
    title: isEs
      ? "Habilidades de Identificación"
      : "Tree Identification Skills",
    subtitle: isEs
      ? "Aprende a reconocer árboles por sus características"
      : "Learn to recognize trees by their features",
    backToLessons: isEs ? "← Volver a Lecciones" : "← Back to Lessons",
    learn: isEs ? "📚 Aprender" : "📚 Learn",
    quiz: isEs ? "🎯 Quiz" : "🎯 Quiz",
    match: isEs ? "🃏 Memoria" : "🃏 Memory",
    learnTitle: isEs ? "Conoce los Árboles" : "Meet the Trees",
    learnDesc: isEs
      ? "Explora y aprende las características de cada árbol"
      : "Explore and learn the features of each tree",
    quizTitle: isEs ? "Prueba tus Conocimientos" : "Test Your Knowledge",
    quizDesc: isEs
      ? "¿Puedes identificar el árbol por su imagen?"
      : "Can you identify the tree from its image?",
    matchTitle: isEs ? "Juego de Memoria" : "Memory Game",
    matchDesc: isEs
      ? "Encuentra los pares de árboles y sus nombres"
      : "Match the trees with their names",
    whichTree: isEs ? "¿Qué árbol es este?" : "Which tree is this?",
    correct: isEs ? "¡Correcto!" : "Correct!",
    wrong: isEs ? "¡Inténtalo de nuevo!" : "Try again!",
    score: isEs ? "Puntuación" : "Score",
    streak: isEs ? "🔥 Racha" : "🔥 Streak",
    round: isEs ? "Ronda" : "Round",
    moves: isEs ? "Movimientos" : "Moves",
    playAgain: isEs ? "🔄 Jugar de nuevo" : "🔄 Play Again",
    nextQuestion: isEs ? "Siguiente →" : "Next →",
    startQuiz: isEs ? "Comenzar Quiz" : "Start Quiz",
    startMatch: isEs ? "Comenzar Juego" : "Start Game",
    features: isEs ? "Características" : "Features",
    family: isEs ? "Familia" : "Family",
    height: isEs ? "Altura" : "Height",
    flowering: isEs ? "Floración" : "Flowering",
    fruiting: isEs ? "Fructificación" : "Fruiting",
    all: isEs ? "Todos" : "All",
    treesLearned: isEs ? "Árboles Aprendidos" : "Trees Learned",
    points: isEs ? "puntos" : "points",
    congratulations: isEs ? "¡Felicidades!" : "Congratulations!",
    matchComplete: isEs
      ? "¡Completaste el juego de memoria!"
      : "You completed the memory game!",
    quizComplete: isEs ? "¡Completaste el quiz!" : "You completed the quiz!",
    perfectScore: isEs ? "¡Puntuación Perfecta!" : "Perfect Score!",
    greatJob: isEs ? "¡Excelente trabajo!" : "Great job!",
    keepPracticing: isEs ? "¡Sigue practicando!" : "Keep practicing!",
    viewDetails: isEs ? "Ver Detalles" : "View Details",
    close: isEs ? "Cerrar" : "Close",
    clickToLearn: isEs ? "Clic para aprender" : "Click to learn",
    nextLesson: isEs ? "Siguiente Lección →" : "Next Lesson →",
    filterByFamily: isEs ? "Filtrar por familia" : "Filter by family",
    grades: isEs ? "Grados 4-6" : "Grades 4-6",
    pairs: isEs ? "Pares" : "Pairs",
    exit: isEs ? "Salir" : "Exit",
  };

  const features: FeatureDef[] = [
    { key: "all", label: labels.all, icon: "🌳" },
    { key: "flowering", label: labels.flowering, icon: "🌸" },
    { key: "fruiting", label: labels.fruiting, icon: "🍎" },
    { key: "tall", label: isEs ? "Altos (>20m)" : "Tall (>20m)", icon: "📏" },
  ];

  return { labels, features };
}
