"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import { validateSlug } from "@/lib/validation";

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();

  const t = {
    title: locale === "es" ? "Atajos de Teclado" : "Keyboard Shortcuts",
    navigation: locale === "es" ? "Navegación" : "Navigation",
    actions: locale === "es" ? "Acciones" : "Actions",
    general: locale === "es" ? "General" : "General",
    close: locale === "es" ? "Cerrar" : "Close",
    pressToShow:
      locale === "es"
        ? 'Presiona "?" para ver atajos'
        : 'Press "?" to show shortcuts',
    shortcuts: {
      search: locale === "es" ? "Abrir búsqueda rápida" : "Open quick search",
      escape: locale === "es" ? "Cerrar modal/búsqueda" : "Close modal/search",
      home: locale === "es" ? "Ir a inicio" : "Go to home",
      trees:
        locale === "es" ? "Ir a directorio de árboles" : "Go to tree directory",
      favorites: locale === "es" ? "Ir a favoritos" : "Go to favorites",
      random: locale === "es" ? "Árbol aleatorio" : "Random tree",
      help: locale === "es" ? "Mostrar/ocultar ayuda" : "Show/hide help",
      theme: locale === "es" ? "Cambiar tema" : "Toggle theme",
    },
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
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div
        className="bg-background rounded-2xl shadow-2xl border border-border p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            id="shortcuts-title"
            className="text-xl font-bold text-foreground flex items-center gap-2"
          >
            <KeyboardIcon className="w-5 h-5 text-primary" />
            {t.title}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label={t.close}
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {t.navigation}
          </h3>
          <div className="space-y-2">
            <ShortcutRow keys={["H"]} description={t.shortcuts.home} />
            <ShortcutRow keys={["T"]} description={t.shortcuts.trees} />
            <ShortcutRow keys={["F"]} description={t.shortcuts.favorites} />
            <ShortcutRow keys={["R"]} description={t.shortcuts.random} />
          </div>
        </div>

        {/* Actions Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {t.actions}
          </h3>
          <div className="space-y-2">
            <ShortcutRow keys={["⌘", "K"]} description={t.shortcuts.search} />
            <ShortcutRow keys={["D"]} description={t.shortcuts.theme} />
          </div>
        </div>

        {/* General Section */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {t.general}
          </h3>
          <div className="space-y-2">
            <ShortcutRow keys={["?"]} description={t.shortcuts.help} />
            <ShortcutRow keys={["Esc"]} description={t.shortcuts.escape} />
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
