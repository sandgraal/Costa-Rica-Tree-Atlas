"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Link } from "@i18n/navigation";
import type { Tree } from "contentlayer/generated";
import { TAG_DEFINITIONS } from "./TreeTags";

// Blur placeholder
const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMyZDVhMjciIG9wYWNpdHk9IjAuMSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzhiNWEyYiIgb3BhY2l0eT0iMC4xIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNnKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==";

// Define identification questions with their corresponding tag filters
interface IdentificationQuestion {
  id: string;
  icon: string;
  options: {
    value: string;
    tags: string[];
    excludeTags?: string[];
  }[];
}

const IDENTIFICATION_QUESTIONS: IdentificationQuestion[] = [
  {
    id: "foliage",
    icon: "🍃",
    options: [
      { value: "deciduous", tags: ["deciduous"] },
      { value: "evergreen", tags: ["evergreen"] },
      { value: "unknown", tags: [] },
    ],
  },
  {
    id: "flowering",
    icon: "🌸",
    options: [
      { value: "showy", tags: ["flowering", "ornamental"] },
      { value: "inconspicuous", tags: [], excludeTags: ["flowering"] },
      { value: "unknown", tags: [] },
    ],
  },
  {
    id: "fruit",
    icon: "🍎",
    options: [
      { value: "edible", tags: ["fruit-bearing", "edible"] },
      { value: "nonEdible", tags: [], excludeTags: ["edible"] },
      { value: "unknown", tags: [] },
    ],
  },
  {
    id: "origin",
    icon: "🌍",
    options: [
      { value: "native", tags: ["native"] },
      { value: "introduced", tags: ["introduced"] },
      { value: "unknown", tags: [] },
    ],
  },
  {
    id: "size",
    icon: "📏",
    options: [
      { value: "tall", tags: ["tall"] },
      { value: "medium", tags: [], excludeTags: ["tall"] },
      { value: "unknown", tags: [] },
    ],
  },
  {
    id: "habitat",
    icon: "🏔️",
    options: [
      { value: "dryForest", tags: ["dry-forest"] },
      { value: "rainforest", tags: ["rainforest"] },
      { value: "coastal", tags: ["coastal"] },
      { value: "highland", tags: ["highland"] },
      { value: "unknown", tags: [] },
    ],
  },
  {
    id: "uses",
    icon: "🔧",
    options: [
      { value: "timber", tags: ["timber"] },
      { value: "medicinal", tags: ["medicinal"] },
      { value: "ornamental", tags: ["ornamental", "shade-tree"] },
      {
        value: "ecological",
        tags: ["nitrogen-fixing", "wildlife-food", "pioneer"],
      },
      { value: "unknown", tags: [] },
    ],
  },
];

interface IdentificationGuideProps {
  trees: Tree[];
  locale: string;
  translations: {
    title: string;
    subtitle: string;
    restart: string;
    resultsTitle: string;
    noResults: string;
    matchingTrees: string;
    confidence: string;
    questions: {
      [key: string]: {
        question: string;
        options: { [key: string]: string };
      };
    };
  };
}

