/**
 * NextAuth Session Helper for Edge Middleware
 *
 * Verifies JWT tokens in Edge runtime without database calls.
 * Uses jose library for JWT verification.
 */

import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { logJWTVerificationError } from "./jwt-error-logger";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "";
const JWT_SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
}

export async function getSessionFromRequest(
  request: NextRequest
): Promise<SessionUser | null> {
  try {
    // NextAuth stores JWT in cookies
    // Development uses next-auth.session-token
    // Production uses __Secure-next-auth.session-token (with https)
    const devToken = request.cookies.get("next-auth.session-token")?.value;
    const prodToken = request.cookies.get(
      "__Secure-next-auth.session-token"
    )?.value;
    const token = prodToken || devToken;

    console.log("[Session] Checking cookies:", {
      hasDevToken: !!devToken,
      hasProdToken: !!prodToken,
      hasSecret: !!JWT_SECRET,
      allCookies: Array.from(request.cookies.getAll()).map((c) => c.name),
    });

    if (!token || !JWT_SECRET) {
      console.log("[Session] No token or secret");
      return null;
    }

    // Verify JWT
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY, {
      algorithms: ["HS256"],
    });

    console.log("[Session] JWT verified, payload:", payload);

    // Extract user from payload
    if (payload && typeof payload === "object" && "id" in payload) {
      return {
        id: payload.id as string,
        email: payload.email as string,
        name: payload.name as string | undefined,
      };
    }

    return null;
  } catch (error) {
    // Invalid or expired token - log for operational diagnostics
    // Note: No sensitive data (token payload) is logged
    logJWTVerificationError(error);
    return null;
  }
}
