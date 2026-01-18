"use client";

import { memo } from "react";
import { Link } from "@i18n/navigation";
import { allTrees } from "contentlayer/generated";
import { SafeImage } from "@/components/SafeImage";

export const NowBloomingSection = memo(function NowBloomingSection({
  trees,
  locale,
  nowBlooming,
}: {
  trees: typeof allTrees;
  locale: string;
  nowBlooming: string;
}) {
  const currentMonth = new Date().toLocaleString("en-US", { month: "long" });

  // Filter trees that are flowering or fruiting this month
  const floweringNow = trees.filter((tree) =>
    tree.floweringSeason?.includes(currentMonth)
  );
  const fruitingNow = trees.filter((tree) =>
    tree.fruitingSeason?.includes(currentMonth)
  );

  const activeNow = [
    ...floweringNow.map((t) => ({ ...t, activity: "flowering" as const })),
    ...fruitingNow
      .filter((t) => !floweringNow.some((f) => f._id === t._id))
      .map((t) => ({ ...t, activity: "fruiting" as const })),
  ].slice(0, 6); // Reduced from 8 to 6 for faster loading

  if (activeNow.length === 0) return null;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary-dark dark:text-primary-light flex items-center gap-2">
            <span className="text-3xl">🌸</span>
            {nowBlooming}
          </h2>
          <p className="text-muted-foreground mt-1">
            {locale === "es"
              ? `${floweringNow.length} floreciendo, ${fruitingNow.length} fructificando este mes`
              : `${floweringNow.length} flowering, ${fruitingNow.length} fruiting this month`}
          </p>
        </div>
        <Link
          href="/seasonal"
          className="text-primary hover:text-primary-light transition-colors font-medium"
        >
          {locale === "es" ? "Ver calendario" : "View calendar"} →
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
        {activeNow.map((tree) => (
          <Link
            key={tree._id}
            href={`/trees/${tree.slug}`}
            className="flex-none w-48 bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg snap-start"
          >
            <div className="relative h-32 bg-gradient-to-br from-primary/20 to-secondary/20">
              <SafeImage
                src={tree.featuredImage || ""}
                alt={tree.title}
                fill
                sizes="192px"
                quality={40}
                className="object-cover"
                fallback="placeholder"
              />
              <div
                className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                  tree.activity === "flowering"
                    ? "bg-pink-500 text-white"
                    : "bg-orange-500 text-white"
                }`}
              >
                {tree.activity === "flowering"
                  ? locale === "es"
                    ? "🌸 Floreciendo"
                    : "🌸 Flowering"
                  : locale === "es"
                    ? "🍊 Fructificando"
                    : "🍊 Fruiting"}
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-foreground truncate">
                {tree.title}
              </h3>
              <p className="text-xs text-muted-foreground italic truncate">
                {tree.scientificName}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
});
