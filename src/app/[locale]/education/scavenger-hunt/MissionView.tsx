"use client";

import Image from "next/image";
import type {
  MissionDisplayData,
  ScavengerHuntLessonData,
} from "./scavenger-hunt-data";
import type { ScavengerHuntTree } from "./scavenger-hunt-validators";

interface MissionViewProps {
  mission: MissionDisplayData;
  trees: ScavengerHuntTree[];
  filteredTrees: ScavengerHuntTree[];
  validTrees: ScavengerHuntTree[];
  searchQuery: string;
  missionTimer: number | null;
  showHint: boolean;
  labels: ScavengerHuntLessonData["labels"];
  onSearchChange: (query: string) => void;
  onSubmitAnswer: (treeSlug: string) => void;
  onToggleHint: () => void;
  onSkip: () => void;
  onBack: () => void;
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function MissionView({
  mission,
  filteredTrees,
  validTrees,
  searchQuery,
  missionTimer,
  showHint,
  labels: t,
  onSearchChange,
  onSubmitAnswer,
  onToggleHint,
  onSkip,
  onBack,
}: MissionViewProps) {
  return (
    <div className="py-8 px-4 min-h-screen bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/20">
      <div className="container mx-auto max-w-4xl">
        <button
          onClick={onBack}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
        >
          ← {t.backToMissions}
        </button>

        {/* Mission Header */}
        <div className="bg-card rounded-2xl p-6 mb-6 border border-border">
          <div className="flex items-start gap-4">
            <span className="text-5xl">{mission.icon}</span>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">{mission.title}</h1>
              <p className="text-muted-foreground mb-3">
                {mission.description}
              </p>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                  +{mission.points} {t.points}
                </span>
                {missionTimer !== null && (
                  <span
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      missionTimer < 60 ? "bg-red-100 text-red-700" : "bg-muted"
                    }`}
                  >
                    ⏱️ {t.timeLeft}: {formatTime(missionTimer)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Hint */}
          {!showHint ? (
            <button
              onClick={onToggleHint}
              className="mt-4 text-sm text-muted-foreground hover:text-primary"
            >
              💡 {t.showHint}
            </button>
          ) : (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                💡 {mission.hint}
              </p>
            </div>
          )}
        </div>

        {/* Tree Selection */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="mb-4">
            <input
              type="text"
              placeholder={t.searchTrees}
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
              }}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-sm text-muted-foreground mt-2">
              {validTrees.length} {t.matchingTrees}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {filteredTrees.map((tree) => {
              const isValid = validTrees.some((vt) => vt.slug === tree.slug);
              return (
                <button
                  key={tree.slug}
                  onClick={() => {
                    onSubmitAnswer(tree.slug);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isValid
                      ? "border-green-300 bg-green-50/50 dark:bg-green-900/10 hover:border-green-500"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {tree.featuredImage && (
                      <div className="w-12 h-12 relative rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={tree.featuredImage}
                          alt={tree.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {tree.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate italic">
                        {tree.scientificName}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredTrees.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {t.noResults}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={onSkip}
            className="text-sm text-muted-foreground hover:text-red-500"
          >
            {t.skipMission}
          </button>
        </div>
      </div>
    </div>
  );
}
