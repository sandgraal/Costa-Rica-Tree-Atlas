import { describe, expect, it } from "vitest";

const { GET } = await import("@/app/api/v1/openapi.json/route");

describe("GET /api/v1/openapi.json", () => {
  it("returns a valid OpenAPI 3.1 spec", async () => {
    const res = GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.openapi).toBe("3.1.0");
    expect(body.info.title).toBe("Costa Rica Tree Atlas API");
    expect(body.info.version).toBe("1.0.0");
    expect(body.paths).toBeDefined();
  });

  it("documents all v1 endpoints", async () => {
    const res = GET();
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
    const res = GET();
    const body = await res.json();

    const schemas = Object.keys(body.components.schemas);
    expect(schemas).toContain("Tree");
    expect(schemas).toContain("Comparison");
    expect(schemas).toContain("GlossaryTerm");
    expect(schemas).toContain("PaginatedResponse");
    expect(schemas).toContain("Error");
  });

  it("includes CORS header", async () => {
    const res = GET();
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("includes cache header", async () => {
    const res = GET();
    expect(res.headers.get("Cache-Control")).toContain("max-age");
  });
});
