"use client";

import { Link } from "@i18n/navigation";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import type { Locale } from "@/types/tree";

interface BreadcrumbsProps {
  locale: Locale;
  customLabels?: Record<string, string>;
}

export function Breadcrumbs({ locale, customLabels = {} }: BreadcrumbsProps) {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // Remove locale prefix and split path
    const pathWithoutLocale = pathname.replace(/^\/(en|es)/, "");
    const segments = pathWithoutLocale.split("/").filter(Boolean);

    // Default labels for common paths
    const defaultLabels: Record<string, { en: string; es: string }> = {
      trees: { en: "Trees", es: "Árboles" },
      glossary: { en: "Glossary", es: "Glosario" },
      education: { en: "Education", es: "Educación" },
      seasonal: { en: "Seasonal", es: "Temporada" },
      safety: { en: "Safety", es: "Seguridad" },
      conservation: { en: "Conservation", es: "Conservación" },
      map: { en: "Map", es: "Mapa" },
      identify: { en: "Identify", es: "Identificar" },
      compare: { en: "Compare", es: "Comparar" },
      favorites: { en: "Favorites", es: "Favoritos" },
      quiz: { en: "Quiz", es: "Cuestionario" },
      diagnose: { en: "Diagnose", es: "Diagnosticar" },
      wizard: { en: "Selection Wizard", es: "Asistente" },
      "use-cases": { en: "Use Cases", es: "Casos de Uso" },
      about: { en: "About", es: "Acerca de" },
      lessons: { en: "Lessons", es: "Lecciones" },
      printables: { en: "Printables", es: "Imprimibles" },
      classroom: { en: "Classroom", es: "Aula" },
      teacher: { en: "Teacher Resources", es: "Recursos para Maestros" },
    };

    const crumbs: Array<{ label: string; href?: string }> = [
      {
        label: locale === "es" ? "Inicio" : "Home",
        href: "/",
      },
    ];

    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Use custom label if provided, otherwise use default, otherwise format segment
      let label = customLabels[segment];
      if (!label && defaultLabels[segment]) {
        label = defaultLabels[segment][locale];
      }
      if (!label) {
        // Format slug: convert dashes to spaces and capitalize
        label = segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }

      // Don't make last segment a link
      crumbs.push({
        label,
        href: index === segments.length - 1 ? undefined : currentPath,
      });
    });

    return crumbs;
  }, [pathname, locale, customLabels]);

  // Don't show breadcrumbs on home page
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav
      aria-label={locale === "es" ? "Navegación" : "Breadcrumb"}
      className="mb-6"
    >
      <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="hover:text-foreground transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
