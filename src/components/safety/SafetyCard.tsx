"use client";

import { useTranslations } from "next-intl";
import type { Tree as ContentlayerTree } from "contentlayer/generated";
import { SafetyBadge } from "./SafetyBadge";
import { SafetyWarning } from "./SafetyWarning";
import type { ToxicityLevel, RiskLevel } from "@/types/tree";

interface SafetyCardProps {
  tree: ContentlayerTree;
  className?: string;
}

const PART_ALIASES: Record<string, string> = {
  savia: "sap",
  latex: "sap",
  semillas: "seeds",
  hojas: "leaves",
  corteza: "bark",
  flores: "flowers",
  raices: "roots",
  raiceszanco: "roots",
  "raices-zanco": "roots",
  fruto: "fruit",
  frutos: "fruit",
  bayas: "fruit",
  todaslaspartes: "all",
  "todas-las-partes": "all",
};

const STRUCTURAL_ALIASES: Record<string, string> = {
  "caida-de-ramas": "falling-branches",
  "caida-ramas": "falling-branches",
  "falling-fronds": "falling-branches",
  "falling-fruit": "heavy-fruit",
  "frutos-pesados": "heavy-fruit",
  "sharp-thorns-3-10-cm-long": "sharp-spines",
  "espinas-afiladas-3-10-cm-de-largo": "sharp-spines",
  "brittle-wood-prone-to-wind-damage": "brittle-wood",
  "madera-fragil-propensa-a-danos-por-viento": "brittle-wood",
  "madera-fragil-propensa-a-danos-por-viento-": "brittle-wood",
};

function normalizeLookupToken(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function slugifyLookupToken(value: string): string {
  return normalizeLookupToken(value)
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function humanizeToken(value: string): string {
  return value.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();
}

export function SafetyCard({ tree, className = "" }: SafetyCardProps) {
  const t = useTranslations("safety");
  const translate = (key: string) =>
    t.has(key as never) ? t(key as never) : null;
  const getSafetyValueLabel = (
    group: "parts" | "structural",
    value: string
  ) => {
    const raw = value?.trim();
    if (!raw) return t("unknown");

    const normalized = normalizeLookupToken(raw);
    const slug = slugifyLookupToken(raw);
    const aliasMap = group === "parts" ? PART_ALIASES : STRUCTURAL_ALIASES;
    const candidates = [
      raw,
      raw.toLowerCase(),
      slug,
      aliasMap[normalized],
      aliasMap[slug],
    ].filter((candidate): candidate is string => Boolean(candidate));

    for (const candidate of candidates) {
      const translated = translate(`${group}.${candidate}`);
      if (translated) return translated;
    }

    return humanizeToken(raw);
  };

  // If no safety data, don't render
  const hasSafetyData =
    tree.toxicityLevel ||
    tree.skinContactRisk ||
    tree.allergenRisk ||
    tree.structuralRisks?.length ||
    tree.childSafe !== undefined ||
    tree.petSafe !== undefined;

  if (!hasSafetyData) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 ${className}`}
    >
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <span aria-hidden="true">🛡️</span>
        {t("title")}
      </h2>

      {/* Warning banner for high/severe toxicity */}
      {tree.toxicityLevel && (
        <SafetyWarning
          level={tree.toxicityLevel as ToxicityLevel}
          message={tree.safetyNotes}
        />
      )}

      {/* Risk Level Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Toxicity Level */}
        {tree.toxicityLevel && (
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {t("toxicityLevel")}
            </div>
            <SafetyBadge
              level={tree.toxicityLevel as ToxicityLevel}
              size="lg"
            />
            {tree.toxicParts && tree.toxicParts.length > 0 && (
              <div className="mt-3">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-500 mb-1">
                  {t("toxicParts")}:
                </div>
                <div className="flex flex-wrap gap-1">
                  {tree.toxicParts.map((part) => (
                    <span
                      key={part}
                      className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    >
                      {getSafetyValueLabel("parts", part)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Skin Contact Risk */}
        {tree.skinContactRisk && tree.skinContactRisk !== "none" && (
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {t("skinContactRisk")}
            </div>
            <SafetyBadge level={tree.skinContactRisk as RiskLevel} size="lg" />
          </div>
        )}

        {/* Allergen Risk */}
        {tree.allergenRisk && tree.allergenRisk !== "none" && (
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {t("allergenRisk")}
            </div>
            <SafetyBadge level={tree.allergenRisk as RiskLevel} size="lg" />
          </div>
        )}

        {/* Structural Risks */}
        {tree.structuralRisks && tree.structuralRisks.length > 0 && (
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {t("structuralRisks")}
            </div>
            <div className="flex flex-wrap gap-2">
              {tree.structuralRisks.map((risk) => (
                <span
                  key={risk}
                  className="text-xs px-2 py-1 rounded-md bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                >
                  {getSafetyValueLabel("structural", risk)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Child and Pet Safety Indicators */}
      <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
        {tree.childSafe !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">
              {tree.childSafe ? "✅" : "⚠️"}
            </span>
            <div>
              <div className="text-sm font-medium">{t("childSafe")}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {tree.childSafe ? t("yes") : t("no")}
              </div>
            </div>
          </div>
        )}

        {tree.petSafe !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">
              {tree.petSafe ? "✅" : "⚠️"}
            </span>
            <div>
              <div className="text-sm font-medium">{t("petSafe")}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {tree.petSafe ? t("yes") : t("no")}
              </div>
            </div>
          </div>
        )}

        {tree.requiresProfessionalCare && (
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">
              👷
            </span>
            <div>
              <div className="text-sm font-medium">
                {t("requiresProfessionalCare")}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {t("yes")}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Information Sections */}
      <div className="space-y-4">
        {tree.toxicityDetails && (
          <div>
            <h3 className="font-semibold text-sm mb-2">
              {t("details.toxicityTitle")}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {tree.toxicityDetails}
            </p>
          </div>
        )}

        {tree.skinContactDetails && (
          <div>
            <h3 className="font-semibold text-sm mb-2">
              {t("details.skinContactTitle")}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {tree.skinContactDetails}
            </p>
          </div>
        )}

        {tree.allergenDetails && (
          <div>
            <h3 className="font-semibold text-sm mb-2">
              {t("details.allergenTitle")}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {tree.allergenDetails}
            </p>
          </div>
        )}

        {tree.structuralRiskDetails && (
          <div>
            <h3 className="font-semibold text-sm mb-2">
              {t("details.structuralTitle")}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {tree.structuralRiskDetails}
            </p>
          </div>
        )}

        {tree.wildlifeRisks && (
          <div>
            <h3 className="font-semibold text-sm mb-2">
              {t("details.wildlifeRisksTitle")}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {tree.wildlifeRisks}
            </p>
          </div>
        )}
      </div>

      {/* First Aid Information for toxic trees */}
      {tree.toxicityLevel &&
        (tree.toxicityLevel === "severe" ||
          tree.toxicityLevel === "high" ||
          tree.toxicityLevel === "moderate") && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <span aria-hidden="true">🚑</span>
              {t("firstAid.title")}
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>• {t("firstAid.ingestion")}</p>
              <p>• {t("firstAid.skinContact")}</p>
              <p>• {t("firstAid.eyeContact")}</p>
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <p className="font-semibold text-red-900 dark:text-red-200">
                  {t("firstAid.emergencyNumber")}
                </p>
                <p className="font-semibold text-red-900 dark:text-red-200">
                  {t("firstAid.poisonControl")}
                </p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
