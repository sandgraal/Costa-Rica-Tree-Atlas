"use client";

import React, { useState, useRef, useEffect } from "react";
import { Link } from "@i18n/navigation";

interface GlossaryTooltipProps {
  term: string;
  definition: string;
  slug: string;
  children: React.ReactNode;
}

/**
 * Tooltip component that displays glossary term definitions on hover.
 *
 * Features:
 * - Shows definition on hover/focus
 * - Accessible with keyboard navigation
 * - Links to full glossary page
 * - Responsive positioning (avoids edge overflow)
 * - Touch-friendly for mobile
 */
export function GlossaryTooltip({
  term,
  definition,
  slug,
  children,
}: GlossaryTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("top");
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      // Calculate optimal tooltip position to avoid viewport overflow
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // If tooltip would overflow bottom, show it above
      if (triggerRect.bottom + tooltipRect.height + 8 > viewportHeight) {
        setPosition("top");
      } else {
        setPosition("bottom");
      }
    }
  }, [isVisible]);

  const handleMouseEnter = () => setIsVisible(true);
  const handleMouseLeave = () => setIsVisible(false);
  const handleFocus = () => setIsVisible(true);
  const handleBlur = () => setIsVisible(false);

  // Truncate definition for tooltip (full definition on glossary page)
  const truncatedDefinition =
    definition.length > 150 ? `${definition.substring(0, 150)}...` : definition;

  return (
    <span className="relative inline-block">
      <Link
        ref={triggerRef}
        href={`/glossary/${slug}`}
        className="text-primary hover:text-primary-dark underline decoration-dotted underline-offset-2 transition-colors cursor-help"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-describedby={isVisible ? `tooltip-${slug}` : undefined}
      >
        {children}
      </Link>

      {/* Tooltip */}
      {isVisible && (
        <div
          ref={tooltipRef}
          id={`tooltip-${slug}`}
          role="tooltip"
          className={`
            absolute z-50 w-64 p-3 
            bg-card border-2 border-primary/20 rounded-lg shadow-xl
            text-sm text-foreground
            pointer-events-none
            animate-in fade-in duration-200
            ${
              position === "top"
                ? "bottom-full mb-2 left-1/2 -translate-x-1/2"
                : "top-full mt-2 left-1/2 -translate-x-1/2"
            }
          `}
        >
          {/* Arrow */}
          <div
            className={`
              absolute left-1/2 -translate-x-1/2 w-0 h-0
              border-l-8 border-r-8 border-transparent
              ${
                position === "top"
                  ? "top-full border-t-8 border-t-primary/20"
                  : "bottom-full border-b-8 border-b-primary/20"
              }
            `}
          />

          {/* Content */}
          <div className="relative">
            <p className="font-semibold text-primary mb-1">{term}</p>
            <p className="text-foreground/80 leading-relaxed">
              {truncatedDefinition}
            </p>
            <p className="text-xs text-primary/60 mt-2 italic">
              Click for full definition →
            </p>
          </div>
        </div>
      )}
    </span>
  );
}
