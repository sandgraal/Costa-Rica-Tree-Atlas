"use client";
/* eslint-disable security/detect-object-injection -- safety page groups/filters by bounded toxicity category keys in typed local dictionaries. */

import { useMemo, useState } from "react";
import { Link } from "@i18n/navigation";
import { SafetyIcon, SafetyBadge } from "@/components/safety";
import type { Tree as ContentlayerTree } from "contentlayer/generated";
import type { ToxicityLevel } from "@/types";
import { useTranslations } from "next-intl";

interface SafetyPageClientProps {
  trees: ContentlayerTree[];
}

type SafetyCategory = "all" | "severe" | "high" | "moderate" | "low" | "none";

export function SafetyPageClient({ trees }: SafetyPageClientProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<SafetyCategory>("all");
  const t = useTranslations("safety.page");

  // Group trees by toxicity level
  const treesByToxicity = useMemo(() => {
    const groups: Record<string, ContentlayerTree[]> = {
      severe: [],
      high: [],
      moderate: [],
      low: [],
      none: [],
      unknown: [],
    };

    trees.forEach((tree) => {
      const level = tree.toxicityLevel || "unknown";
      if (groups[level]) {
        groups[level].push(tree);
      } else {
        groups.unknown.push(tree);
      }
    });

    // Sort trees within each group by title
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => a.title.localeCompare(b.title));
    });

    return groups;
  }, [trees]);

  // Filter trees based on selected category
  const displayTrees = useMemo(() => {
    if (selectedCategory === "all") {
      return trees;
    }
    return treesByToxicity[selectedCategory] || [];
  }, [selectedCategory, trees, treesByToxicity]);

  const ingestionSteps = [
    t("ingestionStep1"),
    t("ingestionStep2"),
    t("ingestionStep3"),
    t("ingestionStep4"),
    t("ingestionStep5"),
  ];
  const skinContactSteps = [
    t("skinContactStep1"),
    t("skinContactStep2"),
    t("skinContactStep3"),
    t("skinContactStep4"),
    t("skinContactStep5"),
  ];
  const eyeContactSteps = [
    t("eyeContactStep1"),
    t("eyeContactStep2"),
    t("eyeContactStep3"),
    t("eyeContactStep4"),
    t("eyeContactStep5"),
  ];

  const categories: Array<{
    value: SafetyCategory;
    label: string;
    color: string;
  }> = [
    { value: "all", label: t("allTrees"), color: "bg-gray-500" },
    { value: "severe", label: t("severeToxicity"), color: "bg-red-600" },
    { value: "high", label: t("highToxicity"), color: "bg-red-500" },
    { value: "moderate", label: t("moderateToxicity"), color: "bg-orange-500" },
    { value: "low", label: t("lowToxicity"), color: "bg-yellow-500" },
    { value: "none", label: t("nonToxic"), color: "bg-green-600" },
  ];

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-dark dark:text-primary-light mb-4">
            {t("title")}
          </h1>
          <p className="text-xl text-muted-foreground mb-4">{t("subtitle")}</p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-900 dark:text-yellow-200">
              <strong>{t("safetyWarning")}</strong>
            </p>
            <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-2">
              {t("disclaimer")}
            </p>
          </div>
        </div>

        {/* Print button */}
        <div className="mb-6 print:hidden">
          <button
            onClick={() => {
              window.print();
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            🖨️ {t("printButton")}
          </button>
        </div>

        {/* Emergency Contacts */}
        <section className="mb-12 bg-card rounded-xl p-6 border border-border print:break-inside-avoid">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t("emergencyTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="font-semibold text-red-900 dark:text-red-200">
                {t("poisonControl")}
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                2223-1028
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                {t("availability")}
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="font-semibold text-blue-900 dark:text-blue-200">
                {t("emergency")}
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                911
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {t("emergencyServices")}
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="font-semibold text-green-900 dark:text-green-200">
                {t("insurance")}
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                800-8000-911
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">INS</p>
            </div>
          </div>
        </section>

        {/* First Aid Procedures */}
        <section className="mb-12 bg-card rounded-xl p-6 border border-border print:break-inside-avoid">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {t("firstAidTitle")}
          </h2>

          {/* Ingestion */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-foreground mb-3">
              {t("ingestionTitle")}
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              {ingestionSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>

          {/* Skin Contact */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-foreground mb-3">
              {t("skinContactTitle")}
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              {skinContactSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>

          {/* Eye Contact */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              {t("eyeContactTitle")}
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              {eyeContactSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </section>

        {/* Category filters */}
        <div className="mb-6 print:hidden">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t("categoriesTitle")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const count =
                cat.value === "all"
                  ? trees.length
                  : treesByToxicity[cat.value].length || 0;
              return (
                <button
                  key={cat.value}
                  onClick={() => {
                    setSelectedCategory(cat.value);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === cat.value
                      ? `${cat.color} text-white`
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Trees list */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {selectedCategory === "all"
              ? t("treeCount", { count: displayTrees.length })
              : `${categories.find((c) => c.value === selectedCategory)?.label} - ${t("treeCount", { count: displayTrees.length })}`}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayTrees.map((tree) => (
              <Link
                key={tree.slug}
                href={`/trees/${tree.slug}`}
                className="block p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-all hover:shadow-md print:break-inside-avoid"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <SafetyIcon
                      toxicityLevel={tree.toxicityLevel as ToxicityLevel}
                      skinContactRisk={tree.skinContactRisk}
                      childSafe={tree.childSafe}
                      petSafe={tree.petSafe}
                      className="text-3xl"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">
                      {tree.title}
                    </h3>
                    <p className="text-sm text-muted-foreground italic">
                      {tree.scientificName}
                    </p>
                    {tree.toxicityLevel && (
                      <SafetyBadge
                        level={tree.toxicityLevel as ToxicityLevel}
                        className="mt-2"
                      />
                    )}
                    {tree.toxicityDetails && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {tree.toxicityDetails}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {displayTrees.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              {t("noTreesInCategory")}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
