/* eslint-disable security/detect-object-injection -- language grouping map is local and keyed by content-defined language labels. */
import { getTranslations } from "next-intl/server";
import { MobileCollapsibleSection } from "@/components/MobileCollapsibleSection";
import type { IndigenousName } from "@/types/tree";

interface IndigenousNamesProps {
  names?: IndigenousName[] | null;
}

export async function IndigenousNames({ names }: IndigenousNamesProps) {
  const t = await getTranslations("indigenousNames");
  const tocT = await getTranslations("toc");

  if (!names || names.length === 0) return null;

  // Group names by language
  const grouped = names.reduce<Record<string, IndigenousName[]>>(
    (acc, entry) => {
      const lang = entry.language;
      if (!acc[lang]) acc[lang] = [];
      acc[lang].push(entry);
      return acc;
    },
    {}
  );

  return (
    <MobileCollapsibleSection
      id="indigenous-names"
      title={t("heading")}
      tocLevel={3}
      toggleLabels={{
        expand: tocT("showSection"),
        collapse: tocT("hideSection"),
      }}
    >
      <p className="text-sm text-muted-foreground mb-4">{t("description")}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {Object.entries(grouped).map(([language, entries]) => (
          <div
            key={language}
            className="rounded-lg border border-border bg-card p-4"
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              {language}
            </h3>
            <ul className="space-y-1.5">
              {entries.map((entry, idx) => (
                <li key={idx}>
                  <span className="font-semibold text-foreground">
                    {entry.name}
                  </span>
                  {entry.meaning && (
                    <span className="text-sm text-muted-foreground ml-2">
                      — {entry.meaning}
                    </span>
                  )}
                  {entry.source && (
                    <span className="text-xs text-muted-foreground/70 ml-1">
                      ({t("source")}: {entry.source})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </MobileCollapsibleSection>
  );
}
