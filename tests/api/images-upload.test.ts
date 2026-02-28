import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// ---------- Mocks ----------

let tablesExist = true;
let rateLimitOk = true;
let cloudinaryConfigured = true;
let sessionUser: { id: string; name: string } | null = {
  id: "user-1",
  name: "Test User",
};

const queryRawMock = vi.fn(async (strings: TemplateStringsArray) => {
  const sql = strings.join(" ");

  // checkTablesExist
  if (sql.includes("SELECT 1 FROM image_proposals LIMIT 1")) {
    if (!tablesExist) throw new Error("Table not found");
    return [{ ok: 1 }];
  }

  // checkRateLimit
  if (sql.includes("SELECT COUNT(*) as count") && sql.includes("actorId")) {
    return [{ count: rateLimitOk ? BigInt(0) : BigInt(5) }];
  }

  return [];
});

const executeRawMock = vi.fn(async () => 1);

vi.mock("@/lib/prisma", () => ({
  default: {
    $queryRaw: queryRawMock,
    $executeRaw: executeRawMock,
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(async () => {
    if (!sessionUser) return null;
    return { user: sessionUser };
  }),
}));

// Mock authOptions
vi.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

// Mock sharp
vi.mock("sharp", () => ({
  default: vi.fn(() => ({
    metadata: vi.fn(async () => ({
      width: 1920,
      height: 1080,
      format: "jpeg",
    })),
  })),
}));

// Mock cloudinary
vi.mock("@/lib/cloudinary", () => ({
  uploadImage: vi.fn(async () => ({
    publicId: "costa-rica-tree-atlas/ceiba/tree-abc123",
    url: "https://res.cloudinary.com/test/image/upload/v1/costa-rica-tree-atlas/ceiba/tree-abc123.webp",
    width: 1200,
    height: 900,
    bytes: 245000,
    format: "webp",
  })),
  isCloudinaryConfigured: vi.fn(() => cloudinaryConfigured),
  MAX_UPLOAD_BYTES: 10 * 1024 * 1024,
  ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/webp"] as const,
}));

vi.mock("@/lib/error-tracking", () => ({
  captureApiError: vi.fn(),
}));

const { GET, POST } = await import("@/app/api/images/upload/route");

// ---------- Helpers ----------

/**
 * Build a NextRequest whose .formData() resolves to a mock FormData object.
 * This avoids the Node.js/vitest issues with real File + FormData in tests.
 */
function createUploadRequest(
  fields: Record<string, string | { name: string; type: string; size: number }>
): NextRequest {
  const mockFormData = new Map<string, unknown>();
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === "object" && value !== null && "type" in value) {
      // Create a mock File-like object
      const bytes = new Uint8Array(value.size);
      const blob = new Blob([bytes], { type: value.type });
      Object.defineProperty(blob, "name", { value: value.name });
      mockFormData.set(key, blob);
    } else {
      mockFormData.set(key, value);
    }
  }

  const req = new NextRequest(
    new URL("/api/images/upload", "http://localhost:3000"),
    { method: "POST" }
  );

  // Override formData() to return our mock data
  vi.spyOn(req, "formData").mockResolvedValue({
    get: (key: string) => mockFormData.get(key) ?? null,
    getAll: (key: string) => {
      const v = mockFormData.get(key);
      return v ? [v] : [];
    },
    has: (key: string) => mockFormData.has(key),
    entries: () => mockFormData.entries(),
    keys: () => mockFormData.keys(),
    values: () => mockFormData.values(),
    forEach: (cb: (value: unknown, key: string) => void) =>
      mockFormData.forEach(cb),
    [Symbol.iterator]: () => mockFormData.entries(),
    append: () => {},
    delete: () => {},
    set: () => {},
  } as unknown as FormData);

  return req;
}

function mockFile(
  name = "photo.jpg",
  type = "image/jpeg",
  sizeKB = 500
): { name: string; type: string; size: number } {
  return { name, type, size: sizeKB * 1024 };
}

// ---------- Tests ----------

