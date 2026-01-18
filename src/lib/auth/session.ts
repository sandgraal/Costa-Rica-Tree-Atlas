/**
 * NextAuth Session Helper for Edge Middleware
 *
 * Verifies JWT tokens in Edge runtime without database calls.
 * Uses jose library for JWT verification.
 */

import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

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
    const token =
      request.cookies.get("next-auth.session-token")?.value ||
      request.cookies.get("__Secure-next-auth.session-token")?.value;

    if (!token || !JWT_SECRET) {
      return null;
    }

    // Verify JWT
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY, {
      algorithms: ["HS256"],
    });

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
    // Invalid or expired token
    console.error("Session verification error:", error);
    return null;
  }
}
