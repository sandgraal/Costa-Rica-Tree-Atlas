import fs from "fs";
import path from "path";

interface ImageMetadata {
  slug: string;
  variants: Record<string, { width: number; height: number; size: number }>;
  generatedAt: string;
}

/**
 * Validate image metadata to prevent circular references and cache poisoning
 */
export function validateImageMetadata(slug: string): boolean {
  const metadataPath = path.join(
    process.cwd(),
    "public",
    "images",
    "trees",
    "optimized",
    slug,
    "metadata.json"
  );

  if (!fs.existsSync(metadataPath)) {
    return false;
  }

  try {
    const content = fs.readFileSync(metadataPath, "utf-8");
    const metadata: ImageMetadata = JSON.parse(content);

    // Validate structure
    if (metadata.slug !== slug) {
      console.error(`Metadata slug mismatch: ${metadata.slug} !== ${slug}`);
      return false;
    }

    // Ensure at least one variant exists
    if (!metadata.variants || Object.keys(metadata.variants).length === 0) {
      console.error(`No variants in metadata for ${slug}`);
      return false;
    }

    // Check for suspicious paths (prevent directory traversal)
    for (const [key, variant] of Object.entries(metadata.variants)) {
      if (key.includes("..") || key.includes("/")) {
        console.error(`Suspicious variant key: ${key}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error(`Failed to parse metadata for ${slug}:`, error);
    return false;
  }
}
