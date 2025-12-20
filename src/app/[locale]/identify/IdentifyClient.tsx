"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@i18n/navigation";

interface IdentifyClientProps {
  locale: string;
}

interface IdentifyLabel {
  description: string;
  score: number;
}

interface IdentifyMatch {
  title: string;
  scientificName: string;
  slug: string;
  score: number;
  url: string;
}

interface IdentifyResponse {
  labels: IdentifyLabel[];
  matches: IdentifyMatch[];
}

export default function IdentifyClient({ locale }: IdentifyClientProps) {
  const t = useTranslations("identify");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [results, setResults] = useState<IdentifyResponse | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setResults(null);

    const formData = new FormData(event.currentTarget);
    const file = formData.get("image");

    if (!file || !(file instanceof File) || file.size === 0) {
      setErrorMessage(t("errorMissingFile"));
      return;
    }

    formData.set("locale", locale);

    try {
      setIsLoading(true);
      const response = await fetch("/api/identify", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = (await response.json()) as IdentifyResponse;
      setResults(data);
    } catch (error) {
      console.error(error);
      setErrorMessage(t("errorFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          {t("title")}
        </h1>
        <p className="text-lg text-muted-foreground mb-8">{t("subtitle")}</p>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6"
        >
          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-foreground"
              htmlFor="image"
            >
              {t("uploadLabel")}
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
            <p className="text-xs text-muted-foreground">{t("uploadHelp")}</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? t("loading") : t("submit")}
          </button>
        </form>

        <div className="mt-8 space-y-4" aria-live="polite" role="status">
          {errorMessage && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          {results && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  {t("resultsTitle")}
                </h2>
                {results.matches.length > 0 ? (
                  <ul className="space-y-3">
                    {results.matches.map((match) => (
                      <li
                        key={match.slug}
                        className="rounded-xl border border-border bg-card px-4 py-3"
                      >
                        <div className="flex flex-col gap-1">
                          <Link
                            href={`/trees/${match.slug}`}
                            className="text-base font-semibold text-primary hover:text-primary/80"
                          >
                            {match.title}
                          </Link>
                          <span className="text-sm text-muted-foreground">
                            {match.scientificName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {t("matchScore", {
                              score: Math.round(match.score * 100),
                            })}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("noResults")}
                  </p>
                )}
              </div>

              {results.labels.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {t("labelsTitle")}
                  </h3>
                  <ul className="flex flex-wrap gap-2">
                    {results.labels.map((label) => (
                      <li
                        key={label.description}
                        className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                      >
                        {label.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
