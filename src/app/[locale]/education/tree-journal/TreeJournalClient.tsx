"use client";
/* eslint-disable security/detect-object-injection -- journal state and option lookups use controlled ids/values and typed lesson data. */

import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "@i18n/navigation";
import Image from "next/image";
import { triggerConfetti, injectEducationStyles } from "@/lib/education";
import { createStorage, adoptedTreeSchema } from "@/lib/storage";
import { useDebounce } from "@/hooks/useDebounce";
import type { TreeJournalLessonData } from "./tree-journal-data";
import { AdoptTreeView } from "./AdoptTreeView";
import { JournalEntryForm } from "./JournalEntryForm";

interface Tree {
  title: string;
  scientificName: string;
  family: string;
  slug: string;
  featuredImage?: string;
  floweringSeason?: string[];
  fruitingSeason?: string[];
  maxHeight?: string;
}

interface JournalEntry {
  id: string;
  date: string;
  weather: "sunny" | "cloudy" | "rainy" | "stormy" | "foggy";
  temperature?: string;
  observation: string;
  leafStatus: "green" | "yellowing" | "bare" | "budding" | "full";
  hasFlowers: boolean;
  hasFruits: boolean;
  wildlife: string[];
  photo?: string;
  height?: string;
  circumference?: string;
  mood: "excited" | "curious" | "peaceful" | "amazed" | "thoughtful";
}

interface AdoptedTree {
  slug: string;
  nickname: string;
  adoptedDate: string;
  location: string;
  entries: JournalEntry[];
  badges: string[];
  totalObservations: number;
}

interface TreeJournalClientProps {
  trees: Tree[];
  locale: string;
  lessonData: TreeJournalLessonData;
}

const JOURNAL_STORAGE_KEY = "costa-rica-tree-atlas-tree-journal";

