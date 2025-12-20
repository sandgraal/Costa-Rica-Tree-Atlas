"use client";

import { useState } from "react";
import { Link } from "@i18n/navigation";
import Image from "next/image";

interface Tree {
  title: string;
  scientificName: string;
  family: string;
  slug: string;
  description: string;
  conservationStatus?: string;
  maxHeight?: string;
  featuredImage?: string;
}

interface FlashcardsClientProps {
  trees: Tree[];
  locale: string;
}

export default function FlashcardsClient({
  trees,
  locale,
}: FlashcardsClientProps) {
  const [cardsPerPage, setCardsPerPage] = useState(6);

  const t = {
    title: locale === "es" ? "Tarjetas de Estudio" : "Study Flashcards",
    subtitle:
      locale === "es"
        ? "Atlas de Árboles de Costa Rica"
        : "Costa Rica Tree Atlas",
    instructions:
      locale === "es"
        ? "Imprime y recorta las tarjetas para estudiar"
        : "Print and cut out cards for study",
    printButton: locale === "es" ? "🖨️ Imprimir" : "🖨️ Print",
    backLink: locale === "es" ? "← Volver" : "← Back",
    cardsPerPage: locale === "es" ? "Tarjetas por página" : "Cards per page",
    family: locale === "es" ? "Familia" : "Family",
    height: locale === "es" ? "Altura máx." : "Max height",
    status: locale === "es" ? "Estado" : "Status",
  };

  // Split trees into pages based on cardsPerPage
  const pages: Tree[][] = [];
  for (let i = 0; i < trees.length; i += cardsPerPage) {
    pages.push(trees.slice(i, i + cardsPerPage));
  }

  return (
    <>
      {/* Screen header */}
      <div className="print:hidden py-8 px-4 bg-muted">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/education/printables"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
          >
            {t.backLink}
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
              <p className="text-muted-foreground">{t.instructions}</p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{t.cardsPerPage}:</span>
                <select
                  value={cardsPerPage}
                  onChange={(e) => setCardsPerPage(Number(e.target.value))}
                  className="rounded-md border border-border bg-background px-2 py-1"
                >
                  <option value={4}>4</option>
                  <option value={6}>6</option>
                  <option value={9}>9</option>
                </select>
              </label>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {t.printButton}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Printable flashcards */}
      <div className="print-flashcards px-4 py-8 print:p-0">
        <div className="container mx-auto max-w-4xl print:max-w-none">
          {pages.map((pageTreess, pageIndex) => (
            <div
              key={pageIndex}
              className={`flashcard-page grid gap-4 print:gap-0 print:h-[10in] ${
                cardsPerPage === 4
                  ? "grid-cols-2 print:grid-cols-2 print:grid-rows-2"
                  : cardsPerPage === 6
                    ? "grid-cols-2 sm:grid-cols-3 print:grid-cols-3 print:grid-rows-2"
                    : "grid-cols-3 print:grid-cols-3 print:grid-rows-3"
              } ${pageIndex > 0 ? "print:break-before-page mt-8 print:mt-0" : ""}`}
            >
              {pageTreess.map((tree) => (
                <div
                  key={tree.slug}
                  className="flashcard bg-card border-2 border-dashed border-border print:border-gray-400 rounded-xl print:rounded-none p-4 print:p-3 flex flex-col print:border-solid"
                >
                  {/* Image placeholder or actual image */}
                  <div className="aspect-[4/3] bg-muted print:bg-gray-100 rounded-lg print:rounded-none mb-3 print:mb-2 overflow-hidden flex items-center justify-center relative">
                    {tree.featuredImage ? (
                      <Image
                        src={tree.featuredImage}
                        alt={tree.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        unoptimized={tree.featuredImage.startsWith("http")}
                      />
                    ) : (
                      <span className="text-4xl print:text-3xl opacity-50">
                        🌳
                      </span>
                    )}
                  </div>

                  {/* Card content */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-bold text-foreground print:text-black text-lg print:text-base leading-tight">
                      {tree.title}
                    </h3>
                    <p className="text-sm print:text-xs text-muted-foreground print:text-gray-600 italic mb-2">
                      {tree.scientificName}
                    </p>

                    <div className="mt-auto space-y-1 text-xs print:text-[9pt] text-muted-foreground print:text-gray-600">
                      <div>
                        <span className="font-medium">{t.family}:</span>{" "}
                        {tree.family}
                      </div>
                      {tree.maxHeight && (
                        <div>
                          <span className="font-medium">{t.height}:</span>{" "}
                          {tree.maxHeight}
                        </div>
                      )}
                      {tree.conservationStatus && (
                        <div>
                          <span className="font-medium">{t.status}:</span>{" "}
                          {tree.conservationStatus}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: letter;
            margin: 0.25in;
          }
          body {
            font-size: 9pt;
          }
          header,
          footer,
          nav,
          .print\\:hidden {
            display: none !important;
          }
          .flashcard-page {
            page-break-after: always;
            page-break-inside: avoid;
          }
          .flashcard-page:last-child {
            page-break-after: auto;
          }
          .flashcard {
            break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
}
