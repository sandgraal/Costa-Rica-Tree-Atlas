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
import { secureCompareOrFalse } from "@/lib/auth/secure-compare";
import { constantTimeRateLimitCheck } from "@/lib/auth/constant-time-ratelimit";
import { headerSourceFromRecord } from "@/lib/auth/rate-limit";
import { AUTH_CONFIG } from "@/lib/auth/constants";
import { captureException } from "@/lib/error-tracking";

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
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        // Brute-force protection: 5 attempts per 15 minutes per client IP.
        // Runs before any credential comparison so a rate-limited attacker
        // learns nothing about whether the account exists. The check is
        // constant-time so its own outcome is not observable through timing.
        const rateLimit = await constantTimeRateLimitCheck(
          headerSourceFromRecord(req?.headers as Record<string, string>)
        );
        if (!rateLimit.allowed) {
          throw new Error(
            `Too many attempts. Try again in ${rateLimit.retryAfter}s.`
          );
        }

        // Break-glass credentials for when the database is unreachable.
        //
        // Deliberately disabled in production: it bypasses MFA and the user
        // table entirely, so in production it would be a second, weaker front
        // door to the admin surface. Recovering a locked-out production admin
        // is a database operation, not a login flow.
        const fallbackEmail = process.env.ADMIN_FALLBACK_EMAIL;
        const fallbackPassword = process.env.ADMIN_FALLBACK_PASSWORD;

        if (
          process.env.NODE_ENV !== "production" &&
          fallbackEmail &&
          fallbackPassword
        ) {
          // Compare both fields in constant time, and always evaluate both, so
          // neither a matching email nor a shared password prefix is timeable.
          // Non-throwing variant: an over-length email or password must be a
          // clean credential rejection, not an unhandled NextAuth 500.
          const [emailMatches, passwordMatches] = await Promise.all([
            secureCompareOrFalse(credentials.email, fallbackEmail),
            secureCompareOrFalse(credentials.password, fallbackPassword),
          ]);

          if (emailMatches && passwordMatches) {
            console.warn(
              "[auth] Break-glass fallback credentials used. This path is " +
                "disabled in production."
            );
            return {
              id: "fallback-admin",
              email: fallbackEmail,
              name: "Admin (fallback)",
            };
          }
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
                // A decryption failure is a server misconfiguration (usually a
                // missing or rotated MFA_ENCRYPTION_KEY), not a wrong code.
                // Treating it as a wrong code silently downgrades every account
                // to backup-codes-only with no operator signal, so fail loudly.
                captureException(
                  error instanceof Error ? error : new Error(String(error)),
                  {
                    tags: { area: "auth", step: "totp_verify" },
                    level: "error",
                  }
                );
                throw new Error("MFA configuration error");
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
    // Single source of truth: src/lib/auth/constants.ts. This previously read
    // `7 * 24 * 60 * 60` while AUTH_CONFIG.SESSION_DURATION declared 24h and was
    // imported by nothing — the constant documented an intent the app ignored.
    maxAge: AUTH_CONFIG.SESSION_DURATION,
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
