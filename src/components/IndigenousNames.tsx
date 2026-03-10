import { getTranslations } from "next-intl/server";
import type { IndigenousName } from "@/types/tree";

interface IndigenousNamesProps {
  names?: IndigenousName[] | null;
}

export async function IndigenousNames({ names }: IndigenousNamesProps) {
  const t = await getTranslations("indigenousNames");

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
    <section className="mb-12" aria-labelledby="indigenous-names-heading">
      <h2
        id="indigenous-names-heading"
        className="text-xl font-semibold mb-4 text-primary-dark dark:text-primary-light flex items-center gap-2"
      >
        <span aria-hidden="true">🌿</span>
        {t("heading")}
      </h2>
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
    </section>
  );
}
