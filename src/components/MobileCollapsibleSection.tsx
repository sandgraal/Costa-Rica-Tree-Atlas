"use client";

import { useId, useState } from "react";

interface MobileCollapsibleSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  toggleLabels: {
    expand: string;
    collapse: string;
  };
  className?: string;
  contentClassName?: string;
  tocLabel?: string;
  tocLevel?: 2 | 3;
  defaultCollapsedOnMobile?: boolean;
}

export function MobileCollapsibleSection({
  id,
  title,
  children,
  toggleLabels,
  className = "",
  contentClassName = "",
  tocLabel,
  tocLevel = 2,
  defaultCollapsedOnMobile = true,
}: MobileCollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(!defaultCollapsedOnMobile);
  const panelId = useId();
  const mobileContentVisibility = isOpen ? "block" : "hidden";

  return (
    <section
      id={id}
      data-toc={tocLabel ?? title}
      data-toc-level={tocLevel}
      className={`mb-12 scroll-mt-32 ${className}`.trim()}
    >
      <h2 className="hidden text-xl font-semibold text-primary-dark dark:text-primary-light lg:block">
        {title}
      </h2>

      <h2 className="lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={`${title} — ${isOpen ? toggleLabels.collapse : toggleLabels.expand}`}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3 text-left shadow-sm transition-colors hover:bg-muted/60"
        >
          <span className="min-w-0 flex-1 text-base font-semibold text-foreground">
            {title}
          </span>
          <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span>{isOpen ? toggleLabels.collapse : toggleLabels.expand}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </button>
      </h2>

      <div
        id={panelId}
        className={`${mobileContentVisibility} mt-4 lg:block ${contentClassName}`.trim()}
      >
        {children}
      </div>
    </section>
  );
}
