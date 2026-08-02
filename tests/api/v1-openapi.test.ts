import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";

const { GET } = await import("@/app/api/v1/openapi.json/route");

function createRequest(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest("https://costaricatreeatlas.org/api/v1/openapi.json", {
    headers,
  });
}

describe("GET /api/v1/openapi.json", () => {
  beforeEach(() => {
    process.env.API_V1_KEY = "test-private-key";
    delete process.env.API_V1_ALLOWLIST;
  });

  it("rejects unauthenticated requests", async () => {
    const res = await GET(createRequest());
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns a valid OpenAPI 3.1 spec for authorized requests", async () => {
    const res = await GET(createRequest({ "X-API-Key": "test-private-key" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.openapi).toBe("3.1.0");
    expect(body.info.title).toBe("Costa Rica Tree Atlas API");
    expect(body.info.version).toBe("1.0.0");
    expect(body.paths).toBeDefined();
  });

  it("documents all v1 endpoints", async () => {
    const res = await GET(createRequest({ "X-API-Key": "test-private-key" }));
    const body = await res.json();

    const paths = Object.keys(body.paths);
    expect(paths).toContain("/trees");
    expect(paths).toContain("/trees/{slug}");
    expect(paths).toContain("/families");
    expect(paths).toContain("/comparisons");
    expect(paths).toContain("/comparisons/{slug}");
    expect(paths).toContain("/glossary");
    expect(paths).toContain("/glossary/{slug}");
  });

  it("includes component schemas", async () => {
    const res = await GET(createRequest({ "X-API-Key": "test-private-key" }));
    const body = await res.json();

    const schemas = Object.keys(body.components.schemas);
    expect(schemas).toContain("Tree");
    expect(schemas).toContain("Comparison");
    expect(schemas).toContain("GlossaryTerm");
    expect(schemas).toContain("PaginatedResponse");
    expect(schemas).toContain("Error");
  });

  it("includes cache header", async () => {
    const res = await GET(createRequest({ "X-API-Key": "test-private-key" }));
    expect(res.headers.get("Cache-Control")).toContain("max-age");
  });
});
