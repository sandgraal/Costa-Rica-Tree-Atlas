# Security Setup Guide

**Last Updated:** 2026-01-19  
**Status:** ⚠️ Partially Active - Automated scanners work, authentication needs fixes  
**Related:** See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) Priority 0.1 for auth fixes

## Implementation Status

### ✅ Fully Operational

- **Automated security workflows** - `security.yml` runs weekly and on push/PR
- **NPM audit** - Checks for vulnerable dependencies
- **TruffleHog secret scanning** - Detects committed secrets
- **CodeQL analysis** - Static application security testing (SAST)
- **ESLint security rules** - Code quality and security patterns
- **License compliance** - Dependency license checking
- **Database schema** - Prisma with User, Session, MFASecret, AuditLog models
- **Password hashing** - Argon2id implementation complete
- **Admin setup scripts** - `setup-first-admin.mjs` and API endpoint `/api/admin/setup`
- **JWT error logging** - Non-sensitive, rate-limited logging for operational diagnostics

### ⚠️ Needs Fixes (Priority 0.1)

**Authentication System Issues:**

- NextAuth JWT strategy configured but session management broken
- `getSessionFromRequest` in middleware not working properly
- MFA TOTP secret encryption/decryption incomplete
- Session persistence unreliable
- Basic Auth fallback still present (deprecated, should be removed)

**See:** [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) Priority 0.1 for detailed fix plan

### ❌ Not Implemented

- CodeQL workflow as separate file (integrated into `security.yml` instead)
- GitHub branch protection rules (needs manual setup)
- Pre-commit hooks (optional, not configured)

---

## Automated Security Checks

This repository uses comprehensive automated security scanning via `.github/workflows/security.yml`:

### 1. Dependabot

- **Weekly scans** for vulnerable dependencies
- **Automatic PRs** for security updates
- **Grouped updates** for easier review

### 2. CodeQL Analysis

- **Static analysis** on every push/PR (part of `security.yml` workflow)
- **Custom configuration** in `.github/codeql/codeql-config.yml`
- **Security queries** to detect vulnerabilities
- **Quality checks** for code patterns
- **Results** uploaded to GitHub Security tab

### 3. Secret Scanning

- **TruffleHog** scans for committed secrets
- **Pre-commit hooks** prevent accidental commits
- **Verified secrets** flagged immediately

### 4. ESLint Security Rules

- **Security anti-patterns** detected
- **No hardcoded secrets** enforcement
- **React security** best practices

### 5. License Compliance

- **Dependency licenses** checked
- **GPL licenses** blocked
- **Legal compliance** ensured

## Setup Instructions

### Enable GitHub Security Features

**Already Configured:**

- ✅ **Security workflow** - `.github/workflows/security.yml` runs automatically
- ✅ **CodeQL config** - `.github/codeql/codeql-config.yml` defines analysis scope

**Manual Setup Required:**

1. Go to: **Settings → Security & analysis**
2. Enable:
   - ⬜ Dependency graph (if not auto-enabled)
   - ⬜ Dependabot alerts
   - ⬜ Dependabot security updates
   - ⬜ Secret scanning (if private repo)
   - ⬜ Secret scanning push protection
   - ⬜ Code scanning results (auto-uploaded by workflow)

### Configure Branch Protection (Recommended)

**Status:** Not yet configured (manual setup required)

1. Go to: **Settings → Branches → Branch protection rules**
2. Add rule for `main`:
   - ⬜ Require status checks before merging
   - ⬜ Require "Security Checks" workflow to pass (includes CodeQL)
   - ⬜ Require branches to be up to date
   - ⬜ Require pull request reviews before merging

**Note:** The `security.yml` workflow combines all security checks into one job, so you only need to require the "Security Checks" status.

### Local Development

**Pre-commit hooks:** Currently not configured. The `prepare` script exists but doesn't set up Git hooks.

To run security checks locally:

```bash
# Install dependencies
npm install

# Run ESLint security checks
npm run lint

# Run NPM audit
npm audit

# Type check
npm run type-check
```

### Database Authentication Setup

**⚠️ CRITICAL:** Authentication system has known issues. See Priority 0.1 in [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)

The application uses PostgreSQL with NextAuth.js for secure authentication.

**Known Issues:**

- Session management not working properly
- JWT verification incomplete in middleware
- MFA secret encryption/decryption missing
- Login flow may fail despite correct credentials

**Current State:**

- ✅ Database schema complete (User, Session, MFASecret, AuditLog)
- ✅ Password hashing with Argon2id works
- ✅ Admin setup endpoint functional (`/api/admin/setup`)
- ⚠️ Session persistence broken
- ⚠️ Middleware authentication unreliable

See [AUTH_MIGRATION_GUIDE.md](./AUTH_MIGRATION_GUIDE.md) for migration details (may be outdated).

#### Prerequisites

1. **Vercel Postgres Database**
   - Create a Postgres database in your Vercel project
   - Or use a local PostgreSQL instance for development

2. **Generate Security Keys**

```bash
# Generate NextAuth secret (32 bytes)
openssl rand -hex 32

# Generate MFA encryption key (32 bytes)
openssl rand -hex 32
```

#### Environment Variables

Add to `.env.local`:

```env
# Database Connection
DATABASE_URL="postgres://user:password@host:5432/dbname"

# NextAuth Configuration
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# MFA Encryption Key (32-byte hex string)
MFA_ENCRYPTION_KEY="your-generated-key-here"

# Legacy Basic Auth (optional fallback)
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-password"
```

