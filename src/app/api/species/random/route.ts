import { NextRequest, NextResponse } from "next/server";
import { allTrees } from "contentlayer/generated";
import { validateLocale } from "@/lib/validation";
import { rateLimit, getRateLimitIdentifier } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  // Rate limiting
  const identifier = getRateLimitIdentifier(request);
  const { allowed, remaining, resetTime } = rateLimit(identifier, {
    interval: 60000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  });

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((resetTime - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

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

  return NextResponse.json(
    {
      slug: randomTree.slug,
      title: randomTree.title,
      scientificName: randomTree.scientificName,
    },
    {
      headers: {
        "X-RateLimit-Remaining": String(remaining),
      },
    }
  );
}
