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

  const allowedOrigins = getAllowedOrigins();

  // In development, also allow localhost origins
  if (process.env.NODE_ENV === "development") {
    // Use configurable dev origins if provided, otherwise use defaults
    const devOrigins = process.env.DEV_ALLOWED_ORIGINS
      ? process.env.DEV_ALLOWED_ORIGINS.split(",").map((o) => o.trim())
      : [
          "http://localhost:3000",
          "http://127.0.0.1:3000",
          "http://localhost:3001",
        ];

    allowedOrigins.push(...devOrigins);
  }

  // Check origin header
  if (origin) {
    if (allowedOrigins.includes(origin)) {
      return { valid: true };
    }
  }

  // Check referer as fallback (some browsers may not send origin)
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

  // If neither origin nor referer is present or valid
  if (!origin && !referer) {
    return { valid: false, error: "Missing origin and referer headers" };
  }

  return { valid: false, error: "Origin not allowed" };
}
