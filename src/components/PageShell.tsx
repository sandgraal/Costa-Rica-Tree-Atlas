import type { ReactNode } from "react";

type MaxWidth = "4xl" | "6xl" | "7xl";

const maxWidthClass: Record<MaxWidth, string> = {
  "4xl": "max-w-4xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
};

interface PageShellProps {
  children: ReactNode;
  maxWidth?: MaxWidth;
  className?: string;
}

/**
 * Standard page container: vertical padding + centered responsive container.
 * Replaces the recurring `<div className="py-12 px-4"><div className="container mx-auto max-w-6xl">` pattern.
 */
export function PageShell({
  children,
  maxWidth = "6xl",
  className,
}: PageShellProps) {
  // eslint-disable-next-line security/detect-object-injection -- maxWidth is constrained to known keys
  const width = maxWidthClass[maxWidth];
  return (
    <div className={`py-12 px-4 ${className ?? ""}`}>
      <div className={`container mx-auto ${width}`}>{children}</div>
    </div>
  );
}
