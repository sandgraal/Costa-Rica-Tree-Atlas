"use client";
/* eslint-disable security/detect-object-injection -- lesson state/quiz dictionaries are keyed by bounded indices and typed ids */

import { useEffect } from "react";
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
import type { ConservationLessonData } from "./conservation-data";
import { useConservationReducer } from "./useConservationReducer";

interface ConservationLessonClientProps {
  trees: LessonTreeData[];
  statusCounts: Record<string, number>;
  endangeredTrees: LessonTreeData[];
  lessonData: ConservationLessonData;
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
  statusCounts,
  endangeredTrees,
  lessonData,
}: ConservationLessonClientProps) {
  const { markLessonComplete } = useEducationProgress();
  const [state, dispatch] = useConservationReducer();

  useEffect(() => {
    injectEducationStyles();
  }, []);

  const {
    labels: t,
    conservationReasons,
    threats,
    conservationActions,
    statusInfo,
    quizQuestions,
    steps,
  } = lessonData;

  const handleThreatSelect = (threatId: string) => {
    dispatch({ type: "TOGGLE_THREAT", payload: threatId });
  };

  const handleActionSelect = (actionId: string) => {
    dispatch({ type: "TOGGLE_ACTION", payload: actionId });
    // Trigger confetti when selecting 3rd action
    if (
      !state.selectedActions.includes(actionId) &&
      state.selectedActions.length === 2
    ) {
      triggerConfetti();
    }
  };

  const handleQuizAnswer = (qIndex: number, aIndex: number) => {
    if (state.quiz.feedback[qIndex] !== undefined) return;
    const isCorrect = aIndex === quizQuestions[qIndex].correct;
    dispatch({
      type: "ANSWER_QUIZ",
      payload: {
        question: qIndex,
        answer: aIndex,
        isCorrect,
        points: quizQuestions[qIndex].points,
      },
    });
  };

  const handleSignPledge = () => {
    dispatch({ type: "SIGN_PLEDGE" });
    if (state.pledge.name.trim()) {
      triggerConfetti();
    }
  };

  const handleFinish = () => {
    const correctQuizAnswers = Object.entries(state.quiz.feedback).filter(
      ([, correct]) => correct
    ).length;
    const percentage =
      state.quiz.feedback && Object.keys(state.quiz.feedback).length > 0
        ? Math.round(
            (correctQuizAnswers / Object.keys(state.quiz.feedback).length) * 100
          )
        : 100; // Give full credit if no quiz
    markLessonComplete("conservation", percentage, state.totalPoints);
    dispatch({ type: "FINISH_LESSON" });
    if (state.totalPoints >= 100) triggerConfetti();
  };

  const canProceed = () => {
    if (state.currentStep === 1) return state.selectedThreats.length >= 3;
    if (state.currentStep === 3) return state.selectedActions.length >= 3;
    if (state.currentStep === 4) return state.pledge.signed;
    return true;
  };

  const resetLesson = () => {
    dispatch({ type: "RESET" });
  };

  if (state.showResults) {
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
                {state.totalPoints}
              </div>
              <div className="text-muted-foreground">{t.points}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-blue-500/20">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {state.selectedActions.length}
              </div>
              <div className="text-muted-foreground">{t.actionsPledged}</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl p-6 border border-yellow-500/20">
              <div className="text-5xl mb-2">🏆</div>
              <div className="text-muted-foreground">{t.forestDefender}</div>
            </div>
          </div>

          {state.pledge.signed && (
            <div className="bg-card rounded-2xl p-6 border border-border mb-8 max-w-md mx-auto">
              <div className="text-4xl mb-2">📜</div>
              <p className="text-lg font-medium mb-2">{t.pledgeText}</p>
              <p className="text-primary font-bold text-xl">
                {state.pledge.name}
              </p>
            </div>
          )}

          {state.adoptedTree && (
            <div className="bg-card rounded-2xl p-6 border border-border mb-8 max-w-md mx-auto">
              <h3 className="font-semibold mb-4 flex items-center justify-center gap-2">
                <span>🌳</span> {t.yourAdoptedTree}
              </h3>
              {state.adoptedTree.featuredImage && (
                <div className="aspect-video relative rounded-xl overflow-hidden mb-4">
                  <Image
                    src={state.adoptedTree.featuredImage}
                    alt={state.adoptedTree.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="font-medium">{state.adoptedTree.title}</div>
              <div className="text-sm text-muted-foreground italic">
                {state.adoptedTree.scientificName}
              </div>
              <Link
                href={`/trees/${state.adoptedTree.slug}`}
                className="inline-block mt-3 text-primary hover:underline text-sm"
              >
                {t.viewInAtlas}
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
                {t.gradeLevel}
              </span>
              <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full">
                ⏱️ 40 min
              </span>
              {state.totalPoints > 0 && (
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 rounded-full font-medium">
                  ⭐ {state.totalPoints} {t.points}
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
              onClick={() =>
                i <= state.currentStep &&
                dispatch({ type: "SET_STEP", payload: i })
              }
              disabled={i > state.currentStep}
              className={`relative flex flex-col items-center gap-1 transition-all ${i <= state.currentStep ? "cursor-pointer" : "cursor-not-allowed"}`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                  i === state.currentStep
                    ? "bg-primary text-white scale-110 shadow-lg"
                    : i < state.currentStep
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i < state.currentStep ? "✓" : step.icon}
              </div>
              <span
                className={`text-xs hidden sm:block ${i === state.currentStep ? "text-primary font-medium" : "text-muted-foreground"}`}
              >
                {i + 1}
              </span>
            </button>
          ))}
        </div>
        <ProgressBar
          value={((state.currentStep + 1) / steps.length) * 100}
          barClassName="bg-gradient-to-r from-green-500 to-emerald-500"
          label={t.stepProgressLabel}
        />
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-2xl p-8 mb-8 min-h-[400px]">
        {/* Step 0: Why Conserve */}
        {state.currentStep === 0 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <span className="text-3xl">🌍</span>
              {steps[0].title}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              {t.forestsIntro}
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
        {state.currentStep === 1 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              {steps[1].title}
            </h2>
            <p className="text-muted-foreground mb-4">{t.selectThreats}</p>
            <div className="bg-muted rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">
                  {state.selectedThreats.length}
                </span>
                <span className="text-muted-foreground">/ 3 {t.selected}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {threats.map((threat) => {
                const isSelected = state.selectedThreats.includes(threat.id);
                return (
                  <button
                    key={threat.id}
                    onClick={() => {
                      handleThreatSelect(threat.id);
                    }}
                    disabled={!isSelected && state.selectedThreats.length >= 3}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? "border-red-500 bg-red-500/10 scale-105"
                        : state.selectedThreats.length >= 3
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
        {state.currentStep === 2 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <span className="text-3xl">📊</span>
              {steps[2].title}
            </h2>

            {/* IUCN Status Legend */}
            <div className="bg-muted/50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold mb-3">{t.iucnCategories}</h3>
              <div className="space-y-2">
                {statusInfo.map((status) => (
                  <div key={status.key} className="flex items-center gap-3">
                    <span className="text-lg">{status.icon}</span>
                    <span className={`w-4 h-4 rounded-full ${status.color}`} />
                    <span className="font-medium">{status.label}</span>
                    <span className="text-sm text-muted-foreground ml-auto">
                      {statusCounts[status.key] || 0} {t.treesLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz */}
            <div className="space-y-4">
              {quizQuestions.map((q, qIndex) => {
                const isAnswered = state.quiz.feedback[qIndex] !== undefined;
                const isCorrect = state.quiz.feedback[qIndex];
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
                        const isSelected =
                          state.quiz.answers[qIndex] === oIndex;
                        const isCorrectAnswer = oIndex === q.correct;
                        return (
                          <button
                            key={oIndex}
                            onClick={() => {
                              handleQuizAnswer(qIndex, oIndex);
                            }}
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
                  <span>🚨</span> {t.endangeredTrees}
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
        {state.currentStep === 3 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
              {steps[3].title}
            </h2>
            <p className="text-muted-foreground mb-4">{t.selectActions}</p>

            <div className="bg-muted rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">
                  {state.selectedActions.length}
                </span>
                <span className="text-muted-foreground">/ 3 {t.selected}</span>
              </div>
              {state.selectedActions.length >= 3 && (
                <div className="mt-2 text-center text-green-600 font-medium animate-bounce-in">
                  🎉 {t.excellentChoices}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {conservationActions.map((action) => {
                const isSelected = state.selectedActions.includes(action.id);
                return (
                  <button
                    key={action.id}
                    onClick={() => {
                      handleActionSelect(action.id);
                    }}
                    disabled={!isSelected && state.selectedActions.length >= 3}
                    className={`relative p-4 rounded-xl border-2 text-center transition-all ${
                      isSelected
                        ? "border-green-500 bg-green-500/10 scale-105"
                        : state.selectedActions.length >= 3
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
        {state.currentStep === 4 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              {steps[4].title}
            </h2>

            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20 text-center mb-6">
                <div className="text-6xl mb-4">📜</div>
                <p className="text-lg font-medium mb-4">{t.pledgeText}</p>

                {!state.pledge.signed ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={state.pledge.name}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_PLEDGE_NAME",
                          payload: e.target.value,
                        })
                      }
                      placeholder={t.yourName}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={handleSignPledge}
                      disabled={!state.pledge.name.trim()}
                      className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ✍️ {t.signPledge}
                    </button>
                  </div>
                ) : (
                  <div className="animate-bounce-in">
                    <div className="text-4xl mb-2">✅</div>
                    <p className="text-green-600 font-bold text-xl">
                      {state.pledge.name}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {t.thankYouPledge}
                    </p>
                  </div>
                )}
              </div>

              {/* Adopt a Tree */}
              {state.pledge.signed &&
                !state.adoptedTree &&
                endangeredTrees.length > 0 && (
                  <div className="bg-card rounded-xl p-4 border border-border">
                    <h3 className="font-semibold mb-3 text-center">
                      {t.adoptTree}
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {endangeredTrees.slice(0, 6).map((tree) => (
                        <button
                          key={tree.slug}
                          onClick={() => {
                            dispatch({ type: "ADOPT_TREE", payload: tree });
                            dispatch({ type: "ADD_POINTS", payload: 25 });
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

              {state.adoptedTree && (
                <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20 text-center animate-bounce-in">
                  <div className="text-2xl mb-2">🌳</div>
                  <p className="font-medium">{t.yourAdoptedTree}:</p>
                  <p className="text-primary font-bold">
                    {state.adoptedTree.title}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => {
            dispatch({ type: "PREVIOUS_STEP" });
          }}
          disabled={state.currentStep === 0}
          className="px-6 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t.previous}
        </button>
        {state.currentStep < steps.length - 1 ? (
          <button
            onClick={() => {
              dispatch({ type: "NEXT_STEP" });
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