export function IdentificationGuide({
  trees,
  locale,
  translations,
}: IdentificationGuideProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);

  // Calculate matching trees based on answers
  const { matchingTrees, scores } = useMemo(() => {
    const selectedTags: string[] = [];
    const excludedTags: string[] = [];

    // Collect all selected and excluded tags
    Object.entries(answers).forEach(([questionId, optionValue]) => {
      const question = IDENTIFICATION_QUESTIONS.find(
        (q) => q.id === questionId
      );
      const option = question?.options.find((o) => o.value === optionValue);
      if (option) {
        selectedTags.push(...option.tags);
        if (option.excludeTags) {
          excludedTags.push(...option.excludeTags);
        }
      }
    });

    // Score each tree
    const treeScores: Map<string, number> = new Map();

    trees.forEach((tree) => {
      const treeTags = (tree as Tree & { tags?: string[] }).tags || [];
      let score = 0;
      let excluded = false;

      // Check for excluded tags
      for (const tag of excludedTags) {
        if (treeTags.includes(tag)) {
          excluded = true;
          break;
        }
      }

      if (!excluded) {
        // Calculate match score
        for (const tag of selectedTags) {
          if (treeTags.includes(tag)) {
            score += 1;
          }
        }
      }

      if (!excluded && (score > 0 || selectedTags.length === 0)) {
        treeScores.set(tree.slug, score);
      }
    });

    // Sort by score descending
    const sortedTrees = trees
      .filter((tree) => treeScores.has(tree.slug))
      .sort((a, b) => {
        const scoreA = treeScores.get(a.slug) || 0;
        const scoreB = treeScores.get(b.slug) || 0;
        return scoreB - scoreA;
      });

    return {
      matchingTrees: sortedTrees,
      scores: treeScores,
    };
  }, [trees, answers]);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (currentStep < IDENTIFICATION_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentStep(0);
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const getMaxScore = () => {
    let total = 0;
    Object.entries(answers).forEach(([questionId, optionValue]) => {
      const question = IDENTIFICATION_QUESTIONS.find(
        (q) => q.id === questionId
      );
      const option = question?.options.find((o) => o.value === optionValue);
      if (option) {
        total += option.tags.length;
      }
    });
    return total || 1;
  };

  const maxScore = getMaxScore();

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-primary-dark dark:text-primary-light mb-2">
          {translations.title}
        </h2>
        <p className="text-muted-foreground">{translations.subtitle}</p>
      </div>

      {/* Progress indicators */}
      <div className="mb-8">
        <div className="flex justify-center gap-2 flex-wrap">
          {IDENTIFICATION_QUESTIONS.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined;
            const isCurrent = idx === currentStep;

            return (
              <button
                key={q.id}
                onClick={() => handleStepClick(idx)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-all ${
                  isCurrent
                    ? "bg-primary text-white shadow-lg scale-105"
                    : isAnswered
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <span>{q.icon}</span>
                <span className="hidden sm:inline">
                  {translations.questions[q.id]?.question
                    .split("?")[0]
                    .slice(0, 15)}
                  ...
                </span>
                {isAnswered && <span className="ml-1">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current question */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
          <div className="text-4xl text-center mb-4">
            {IDENTIFICATION_QUESTIONS[currentStep].icon}
          </div>
          <h3 className="text-xl font-semibold text-center mb-6">
            {
              translations.questions[IDENTIFICATION_QUESTIONS[currentStep].id]
                ?.question
            }
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {IDENTIFICATION_QUESTIONS[currentStep].options.map((option) => {
              const isSelected =
                answers[IDENTIFICATION_QUESTIONS[currentStep].id] ===
                option.value;

              return (
                <button
                  key={option.value}
                  onClick={() =>
                    handleAnswer(
                      IDENTIFICATION_QUESTIONS[currentStep].id,
                      option.value
                    )
                  }
                  className={`px-4 py-3 rounded-lg transition-all text-left ${
                    isSelected
                      ? "bg-primary text-white ring-2 ring-primary ring-offset-2"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  {
                    translations.questions[
                      IDENTIFICATION_QUESTIONS[currentStep].id
                    ]?.options[option.value]
                  }
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm text-primary hover:text-primary-dark disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-secondary hover:text-secondary-dark"
          >
            {translations.restart}
          </button>
          <button
            onClick={() =>
              setCurrentStep(
                Math.min(IDENTIFICATION_QUESTIONS.length - 1, currentStep + 1)
              )
            }
            disabled={currentStep === IDENTIFICATION_QUESTIONS.length - 1}
            className="px-4 py-2 text-sm text-primary hover:text-primary-dark disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <SearchIcon className="h-5 w-5" />
          {translations.resultsTitle}
          <span className="text-sm font-normal text-muted-foreground ml-2">
            ({matchingTrees.length} {translations.matchingTrees})
          </span>
        </h3>

        {matchingTrees.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <TreeIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p>{translations.noResults}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {matchingTrees.slice(0, 12).map((tree) => {
              const score = scores.get(tree.slug) || 0;
              const confidence = Math.round((score / maxScore) * 100);

              return (
                <Link
                  key={tree.slug}
                  href={`/trees/${tree.slug}`}
                  className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-lg transition-all"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] bg-muted">
                    {tree.featuredImage ? (
                      <Image
                        src={tree.featuredImage}
                        alt={tree.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <TreeIcon className="h-12 w-12 text-primary/30" />
                      </div>
                    )}

                    {/* Confidence badge */}
                    {Object.keys(answers).length > 0 && (
                      <div className="absolute top-2 right-2">
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            confidence >= 70
                              ? "bg-green-500 text-white"
                              : confidence >= 40
                                ? "bg-yellow-500 text-white"
                                : "bg-gray-400 text-white"
                          }`}
                        >
                          {confidence}%
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h4 className="font-semibold text-primary-dark dark:text-primary-light group-hover:text-primary transition-colors">
                      {tree.title}
                    </h4>
                    <p className="text-sm text-secondary italic">
                      {tree.scientificName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tree.family}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {matchingTrees.length > 12 && (
          <p className="text-center mt-6 text-muted-foreground text-sm">
            +{matchingTrees.length - 12} more matches. Refine your answers to
            narrow results.
          </p>
        )}
      </div>
    </div>
  );
}

// Icons
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function TreeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 2C9.5 2 7 4 7 7c0 1.5.5 2.5 1 3.5-1.5.5-3 1.5-3 4 0 2 1 3.5 2.5 4.5-.5 1-1 2-1 3.5v.5h11v-.5c0-1.5-.5-2.5-1-3.5 1.5-1 2.5-2.5 2.5-4.5 0-2.5-1.5-3.5-3-4C16.5 9.5 17 8.5 17 7c0-3-2.5-5-5-5z" />
    </svg>
  );
}

export default IdentificationGuide;
