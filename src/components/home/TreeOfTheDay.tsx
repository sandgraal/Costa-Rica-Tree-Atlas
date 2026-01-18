"use client";

import { memo } from "react";
import { Link } from "@i18n/navigation";
import { allTrees } from "contentlayer/generated";
import { SafeImage } from "@/components/SafeImage";

export const TreeOfTheDay = memo(function TreeOfTheDay({
  trees,
  locale,
  treeOfTheDay,
}: {
  trees: typeof allTrees;
  locale: string;
  treeOfTheDay: string;
}) {
  // Get a deterministic tree based on day of year
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const treeIndex = dayOfYear % trees.length;
  const tree = trees[treeIndex];

  if (!tree) return null;

  // Get some interesting facts about the tree
  const facts = [];
  if (tree.maxHeight)
    facts.push({
      icon: "📏",
      text:
        locale === "es"
          ? `Altura: ${tree.maxHeight}`
          : `Height: ${tree.maxHeight}`,
    });
  if (tree.nativeRegion)
    facts.push({
      icon: "🌎",
      text:
        locale === "es"
          ? `Región: ${tree.nativeRegion}`
          : `Region: ${tree.nativeRegion}`,
    });
  if (tree.family)
    facts.push({
      icon: "🌿",
      text:
        locale === "es" ? `Familia: ${tree.family}` : `Family: ${tree.family}`,
    });
  if (tree.uses && tree.uses.length > 0)
    facts.push({
      icon: "🛠️",
      text: tree.uses[0],
    });

  return (
    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-border overflow-hidden">
      <div className="md:flex">
        {/* Image */}
        <div className="md:w-2/5 relative">
          <div className="aspect-[4/3] md:aspect-auto md:h-full bg-gradient-to-br from-primary/20 to-secondary/20 relative">
            <SafeImage
              src={tree.featuredImage || ""}
              alt={tree.title}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              quality={70}
              className="object-cover"
              fallback="placeholder"
            />
          </div>
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-accent text-primary-dark rounded-full text-sm font-semibold shadow-lg">
            🌟 {treeOfTheDay}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 md:w-3/5 flex flex-col justify-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-dark dark:text-primary-light mb-2">
            {tree.title}
          </h2>
          <p className="text-lg text-secondary italic mb-4">
            {tree.scientificName}
          </p>
          <p className="text-muted-foreground mb-6 line-clamp-3">
            {tree.description}
          </p>

          {/* Quick Facts */}
          {facts.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-6">
              {facts.slice(0, 3).map((fact, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background rounded-lg text-sm"
                >
                  <span>{fact.icon}</span>
                  <span className="text-muted-foreground">{fact.text}</span>
                </span>
              ))}
            </div>
          )}

          <Link
            href={`/trees/${tree.slug}`}
            className="inline-flex items-center gap-2 text-primary hover:text-primary-light font-semibold transition-colors"
          >
            {locale === "es" ? "Conocer más" : "Learn more"}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
});
