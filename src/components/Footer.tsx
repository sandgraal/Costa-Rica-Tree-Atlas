"use client";

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";

export function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary/5 border-t border-primary/10 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          {/* Logo and branding */}
          <div className="flex items-center gap-2">
            <Image
              src="/images/cr-tree-atlas-logo.png"
              alt=""
              width={48}
              height={48}
              className="h-8 w-8 object-contain shrink-0"
              aria-hidden="true"
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

          {/* Copyright and info */}
          <div className="text-center sm:text-right text-sm text-foreground/60">
            <p>{t("copyright", { year: currentYear })}</p>
            <p className="mt-1">{t("license")}</p>
            <p className="mt-2 text-xs text-foreground/50">
              <kbd className="px-2 py-1 text-xs font-mono bg-foreground/5 rounded border border-foreground/10">
                ?
              </kbd>{" "}
              <span>{t("keyboardShortcuts")}</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
