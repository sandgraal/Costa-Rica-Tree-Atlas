/**
 * Copyright (c) 2024-present Costa Rica Tree Atlas contributors
 * SPDX-License-Identifier: MIT
 *
 * Visible "Cite this page" block for species pages. Renders APA, MLA,
 * and BibTeX strings server-side; copy buttons are client-side.
 *
 * Pairs with src/lib/citation for the formatters, and with the
 * `Dataset` JSON-LD emitted by the species page route.
 */

import { getTranslations } from "next-intl/server";

import {
  DATASET_DOI,
  DATASET_LICENSE_LABEL,
  DATASET_LICENSE_URL,
  DATASET_TITLE,
  formatAPA,
  formatBibTeX,
  formatMLA,
  hasMintedDOI,
} from "@/lib/citation";
import type { Locale } from "@/types/tree";

import { CitationCopyButton } from "./CitationCopyButton";

interface CitePageProps {
  tree: {
    title: string;
    scientificName: string;
    slug: string;
    nameAuthority?: string;
    updatedAt?: string;
    publishedAt?: string;
  };
  locale: Locale;
}

export async function CitePage({ tree, locale }: CitePageProps) {
  const t = await getTranslations("cite");

  const apa = formatAPA(tree, locale);
  const mla = formatMLA(tree, locale);
  const bibtex = formatBibTeX(tree, locale);
  const minted = hasMintedDOI(DATASET_DOI);

  return (
    <aside
      className="cite-block bg-card border border-border rounded-xl p-6 my-12 print:break-inside-avoid"
      aria-labelledby="cite-heading"
    >
      <h2
        id="cite-heading"
        className="text-xl font-semibold mb-2 text-primary-dark dark:text-primary-light"
      >
        {t("heading")}
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        {t("intro", { dataset: DATASET_TITLE[locale] })}
      </p>

      {!minted && (
        <p className="text-xs text-muted-foreground italic mb-4">
          {t("doiPending")}
        </p>
      )}

      <div className="space-y-4">
        <CitationRow label={t("formatAPA")} value={apa} />
        <CitationRow label={t("formatMLA")} value={mla} />
        <CitationRow label={t("formatBibTeX")} value={bibtex} multiline />
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        {t("license")}{" "}
        <a
          href={DATASET_LICENSE_URL}
          rel="license noopener"
          className="underline hover:text-primary"
        >
          {DATASET_LICENSE_LABEL}
        </a>
        .
      </p>
    </aside>
  );
}

function CitationRow({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <CitationCopyButton text={value} label={label} />
      </div>
      {multiline ? (
        <pre className="bg-muted text-foreground text-xs rounded-md p-3 overflow-x-auto whitespace-pre">
          {value}
        </pre>
      ) : (
        <p className="text-sm leading-relaxed bg-muted/50 rounded-md p-3">
          {value}
        </p>
      )}
    </div>
  );
}
