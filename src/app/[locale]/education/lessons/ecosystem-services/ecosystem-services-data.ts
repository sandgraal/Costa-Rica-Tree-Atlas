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
  const lang: "en" | "es" = locale === "es" ? "es" : "en";
  const t = (en: string, es: string): string => (lang === "es" ? es : en);

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

  const serviceCategories: ServiceCategory[] =
    lang === "es"
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

  const matchingItems: MatchingItem[] =
    lang === "es"
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
      question: t(
        "What is an example of a provisioning service?",
        "¿Cuál es un ejemplo de servicio de aprovisionamiento?"
      ),
      options:
        lang === "es"
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
      question: t(
        "What type of ecosystem service is pollination?",
        "¿Qué tipo de servicio ecosistémico es la polinización?"
      ),
      options:
        lang === "es"
          ? ["Cultural", "Aprovisionamiento", "Regulación", "Soporte"]
          : ["Cultural", "Provisioning", "Regulating", "Supporting"],
      correct: 2,
      points: 15,
    },
    {
      question: t(
        "Why are forests important for water?",
        "¿Por qué los bosques son importantes para el agua?"
      ),
      options:
        lang === "es"
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
