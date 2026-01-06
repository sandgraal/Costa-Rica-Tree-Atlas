import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/ratelimit";

/**
 * CSP Violation Report Handler
 * Receives and logs Content Security Policy violation reports
 * Rate limited to prevent abuse
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting to prevent abuse
  const rateLimitResult = await rateLimit(request, "default");
  if ("response" in rateLimitResult) return rateLimitResult.response;

  try {
    const report = await request.json();

    // Extract CSP report data
    const cspReport = report["csp-report"];
    if (!cspReport) {
      return NextResponse.json(
        { error: "Invalid CSP report format" },
        { status: 400 }
      );
    }

    // Log CSP violation
    // In production, consider sending to a monitoring service like Sentry
    console.warn("[CSP Violation]", {
      documentUri: cspReport["document-uri"],
      violatedDirective: cspReport["violated-directive"],
      blockedUri: cspReport["blocked-uri"],
      effectiveDirective: cspReport["effective-directive"],
      originalPolicy: cspReport["original-policy"],
      sourceFile: cspReport["source-file"],
      statusCode: cspReport["status-code"],
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get("user-agent"),
    });

    // Return 204 No Content for successful report
    return new NextResponse(null, {
      status: 204,
      headers: {
        ...rateLimitResult.headers,
      },
    });
  } catch (error) {
    console.error("[CSP Report] Error processing report:", error);
    return NextResponse.json(
      { error: "Invalid report format" },
      { status: 400 }
    );
  }
}