describe("POST /api/images/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tablesExist = true;
    rateLimitOk = true;
    cloudinaryConfigured = true;
    sessionUser = { id: "user-1", name: "Test User" };
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uploads a photo successfully", async () => {
    const req = createUploadRequest({
      file: mockFile(),
      treeSlug: "ceiba",
      imageType: "TREE",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.proposalId).toBeTruthy();
    expect(body.data.imageUrl).toContain("cloudinary");
    expect(body.data.treeSlug).toBe("ceiba");
    expect(body.data.imageType).toBe("TREE");
    expect(body.message).toContain("successfully");
  });

  it("creates an image proposal in the database", async () => {
    const req = createUploadRequest({
      file: mockFile(),
      treeSlug: "guanacaste",
      imageType: "BARK",
      attribution: "John Doe",
      notes: "Taken in Monteverde",
    });
    await POST(req);

    // Verify INSERT into image_proposals was called
    expect(executeRawMock).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proposalInsertCall = (executeRawMock.mock.calls as any[]).find(
      (call: any) => {
        const sql = call[0]?.join?.(" ") || "";
        return sql.includes("INSERT INTO image_proposals");
      }
    );
    expect(proposalInsertCall).toBeTruthy();
  });

  it("creates an audit log entry", async () => {
    const req = createUploadRequest({
      file: mockFile(),
      treeSlug: "ceiba",
      imageType: "LEAVES",
    });
    await POST(req);

    // Verify INSERT into image_audits was called
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const auditInsertCall = (executeRawMock.mock.calls as any[]).find(
      (call: any) => {
        const sql = call[0]?.join?.(" ") || "";
        return sql.includes("INSERT INTO image_audits");
      }
    );
    expect(auditInsertCall).toBeTruthy();
  });

  it("returns 503 when database tables do not exist", async () => {
    tablesExist = false;
    const req = createUploadRequest({
      file: mockFile(),
      treeSlug: "ceiba",
      imageType: "TREE",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.error).toContain("not initialized");
  });

  it("returns 401 when user is not authenticated", async () => {
    sessionUser = null;
    const req = createUploadRequest({
      file: mockFile(),
      treeSlug: "ceiba",
      imageType: "TREE",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toContain("Authentication");
  });

  it("returns 429 when rate limit is exceeded", async () => {
    rateLimitOk = false;
    const req = createUploadRequest({
      file: mockFile(),
      treeSlug: "ceiba",
      imageType: "TREE",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(429);
    expect(body.error).toContain("limit");
  });

  it("returns 400 when no file is provided", async () => {
    const req = createUploadRequest({
      treeSlug: "ceiba",
      imageType: "TREE",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("No file");
  });

  it("returns 400 when tree slug is missing", async () => {
    const req = createUploadRequest({
      file: mockFile(),
      imageType: "TREE",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("slug");
  });

  it("returns 400 when image type is invalid", async () => {
    const req = createUploadRequest({
      file: mockFile(),
      treeSlug: "ceiba",
      imageType: "INVALID_TYPE",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("Invalid image type");
  });

  it("returns 400 when image type is missing", async () => {
    const req = createUploadRequest({
      file: mockFile(),
      treeSlug: "ceiba",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("Invalid image type");
  });

  it("returns 400 for invalid file type", async () => {
    const req = createUploadRequest({
      file: mockFile("document.pdf", "application/pdf"),
      treeSlug: "ceiba",
      imageType: "TREE",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("Invalid file type");
  });

  it("returns 400 when file exceeds size limit", async () => {
    const req = createUploadRequest({
      file: mockFile("big.jpg", "image/jpeg", 11 * 1024), // 11MB
      treeSlug: "ceiba",
      imageType: "TREE",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("too large");
  });

  it("returns 503 when Cloudinary is not configured", async () => {
    cloudinaryConfigured = false;
    const req = createUploadRequest({
      file: mockFile(),
      treeSlug: "ceiba",
      imageType: "TREE",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.error).toContain("storage not configured");
  });

  it("returns 400 when image is below minimum dimensions", async () => {
    const sharp = (await import("sharp")).default as unknown as ReturnType<
      typeof vi.fn
    >;
    sharp.mockReturnValueOnce({
      metadata: vi.fn(async () => ({
        width: 400,
        height: 300,
        format: "jpeg",
      })),
    });

    const req = createUploadRequest({
      file: mockFile(),
      treeSlug: "ceiba",
      imageType: "TREE",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("too small");
  });

  it("includes attribution from user when provided", async () => {
    const req = createUploadRequest({
      file: mockFile(),
      treeSlug: "ceiba",
      imageType: "FLOWERS",
      attribution: "Jane Smith",
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    // Verify the proposal INSERT includes attribution
    expect(executeRawMock).toHaveBeenCalled();
  });

  it("handles all valid image types except FEATURED", async () => {
    const types = [
      "TREE",
      "BARK",
      "LEAVES",
      "FLOWERS",
      "FRUIT",
      "ROOTS",
      "HABITAT",
    ];
    for (const type of types) {
      vi.clearAllMocks();
      const req = createUploadRequest({
        file: mockFile(),
        treeSlug: "ceiba",
        imageType: type,
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
    }
  });

  it("accepts FEATURED image type", async () => {
    const req = createUploadRequest({
      file: mockFile(),
      treeSlug: "ceiba",
      imageType: "FEATURED",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it("accepts WebP files", async () => {
    const req = createUploadRequest({
      file: mockFile("photo.webp", "image/webp"),
      treeSlug: "ceiba",
      imageType: "TREE",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it("accepts PNG files", async () => {
    const req = createUploadRequest({
      file: mockFile("photo.png", "image/png"),
      treeSlug: "ceiba",
      imageType: "TREE",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it("returns 500 on unexpected errors", async () => {
    const { uploadImage } = await import("@/lib/cloudinary");
    (uploadImage as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Network error")
    );

    const req = createUploadRequest({
      file: mockFile(),
      treeSlug: "ceiba",
      imageType: "TREE",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toContain("Failed to upload");
  });
});

describe("GET /api/images/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cloudinaryConfigured = true;
    sessionUser = { id: "user-1", name: "Test User" };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns upload limits and guidelines", async () => {
    const req = new NextRequest(
      new URL("/api/images/upload", "http://localhost:3000")
    );
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.authenticated).toBe(true);
    expect(body.data.cloudinaryConfigured).toBe(true);
    expect(body.data.limits.maxFileSize).toBe(10 * 1024 * 1024);
    expect(body.data.limits.minWidth).toBe(800);
    expect(body.data.limits.minHeight).toBe(600);
    expect(body.data.limits.uploadsPerHour).toBe(5);
    expect(body.data.imageTypes).toContain("TREE");
    expect(body.data.imageTypes).toContain("BARK");
  });

  it("returns authenticated=false when not logged in", async () => {
    sessionUser = null;
    const req = new NextRequest(
      new URL("/api/images/upload", "http://localhost:3000")
    );
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.authenticated).toBe(false);
  });

  it("reports cloudinary configuration status", async () => {
    cloudinaryConfigured = false;
    const req = new NextRequest(
      new URL("/api/images/upload", "http://localhost:3000")
    );
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.cloudinaryConfigured).toBe(false);
  });
});
