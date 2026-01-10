"use client";

import { useTranslations } from "next-intl";
import type { ToxicityLevel } from "@/types/tree";

interface SafetyWarningProps {
  level: ToxicityLevel;
  message?: string;
  className?: string;
}

const getWarningStyles = (level: ToxicityLevel) => {
  switch (level) {
    case "severe":
      return {
        container:
          "bg-red-50 border-red-500 dark:bg-red-950 dark:border-red-700",
        icon: "⛔",
        title: "warnings.critical",
        message: "warnings.criticalMessage",
      };
    case "high":
      return {
        container:
          "bg-orange-50 border-orange-500 dark:bg-orange-950 dark:border-orange-700",
        icon: "🔴",
        title: "warnings.high",
        message: "warnings.highMessage",
      };
    case "moderate":
      return {
        container:
          "bg-yellow-50 border-yellow-500 dark:bg-yellow-950 dark:border-yellow-700",
        icon: "🟡",
        title: "warnings.moderate",
        message: "warnings.moderateMessage",
      };
    default:
      return null;
  }
};

export function SafetyWarning({
  level,
  message,
  className = "",
}: SafetyWarningProps) {
  const t = useTranslations("safety");

  // Only show warnings for moderate and above
  if (level === "none" || level === "low") {
    return null;
  }

  const styles = getWarningStyles(level);
  if (!styles) return null;

  return (
    <div
      className={`rounded-lg border-l-4 p-4 mb-6 ${styles.container} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0" aria-hidden="true" role="img">
          {styles.icon}
        </span>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2">{t(styles.title as never)}</h3>
          <p className="text-sm leading-relaxed">
            {message || t(styles.message as never)}
          </p>
        </div>
      </div>
    </div>
  );
}
