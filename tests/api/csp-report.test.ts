import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// Mock rateLimit to always allow
vi.mock("@/lib/ratelimit", () => ({
  rateLimit: vi.fn().mockResolvedValue({
    headers: { "X-RateLimit-Remaining": "99" },
  }),
}));

const { POST } = await import("@/app/api/csp-report/route");

function createRequest(body: unknown): NextRequest {
  return new NextRequest(new URL("/api/csp-report", "http://localhost:3000"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/csp-report", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("accepts valid CSP report and returns 204", async () => {
    const req = createRequest({
      "csp-report": {
        "document-uri": "https://example.com/page",
        "violated-directive": "script-src",
        "blocked-uri": "https://evil.com/script.js",
        "effective-directive": "script-src",
        "original-policy": "script-src 'self'",
        "source-file": "https://example.com/page",
        "status-code": 200,
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(204);
  });

  it("rejects report without csp-report field", async () => {
    const req = createRequest({
      "invalid-field": "not a CSP report",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("rejects empty body", async () => {
    const req = createRequest({});

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("handles malformed JSON gracefully", async () => {
    const req = new NextRequest(
      new URL("/api/csp-report", "http://localhost:3000"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not-json",
      }
    );

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("logs CSP violation details", async () => {
    const warnSpy = vi.spyOn(console, "warn");

    const req = createRequest({
      "csp-report": {
        "document-uri": "https://example.com",
        "violated-directive": "img-src",
        "blocked-uri": "https://tracker.com/pixel.gif",
      },
    });

    await POST(req);

    expect(warnSpy).toHaveBeenCalledWith(
      "[CSP Violation]",
      expect.objectContaining({
        documentUri: "https://example.com",
        violatedDirective: "img-src",
        blockedUri: "https://tracker.com/pixel.gif",
      })
    );
  });
});
