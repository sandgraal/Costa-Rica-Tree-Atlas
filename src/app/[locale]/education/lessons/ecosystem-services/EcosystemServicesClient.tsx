"use client";
/* eslint-disable security/detect-object-injection -- lesson interactions rely on constrained category/question lookup tables */

import { useState, useEffect } from "react";
import { Link } from "@i18n/navigation";
import Image from "next/image";
import {
  EducationProgressProvider,
  useEducationProgress,
} from "@/components/EducationProgress";
import { ProgressBar } from "@/components/ProgressBar";
import {
  triggerConfetti,
  injectEducationStyles,
  type LessonTreeData,
} from "@/lib/education";
import type { EcosystemServicesLessonData } from "./ecosystem-services-data";

interface EcosystemServicesClientProps {
  trees: LessonTreeData[];
  locale: string;
  lessonData: EcosystemServicesLessonData;
}

export default function EcosystemServicesClient(
  props: EcosystemServicesClientProps
) {
  return (
    <EducationProgressProvider>
      <EcosystemServicesContent {...props} />
    </EducationProgressProvider>
  );
}

function EcosystemServicesContent({
  trees,
  locale,
  lessonData,
}: EcosystemServicesClientProps) {
  const { markLessonComplete } = useEducationProgress();
  const [currentStep, setCurrentStep] = useState(0);
  const [discoveredServices, setDiscoveredServices] = useState<Set<string>>(
    new Set()
  );
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizFeedback, setQuizFeedback] = useState<Record<number, boolean>>({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [createdPoster, setCreatedPoster] = useState<string[]>([]);

  useEffect(() => {
    injectEducationStyles();
  }, []);

  const {
    labels: t,
    serviceCategories,
    matchingItems,
    quizQuestions,
    treeUseCategories,
    steps,
  } = lessonData;

  const handleServiceDiscover = (serviceId: string) => {
    if (!discoveredServices.has(serviceId)) {
      setDiscoveredServices((prev) => new Set([...prev, serviceId]));
      setTotalPoints((prev) => prev + 5);
    }
  };

  const handleDrop = (categoryId: string, itemId: string) => {
    const item = matchingItems.find((i) => i.id === itemId);
    if (item && item.category === categoryId) {
      setMatchedPairs((prev) => new Set([...prev, itemId]));
      setTotalPoints((prev) => prev + 10);
      if (matchedPairs.size === matchingItems.length - 1) {
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

  const handleAddToPoster = (item: string) => {
    if (!createdPoster.includes(item)) {
      setCreatedPoster((prev) => [...prev, item]);
      setTotalPoints((prev) => prev + 5);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) return discoveredServices.size >= 4;
    if (currentStep === 2) return matchedPairs.size >= 6;
    if (currentStep === 4) return createdPoster.length >= 3;
    return true;
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
    markLessonComplete("ecosystem-services", percentage, totalPoints);
    setShowResults(true);
    triggerConfetti();
  };

  const resetLesson = () => {
    setCurrentStep(0);
    setDiscoveredServices(new Set());
    setMatchedPairs(new Set());
    setQuizAnswers({});
    setQuizFeedback({});
    setTotalPoints(0);
    setShowResults(false);
    setCreatedPoster([]);
  };

  // Filter trees by use category
  const filteredTrees =
    selectedCategory === "all"
      ? trees.filter((t) => t.uses && t.uses.length > 0)
      : trees.filter((t) => {
          const uses = (t.uses || []).map((u) => u.toLowerCase());
          const category = selectedCategory.toLowerCase();
          return uses.some(
            (use) =>
              use.includes(category) ||
              (category === "food" &&
                (use.includes("fruit") ||
                  use.includes("frut") ||
                  use.includes("edible") ||
                  use.includes("comest"))) ||
              (category === "medicine" &&
                (use.includes("medicin") ||
                  use.includes("healing") ||
                  use.includes("curat"))) ||
              (category === "construction" &&
                (use.includes("wood") ||
                  use.includes("madera") ||
                  use.includes("timber") ||
                  use.includes("constru")))
          );
        });

  if (showResults) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="text-center animate-bounce-in">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-green-500 to-blue-500 rounded-full mb-8 shadow-lg animate-float">
            <span className="text-7xl">🌍</span>
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
                {discoveredServices.size}
              </div>
              <div className="text-muted-foreground">
                {t.discoveredServices}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20">
              <div className="text-5xl font-bold text-purple-600 mb-2">
                {matchedPairs.size}
              </div>
              <div className="text-muted-foreground">{t.matched}</div>
            </div>
          </div>

          {createdPoster.length > 0 && (
            <div className="bg-card rounded-2xl p-6 border border-border mb-8">
              <h3 className="font-semibold mb-4">
                {locale === "es"
                  ? "Tu Póster de Servicios Ecosistémicos"
                  : "Your Ecosystem Services Poster"}
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {createdPoster.map((item, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
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
              href="/education"
              className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
            >
              {t.backToEducation}
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
          <div className="text-5xl animate-float">🌍</div>
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">{t.title}</h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">
                {locale === "es" ? "Grados 5-8" : "Grades 5-8"}
              </span>
              <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full">
                ⏱️ 45 min
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
            </button>
          ))}
        </div>
        <ProgressBar
          value={((currentStep + 1) / steps.length) * 100}
          barClassName="bg-gradient-to-r from-green-500 to-blue-500"
          label="Step progress"
        />
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-2xl p-8 mb-8 min-h-[400px]">
        {/* Step 0: Introduction */}
        {currentStep === 0 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <span className="text-3xl">🌍</span>
              {steps[0].title}
            </h2>
            <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-xl p-6 mb-6">
              <p className="text-lg leading-relaxed">
                {locale === "es"
                  ? "Los servicios ecosistémicos son todos los beneficios que los humanos obtenemos de la naturaleza. Los árboles y bosques son expertos en brindarnos estos servicios esenciales para la vida."
                  : "Ecosystem services are all the benefits that humans get from nature. Trees and forests are experts at providing these essential services for life."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: "🫁",
                  text:
                    locale === "es"
                      ? "Un árbol grande produce oxígeno para 4 personas"
                      : "A large tree produces oxygen for 4 people",
                },
                {
                  icon: "💧",
                  text:
                    locale === "es"
                      ? "Los bosques filtran el 75% del agua dulce"
                      : "Forests filter 75% of fresh water",
                },
                {
                  icon: "🌡️",
                  text:
                    locale === "es"
                      ? "Un árbol puede enfriar como 10 aires acondicionados"
                      : "One tree can cool like 10 air conditioners",
                },
                {
                  icon: "🐝",
                  text:
                    locale === "es"
                      ? "80% de nuestros alimentos depende de polinizadores"
                      : "80% of our food depends on pollinators",
                },
              ].map((fact, i) => (
                <div
                  key={i}
                  className="bg-muted/50 rounded-xl p-4 flex items-start gap-3 animate-slide-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <span className="text-3xl">{fact.icon}</span>
                  <p className="text-sm">{fact.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Four Types */}
        {currentStep === 1 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <span className="text-3xl">📊</span>
              {steps[1].title}
            </h2>
            <p className="text-muted-foreground mb-6">
              {locale === "es"
                ? "Haz clic en cada categoría para descubrirla:"
                : "Click each category to discover it:"}
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {serviceCategories.map((cat) => {
                const isDiscovered = discoveredServices.has(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      handleServiceDiscover(cat.id);
                    }}
                    className={`relative p-6 rounded-xl border-2 text-left transition-all ${
                      isDiscovered
                        ? `border-transparent bg-gradient-to-br ${cat.color} text-white`
                        : "border-border bg-muted/50 hover:border-primary/50"
                    }`}
                  >
                    {isDiscovered && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                        ✓
                      </div>
                    )}
                    <div className="text-4xl mb-3">{cat.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{cat.title}</h3>
                    <p
                      className={`text-sm mb-3 ${isDiscovered ? "text-white/80" : "text-muted-foreground"}`}
                    >
                      {cat.description}
                    </p>
                    {isDiscovered && (
                      <div className="flex flex-wrap gap-1 animate-slide-up">
                        {cat.examples.map((ex, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-white/20 rounded-full text-xs"
                          >
                            {ex}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 bg-muted rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t.discoveredServices}
                </span>
                <span className="font-bold text-primary">
                  {discoveredServices.size}/4
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Matching Game */}
        {currentStep === 2 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              {steps[2].title}
            </h2>
            <p className="text-muted-foreground mb-6">
              {locale === "es"
                ? "Arrastra cada servicio a su categoría correcta:"
                : "Drag each service to its correct category:"}
            </p>

            <div className="grid md:grid-cols-4 gap-4 mb-6">
              {serviceCategories.map((cat) => (
                <div
                  key={cat.id}
                  className={`p-4 rounded-xl border-2 border-dashed transition-all ${
                    draggedItem &&
                    matchingItems.find((i) => i.id === draggedItem)
                      ?.category === cat.id
                      ? "border-green-500 bg-green-500/10"
                      : "border-border"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={() => draggedItem && handleDrop(cat.id, draggedItem)}
                >
                  <div className="text-center mb-2">
                    <span className="text-2xl">{cat.icon}</span>
                    <div className="text-sm font-medium">{cat.title}</div>
                  </div>
                  <div className="min-h-[80px] space-y-1">
                    {matchingItems
                      .filter(
                        (item) =>
                          item.category === cat.id && matchedPairs.has(item.id)
                      )
                      .map((item) => (
                        <div
                          key={item.id}
                          className="px-2 py-1 bg-green-500/20 rounded text-xs text-center animate-grow"
                        >
                          {item.icon} {item.service}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {matchingItems
                .filter((item) => !matchedPairs.has(item.id))
                .map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => {
                      setDraggedItem(item.id);
                    }}
                    onDragEnd={() => {
                      setDraggedItem(null);
                    }}
                    className="px-4 py-2 bg-muted rounded-lg cursor-move hover:bg-muted/80 transition-colors flex items-center gap-2"
                  >
                    <span>{item.icon}</span>
                    <span className="text-sm">{item.service}</span>
                  </div>
                ))}
            </div>

            <div className="mt-6 bg-muted rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t.matched}</span>
                <span className="font-bold text-primary">
                  {matchedPairs.size}/{matchingItems.length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Trees and Uses */}
        {currentStep === 3 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <span className="text-3xl">🌳</span>
              {steps[3].title}
            </h2>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {treeUseCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <span>{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>

            {/* Quiz */}
            <div className="mb-6 space-y-4">
              {quizQuestions.map((q, qIndex) => {
                const isAnswered = quizFeedback[qIndex] !== undefined;
                const isCorrect = quizFeedback[qIndex];
                return (
                  <div
                    key={qIndex}
                    className={`p-4 rounded-xl border-2 ${isAnswered ? (isCorrect ? "border-green-500 bg-green-500/5" : "border-red-500 bg-red-500/5") : "border-border"}`}
                  >
                    <p className="font-medium mb-3">{q.question}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, oIndex) => (
                        <button
                          key={oIndex}
                          onClick={() => {
                            handleQuizAnswer(qIndex, oIndex);
                          }}
                          disabled={isAnswered}
                          className={`p-3 rounded-lg border text-left text-sm ${
                            isAnswered
                              ? oIndex === q.correct
                                ? "border-green-500 bg-green-500/10"
                                : quizAnswers[qIndex] === oIndex
                                  ? "border-red-500 bg-red-500/10"
                                  : "border-border opacity-50"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trees Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto">
              {filteredTrees.slice(0, 12).map((tree) => (
                <div key={tree.slug} className="bg-muted/50 rounded-xl p-3">
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
                  {tree.uses && tree.uses.length > 0 && (
                    <div className="text-xs text-muted-foreground truncate">
                      {tree.uses[0]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Create Poster */}
        {currentStep === 4 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              {steps[4].title}
            </h2>
            <p className="text-muted-foreground mb-6">
              {locale === "es"
                ? "Selecciona al menos 3 elementos para tu póster de servicios ecosistémicos:"
                : "Select at least 3 elements for your ecosystem services poster:"}
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Available Elements */}
              <div>
                <h3 className="font-semibold mb-3">
                  {locale === "es"
                    ? "Elementos Disponibles"
                    : "Available Elements"}
                </h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {[
                    ...serviceCategories.map((c) => ({
                      type: "category",
                      item: c,
                    })),
                    ...matchingItems
                      .slice(0, 4)
                      .map((m) => ({ type: "service", item: m })),
                  ].map((el, i) => {
                    const label =
                      el.type === "category"
                        ? `${(el.item as (typeof serviceCategories)[0]).icon} ${(el.item as (typeof serviceCategories)[0]).title}`
                        : `${(el.item as (typeof matchingItems)[0]).icon} ${(el.item as (typeof matchingItems)[0]).service}`;
                    const isAdded = createdPoster.includes(label);

                    return (
                      <button
                        key={i}
                        onClick={() => {
                          handleAddToPoster(label);
                        }}
                        disabled={isAdded}
                        className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                          isAdded
                            ? "border-green-500 bg-green-500/10 opacity-60"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span>{label}</span>
                        {isAdded ? (
                          <span className="text-green-500">✓</span>
                        ) : (
                          <span className="text-xs text-primary">
                            + {t.addToPoster}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Poster Preview */}
              <div>
                <h3 className="font-semibold mb-3">
                  {locale === "es" ? "Tu Póster" : "Your Poster"}
                </h3>
                <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-xl p-6 min-h-[300px] border-2 border-dashed border-primary/30">
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-bold text-primary">
                      {locale === "es"
                        ? "Servicios Ecosistémicos"
                        : "Ecosystem Services"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {locale === "es"
                        ? "Los regalos de la naturaleza"
                        : "Nature's gifts"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {createdPoster.map((item, i) => (
                      <div
                        key={i}
                        className="px-3 py-2 bg-white/50 dark:bg-black/20 rounded-lg text-sm animate-slide-up"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  {createdPoster.length === 0 && (
                    <p className="text-center text-muted-foreground mt-12">
                      {locale === "es"
                        ? "Agrega elementos a tu póster"
                        : "Add elements to your poster"}
                    </p>
                  )}
                </div>
                {createdPoster.length >= 3 && (
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="w-full mt-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    {t.printPoster}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => {
            setCurrentStep((prev) => Math.max(0, prev - 1));
          }}
          disabled={currentStep === 0}
          className="px-6 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t.previous}
        </button>
        {currentStep < steps.length - 1 ? (
          <button
            onClick={() => {
              setCurrentStep((prev) => prev + 1);
            }}
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
