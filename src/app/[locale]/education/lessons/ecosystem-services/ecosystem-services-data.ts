/**
 * Static lesson data for the Ecosystem Services lesson.
 *
 * This module is imported ONLY by the server-side page.tsx so that
 * the data is serialized in the RSC payload rather than shipped as
 * executable JavaScript in the client bundle.
 */

import { normalizeLocale, selectLocalizedValue } from "@/lib/i18n";

// ============================================================================
// Types (re-exported for the client component)
// ============================================================================

export interface ServiceCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  examples: string[];
}

export interface MatchingItem {
  id: string;
  service: string;
  category: string;
  icon: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  points: number;
}

export interface TreeUseCategory {
  id: string;
  label: string;
  icon: string;
}

export interface StepDef {
  title: string;
  icon: string;
}

export interface EcosystemServicesLabels {
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
  congratulations: string;
  lessonComplete: string;
  tryAgain: string;
  backToEducation: string;
  dragHere: string;
  matched: string;
  discoveredServices: string;
  printPoster: string;
  addToPoster: string;
  yourPosterTitle: string;
  gradeLevel: string;
  introText: string;
  fact1: string;
  fact2: string;
  fact3: string;
  fact4: string;
  clickToDiscover: string;
  dragInstruction: string;
  posterInstruction: string;
  availableElements: string;
  yourPoster: string;
  posterHeading: string;
  naturesGifts: string;
  addElementsPrompt: string;
}

export interface EcosystemServicesLessonData {
  labels: EcosystemServicesLabels;
  serviceCategories: ServiceCategory[];
  matchingItems: MatchingItem[];
  quizQuestions: QuizQuestion[];
  treeUseCategories: TreeUseCategory[];
  steps: StepDef[];
}

// ============================================================================
// Data builder (called from server component)
// ============================================================================

