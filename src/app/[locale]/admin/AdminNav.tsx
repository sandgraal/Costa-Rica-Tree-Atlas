/**
 * Admin Navigation Component
 *
 * Responsive sidebar navigation for the admin area.
 * Collapsed by default on mobile, always visible on desktop.
 */

"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

interface AdminNavProps {
  locale: string;
  userEmail: string;
}

const NAV_ITEMS = [
  { href: "/admin/images", labelKey: "imageReview" as const, icon: "🖼️" },
  {
    href: "/admin/images/proposals",
    labelKey: "imageProposals" as const,
    icon: "📋",
  },
  {
    href: "/admin/contributions",
    labelKey: "contributions" as const,
    icon: "💬",
  },
  {
    href: "/admin/search-analytics",
    labelKey: "searchAnalytics" as const,
    icon: "📊",
  },
  {
    href: "/admin/performance",
    labelKey: "performance" as const,
    icon: "⚡",
  },
  {
    href: "/admin/users",
    labelKey: "accountSettings" as const,
    icon: "👤",
  },
];

export function AdminNav({ locale, userEmail }: AdminNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("admin.nav");

  const isActive = (href: string) => {
    const fullPath = `/${locale}${href}`;
    // Exact match or starts with (for sub-pages like /admin/images/proposals/[id])
    return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
  };

  const navContent = (
    <>
      {/* Logo / Brand */}
      <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700">
        <Link
          href={`/${locale}/admin/images`}
          className="flex items-center gap-2"
        >
          <span className="text-xl">🌳</span>
          <div>
            <div className="font-bold text-sm text-gray-900 dark:text-white">
              {t("brandName")}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {t("panelLabel")}
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
        {/* Back to Site */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <span>←</span>
          <span>{t("backToSite")}</span>
        </Link>

        {/* User info + Sign out */}
        <div className="px-3 py-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {userEmail}
          </p>
          <button
            onClick={() => signOut({ callbackUrl: `/${locale}/admin/login` })}
            className="mt-1 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
          >
            {t("signOut")}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
          aria-label={t("toggleNav")}
        >
          {mobileOpen ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {navContent}
      </aside>
    </>
  );
}
