import { getComparisonTagIcon, getComparisonTagLabel } from "@/lib/comparison";
import type { Locale } from "@/types/tree";

interface ComparisonTagPillProps {
  tag: string;
  variant?: "primary" | "muted";
  locale?: Locale;
}

/**
 * Unified comparison tag pill component
 * Used across comparison list, detail pages, and MDX content
 * Displays tags with icons and localized labels
 */
export function ComparisonTagPill({
  tag,
  variant = "primary",
  locale = "en",
}: ComparisonTagPillProps) {
  const icon = getComparisonTagIcon(tag);
  const label = getComparisonTagLabel(tag, locale);

  const variantStyles = {
    primary: "bg-primary/10 text-primary",
    muted: "bg-muted text-muted-foreground",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${variantStyles[variant]}`}
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </span>
  );
}
