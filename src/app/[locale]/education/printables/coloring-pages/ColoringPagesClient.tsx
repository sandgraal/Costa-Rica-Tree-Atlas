"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface Tree {
  title: string;
  scientificName: string;
  family: string;
  slug: string;
  featuredImage?: string;
}

interface ColoringPagesClientProps {
  trees: Tree[];
  locale: string;
  t: {
    title: string;
    subtitle: string;
    instructions: string;
    printButton: string;
    printAll: string;
    backLink: string;
    colorMe: string;
    family: string;
    selectAll: string;
    deselectAll: string;
    selected: string;
    printSelected: string;
    tip: string;
  };
}

export function ColoringPagesClient({
  trees,
  locale,
  t,
}: ColoringPagesClientProps) {
  const [selectedTrees, setSelectedTrees] = useState<Set<string>>(new Set());
  const printRef = useRef<HTMLDivElement>(null);

  const toggleTree = (slug: string) => {
    setSelectedTrees((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedTrees(new Set(trees.map((t) => t.slug)));
  };

  const deselectAll = () => {
    setSelectedTrees(new Set());
  };

  const handlePrint = () => {
    window.print();
  };

  const treesToPrint =
    selectedTrees.size > 0
      ? trees.filter((tree) => selectedTrees.has(tree.slug))
      : trees;

  return (
    <>
      {/* Selection controls */}
      <div className="print:hidden px-4 py-6">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={selectAll}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  {t.selectAll}
                </button>
                <span className="text-muted-foreground">|</span>
                <button
                  onClick={deselectAll}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  {t.deselectAll}
                </button>
                <span className="text-sm text-muted-foreground">
                  ({selectedTrees.size} {t.selected})
                </span>
              </div>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {t.printButton}{" "}
                {selectedTrees.size > 0 ? `(${selectedTrees.size})` : ""}
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">{t.tip}</p>
          </div>

          {/* Tree selection grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trees.map((tree) => (
              <button
                key={tree.slug}
                onClick={() => toggleTree(tree.slug)}
                className={`relative rounded-xl border-2 p-3 transition-all text-left ${
                  selectedTrees.has(tree.slug)
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {selectedTrees.has(tree.slug) && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm">
                    ✓
                  </div>
                )}
                <div className="aspect-square relative mb-2 rounded-lg overflow-hidden bg-muted">
                  {tree.featuredImage ? (
                    <Image
                      src={tree.featuredImage}
                      alt={tree.title}
                      fill
                      className="object-cover grayscale hover:grayscale-0 transition-all"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      unoptimized={tree.featuredImage.startsWith("http")}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">
                      🌳
                    </div>
                  )}
                </div>
                <div className="text-sm font-medium text-foreground truncate">
                  {tree.title}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Printable content */}
      <div ref={printRef} className="print-coloring hidden print:block">
        {treesToPrint.map((tree, index) => (
          <div
            key={tree.slug}
            className={`coloring-page h-[10in] w-[7.5in] mx-auto p-8 flex flex-col ${
              index > 0 ? "break-before-page" : ""
            }`}
          >
            {/* Page header */}
            <div className="text-center mb-4 pb-4 border-b-2 border-dashed border-gray-300">
              <h1 className="text-3xl font-bold text-gray-800">{tree.title}</h1>
              <p className="text-lg italic text-gray-600">
                {tree.scientificName}
              </p>
              <p className="text-sm text-gray-500">
                {t.family}: {tree.family}
              </p>
            </div>

            {/* Image area with outline effect */}
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-square border-4 border-dashed border-gray-300 rounded-2xl p-4 bg-white">
                {tree.featuredImage ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={tree.featuredImage}
                      alt={tree.title}
                      fill
                      className="object-contain"
                      style={{
                        filter:
                          "grayscale(100%) contrast(150%) brightness(120%)",
                      }}
                      sizes="400px"
                      unoptimized={tree.featuredImage.startsWith("http")}
                    />
                    {/* Overlay for coloring effect */}
                    <div className="absolute inset-0 bg-white/30 mix-blend-soft-light" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-9xl opacity-20">🌳</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer with fun fact space */}
            <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-300">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">{t.subtitle}</div>
                <div className="text-2xl">{t.colorMe}</div>
              </div>
              <div className="mt-2 border border-gray-300 rounded-lg p-3 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">
                  {locale === "es"
                    ? "Escribe algo sobre este árbol:"
                    : "Write something about this tree:"}
                </p>
                <div className="h-12 border-b border-dotted border-gray-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: letter portrait;
            margin: 0.5in;
          }

          body {
            font-size: 12pt;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          header,
          footer,
          nav,
          .print\\:hidden {
            display: none !important;
          }

          .print-coloring {
            display: block !important;
          }

          .coloring-page {
            page-break-after: always;
            page-break-inside: avoid;
          }

          .coloring-page:last-child {
            page-break-after: auto;
          }

          /* Make images print in grayscale for coloring */
          .coloring-page img {
            filter: grayscale(100%) contrast(150%) brightness(120%) !important;
          }
        }

        @media screen {
          .print-coloring {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
