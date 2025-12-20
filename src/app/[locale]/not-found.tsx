import { Link } from "@i18n/navigation";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-6">
          <span className="text-5xl">🌲</span>
        </div>
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-primary-dark dark:text-primary-light mb-4">
          {t("title")}
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          {t("description")}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {t("goHome")}
          </Link>
          <Link
            href="/trees"
            className="inline-flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground border border-border font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {t("exploreTrees")}
          </Link>
        </div>
      </div>
    </div>
  );
}
