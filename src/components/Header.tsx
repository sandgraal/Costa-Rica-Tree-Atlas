import { useTranslations } from "next-intl";
import { Link } from "@i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/10">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-8 h-8 text-primary group-hover:scale-110 transition-transform"
            >
              <path d="M12 2C9.5 2 7 4 7 7c0 1.5.5 2.5 1 3.5-1.5.5-3 1.5-3 4 0 2 1 3.5 2.5 4.5-.5 1-1 2-1 3.5v.5h11v-.5c0-1.5-.5-2.5-1-3.5 1.5-1 2.5-2.5 2.5-4.5 0-2.5-1.5-3.5-3-4C16.5 9.5 17 8.5 17 7c0-3-2.5-5-5-5z" />
            </svg>
            <span className="text-xl font-bold text-primary">{t("title")}</span>
          </Link>

          <div className="flex items-center gap-6">
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
              href="/about"
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              {t("about")}
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
