import { useTranslations, useLocale } from "next-intl";
import { Link } from "@i18n/navigation";
import Image from "next/image";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const locale = useLocale();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary/5 border-t border-primary/10 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
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
            <p className="text-sm text-foreground/60">{t("description")}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t("quickLinks")}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-foreground/60 hover:text-primary transition-colors"
                >
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/trees"
                  className="text-sm text-foreground/60 hover:text-primary transition-colors"
                >
                  {t("allTrees")}
                </Link>
              </li>
              <li>
                <Link
                  href="/education"
                  className="text-sm text-foreground/60 hover:text-primary transition-colors"
                >
                  {t("education")}
                </Link>
              </li>
              <li>
                <Link
                  href="/seasonal"
                  className="text-sm text-foreground/60 hover:text-primary transition-colors"
                >
                  {nav("seasonal")}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-foreground/60 hover:text-primary transition-colors"
                >
                  {t("aboutUs")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t("openSource")}</h3>
            <p className="text-sm text-foreground/60 mb-2">{t("contribute")}</p>
            <a
              href="https://github.com/sandgraal/Costa-Rica-Tree-Atlas"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>

        <div className="border-t border-primary/10 mt-8 pt-8 text-center text-sm text-foreground/60">
          <p>{t("copyright", { year: currentYear })}</p>
          <p className="mt-1">{t("license")}</p>
          <p className="mt-4 text-xs text-foreground/50">
            <kbd className="px-2 py-1 text-xs font-mono bg-foreground/5 rounded border border-foreground/10">
              ?
            </kbd>{" "}
            <span>
              {locale === "es"
                ? "Atajos de teclado"
                : "Keyboard shortcuts"}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