export function getEcosystemServicesLessonData(
  locale: string
): EcosystemServicesLessonData {
  const lang: "en" | "es" = normalizeLocale(locale);
  const t = (en: string, es: string): string =>
    selectLocalizedValue(en, es, lang);

  const labels: EcosystemServicesLabels = {
    title: t("Ecosystem Services", "Servicios Ecosistémicos"),
    subtitle: t(
      "Discover the incredible benefits trees provide us",
      "Descubre los increíbles beneficios que los árboles nos brindan"
    ),
    backToLessons: t("← Back to Lessons", "← Volver a Lecciones"),
    step1Title: t(
      "What Are Ecosystem Services?",
      "¿Qué Son los Servicios Ecosistémicos?"
    ),
    step2Title: t("The 4 Types of Services", "Los 4 Tipos de Servicios"),
    step3Title: t("🎮 Connect the Services", "🎮 Conecta los Servicios"),
    step4Title: t("Trees and Their Uses", "Árboles y Sus Usos"),
    step5Title: t("🎨 Create Your Poster", "🎨 Crea Tu Póster"),
    next: t("Next →", "Siguiente →"),
    previous: t("← Previous", "← Anterior"),
    finish: t("🎉 Finish", "🎉 Finalizar"),
    points: t("points", "puntos"),
    congratulations: t(
      "You're an Ecosystem Expert!",
      "¡Eres un Experto en Ecosistemas!"
    ),
    lessonComplete: t(
      "You've completed the Ecosystem Services lesson",
      "Has completado la lección de Servicios Ecosistémicos"
    ),
    tryAgain: t("🔄 Try Again", "🔄 Intentar de nuevo"),
    backToEducation: t("← Back to Education", "← Volver a Educación"),
    dragHere: t("Drag here", "Arrastra aquí"),
    matched: t("matched", "pareados"),
    discoveredServices: t("Services Discovered", "Servicios Descubiertos"),
    printPoster: t("🖨️ Print Poster", "🖨️ Imprimir Póster"),
    addToPoster: t("Add to Poster", "Agregar al Póster"),
    yourPosterTitle: t(
      "Your Ecosystem Services Poster",
      "Tu Póster de Servicios Ecosistémicos"
    ),
    gradeLevel: t("Grades 5-8", "Grados 5-8"),
    introText: t(
      "Ecosystem services are all the benefits that humans get from nature. Trees and forests are experts at providing these essential services for life.",
      "Los servicios ecosistémicos son todos los beneficios que los humanos obtenemos de la naturaleza. Los árboles y bosques son expertos en brindarnos estos servicios esenciales para la vida."
    ),
    fact1: t(
      "A large tree produces oxygen for 4 people",
      "Un árbol grande produce oxígeno para 4 personas"
    ),
    fact2: t(
      "Forests filter 75% of fresh water",
      "Los bosques filtran el 75% del agua dulce"
    ),
    fact3: t(
      "One tree can cool like 10 air conditioners",
      "Un árbol puede enfriar como 10 aires acondicionados"
    ),
    fact4: t(
      "80% of our food depends on pollinators",
      "80% de nuestros alimentos depende de polinizadores"
    ),
    clickToDiscover: t(
      "Click each category to discover it:",
      "Haz clic en cada categoría para descubrirla:"
    ),
    dragInstruction: t(
      "Drag each service to its correct category:",
      "Arrastra cada servicio a su categoría correcta:"
    ),
    posterInstruction: t(
      "Select at least 3 elements for your ecosystem services poster:",
      "Selecciona al menos 3 elementos para tu póster de servicios ecosistémicos:"
    ),
    availableElements: t("Available Elements", "Elementos Disponibles"),
    yourPoster: t("Your Poster", "Tu Póster"),
    posterHeading: t("Ecosystem Services", "Servicios Ecosistémicos"),
    naturesGifts: t("Nature's gifts", "Los regalos de la naturaleza"),
    addElementsPrompt: t(
      "Add elements to your poster",
      "Agrega elementos a tu póster"
    ),
  };

  const serviceCategories: ServiceCategory[] = [
    {
      id: "provisioning",
      title: t("Provisioning", "Aprovisionamiento"),
      icon: "🍎",
      color: "from-green-500 to-emerald-500",
      description: t(
        "What we get from ecosystems",
        "Lo que obtenemos de los ecosistemas"
      ),
      examples: [
        t("Food", "Alimentos"),
        t("Timber", "Madera"),
        t("Medicines", "Medicinas"),
        t("Fresh water", "Agua dulce"),
        t("Fibers", "Fibras"),
      ],
    },
    {
      id: "regulating",
      title: t("Regulating", "Regulación"),
      icon: "🌡️",
      color: "from-blue-500 to-cyan-500",
      description: t(
        "Benefits from natural regulation",
        "Beneficios de la regulación natural"
      ),
      examples: [
        t("Climate", "Clima"),
        t("Air purification", "Purificación del aire"),
        t("Flood control", "Control de inundaciones"),
        t("Pollination", "Polinización"),
        t("Pest control", "Control de plagas"),
      ],
    },
    {
      id: "cultural",
      title: t("Cultural", "Culturales"),
      icon: "🎨",
      color: "from-purple-500 to-pink-500",
      description: t("Non-material benefits", "Beneficios no materiales"),
      examples: [
        t("Recreation", "Recreación"),
        t("Tourism", "Turismo"),
        t("Spirituality", "Espiritualidad"),
        t("Education", "Educación"),
        t("Aesthetic beauty", "Belleza estética"),
      ],
    },
    {
      id: "supporting",
      title: t("Supporting", "Soporte"),
      icon: "🌱",
      color: "from-yellow-500 to-orange-500",
      description: t(
        "Services needed for other services",
        "Servicios necesarios para otros servicios"
      ),
      examples: [
        t("Nutrient cycling", "Ciclo de nutrientes"),
        t("Soil formation", "Formación de suelo"),
        t("Photosynthesis", "Fotosíntesis"),
        t("Habitat", "Hábitat"),
        t("Water cycle", "Ciclo del agua"),
      ],
    },
  ];

  const matchingItems: MatchingItem[] = [
    {
      id: "oxygen",
      service: t("Oxygen production", "Producción de oxígeno"),
      category: "supporting",
      icon: "🌬️",
    },
    {
      id: "fruit",
      service: t("Fruits and nuts", "Frutas y nueces"),
      category: "provisioning",
      icon: "🥭",
    },
    {
      id: "shade",
      service: t("Shade and cooling", "Sombra y frescura"),
      category: "regulating",
      icon: "☀️",
    },
    {
      id: "beauty",
      service: t("Landscape beauty", "Belleza del paisaje"),
      category: "cultural",
      icon: "🏞️",
    },
    {
      id: "wood",
      service: t("Wood for construction", "Madera para construcción"),
      category: "provisioning",
      icon: "🪵",
    },
    {
      id: "co2",
      service: t("CO2 capture", "Captura de CO2"),
      category: "regulating",
      icon: "🌡️",
    },
    {
      id: "habitat",
      service: t("Home for animals", "Hogar para animales"),
      category: "supporting",
      icon: "🐦",
    },
    {
      id: "recreation",
      service: t("Recreation space", "Espacio para recreación"),
      category: "cultural",
      icon: "🏕️",
    },
  ];

  const quizQuestions: QuizQuestion[] = [
    {
      question: t(
        "What is an example of a provisioning service?",
        "¿Cuál es un ejemplo de servicio de aprovisionamiento?"
      ),
      options: [
        t("Landscape beauty", "Belleza del paisaje"),
        t("Timber and fruits", "Madera y frutas"),
        t("Climate regulation", "Regulación del clima"),
        t("Nutrient cycling", "Ciclo de nutrientes"),
      ],
      correct: 1,
      points: 15,
    },
    {
      question: t(
        "What type of ecosystem service is pollination?",
        "¿Qué tipo de servicio ecosistémico es la polinización?"
      ),
      options: [
        t("Cultural", "Culturales"),
        t("Provisioning", "Aprovisionamiento"),
        t("Regulating", "Regulación"),
        t("Supporting", "Soporte"),
      ],
      correct: 2,
      points: 15,
    },
    {
      question: t(
        "Why are forests important for water?",
        "¿Por qué los bosques son importantes para el agua?"
      ),
      options: [
        t("They don't affect water", "No afectan el agua"),
        t("They filter and store water", "Filtran y almacenan agua"),
        t("They only use water", "Solo usan agua"),
        t("They dry up rivers", "Secan los ríos"),
      ],
      correct: 1,
      points: 20,
    },
  ];

  const treeUseCategories: TreeUseCategory[] = [
    { id: "all", label: t("All", "Todos"), icon: "🌳" },
    { id: "food", label: t("Food", "Alimento"), icon: "🍎" },
    { id: "medicine", label: t("Medicine", "Medicina"), icon: "💊" },
    {
      id: "construction",
      label: t("Construction", "Construcción"),
      icon: "🏗️",
    },
    { id: "shade", label: t("Shade", "Sombra"), icon: "☀️" },
  ];

  const steps: StepDef[] = [
    { title: labels.step1Title, icon: "🌍" },
    { title: labels.step2Title, icon: "📊" },
    { title: labels.step3Title, icon: "🎮" },
    { title: labels.step4Title, icon: "🌳" },
    { title: labels.step5Title, icon: "🎨" },
  ];

  return {
    labels,
    serviceCategories,
    matchingItems,
    quizQuestions,
    treeUseCategories,
    steps,
  };
}
