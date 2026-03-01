import { NextRequest, NextResponse } from "next/server";

function getRequestIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    ""
  );
}

function parseAllowlist(raw: string | undefined): Set<string> {
  if (!raw) return new Set<string>();
  return new Set(
    raw
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
  );
}

/**
 * Gate access to private API v1 routes.
 *
 * Access is allowed when:
 * 1) request includes matching X-API-Key header, or
 * 2) request IP is listed in API_V1_ALLOWLIST.
 */
export function requireApiV1Access(request: NextRequest): NextResponse | null {
  const expectedApiKey = process.env.API_V1_KEY?.trim();
  const allowlist = parseAllowlist(process.env.API_V1_ALLOWLIST);

  // If no restrictions are configured, fail closed for private API routes.
  if (!expectedApiKey && allowlist.size === 0) {
    return NextResponse.json(
      {
        error: {
          code: "API_ACCESS_NOT_CONFIGURED",
          message:
            "API v1 access is disabled until API_V1_KEY or API_V1_ALLOWLIST is configured.",
        },
        _links: { documentation: "/api/docs" },
      },
      { status: 503 }
    );
  }

  const providedApiKey = request.headers.get("X-API-Key")?.trim();
  if (expectedApiKey && providedApiKey === expectedApiKey) {
    return null;
  }

  const requestIp = getRequestIp(request);
  if (requestIp && allowlist.has(requestIp)) {
    return null;
  }

  return NextResponse.json(
    {
      error: {
        code: "UNAUTHORIZED",
        message:
          "API access denied. Provide a valid X-API-Key or connect from an allowlisted IP.",
      },
      _links: { documentation: "/api/docs" },
    },
    { status: 401 }
  );
}
