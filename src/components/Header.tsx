import { useTranslations, useLocale } from "next-intl";
import { Link } from "@i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { QuickSearch } from "./QuickSearch";
import { MobileNav } from "./MobileNav";
import { FavoritesLink } from "./FavoritesLink";
import Image from "next/image";

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/10">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/images/cr-tree-atlas-logo.png"
              alt=""
              width={64}
              height={64}
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain shrink-0 transition-transform duration-200 group-hover:scale-105"
              priority
              aria-hidden="true"
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
          <div className="hidden md:flex items-center gap-6">
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
              {locale === "es" ? "Comparar" : "Compare"}
            </Link>
            <Link
              href="/about"
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              {t("about")}
            </Link>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2 md:gap-4">
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