export default function TreeJournalClient({
  trees,
  locale,
  lessonData,
}: TreeJournalClientProps) {
  const {
    labels: t,
    weatherOptions,
    leafStatusOptions,
    moodOptions,
    wildlifeOptions,
    badges,
    prompts,
  } = lessonData;
  const [adoptedTree, setAdoptedTree] = useState<AdoptedTree | null>(null);
  const [view, setView] = useState<
    "adopt" | "journal" | "timeline" | "badges" | "entry"
  >("adopt");
  const [selectedTreeSlug, setSelectedTreeSlug] = useState<string>("");
  const [nickname, setNickname] = useState("");
  const [location, setLocation] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newEntry, setNewEntry] = useState<Partial<JournalEntry>>({
    weather: "sunny",
    leafStatus: "green",
    hasFlowers: false,
    hasFruits: false,
    wildlife: [],
    mood: "curious",
  });
  const [newBadge, setNewBadge] = useState<string | null>(null);
  const [promptIndex, setPromptIndex] = useState(0);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Create storage instance with error handling
  const journalStorage = useMemo(
    () =>
      createStorage({
        key: JOURNAL_STORAGE_KEY,
        schema: adoptedTreeSchema,
        onError: (_error) => {
          setStorageError(t.corruptedDataCleared);
        },
      }),
    [t.corruptedDataCleared]
  );

  // Load saved data
  useEffect(() => {
    injectEducationStyles();
    if (typeof window === "undefined") return;

    const data = journalStorage.get();
    if (data) {
      setAdoptedTree(data);
      setView("journal");
    }

    // Rotate prompt daily
    const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    setPromptIndex(day % prompts.length);
  }, [journalStorage, prompts.length]);

  // Save data
  useEffect(() => {
    if (adoptedTree) {
      journalStorage.set(adoptedTree);
    }
  }, [adoptedTree, journalStorage]);

  const selectedTree = trees.find((t) => t.slug === selectedTreeSlug);
  const adoptedTreeData = trees.find((t) => t.slug === adoptedTree?.slug);

  // Filter trees using debounced search
  const filteredTrees = trees.filter(
    (tree) =>
      tree.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      tree.scientificName.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const checkBadges = useCallback((tree: AdoptedTree): string[] => {
    const newBadges: string[] = [];
    const entries = tree.entries;

    // First entry badge
    if (entries.length >= 1 && !tree.badges.includes("first-entry")) {
      newBadges.push("first-entry");
    }

    // Week streak (7+ entries)
    if (entries.length >= 7 && !tree.badges.includes("week-streak")) {
      newBadges.push("week-streak");
    }

    // Botanist (10+ entries)
    if (entries.length >= 10 && !tree.badges.includes("botanist")) {
      newBadges.push("botanist");
    }

    // Nature master (25+ entries)
    if (entries.length >= 25 && !tree.badges.includes("nature-master")) {
      newBadges.push("nature-master");
    }

    // Wildlife spotter (5+ different wildlife observations)
    const allWildlife = new Set(entries.flatMap((e) => e.wildlife));
    if (allWildlife.size >= 5 && !tree.badges.includes("wildlife-spotter")) {
      newBadges.push("wildlife-spotter");
    }

    // Flower finder
    if (
      entries.some((e) => e.hasFlowers) &&
      !tree.badges.includes("flower-finder")
    ) {
      newBadges.push("flower-finder");
    }

    // Fruit tracker
    if (
      entries.some((e) => e.hasFruits) &&
      !tree.badges.includes("fruit-tracker")
    ) {
      newBadges.push("fruit-tracker");
    }

    // All weather (5 different weather conditions)
    const allWeather = new Set(entries.map((e) => e.weather));
    if (allWeather.size >= 5 && !tree.badges.includes("all-weather")) {
      newBadges.push("all-weather");
    }

    return newBadges;
  }, []);

  const handleAdopt = () => {
    if (!selectedTreeSlug || !nickname || !location) return;

    const newTree: AdoptedTree = {
      slug: selectedTreeSlug,
      nickname,
      adoptedDate: new Date().toISOString(),
      location,
      entries: [],
      badges: [],
      totalObservations: 0,
    };

    setAdoptedTree(newTree);
    setView("journal");
  };

  const handleSaveEntry = () => {
    if (!adoptedTree || !newEntry.observation) return;

    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      weather: newEntry.weather as JournalEntry["weather"],
      temperature: newEntry.temperature,
      observation: newEntry.observation,
      leafStatus: newEntry.leafStatus as JournalEntry["leafStatus"],
      hasFlowers: newEntry.hasFlowers || false,
      hasFruits: newEntry.hasFruits || false,
      wildlife: newEntry.wildlife || [],
      mood: newEntry.mood as JournalEntry["mood"],
      height: newEntry.height,
      circumference: newEntry.circumference,
    };

    const updatedTree = {
      ...adoptedTree,
      entries: [entry, ...adoptedTree.entries],
      totalObservations: adoptedTree.totalObservations + 1,
    };

    // Check for new badges
    const earnedBadges = checkBadges(updatedTree);
    if (earnedBadges.length > 0) {
      updatedTree.badges = [...updatedTree.badges, ...earnedBadges];
      setNewBadge(earnedBadges[0]);
      triggerConfetti();
    }

    setAdoptedTree(updatedTree);
    setNewEntry({
      weather: "sunny",
      leafStatus: "green",
      hasFlowers: false,
      hasFruits: false,
      wildlife: [],
      mood: "curious",
    });
    setView("journal");
  };

  const handleReset = () => {
    if (window.confirm(t.confirmReset)) {
      journalStorage.clear();
      setAdoptedTree(null);
      setView("adopt");
      setSelectedTreeSlug("");
      setNickname("");
      setLocation("");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Render adopt view
  if (view === "adopt" && !adoptedTree) {
    return (
      <AdoptTreeView
        trees={filteredTrees}
        searchQuery={searchQuery}
        selectedTreeSlug={selectedTreeSlug}
        selectedTree={selectedTree}
        nickname={nickname}
        location={location}
        storageError={storageError}
        labels={t}
        onSearchChange={setSearchQuery}
        onSelectTree={setSelectedTreeSlug}
        onNicknameChange={setNickname}
        onLocationChange={setLocation}
        onDismissError={() => setStorageError(null)}
        onAdopt={handleAdopt}
      />
    );
  }

  // Render new entry form
  if (view === "entry" && adoptedTree) {
    return (
      <JournalEntryForm
        newEntry={newEntry}
        promptIndex={promptIndex}
        labels={t}
        weatherOptions={weatherOptions}
        leafStatusOptions={leafStatusOptions}
        moodOptions={moodOptions}
        wildlifeOptions={wildlifeOptions}
        prompts={prompts}
        onUpdateEntry={setNewEntry}
        onSave={handleSaveEntry}
        onCancel={() => setView("journal")}
      />
    );
  }

  // Main journal view
  if (adoptedTree && adoptedTreeData) {
    return (
      <div className="py-8 px-4 min-h-screen bg-gradient-to-b from-green-50/50 to-background dark:from-green-950/20">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/education"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
          >
            {t.backToEducation}
          </Link>

          {/* New Badge Modal */}
          {newBadge && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-card rounded-2xl p-8 max-w-sm text-center animate-bounce-in">
                <div className="text-6xl mb-4">
                  {badges.find((b) => b.id === newBadge)?.emoji}
                </div>
                <h3 className="text-xl font-bold mb-2">{t.congratsNewBadge}</h3>
                <p className="text-lg font-medium text-primary">
                  {badges.find((b) => b.id === newBadge)?.name}
                </p>
                <button
                  onClick={() => {
                    setNewBadge(null);
                  }}
                  className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                  {t.awesome}
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="bg-card rounded-2xl p-6 border border-border mb-6">
            <div className="flex items-start gap-4">
              {adoptedTreeData.featuredImage && (
                <div className="w-24 h-24 relative rounded-xl overflow-hidden shrink-0">
                  <Image
                    src={adoptedTreeData.featuredImage}
                    alt={adoptedTreeData.title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{adoptedTree.nickname}</h1>
                <p className="text-muted-foreground">{adoptedTreeData.title}</p>
                <p className="text-sm text-muted-foreground italic">
                  {adoptedTreeData.scientificName}
                </p>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                  <span>📍 {adoptedTree.location}</span>
                  <span>
                    📅 {t.adoptedOn}: {formatDate(adoptedTree.adoptedDate)}
                  </span>
                  <span>
                    📝 {adoptedTree.entries.length} {t.totalEntries}
                  </span>
                </div>
              </div>
              <Link
                href={`/trees/${adoptedTree.slug}`}
                className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm hover:bg-primary/20"
              >
                {t.viewDetails}
              </Link>
            </div>

            {/* Badges Preview */}
            {adoptedTree.badges.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  {adoptedTree.badges.slice(0, 5).map((badgeId) => {
                    const badge = badges.find((b) => b.id === badgeId);
                    return badge ? (
                      <span
                        key={badgeId}
                        className="text-2xl"
                        title={badge.name}
                      >
                        {badge.emoji}
                      </span>
                    ) : null;
                  })}
                  {adoptedTree.badges.length > 5 && (
                    <span className="text-sm text-muted-foreground">
                      +{adoptedTree.badges.length - 5}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setView("journal")}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                view === "journal"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border"
              }`}
            >
              📖 {t.myJournal}
            </button>
            <button
              onClick={() => {
                setView("timeline");
              }}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                view === "timeline"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border"
              }`}
            >
              📊 {t.timeline}
            </button>
            <button
              onClick={() => {
                setView("badges");
              }}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                view === "badges"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border"
              }`}
            >
              🏅 {t.badges}
            </button>
            <button
              onClick={() => {
                setView("entry");
              }}
              className="px-4 py-2 rounded-lg font-medium whitespace-nowrap bg-green-600 text-white hover:bg-green-700"
            >
              {t.newEntry}
            </button>
          </div>

          {/* Journal Entries */}
          {view === "journal" && (
            <div className="space-y-4">
              {/* Daily Prompt */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                  <span>💡</span> {t.prompt}:
                </p>
                <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                  {prompts[promptIndex]}
                </p>
              </div>

              {adoptedTree.entries.length === 0 ? (
                <div className="bg-card rounded-xl p-12 border border-border text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-muted-foreground">{t.noEntries}</p>
                  <button
                    onClick={() => setView("entry")}
                    className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg"
                  >
                    {t.newEntry}
                  </button>
                </div>
              ) : (
                adoptedTree.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-card rounded-xl p-6 border border-border"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-medium">{formatDate(entry.date)}</p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span>
                            {
                              weatherOptions.find(
                                (w) => w.value === entry.weather
                              )?.emoji
                            }
                          </span>
                          <span>
                            {
                              leafStatusOptions.find(
                                (l) => l.value === entry.leafStatus
                              )?.emoji
                            }
                          </span>
                          {entry.hasFlowers && <span>🌸</span>}
                          {entry.hasFruits && <span>🍎</span>}
                        </div>
                      </div>
                      <span className="text-2xl">
                        {moodOptions.find((m) => m.value === entry.mood)?.emoji}
                      </span>
                    </div>

                    <p className="text-foreground whitespace-pre-wrap">
                      {entry.observation}
                    </p>

                    {entry.wildlife.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {entry.wildlife.map((w) => (
                          <span
                            key={w}
                            className="px-2 py-1 bg-primary/10 rounded text-sm"
                          >
                            {
                              wildlifeOptions.find((opt) => opt.value === w)
                                ?.emoji
                            }{" "}
                            {
                              wildlifeOptions.find((opt) => opt.value === w)
                                ?.label
                            }
                          </span>
                        ))}
                      </div>
                    )}

                    {(entry.height || entry.circumference) && (
                      <div className="mt-3 text-sm text-muted-foreground">
                        {entry.height && <span>📏 {entry.height}m</span>}
                        {entry.height && entry.circumference && (
                          <span> • </span>
                        )}
                        {entry.circumference && (
                          <span>⭕ {entry.circumference}cm</span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Timeline View */}
          {view === "timeline" && (
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-xl font-semibold mb-6">{t.timeline}</h2>

              {adoptedTree.entries.length < 2 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t.timelineMinEntries}</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-6">
                    {adoptedTree.entries.map((entry, index) => (
                      <div key={entry.id} className="relative pl-14">
                        <div className="absolute left-4 w-5 h-5 rounded-full bg-primary border-4 border-background" />
                        <div className="text-sm text-muted-foreground mb-1">
                          {formatDate(entry.date)}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xl">
                            {
                              weatherOptions.find(
                                (w) => w.value === entry.weather
                              )?.emoji
                            }
                          </span>
                          <span className="text-xl">
                            {
                              leafStatusOptions.find(
                                (l) => l.value === entry.leafStatus
                              )?.emoji
                            }
                          </span>
                          {entry.hasFlowers && (
                            <span className="text-xl">🌸</span>
                          )}
                          {entry.hasFruits && (
                            <span className="text-xl">🍎</span>
                          )}
                          {entry.wildlife.map((w) => (
                            <span key={w} className="text-xl">
                              {
                                wildlifeOptions.find((opt) => opt.value === w)
                                  ?.emoji
                              }
                            </span>
                          ))}
                        </div>
                        {index === 0 && adoptedTree.entries.length > 1 && (
                          <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                            {t.mostRecent}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Badges View */}
          {view === "badges" && (
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-xl font-semibold mb-6">{t.badges}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map((badge) => {
                  const unlocked = adoptedTree.badges.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        unlocked
                          ? "border-primary bg-primary/5"
                          : "border-border bg-muted/50 opacity-60"
                      }`}
                    >
                      <div
                        className={`text-4xl mb-2 ${unlocked ? "" : "grayscale"}`}
                      >
                        {badge.emoji}
                      </div>
                      <p className="font-medium text-sm">{badge.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {unlocked
                          ? t.unlocked
                          : `${t.progress}: ${adoptedTree.entries.length}/${badge.requirement}`}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <button
                  onClick={handleReset}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  {t.resetJournal}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
