"use client";
/* eslint-disable security/detect-object-injection -- form option/prompt access uses bounded indices and server-provided typed arrays. */

import type { TreeJournalLessonData } from "./tree-journal-data";

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

interface JournalEntryFormProps {
  newEntry: Partial<JournalEntry>;
  promptIndex: number;
  labels: TreeJournalLessonData["labels"];
  weatherOptions: TreeJournalLessonData["weatherOptions"];
  leafStatusOptions: TreeJournalLessonData["leafStatusOptions"];
  moodOptions: TreeJournalLessonData["moodOptions"];
  wildlifeOptions: TreeJournalLessonData["wildlifeOptions"];
  prompts: TreeJournalLessonData["prompts"];
  onUpdateEntry: (
    updater: (prev: Partial<JournalEntry>) => Partial<JournalEntry>
  ) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function JournalEntryForm({
  newEntry,
  promptIndex,
  labels: t,
  weatherOptions,
  leafStatusOptions,
  moodOptions,
  wildlifeOptions,
  prompts,
  onUpdateEntry,
  onSave,
  onCancel,
}: JournalEntryFormProps) {
  return (
    <div className="py-8 px-4 min-h-screen bg-gradient-to-b from-green-50/50 to-background dark:from-green-950/20">
      <div className="container mx-auto max-w-2xl">
        <button
          onClick={onCancel}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
        >
          ← {t.cancel}
        </button>

        <h1 className="text-2xl font-bold mb-6">{t.newEntry}</h1>

        {/* Daily Prompt */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
            <span>💡</span> {t.prompt}:
          </p>
          <p className="text-yellow-700 dark:text-yellow-300 mt-1">
            {prompts[promptIndex]}
          </p>
        </div>

        <div className="space-y-6 bg-card rounded-2xl p-6 border border-border">
          {/* Weather */}
          <div>
            <label className="block text-sm font-medium mb-3">
              {t.weather}
            </label>
            <div className="flex flex-wrap gap-2">
              {weatherOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    onUpdateEntry((prev) => ({
                      ...prev,
                      weather: option.value as JournalEntry["weather"],
                    }))
                  }
                  className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                    newEntry.weather === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span>{option.emoji}</span>
                  <span className="text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Leaf Status */}
          <div>
            <label className="block text-sm font-medium mb-3">
              {t.leafStatus}
            </label>
            <div className="flex flex-wrap gap-2">
              {leafStatusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    onUpdateEntry((prev) => ({
                      ...prev,
                      leafStatus: option.value as JournalEntry["leafStatus"],
                    }))
                  }
                  className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                    newEntry.leafStatus === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span>{option.emoji}</span>
                  <span className="text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Flowers & Fruits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-3">
                {t.flowers}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onUpdateEntry((prev) => ({ ...prev, hasFlowers: true }));
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                    newEntry.hasFlowers
                      ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20"
                      : "border-border"
                  }`}
                >
                  🌸 {t.yes}
                </button>
                <button
                  onClick={() => {
                    onUpdateEntry((prev) => ({ ...prev, hasFlowers: false }));
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                    !newEntry.hasFlowers
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  }`}
                >
                  {t.no}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-3">
                {t.fruits}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onUpdateEntry((prev) => ({ ...prev, hasFruits: true }));
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                    newEntry.hasFruits
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-border"
                  }`}
                >
                  🍎 {t.yes}
                </button>
                <button
                  onClick={() => {
                    onUpdateEntry((prev) => ({ ...prev, hasFruits: false }));
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                    !newEntry.hasFruits
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  }`}
                >
                  {t.no}
                </button>
              </div>
            </div>
          </div>

          {/* Wildlife */}
          <div>
            <label className="block text-sm font-medium mb-3">
              {t.wildlife}
            </label>
            <div className="flex flex-wrap gap-2">
              {wildlifeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    const current = newEntry.wildlife || [];
                    const updated = current.includes(option.value)
                      ? current.filter((w) => w !== option.value)
                      : [...current, option.value];
                    onUpdateEntry((prev) => ({ ...prev, wildlife: updated }));
                  }}
                  className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                    newEntry.wildlife?.includes(option.value)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span>{option.emoji}</span>
                  <span className="text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-medium mb-3">{t.mood}</label>
            <div className="flex flex-wrap gap-2">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    onUpdateEntry((prev) => ({
                      ...prev,
                      mood: option.value as JournalEntry["mood"],
                    }))
                  }
                  className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                    newEntry.mood === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-xl">{option.emoji}</span>
                  <span className="text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Measurements */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t.height}
              </label>
              <input
                type="text"
                value={newEntry.height || ""}
                onChange={(e) => {
                  onUpdateEntry((prev) => ({
                    ...prev,
                    height: e.target.value,
                  }));
                }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                placeholder="~"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {t.circumference}
              </label>
              <input
                type="text"
                value={newEntry.circumference || ""}
                onChange={(e) =>
                  onUpdateEntry((prev) => ({
                    ...prev,
                    circumference: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                placeholder="~"
              />
            </div>
          </div>

          {/* Observation */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t.observation}
            </label>
            <textarea
              value={newEntry.observation || ""}
              onChange={(e) =>
                onUpdateEntry((prev) => ({
                  ...prev,
                  observation: e.target.value,
                }))
              }
              rows={5}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background resize-none focus:ring-2 focus:ring-primary/50"
              placeholder={t.observationPlaceholder}
            />
          </div>

          <button
            onClick={onSave}
            disabled={!newEntry.observation}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {t.saveEntry}
          </button>
        </div>
      </div>
    </div>
  );
}
