/**
 * Static lesson data for the Biodiversity Introduction lesson.
 *
 * This module is imported ONLY by the server-side page.tsx so that
 * the data is serialized in the RSC payload rather than shipped as
 * executable JavaScript in the client bundle.
 */

// ============================================================================
// Types (re-exported for the client component)
// ============================================================================

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  hint: string;
  points: number;
}

export interface StepDef {
  title: string;
  icon: string;
}

export interface BiodiversityLabels {
  title: string;
  subtitle: string;
  step1Title: string;
  step1Content: string;
  step2Title: string;
  step2Content: string;
  step3Title: string;
  step3Content: string;
  step4Title: string;
  step5Title: string;
  next: string;
  previous: string;
  finish: string;
  backToLessons: string;
  selected: string;
  results: string;
  correct: string;
  tryAgain: string;
  hint: string;
  points: string;
  streak: string;
  didYouKnow: string;
  objectives: string[];
  learningObjectives: string;
  nextLesson: string;
  exploreMoreTrees: string;
  treesExplored: string;
  lessonComplete: string;
  clickToExplore: string;
  viewInAtlas: string;
  close: string;
  yourFavoriteTrees: string;
  gradeLevel: string;
  speciesLabel: string;
  familiesLabel: string;
  biodiversityLabel: string;
  surfaceLabel: string;
  collectionComplete: string;
  correctFeedback: string;
  incorrectFeedback: string;
  creativeMission: string;
  creativeMissionDesc: string;
  yourSelectedTrees: string;
  drawingArea: string;
  printableResources: string;
  viewActivitySheets: string;
}

export interface BiodiversityLessonData {
  labels: BiodiversityLabels;
  funFacts: string[];
  quizQuestions: QuizQuestion[];
  steps: StepDef[];
}

// ============================================================================
// Data builder (called from server component)
// ============================================================================

