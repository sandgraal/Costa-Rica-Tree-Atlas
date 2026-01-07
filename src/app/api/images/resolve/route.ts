import { NextRequest, NextResponse } from "next/server";
import { resolveImageSource, generateSrcSet } from "@/lib/image-resolver";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get("slug");
  const type = searchParams.get("type") || "featured";

  if (!slug) {
    return NextResponse.json(
      { error: "Missing slug parameter" },
      { status: 400 }
    );
  }

  try {
    const resolution = resolveImageSource(slug, undefined, type);
    const srcSet = generateSrcSet(slug);

    return NextResponse.json({
      src: resolution.src,
      srcSet,
      type: resolution.type,
      fallback: resolution.fallback,
    });
  } catch (error) {
    console.error("Image resolution error:", error);
    return NextResponse.json(
      { error: "Failed to resolve image" },
      { status: 500 }
    );
  }
}
