"use client";

import { useTranslations } from "next-intl";
import type { ToxicityLevel, RiskLevel } from "@/types/tree";

interface SafetyBadgeProps {
  level: ToxicityLevel | RiskLevel | "safe" | string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const LEVEL_ALIASES: Record<string, ToxicityLevel | RiskLevel | "safe"> = {
  none: "none",
  ningun: "none",
  ninguno: "none",
  ningunos: "none",
  ninguna: "none",
  safe: "safe",
  low: "low",
  mild: "low",
  bajo: "low",
  baja: "low",
  moderate: "moderate",
  moderado: "moderate",
  moderada: "moderate",
  high: "high",
  alto: "high",
  alta: "high",
  severe: "severe",
  severo: "severe",
  severa: "severe",
};

function normalizeLevel(
  value: string
): ToxicityLevel | RiskLevel | "safe" | "unknown" {
  const key = value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
  return LEVEL_ALIASES[key] ?? "unknown";
}

function humanizeToken(value: string): string {
  return value.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();
}

const getRiskColor = (
  level: ToxicityLevel | RiskLevel | "safe" | "unknown"
) => {
  switch (level) {
    case "none":
    case "safe":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "low":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "moderate":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "high":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "severe":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
};

const getRiskIcon = (level: ToxicityLevel | RiskLevel | "safe" | "unknown") => {
  switch (level) {
    case "none":
    case "safe":
      return "🟢";
    case "low":
      return "🔵";
    case "moderate":
      return "🟡";
    case "high":
      return "🟠";
    case "severe":
      return "🔴";
    default:
      return "⚪";
  }
};

const getSizeClasses = (size: "sm" | "md" | "lg") => {
  switch (size) {
    case "sm":
      return "text-xs px-2 py-0.5";
    case "md":
      return "text-sm px-2.5 py-1";
    case "lg":
      return "text-base px-3 py-1.5";
  }
};

export function SafetyBadge({
  level,
  size = "md",
  showLabel = true,
  className = "",
}: SafetyBadgeProps) {
  const t = useTranslations("safety");
  const normalizedLevel = normalizeLevel(level);
  const translate = (key: string) =>
    t.has(key as never) ? t(key as never) : null;

  const getLabel = () => {
    if (normalizedLevel === "safe") {
      return translate("badges.safe") ?? humanizeToken(level);
    }
    if (normalizedLevel !== "unknown") {
      return translate(`levels.${normalizedLevel}`) ?? humanizeToken(level);
    }
    return humanizeToken(level);
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${getRiskColor(normalizedLevel)} ${getSizeClasses(size)} ${className}`}
      role="status"
      aria-label={`Safety level: ${getLabel()}`}
    >
      <span aria-hidden="true">{getRiskIcon(normalizedLevel)}</span>
      {showLabel && <span>{getLabel()}</span>}
    </span>
  );
}
