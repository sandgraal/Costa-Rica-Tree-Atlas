import { NextRequest } from "next/server";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://costaricatreeatlas.com",
  "https://www.costaricatreeatlas.com",
];

export function getAllowedOrigins(): string[] {
  const envOrigins =
    process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) || [];
  return [...DEFAULT_ALLOWED_ORIGINS, ...envOrigins];
}

export function validateOrigin(request: NextRequest): {
  valid: boolean;
  error?: string;
} {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // Some browsers/requests may not include origin header
  if (!origin && !referer) {
    // Allow requests without origin/referer in development only
    // Production should always have these headers for POST requests
    if (process.env.NODE_ENV === "development") {
      return { valid: true };
    }
    return { valid: false, error: "Missing origin header" };
  }

  const allowedOrigins = getAllowedOrigins();

  // In development, also allow localhost origins
  if (process.env.NODE_ENV === "development") {
    allowedOrigins.push(
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:3001"
    );
  }

  // Check origin
  if (origin && allowedOrigins.includes(origin)) {
    return { valid: true };
  }

  // Check referer as fallback
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
      if (allowedOrigins.includes(refererOrigin)) {
        return { valid: true };
      }
    } catch {
      return { valid: false, error: "Invalid referer header" };
    }
  }

  return { valid: false, error: "Origin not allowed" };
}
