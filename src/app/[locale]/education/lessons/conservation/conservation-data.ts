/**
 * Static lesson data for the Conservation and Threats lesson.
 *
 * This module is imported ONLY by the server-side page.tsx so that
 * the data is serialized in the RSC payload rather than shipped as
 * executable JavaScript in the client bundle.
 */

// ============================================================================
// Types (re-exported for the client component)
// ============================================================================

export interface ConservationLabels {
  title: string;
  subtitle: string;
  backToLessons: string;
  step1Title: string;
  step2Title: string;
  step3Title: string;
  step4Title: string;
  step5Title: string;
  next: string;
  previous: string;
  finish: string;
  points: string;
  selected: string;
  congratulations: string;
  lessonComplete: string;
  tryAgain: string;
  nextLesson: string;
  adoptTree: string;
  yourAdoptedTree: string;
  selectActions: string;
  signPledge: string;
  yourName: string;
  pledgeText: string;
  actionsPledged: string;
  forestDefender: string;
  viewInAtlas: string;
  gradeLevel: string;
  forestsIntro: string;
  selectThreats: string;
  iucnCategories: string;
  treesLabel: string;
  endangeredTrees: string;
  excellentChoices: string;
  thankYouPledge: string;
}

export interface ConservationReason {
  icon: string;
  title: string;
  desc: string;
}

