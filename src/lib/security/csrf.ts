import { NextRequest } from "next/server";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://costaricatreeatlas.com",
  "https://www.costaricatreeatlas.com",
];

// Cache allowed origins to avoid recomputing on every request
let cachedAllowedOrigins: string[] | null = null;

export function getAllowedOrigins(): string[] {
  // Return cached value if available
  if (cachedAllowedOrigins !== null) {
    return cachedAllowedOrigins;
  }

  const envOrigins =
    process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) || [];

  const origins = [...DEFAULT_ALLOWED_ORIGINS, ...envOrigins];

  // In development, also allow localhost origins
  if (process.env.NODE_ENV === "development") {
    const devOrigins = process.env.DEV_ALLOWED_ORIGINS
      ? process.env.DEV_ALLOWED_ORIGINS.split(",").map((o) => o.trim())
      : [
          "http://localhost:3000",
          "http://127.0.0.1:3000",
          "http://localhost:3001",
        ];

    origins.push(...devOrigins);
  }

  // Cache the result
  cachedAllowedOrigins = origins;
  return origins;
}

export function validateOrigin(request: NextRequest): {
  valid: boolean;
  error?: string;
} {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  const allowedOrigins = getAllowedOrigins();

  // If origin header is present, validate it strictly (don't fall back to referer)
  if (origin) {
    if (allowedOrigins.includes(origin)) {
      return { valid: true };
    }
    // Origin present but not allowed - reject immediately
    return { valid: false, error: "Origin not allowed" };
  }

  // Only check referer if origin header is not present
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
      if (allowedOrigins.includes(refererOrigin)) {
        return { valid: true };
      }
      return { valid: false, error: "Referer not allowed" };
    } catch {
      return { valid: false, error: "Invalid referer header" };
    }
  }

  // Neither origin nor referer is present
  return { valid: false, error: "Missing origin and referer headers" };
}
