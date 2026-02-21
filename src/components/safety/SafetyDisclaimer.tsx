import { getTranslations } from "next-intl/server";

export async function SafetyDisclaimer() {
  const t = await getTranslations("safety.disclaimer");

  return (
    <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      <h3 className="font-semibold text-sm mb-2">{t("title")}</h3>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
        {t("content")}
      </p>
      <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
        <p>• {t("supervision")}</p>
        <p>• {t("medical")}</p>
        <p>• {t("emergency")}</p>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 italic">
        {t("sources")}
      </p>
    </div>
  );
}
