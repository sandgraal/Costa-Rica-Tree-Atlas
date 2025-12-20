"use client";

import { useState, useEffect } from "react";
import { Link } from "@i18n/navigation";
import Image from "next/image";
import {
  EducationProgressProvider,
  useEducationProgress,
} from "@/components/EducationProgress";
import { triggerConfetti, injectEducationStyles, type LessonTreeData } from "@/lib/education";

interface ConservationLessonClientProps {
  trees: LessonTreeData[];
  locale: string;
  statusCounts: Record<string, number>;
  endangeredTrees: LessonTreeData[];
}

export default function ConservationLessonClient(
  props: ConservationLessonClientProps
) {
  return (
    <EducationProgressProvider>
      <ConservationLessonContent {...props} />
    </EducationProgressProvider>
  );
}

function ConservationLessonContent({
  locale,
  statusCounts,
  endangeredTrees,
}: ConservationLessonClientProps) {
  const { markLessonComplete } = useEducationProgress();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedThreats, setSelectedThreats] = useState<string[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [pledgeSigned, setPledgeSigned] = useState(false);
  const [pledgeName, setPledgeName] = useState("");
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizFeedback, setQuizFeedback] = useState<Record<number, boolean>>({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [adoptedTree, setAdoptedTree] = useState<LessonTreeData | null>(null);

  useEffect(() => {
    injectEducationStyles();
  }, []);

  const t = {
    title:
      locale === "es" ? "Conservación y Amenazas" : "Conservation and Threats",
    subtitle:
      locale === "es"
        ? "Aprende a proteger los árboles de Costa Rica"
        : "Learn to protect Costa Rica's trees",
    backToLessons:
      locale === "es" ? "← Volver a Lecciones" : "← Back to Lessons",
    step1Title: locale === "es" ? "¿Por qué Conservar?" : "Why Conserve?",
    step2Title:
      locale === "es" ? "Amenazas a los Bosques" : "Threats to Forests",
    step3Title:
      locale === "es" ? "Estados de Conservación" : "Conservation Status",
    step4Title: locale === "es" ? "🦸 Toma Acción" : "🦸 Take Action",
    step5Title: locale === "es" ? "📜 Tu Compromiso" : "📜 Your Pledge",
    next: locale === "es" ? "Siguiente →" : "Next →",
    previous: locale === "es" ? "← Anterior" : "← Previous",
    finish: locale === "es" ? "🎉 Finalizar" : "🎉 Finish",
    points: locale === "es" ? "puntos" : "points",
    selected: locale === "es" ? "seleccionados" : "selected",
    congratulations:
      locale === "es"
        ? "¡Felicidades, Defensor de los Bosques!"
        : "Congratulations, Forest Defender!",
    lessonComplete:
      locale === "es"
        ? "Has completado la lección de Conservación"
        : "You've completed the Conservation lesson",
    tryAgain: locale === "es" ? "🔄 Intentar de nuevo" : "🔄 Try Again",
    nextLesson: locale === "es" ? "Siguiente Lección →" : "Next Lesson →",
    adoptTree: locale === "es" ? "Adoptar un Árbol" : "Adopt a Tree",
    yourAdoptedTree:
      locale === "es" ? "Tu Árbol Adoptado" : "Your Adopted Tree",
    selectActions:
      locale === "es"
        ? "Selecciona 3 acciones que puedes hacer"
        : "Select 3 actions you can take",
    signPledge: locale === "es" ? "Firmar Compromiso" : "Sign Pledge",
    yourName: locale === "es" ? "Tu nombre" : "Your name",
    pledgeText:
      locale === "es"
        ? "Me comprometo a proteger los árboles y bosques de Costa Rica"
        : "I pledge to protect the trees and forests of Costa Rica",
  };

  const conservationReasons =
    locale === "es"
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

  const threats =
    locale === "es"
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

  const conservationActions =
    locale === "es"
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

  const statusInfo = [
    {
      key: "Critically Endangered",
      color: "bg-red-600",
      icon: "🔴",
      label: locale === "es" ? "En Peligro Crítico" : "Critically Endangered",
    },
    {
      key: "Endangered",
      color: "bg-orange-500",
      icon: "🟠",
      label: locale === "es" ? "En Peligro" : "Endangered",
    },
    {
      key: "Vulnerable",
      color: "bg-yellow-500",
      icon: "🟡",
      label: locale === "es" ? "Vulnerable" : "Vulnerable",
    },
    {
      key: "Near Threatened",
      color: "bg-blue-400",
      icon: "🔵",
      label: locale === "es" ? "Casi Amenazado" : "Near Threatened",
    },
    {
      key: "Least Concern",
      color: "bg-green-500",
      icon: "🟢",
      label: locale === "es" ? "Preocupación Menor" : "Least Concern",
    },
  ];

  const quizQuestions = [
    {
      question:
        locale === "es"
          ? "¿Cuál es la principal causa de la pérdida de bosques en el mundo?"
          : "What is the main cause of forest loss worldwide?",
      options:
        locale === "es"
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
      question:
        locale === "es"
          ? "¿Qué significa que un árbol esté 'En Peligro'?"
          : "What does it mean when a tree is 'Endangered'?",
      options:
        locale === "es"
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
      question:
        locale === "es"
          ? "¿Qué porcentaje del territorio de Costa Rica está protegido?"
          : "What percentage of Costa Rica's territory is protected?",
      options: ["5%", "15%", "25%", "50%"],
      correct: 2,
      points: 20,
    },
  ];

  const steps = [
    { title: t.step1Title, icon: "🌍" },
    { title: t.step2Title, icon: "⚠️" },
    { title: t.step3Title, icon: "📊" },
    { title: t.step4Title, icon: "🦸" },
    { title: t.step5Title, icon: "📜" },
  ];

  const handleThreatSelect = (threatId: string) => {
    if (selectedThreats.includes(threatId)) {
      setSelectedThreats((prev) => prev.filter((t) => t !== threatId));
    } else if (selectedThreats.length < 3) {
      setSelectedThreats((prev) => [...prev, threatId]);
      if (selectedThreats.length === 2) {
        setTotalPoints((prev) => prev + 15);
      }
    }
  };

  const handleActionSelect = (actionId: string) => {
    if (selectedActions.includes(actionId)) {
      setSelectedActions((prev) => prev.filter((a) => a !== actionId));
    } else if (selectedActions.length < 3) {
      setSelectedActions((prev) => [...prev, actionId]);
      if (selectedActions.length === 2) {
        setTotalPoints((prev) => prev + 20);
        triggerConfetti();
      }
    }
  };

  const handleQuizAnswer = (qIndex: number, aIndex: number) => {
    if (quizFeedback[qIndex] !== undefined) return;
    setQuizAnswers((prev) => ({ ...prev, [qIndex]: aIndex }));
    const isCorrect = aIndex === quizQuestions[qIndex].correct;
    setQuizFeedback((prev) => ({ ...prev, [qIndex]: isCorrect }));
    if (isCorrect) {
      setTotalPoints((prev) => prev + quizQuestions[qIndex].points);
    }
  };

  const handleSignPledge = () => {
    if (pledgeName.trim()) {
      setPledgeSigned(true);
      setTotalPoints((prev) => prev + 50);
      triggerConfetti();
    }
  };

  const handleFinish = () => {
    const correctQuizAnswers = Object.entries(quizFeedback).filter(
      ([, correct]) => correct
    ).length;
    const percentage =
      quizFeedback && Object.keys(quizFeedback).length > 0
        ? Math.round(
            (correctQuizAnswers / Object.keys(quizFeedback).length) * 100
          )
        : 100; // Give full credit if no quiz
    markLessonComplete("conservation", percentage, totalPoints);
    setShowResults(true);
    if (totalPoints >= 100) triggerConfetti();
  };

  const canProceed = () => {
    if (currentStep === 1) return selectedThreats.length >= 3;
    if (currentStep === 3) return selectedActions.length >= 3;
    if (currentStep === 4) return pledgeSigned;
    return true;
  };

  const resetLesson = () => {
    setCurrentStep(0);
    setSelectedThreats([]);
    setSelectedActions([]);
    setPledgeSigned(false);
    setPledgeName("");
    setQuizAnswers({});
    setQuizFeedback({});
    setTotalPoints(0);
    setShowResults(false);
    setAdoptedTree(null);
  };

  if (showResults) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="text-center animate-bounce-in">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-8 shadow-lg animate-pulse-slow">
            <span className="text-7xl">🌳</span>
          </div>
          <h1 className="text-4xl font-bold text-primary mb-4">
            {t.congratulations}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {t.lessonComplete}
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20">
              <div className="text-5xl font-bold text-green-600 mb-2">
                {totalPoints}
              </div>
              <div className="text-muted-foreground">{t.points}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-blue-500/20">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {selectedActions.length}
              </div>
              <div className="text-muted-foreground">
                {locale === "es" ? "Acciones Prometidas" : "Actions Pledged"}
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl p-6 border border-yellow-500/20">
              <div className="text-5xl mb-2">🏆</div>
              <div className="text-muted-foreground">
                {locale === "es" ? "Defensor del Bosque" : "Forest Defender"}
              </div>
            </div>
          </div>

          {pledgeSigned && (
            <div className="bg-card rounded-2xl p-6 border border-border mb-8 max-w-md mx-auto">
              <div className="text-4xl mb-2">📜</div>
              <p className="text-lg font-medium mb-2">{t.pledgeText}</p>
              <p className="text-primary font-bold text-xl">{pledgeName}</p>
            </div>
          )}

          {adoptedTree && (
            <div className="bg-card rounded-2xl p-6 border border-border mb-8 max-w-md mx-auto">
              <h3 className="font-semibold mb-4 flex items-center justify-center gap-2">
                <span>🌳</span> {t.yourAdoptedTree}
              </h3>
              {adoptedTree.featuredImage && (
                <div className="aspect-video relative rounded-xl overflow-hidden mb-4">
                  <Image
                    src={adoptedTree.featuredImage}
                    alt={adoptedTree.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="font-medium">{adoptedTree.title}</div>
              <div className="text-sm text-muted-foreground italic">
                {adoptedTree.scientificName}
              </div>
              <Link
                href={`/trees/${adoptedTree.slug}`}
                className="inline-block mt-3 text-primary hover:underline text-sm"
              >
                {locale === "es" ? "Ver en el Atlas →" : "View in Atlas →"}
              </Link>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={resetLesson}
              className="px-6 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors"
            >
              {t.tryAgain}
            </button>
            <Link
              href="/education/lessons/ecosystem-services"
              className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
            >
              {t.nextLesson}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/education/lessons"
          className="text-sm text-muted-foreground hover:text-primary mb-4 inline-flex items-center gap-1 transition-colors"
        >
          {t.backToLessons}
        </Link>
        <div className="flex items-start gap-4 mt-4">
          <div className="text-5xl animate-bounce-in">🛡️</div>
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">{t.title}</h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">
                {locale === "es" ? "Grados 4-7" : "Grades 4-7"}
              </span>
              <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full">
                ⏱️ 40 min
              </span>
              {totalPoints > 0 && (
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 rounded-full font-medium">
                  ⭐ {totalPoints} {t.points}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, i) => (
            <button
              key={i}
              onClick={() => i <= currentStep && setCurrentStep(i)}
              disabled={i > currentStep}
              className={`relative flex flex-col items-center gap-1 transition-all ${i <= currentStep ? "cursor-pointer" : "cursor-not-allowed"}`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                  i === currentStep
                    ? "bg-primary text-white scale-110 shadow-lg"
                    : i < currentStep
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i < currentStep ? "✓" : step.icon}
              </div>
              <span
                className={`text-xs hidden sm:block ${i === currentStep ? "text-primary font-medium" : "text-muted-foreground"}`}
              >
                {i + 1}
              </span>
            </button>
          ))}
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-2xl p-8 mb-8 min-h-[400px]">
        {/* Step 0: Why Conserve */}
        {currentStep === 0 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <span className="text-3xl">🌍</span>
              {steps[0].title}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              {locale === "es"
                ? "Los bosques son esenciales para la vida en la Tierra. Descubre por qué debemos protegerlos."
                : "Forests are essential for life on Earth. Discover why we must protect them."}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {conservationReasons.map((reason, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 text-center hover:scale-105 transition-transform animate-slide-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="text-4xl mb-2">{reason.icon}</div>
                  <div className="font-semibold text-foreground mb-1">
                    {reason.title}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {reason.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Threats */}
        {currentStep === 1 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              {steps[1].title}
            </h2>
            <p className="text-muted-foreground mb-4">
              {locale === "es"
                ? "Selecciona las 3 amenazas más graves:"
                : "Select the 3 most serious threats:"}
            </p>
            <div className="bg-muted rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">
                  {selectedThreats.length}
                </span>
                <span className="text-muted-foreground">/ 3 {t.selected}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {threats.map((threat) => {
                const isSelected = selectedThreats.includes(threat.id);
                return (
                  <button
                    key={threat.id}
                    onClick={() => handleThreatSelect(threat.id)}
                    disabled={!isSelected && selectedThreats.length >= 3}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? "border-red-500 bg-red-500/10 scale-105"
                        : selectedThreats.length >= 3
                          ? "border-border opacity-50 cursor-not-allowed"
                          : "border-border hover:border-red-500/50 hover:bg-muted/50"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm">
                        ✓
                      </div>
                    )}
                    <div className="text-3xl mb-2">{threat.icon}</div>
                    <div className="font-medium">{threat.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {threat.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Conservation Status */}
        {currentStep === 2 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <span className="text-3xl">📊</span>
              {steps[2].title}
            </h2>

            {/* IUCN Status Legend */}
            <div className="bg-muted/50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold mb-3">
                {locale === "es" ? "Categorías UICN" : "IUCN Categories"}
              </h3>
              <div className="space-y-2">
                {statusInfo.map((status) => (
                  <div key={status.key} className="flex items-center gap-3">
                    <span className="text-lg">{status.icon}</span>
                    <span className={`w-4 h-4 rounded-full ${status.color}`} />
                    <span className="font-medium">{status.label}</span>
                    <span className="text-sm text-muted-foreground ml-auto">
                      {statusCounts[status.key] || 0}{" "}
                      {locale === "es" ? "árboles" : "trees"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz */}
            <div className="space-y-4">
              {quizQuestions.map((q, qIndex) => {
                const isAnswered = quizFeedback[qIndex] !== undefined;
                const isCorrect = quizFeedback[qIndex];
                return (
                  <div
                    key={qIndex}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isAnswered
                        ? isCorrect
                          ? "border-green-500 bg-green-500/5"
                          : "border-red-500 bg-red-500/5"
                        : "border-border"
                    }`}
                  >
                    <p className="font-medium mb-3">{q.question}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, oIndex) => {
                        const isSelected = quizAnswers[qIndex] === oIndex;
                        const isCorrectAnswer = oIndex === q.correct;
                        return (
                          <button
                            key={oIndex}
                            onClick={() => handleQuizAnswer(qIndex, oIndex)}
                            disabled={isAnswered}
                            className={`p-3 rounded-lg border text-left text-sm transition-all ${
                              isAnswered
                                ? isCorrectAnswer
                                  ? "border-green-500 bg-green-500/10"
                                  : isSelected
                                    ? "border-red-500 bg-red-500/10"
                                    : "border-border opacity-50"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Endangered Trees */}
            {endangeredTrees.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span>🚨</span>{" "}
                  {locale === "es" ? "Árboles en Peligro" : "Endangered Trees"}
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {endangeredTrees.slice(0, 5).map((tree) => (
                    <div
                      key={tree.slug}
                      className="flex-shrink-0 w-40 bg-red-500/5 border border-red-500/20 rounded-xl p-3"
                    >
                      {tree.featuredImage && (
                        <div className="aspect-square relative rounded-lg overflow-hidden mb-2">
                          <Image
                            src={tree.featuredImage}
                            alt={tree.title}
                            fill
                            sizes="100px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="text-sm font-medium truncate">
                        {tree.title}
                      </div>
                      <div className="text-xs text-red-600">
                        {tree.conservationStatus}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Take Action */}
        {currentStep === 3 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
              {steps[3].title}
            </h2>
            <p className="text-muted-foreground mb-4">{t.selectActions}</p>

            <div className="bg-muted rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">
                  {selectedActions.length}
                </span>
                <span className="text-muted-foreground">/ 3 {t.selected}</span>
              </div>
              {selectedActions.length >= 3 && (
                <div className="mt-2 text-center text-green-600 font-medium animate-bounce-in">
                  🎉{" "}
                  {locale === "es"
                    ? "¡Excelente elección!"
                    : "Excellent choices!"}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {conservationActions.map((action) => {
                const isSelected = selectedActions.includes(action.id);
                return (
                  <button
                    key={action.id}
                    onClick={() => handleActionSelect(action.id)}
                    disabled={!isSelected && selectedActions.length >= 3}
                    className={`relative p-4 rounded-xl border-2 text-center transition-all ${
                      isSelected
                        ? "border-green-500 bg-green-500/10 scale-105"
                        : selectedActions.length >= 3
                          ? "border-border opacity-50 cursor-not-allowed"
                          : "border-border hover:border-green-500/50 hover:bg-muted/50"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm animate-bounce-in">
                        ✓
                      </div>
                    )}
                    <div className="text-3xl mb-2">{action.icon}</div>
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {action.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Pledge */}
        {currentStep === 4 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              {steps[4].title}
            </h2>

            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20 text-center mb-6">
                <div className="text-6xl mb-4">📜</div>
                <p className="text-lg font-medium mb-4">{t.pledgeText}</p>

                {!pledgeSigned ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={pledgeName}
                      onChange={(e) => setPledgeName(e.target.value)}
                      placeholder={t.yourName}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={handleSignPledge}
                      disabled={!pledgeName.trim()}
                      className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ✍️ {t.signPledge}
                    </button>
                  </div>
                ) : (
                  <div className="animate-bounce-in">
                    <div className="text-4xl mb-2">✅</div>
                    <p className="text-green-600 font-bold text-xl">
                      {pledgeName}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {locale === "es"
                        ? "¡Gracias por tu compromiso!"
                        : "Thank you for your commitment!"}
                    </p>
                  </div>
                )}
              </div>

              {/* Adopt a Tree */}
              {pledgeSigned && !adoptedTree && endangeredTrees.length > 0 && (
                <div className="bg-card rounded-xl p-4 border border-border">
                  <h3 className="font-semibold mb-3 text-center">
                    {t.adoptTree}
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {endangeredTrees.slice(0, 6).map((tree) => (
                      <button
                        key={tree.slug}
                        onClick={() => {
                          setAdoptedTree(tree);
                          setTotalPoints((prev) => prev + 25);
                        }}
                        className="p-2 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all"
                      >
                        {tree.featuredImage && (
                          <div className="aspect-square relative rounded-lg overflow-hidden mb-1">
                            <Image
                              src={tree.featuredImage}
                              alt={tree.title}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="text-xs font-medium truncate">
                          {tree.title}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {adoptedTree && (
                <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20 text-center animate-bounce-in">
                  <div className="text-2xl mb-2">🌳</div>
                  <p className="font-medium">{t.yourAdoptedTree}:</p>
                  <p className="text-primary font-bold">{adoptedTree.title}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
          className="px-6 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t.previous}
        </button>
        {currentStep < steps.length - 1 ? (
          <button
            onClick={() =>
              setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))
            }
            disabled={!canProceed()}
            className={`px-6 py-3 rounded-xl transition-all ${
              canProceed()
                ? "bg-primary text-white hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            {t.next}
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={!canProceed()}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {t.finish}
          </button>
        )}
      </div>
    </div>
  );
}
