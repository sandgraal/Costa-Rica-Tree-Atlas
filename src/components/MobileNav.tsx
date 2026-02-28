"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Link } from "@i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useScrollLock } from "@/hooks/useScrollLock";

interface NavGroup {
  label: string;
  links: { href: string; label: string }[];
}

function MobileNavGroup({
  group,
  locale,
  pathname,
}: {
  group: NavGroup;
  locale: string;
  pathname: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-lg font-medium text-foreground hover:bg-muted transition-colors"
        aria-expanded={expanded}
      >
        {group.label}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {expanded && (
        <ul className="ml-4 space-y-1 mt-1">
          {group.links.map((link) => {
            const isActive =
              pathname === `/${locale}${link.href}` ||
              (link.href !== "/" &&
                pathname.startsWith(`/${locale}${link.href}`));
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground/80 hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("nav");
  const locale = useLocale();

  // Lock scroll when menu is open
  useScrollLock(isOpen);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const topLinks = [
    { href: "/", label: t("home") },
    { href: "/trees", label: t("trees") },
    { href: "/identify", label: t("identify") },
    { href: "/compare", label: t("compare") },
  ];

  const navGroups: NavGroup[] = [
    {
      label: t("explore"),
      links: [
        { href: "/map", label: t("map") },
        { href: "/seasonal", label: t("seasonal") },
        { href: "/conservation", label: t("conservation") },
        { href: "/field-guide", label: t("fieldGuide") },
      ],
    },
    {
      label: t("learn"),
      links: [
        { href: "/education", label: t("education") },
        { href: "/glossary", label: t("glossary") },
        { href: "/safety", label: t("safety") },
        { href: "/quiz", label: t("quiz") },
        { href: "/diagnose", label: t("diagnose") },
      ],
    },
    {
      label: t("community"),
      links: [
        { href: "/contribute", label: t("contribute") },
        { href: "/contribute/photo", label: t("photoUpload") },
        { href: "/about", label: t("about") },
      ],
    },
    {
      label: t("tools"),
      links: [
        { href: "/wizard", label: t("wizard") },
        { href: "/use-cases", label: t("useCases") },
        { href: "/favorites", label: t("favorites") },
        { href: "/api-docs", label: t("apiDocs") },
      ],
    },
  ];

  return (
    <div className="lg:hidden">
      {/* Hamburger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className="p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-x-0 top-0 bottom-0 z-[60] bg-background/95 backdrop-blur-md pt-[5rem]">
          <nav className="flex flex-col h-full px-6 pb-6 overflow-y-auto">
            {/* Top-level Links */}
            <ul className="space-y-1">
              {topLinks.map((link) => {
                const isActive =
                  pathname === `/${locale}${link.href}` ||
                  (link.href !== "/" &&
                    pathname.startsWith(`/${locale}${link.href}`));

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-lg transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Grouped Sections */}
            <ul className="space-y-1 mt-2 border-t border-border pt-2">
              {navGroups.map((group) => (
                <MobileNavGroup
                  key={group.label}
                  group={group}
                  locale={locale}
                  pathname={pathname}
                />
              ))}
            </ul>

            {/* Quick Actions */}
            <div className="mt-auto pb-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3 px-4">
                {t("quickActions")}
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Trigger the global search modal
                    window.dispatchEvent(
                      new KeyboardEvent("keydown", {
                        key: "k",
                        metaKey: true,
                        bubbles: true,
                      })
                    );
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted text-foreground w-full text-left"
                >
                  <span className="text-xl">🔍</span>
                  {t("searchTrees")}
                </button>
                <Link
                  href="/trees"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-white font-medium"
                >
                  <span className="text-xl">🌳</span>
                  {t("exploreTrees")}
                </Link>
                <Link
                  href="/favorites"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted text-foreground"
                >
                  <span className="text-xl">❤️</span>
                  {t("myFavorites")}
                </Link>
                <Link
                  href="/identify"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted text-foreground"
                >
                  <span className="text-xl">📷</span>
                  {t("identifyTree")}
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
