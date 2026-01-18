# Authentication System Migration Guide

## Overview

Costa Rica Tree Atlas has migrated from HTTP Basic Authentication to a modern, database-backed authentication system using NextAuth.js, Vercel Postgres, and Argon2id password hashing.

## 🚀 New Features

### Authentication

- **Database-backed user management** - User accounts stored in Postgres
- **Argon2id password hashing** - Memory-hard, GPU-resistant hashing algorithm
- **JWT session management** - Secure, stateless sessions (7-day expiry)
- **Modern login UI** - Clean, responsive admin login page
- **MFA/TOTP support** - Two-factor authentication ready (implementation in progress)

### Security

- **Audit logging** - All authentication events logged to database
- **Rate limiting** - Protects login endpoint from brute-force attacks
- **Session management** - View and revoke active sessions (UI in progress)
- **Constant-time operations** - Timing-attack resistant authentication

## 📋 Prerequisites

1. **Vercel Postgres Database**
   - Sign up at [Vercel Storage](https://vercel.com/docs/storage/vercel-postgres)
   - Create a new Postgres database
   - Copy the `DATABASE_URL` connection string

2. **Environment Variables**

   ```bash
   # Required
   DATABASE_URL="postgres://..."
   NEXTAUTH_SECRET="<generate-with-openssl-rand-hex-32>"
   NEXTAUTH_URL="http://localhost:3000"  # Your site URL

   # Optional (for MFA)
   MFA_ENCRYPTION_KEY="<generate-with-openssl-rand-hex-32>"
   ```

## 🔧 Setup Instructions

### Step 1: Install Dependencies

Already done in this branch! Dependencies installed:

- `@vercel/postgres` - Vercel Postgres client
- `next-auth@^4.24.10` - NextAuth.js authentication
- `@next-auth/prisma-adapter` - Prisma adapter for NextAuth
- `@prisma/client` - Prisma ORM client
- `prisma` - Prisma CLI (dev dependency)
- `argon2` - Argon2id password hashing
- `otplib` - TOTP generation for MFA
- `qrcode` - QR code generation for MFA setup

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Generate secrets:

   ```bash
   # Generate NEXTAUTH_SECRET
   openssl rand -hex 32

   # Generate MFA_ENCRYPTION_KEY
   openssl rand -hex 32
   ```

3. Fill in `.env.local`:
   ```env
   DATABASE_URL="your-vercel-postgres-url"
   NEXTAUTH_SECRET="generated-secret-from-step-2"
   NEXTAUTH_URL="http://localhost:3000"
   MFA_ENCRYPTION_KEY="generated-key-from-step-2"
   ```

### Step 3: Initialize Database

1. Generate Prisma client:

   ```bash
   npx prisma generate
   ```

2. Push schema to database:

   ```bash
   npx prisma db push
   ```

   Or use migrations (recommended for production):

   ```bash
   npx prisma migrate dev --name init
   ```

3. Verify tables created:
   ```bash
   npx prisma studio
   ```
   Opens GUI at http://localhost:5555 to view the database.

### Step 4: Create Initial Admin User

**One-Time Setup API (Self-Disabling)**

1. Start dev server:

   ```bash
   npm run dev
   ```

2. Call setup endpoint:

   ```bash
   curl -X POST http://localhost:3000/api/admin/setup \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "password": "YourStrongPassword123!",
       "name": "Admin"
     }'
   ```

   **Password Requirements:**
   - Minimum 12 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character

3. Expected response:

   ```json
   {
     "success": true,
     "message": "Admin user created successfully",
     "user": {
       "id": "clx...",
       "email": "admin@example.com",
       "name": "Admin"
     }
   }
   ```

4. **Important**: This endpoint self-disables after creating the first user. Subsequent calls return 403.

### Step 5: Test Login

1. Navigate to: `http://localhost:3000/en/admin/login`

2. Enter your admin credentials

3. On successful login, you'll be redirected to `/admin/images`

## 🔐 Security Features

### Password Hashing

- **Algorithm**: Argon2id (type 2)
- **Memory cost**: 19456 KiB (19 MiB)
- **Time cost**: 2 iterations
- **Parallelism**: 1 thread
- **Output**: 32-byte hash

### Session Management

- **Strategy**: JWT (JSON Web Tokens)
- **Duration**: 7 days
- **Storage**: Secure HTTP-only cookies
- **Refresh**: No automatic refresh (re-login required after expiry)

### Audit Logging

All authentication events are logged to the `audit_logs` table:

- `login` - Successful login
- `login_failed` - Failed login attempt (with reason)
- `logout` - User logout
- `admin_setup` - Initial admin creation
- `password_changed` - Password update
- `mfa_enabled` - MFA enrollment
- `mfa_disabled` - MFA removal

### Rate Limiting

- **Login attempts**: 5 per 15 minutes per IP
- **Endpoint**: `/admin/login` (via middleware)
- **Storage**: Redis (Upstash) or in-memory fallback

## 🔄 Migration from HTTP Basic Auth

### Backward Compatibility

The middleware includes a **temporary fallback** to HTTP Basic Auth:

- If `ADMIN_PASSWORD` is set, Basic Auth still works
- NextAuth session is checked **first** (preferred method)
- Basic Auth is checked as fallback (deprecated)
- Warning: Basic Auth will be removed in a future release

### Migration Path

1. **Deploy this branch** with both auth methods enabled
2. **Test NextAuth login** thoroughly
3. **Remove `ADMIN_PASSWORD`** from environment variables
4. **Re-deploy** - now only NextAuth works

### Rollback Plan

If issues arise:

1. Set `ADMIN_PASSWORD` in environment variables
2. Re-deploy
3. HTTP Basic Auth will work again (session check gracefully fails)

## 📊 Database Schema

### Users Table

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT NOT NULL,  -- Argon2id hash
  email_verified TIMESTAMP,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Sessions Table

```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Audit Logs Table

```sql
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### MFA Secrets Table

```sql
CREATE TABLE mfa_secrets (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  totp_secret TEXT,  -- Encrypted with MFA_ENCRYPTION_KEY
  backup_codes TEXT[],  -- Array of hashed backup codes
  backup_codes_used INTEGER[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🛠️ Development Workflow

### View Database

```bash
npx prisma studio
```

### Reset Database (Development Only)

```bash
npx prisma migrate reset
```

### Generate Prisma Client (After Schema Changes)

```bash
npx prisma generate
```

### Run Migrations (Production)

```bash
npx prisma migrate deploy
```

## 🚧 Work in Progress

### MFA Implementation (Not Yet Complete)

- [ ] MFA enrollment API (`/api/auth/mfa/setup`)
- [ ] MFA verification API (`/api/auth/mfa/verify`)
- [ ] Backup code generation
- [ ] QR code display for TOTP setup
- [ ] Recovery code download

### Admin UI (Not Yet Complete)

- [ ] User management page (`/admin/users`)
- [ ] Audit log viewer
- [ ] Active session management
- [ ] Password reset flow
- [ ] User invitation system

## 📝 API Endpoints

### Authentication

#### POST `/api/admin/setup`

Create initial admin user (one-time only).

**Request:**

```json
{
  "email": "admin@example.com",
  "password": "StrongPassword123!",
  "name": "Admin"
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Admin user created successfully",
  "user": {
    "id": "clx...",
    "email": "admin@example.com",
    "name": "Admin"
  }
}
```

**Response (Already Setup):**

```json
{
  "error": "Setup has already been completed",
  "message": "Admin user already exists. This endpoint is disabled."
}
```

#### POST `/api/auth/signin`

NextAuth-provided endpoint for login.

#### POST `/api/auth/signout`

NextAuth-provided endpoint for logout.

#### GET `/api/auth/session`

Get current session.

## 🔍 Troubleshooting

### "Admin user already exists"

The setup endpoint has already been called. Cannot create another admin via this endpoint. Options:

1. Use Prisma Studio to manage users directly
2. Create additional admin management API
3. Reset database (dev only): `npx prisma migrate reset`

### "Invalid credentials"

Check:

1. Email address is correct (case-sensitive)
2. Password is correct
3. Audit logs table for failed login reason

### "Authentication required" but correct credentials

Check:

1. `NEXTAUTH_SECRET` is set and matches between deployments
2. Cookies are enabled in browser
3. `NEXTAUTH_URL` matches your actual site URL
4. JWT token hasn't expired (7-day max)

### Database connection errors

Check:

1. `DATABASE_URL` is correct and accessible
2. Database exists and tables are created (`npx prisma db push`)
3. Vercel Postgres database is not paused (free tier auto-pauses)

## 📚 Further Reading

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Argon2 Specification](https://www.rfc-editor.org/rfc/rfc9106.html)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

## 🤝 Contributing

When working on authentication features:

1. Test with real database (not mocked)
2. Check audit logs after changes
3. Verify session expiry behavior
4. Test rate limiting
5. Review security implications
6. Update this README if adding new auth features

## ⚠️ Security Notes

1. **Never commit `.env.local`** - Contains sensitive secrets
2. **Rotate secrets regularly** - Especially after team changes
3. **Monitor audit logs** - Watch for suspicious activity
4. **Test in staging first** - Don't test auth changes in production
5. **Keep dependencies updated** - Security patches for auth libraries

---

**Last Updated**: January 18, 2026  
**Branch**: `feature/postgres-auth-mfa`  
**Status**: Core authentication complete, MFA in progress
