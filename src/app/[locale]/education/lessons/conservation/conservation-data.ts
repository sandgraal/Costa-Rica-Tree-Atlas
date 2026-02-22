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
  const isEs = locale === "es";

  const labels: ConservationLabels = {
    title: isEs ? "Conservación y Amenazas" : "Conservation and Threats",
    subtitle: isEs
      ? "Aprende a proteger los árboles de Costa Rica"
      : "Learn to protect Costa Rica's trees",
    backToLessons: isEs ? "← Volver a Lecciones" : "← Back to Lessons",
    step1Title: isEs ? "¿Por qué Conservar?" : "Why Conserve?",
    step2Title: isEs ? "Amenazas a los Bosques" : "Threats to Forests",
    step3Title: isEs ? "Estados de Conservación" : "Conservation Status",
    step4Title: isEs ? "🦸 Toma Acción" : "🦸 Take Action",
    step5Title: isEs ? "📜 Tu Compromiso" : "📜 Your Pledge",
    next: isEs ? "Siguiente →" : "Next →",
    previous: isEs ? "← Anterior" : "← Previous",
    finish: isEs ? "🎉 Finalizar" : "🎉 Finish",
    points: isEs ? "puntos" : "points",
    selected: isEs ? "seleccionados" : "selected",
    congratulations: isEs
      ? "¡Felicidades, Defensor de los Bosques!"
      : "Congratulations, Forest Defender!",
    lessonComplete: isEs
      ? "Has completado la lección de Conservación"
      : "You've completed the Conservation lesson",
    tryAgain: isEs ? "🔄 Intentar de nuevo" : "🔄 Try Again",
    nextLesson: isEs ? "Siguiente Lección →" : "Next Lesson →",
    adoptTree: isEs ? "Adoptar un Árbol" : "Adopt a Tree",
    yourAdoptedTree: isEs ? "Tu Árbol Adoptado" : "Your Adopted Tree",
    selectActions: isEs
      ? "Selecciona 3 acciones que puedes hacer"
      : "Select 3 actions you can take",
    signPledge: isEs ? "Firmar Compromiso" : "Sign Pledge",
    yourName: isEs ? "Tu nombre" : "Your name",
    pledgeText: isEs
      ? "Me comprometo a proteger los árboles y bosques de Costa Rica"
      : "I pledge to protect the trees and forests of Costa Rica",
  };

  const conservationReasons: ConservationReason[] = isEs
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

  const threats: Threat[] = isEs
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

  const conservationActions: ConservationAction[] = isEs
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
      label: isEs ? "En Peligro Crítico" : "Critically Endangered",
    },
    {
      key: "Endangered",
      color: "bg-orange-500",
      icon: "🟠",
      label: isEs ? "En Peligro" : "Endangered",
    },
    {
      key: "Vulnerable",
      color: "bg-yellow-500",
      icon: "🟡",
      label: isEs ? "Vulnerable" : "Vulnerable",
    },
    {
      key: "Near Threatened",
      color: "bg-blue-400",
      icon: "🔵",
      label: isEs ? "Casi Amenazado" : "Near Threatened",
    },
    {
      key: "Least Concern",
      color: "bg-green-500",
      icon: "🟢",
      label: isEs ? "Preocupación Menor" : "Least Concern",
    },
  ];

  const quizQuestions: QuizQuestion[] = [
    {
      question: isEs
        ? "¿Cuál es la principal causa de la pérdida de bosques en el mundo?"
        : "What is the main cause of forest loss worldwide?",
      options: isEs
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
      question: isEs
        ? "¿Qué significa que un árbol esté 'En Peligro'?"
        : "What does it mean when a tree is 'Endangered'?",
      options: isEs
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
      question: isEs
        ? "¿Qué porcentaje del territorio de Costa Rica está protegido?"
        : "What percentage of Costa Rica's territory is protected?",
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
