import type { ToxicityLevel, RiskLevel } from "@/types/tree";

interface SafetyIconProps {
  toxicityLevel?: ToxicityLevel;
  skinContactRisk?: RiskLevel;
  childSafe?: boolean;
  petSafe?: boolean;
  className?: string;
}

export function SafetyIcon({
  toxicityLevel,
  skinContactRisk,
  childSafe,
  petSafe,
  className = "",
}: SafetyIconProps) {
  // Determine the highest risk level
  const getHighestRisk = (): ToxicityLevel | "safe" => {
    if (toxicityLevel === "severe" || skinContactRisk === "severe")
      return "severe";
    if (toxicityLevel === "high" || skinContactRisk === "high") return "high";
    if (toxicityLevel === "moderate" || skinContactRisk === "moderate")
      return "moderate";
    if (toxicityLevel === "low" || skinContactRisk === "low") return "low";
    if (childSafe === true && petSafe === true) return "safe";
    return "none";
  };

  const riskLevel = getHighestRisk();

  // Don't show icon for none/safe unless explicitly marked safe
  if (riskLevel === "none" && childSafe !== true) {
    return null;
  }

  const getIcon = () => {
    switch (riskLevel) {
      case "severe":
        return "⛔";
      case "high":
        return "🔴";
      case "moderate":
        return "🟡";
      case "low":
        return "🔵";
      case "safe":
        return "✅";
      default:
        return null;
    }
  };

  const icon = getIcon();
  if (!icon) return null;

  const getAriaLabel = () => {
    switch (riskLevel) {
      case "severe":
        return "Severe safety hazard";
      case "high":
        return "High risk";
      case "moderate":
        return "Moderate risk";
      case "low":
        return "Low risk";
      case "safe":
        return "Safe";
      default:
        return "";
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      role="img"
      aria-label={getAriaLabel()}
      title={getAriaLabel()}
    >
      {icon}
    </span>
  );
}
