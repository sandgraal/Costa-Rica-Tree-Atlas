/**
 * NextAuth Session Helper for Edge Middleware
 *
 * Verifies JWT tokens in Edge runtime without database calls.
 * Uses next-auth/jwt getToken which correctly handles NextAuth's JWE
 * (JSON Web Encryption) token format used by default in next-auth v4.
 *
 * Note: The previous implementation used jose's jwtVerify (JWS only) which
 * is incompatible with NextAuth's JWE-encrypted tokens, causing all session
 * checks to silently fail and redirect users back to login.
 */

import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
}

export async function getSessionFromRequest(
  request: NextRequest
): Promise<SessionUser | null> {
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    console.error("[Auth] NEXTAUTH_SECRET is not configured");
    return null;
  }

  try {
    // getToken handles both dev (next-auth.session-token) and prod
    // (__Secure-next-auth.session-token) cookies automatically, and correctly
    // decrypts NextAuth's JWE-encrypted JWT tokens.
    // secureCookie must match the NextAuth cookie config (see route.ts cookies.sessionToken).
    const token = await getToken({
      req: request,
      secret,
      secureCookie: process.env.NODE_ENV === "production",
    });

    if (
      token &&
      typeof token.id === "string" &&
      typeof token.email === "string"
    ) {
      return {
        id: token.id,
        email: token.email,
        name: token.name ?? null,
      };
    }

    return null;
  } catch {
    // Token decryption/verification failed (invalid, expired, or tampered)
    return null;
  }
}
