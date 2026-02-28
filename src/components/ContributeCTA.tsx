import { getTranslations } from "next-intl/server";
import { Link } from "@i18n/navigation";
import type { Locale } from "@/types/tree";

interface ContributeCTAProps {
  locale: Locale;
  treeSlug: string;
}

export async function ContributeCTA({ locale, treeSlug }: ContributeCTAProps) {
  const t = await getTranslations({ locale, namespace: "contributeCta" });

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 mt-8">
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {t("title")}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">{t("description")}</p>
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/contribute?tree=${treeSlug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          <span aria-hidden="true">📝</span>
          {t("suggestCorrection")}
        </Link>
        <Link
          href={`/contribute/photo?tree=${treeSlug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          <span aria-hidden="true">📷</span>
          {t("uploadPhoto")}
        </Link>
        <Link
          href={`/contribute?type=LOCAL_KNOWLEDGE&tree=${treeSlug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          <span aria-hidden="true">🧠</span>
          {t("shareKnowledge")}
        </Link>
      </div>
    </div>
  );
}
