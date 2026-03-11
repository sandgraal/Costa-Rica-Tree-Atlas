import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

let tablesExist = true;
let sessionUser: { id: string } | null = { id: "admin-1" };
let proposalRows: Array<{
  id: string;
  tree_slug: string;
  image_type: string;
  current_url: string | null;
  proposed_url: string;
  proposed_source: string | null;
  proposed_alt: string | null;
  status: string;
  quality_score: number | null;
  resolution: string | null;
  file_size: number | null;
}> = [];

const queryRawMock = vi.fn(async (strings: TemplateStringsArray) => {
  const sql = strings.join(" ");

  if (sql.includes("SELECT 1 FROM image_proposals LIMIT 1")) {
    if (!tablesExist) throw new Error("missing table");
    return [{ ok: 1 }];
  }

  if (sql.includes("FROM image_proposals") && sql.includes("WHERE id =")) {
    return proposalRows;
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

vi.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

vi.mock("@/lib/error-tracking", () => ({
  captureApiError: vi.fn(),
}));

const { POST } =
  await import("@/app/api/admin/images/proposals/[id]/apply/route");

describe("POST /api/admin/images/proposals/[id]/apply", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tablesExist = true;
    sessionUser = { id: "admin-1" };
    proposalRows = [];
  });

  it("returns 401 when unauthenticated", async () => {
    sessionUser = null;

    const req = new NextRequest(
      "http://localhost/api/admin/images/proposals/p1/apply",
      {
        method: "POST",
      }
    );

    const res = await POST(req, { params: Promise.resolve({ id: "p1" }) });
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 503 when image review tables are missing", async () => {
    tablesExist = false;

    const req = new NextRequest(
      "http://localhost/api/admin/images/proposals/p1/apply",
      {
        method: "POST",
      }
    );

    const res = await POST(req, { params: Promise.resolve({ id: "p1" }) });
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.error).toContain("not initialized");
  });

  it("returns 404 when proposal does not exist", async () => {
    proposalRows = [];

    const req = new NextRequest(
      "http://localhost/api/admin/images/proposals/p1/apply",
      {
        method: "POST",
      }
    );

    const res = await POST(req, { params: Promise.resolve({ id: "p1" }) });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Proposal not found");
  });

  it("returns 400 when proposal is not APPROVED", async () => {
    proposalRows = [
      {
        id: "p1",
        tree_slug: "ceiba",
        image_type: "FEATURED",
        current_url: "/images/trees/ceiba.jpg",
        proposed_url: "https://example.com/new.jpg",
        proposed_source: "test-source",
        proposed_alt: "alt",
        status: "PENDING",
        quality_score: 90,
        resolution: "1600x1200",
        file_size: 245000,
      },
    ];

    const req = new NextRequest(
      "http://localhost/api/admin/images/proposals/p1/apply",
      {
        method: "POST",
      }
    );

    const res = await POST(req, { params: Promise.resolve({ id: "p1" }) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("Only APPROVED proposals can be applied");
  });
});
