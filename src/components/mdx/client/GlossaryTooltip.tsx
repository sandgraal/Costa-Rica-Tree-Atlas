"use client";

import React from "react";

interface GlossaryTooltipProps {
  term: string;
  definition: string;
  children: React.ReactNode;
}

export function GlossaryTooltip({
  term,
  definition,
  children,
}: GlossaryTooltipProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const tooltipId = React.useId();

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onClick={() => setIsOpen(true)}
        className="underline decoration-dotted decoration-primary hover:text-primary transition-colors cursor-help"
        aria-label={`Definition of ${term}`}
        aria-describedby={isOpen ? tooltipId : undefined}
      >
        {children}
      </button>
      {isOpen && (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg shadow-lg border border-border max-w-xs"
        >
          <span className="font-semibold block mb-1">{term}</span>
          <span className="text-xs">{definition}</span>
          <span aria-hidden="true" className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 bg-popover border-r border-b border-border rotate-45" />
        </span>
      )}
    </span>
  );
}