export function getBiodiversityLessonData(
  locale: string,
  totalSpecies: number,
  totalFamilies: number
): BiodiversityLessonData {
  const isEs = locale === "es";

  const labels: BiodiversityLabels = {
    title: isEs
      ? "Introducción a la Biodiversidad"
      : "Introduction to Biodiversity",
    subtitle: isEs
      ? "Descubre la increíble diversidad de árboles en Costa Rica"
      : "Discover the incredible diversity of trees in Costa Rica",
    step1Title: isEs ? "¿Qué es la Biodiversidad?" : "What is Biodiversity?",
    step1Content: isEs
      ? "La biodiversidad es la variedad de vida en la Tierra. Costa Rica, con solo el 0.03% de la superficie terrestre, alberga cerca del 5% de la biodiversidad mundial. ¡Esto hace de Costa Rica uno de los países más diversos del planeta!"
      : "Biodiversity is the variety of life on Earth. Costa Rica, with only 0.03% of the Earth's surface, is home to nearly 5% of the world's biodiversity. This makes Costa Rica one of the most diverse countries on the planet!",
    step2Title: isEs ? "Árboles de Costa Rica" : "Costa Rica's Trees",
    step2Content: isEs
      ? `Nuestro atlas documenta ${totalSpecies} especies de árboles en ${totalFamilies} familias botánicas diferentes.`
      : `Our atlas documents ${totalSpecies} tree species across ${totalFamilies} different botanical families.`,
    step3Title: isEs
      ? "🎯 Misión: Explora los Árboles"
      : "🎯 Mission: Explore the Trees",
    step3Content: isEs
      ? "¡Selecciona 5 árboles para completar tu colección!"
      : "Select 5 trees to complete your collection!",
    step4Title: isEs ? "🧠 Desafío de Conocimiento" : "🧠 Knowledge Challenge",
    step5Title: isEs ? "🎨 Actividad Creativa" : "🎨 Creative Activity",
    next: isEs ? "Siguiente →" : "Next →",
    previous: isEs ? "← Anterior" : "← Previous",
    finish: isEs ? "🎉 Finalizar" : "🎉 Finish",
    backToLessons: isEs ? "← Volver a Lecciones" : "← Back to Lessons",
    selected: isEs ? "seleccionados" : "selected",
    results: isEs ? "¡Felicidades!" : "Congratulations!",
    correct: isEs ? "respuestas correctas" : "correct answers",
    tryAgain: isEs ? "🔄 Intentar de nuevo" : "🔄 Try Again",
    hint: isEs ? "💡 Pista" : "💡 Hint",
    points: isEs ? "puntos" : "points",
    streak: isEs ? "🔥 Racha" : "🔥 Streak",
    didYouKnow: isEs ? "¿Sabías que...?" : "Did you know...?",
    objectives: isEs
      ? [
          "Definir qué es biodiversidad",
          "Explicar por qué Costa Rica es tan biodiversa",
          "Identificar 5 árboles nativos de Costa Rica",
          "Entender la importancia de proteger los bosques",
        ]
      : [
          "Define what biodiversity is",
          "Explain why Costa Rica is so biodiverse",
          "Identify 5 native Costa Rican trees",
          "Understand the importance of protecting forests",
        ],
    learningObjectives: isEs
      ? "Objetivos de Aprendizaje"
      : "Learning Objectives",
    nextLesson: isEs ? "Siguiente Lección →" : "Next Lesson →",
    exploreMoreTrees: isEs ? "Explorar Más Árboles" : "Explore More Trees",
    treesExplored: isEs ? "Árboles Explorados" : "Trees Explored",
    lessonComplete: isEs
      ? "¡Has completado la lección de Biodiversidad!"
      : "You've completed the Biodiversity lesson!",
    clickToExplore: isEs ? "Clic para explorar" : "Click to explore",
    viewInAtlas: isEs ? "Ver en Atlas" : "View in Atlas",
    close: isEs ? "Cerrar" : "Close",
    yourFavoriteTrees: isEs ? "Tus árboles favoritos:" : "Your favorite trees:",
    gradeLevel: isEs ? "Grados 3-5" : "Grades 3-5",
    speciesLabel: isEs ? "Especies" : "Species",
    familiesLabel: isEs ? "Familias" : "Families",
    biodiversityLabel: isEs ? "Biodiversidad" : "Biodiversity",
    surfaceLabel: isEs ? "Superficie" : "Surface",
    collectionComplete: isEs ? "¡Colección completa!" : "Collection complete!",
    correctFeedback: isEs ? "¡Correcto!" : "Correct!",
    incorrectFeedback: isEs
      ? "La respuesta correcta está marcada en verde."
      : "The correct answer is marked in green.",
    creativeMission: isEs ? "Tu Misión Creativa" : "Your Creative Mission",
    creativeMissionDesc: isEs
      ? "Dibuja tu árbol favorito y escribe 3 datos interesantes sobre él."
      : "Draw your favorite tree and write 3 interesting facts about it.",
    yourSelectedTrees: isEs
      ? "Tus árboles seleccionados:"
      : "Your selected trees:",
    drawingArea: isEs
      ? "Área de dibujo - ¡Usa papel y lápices de colores!"
      : "Drawing area - Use paper and colored pencils!",
    printableResources: isEs ? "Recursos imprimibles" : "Printable resources",
    viewActivitySheets: isEs
      ? "Ver hojas de actividades"
      : "View activity sheets",
  };

  const funFacts: string[] = isEs
    ? [
        "Costa Rica tiene más especies de aves que toda Europa junta",
        "El 25% del territorio de Costa Rica está protegido",
        "Los bosques de Costa Rica capturan millones de toneladas de carbono cada año",
        "La palabra 'biodiversidad' se usó por primera vez en 1986",
      ]
    : [
        "Costa Rica has more bird species than all of Europe combined",
        "25% of Costa Rica's territory is protected",
        "Costa Rica's forests capture millions of tons of carbon each year",
        "The word 'biodiversity' was first used in 1986",
      ];

  const quizQuestions: QuizQuestion[] = [
    {
      question: isEs
        ? "¿Qué porcentaje de la biodiversidad mundial se encuentra en Costa Rica?"
        : "What percentage of world biodiversity is found in Costa Rica?",
      options: ["1%", "5%", "15%", "25%"],
      correct: 1,
      hint: isEs
        ? "Costa Rica es uno de los países más biodiversos del mundo"
        : "Costa Rica is one of the most biodiverse countries in the world",
      points: 10,
    },
    {
      question: isEs
        ? "¿Por qué Costa Rica es tan biodiversa?"
        : "Why is Costa Rica so biodiverse?",
      options: isEs
        ? [
            "Es un país muy grande",
            "Tiene muchos climas y hábitats diferentes",
            "Llueve mucho",
            "Tiene mucha tecnología",
          ]
        : [
            "It's a very large country",
            "It has many different climates and habitats",
            "It rains a lot",
            "It has lots of technology",
          ],
      correct: 1,
      hint: isEs
        ? "Piensa en las diferentes zonas del país: playas, montañas, bosques..."
        : "Think about the different zones: beaches, mountains, forests...",
      points: 15,
    },
    {
      question: isEs
        ? "¿Cuántas familias botánicas de árboles hay documentadas en nuestro atlas?"
        : "How many botanical tree families are documented in our atlas?",
      options: [
        `${Math.round(totalFamilies * 0.5)}`,
        `${totalFamilies}`,
        `${Math.round(totalFamilies * 1.5)}`,
        `${Math.round(totalFamilies * 2)}`,
      ],
      correct: 1,
      hint: isEs
        ? "Revisa las estadísticas que viste al principio"
        : "Check the statistics you saw at the beginning",
      points: 15,
    },
    {
      question: isEs
        ? "¿Qué porcentaje de la superficie de la Tierra ocupa Costa Rica?"
        : "What percentage of Earth's surface does Costa Rica occupy?",
      options: ["0.03%", "1%", "5%", "10%"],
      correct: 0,
      hint: isEs
        ? "Es un país muy pequeño pero muy diverso"
        : "It's a very small country but very diverse",
      points: 15,
    },
  ];

  const step1Title = labels.step1Title;
  const step2Title = labels.step2Title;
  const step3Title = labels.step3Title;
  const step4Title = labels.step4Title;
  const step5Title = labels.step5Title;

  const steps: StepDef[] = [
    { title: step1Title, icon: "🌍" },
    { title: step2Title, icon: "🌳" },
    { title: step3Title, icon: "🔍" },
    { title: step4Title, icon: "📝" },
    { title: step5Title, icon: "🎨" },
  ];

  return { labels, funFacts, quizQuestions, steps };
}
