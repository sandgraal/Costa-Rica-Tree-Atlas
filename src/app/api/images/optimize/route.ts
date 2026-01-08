import { NextRequest, NextResponse } from "next/server";
import { resolveImagePath } from "@/lib/filesystem/safe-path";
import { validateExtension } from "@/lib/validation/slug";
import fs from "fs/promises";

/**
 * Example API route for serving optimized images
 * This demonstrates proper use of security utilities
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get("slug");
  const variant = searchParams.get("variant") || "optimized";

  if (!slug) {
    return NextResponse.json({ error: "Slug required" }, { status: 400 });
  }

  // 1. Resolve path safely with built-in validation
  const pathResult = resolveImagePath(slug, variant);

  if (!pathResult.success) {
    console.error("Path resolution failed:", pathResult.error);
    return NextResponse.json(
      { error: "Invalid slug or variant" },
      { status: 400 }
    );
  }

  const imagePath = pathResult.path!;

  // 2. Check if file exists
  try {
    const stats = await fs.stat(imagePath);

    if (!stats.isFile()) {
      return NextResponse.json({ error: "Not a file" }, { status: 400 });
    }

    // 3. Validate file extension
    const extValidation = validateExtension(imagePath);
    if (!extValidation.valid) {
      console.error("Invalid file extension:", extValidation.error);
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // 4. Read and return file
    const fileBuffer = await fs.readFile(imagePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": `image/${extValidation.extension?.slice(1)}`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    console.error("Error serving image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
