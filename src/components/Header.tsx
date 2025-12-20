import { useTranslations } from "next-intl";
import { Link } from "@i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import Image from "next/image";

export function Header() {
  const t = useTranslations("nav");
  const tCompare = useTranslations("comparison");
  const tIdentify = useTranslations("identification");
  const title = t("title");
  const [brandPrefix, ...brandRest] = title.trim().split(/\s+/);
  const brandMain = brandRest.join(" ");

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
              <span className="text-[0.6rem] sm:text-[0.7rem] uppercase tracking-[0.35em] text-secondary/80">
                {brandPrefix}
              </span>
              <span className="text-lg sm:text-xl font-semibold text-primary group-hover:text-primary-dark transition-colors">
                {brandMain || title}
              </span>
            </span>
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
