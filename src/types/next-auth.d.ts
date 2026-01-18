/**
 * NextAuth Type Extensions
 *
 * Extends default NextAuth types to include custom properties.
 */

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    mfaEnabled?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}
