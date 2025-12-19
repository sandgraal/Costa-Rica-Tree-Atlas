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

  return (
    <div className="flex items-center gap-1">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={`px-2 py-1 text-sm rounded transition-colors ${
            locale === loc
              ? "bg-primary text-white font-medium"
              : "hover:bg-primary/10"
          }`}
          aria-label={t("switchTo", { language: t(loc) })}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
