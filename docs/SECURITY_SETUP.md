# Security Setup Guide

**Last Updated:** 2026-01-12  
**Status:** ✅ Active - Multiple automated security scanners

## Automated Security Checks

This repository uses comprehensive automated security scanning:

### 1. Dependabot

- **Weekly scans** for vulnerable dependencies
- **Automatic PRs** for security updates
- **Grouped updates** for easier review

### 2. CodeQL Analysis

- **Static analysis** on every push/PR
- **Security queries** to detect vulnerabilities
- **Quality checks** for code patterns

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

1. Go to: **Settings → Security & analysis**
2. Enable:
   - ✅ Dependency graph
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates
   - ✅ Secret scanning
   - ✅ Secret scanning push protection
   - ✅ Code scanning (CodeQL)

### Configure Branch Protection

1. Go to: **Settings → Branches → Branch protection rules**
2. Add rule for `main`:
   - ✅ Require status checks before merging
   - ✅ Require "Security Checks" workflow to pass
   - ✅ Require "CodeQL" workflow to pass
   - ✅ Require branches to be up to date

### Local Development

Install pre-commit hooks:

```bash
npm install
npm run prepare
```

### Database Authentication Setup

The application uses Vercel Postgres with NextAuth.js for secure authentication. See [AUTH_MIGRATION_GUIDE.md](./AUTH_MIGRATION_GUIDE.md) for full migration details.

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

1. Navigate to `/admin/users` after logging in
2. Click "Enable MFA"
3. Scan QR code with authenticator app (Google Authenticator, Authy, etc.)
4. Enter TOTP code to verify
5. Save the 10 backup codes in a secure location

#### Security Best Practices

- **Never commit** `.env.local` to version control
- **Rotate secrets** regularly (every 90 days recommended)
- **Use strong passwords** (12+ characters, mixed case, numbers, special characters)
- **Enable MFA** for all admin accounts in production
- **Monitor audit logs** regularly at `/admin/users`
- **Sessions expire** after 7 days by default

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
[![CodeQL](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/workflows/CodeQL/badge.svg)](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/security/code-scanning)
```
