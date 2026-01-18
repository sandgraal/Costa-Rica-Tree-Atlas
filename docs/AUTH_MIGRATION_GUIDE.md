# Authentication System Migration Guide

**Status:** Planning Document  
**Last Updated:** 2026-01-18  
**Purpose:** Guide for migrating from Basic Auth to NextAuth.js with MFA support

## Overview

This guide documents the migration path from simple Basic Authentication to a comprehensive NextAuth.js-based authentication system with multi-factor authentication (MFA) support.

## Security

- **Audit logging** - All authentication events logged to the database
- **Rate limiting** - Protects login endpoint from brute-force attacks
- **Session management** - View and revoke active sessions (UI in progress)

## Features

### Current Implementation (Basic Auth)

- Single admin user
- HTTP Basic Authentication
- Password stored in environment variable
- Rate limiting (5 attempts per 15 minutes)
- HTTPS enforcement in production

### Planned Implementation (NextAuth + MFA)

- Multiple admin users with roles
- Database-backed authentication
- Multi-factor authentication (TOTP)
- Session management
- Audit logging
- Password requirements enforcement
- Backup codes for MFA recovery

## Migration Steps

### Step 1: Database Setup

Set up the Prisma schema for authentication:

```bash
# Install Prisma if not already installed
npm install --save-dev prisma
npm install @prisma/client

# Initialize Prisma
npx prisma init
```

Add the authentication schema to `prisma/schema.prisma`:

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  username      String    @unique
  passwordHash  String
  role          String    @default("admin")
  mfaEnabled    Boolean   @default(false)
  mfaSecrets    MfaSecret[]
  sessions      Session[]
  auditLogs     AuditLog[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model MfaSecret {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  totpSecret  String   // Encrypted with AES-256-GCM
  backupCodes String[] // Hashed with Argon2id
  createdAt   DateTime @default(now())
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  sessionToken String   @unique
  expires      DateTime
  ipAddress    String?
  userAgent    String?
  createdAt    DateTime @default(now())
  @@index([userId])
  @@index([sessionToken])
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  action    String
  details   Json?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  @@index([userId])
  @@index([createdAt])
}
```

### Step 2: Run Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create and run migrations
npx prisma migrate dev --name add-auth-tables

# View database (optional)
npx prisma studio
```

Opens GUI at http://localhost:5555 to view the database.

### Step 3: Create Initial Admin User

Use the admin setup script:

```bash
# Set up environment variables first
export ADMIN_EMAIL="admin@example.com"
export ADMIN_USERNAME="admin"
export ADMIN_PASSWORD="your-secure-password"

# Run the setup script
npm run setup:admin
```

Or manually create via Prisma Studio or a Node.js script:

```typescript
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/auth/password";

const prisma = new PrismaClient();

async function createAdmin() {
  const passwordHash = await hashPassword("your-secure-password");

  await prisma.user.create({
    data: {
      email: "admin@example.com",
      username: "admin",
      passwordHash,
      role: "admin",
      mfaEnabled: false,
    },
  });

  console.log("Admin user created successfully");
}

createAdmin();
```

### Step 4: Configure NextAuth

Install NextAuth.js:

```bash
npm install next-auth @next-auth/prisma-adapter
```

Create NextAuth configuration in `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "2FA Code", type: "text", optional: true },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
          include: { mfaSecrets: true },
        });

        if (!user) {
          throw new Error("Invalid credentials");
        }

        const isValidPassword = await verifyPassword(
          credentials.password,
          user.passwordHash
        );

        if (!isValidPassword) {
          throw new Error("Invalid credentials");
        }

        // If MFA is enabled, verify TOTP code
        if (user.mfaEnabled) {
          if (!credentials.totpCode) {
            throw new Error("MFA_REQUIRED");
          }

          // Verify using the dedicated MFA endpoint for consistency
          const mfaResponse = await fetch("/api/auth/mfa/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              totpCode: credentials.totpCode,
            }),
          });

          if (!mfaResponse.ok) {
            throw new Error("Invalid 2FA code");
          }
        }

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Step 5: Environment Variables

Add to `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tree_atlas"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# MFA Encryption (32 bytes, base64-encoded)
MFA_ENCRYPTION_KEY="generate-with-openssl-rand-base64-32"

# Legacy Basic Auth (optional, for backward compatibility)
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-legacy-password"
```

Generate secrets:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate MFA_ENCRYPTION_KEY  
openssl rand -base64 32
```

### Step 6: Create Admin Login Page

Create `src/app/[locale]/admin/login/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useParams<{ locale: string }>();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);

  // Get callback URL from query params or default to admin images
  const callbackUrl =
    searchParams.get("callbackUrl") || `/${locale}/admin/images`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        totpCode: mfaRequired ? totpCode : undefined,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "MFA_REQUIRED") {
          setMfaRequired(true);
          setError("Please enter your 2FA code");
        } else {
          setError("Invalid credentials. Please try again.");
        }
      } else if (result?.ok) {
        // Redirect to callback URL or default page
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Admin Login</h1>

        {error && (
          <div className="rounded bg-red-100 p-3 text-red-700">{error}</div>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full rounded border p-2"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded border p-2"
        />

        {mfaRequired && (
          <input
            type="text"
            placeholder="2FA Code"
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value)}
            required
            className="w-full rounded border p-2"
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
    </div>
  );
}
```

## Backward Compatibility

During the migration period:

- If `ADMIN_PASSWORD` is set, Basic Auth still works
- NextAuth session is checked **first** (preferred method)
- Basic Auth is checked as fallback (deprecated)
- Warning: Basic Auth will be removed in a future release

### Migration Path

1. **Phase 1** (Current): Basic Auth only
2. **Phase 2** (Transition): Both Basic Auth and NextAuth work
3. **Phase 3** (Future): NextAuth only, Basic Auth removed

## Security Considerations

### Password Hashing

- Use Argon2id for password hashing (not bcrypt or SHA-256)
- Argon2id is memory-hard and resistant to GPU/ASIC attacks
- Never store plaintext passwords

### MFA Implementation

- TOTP secrets encrypted with AES-256-GCM
- Backup codes hashed with Argon2id
- 30-second time window with ±1 step tolerance
- Rate limiting on verification attempts

### Session Security

- JWT-based sessions with 7-day expiry
- Secure session tokens (cryptographically random)
- Session revocation support
- IP address and user agent tracking

### Audit Logging

- All login attempts (success and failure)
- MFA setup and verification
- Password changes
- Session creation and revocation
- Admin actions

## Testing

### Test Authentication Flow

```bash
# Start development server
npm run dev

# Test login
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}'
```

### Test MFA Flow

1. Enable MFA for a user via admin panel
2. Scan QR code with authenticator app
3. Try logging in without 2FA code (should fail)
4. Try logging in with 2FA code (should succeed)
5. Test backup codes

## Rollback Plan

If issues occur during migration:

1. Remove NextAuth configuration
2. Restore Basic Auth in middleware
3. Remove database tables (if needed):
   ```bash
   npx prisma migrate reset
   ```

## Related Documentation

- [AUTH_IMPLEMENTATION_GUIDELINES.md](./AUTH_IMPLEMENTATION_GUIDELINES.md) - Proactive guidance
- [SECURITY.md](../SECURITY.md) - Security measures
- [SECURITY_SETUP.md](./SECURITY_SETUP.md) - Security scanning

## Support

For issues during migration:

1. Check environment variables are set correctly
2. Verify database migrations ran successfully
3. Check application logs for errors
4. Consult NextAuth.js documentation: https://next-auth.js.org/
