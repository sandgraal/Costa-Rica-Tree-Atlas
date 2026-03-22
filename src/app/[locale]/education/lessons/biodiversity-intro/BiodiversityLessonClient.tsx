"use client";

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
import type { BiodiversityLessonData } from "./biodiversity-data";

interface BiodiversityLessonClientProps {
  trees: LessonTreeData[];
  totalSpecies: number;
  totalFamilies: number;
  lessonData: BiodiversityLessonData;
}

export default function BiodiversityLessonClient(
  props: BiodiversityLessonClientProps
) {
  return (
    <EducationProgressProvider>
      <BiodiversityLessonContent {...props} />
    </EducationProgressProvider>
  );
}

function BiodiversityLessonContent({
  trees,
  totalSpecies,
  totalFamilies,
  lessonData,
}: BiodiversityLessonClientProps) {
  const { labels: t, funFacts, quizQuestions, steps } = lessonData;
  const { markLessonComplete } = useEducationProgress();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTrees, setSelectedTrees] = useState<string[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [currentFact, setCurrentFact] = useState(0);
  const [showHint, setShowHint] = useState<number | null>(null);
  const [streakCount, setStreakCount] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [animatedNumbers, setAnimatedNumbers] = useState({
    species: 0,
    families: 0,
    biodiversity: 0,
    surface: 0,
  });
  const [completedObjectives, setCompletedObjectives] = useState<Set<number>>(
    new Set()
  );
  const [quizFeedback, setQuizFeedback] = useState<Record<number, boolean>>({});

  useEffect(() => {
    injectEducationStyles();
  }, []);

  useEffect(() => {
    if (currentStep === 0) {
      const duration = 2000;
      const steps = 60;
      const interval = duration / steps;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setAnimatedNumbers({
          species: Math.round(totalSpecies * easeOut),
          families: Math.round(totalFamilies * easeOut),
          biodiversity: Math.round(5 * easeOut),
          surface: parseFloat((0.03 * easeOut).toFixed(2)),
        });
        if (step >= steps) clearInterval(timer);
      }, interval);
      return () => {
        clearInterval(timer);
      };
    }
  }, [currentStep, totalSpecies, totalFamilies]);

  useEffect(() => {
    if (currentStep === 0 && completedObjectives.size === 0) {
      setCompletedObjectives(new Set([0]));
    }
    if (currentStep >= 1 && !completedObjectives.has(1)) {
      setCompletedObjectives((prev) => new Set([...prev, 1]));
    }
    if (selectedTrees.length >= 5 && !completedObjectives.has(2)) {
      setCompletedObjectives((prev) => new Set([...prev, 2]));
    }
    if (Object.keys(quizAnswers).length >= 2 && !completedObjectives.has(3)) {
      setCompletedObjectives((prev) => new Set([...prev, 3]));
    }
  }, [currentStep, selectedTrees.length, quizAnswers, completedObjectives]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % funFacts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [funFacts.length]);

  const handleTreeSelect = (tree: LessonTreeData) => {
    if (selectedTrees.includes(tree.slug)) {
      setSelectedTrees((prev) => prev.filter((s) => s !== tree.slug));
    } else if (selectedTrees.length < 5) {
      setSelectedTrees((prev) => [...prev, tree.slug]);
      if (selectedTrees.length === 4) {
        setTotalPoints((prev) => prev + 25);
        triggerConfetti();
      }
    }
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    // Validate array bounds
    if (questionIndex < 0 || questionIndex >= quizQuestions.length) return;
    if (Object.hasOwn(quizFeedback, questionIndex)) return;

    // Safe array access after bounds check
    // eslint-disable-next-line security/detect-object-injection
    const question = quizQuestions[questionIndex];
    setQuizAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }));
    const isCorrect = answerIndex === question.correct;
    setQuizFeedback((prev) => ({ ...prev, [questionIndex]: isCorrect }));
    if (isCorrect) {
      setTotalPoints((prev) => prev + question.points * (streakCount + 1));
      setStreakCount((prev) => prev + 1);
    } else {
      setStreakCount(0);
    }
  };

  const calculateScore = () =>
    quizQuestions.filter((q, i) => {
      // Safe access after Object.hasOwn check
      // eslint-disable-next-line security/detect-object-injection
      return Object.hasOwn(quizAnswers, i) && quizAnswers[i] === q.correct;
    }).length;

  const handleFinish = () => {
    const score = calculateScore();
    const percentage = Math.round((score / quizQuestions.length) * 100);
    if (score >= 2) triggerConfetti();
    // Save progress to localStorage via context
    markLessonComplete("biodiversity-intro", percentage, totalPoints);
    setShowResults(true);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSelectedTrees([]);
    setQuizAnswers({});
    setQuizFeedback({});
    setShowResults(false);
    setStreakCount(0);
    setTotalPoints(0);
    setShowHint(null);
  };

  const canProceed = () => {
    if (currentStep === 2) return selectedTrees.length >= 5;
    if (currentStep === 3)
      return Object.keys(quizAnswers).length >= quizQuestions.length;
    return true;
  };

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / quizQuestions.length) * 100);

    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="text-center animate-bounce-in">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-8 shadow-lg animate-glow">
            <span className="text-7xl">🎉</span>
          </div>
          <h1 className="text-4xl font-bold text-primary mb-4">{t.results}</h1>
          <p className="text-xl text-muted-foreground mb-8">
            {t.lessonComplete}
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20">
              <div className="text-5xl font-bold text-green-600 mb-2">
                {score}/{quizQuestions.length}
              </div>
              <div className="text-muted-foreground">{t.correct}</div>
              <div className="mt-2 text-2xl font-semibold text-green-600">
                {percentage}%
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-blue-500/20">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {selectedTrees.length}
              </div>
              <div className="text-muted-foreground">{t.treesExplored}</div>
              <div className="mt-2 flex justify-center">
                {selectedTrees.slice(0, 5).map((_, i) => (
                  <span key={i} className="text-xl">
                    🌳
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl p-6 border border-yellow-500/20">
              <div className="text-5xl font-bold text-yellow-600 mb-2">
                {totalPoints}
              </div>
              <div className="text-muted-foreground">{t.points}</div>
              <div className="mt-2 text-lg">⭐⭐⭐</div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border mb-8 text-left">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>✅</span> {t.learningObjectives}
            </h3>
            <div className="space-y-2">
              {t.objectives.map((obj, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    completedObjectives.has(i)
                      ? "bg-green-500/10"
                      : "bg-muted/50"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                      completedObjectives.has(i)
                        ? "bg-green-500 text-white"
                        : "bg-muted-foreground/20"
                    }`}
                  >
                    {completedObjectives.has(i) ? "✓" : i + 1}
                  </span>
                  <span
                    className={
                      completedObjectives.has(i)
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }
                  >
                    {obj}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {selectedTrees.length > 0 && (
            <div className="bg-card rounded-2xl p-6 border border-border mb-8">
              <h2 className="text-xl font-semibold mb-4">
                {t.yourFavoriteTrees}
              </h2>
              <div className="flex flex-wrap justify-center gap-2">
                {selectedTrees.map((slug) => {
                  const tree = trees.find((tr) => tr.slug === slug);
                  return tree ? (
                    <Link
                      key={slug}
                      href={`/trees/${slug}`}
                      className="px-4 py-2 bg-green-500/10 text-green-700 dark:text-green-400 rounded-full hover:bg-green-500/20 transition-colors flex items-center gap-2"
                    >
                      <span>🌳</span>
                      {tree.title}
                    </Link>
                  ) : null;
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors"
            >
              {t.tryAgain}
            </button>
            <Link
              href="/trees"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              🌳 {t.exploreMoreTrees}
            </Link>
            <Link
              href="/education/lessons/tree-identification"
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
      <div className="mb-8">
        <Link
          href="/education/lessons"
          className="text-sm text-muted-foreground hover:text-primary mb-4 inline-flex items-center gap-1 transition-colors"
        >
          {t.backToLessons}
        </Link>
        <div className="flex items-start gap-4 mt-4">
          <div className="text-5xl animate-bounce-in">🌿</div>
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">{t.title}</h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">
                {t.gradeLevel}
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

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, i) => (
            <button
              key={i}
              onClick={() => i <= currentStep && setCurrentStep(i)}
              disabled={i > currentStep}
              className={`relative flex flex-col items-center gap-1 transition-all ${
                i <= currentStep ? "cursor-pointer" : "cursor-not-allowed"
              }`}
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
                className={`text-xs hidden sm:block ${
                  i === currentStep
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {i + 1}
              </span>
            </button>
          ))}
        </div>
        <ProgressBar
          value={((currentStep + 1) / steps.length) * 100}
          barClassName="bg-gradient-to-r from-green-500 to-emerald-500"
          label={t.stepProgressLabel}
        />
      </div>

      {/* Content Area */}
      <div className="bg-card border border-border rounded-2xl p-8 mb-8 min-h-[400px]">
        {/* Step 1: What is Biodiversity */}
        {currentStep === 0 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <span className="text-3xl">🌍</span>
              {steps[0].title}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              {t.step1Content}
            </p>

            {/* Animated Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                {
                  icon: "🌳",
                  value: animatedNumbers.species,
                  label: t.speciesLabel,
                },
                {
                  icon: "🌿",
                  value: animatedNumbers.families,
                  label: t.familiesLabel,
                },
                {
                  icon: "🌎",
                  value: `${animatedNumbers.biodiversity}%`,
                  label: t.biodiversityLabel,
                },
                {
                  icon: "🇨🇷",
                  value: `${animatedNumbers.surface}%`,
                  label: t.surfaceLabel,
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 text-center transform hover:scale-105 transition-transform"
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-primary">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Fun Fact Carousel */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <div className="font-medium text-yellow-700 dark:text-yellow-400 mb-1">
                    {t.didYouKnow}
                  </div>
                  <p className="text-foreground transition-all duration-300">
                    {currentFact >= 0 && currentFact < funFacts.length
                      ? // Safe array access after bounds check
                        // eslint-disable-next-line security/detect-object-injection
                        funFacts[currentFact]
                      : ""}
                  </p>
                  <div className="flex gap-1 mt-3">
                    {funFacts.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setCurrentFact(i);
                        }}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i === currentFact
                            ? "bg-yellow-500"
                            : "bg-yellow-500/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Costa Rica's Trees Overview */}
        {currentStep === 1 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <span className="text-3xl">🌳</span>
              {steps[1].title}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              {t.step2Content}
            </p>

            {/* Preview Trees */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {trees.slice(0, 6).map((tree, i) => (
                <div
                  key={tree.slug}
                  className="bg-muted/50 rounded-xl p-4 hover:bg-muted transition-colors animate-slide-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {tree.featuredImage && (
                    <div className="aspect-square relative rounded-lg overflow-hidden mb-3">
                      <Image
                        src={tree.featuredImage}
                        alt={tree.title}
                        fill
                        sizes="150px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="font-medium text-foreground text-sm truncate">
                    {tree.title}
                  </div>
                  <div className="text-xs text-muted-foreground italic truncate">
                    {tree.scientificName}
                  </div>
                </div>
              ))}
            </div>

            {/* Learning Objectives */}
            <div className="bg-primary/5 rounded-xl p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span>🎯</span> {t.learningObjectives}
              </h3>
              <div className="space-y-2">
                {t.objectives.map((obj, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      completedObjectives.has(i) ? "bg-green-500/10" : ""
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                        completedObjectives.has(i)
                          ? "bg-green-500 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {completedObjectives.has(i) ? "✓" : i + 1}
                    </span>
                    <span className="text-sm">{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Tree Selection Mission */}
        {currentStep === 2 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
              {steps[2].title}
            </h2>
            <p className="text-muted-foreground mb-4">{t.step3Content}</p>

            {/* Progress Indicator */}
            <div className="bg-muted rounded-xl p-4 mb-6 sticky top-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-primary">
                    {selectedTrees.length}
                  </span>
                  <span className="text-muted-foreground">
                    / 5 {t.selected}
                  </span>
                </div>
                <div className="flex gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        i < selectedTrees.length
                          ? "bg-green-500 text-white scale-110"
                          : "bg-muted-foreground/20"
                      }`}
                    >
                      {i < selectedTrees.length ? "🌳" : "○"}
                    </div>
                  ))}
                </div>
              </div>
              {selectedTrees.length >= 5 && (
                <div className="mt-2 text-center text-green-600 font-medium animate-bounce-in">
                  🎉 {t.collectionComplete}
                </div>
              )}
            </div>

            {/* Tree Selection Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto p-1">
              {trees.map((tree, i) => {
                const isSelected = selectedTrees.includes(tree.slug);
                return (
                  <button
                    key={tree.slug}
                    onClick={() => {
                      handleTreeSelect(tree);
                    }}
                    disabled={!isSelected && selectedTrees.length >= 5}
                    className={`group relative p-3 rounded-xl border-2 text-left transition-all animate-slide-up ${
                      isSelected
                        ? "border-green-500 bg-green-500/10 scale-[1.02]"
                        : selectedTrees.length >= 5
                          ? "border-border opacity-50 cursor-not-allowed"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                    style={{ animationDelay: `${(i % 8) * 50}ms` }}
                  >
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white text-sm z-10 animate-bounce-in">
                        ✓
                      </div>
                    )}
                    {tree.featuredImage && (
                      <div className="aspect-square relative rounded-lg overflow-hidden mb-2">
                        <Image
                          src={tree.featuredImage}
                          alt={tree.title}
                          fill
                          sizes="100px"
                          className="object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                    )}
                    <div className="text-sm font-medium truncate">
                      {tree.title}
                    </div>
                    <div className="text-xs text-muted-foreground italic truncate">
                      {tree.scientificName}
                    </div>
                    <div className="text-xs text-primary mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {t.clickToExplore}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Quiz */}
        {currentStep === 3 && (
          <div className="animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                {steps[3].title}
              </h2>
              {streakCount > 0 && (
                <div className="px-4 py-2 bg-orange-500/20 text-orange-600 rounded-full font-medium animate-bounce-in">
                  {t.streak} {streakCount}
                </div>
              )}
            </div>

            <div className="space-y-6">
              {quizQuestions.map((q, qIndex) => {
                const isAnswered = Object.hasOwn(quizFeedback, qIndex);
                const isCorrect = Object.hasOwn(quizFeedback, qIndex)
                  ? // Safe access after Object.hasOwn check
                    // eslint-disable-next-line security/detect-object-injection
                    quizFeedback[qIndex]
                  : false;

                return (
                  <div
                    key={qIndex}
                    className={`p-5 rounded-xl border-2 transition-all ${
                      isAnswered
                        ? isCorrect
                          ? "border-green-500 bg-green-500/5"
                          : "border-red-500 bg-red-500/5"
                        : "border-border bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <p className="font-medium text-lg">
                        <span className="text-primary mr-2">
                          Q{qIndex + 1}.
                        </span>
                        {q.question}
                      </p>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs whitespace-nowrap">
                        +{q.points} {t.points}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((option, oIndex) => {
                        const isSelected =
                          Object.hasOwn(quizAnswers, qIndex) &&
                          // Safe access after Object.hasOwn check
                          // eslint-disable-next-line security/detect-object-injection
                          quizAnswers[qIndex] === oIndex;
                        const isCorrectAnswer = oIndex === q.correct;

                        return (
                          <button
                            key={oIndex}
                            onClick={() => {
                              handleQuizAnswer(qIndex, oIndex);
                            }}
                            disabled={isAnswered}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              isAnswered
                                ? isCorrectAnswer
                                  ? "border-green-500 bg-green-500/10"
                                  : isSelected
                                    ? "border-red-500 bg-red-500/10"
                                    : "border-border opacity-50"
                                : isSelected
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-primary/50 hover:bg-muted/50"
                            } ${isAnswered ? "cursor-default" : "cursor-pointer"}`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
                                  isAnswered
                                    ? isCorrectAnswer
                                      ? "bg-green-500 text-white"
                                      : isSelected
                                        ? "bg-red-500 text-white"
                                        : "bg-muted-foreground/20"
                                    : isSelected
                                      ? "bg-primary text-white"
                                      : "bg-muted-foreground/20"
                                }`}
                              >
                                {isAnswered && isCorrectAnswer
                                  ? "✓"
                                  : isAnswered && isSelected && !isCorrectAnswer
                                    ? "✗"
                                    : String.fromCharCode(65 + oIndex)}
                              </span>
                              <span>{option}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {!isAnswered && (
                      <button
                        onClick={() => {
                          setShowHint(showHint === qIndex ? null : qIndex);
                        }}
                        className="mt-3 text-sm text-primary hover:underline"
                      >
                        {t.hint}
                      </button>
                    )}

                    {showHint === qIndex && !isAnswered && (
                      <div className="mt-2 p-3 bg-yellow-500/10 rounded-lg text-sm animate-slide-up">
                        💡 {q.hint}
                      </div>
                    )}

                    {isAnswered && (
                      <div
                        className={`mt-3 p-3 rounded-lg text-sm animate-bounce-in ${
                          isCorrect
                            ? "bg-green-500/10 text-green-700 dark:text-green-400"
                            : "bg-red-500/10 text-red-700 dark:text-red-400"
                        }`}
                      >
                        {isCorrect
                          ? `${t.correctFeedback} +${q.points * (streakCount > 0 ? streakCount : 1)} ${t.points}`
                          : t.incorrectFeedback}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Creative Activity */}
        {currentStep === 4 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              {steps[4].title}
            </h2>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-lg mb-2">
                {t.creativeMission}
              </h3>
              <p className="text-muted-foreground">{t.creativeMissionDesc}</p>
            </div>

            {selectedTrees.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-3">{t.yourSelectedTrees}</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTrees.map((slug) => {
                    const tree = trees.find((tr) => tr.slug === slug);
                    return tree ? (
                      <span
                        key={slug}
                        className="px-3 py-1.5 bg-green-500/10 text-green-700 dark:text-green-400 rounded-lg text-sm"
                      >
                        🌳 {tree.title}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Drawing Activity Area */}
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-muted/20 mb-6">
              <div className="text-6xl mb-4">🎨</div>
              <p className="text-muted-foreground">{t.drawingArea}</p>
            </div>

            {/* Printable Resources */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <span>🖨️</span>
                {t.printableResources}
              </h3>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/education/printables"
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  {t.viewActivitySheets}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => {
            setCurrentStep((prev) => Math.max(0, prev - 1));
          }}
          disabled={currentStep === 0}
          className={`px-6 py-3 rounded-xl transition-colors flex items-center gap-2 ${
            currentStep === 0
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-muted text-foreground hover:bg-muted/80"
          }`}
        >
          {t.previous}
        </button>

        {currentStep < steps.length - 1 ? (
          <button
            onClick={() => {
              setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
            }}
            disabled={!canProceed()}
            className={`px-6 py-3 rounded-xl transition-colors flex items-center gap-2 ${
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
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            {t.finish}
          </button>
        )}
      </div>
    </div>
  );
}
