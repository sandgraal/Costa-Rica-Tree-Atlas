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

  return (
    <span className="relative inline-block">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="underline decoration-dotted decoration-primary hover:text-primary transition-colors cursor-help"
        aria-label={`Definition of ${term}`}
      >
        {children}
      </button>
      {isOpen && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg shadow-lg border border-border max-w-xs">
          <span className="font-semibold block mb-1">{term}</span>
          <span className="text-xs">{definition}</span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 bg-popover border-r border-b border-border rotate-45" />
        </span>
      )}
    </span>
  );
}
