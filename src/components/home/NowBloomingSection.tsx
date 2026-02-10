import { Link } from "@i18n/navigation";
import { allTrees } from "contentlayer/generated";
import { SafeImage } from "@/components/SafeImage";

interface NowBloomingSectionProps {
  trees: typeof allTrees;
  nowBlooming: string;
  floweringSummary: string;
  fruitingSummary: string;
  viewCalendar: string;
  floweringLabel: string;
  fruitingLabel: string;
}

export function NowBloomingSection({
  trees,
  nowBlooming,
  floweringSummary,
  fruitingSummary,
  viewCalendar,
  floweringLabel,
  fruitingLabel,
}: NowBloomingSectionProps) {
  const currentMonth = new Intl.DateTimeFormat("en-US", {
    month: "long",
    timeZone: "America/Costa_Rica",
  }).format(new Date());

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
  ].slice(0, 6);

  if (activeNow.length === 0) return null;

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-primary-dark dark:text-primary-light">
            <span className="text-3xl">🌸</span>
            {nowBlooming}
          </h2>
          <p className="mt-1 text-muted-foreground">
            {floweringSummary.replace("{count}", String(floweringNow.length))},{" "}
            {fruitingSummary.replace("{count}", String(fruitingNow.length))}
          </p>
        </div>
        <Link
          href="/seasonal"
          className="font-medium text-primary transition-colors hover:text-primary-light"
        >
          {viewCalendar} →
        </Link>
      </div>

      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4">
        {activeNow.map((tree) => (
          <Link
            key={tree._id}
            href={`/trees/${tree.slug}`}
            className="snap-start flex-none overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg w-48"
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
                className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                  tree.activity === "flowering"
                    ? "bg-pink-500 text-white"
                    : "bg-orange-500 text-white"
                }`}
              >
                {tree.activity === "flowering"
                  ? `🌸 ${floweringLabel}`
                  : `🍊 ${fruitingLabel}`}
              </div>
            </div>
            <div className="p-3">
              <h3 className="truncate font-semibold text-foreground">
                {tree.title}
              </h3>
              <p className="truncate text-xs italic text-muted-foreground">
                {tree.scientificName}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