#### Database Setup

1. **Generate Prisma Client**

```bash
npx prisma generate
```

2. **Create Database Tables**

```bash
# For development (push schema without migrations)
npx prisma db push

# For production (create migration)
npx prisma migrate deploy
```

3. **Verify Database Connection**

```bash
npx prisma studio  # Opens database admin UI at http://localhost:5555
```

#### Create First Admin User

**Method 1: Using Setup Script (Recommended)**

```bash
node scripts/setup-first-admin.mjs
```

**Method 2: Using API Endpoint**

1. Start the development server:

```bash
npm run dev
```

2. Call the one-time setup API:

```bash
curl -X POST http://localhost:3000/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "YourSecurePassword123!",
    "name": "Admin User"
  }'
```

> **Note:** The setup endpoint is automatically disabled after creating the first user.

#### Enable MFA (Optional but Recommended)

**⚠️ WARNING:** MFA implementation incomplete. TOTP secret encryption/decryption not fully implemented.

**When authentication is fixed:**

1. Navigate to `/admin/users` after logging in
2. Click "Enable MFA"
3. Scan QR code with authenticator app (Google Authenticator, Authy, etc.)
4. Enter TOTP code to verify
5. Save the 10 backup codes in a secure location

**Current Issues:**

- Secret encryption/decryption incomplete (see `src/app/api/auth/[...nextauth]/route.ts` line 89)
- Backup code verification not implemented
- MFA flow may not work end-to-end

#### Security Best Practices

- **Never commit** `.env.local` to version control
- **Rotate secrets** regularly (every 90 days recommended)
- **Use strong passwords** (12+ characters, mixed case, numbers, special characters)
- ⚠️ **Enable MFA** for all admin accounts in production (once implementation complete)
- **Monitor audit logs** regularly at `/admin/users` (if accessible)
- **Sessions expire** after 7 days by default (when session management is fixed)
- ⚠️ **Test authentication** thoroughly before production deployment
- **Fix Priority 0.1 issues** before relying on auth system

## Monitoring

### Weekly Tasks

- Review Dependabot PRs
- Check CodeQL findings
- Verify secret scan results

### Monthly Tasks

- Review security workflow results
- Update security documentation
- Audit dependencies manually

## Security Badges

Add to README.md:

```markdown
[![Security Checks](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/workflows/Security%20Checks/badge.svg)](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/actions)
```

**Note:** CodeQL is integrated into the Security Checks workflow, not a separate workflow.

## Files Reference

**Workflows:**

- `.github/workflows/security.yml` - Main security workflow (NPM audit, secret scan, CodeQL, ESLint, license check)
- `.github/codeql/codeql-config.yml` - CodeQL analysis configuration

**Authentication:**

- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth configuration (needs fixes)
- `src/lib/auth/session.ts` - Session management with JWT error logging
- `src/lib/auth/jwt-error-logger.ts` - Rate-limited JWT verification error logging
- `middleware.ts` - Auth middleware with Basic Auth fallback (needs cleanup)
- `prisma/schema.prisma` - Database schema (complete)
- `scripts/setup-first-admin.mjs` - Admin user setup script
- `src/app/api/admin/setup/route.ts` - One-time setup API endpoint

**Security Libraries:**

- `src/lib/auth/constant-time-ratelimit.ts` - Rate limiting
- `src/lib/auth/secure-compare.ts` - Constant-time string comparison
- `src/lib/auth/mfa-crypto.ts` - MFA encryption (incomplete)
- `src/lib/security/csp.ts` - Content Security Policy headers

## JWT Error Logging

**Status:** ✅ Fully Operational (as of 2026-02-07)

The application now includes non-sensitive, rate-limited logging for JWT verification errors.

### Features

- **Rate-limited logging**: Prevents log spam by limiting each error type to 1 log per 60 seconds
- **Non-sensitive error extraction**: Classifies JWT errors without leaking tokens or payloads
- **DEBUG mode support**: Bypasses rate limiting when `DEBUG=true` or `NODE_ENV=development`
- **Sentry integration**: Sends sanitized errors to production monitoring

### Error Types Detected

- `JWT_EXPIRED` - Token has expired
- `INVALID_SIGNATURE` - Token signature verification failed
- `MALFORMED_TOKEN` - Token is malformed or cannot be parsed
- `INVALID_TOKEN` - Token is invalid

### Configuration

Enable verbose logging by setting the `DEBUG` environment variable:

```env
# In .env.local for development debugging
DEBUG=true
```

Or rely on automatic debug mode in development:

```bash
NODE_ENV=development npm run dev
```

### Security Guarantees

✅ **No JWT tokens logged** - Token values are never included in logs  
✅ **No payload data logged** - User data from JWT payloads is sanitized  
✅ **Rate limited** - Prevents attackers from flooding logs  
✅ **Production monitoring** - Integrates with Sentry for operational visibility

### Testing

Run comprehensive tests:

```bash
# JWT error logging unit tests
npm test -- tests/security/jwt-error-logging.test.ts

# Integration tests with session module
npm test -- tests/security/session-error-logging-integration.test.ts

# All security tests
npm test -- tests/security/
```

### Files

- `src/lib/auth/jwt-error-logger.ts` - Main logging utility
- `src/lib/auth/session.ts` - Integration with JWT verification
- `tests/security/jwt-error-logging.test.ts` - Unit tests (20 tests)
- `tests/security/session-error-logging-integration.test.ts` - Integration tests (4 tests)
