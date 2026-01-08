import { describe, it, expect } from "vitest";
import { validateSlug, validateExtension } from "@/lib/validation/slug";
import {
  safePath,
  isPathWithinBase,
  resolveImagePath,
} from "@/lib/filesystem/safe-path";
import path from "path";

describe("Path Traversal Prevention", () => {
  const baseDir = "/var/www/app/public/images";

  describe("validateSlug", () => {
    it("should reject parent directory references", () => {
      const result = validateSlug("../../../etc/passwd");
      expect(result.valid).toBe(false);
      // The validation catches this as path separators, which is correct
      expect(result.error).toBeDefined();
    });

    it("should reject URL-encoded path traversal", () => {
      const result = validateSlug("..%2F..%2F..%2Fetc%2Fpasswd");
      expect(result.valid).toBe(false);
      // The validation catches ".." which is correct
      expect(result.error).toBeDefined();
    });

    it("should reject null byte injection", () => {
      const result = validateSlug("image\x00.jpg");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Null bytes");
    });

    it("should reject path separators - forward slash", () => {
      const result = validateSlug("test/../../etc");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Path separators");
    });

    it("should reject path separators - backslash", () => {
      const result = validateSlug("test\\..\\..\\etc");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Path separators");
    });

    it("should reject hidden files starting with dot", () => {
      expect(validateSlug(".htaccess").valid).toBe(false);
      expect(validateSlug(".env").valid).toBe(false);
    });

    it("should reject files ending with dot", () => {
      expect(validateSlug("test.").valid).toBe(false);
    });

    it("should reject multiple consecutive dots", () => {
      expect(validateSlug("test...file").valid).toBe(false);
    });

    it("should reject double underscores", () => {
      expect(validateSlug("test__file").valid).toBe(false);
    });

    it("should reject control characters", () => {
      const result = validateSlug("test\x01file");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Control characters");
    });

    it("should reject empty strings", () => {
      const result = validateSlug("");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("non-empty string");
    });

    it("should reject very long slugs", () => {
      const longSlug = "a".repeat(101);
      const result = validateSlug(longSlug);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("length");
    });

    it("should accept valid slugs with hyphens", () => {
      const result = validateSlug("quercus-robur");
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe("quercus-robur");
    });

    it("should accept valid slugs with numbers", () => {
      const result = validateSlug("tree-123");
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe("tree-123");
    });

    it("should accept valid slugs with underscores", () => {
      const result = validateSlug("scientific_name_2024");
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe("scientific_name_2024");
    });

    it("should accept valid slugs with single dots in middle", () => {
      const result = validateSlug("test.file");
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe("test.file");
    });

    it("should normalize to lowercase", () => {
      const result = validateSlug("TestFile");
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe("testfile");
    });
  });

  describe("validateExtension", () => {
    it("should accept valid image extensions", () => {
      expect(validateExtension("image.jpg").valid).toBe(true);
      expect(validateExtension("image.jpeg").valid).toBe(true);
      expect(validateExtension("image.png").valid).toBe(true);
      expect(validateExtension("image.webp").valid).toBe(true);
      expect(validateExtension("image.avif").valid).toBe(true);
    });

    it("should reject invalid extensions", () => {
      expect(validateExtension("image.exe").valid).toBe(false);
      expect(validateExtension("image.php").valid).toBe(false);
      expect(validateExtension("image.sh").valid).toBe(false);
    });

    it("should handle uppercase extensions", () => {
      const result = validateExtension("image.JPG");
      expect(result.valid).toBe(true);
      expect(result.extension).toBe(".jpg");
    });

    it("should reject files without extensions", () => {
      expect(validateExtension("image").valid).toBe(false);
    });

    it("should reject files with trailing dot", () => {
      expect(validateExtension("image.").valid).toBe(false);
    });
  });

  describe("safePath", () => {
    it("should prevent path escape with parent directory references", () => {
      expect(() => {
        safePath(baseDir, "../../../etc/passwd");
      }).toThrow("Invalid path segment");
    });

    it("should prevent path escape with multiple segments", () => {
      expect(() => {
        safePath(baseDir, "trees", "..", "..", "etc", "passwd");
      }).toThrow("Invalid path segment");
    });

    it("should reject non-absolute base directory", () => {
      expect(() => {
        safePath("relative/path", "test");
      }).toThrow("Base directory must be an absolute path");
    });

    it("should allow valid nested paths", () => {
      const result = safePath(baseDir, "trees", "quercus-robur.jpg");
      expect(result).toContain("public/images/trees/quercus-robur.jpg");
      expect(result.startsWith(baseDir)).toBe(true);
    });

    it("should allow single valid segment", () => {
      const result = safePath(baseDir, "optimized");
      expect(result).toContain("public/images/optimized");
      expect(result.startsWith(baseDir)).toBe(true);
    });

    it("should reject path with null bytes", () => {
      expect(() => {
        safePath(baseDir, "test\x00file");
      }).toThrow("Invalid path segment");
    });

    it("should reject path with forward slashes in segment", () => {
      expect(() => {
        safePath(baseDir, "test/file");
      }).toThrow("Invalid path segment");
    });

    it("should reject path with backslashes in segment", () => {
      expect(() => {
        safePath(baseDir, "test\\file");
      }).toThrow("Invalid path segment");
    });
  });

  describe("isPathWithinBase", () => {
    it("should detect paths outside base directory", () => {
      const maliciousPath = "/etc/passwd";
      expect(isPathWithinBase(maliciousPath, baseDir)).toBe(false);
    });

    it("should allow paths within base directory", () => {
      const validPath = path.join(baseDir, "trees", "image.jpg");
      expect(isPathWithinBase(validPath, baseDir)).toBe(true);
    });

    it("should allow base directory itself", () => {
      expect(isPathWithinBase(baseDir, baseDir)).toBe(true);
    });

    it("should detect path traversal attempts", () => {
      const traversalPath = path.join(baseDir, "..", "..", "etc", "passwd");
      const resolved = path.resolve(traversalPath);
      expect(isPathWithinBase(resolved, baseDir)).toBe(false);
    });
  });

  describe("resolveImagePath", () => {
    it("should reject invalid slug", () => {
      const result = resolveImagePath("../../../etc/passwd");
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject invalid variant", () => {
      const result = resolveImagePath("valid-slug", "../../../etc");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid variant");
    });

    it("should accept valid slug and variant", () => {
      const result = resolveImagePath("quercus-robur", "optimized");
      expect(result.success).toBe(true);
      expect(result.path).toBeDefined();
      if (result.path) {
        expect(result.path).toContain("public/images/trees");
        expect(result.path).toContain("optimized");
        expect(result.path).toContain("quercus-robur");
      }
    });

    it("should use 'original' as default variant", () => {
      const result = resolveImagePath("test-tree");
      expect(result.success).toBe(true);
      expect(result.path).toContain("original");
    });

    it("should sanitize slug to lowercase", () => {
      const result = resolveImagePath("TestTree");
      expect(result.success).toBe(true);
      if (result.path) {
        expect(result.path).toContain("testtree");
      }
    });
  });

  describe("OWASP Path Traversal Vectors", () => {
    const vectors = [
      "../",
      "..\\",
      "../../../",
      "....//",
      "..../",
      "....\\",
      "%2e%2e%2f",
      "%2e%2e/",
      "..%2f",
      "%2e%2e\\",
      "..%5c",
      "%252e%252e%255c",
      "..%255c",
      "..%c0%af",
      "..%c1%9c",
    ];

    vectors.forEach((vector) => {
      it(`should reject OWASP vector: ${vector}`, () => {
        const result = validateSlug(vector);
        expect(result.valid).toBe(false);
      });
    });
  });

  describe("Windows and Unix Path Separators", () => {
    it("should reject Windows path separators", () => {
      expect(validateSlug("C:\\Windows\\System32").valid).toBe(false);
      expect(validateSlug("..\\..\\etc\\passwd").valid).toBe(false);
    });

    it("should reject Unix path separators", () => {
      expect(validateSlug("/etc/passwd").valid).toBe(false);
      expect(validateSlug("../../etc/passwd").valid).toBe(false);
    });

    it("should reject mixed path separators", () => {
      expect(validateSlug("test/..\\etc").valid).toBe(false);
    });
  });

  describe("Long Path Handling", () => {
    it("should reject very long paths", () => {
      const longPath = "a".repeat(5000);
      const result = validateSlug(longPath);
      expect(result.valid).toBe(false);
    });

    it("should accept paths just under the limit", () => {
      const path = "a".repeat(99);
      const result = validateSlug(path);
      expect(result.valid).toBe(true);
    });
  });

  describe("Special Characters and Encoding", () => {
    it("should reject double URL encoding", () => {
      const result = validateSlug("%252e%252e%252f");
      expect(result.valid).toBe(false);
    });

    it("should reject unicode normalization attacks", () => {
      // U+FF0E (fullwidth full stop) normalizes to "."
      const result = validateSlug("\uFF0E\uFF0E\u2215");
      expect(result.valid).toBe(false);
    });

    it("should reject spaces", () => {
      const result = validateSlug("test file");
      expect(result.valid).toBe(false);
    });

    it("should accept single dots in middle of filename", () => {
      const result = validateSlug("test.file");
      expect(result.valid).toBe(true);
    });
  });
});
