import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { MobileNav } from "./MobileNav";
import { FavoritesLink } from "./FavoritesLink";
import { NavDropdown } from "./NavDropdown";
import Image from "next/image";
import dynamic from "next/dynamic";
import { TOP_NAV_ITEMS, NAV_GROUP_ITEMS } from "@/lib/nav-config";

// Lazy load QuickSearch — 417-line client component deferred from the initial bundle but rendered in the header
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
              loading="eager"
              quality={90}
            />
            <span className="flex flex-col leading-none">
              <span className="text-[0.55rem] sm:text-[0.65rem] uppercase tracking-[0.25em] text-secondary/80">
                {t("subtitle")}
              </span>
              <span className="text-lg sm:text-xl font-semibold text-primary group-hover:text-primary-dark transition-colors">
                Costa Rica
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-5">
            {TOP_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-foreground/80 hover:text-primary transition-colors"
              >
                {t(item.tKey)}
              </Link>
            ))}
            {NAV_GROUP_ITEMS.map((group) => (
              <NavDropdown
                key={group.tKey}
                label={t(group.tKey)}
                locale={locale}
                items={group.links.map((link) => ({
                  href: link.href,
                  label: t(link.tKey),
                }))}
              />
            ))}
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
