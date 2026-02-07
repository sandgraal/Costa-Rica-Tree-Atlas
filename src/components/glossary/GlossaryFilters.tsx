"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { GlossaryCategory } from "@/types";

const categories: GlossaryCategory[] = [
  "anatomy",
  "ecology",
  "taxonomy",
  "morphology",
  "reproduction",
  "general",
  "timber",
];

export function GlossaryFilters() {
  const t = useTranslations("glossary");
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "all";

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mb-8 bg-card rounded-xl p-6 border border-border shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search */}
        <div>
          <label
            htmlFor="search"
            className="block text-sm font-medium mb-2 text-foreground"
          >
            {t("searchLabel")}
          </label>
          <input
            type="search"
            id="search"
            name="search"
            value={currentSearch}
            onChange={(e) => {
              handleSearchChange(e.target.value);
            }}
            placeholder={t("searchPlaceholder")}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium mb-2 text-foreground"
          >
            {t("categoryLabel")}
          </label>
          <select
            id="category"
            name="category"
            value={currentCategory}
            onChange={(e) => {
              handleCategoryChange(e.target.value);
            }}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors cursor-pointer"
          >
            <option value="all">{t("categories.all")}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {t(`categories.${cat}`)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
