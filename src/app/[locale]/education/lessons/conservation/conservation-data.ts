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

  const conservationReasons: ConservationReason[] = [
    {
      icon: "🌬️",
      title: t("Clean Air", "Aire Limpio"),
      desc: t(
        "Trees produce the oxygen we breathe",
        "Los árboles producen el oxígeno que respiramos"
      ),
    },
    {
      icon: "💧",
      title: t("Pure Water", "Agua Pura"),
      desc: t(
        "Forests filter and protect our water sources",
        "Los bosques filtran y protegen nuestras fuentes de agua"
      ),
    },
    {
      icon: "🐦",
      title: t("Animal Homes", "Hogar Animal"),
      desc: t(
        "Millions of species depend on forests",
        "Millones de especies dependen de los bosques"
      ),
    },
    {
      icon: "🌡️",
      title: t("Stable Climate", "Clima Estable"),
      desc: t(
        "Trees absorb CO2 and regulate climate",
        "Los árboles absorben CO2 y regulan el clima"
      ),
    },
    {
      icon: "💊",
      title: t("Medicines", "Medicinas"),
      desc: t(
        "Many medicines come from forest plants",
        "Muchas medicinas vienen de plantas del bosque"
      ),
    },
    {
      icon: "🍎",
      title: t("Food", "Alimento"),
      desc: t(
        "Forests give us fruits, nuts and more",
        "Los bosques nos dan frutas, nueces y más"
      ),
    },
  ];

  const threats: Threat[] = [
    {
      id: "deforestation",
      icon: "🪓",
      title: t("Deforestation", "Deforestación"),
      desc: t(
        "Cutting forests for agriculture and development",
        "Tala de bosques para agricultura y desarrollo"
      ),
    },
    {
      id: "fire",
      icon: "🔥",
      title: t("Wildfires", "Incendios"),
      desc: t(
        "Forest fires that destroy ecosystems",
        "Fuegos forestales que destruyen ecosistemas"
      ),
    },
    {
      id: "pollution",
      icon: "🏭",
      title: t("Pollution", "Contaminación"),
      desc: t(
        "Contaminated air and water damage trees",
        "Aire y agua contaminados dañan los árboles"
      ),
    },
    {
      id: "climate",
      icon: "🌡️",
      title: t("Climate Change", "Cambio Climático"),
      desc: t(
        "Extreme temperatures and droughts",
        "Temperaturas extremas y sequías"
      ),
    },
    {
      id: "pests",
      icon: "🐛",
      title: t("Pests", "Plagas"),
      desc: t(
        "Invasive insects and diseases",
        "Insectos y enfermedades invasoras"
      ),
    },
    {
      id: "urbanization",
      icon: "🏗️",
      title: t("Urbanization", "Urbanización"),
      desc: t(
        "Construction destroying natural habitats",
        "Construcción que destruye hábitats naturales"
      ),
    },
  ];

  const conservationActions: ConservationAction[] = [
    {
      id: "plant",
      icon: "🌱",
      title: t("Plant Trees", "Plantar Árboles"),
      desc: t(
        "Plant native trees in your community",
        "Siembra árboles nativos en tu comunidad"
      ),
    },
    {
      id: "reduce",
      icon: "♻️",
      title: t("Reduce & Recycle", "Reducir y Reciclar"),
      desc: t("Use less paper and recycle", "Usa menos papel y recicla"),
    },
    {
      id: "educate",
      icon: "📚",
      title: t("Educate", "Educar"),
      desc: t(
        "Teach others about conservation",
        "Enseña a otros sobre la conservación"
      ),
    },
    {
      id: "support",
      icon: "🤝",
      title: t("Support", "Apoyar"),
      desc: t(
        "Support conservation organizations",
        "Apoya organizaciones de conservación"
      ),
    },
    {
      id: "report",
      icon: "📢",
      title: t("Report", "Reportar"),
      desc: t("Report illegal logging", "Denuncia la tala ilegal"),
    },
    {
      id: "visit",
      icon: "🏕️",
      title: t("Visit Parks", "Visitar Parques"),
      desc: t(
        "Visit and support national parks",
        "Visita y apoya parques nacionales"
      ),
    },
    {
      id: "water",
      icon: "💧",
      title: t("Save Water", "Ahorrar Agua"),
      desc: t(
        "Water conservation protects forests",
        "El agua protege los bosques"
      ),
    },
    {
      id: "local",
      icon: "🛒",
      title: t("Buy Local", "Comprar Local"),
      desc: t("Support sustainable products", "Apoya productos sustentables"),
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
      options: [
        t("Natural fires", "Incendios naturales"),
        t("Deforestation for agriculture", "Deforestación para agricultura"),
        t("Storms", "Tormentas"),
        t("Volcanoes", "Volcanes"),
      ],
      correct: 1,
      points: 15,
    },
    {
      question: t(
        "What does it mean when a tree is 'Endangered'?",
        "¿Qué significa que un árbol esté 'En Peligro'?"
      ),
      options: [
        t("It's completely extinct", "Está completamente extinto"),
        t("It has high extinction risk", "Tiene alto riesgo de extinción"),
        t("It's very common", "Es muy común"),
        t("It's a pest", "Es una plaga"),
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
