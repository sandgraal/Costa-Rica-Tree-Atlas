import { getComparisonTagIcon } from "@/lib/comparison";

interface ComparisonTagPillProps {
  tag: string;
  variant?: "primary" | "muted";
}

/**
 * Unified comparison tag pill component
 * Used across comparison list, detail pages, and MDX content
 */
export function ComparisonTagPill({
  tag,
  variant = "primary",
}: ComparisonTagPillProps) {
  const icon = getComparisonTagIcon(tag);
  const formattedTag = tag.charAt(0).toUpperCase() + tag.slice(1);

  const variantStyles = {
    primary: "bg-primary/10 text-primary",
    muted: "bg-muted text-muted-foreground",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${variantStyles[variant]}`}
    >
      {icon && <span>{icon}</span>}
      <span>{formattedTag}</span>
    </span>
  );
}
