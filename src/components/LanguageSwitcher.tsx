"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@i18n/navigation";
import { routing } from "@i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("language");

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const localeLabels: Record<string, string> = {
    en: "EN",
    es: "ES",
  };

  return (
    <div
      className="flex items-center"
      role="group"
      aria-label="Language selector"
    >
      {routing.locales.map((loc, index) => (
        <span key={loc} className="flex items-center">
          {index > 0 && (
            <span className="text-foreground/30 mx-0.5" aria-hidden="true">
              /
            </span>
          )}
          <button
            onClick={() => {
              switchLocale(loc);
            }}
            className={`px-1.5 py-1 text-sm font-medium rounded transition-colors ${
              locale === loc
                ? "text-primary"
                : "text-foreground/60 hover:text-foreground"
            }`}
            aria-label={t("switchTo", { language: t(loc) })}
            aria-current={locale === loc ? "true" : undefined}
          >
            {localeLabels[loc]}
          </button>
        </span>
      ))}
    </div>
  );
}
