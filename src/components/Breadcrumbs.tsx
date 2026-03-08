import { Link } from "@i18n/navigation";
import type { Locale } from "@/types/tree";

interface BreadcrumbsProps {
  locale: Locale;
  /** The path without locale prefix (e.g., "/trees/ceiba") */
  pathname: string;
  customLabels?: Record<string, string>;
}

function getCustomLabel(
  customLabels: Record<string, string>,
  segment: string
): string | undefined {
  if (Object.hasOwn(customLabels, segment)) {
    // eslint-disable-next-line security/detect-object-injection
    return customLabels[segment];
  }
  return undefined;
}

function getDefaultLabel(segment: string, locale: Locale): string | undefined {
  switch (segment) {
    case "trees":
      return locale === "es" ? "Árboles" : "Trees";
    case "glossary":
      return locale === "es" ? "Glosario" : "Glossary";
    case "education":
      return locale === "es" ? "Educación" : "Education";
    case "seasonal":
      return locale === "es" ? "Temporada" : "Seasonal";
    case "safety":
      return locale === "es" ? "Seguridad" : "Safety";
    case "conservation":
      return locale === "es" ? "Conservación" : "Conservation";
    case "map":
      return locale === "es" ? "Mapa" : "Map";
    case "identify":
      return locale === "es" ? "Identificar" : "Identify";
    case "compare":
      return locale === "es" ? "Comparar" : "Compare";
    case "favorites":
      return locale === "es" ? "Favoritos" : "Favorites";
    case "quiz":
      return locale === "es" ? "Cuestionario" : "Quiz";
    case "diagnose":
      return locale === "es" ? "Diagnosticar" : "Diagnose";
    case "wizard":
      return locale === "es" ? "Asistente" : "Selection Wizard";
    case "use-cases":
      return locale === "es" ? "Casos de Uso" : "Use Cases";
    case "about":
      return locale === "es" ? "Acerca de" : "About";
    case "lessons":
      return locale === "es" ? "Lecciones" : "Lessons";
    case "printables":
      return locale === "es" ? "Imprimibles" : "Printables";
    case "classroom":
      return locale === "es" ? "Aula" : "Classroom";
    case "teacher":
      return locale === "es" ? "Recursos para Maestros" : "Teacher Resources";
    default:
      return undefined;
  }
}

export function Breadcrumbs({
  locale,
  pathname,
  customLabels = {},
}: BreadcrumbsProps) {
  const breadcrumbs = (() => {
    // Split path into segments (pathname is already without locale prefix)
    const segments = pathname.split("/").filter(Boolean);

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
      let label = getCustomLabel(customLabels, segment);
      if (!label) {
        label = getDefaultLabel(segment, locale);
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
  })();

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
