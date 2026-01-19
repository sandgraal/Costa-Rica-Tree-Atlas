/**
 * NextAuth.js Configuration
 *
 * Handles authentication with:
 * - Credentials provider (email/password with Argon2id verification)
 * - JWT session strategy
 * - MFA support via TOTP and backup codes
 * - Audit logging
 *
 * @see https://next-auth.js.org/configuration/options
 */

import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verify } from "argon2";
import prisma from "@/lib/prisma";
import { decryptTotpSecret } from "@/lib/auth/mfa-crypto";
import { verifyBackupCode } from "@/lib/auth/backup-codes";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "admin@example.com",
        },
        password: { label: "Password", type: "password" },
        totpCode: { label: "2FA Code (if enabled)", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { mfaSecrets: true },
          });

          if (!user) {
            // Log failed attempt (no user ID)
            await prisma.auditLog.create({
              data: {
                eventType: "login_failed",
                metadata: {
                  email: credentials.email,
                  reason: "user_not_found",
                },
              },
            });
            throw new Error("Invalid credentials");
          }

          // Verify password with Argon2id
          const validPassword = await verify(
            user.passwordHash,
            credentials.password
          );

          if (!validPassword) {
            // Log failed attempt
            await prisma.auditLog.create({
              data: {
                userId: user.id,
                eventType: "login_failed",
                metadata: {
                  email: credentials.email,
                  reason: "invalid_password",
                },
              },
            });
            throw new Error("Invalid credentials");
          }

          // Check if MFA is enabled
          if (user.mfaEnabled) {
            if (!credentials.totpCode) {
              throw new Error("MFA_REQUIRED");
            }

            const mfaSecret = user.mfaSecrets[0];

            if (!mfaSecret || !mfaSecret.totpSecret) {
              throw new Error("MFA configuration error");
            }

            // First, try to verify as TOTP code
            let mfaValid = false;

            // Check if input looks like a backup code (format: XXXX-XXXX-XXXX)
            const isBackupCodeFormat =
              /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(
                credentials.totpCode
              );

            if (!isBackupCodeFormat) {
              // Verify as TOTP code
              try {
                const { TOTP } = await import("@otplib/totp");
                const decryptedSecret = await decryptTotpSecret(
                  mfaSecret.totpSecret
                );
                const totp = new TOTP();
                const result = await totp.verify(credentials.totpCode, {
                  secret: decryptedSecret,
                });
                mfaValid = result.valid;
              } catch (error) {
                console.error("[NextAuth] TOTP verification error:", error);
                mfaValid = false;
              }
            }

            // If TOTP failed or input looks like backup code, try backup code
            if (!mfaValid) {
              const backupResult = await verifyBackupCode(
                user.id,
                credentials.totpCode.toUpperCase()
              );
              mfaValid = backupResult.valid;
            }

            if (!mfaValid) {
              await prisma.auditLog.create({
                data: {
                  userId: user.id,
                  eventType: "login_failed",
                  metadata: {
                    email: credentials.email,
                    reason: "invalid_mfa",
                  },
                },
              });
              throw new Error("Invalid 2FA code");
            }
          }

          // Successful login - log it
          await prisma.auditLog.create({
            data: {
              userId: user.id,
              eventType: "login",
              metadata: { email: credentials.email },
            },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          // Log database connection errors
          console.error("[NextAuth] Login error:", {
            error: error instanceof Error ? error.message : "Unknown error",
            email: credentials.email,
            stack: error instanceof Error ? error.stack : undefined,
          });

          // Re-throw the original error
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/en/admin/login",
    error: "/en/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      // Log logout event
      if (token?.id) {
        await prisma.auditLog.create({
          data: {
            userId: token.id as string,
            eventType: "logout",
            metadata: { timestamp: new Date().toISOString() },
          },
        });
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