export interface Threat {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

export interface ConservationAction {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

export interface StatusInfo {
  key: string;
  color: string;
  icon: string;
  label: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  points: number;
}

export interface StepDef {
  title: string;
  icon: string;
}

export interface ConservationLessonData {
  labels: ConservationLabels;
  conservationReasons: ConservationReason[];
  threats: Threat[];
  conservationActions: ConservationAction[];
  statusInfo: StatusInfo[];
  quizQuestions: QuizQuestion[];
  steps: StepDef[];
}

// ============================================================================
// Data builder (called from server component)
// ============================================================================

export function getConservationLessonData(
  locale: string
): ConservationLessonData {
  const lang: "en" | "es" = locale === "es" ? "es" : "en";
  const t = (en: string, es: string): string => (lang === "es" ? es : en);

  const labels: ConservationLabels = {
    title: t("Conservation and Threats", "Conservación y Amenazas"),
    subtitle: t(
      "Learn to protect Costa Rica's trees",
      "Aprende a proteger los árboles de Costa Rica"
    ),
    backToLessons: t("← Back to Lessons", "← Volver a Lecciones"),
    step1Title: t("Why Conserve?", "¿Por qué Conservar?"),
    step2Title: t("Threats to Forests", "Amenazas a los Bosques"),
    step3Title: t("Conservation Status", "Estados de Conservación"),
    step4Title: t("🦸 Take Action", "🦸 Toma Acción"),
    step5Title: t("📜 Your Pledge", "📜 Tu Compromiso"),
    next: t("Next →", "Siguiente →"),
    previous: t("← Previous", "← Anterior"),
    finish: t("🎉 Finish", "🎉 Finalizar"),
    points: t("points", "puntos"),
    selected: t("selected", "seleccionados"),
    congratulations: t(
      "Congratulations, Forest Defender!",
      "¡Felicidades, Defensor de los Bosques!"
    ),
    lessonComplete: t(
      "You've completed the Conservation lesson",
      "Has completado la lección de Conservación"
    ),
    tryAgain: t("🔄 Try Again", "🔄 Intentar de nuevo"),
    nextLesson: t("Next Lesson →", "Siguiente Lección →"),
    adoptTree: t("Adopt a Tree", "Adoptar un Árbol"),
    yourAdoptedTree: t("Your Adopted Tree", "Tu Árbol Adoptado"),
    selectActions: t(
      "Select 3 actions you can take",
      "Selecciona 3 acciones que puedes hacer"
    ),
    signPledge: t("Sign Pledge", "Firmar Compromiso"),
    yourName: t("Your name", "Tu nombre"),
    pledgeText: t(
      "I pledge to protect the trees and forests of Costa Rica",
      "Me comprometo a proteger los árboles y bosques de Costa Rica"
    ),
    actionsPledged: t("Actions Pledged", "Acciones Prometidas"),
    forestDefender: t("Forest Defender", "Defensor del Bosque"),
    viewInAtlas: t("View in Atlas →", "Ver en el Atlas →"),
    gradeLevel: t("Grades 4-7", "Grados 4-7"),
    forestsIntro: t(
      "Forests are essential for life on Earth. Discover why we must protect them.",
      "Los bosques son esenciales para la vida en la Tierra. Descubre por qué debemos protegerlos."
    ),
    selectThreats: t(
      "Select the 3 most serious threats:",
      "Selecciona las 3 amenazas más graves:"
    ),
    iucnCategories: t("IUCN Categories", "Categorías UICN"),
    treesLabel: t("trees", "árboles"),
    endangeredTrees: t("Endangered Trees", "Árboles en Peligro"),
    excellentChoices: t("Excellent choices!", "¡Excelente elección!"),
    thankYouPledge: t(
      "Thank you for your commitment!",
      "¡Gracias por tu compromiso!"
    ),
  };

  const conservationReasons: ConservationReason[] =
    lang === "es"
      ? [
          {
            icon: "🌬️",
            title: "Aire Limpio",
            desc: "Los árboles producen el oxígeno que respiramos",
          },
          {
            icon: "💧",
            title: "Agua Pura",
            desc: "Los bosques filtran y protegen nuestras fuentes de agua",
          },
          {
            icon: "🐦",
            title: "Hogar Animal",
            desc: "Millones de especies dependen de los bosques",
          },
          {
            icon: "🌡️",
            title: "Clima Estable",
            desc: "Los árboles absorben CO2 y regulan el clima",
          },
          {
            icon: "💊",
            title: "Medicinas",
            desc: "Muchas medicinas vienen de plantas del bosque",
          },
          {
            icon: "🍎",
            title: "Alimento",
            desc: "Los bosques nos dan frutas, nueces y más",
          },
        ]
      : [
          {
            icon: "🌬️",
            title: "Clean Air",
            desc: "Trees produce the oxygen we breathe",
          },
          {
            icon: "💧",
            title: "Pure Water",
            desc: "Forests filter and protect our water sources",
          },
          {
            icon: "🐦",
            title: "Animal Homes",
            desc: "Millions of species depend on forests",
          },
          {
            icon: "🌡️",
            title: "Stable Climate",
            desc: "Trees absorb CO2 and regulate climate",
          },
          {
            icon: "💊",
            title: "Medicines",
            desc: "Many medicines come from forest plants",
          },
          {
            icon: "🍎",
            title: "Food",
            desc: "Forests give us fruits, nuts and more",
          },
        ];

  const threats: Threat[] =
    lang === "es"
      ? [
          {
            id: "deforestation",
            icon: "🪓",
            title: "Deforestación",
            desc: "Tala de bosques para agricultura y desarrollo",
          },
          {
            id: "fire",
            icon: "🔥",
            title: "Incendios",
            desc: "Fuegos forestales que destruyen ecosistemas",
          },
          {
            id: "pollution",
            icon: "🏭",
            title: "Contaminación",
            desc: "Aire y agua contaminados dañan los árboles",
          },
          {
            id: "climate",
            icon: "🌡️",
            title: "Cambio Climático",
            desc: "Temperaturas extremas y sequías",
          },
          {
            id: "pests",
            icon: "🐛",
            title: "Plagas",
            desc: "Insectos y enfermedades invasoras",
          },
          {
            id: "urbanization",
            icon: "🏗️",
            title: "Urbanización",
            desc: "Construcción que destruye hábitats naturales",
          },
        ]
      : [
          {
            id: "deforestation",
            icon: "🪓",
            title: "Deforestation",
            desc: "Cutting forests for agriculture and development",
          },
          {
            id: "fire",
            icon: "🔥",
            title: "Wildfires",
            desc: "Forest fires that destroy ecosystems",
          },
          {
            id: "pollution",
            icon: "🏭",
            title: "Pollution",
            desc: "Contaminated air and water damage trees",
          },
          {
            id: "climate",
            icon: "🌡️",
            title: "Climate Change",
            desc: "Extreme temperatures and droughts",
          },
          {
            id: "pests",
            icon: "🐛",
            title: "Pests",
            desc: "Invasive insects and diseases",
          },
          {
            id: "urbanization",
            icon: "🏗️",
            title: "Urbanization",
            desc: "Construction destroying natural habitats",
          },
        ];

  const conservationActions: ConservationAction[] =
    lang === "es"
      ? [
          {
            id: "plant",
            icon: "🌱",
            title: "Plantar Árboles",
            desc: "Siembra árboles nativos en tu comunidad",
          },
          {
            id: "reduce",
            icon: "♻️",
            title: "Reducir y Reciclar",
            desc: "Usa menos papel y recicla",
          },
          {
            id: "educate",
            icon: "📚",
            title: "Educar",
            desc: "Enseña a otros sobre la conservación",
          },
          {
            id: "support",
            icon: "🤝",
            title: "Apoyar",
            desc: "Apoya organizaciones de conservación",
          },
          {
            id: "report",
            icon: "📢",
            title: "Reportar",
            desc: "Denuncia la tala ilegal",
          },
          {
            id: "visit",
            icon: "🏕️",
            title: "Visitar Parques",
            desc: "Visita y apoya parques nacionales",
          },
          {
            id: "water",
            icon: "💧",
            title: "Ahorrar Agua",
            desc: "El agua protege los bosques",
          },
          {
            id: "local",
            icon: "🛒",
            title: "Comprar Local",
            desc: "Apoya productos sustentables",
          },
        ]
      : [
          {
            id: "plant",
            icon: "🌱",
            title: "Plant Trees",
            desc: "Plant native trees in your community",
          },
          {
            id: "reduce",
            icon: "♻️",
            title: "Reduce & Recycle",
            desc: "Use less paper and recycle",
          },
          {
            id: "educate",
            icon: "📚",
            title: "Educate",
            desc: "Teach others about conservation",
          },
          {
            id: "support",
            icon: "🤝",
            title: "Support",
            desc: "Support conservation organizations",
          },
          {
            id: "report",
            icon: "📢",
            title: "Report",
            desc: "Report illegal logging",
          },
          {
            id: "visit",
            icon: "🏕️",
            title: "Visit Parks",
            desc: "Visit and support national parks",
          },
          {
            id: "water",
            icon: "💧",
            title: "Save Water",
            desc: "Water conservation protects forests",
          },
          {
            id: "local",
            icon: "🛒",
            title: "Buy Local",
            desc: "Support sustainable products",
          },
        ];

  const statusInfo: StatusInfo[] = [
    {
      key: "Critically Endangered",
      color: "bg-red-600",
      icon: "🔴",
      label: t("Critically Endangered", "En Peligro Crítico"),
    },
    {
      key: "Endangered",
      color: "bg-orange-500",
      icon: "🟠",
      label: t("Endangered", "En Peligro"),
    },
    {
      key: "Vulnerable",
      color: "bg-yellow-500",
      icon: "🟡",
      label: "Vulnerable",
    },
    {
      key: "Near Threatened",
      color: "bg-blue-400",
      icon: "🔵",
      label: t("Near Threatened", "Casi Amenazado"),
    },
    {
      key: "Least Concern",
      color: "bg-green-500",
      icon: "🟢",
      label: t("Least Concern", "Preocupación Menor"),
    },
  ];

  const quizQuestions: QuizQuestion[] = [
    {
      question: t(
        "What is the main cause of forest loss worldwide?",
        "¿Cuál es la principal causa de la pérdida de bosques en el mundo?"
      ),
      options:
        lang === "es"
          ? [
              "Incendios naturales",
              "Deforestación para agricultura",
              "Tormentas",
              "Volcanes",
            ]
          : [
              "Natural fires",
              "Deforestation for agriculture",
              "Storms",
              "Volcanoes",
            ],
      correct: 1,
      points: 15,
    },
    {
      question: t(
        "What does it mean when a tree is 'Endangered'?",
        "¿Qué significa que un árbol esté 'En Peligro'?"
      ),
      options:
        lang === "es"
          ? [
              "Está completamente extinto",
              "Tiene alto riesgo de extinción",
              "Es muy común",
              "Es una plaga",
            ]
          : [
              "It's completely extinct",
              "It has high extinction risk",
              "It's very common",
              "It's a pest",
            ],
      correct: 1,
      points: 15,
    },
    {
      question: t(
        "What percentage of Costa Rica's territory is protected?",
        "¿Qué porcentaje del territorio de Costa Rica está protegido?"
      ),
      options: ["5%", "15%", "25%", "50%"],
      correct: 2,
      points: 20,
    },
  ];

  const steps: StepDef[] = [
    { title: labels.step1Title, icon: "🌍" },
    { title: labels.step2Title, icon: "⚠️" },
    { title: labels.step3Title, icon: "📊" },
    { title: labels.step4Title, icon: "🦸" },
    { title: labels.step5Title, icon: "📜" },
  ];

  return {
    labels,
    conservationReasons,
    threats,
    conservationActions,
    statusInfo,
    quizQuestions,
    steps,
  };
}
