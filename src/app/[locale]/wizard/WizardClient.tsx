"use client";
/* eslint-disable security/detect-object-injection -- wizard uses constrained locale keys, enum-like options, and controlled answer maps. */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@i18n/navigation";
import { ProgressBar } from "@/components/ProgressBar";
import Image from "next/image";

interface Tree {
  title: string;
  scientificName: string;
  slug: string;
  family: string;
  tags: string[];
  uses: string[];
  matureSize?: string;
  lightRequirements?: string;
  waterNeeds?: string;
  growthRate?: string;
  childSafe?: boolean;
  petSafe?: boolean;
  toxicityLevel?: string;
  featuredImage?: string;
  description: string;
}

interface WizardClientProps {
  trees: Tree[];
}

interface Answers {
  space?: "small" | "medium" | "large" | "very-large";
  sunlight?: "full-sun" | "partial-shade" | "shade-tolerant";
  purpose?: string[];
  safety?: string[];
  maintenance?: "low" | "moderate" | "high";
  growthSpeed?: "slow" | "moderate" | "fast";
}

export default function WizardClient({ trees }: WizardClientProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [recommendations, setRecommendations] = useState<Tree[]>([]);

  const t = useTranslations("wizard");

  const handleAnswer = (key: keyof Answers, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleMultiSelect = (key: keyof Answers, value: string) => {
    setAnswers((prev) => {
      const current = (prev[key] as string[]) || [];
      const newValue = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: newValue.length > 0 ? newValue : undefined };
    });
  };

  const calculateRecommendations = () => {
    const filtered = trees.filter((tree) => {
      let score = 0;

      // Filter by safety requirements
      if (answers.safety?.includes("children") && !tree.childSafe) return false;
      if (answers.safety?.includes("pets") && !tree.petSafe) return false;
      if (
        answers.safety?.includes("non-toxic") &&
        tree.toxicityLevel &&
        !["none", "low"].includes(tree.toxicityLevel)
      )
        return false;

      // Score by space (based on tags)
      if (answers.space === "small" && tree.tags.includes("small")) score += 3;
      if (
        answers.space === "medium" &&
        (tree.tags.includes("medium") || !tree.tags.includes("large"))
      )
        score += 2;

      // Score by light requirements
      if (answers.sunlight === tree.lightRequirements) score += 3;

      // Score by purpose
      if (answers.purpose) {
        answers.purpose.forEach((purpose) => {
          if (purpose === "shade" && tree.uses.includes("shade")) score += 2;
          if (purpose === "fruit" && tree.uses.includes("edible")) score += 3;
          if (purpose === "ornamental" && tree.uses.includes("ornamental"))
            score += 2;
          if (purpose === "timber" && tree.uses.includes("timber")) score += 2;
          if (
            purpose === "wildlife" &&
            (tree.uses.includes("wildlife") || tree.tags.includes("wildlife"))
          )
            score += 2;
        });
      }

      // Score by growth rate
      if (answers.growthSpeed === tree.growthRate) score += 2;

      // Minimum score threshold
      return score >= 2;
    });

    // Sort by score (approximate by matching criteria)
    const sorted = filtered.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Prioritize native trees
      if (a.tags.includes("native")) scoreA += 1;
      if (b.tags.includes("native")) scoreB += 1;

      // Prioritize trees with images
      if (a.featuredImage) scoreA += 1;
      if (b.featuredImage) scoreB += 1;

      return scoreB - scoreA;
    });

    setRecommendations(sorted.slice(0, 10));
    setStep(6);
  };

  const steps = [
    // Step 0: Space
    <div key="space" className="space-y-4">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        {t("spaceQuestion")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            id: "small",
            label: t("spaceSmall"),
            desc: t("spaceSmallDesc"),
            icon: "🪴",
          },
          {
            id: "medium",
            label: t("spaceMedium"),
            desc: t("spaceMediumDesc"),
            icon: "🌳",
          },
          {
            id: "large",
            label: t("spaceLarge"),
            desc: t("spaceLargeDesc"),
            icon: "🌲",
          },
          {
            id: "very-large",
            label: t("spaceVeryLarge"),
            desc: t("spaceVeryLargeDesc"),
            icon: "🌴",
          },
        ].map((option) => (
          <button
            key={option.id}
            onClick={() => {
              handleAnswer("space", option.id);
              setStep(1);
            }}
            className={`p-6 rounded-xl border-2 transition-all text-left ${
              answers.space === option.id
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="text-4xl mb-2">{option.icon}</div>
            <h3 className="text-lg font-semibold mb-1">{option.label}</h3>
            <p className="text-sm text-muted-foreground">{option.desc}</p>
          </button>
        ))}
      </div>
    </div>,

    // Step 1: Sunlight
    <div key="sunlight" className="space-y-4">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        {t("sunlightQuestion")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            id: "full-sun",
            label: t("fullSun"),
            desc: t("fullSunDesc"),
            icon: "☀️",
          },
          {
            id: "partial-shade",
            label: t("partialShade"),
            desc: t("partialShadeDesc"),
            icon: "⛅",
          },
          {
            id: "shade-tolerant",
            label: t("shadeTolerant"),
            desc: t("shadeDesc"),
            icon: "🌥️",
          },
        ].map((option) => (
          <button
            key={option.id}
            onClick={() => {
              handleAnswer("sunlight", option.id);
              setStep(2);
            }}
            className={`p-6 rounded-xl border-2 transition-all text-left ${
              answers.sunlight === option.id
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="text-4xl mb-2">{option.icon}</div>
            <h3 className="text-lg font-semibold mb-1">{option.label}</h3>
            <p className="text-sm text-muted-foreground">{option.desc}</p>
          </button>
        ))}
      </div>
    </div>,

    // Step 2: Purpose
    <div key="purpose" className="space-y-4">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        {t("purposeQuestion")}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { id: "shade", label: t("purposeShade"), icon: "☂️" },
          { id: "fruit", label: t("purposeFruit"), icon: "🍎" },
          { id: "ornamental", label: t("purposeOrnamental"), icon: "🌸" },
          { id: "privacy", label: t("purposePrivacy"), icon: "🚪" },
          { id: "wildlife", label: t("purposeWildlife"), icon: "🦜" },
          { id: "timber", label: t("purposeTimber"), icon: "🪵" },
          { id: "windbreak", label: t("purposeWindbreak"), icon: "💨" },
          { id: "soil", label: t("purposeSoil"), icon: "🌱" },
        ].map((option) => (
          <button
            key={option.id}
            onClick={() => {
              handleMultiSelect("purpose", option.id);
            }}
            className={`p-4 rounded-lg border-2 transition-all text-center ${
              (answers.purpose || []).includes(option.id)
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="text-3xl mb-1">{option.icon}</div>
            <p className="text-sm font-medium">{option.label}</p>
          </button>
        ))}
      </div>
      <button
        onClick={() => {
          setStep(3);
        }}
        disabled={!answers.purpose || answers.purpose.length === 0}
        className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t("next")}
      </button>
    </div>,

    // Step 3: Safety
    <div key="safety" className="space-y-4">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        {t("safetyQuestion")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { id: "children", label: t("safetyChildren"), icon: "👶" },
          { id: "pets", label: t("safetyPets"), icon: "🐕" },
          { id: "non-toxic", label: t("safetyNonToxic"), icon: "✅" },
          { id: "low-risk", label: t("safetyLowRisk"), icon: "🛡️" },
          { id: "none", label: t("safetyNone"), icon: "🤷" },
        ].map((option) => (
          <button
            key={option.id}
            onClick={() => {
              handleMultiSelect("safety", option.id);
            }}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              (answers.safety || []).includes(option.id)
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <span className="text-2xl mr-3">{option.icon}</span>
            <span className="font-medium">{option.label}</span>
          </button>
        ))}
      </div>
      <button
        onClick={() => {
          setStep(4);
        }}
        className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
      >
        {t("next")}
      </button>
    </div>,

    // Step 4: Maintenance
    <div key="maintenance" className="space-y-4">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        {t("maintenanceQuestion")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            id: "low",
            label: t("maintenanceLow"),
            desc: t("maintenanceLowDesc"),
            icon: "😌",
          },
          {
            id: "moderate",
            label: t("maintenanceModerate"),
            desc: t("maintenanceModerateDesc"),
            icon: "🛠️",
          },
          {
            id: "high",
            label: t("maintenanceHigh"),
            desc: t("maintenanceHighDesc"),
            icon: "🚜",
          },
        ].map((option) => (
          <button
            key={option.id}
            onClick={() => {
              handleAnswer("maintenance", option.id);
              setStep(5);
            }}
            className={`p-6 rounded-xl border-2 transition-all text-left ${
              answers.maintenance === option.id
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="text-4xl mb-2">{option.icon}</div>
            <h3 className="text-lg font-semibold mb-1">{option.label}</h3>
            <p className="text-sm text-muted-foreground">{option.desc}</p>
          </button>
        ))}
      </div>
    </div>,

    // Step 5: Growth Speed
    <div key="growth" className="space-y-4">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        {t("growthQuestion")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            id: "slow",
            label: t("growthSlow"),
            desc: t("growthSlowDesc"),
            icon: "🐌",
          },
          {
            id: "moderate",
            label: t("growthModerate"),
            desc: t("growthModerateDesc"),
            icon: "🚶",
          },
          {
            id: "fast",
            label: t("growthFast"),
            desc: t("growthFastDesc"),
            icon: "🚀",
          },
        ].map((option) => (
          <button
            key={option.id}
            onClick={() => {
              handleAnswer("growthSpeed", option.id);
              calculateRecommendations();
            }}
            className={`p-6 rounded-xl border-2 transition-all text-left ${
              answers.growthSpeed === option.id
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="text-4xl mb-2">{option.icon}</div>
            <h3 className="text-lg font-semibold mb-1">{option.label}</h3>
            <p className="text-sm text-muted-foreground">{option.desc}</p>
          </button>
        ))}
      </div>
    </div>,
  ];

  if (step === 6) {
    // Results page
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary-dark dark:text-primary-light mb-4">
              {t("resultsTitle")}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t("resultsSubtitle")}
            </p>
          </div>

          {recommendations.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-lg text-muted-foreground mb-6">
                {t("resultsNone")}
              </p>
              <button
                onClick={() => {
                  setStep(0);
                  setAnswers({});
                  setRecommendations([]);
                }}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                {t("restart")}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {recommendations.map((tree) => (
                  <div
                    key={tree.slug}
                    className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary transition-all"
                  >
                    {tree.featuredImage && (
                      <div className="relative w-full h-48 bg-muted">
                        <Image
                          src={tree.featuredImage}
                          alt={tree.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-1">
                        {tree.title}
                      </h3>
                      <p className="text-sm italic text-muted-foreground mb-3">
                        {tree.scientificName}
                      </p>
                      <p className="text-sm mb-4 line-clamp-2">
                        {tree.description}
                      </p>
                      <Link
                        href={`/trees/${tree.slug}`}
                        className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                      >
                        {t("viewProfile")} →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <button
                  onClick={() => {
                    setStep(0);
                    setAnswers({});
                    setRecommendations([]);
                  }}
                  className="px-6 py-3 border-2 border-border rounded-lg hover:border-primary transition-colors"
                >
                  {t("restart")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-dark dark:text-primary-light mb-4">
            {t("title")}
          </h1>
          <p className="text-xl text-muted-foreground mb-4">{t("subtitle")}</p>

          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">
              {t("step")} {step + 1} {t("of")} 6
            </span>
          </div>
          <div className="w-full max-w-md mx-auto">
            <ProgressBar
              value={((step + 1) / 6) * 100}
              barClassName="bg-primary"
              label="Wizard progress"
            />
          </div>
        </div>

        {/* Step content */}
        <div className="bg-card rounded-xl border border-border p-8">
          {step > 0 && (
            <button
              onClick={() => {
                setStep(step - 1);
              }}
              className="mb-6 text-primary hover:text-primary-dark"
            >
              {t("back")}
            </button>
          )}
          {steps[step]}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/trees"
            className="text-primary hover:text-primary-dark underline"
          >
            ← {t("browseAllTrees")}
          </Link>
        </div>
      </div>
    </div>
  );
}
