"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  className?: string;
  variant?: "desktop" | "mobile";
}

export function TableOfContents({
  className = "",
  variant = "desktop",
}: TableOfContentsProps) {
  const t = useTranslations("toc");
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(
        "[data-toc][id], main h2[id], main h3[id], article h2[id], article h3[id]"
      )
    );

    const allowedLevels = new Set(variant === "mobile" ? [2] : [2, 3]);
    const seenIds = new Set<string>();

    const trackedElements = elements
      .map((element) => {
        const id = element.id;
        const fallbackLevel = Number.parseInt(element.tagName.charAt(1), 10);
        const explicitLevel = Number.parseInt(
          element.dataset.tocLevel || "",
          10
        );
        const level = Number.isNaN(explicitLevel)
          ? Number.isNaN(fallbackLevel)
            ? 2
            : fallbackLevel
          : explicitLevel;
        const text =
          element.dataset.toc?.trim() || element.textContent?.trim() || "";

        return {
          element,
          item: { id, text, level },
        };
      })
      .filter(({ item }) => {
        if (!item.id || !item.text || !allowedLevels.has(item.level)) {
          return false;
        }

        if (seenIds.has(item.id)) {
          return false;
        }

        seenIds.add(item.id);
        return true;
      });

    setHeadings(trackedElements.map(({ item }) => item));

    // Set up intersection observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin:
          variant === "mobile" ? "-140px 0px -65% 0px" : "-100px 0px -80% 0px",
        threshold: 0.1,
      }
    );

    trackedElements.forEach(({ element }) => {
      observer.observe(element);
    });

    return () => {
      trackedElements.forEach(({ element }) => {
        observer.unobserve(element);
      });
    };
  }, [variant]);

  if (headings.length === 0) {
    return null;
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = variant === "mobile" ? 128 : 96;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  if (variant === "mobile") {
    const title = t("jumpTo");

    return (
      <nav
        className={`sticky top-16 z-30 -mx-4 border-y border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 ${className}`}
        aria-label={title}
      >
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </div>
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {headings.map((heading) => {
            const isActive = activeId === heading.id;

            return (
              <li key={heading.id} className="shrink-0">
                <button
                  onClick={() => {
                    scrollToHeading(heading.id);
                  }}
                  className={`rounded-full border px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {heading.text}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  const title = t("contents");

  return (
    <nav
      className={`bg-card rounded-xl border border-border p-4 sticky top-20 ${className}`}
      aria-label={title}
    >
      <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
        {title}
      </h2>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          const isH3 = heading.level === 3;

          return (
            <li key={heading.id} className={isH3 ? "ml-4" : ""}>
              <button
                onClick={() => {
                  scrollToHeading(heading.id);
                }}
                className={`
                  text-left w-full py-1 px-2 rounded transition-colors
                  ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }
                  ${isH3 ? "text-xs" : ""}
                `}
              >
                {heading.text}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
