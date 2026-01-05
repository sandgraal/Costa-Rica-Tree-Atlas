import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const report = await request.json();

    // Log CSP violations (in production, send to monitoring service)
    console.warn("CSP Violation:", {
      timestamp: new Date().toISOString(),
      documentURI: report["document-uri"],
      violatedDirective: report["violated-directive"],
      blockedURI: report["blocked-uri"],
      sourceFile: report["source-file"],
      lineNumber: report["line-number"],
      columnNumber: report["column-number"],
      userAgent: request.headers.get("user-agent"),
    });

    // In production, send to monitoring service (Sentry, LogRocket, etc.)
    if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
      // await sendToSentry(report);
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("CSP report parsing error:", error);
    return new NextResponse(null, { status: 400 });
  }
}
