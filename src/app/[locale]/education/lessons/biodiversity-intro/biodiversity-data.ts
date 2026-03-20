/**
 * Static lesson data for the Biodiversity Introduction lesson.
 *
 * This module is imported ONLY by the server-side page.tsx so that
 * the data is serialized in the RSC payload rather than shipped as
 * executable JavaScript in the client bundle.
 */

import { normalizeLocale, selectLocalizedValue } from "@/lib/i18n";

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
  const lang: "en" | "es" = normalizeLocale(locale);
  const t = (en: string, es: string): string =>
    selectLocalizedValue(en, es, lang);

  const localizedLabelExtras: Record<
    "en" | "es",
    Pick<
      BiodiversityLabels,
      | "gradeLevel"
      | "speciesLabel"
      | "familiesLabel"
      | "biodiversityLabel"
      | "surfaceLabel"
      | "collectionComplete"
      | "correctFeedback"
      | "incorrectFeedback"
      | "creativeMission"
      | "creativeMissionDesc"
      | "yourSelectedTrees"
      | "drawingArea"
      | "printableResources"
      | "viewActivitySheets"
    >
  > = {
    en: {
      gradeLevel: "Grades 3-5",
      speciesLabel: "Species",
      familiesLabel: "Families",
      biodiversityLabel: "Biodiversity",
      surfaceLabel: "Surface",
      collectionComplete: "Collection complete!",
      correctFeedback: "Correct!",
      incorrectFeedback: "The correct answer is marked in green.",
      creativeMission: "Your Creative Mission",
      creativeMissionDesc:
        "Draw your favorite tree and write 3 interesting facts about it.",
      yourSelectedTrees: "Your selected trees:",
      drawingArea: "Drawing area - Use paper and colored pencils!",
      printableResources: "Printable resources",
      viewActivitySheets: "View activity sheets",
    },
    es: {
      gradeLevel: "Grados 3-5",
      speciesLabel: "Especies",
      familiesLabel: "Familias",
      biodiversityLabel: "Biodiversidad",
      surfaceLabel: "Superficie",
      collectionComplete: "¡Colección completa!",
      correctFeedback: "¡Correcto!",
      incorrectFeedback: "La respuesta correcta está marcada en verde.",
      creativeMission: "Tu Misión Creativa",
      creativeMissionDesc:
        "Dibuja tu árbol favorito y escribe 3 datos interesantes sobre él.",
      yourSelectedTrees: "Tus árboles seleccionados:",
      drawingArea: "Área de dibujo - ¡Usa papel y lápices de colores!",
      printableResources: "Recursos imprimibles",
      viewActivitySheets: "Ver hojas de actividades",
    },
  };

  const labels: BiodiversityLabels = {
    title: t("Introduction to Biodiversity", "Introducción a la Biodiversidad"),
    subtitle: t(
      "Discover the incredible diversity of trees in Costa Rica",
      "Descubre la increíble diversidad de árboles en Costa Rica"
    ),
    step1Title: t("What is Biodiversity?", "¿Qué es la Biodiversidad?"),
    step1Content: t(
      "Biodiversity is the variety of life on Earth. Costa Rica, with only 0.03% of the Earth's surface, is home to nearly 5% of the world's biodiversity. This makes Costa Rica one of the most diverse countries on the planet!",
      "La biodiversidad es la variedad de vida en la Tierra. Costa Rica, con solo el 0.03% de la superficie terrestre, alberga cerca del 5% de la biodiversidad mundial. ¡Esto hace de Costa Rica uno de los países más diversos del planeta!"
    ),
    step2Title: t("Costa Rica's Trees", "Árboles de Costa Rica"),
    step2Content: t(
      `Our atlas documents ${totalSpecies} tree species across ${totalFamilies} different botanical families.`,
      `Nuestro atlas documenta ${totalSpecies} especies de árboles en ${totalFamilies} familias botánicas diferentes.`
    ),
    step3Title: t(
      "🎯 Mission: Explore the Trees",
      "🎯 Misión: Explora los Árboles"
    ),
    step3Content: t(
      "Select 5 trees to complete your collection!",
      "¡Selecciona 5 árboles para completar tu colección!"
    ),
    step4Title: t("🧠 Knowledge Challenge", "🧠 Desafío de Conocimiento"),
    step5Title: t("🎨 Creative Activity", "🎨 Actividad Creativa"),
    next: t("Next →", "Siguiente →"),
    previous: t("← Previous", "← Anterior"),
    finish: t("🎉 Finish", "🎉 Finalizar"),
    backToLessons: t("← Back to Lessons", "← Volver a Lecciones"),
    selected: t("selected", "seleccionados"),
    results: t("Congratulations!", "¡Felicidades!"),
    correct: t("correct answers", "respuestas correctas"),
    tryAgain: t("🔄 Try Again", "🔄 Intentar de nuevo"),
    hint: t("💡 Hint", "💡 Pista"),
    points: t("points", "puntos"),
    streak: t("🔥 Streak", "🔥 Racha"),
    didYouKnow: t("Did you know...?", "¿Sabías que...?"),
    objectives: [
      t("Define what biodiversity is", "Definir qué es biodiversidad"),
      t(
        "Explain why Costa Rica is so biodiverse",
        "Explicar por qué Costa Rica es tan biodiversa"
      ),
      t(
        "Identify 5 native Costa Rican trees",
        "Identificar 5 árboles nativos de Costa Rica"
      ),
      t(
        "Understand the importance of protecting forests",
        "Entender la importancia de proteger los bosques"
      ),
    ],
    learningObjectives: t("Learning Objectives", "Objetivos de Aprendizaje"),
    nextLesson: t("Next Lesson →", "Siguiente Lección →"),
    exploreMoreTrees: t("Explore More Trees", "Explorar Más Árboles"),
    treesExplored: t("Trees Explored", "Árboles Explorados"),
    lessonComplete: t(
      "You've completed the Biodiversity lesson!",
      "¡Has completado la lección de Biodiversidad!"
    ),
    clickToExplore: t("Click to explore", "Clic para explorar"),
    viewInAtlas: t("View in Atlas", "Ver en Atlas"),
    close: t("Close", "Cerrar"),
    yourFavoriteTrees: t("Your favorite trees:", "Tus árboles favoritos:"),
    ...localizedLabelExtras[lang],
  };

  const localizedFunFacts: Record<"en" | "es", string[]> = {
    es: [
      "Costa Rica tiene más especies de aves que toda Europa junta",
      "El 25% del territorio de Costa Rica está protegido",
      "Los bosques de Costa Rica capturan millones de toneladas de carbono cada año",
      "La palabra 'biodiversidad' se usó por primera vez en 1986",
    ],
    en: [
      "Costa Rica has more bird species than all of Europe combined",
      "25% of Costa Rica's territory is protected",
      "Costa Rica's forests capture millions of tons of carbon each year",
      "The word 'biodiversity' was first used in 1986",
    ],
  };

  const funFacts: string[] = localizedFunFacts[lang];

  const quizQuestions: QuizQuestion[] = [
    {
      question: t(
        "What percentage of world biodiversity is found in Costa Rica?",
        "¿Qué porcentaje de la biodiversidad mundial se encuentra en Costa Rica?"
      ),
      options: ["1%", "5%", "15%", "25%"],
      correct: 1,
      hint: t(
        "Costa Rica is one of the most biodiverse countries in the world",
        "Costa Rica es uno de los países más biodiversos del mundo"
      ),
      points: 10,
    },
    {
      question: t(
        "Why is Costa Rica so biodiverse?",
        "¿Por qué Costa Rica es tan biodiversa?"
      ),
      options: [
        t("It's a very large country", "Es un país muy grande"),
        t(
          "It has many different climates and habitats",
          "Tiene muchos climas y hábitats diferentes"
        ),
        t("It rains a lot", "Llueve mucho"),
        t("It has lots of technology", "Tiene mucha tecnología"),
      ],
      correct: 1,
      hint: t(
        "Think about the different zones: beaches, mountains, forests...",
        "Piensa en las diferentes zonas del país: playas, montañas, bosques..."
      ),
      points: 15,
    },
    {
      question: t(
        "How many botanical tree families are documented in our atlas?",
        "¿Cuántas familias botánicas de árboles hay documentadas en nuestro atlas?"
      ),
      options: [
        `${Math.round(totalFamilies * 0.5)}`,
        `${totalFamilies}`,
        `${Math.round(totalFamilies * 1.5)}`,
        `${Math.round(totalFamilies * 2)}`,
      ],
      correct: 1,
      hint: t(
        "Check the statistics you saw at the beginning",
        "Revisa las estadísticas que viste al principio"
      ),
      points: 15,
    },
    {
      question: t(
        "What percentage of Earth's surface does Costa Rica occupy?",
        "¿Qué porcentaje de la superficie de la Tierra ocupa Costa Rica?"
      ),
      options: ["0.03%", "1%", "5%", "10%"],
      correct: 0,
      hint: t(
        "It's a very small country but very diverse",
        "Es un país muy pequeño pero muy diverso"
      ),
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
