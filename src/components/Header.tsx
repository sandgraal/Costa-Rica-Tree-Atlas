import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { MobileNav } from "./MobileNav";
import { FavoritesLink } from "./FavoritesLink";
import Image from "next/image";
import dynamic from "next/dynamic";

// Lazy load QuickSearch — 417-line client component only needed on user interaction
const QuickSearch = dynamic(
  () => import("./QuickSearch").then((m) => ({ default: m.QuickSearch })),
  {
    loading: () => (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/50 text-muted-foreground text-sm">
        <svg
          className="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="hidden sm:inline">Search</span>
      </div>
    ),
  }
);

export async function Header() {
  const t = await getTranslations("nav");
  const locale = await getLocale();

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/10">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/images/cr-tree-atlas-logo.png"
              alt="Costa Rica Tree Atlas logo"
              width={64}
              height={64}
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain shrink-0 transition-transform duration-200 group-hover:scale-105"
              priority
              quality={90}
            />
            <span className="flex flex-col leading-none">
              <span className="text-[0.55rem] sm:text-[0.65rem] uppercase tracking-[0.25em] text-secondary/80">
                {locale === "es" ? "Atlas de Árboles" : "Tree Atlas"}
              </span>
              <span className="text-lg sm:text-xl font-semibold text-primary group-hover:text-primary-dark transition-colors">
                Costa Rica
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              href="/"
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              {t("home")}
            </Link>
            <Link
              href="/trees"
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              {t("trees")}
            </Link>
            <Link
              href="/map"
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              {t("map")}
            </Link>
            <Link
              href="/identify"
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              {t("identify")}
            </Link>
            <Link
              href="/seasonal"
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              {t("seasonal")}
            </Link>
            <Link
              href="/compare"
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              {t("compare")}
            </Link>
            <Link
              href="/education"
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              {t("education")}
            </Link>
            <Link
              href="/glossary"
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              {t("glossary")}
            </Link>
            <Link
              href="/safety"
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              {t("safety")}
            </Link>
            <Link
              href="/about"
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              {t("about")}
            </Link>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="hidden sm:block">
              <QuickSearch />
            </div>
            <FavoritesLink locale={locale} />
            <LanguageSwitcher />
            <ThemeToggle />
            <MobileNav />
          </div>
        </nav>
      </div>
    </header>
  );
}
