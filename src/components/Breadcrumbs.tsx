import { Link } from "@i18n/navigation";
import { getTranslations } from "next-intl/server";

interface BreadcrumbsProps {
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

export async function Breadcrumbs({
  pathname,
  customLabels = {},
}: BreadcrumbsProps) {
  const t = await getTranslations("breadcrumbs");

  const breadcrumbs = (() => {
    // Split path into segments (pathname is already without locale prefix)
    const segments = pathname.split("/").filter(Boolean);

    const crumbs: Array<{ label: string; href?: string }> = [
      {
        label: t("home"),
        href: "/",
      },
    ];

    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Use custom label if provided, otherwise use translation, otherwise format segment
      let label = getCustomLabel(customLabels, segment);
      if (!label && t.has(segment as never)) {
        label = t(segment as never);
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
    <nav aria-label={t("ariaLabel")} className="mb-6">
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
