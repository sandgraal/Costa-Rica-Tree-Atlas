import { NextRequest, NextResponse } from "next/server";
import { allTrees } from "contentlayer/generated";
import { validateLocale } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const localeParam = searchParams.get("locale");

  // Validate locale
  const validation = validateLocale(localeParam);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const locale = validation.sanitized!;

  // Filter trees by locale
  const trees = allTrees.filter((tree) => tree.locale === locale);

  if (trees.length === 0) {
    return NextResponse.json({ error: "No trees found" }, { status: 404 });
  }

  // Select a random tree
  const randomIndex = Math.floor(Math.random() * trees.length);
  const randomTree = trees[randomIndex];

  return NextResponse.json({
    slug: randomTree.slug,
    title: randomTree.title,
    scientificName: randomTree.scientificName,
  });
}
