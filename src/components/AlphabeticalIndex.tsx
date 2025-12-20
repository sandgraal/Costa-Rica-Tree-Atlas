"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { Tree } from "contentlayer/generated";
import Link from "next/link";

interface AlphabeticalIndexProps {
  trees: Tree[];
  locale: string;
}

export function AlphabeticalIndex({ trees, locale }: AlphabeticalIndexProps) {
  const t = useTranslations("trees");

  // Group trees by first letter
  const groupedTrees = useMemo(() => {
    const groups: Record<string, Tree[]> = {};

    trees.forEach((tree) => {
      const firstLetter = tree.title.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(tree);
    });

    // Sort trees within each group
    Object.keys(groups).forEach((letter) => {
      groups[letter].sort((a, b) => a.title.localeCompare(b.title));
    });

    return groups;
  }, [trees]);

  // Get all letters that have trees
  const letters = useMemo(() => {
    return Object.keys(groupedTrees).sort();
  }, [groupedTrees]);

  // All possible letters for the alphabet bar
  const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");

  return (
    <div className="space-y-8">
      {/* Alphabet Navigation Bar */}
      <nav
        className="sticky top-20 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b border-border"
        aria-label={t("alphabetNav")}
      >
        <div className="flex flex-wrap justify-center gap-1">
          {alphabet.map((letter) => {
            const hasEntries = letters.includes(letter);
            return (
              <a
                key={letter}
                href={hasEntries ? `#letter-${letter}` : undefined}
                className={`
                  w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors
                  ${
                    hasEntries
                      ? "text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer"
                      : "text-muted-foreground/40 cursor-default"
                  }
                `}
                aria-disabled={!hasEntries}
              >
                {letter}
              </a>
            );
          })}
        </div>
      </nav>

      {/* Grouped Tree List */}
      <div className="space-y-12">
        {letters.map((letter) => (
          <section
            key={letter}
            id={`letter-${letter}`}
            className="scroll-mt-32"
          >
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-3xl font-bold text-primary-dark dark:text-primary-light">
                {letter}
              </h2>
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">
                {groupedTrees[letter].length}{" "}
                {groupedTrees[letter].length === 1
                  ? t("species")
                  : t("speciesPlural")}
              </span>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
              {groupedTrees[letter].map((tree) => (
                <li key={tree._id}>
                  <Link
                    href={`/${locale}/trees/${tree.slug}`}
                    className="group flex items-baseline gap-2 py-1.5 hover:text-primary transition-colors"
                  >
                    <span className="font-medium">{tree.title}</span>
                    <span className="text-sm text-muted-foreground italic group-hover:text-primary/70">
                      {tree.scientificName}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* Back to Top Button */}
      <div className="text-center pt-8">
        <a
          href="#"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <UpArrowIcon className="h-4 w-4" />
          {t("backToTop")}
        </a>
      </div>
    </div>
  );
}

function UpArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 15l-6-6-6 6" />
    </svg>
  );
}
