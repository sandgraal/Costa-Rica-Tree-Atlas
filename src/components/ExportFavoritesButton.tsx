"use client";

import { useFavorites } from "@/components/FavoritesProvider";
import { allTrees } from "contentlayer/generated";

interface ExportFavoritesButtonProps {
  locale: string;
}

export function ExportFavoritesButton({ locale }: ExportFavoritesButtonProps) {
  const { favorites } = useFavorites();

  const t = {
    export: locale === "es" ? "Exportar guía" : "Export field guide",
    title:
      locale === "es"
        ? "Mi Guía de Árboles de Costa Rica"
        : "My Costa Rica Tree Field Guide",
    family: locale === "es" ? "Familia" : "Family",
    height: locale === "es" ? "Altura" : "Height",
    region: locale === "es" ? "Región" : "Region",
    uses: locale === "es" ? "Usos" : "Uses",
    generated: locale === "es" ? "Generado desde" : "Generated from",
    site: "Costa Rica Tree Atlas",
  };

  const handleExport = () => {
    // Get full tree data for favorited slugs
    const favoriteTrees = favorites
      .map((slug) =>
        allTrees.find((tree) => tree.slug === slug && tree.locale === locale)
      )
      .filter((tree): tree is NonNullable<typeof tree> => tree !== undefined);

    if (favoriteTrees.length === 0) return;

    // Generate a printable HTML page
    const printContent = `
      <!DOCTYPE html>
      <html lang="${locale}">
      <head>
        <meta charset="UTF-8">
        <title>${t.title}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Georgia, 'Times New Roman', serif;
            line-height: 1.4;
            color: #1a1a1a;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            padding: 30px 0;
            border-bottom: 3px double #2d5a27;
            margin-bottom: 30px;
          }
          .header h1 {
            font-size: 28px;
            color: #2d5a27;
            margin-bottom: 10px;
          }
          .header p {
            font-size: 12px;
            color: #666;
          }
          .tree-entry {
            page-break-inside: avoid;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #e0e0e0;
          }
          .tree-header {
            display: flex;
            align-items: baseline;
            gap: 10px;
            margin-bottom: 10px;
          }
          .tree-name {
            font-size: 20px;
            font-weight: bold;
            color: #2d5a27;
          }
          .tree-scientific {
            font-size: 16px;
            font-style: italic;
            color: #666;
          }
          .tree-family {
            font-size: 14px;
            color: #888;
            margin-bottom: 8px;
          }
          .tree-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            font-size: 13px;
            margin-top: 10px;
          }
          .detail-item {
            background: #f8f8f8;
            padding: 6px 10px;
            border-radius: 4px;
          }
          .detail-label {
            font-weight: bold;
            color: #2d5a27;
          }
          .tree-uses {
            margin-top: 10px;
            font-size: 13px;
          }
          .tree-uses strong {
            color: #2d5a27;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 3px double #2d5a27;
            text-align: center;
            font-size: 11px;
            color: #888;
          }
          @media print {
            body {
              padding: 0;
            }
            .tree-entry {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌳 ${t.title}</h1>
          <p>${favoriteTrees.length} ${locale === "es" ? "especies" : "species"} • ${t.generated} ${t.site}</p>
        </div>
        ${favoriteTrees
          .map(
            (tree) => `
          <div class="tree-entry">
            <div class="tree-header">
              <span class="tree-name">${tree.title}</span>
              <span class="tree-scientific">${tree.scientificName}</span>
            </div>
            <div class="tree-family">${t.family}: ${tree.family}</div>
            <div class="tree-details">
              ${
                tree.maxHeight
                  ? `<div class="detail-item"><span class="detail-label">${t.height}:</span> ${tree.maxHeight}</div>`
                  : ""
              }
              ${
                tree.nativeRegion
                  ? `<div class="detail-item"><span class="detail-label">${t.region}:</span> ${tree.nativeRegion}</div>`
                  : ""
              }
            </div>
            ${
              tree.uses && tree.uses.length > 0
                ? `<div class="tree-uses"><strong>${t.uses}:</strong> ${tree.uses.join(", ")}</div>`
                : ""
            }
          </div>
        `
          )
          .join("")}
        <div class="footer">
          <p>${t.generated} costaricatreeatlas.com • ${new Date().toLocaleDateString(locale === "es" ? "es-CR" : "en-US")}</p>
        </div>
      </body>
      </html>
    `;

    // Open in new window and print
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      // Wait for content to load then trigger print
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  if (favorites.length === 0) return null;

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 text-sm px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
    >
      <PrintIcon className="w-4 h-4" />
      {t.export}
    </button>
  );
}

function PrintIcon({ className }: { className?: string }) {
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
      aria-hidden="true"
    >
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}
