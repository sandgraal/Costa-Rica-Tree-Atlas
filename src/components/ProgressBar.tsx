/**
 * ProgressBar — reusable progress bar with inline style for dynamic width.
 *
 * CSP note: This component centralizes the single inline `style` needed for
 * runtime-computed progress widths.  Tailwind cannot handle truly dynamic
 * percentage values, so this is an intentional, minimal use of
 * `style={{ width }}`.
 */

interface ProgressBarProps {
  /** Progress value 0–100 (percentage) */
  value: number;
  /** Tailwind classes for the filled bar (gradient, color, etc.) */
  barClassName?: string;
  /** Tailwind classes for the track (background) */
  trackClassName?: string;
  /** Accessible label */
  label?: string;
}

export function ProgressBar({
  value,
  barClassName = "bg-gradient-to-r from-green-500 to-emerald-500",
  trackClassName = "h-2 bg-muted rounded-full overflow-hidden",
  label,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className={trackClassName}
      role="progressbar"
      aria-valuenow={Math.round(clampedValue)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={`h-full transition-all duration-300 ${barClassName}`}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
