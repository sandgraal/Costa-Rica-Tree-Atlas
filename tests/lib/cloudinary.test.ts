/**
 * Tests for src/lib/cloudinary.ts
 *
 * Covers:
 *  - isCloudinaryConfigured (configured / partial / unconfigured)
 *  - uploadImage success and error paths
 *  - deleteImage success, not-found, and SDK error
 *  - buildImageUrl with various transformation options
 *  - ensureConfigured singleton: SDK is configured only once
 *  - error propagation when env vars are missing
 */

import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

type UploadCallback = (error: Error | null, result: unknown) => void;

// ---------------------------------------------------------------------------
// Stable mock function references (shared across all vi.mock factories)
// ---------------------------------------------------------------------------
const mockConfig = vi.fn();
const mockUploadStream = vi.fn();
const mockDestroy = vi.fn();
const mockUrl = vi.fn();

vi.mock("cloudinary", () => ({
  v2: {
    config: mockConfig,
    uploader: {
      upload_stream: mockUploadStream,
      destroy: mockDestroy,
    },
    url: mockUrl,
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setConfiguredEnv(): void {
  process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
  process.env.CLOUDINARY_API_KEY = "test-api-key";
  process.env.CLOUDINARY_API_SECRET = "test-api-secret";
}

function clearCloudinaryEnv(): void {
  delete process.env.CLOUDINARY_CLOUD_NAME;
  delete process.env.CLOUDINARY_API_KEY;
  delete process.env.CLOUDINARY_API_SECRET;
}

/** Minimal Cloudinary upload result. */
const MOCK_UPLOAD_RESULT = {
  public_id: "costa-rica-tree-atlas/ceiba/bark-abc123",
  secure_url:
    "https://res.cloudinary.com/test-cloud/image/upload/ceiba/bark.webp",
  width: 1200,
  height: 900,
  bytes: 54321,
  format: "webp",
};

// ---------------------------------------------------------------------------
// isCloudinaryConfigured
// ---------------------------------------------------------------------------

describe("isCloudinaryConfigured", () => {
  beforeEach(() => {
    vi.resetModules();
    clearCloudinaryEnv();
  });

  afterEach(() => {
    clearCloudinaryEnv();
  });

  it("returns false when no env vars are set", async () => {
    const { isCloudinaryConfigured } = await import("@/lib/cloudinary");
    expect(isCloudinaryConfigured()).toBe(false);
  });

  it("returns false when only CLOUD_NAME is set", async () => {
    process.env.CLOUDINARY_CLOUD_NAME = "my-cloud";
    vi.resetModules();
    const { isCloudinaryConfigured } = await import("@/lib/cloudinary");
    expect(isCloudinaryConfigured()).toBe(false);
  });

  it("returns false when CLOUD_NAME and API_KEY are set but not SECRET", async () => {
    process.env.CLOUDINARY_CLOUD_NAME = "my-cloud";
    process.env.CLOUDINARY_API_KEY = "my-key";
    vi.resetModules();
    const { isCloudinaryConfigured } = await import("@/lib/cloudinary");
    expect(isCloudinaryConfigured()).toBe(false);
  });

  it("returns true when all three env vars are set", async () => {
    setConfiguredEnv();
    vi.resetModules();
    const { isCloudinaryConfigured } = await import("@/lib/cloudinary");
    expect(isCloudinaryConfigured()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Operations when Cloudinary is fully configured
// ---------------------------------------------------------------------------

describe("when Cloudinary is configured", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    setConfiguredEnv();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    clearCloudinaryEnv();
  });

  // -------------------------------------------------------------------------
  // uploadImage
  // -------------------------------------------------------------------------

  describe("uploadImage", () => {
    it("uploads a buffer and returns structured metadata", async () => {
      mockUploadStream.mockImplementation(
        (_opts: unknown, callback: UploadCallback) => ({
          end: vi.fn(() => callback(null, MOCK_UPLOAD_RESULT)),
        })
      );

      const { uploadImage } = await import("@/lib/cloudinary");
      const result = await uploadImage(Buffer.from("fake-image-data"), {
        treeSlug: "ceiba",
        imageType: "bark",
        tags: ["community"],
      });

      expect(result.publicId).toBe(MOCK_UPLOAD_RESULT.public_id);
      expect(result.url).toBe(MOCK_UPLOAD_RESULT.secure_url);
      expect(result.width).toBe(1200);
      expect(result.height).toBe(900);
      expect(result.bytes).toBe(54321);
      expect(result.format).toBe("webp");
    });

    it("places the image in the correct folder path", async () => {
      mockUploadStream.mockImplementation(
        (_opts: unknown, callback: UploadCallback) => ({
          end: vi.fn(() => callback(null, MOCK_UPLOAD_RESULT)),
        })
      );

      const { uploadImage } = await import("@/lib/cloudinary");
      await uploadImage(Buffer.from("fake"), {
        treeSlug: "guanacaste",
        imageType: "leaf",
      });

      const [callOptions] = mockUploadStream.mock.calls[0] as [
        { folder: string },
        unknown,
      ];
      expect(callOptions.folder).toBe("costa-rica-tree-atlas/guanacaste");
    });

    it("includes treeSlug and imageType in tags", async () => {
      mockUploadStream.mockImplementation(
        (_opts: unknown, callback: UploadCallback) => ({
          end: vi.fn(() => callback(null, MOCK_UPLOAD_RESULT)),
        })
      );

      const { uploadImage } = await import("@/lib/cloudinary");
      await uploadImage(Buffer.from("fake"), {
        treeSlug: "ceiba",
        imageType: "bark",
        tags: ["community"],
      });

      const [callOptions] = mockUploadStream.mock.calls[0] as [
        { tags: string[] },
        unknown,
      ];
      expect(callOptions.tags).toContain("ceiba");
      expect(callOptions.tags).toContain("bark");
      expect(callOptions.tags).toContain("tree-atlas");
    });

    it("rejects when Cloudinary SDK returns an error", async () => {
      mockUploadStream.mockImplementation(
        (_opts: unknown, callback: UploadCallback) => ({
          end: vi.fn(() => callback(new Error("Upload failed"), undefined)),
        })
      );

      const { uploadImage } = await import("@/lib/cloudinary");
      await expect(
        uploadImage(Buffer.from("fake"), {
          treeSlug: "ceiba",
          imageType: "bark",
        })
      ).rejects.toThrow("Cloudinary upload failed: Upload failed");
    });

    it("rejects when Cloudinary SDK returns a null result", async () => {
      mockUploadStream.mockImplementation(
        (_opts: unknown, callback: UploadCallback) => ({
          end: vi.fn(() => callback(null, undefined)),
        })
      );

      const { uploadImage } = await import("@/lib/cloudinary");
      await expect(
        uploadImage(Buffer.from("fake"), {
          treeSlug: "ceiba",
          imageType: "bark",
        })
      ).rejects.toThrow("Cloudinary upload returned no result");
    });
  });

  // -------------------------------------------------------------------------
  // deleteImage
  // -------------------------------------------------------------------------

  describe("deleteImage", () => {
    it("deletes an image and returns ok", async () => {
      mockDestroy.mockResolvedValue({ result: "ok" });

      const { deleteImage } = await import("@/lib/cloudinary");
      const result = await deleteImage(
        "costa-rica-tree-atlas/ceiba/bark-abc123"
      );

      expect(result.result).toBe("ok");
      expect(mockDestroy).toHaveBeenCalledWith(
        "costa-rica-tree-atlas/ceiba/bark-abc123"
      );
    });

    it("returns 'not found' when the image does not exist", async () => {
      mockDestroy.mockResolvedValue({ result: "not found" });

      const { deleteImage } = await import("@/lib/cloudinary");
      const result = await deleteImage("nonexistent-public-id");

      expect(result.result).toBe("not found");
    });

    it("propagates SDK errors", async () => {
      mockDestroy.mockRejectedValue(new Error("Network timeout"));

      const { deleteImage } = await import("@/lib/cloudinary");
      await expect(
        deleteImage("costa-rica-tree-atlas/ceiba/bark")
      ).rejects.toThrow("Network timeout");
    });
  });

  // -------------------------------------------------------------------------
  // buildImageUrl
  // -------------------------------------------------------------------------

  describe("buildImageUrl", () => {
    beforeEach(() => {
      mockUrl.mockReturnValue(
        "https://res.cloudinary.com/test-cloud/image/upload/f_auto,q_auto/test-id"
      );
    });

    it("calls cloudinary.url with secure:true and a transformation array", async () => {
      const { buildImageUrl } = await import("@/lib/cloudinary");
      buildImageUrl("costa-rica-tree-atlas/ceiba/bark");

      expect(mockUrl).toHaveBeenCalledWith(
        "costa-rica-tree-atlas/ceiba/bark",
        expect.objectContaining({ secure: true })
      );
      const [, opts] = mockUrl.mock.calls[0] as [
        unknown,
        { transformation: unknown[] },
      ];
      expect(Array.isArray(opts.transformation)).toBe(true);
    });

    it("uses auto quality and auto format by default", async () => {
      const { buildImageUrl } = await import("@/lib/cloudinary");
      buildImageUrl("test-id");

      const [, opts] = mockUrl.mock.calls[0] as [
        unknown,
        { transformation: Record<string, unknown>[] },
      ];
      expect(opts.transformation[0]).toMatchObject({
        quality: "auto",
        fetch_format: "auto",
        crop: "limit",
      });
    });

    it("includes width and height when provided", async () => {
      const { buildImageUrl } = await import("@/lib/cloudinary");
      buildImageUrl("test-id", { width: 400, height: 300 });

      const [, opts] = mockUrl.mock.calls[0] as [
        unknown,
        { transformation: Record<string, unknown>[] },
      ];
      expect(opts.transformation[0]).toMatchObject({ width: 400, height: 300 });
    });

    it("omits gravity when not provided", async () => {
      const { buildImageUrl } = await import("@/lib/cloudinary");
      buildImageUrl("test-id");

      const [, opts] = mockUrl.mock.calls[0] as [
        unknown,
        { transformation: Record<string, unknown>[] },
      ];
      expect(opts.transformation[0]).not.toHaveProperty("gravity");
    });

    it("includes gravity when provided", async () => {
      const { buildImageUrl } = await import("@/lib/cloudinary");
      buildImageUrl("test-id", { gravity: "face" });

      const [, opts] = mockUrl.mock.calls[0] as [
        unknown,
        { transformation: Record<string, unknown>[] },
      ];
      expect(opts.transformation[0]).toMatchObject({ gravity: "face" });
    });

    it("respects custom format and quality overrides", async () => {
      const { buildImageUrl } = await import("@/lib/cloudinary");
      buildImageUrl("test-id", { format: "webp", quality: "auto:best" });

      const [, opts] = mockUrl.mock.calls[0] as [
        unknown,
        { transformation: Record<string, unknown>[] },
      ];
      expect(opts.transformation[0]).toMatchObject({
        fetch_format: "webp",
        quality: "auto:best",
      });
    });

    it("returns the URL string from cloudinary.url", async () => {
      const { buildImageUrl } = await import("@/lib/cloudinary");
      const url = buildImageUrl("test-id");

      expect(typeof url).toBe("string");
      expect(url).toContain("cloudinary.com");
    });
  });
});

// ---------------------------------------------------------------------------
// Error propagation when env vars are missing
// ---------------------------------------------------------------------------

describe("when Cloudinary is NOT configured", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    clearCloudinaryEnv();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uploadImage throws a descriptive configuration error", async () => {
    const { uploadImage } = await import("@/lib/cloudinary");
    await expect(
      uploadImage(Buffer.from("test"), { treeSlug: "ceiba", imageType: "bark" })
    ).rejects.toThrow("Cloudinary is not configured");
  });

  it("deleteImage throws a descriptive configuration error", async () => {
    const { deleteImage } = await import("@/lib/cloudinary");
    await expect(deleteImage("some-public-id")).rejects.toThrow(
      "Cloudinary is not configured"
    );
  });

  it("buildImageUrl throws a descriptive configuration error", async () => {
    const { buildImageUrl } = await import("@/lib/cloudinary");
    expect(() => buildImageUrl("some-id")).toThrow(
      "Cloudinary is not configured"
    );
  });
});

// ---------------------------------------------------------------------------
// Singleton: ensureConfigured calls cloudinary.config exactly once
// ---------------------------------------------------------------------------

describe("ensureConfigured singleton pattern", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    setConfiguredEnv();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    clearCloudinaryEnv();
  });

  it("configures the SDK only once across multiple operations", async () => {
    mockUploadStream.mockImplementation(
      (_opts: unknown, callback: UploadCallback) => ({
        end: vi.fn(() => callback(null, MOCK_UPLOAD_RESULT)),
      })
    );
    mockDestroy.mockResolvedValue({ result: "ok" });
    mockUrl.mockReturnValue(
      "https://res.cloudinary.com/test-cloud/image/upload/test.webp"
    );

    const { uploadImage, deleteImage, buildImageUrl } =
      await import("@/lib/cloudinary");

    // Three operations — each calls ensureConfigured() internally
    await uploadImage(Buffer.from("test"), {
      treeSlug: "ceiba",
      imageType: "bark",
    });
    await deleteImage("costa-rica-tree-atlas/ceiba/bark-abc123");
    buildImageUrl("costa-rica-tree-atlas/ceiba/bark-abc123");

    // cloudinary.config must be called exactly once (singleton guard)
    expect(mockConfig).toHaveBeenCalledTimes(1);
  });
});
