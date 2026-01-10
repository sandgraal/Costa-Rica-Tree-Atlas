"use client";

import { useTranslations } from "next-intl";
import type { ToxicityLevel, RiskLevel } from "@/types/tree";

interface SafetyBadgeProps {
  level: ToxicityLevel | RiskLevel | "safe";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const getRiskColor = (level: ToxicityLevel | RiskLevel | "safe") => {
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

const getRiskIcon = (level: ToxicityLevel | RiskLevel | "safe") => {
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

  const getLabel = () => {
    if (level === "safe") return t("badges.safe");
    return t(`levels.${level}`);
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${getRiskColor(level)} ${getSizeClasses(size)} ${className}`}
      role="status"
      aria-label={`Safety level: ${getLabel()}`}
    >
      <span aria-hidden="true">{getRiskIcon(level)}</span>
      {showLabel && <span>{getLabel()}</span>}
    </span>
  );
}
