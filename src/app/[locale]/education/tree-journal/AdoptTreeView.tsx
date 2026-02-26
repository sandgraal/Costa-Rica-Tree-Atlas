"use client";

import { Link } from "@i18n/navigation";
import Image from "next/image";
import type { TreeJournalLessonData } from "./tree-journal-data";

interface Tree {
  title: string;
  scientificName: string;
  family: string;
  slug: string;
  featuredImage?: string;
}

interface AdoptTreeViewProps {
  trees: Tree[];
  searchQuery: string;
  selectedTreeSlug: string;
  selectedTree: Tree | undefined;
  nickname: string;
  location: string;
  storageError: string | null;
  labels: TreeJournalLessonData["labels"];
  onSearchChange: (query: string) => void;
  onSelectTree: (slug: string) => void;
  onNicknameChange: (name: string) => void;
  onLocationChange: (location: string) => void;
  onDismissError: () => void;
  onAdopt: () => void;
}

export function AdoptTreeView({
  trees,
  searchQuery,
  selectedTreeSlug,
  selectedTree,
  nickname,
  location,
  storageError,
  labels: t,
  onSearchChange,
  onSelectTree,
  onNicknameChange,
  onLocationChange,
  onDismissError,
  onAdopt,
}: AdoptTreeViewProps) {
  return (
    <div className="py-8 px-4 min-h-screen bg-gradient-to-b from-green-50/50 to-background dark:from-green-950/20">
      {/* Storage Error Alert */}
      {storageError && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-400 px-4 py-3 fixed top-4 left-1/2 transform -translate-x-1/2 z-50 rounded-lg shadow-lg max-w-md">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm">{storageError}</p>
            <button
              onClick={onDismissError}
              className="text-sm underline hover:no-underline"
            >
              {t.dismiss}
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-4xl">
        <Link
          href="/education"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
        >
          {t.backToEducation}
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>

        <div className="bg-card rounded-2xl p-8 border border-border shadow-lg">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="text-2xl">🌱</span> {t.adoptTree}
          </h2>

          {/* Tree Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              {t.chooseTree}
            </label>
            <input
              type="text"
              placeholder={t.searchTrees}
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
              }}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary mb-4"
            />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
              {trees.slice(0, 18).map((tree) => (
                <button
                  key={tree.slug}
                  onClick={() => {
                    onSelectTree(tree.slug);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedTreeSlug === tree.slug
                      ? "border-primary bg-primary/10 ring-2 ring-primary/50"
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
              ))}
            </div>
          </div>

          {/* Nickname */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              {t.nickname}
            </label>
            <input
              type="text"
              placeholder={t.nicknamePlaceholder}
              value={nickname}
              onChange={(e) => {
                onNicknameChange(e.target.value);
              }}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          {/* Location */}
          <div className="mb-8">
            <label className="block text-sm font-medium mb-2">
              {t.location}
            </label>
            <input
              type="text"
              placeholder={t.locationPlaceholder}
              value={location}
              onChange={(e) => {
                onLocationChange(e.target.value);
              }}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          {/* Selected Tree Preview */}
          {selectedTree && (
            <div className="mb-8 p-4 bg-primary/5 rounded-xl border border-primary/20">
              <div className="flex items-center gap-4">
                {selectedTree.featuredImage && (
                  <div className="w-20 h-20 relative rounded-xl overflow-hidden">
                    <Image
                      src={selectedTree.featuredImage}
                      alt={selectedTree.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedTree.title}
                  </h3>
                  <p className="text-sm text-muted-foreground italic">
                    {selectedTree.scientificName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t.family}: {selectedTree.family}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={onAdopt}
            disabled={!selectedTreeSlug || !nickname || !location}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {t.startJournal}
          </button>
        </div>
      </div>
    </div>
  );
}
