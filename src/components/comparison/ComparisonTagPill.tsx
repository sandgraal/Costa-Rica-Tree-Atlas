import { getComparisonTagIcon } from "@/lib/comparison";

interface ComparisonTagPillProps {
  tag: string;
  variant?: "default" | "muted" | "primary";
}

/**
 * Unified comparison tag pill component
 * Used across comparison list, detail pages, and MDX content
 */
export function ComparisonTagPill({
  tag,
  variant = "default",
}: ComparisonTagPillProps) {
  const icon = getComparisonTagIcon(tag);
  const formattedTag = tag.charAt(0).toUpperCase() + tag.slice(1);

  const variantStyles = {
    default: "bg-primary/10 text-primary",
    muted: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${variantStyles[variant]}`}
    >
      {icon && <span>{icon}</span>}
      <span className="capitalize">{formattedTag}</span>
    </span>
  );
}
