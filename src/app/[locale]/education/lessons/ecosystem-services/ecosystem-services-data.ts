/**
 * Static lesson data for the Ecosystem Services lesson.
 *
 * This module is imported ONLY by the server-side page.tsx so that
 * the data is serialized in the RSC payload rather than shipped as
 * executable JavaScript in the client bundle.
 */

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
  const isEs = locale === "es";

  const labels: EcosystemServicesLabels = {
    title: isEs ? "Servicios Ecosistémicos" : "Ecosystem Services",
    subtitle: isEs
      ? "Descubre los increíbles beneficios que los árboles nos brindan"
      : "Discover the incredible benefits trees provide us",
    backToLessons: isEs ? "← Volver a Lecciones" : "← Back to Lessons",
    step1Title: isEs
      ? "¿Qué Son los Servicios Ecosistémicos?"
      : "What Are Ecosystem Services?",
    step2Title: isEs ? "Los 4 Tipos de Servicios" : "The 4 Types of Services",
    step3Title: isEs ? "🎮 Conecta los Servicios" : "🎮 Connect the Services",
    step4Title: isEs ? "Árboles y Sus Usos" : "Trees and Their Uses",
    step5Title: isEs ? "🎨 Crea Tu Póster" : "🎨 Create Your Poster",
    next: isEs ? "Siguiente →" : "Next →",
    previous: isEs ? "← Anterior" : "← Previous",
    finish: isEs ? "🎉 Finalizar" : "🎉 Finish",
    points: isEs ? "puntos" : "points",
    congratulations: isEs
      ? "¡Eres un Experto en Ecosistemas!"
      : "You're an Ecosystem Expert!",
    lessonComplete: isEs
      ? "Has completado la lección de Servicios Ecosistémicos"
      : "You've completed the Ecosystem Services lesson",
    tryAgain: isEs ? "🔄 Intentar de nuevo" : "🔄 Try Again",
    backToEducation: isEs ? "← Volver a Educación" : "← Back to Education",
    dragHere: isEs ? "Arrastra aquí" : "Drag here",
    matched: isEs ? "pareados" : "matched",
    discoveredServices: isEs ? "Servicios Descubiertos" : "Services Discovered",
    printPoster: isEs ? "🖨️ Imprimir Póster" : "🖨️ Print Poster",
    addToPoster: isEs ? "Agregar al Póster" : "Add to Poster",
    yourPosterTitle: isEs
      ? "Tu Póster de Servicios Ecosistémicos"
      : "Your Ecosystem Services Poster",
    gradeLevel: isEs ? "Grados 5-8" : "Grades 5-8",
    introText: isEs
      ? "Los servicios ecosistémicos son todos los beneficios que los humanos obtenemos de la naturaleza. Los árboles y bosques son expertos en brindarnos estos servicios esenciales para la vida."
      : "Ecosystem services are all the benefits that humans get from nature. Trees and forests are experts at providing these essential services for life.",
    fact1: isEs
      ? "Un árbol grande produce oxígeno para 4 personas"
      : "A large tree produces oxygen for 4 people",
    fact2: isEs
      ? "Los bosques filtran el 75% del agua dulce"
      : "Forests filter 75% of fresh water",
    fact3: isEs
      ? "Un árbol puede enfriar como 10 aires acondicionados"
      : "One tree can cool like 10 air conditioners",
    fact4: isEs
      ? "80% de nuestros alimentos depende de polinizadores"
      : "80% of our food depends on pollinators",
    clickToDiscover: isEs
      ? "Haz clic en cada categoría para descubrirla:"
      : "Click each category to discover it:",
    dragInstruction: isEs
      ? "Arrastra cada servicio a su categoría correcta:"
      : "Drag each service to its correct category:",
    posterInstruction: isEs
      ? "Selecciona al menos 3 elementos para tu póster de servicios ecosistémicos:"
      : "Select at least 3 elements for your ecosystem services poster:",
    availableElements: isEs ? "Elementos Disponibles" : "Available Elements",
    yourPoster: isEs ? "Tu Póster" : "Your Poster",
    posterHeading: isEs ? "Servicios Ecosistémicos" : "Ecosystem Services",
    naturesGifts: isEs ? "Los regalos de la naturaleza" : "Nature's gifts",
    addElementsPrompt: isEs
      ? "Agrega elementos a tu póster"
      : "Add elements to your poster",
  };

  const serviceCategories: ServiceCategory[] = isEs
    ? [
        {
          id: "provisioning",
          title: "Aprovisionamiento",
          icon: "🍎",
          color: "from-green-500 to-emerald-500",
          description: "Lo que obtenemos de los ecosistemas",
          examples: [
            "Alimentos",
            "Madera",
            "Medicinas",
            "Agua dulce",
            "Fibras",
          ],
        },
        {
          id: "regulating",
          title: "Regulación",
          icon: "🌡️",
          color: "from-blue-500 to-cyan-500",
          description: "Beneficios de la regulación natural",
          examples: [
            "Clima",
            "Purificación del aire",
            "Control de inundaciones",
            "Polinización",
            "Control de plagas",
          ],
        },
        {
          id: "cultural",
          title: "Culturales",
          icon: "🎨",
          color: "from-purple-500 to-pink-500",
          description: "Beneficios no materiales",
          examples: [
            "Recreación",
            "Turismo",
            "Espiritualidad",
            "Educación",
            "Belleza estética",
          ],
        },
        {
          id: "supporting",
          title: "Soporte",
          icon: "🌱",
          color: "from-yellow-500 to-orange-500",
          description: "Servicios necesarios para otros servicios",
          examples: [
            "Ciclo de nutrientes",
            "Formación de suelo",
            "Fotosíntesis",
            "Hábitat",
            "Ciclo del agua",
          ],
        },
      ]
    : [
        {
          id: "provisioning",
          title: "Provisioning",
          icon: "🍎",
          color: "from-green-500 to-emerald-500",
          description: "What we get from ecosystems",
          examples: ["Food", "Timber", "Medicines", "Fresh water", "Fibers"],
        },
        {
          id: "regulating",
          title: "Regulating",
          icon: "🌡️",
          color: "from-blue-500 to-cyan-500",
          description: "Benefits from natural regulation",
          examples: [
            "Climate",
            "Air purification",
            "Flood control",
            "Pollination",
            "Pest control",
          ],
        },
        {
          id: "cultural",
          title: "Cultural",
          icon: "🎨",
          color: "from-purple-500 to-pink-500",
          description: "Non-material benefits",
          examples: [
            "Recreation",
            "Tourism",
            "Spirituality",
            "Education",
            "Aesthetic beauty",
          ],
        },
        {
          id: "supporting",
          title: "Supporting",
          icon: "🌱",
          color: "from-yellow-500 to-orange-500",
          description: "Services needed for other services",
          examples: [
            "Nutrient cycling",
            "Soil formation",
            "Photosynthesis",
            "Habitat",
            "Water cycle",
          ],
        },
      ];

  const matchingItems: MatchingItem[] = isEs
    ? [
        {
          id: "oxygen",
          service: "Producción de oxígeno",
          category: "supporting",
          icon: "🌬️",
        },
        {
          id: "fruit",
          service: "Frutas y nueces",
          category: "provisioning",
          icon: "🥭",
        },
        {
          id: "shade",
          service: "Sombra y frescura",
          category: "regulating",
          icon: "☀️",
        },
        {
          id: "beauty",
          service: "Belleza del paisaje",
          category: "cultural",
          icon: "🏞️",
        },
        {
          id: "wood",
          service: "Madera para construcción",
          category: "provisioning",
          icon: "🪵",
        },
        {
          id: "co2",
          service: "Captura de CO2",
          category: "regulating",
          icon: "🌡️",
        },
        {
          id: "habitat",
          service: "Hogar para animales",
          category: "supporting",
          icon: "🐦",
        },
        {
          id: "recreation",
          service: "Espacio para recreación",
          category: "cultural",
          icon: "🏕️",
        },
      ]
    : [
        {
          id: "oxygen",
          service: "Oxygen production",
          category: "supporting",
          icon: "🌬️",
        },
        {
          id: "fruit",
          service: "Fruits and nuts",
          category: "provisioning",
          icon: "🥭",
        },
        {
          id: "shade",
          service: "Shade and cooling",
          category: "regulating",
          icon: "☀️",
        },
        {
          id: "beauty",
          service: "Landscape beauty",
          category: "cultural",
          icon: "🏞️",
        },
        {
          id: "wood",
          service: "Wood for construction",
          category: "provisioning",
          icon: "🪵",
        },
        {
          id: "co2",
          service: "CO2 capture",
          category: "regulating",
          icon: "🌡️",
        },
        {
          id: "habitat",
          service: "Home for animals",
          category: "supporting",
          icon: "🐦",
        },
        {
          id: "recreation",
          service: "Recreation space",
          category: "cultural",
          icon: "🏕️",
        },
      ];

  const quizQuestions: QuizQuestion[] = [
    {
      question: isEs
        ? "¿Cuál es un ejemplo de servicio de aprovisionamiento?"
        : "What is an example of a provisioning service?",
      options: isEs
        ? [
            "Belleza del paisaje",
            "Madera y frutas",
            "Regulación del clima",
            "Ciclo de nutrientes",
          ]
        : [
            "Landscape beauty",
            "Timber and fruits",
            "Climate regulation",
            "Nutrient cycling",
          ],
      correct: 1,
      points: 15,
    },
    {
      question: isEs
        ? "¿Qué tipo de servicio ecosistémico es la polinización?"
        : "What type of ecosystem service is pollination?",
      options: isEs
        ? ["Cultural", "Aprovisionamiento", "Regulación", "Soporte"]
        : ["Cultural", "Provisioning", "Regulating", "Supporting"],
      correct: 2,
      points: 15,
    },
    {
      question: isEs
        ? "¿Por qué los bosques son importantes para el agua?"
        : "Why are forests important for water?",
      options: isEs
        ? [
            "No afectan el agua",
            "Filtran y almacenan agua",
            "Solo usan agua",
            "Secan los ríos",
          ]
        : [
            "They don't affect water",
            "They filter and store water",
            "They only use water",
            "They dry up rivers",
          ],
      correct: 1,
      points: 20,
    },
  ];

  const treeUseCategories: TreeUseCategory[] = [
    { id: "all", label: isEs ? "Todos" : "All", icon: "🌳" },
    { id: "food", label: isEs ? "Alimento" : "Food", icon: "🍎" },
    { id: "medicine", label: isEs ? "Medicina" : "Medicine", icon: "💊" },
    {
      id: "construction",
      label: isEs ? "Construcción" : "Construction",
      icon: "🏗️",
    },
    { id: "shade", label: isEs ? "Sombra" : "Shade", icon: "☀️" },
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
