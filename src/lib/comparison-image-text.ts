import { getLocalizedText, normalizeLocale } from "@/lib/i18n";
import type { Locale } from "@/types/tree";

type ComparisonDifficulty = "easy" | "moderate" | "challenging";

const COMPARISON_GUIDE_LABEL: Record<Locale, string> = {
  en: "Comparison Guide",
  es: "Guía de Comparación",
};

const COMPARISON_DIFFICULTY_LABELS: Record<
  ComparisonDifficulty,
  Record<Locale, string>
> = {
  easy: { en: "Easy", es: "Fácil" },
  moderate: { en: "Moderate", es: "Moderado" },
  challenging: { en: "Challenging", es: "Desafiante" },
};

function isComparisonDifficulty(
  value: string | undefined
): value is ComparisonDifficulty {
  return value === "easy" || value === "moderate" || value === "challenging";
}

export function getComparisonGuideLabel(locale: string): string {
  return getLocalizedText(COMPARISON_GUIDE_LABEL, normalizeLocale(locale));
}

export function getComparisonDifficultyLabel(
  difficulty: string | undefined,
  locale: string
): string {
  if (!isComparisonDifficulty(difficulty)) {
    return "";
  }

  return getLocalizedText(
    COMPARISON_DIFFICULTY_LABELS[difficulty],
    normalizeLocale(locale)
  );
}
