import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Locale } from "@i18n/routing";
import { CurrentYear } from "./CurrentYear";

interface FooterProps {
  locale: Locale;
}

export async function Footer({ locale }: FooterProps) {
  const t = await getTranslations({ locale, namespace: "footer" });

  return (
    <footer className="bg-primary/5 border-t border-primary/10 mt-auto">
      <div className="container mx-auto px-4 py-6">
        {/* Stacked on mobile, side-by-side on larger screens */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Logo and branding - on left for desktop */}
          <div className="flex items-center gap-2 md:shrink-0">
            <Image
              src="/images/cr-tree-atlas-logo.png"
              alt="Costa Rica Tree Atlas logo"
              width={48}
              height={48}
              className="h-8 w-8 object-contain shrink-0"
              quality={90}
            />
            <span className="flex flex-col leading-none">
              <span className="text-[0.5rem] uppercase tracking-[0.2em] text-secondary/70">
                {locale === "es" ? "Atlas de Árboles" : "Tree Atlas"}
              </span>
              <span className="text-base font-semibold text-primary">
                Costa Rica
              </span>
            </span>
          </div>

          {/* Copyright and info - centered, takes remaining space */}
          <div className="flex-1 text-center text-sm text-foreground/60">
            <p>
              © <CurrentYear />{" "}
              {locale === "es"
                ? "Atlas de Árboles de Costa Rica. Código: AGPL-3.0 | Contenido: CC BY-NC-SA 4.0"
                : "Costa Rica Tree Atlas. Code: AGPL-3.0 | Content: CC BY-NC-SA 4.0"}
            </p>
            <p className="mt-1 text-xs">{t("madeWith")}</p>
            <p className="mt-2 text-xs text-foreground/50">
              <kbd className="px-2 py-1 text-xs font-mono bg-foreground/5 rounded border border-foreground/10">
                ?
              </kbd>{" "}
              <span>{t("keyboardShortcuts")}</span>
            </p>
          </div>

          {/* Invisible spacer to balance the logo on desktop */}
          <div
            className="hidden md:block w-[120px] shrink-0"
            aria-hidden="true"
          />
        </div>
      </div>
    </footer>
  );
}
