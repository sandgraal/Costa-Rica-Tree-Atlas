"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { validateSlug } from "@/lib/validation";

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations("keyboardShortcuts");

  const shortcuts = {
    search: t("search"),
    escape: t("escape"),
    home: t("home"),
    trees: t("trees"),
    favorites: t("goToFavorites"),
    random: t("random"),
    help: t("help"),
    theme: t("theme"),
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Show/hide help with ?
      if (e.key === "?") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      // Close with Escape
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        return;
      }

      // Navigation shortcuts (only when modal is closed)
      if (!isOpen && !e.metaKey && !e.ctrlKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case "h":
            e.preventDefault();
            window.location.href = `/${locale}`;
            break;
          case "t":
            e.preventDefault();
            window.location.href = `/${locale}/trees`;
            break;
          case "f":
            e.preventDefault();
            window.location.href = `/${locale}/favorites`;
            break;
          case "r":
            e.preventDefault();
            // Navigate to a random tree using API
            fetch(`/api/species/random?locale=${locale}`)
              .then((res) => res.json())
              .then((data) => {
                if (data.slug) {
                  // Validate slug before redirecting
                  const validation = validateSlug(data.slug);
                  if (validation.valid) {
                    window.location.href = `/${locale}/trees/${validation.sanitized}`;
                  } else {
                    // If slug validation fails, log error and fallback to trees page
                    console.warn("Invalid slug from API:", data.slug);
                    window.location.href = `/${locale}/trees`;
                  }
                }
              })
              .catch(() => {
                // Fallback to trees page if API fails
                window.location.href = `/${locale}/trees`;
              });
            break;
          case "d":
            e.preventDefault();
            // Toggle theme
            window.dispatchEvent(new CustomEvent("toggleTheme"));
            break;
        }
      }
    },
    [isOpen, locale]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => {
        setIsOpen(false);
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div
        className="bg-background rounded-2xl shadow-2xl border border-border p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            id="shortcuts-title"
            className="text-xl font-bold text-foreground flex items-center gap-2"
          >
            <KeyboardIcon className="w-5 h-5 text-primary" />
            {t("title")}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label={t("close")}
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {t("navigation")}
          </h3>
          <div className="space-y-2">
            <ShortcutRow keys={["H"]} description={shortcuts.home} />
            <ShortcutRow keys={["T"]} description={shortcuts.trees} />
            <ShortcutRow keys={["F"]} description={shortcuts.favorites} />
            <ShortcutRow keys={["R"]} description={shortcuts.random} />
          </div>
        </div>

        {/* Actions Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {t("actions")}
          </h3>
          <div className="space-y-2">
            <ShortcutRow keys={["⌘", "K"]} description={shortcuts.search} />
            <ShortcutRow keys={["D"]} description={shortcuts.theme} />
          </div>
        </div>

        {/* General Section */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {t("general")}
          </h3>
          <div className="space-y-2">
            <ShortcutRow keys={["?"]} description={shortcuts.help} />
            <ShortcutRow keys={["Esc"]} description={shortcuts.escape} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ShortcutRow({
  keys,
  description,
}: {
  keys: string[];
  description: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <span key={index}>
            <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border border-border shadow-sm">
              {key}
            </kbd>
            {index < keys.length - 1 && (
              <span className="text-muted-foreground mx-0.5">+</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function KeyboardIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M6 8h.01" />
      <path d="M10 8h.01" />
      <path d="M14 8h.01" />
      <path d="M18 8h.01" />
      <path d="M8 12h.01" />
      <path d="M12 12h.01" />
      <path d="M16 12h.01" />
      <path d="M7 16h10" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
