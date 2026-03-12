import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Locale } from "@i18n/routing";
import { Link } from "@i18n/navigation";
import { CurrentYear } from "./CurrentYear";
import { ROUTES } from "@/lib/nav-config";

interface FooterProps {
  locale: Locale;
}

export async function Footer({ locale }: FooterProps) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const footerGroups = [
    {
      title: t("exploreSection"),
      links: [
        { href: ROUTES.trees, label: t("trees") },
        { href: ROUTES.map, label: t("map") },
        { href: ROUTES.seasonal, label: t("seasonalCalendar") },
        { href: ROUTES.compare, label: t("compare") },
        { href: ROUTES.fieldGuide, label: t("fieldGuide") },
      ],
    },
    {
      title: t("learnSection"),
      links: [
        { href: ROUTES.education, label: tNav("education") },
        { href: ROUTES.glossary, label: t("glossary") },
        { href: ROUTES.safety, label: t("safety") },
        { href: ROUTES.conservation, label: t("conservation") },
      ],
    },
    {
      title: t("communitySection"),
      links: [
        { href: ROUTES.contribute, label: t("contributeData") },
        { href: ROUTES.contributePhoto, label: t("uploadPhotos") },
        { href: ROUTES.apiDocs, label: t("apiDocs") },
      ],
    },
    {
      title: t("legalSection"),
      links: [
        { href: ROUTES.about, label: t("about") },
        { href: ROUTES.license, label: t("license") },
      ],
    },
  ];

  return (
    <footer className="bg-primary/5 border-t border-primary/10 mt-auto">
      <div className="container mx-auto px-4 py-10">
        {/* Footer link groups */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/60 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary/10 pt-6 flex flex-col md:flex-row items-center gap-4">
          {/* Logo and branding */}
          <div className="flex items-center gap-2 md:shrink-0">
            <Image
              src="/images/cr-tree-atlas-logo.png"
              alt="Costa Rica Tree Atlas logo"
              width={48}
              height={48}
              className="h-8 w-8 object-contain shrink-0"
              quality={90}
            />
            <span className="flex flex-col leading-none">
              <span className="text-[0.5rem] uppercase tracking-[0.2em] text-secondary/70">
                {tNav("subtitle")}
              </span>
              <span className="text-base font-semibold text-primary">
                Costa Rica
              </span>
            </span>
          </div>

          {/* Copyright and tagline */}
          <div className="flex-1 text-center text-sm text-foreground/60">
            <p>{t("tagline")}</p>
            <p className="mt-1">
              © <CurrentYear /> {t("copyrightProject")}. {t("copyrightLicense")}{" "}
              {t("madeWith")}
            </p>
          </div>

          {/* Keyboard shortcut hint */}
          <div className="md:shrink-0 text-xs text-foreground/50">
            <kbd className="px-2 py-1 text-xs font-mono bg-foreground/5 rounded border border-foreground/10">
              ?
            </kbd>{" "}
            <span>{t("keyboardShortcuts")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
