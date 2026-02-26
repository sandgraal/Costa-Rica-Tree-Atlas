import { setRequestLocale } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import type { Metadata } from "next";
import { FavoritesContent } from "./FavoritesContent";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title:
      locale === "es"
        ? "Mis Favoritos - Atlas de Árboles de Costa Rica"
        : "My Favorites - Costa Rica Tree Atlas",
    description:
      locale === "es"
        ? "Tus árboles favoritos guardados del Atlas de Árboles de Costa Rica."
        : "Your saved favorite trees from the Costa Rica Tree Atlas.",
    alternates: {
      languages: {
        en: "/en/favorites",
        es: "/es/favorites",
      },
    },
  };
}

export default async function FavoritesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Strip heavy fields (body, _raw) so we don't ship the full contentlayer
  // bundle (~30 MB) to the client via FavoritesContent.
  const trees = allTrees
    .filter((t) => t.locale === locale)
    .map(({ body: _body, _raw: _r, ...rest }) => rest);

  return <FavoritesContent locale={locale} trees={trees} />;
}
