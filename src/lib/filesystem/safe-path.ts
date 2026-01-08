import path from "path";
import { validateSlug } from "@/lib/validation/slug";

/**
 * Safely construct file paths with validation
 * Prevents path traversal and ensures paths stay within intended directory
 */

/**
 * Safely join path components with validation
 *
 * @param baseDir - Base directory (must be absolute path)
 * @param ...segments - Path segments to join (will be validated)
 * @returns Resolved absolute path
 * @throws Error if path escapes base directory
 */
export function safePath(baseDir: string, ...segments: string[]): string {
  // 1. Ensure base directory is absolute
  if (!path.isAbsolute(baseDir)) {
    throw new Error("Base directory must be an absolute path");
  }

  // 2. Resolve base directory to canonical path
  // Ensure it doesn't end with path separator to prevent double separator issues
  let resolvedBase = path.resolve(baseDir);
  if (resolvedBase.endsWith(path.sep) && resolvedBase.length > 1) {
    resolvedBase = resolvedBase.slice(0, -1);
  }

  // 3. Validate each segment
  for (const segment of segments) {
    const validation = validateSlug(segment);
    if (!validation.valid) {
      throw new Error(`Invalid path segment "${segment}": ${validation.error}`);
    }
  }

  // 4. Join paths
  const fullPath = path.join(resolvedBase, ...segments);

  // 5. Resolve to absolute path (resolves .., symlinks, etc.)
  const resolvedPath = path.resolve(fullPath);

  // 6. CRITICAL: Verify resolved path is still within base directory
  if (
    !resolvedPath.startsWith(resolvedBase + path.sep) &&
    resolvedPath !== resolvedBase
  ) {
    throw new Error(
      `Path traversal detected: attempted to access ${resolvedPath} outside ${resolvedBase}`
    );
  }

  return resolvedPath;
}

/**
 * Check if a path is within a base directory
 * Uses real filesystem paths (resolves symlinks)
 */
export function isPathWithinBase(filePath: string, baseDir: string): boolean {
  let resolvedBase = path.resolve(baseDir);
  // Ensure base doesn't end with separator to prevent double separator issues
  if (resolvedBase.endsWith(path.sep) && resolvedBase.length > 1) {
    resolvedBase = resolvedBase.slice(0, -1);
  }

  const resolvedPath = path.resolve(filePath);

  return (
    resolvedPath.startsWith(resolvedBase + path.sep) ||
    resolvedPath === resolvedBase
  );
}

/**
 * Safely resolve image path for optimization
 */
export function resolveImagePath(
  slug: string,
  variant: string = "original"
): {
  success: boolean;
  path?: string;
  error?: string;
} {
  // 1. Validate slug
  const slugValidation = validateSlug(slug);
  if (!slugValidation.valid) {
    return { success: false, error: slugValidation.error };
  }

  // 2. Validate variant (should also be safe)
  const variantValidation = validateSlug(variant);
  if (!variantValidation.valid) {
    return {
      success: false,
      error: `Invalid variant: ${variantValidation.error}`,
    };
  }

  // 3. Construct safe path
  try {
    const baseDir = path.join(process.cwd(), "public", "images", "trees");
    const imagePath = safePath(
      baseDir,
      variantValidation.sanitized!,
      slugValidation.sanitized!
    );

    return { success: true, path: imagePath };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
