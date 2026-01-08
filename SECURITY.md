# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Costa Rica Tree Atlas seriously. If you believe you have found a security vulnerability, please report it to us responsibly.

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to [your-security-email@example.com](mailto:your-security-email@example.com).

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information in your report:

- Type of vulnerability
- Full paths of affected source file(s)
- Location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## Security Measures

This project implements the following security measures:

### Rate Limiting

Rate limiting is enforced on all API endpoints to prevent abuse, protect external service costs, and maintain system availability. All limits are applied **per IP address** using a sliding window algorithm.

#### Production vs Development

- **Production**: Rate limits are persisted in Upstash Redis, surviving server restarts and scaling across multiple instances
- **Development**: Rate limiting is disabled by default for easier local testing. To enable rate limiting in development, configure Upstash Redis environment variables.

#### Rate Limit Configuration

| Endpoint              | Limit        | Window     | Rationale                                                              |
| --------------------- | ------------ | ---------- | ---------------------------------------------------------------------- |
| `/api/identify`       | 10 requests  | 1 hour     | AI image identification uses Plant.id paid API - expensive per request |
| `/api/species`        | 60 requests  | 1 minute   | Species biodiversity data from iNaturalist - moderate usage allowed    |
| `/api/species/images` | 30 requests  | 1 minute   | Image fetching from iNaturalist - bandwidth-intensive                  |
| `/api/species/random` | 100 requests | 1 minute   | Random tree selection - lightweight operation                          |
| Other API endpoints   | 100 requests | 1 minute   | Default limit for general API endpoints                                |
| Admin authentication  | 5 attempts   | 15 minutes | Strict limit to prevent brute-force attacks                            |

#### Atomic Operations

Rate limiting uses atomic Redis operations via the `@upstash/ratelimit` library with sliding window algorithm:

- **Ephemeral cache disabled** - All rate limit checks go directly to Redis, ensuring consistency across serverless instances
- **Sliding window algorithm** - More accurate than fixed windows, prevents burst traffic at window boundaries
- **No race conditions** - Atomic INCR operations prevent concurrent requests from bypassing limits
- **Analytics enabled** - Tracks rate limit hits for monitoring and optimization

**Why ephemeral cache is disabled:**

- Ephemeral cache can cause race conditions in serverless environments where multiple instances run concurrently
- Disabling it ensures every rate limit check is atomic and consistent across all instances
- Slightly increases Redis load but eliminates security vulnerabilities from non-atomic operations

#### Rate Limit Headers

All API responses include standard rate limit headers:

- `X-RateLimit-Limit`: Maximum number of requests allowed in the window
- `X-RateLimit-Remaining`: Number of requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when the rate limit resets

When rate limit is exceeded (429 response):

- `Retry-After`: Number of seconds until the client can retry

#### Configuring Upstash Redis

For production rate limiting that persists across deployments:

```bash
# Sign up at https://upstash.com and create a Redis database
# Add these environment variables:
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

#### IP Address Detection

Rate limits use the most reliable IP address available, with strict validation to prevent injection attacks and IP spoofing:

1. **x-real-ip** header (set by Vercel in production) - most trusted
2. **x-forwarded-for** with **trusted proxy validation** - validates proxy chain
3. **cf-connecting-ip** header (only if request is from Cloudflare) - validated fallback
4. Fallback to **"unknown"** if no valid IP found

**Security rationale:**

- **x-real-ip** is set by our trusted reverse proxy (Vercel) and cannot be spoofed by clients
- **cf-connecting-ip** is only trusted if the rightmost x-forwarded-for IP is from Cloudflare (prevents spoofing)
- For **x-forwarded-for**, we validate the proxy chain from right to left:
  - We check each IP against known trusted proxy ranges (Cloudflare, Vercel)
  - We skip trusted proxy IPs to find the actual client IP
  - This prevents IP spoofing even if the proxy chain includes attacker-controlled IPs
- All IP addresses are validated against proper IPv4 and IPv6 formats to prevent injection attacks
- Invalid or missing IPs are marked as **"unknown"** and receive the strictest rate limits

**Trusted Proxy Ranges:**

The application maintains a list of trusted proxy IP ranges in `src/lib/ratelimit/trusted-proxies.ts`:

- **Cloudflare IPv4**: 173.245.48.0/20, 103.21.244.0/22, 104.16.0.0/13, etc.
- **Cloudflare IPv6**: 2400:cb00::/32, 2606:4700::/32, 2803:f800::/32, etc.
- **Vercel IPv4**: 76.76.21.0/24, etc.

**Updating Trusted Proxy Ranges:**

IP ranges should be updated periodically from official sources:

- Cloudflare: https://www.cloudflare.com/ips/
- Vercel: https://vercel.com/docs/edge-network/regions

To update, edit `src/lib/ratelimit/trusted-proxies.ts` and modify the `TRUSTED_PROXY_RANGES` constant.

**IPv6 Handling:**

- IPv6 addresses are normalized to /64 subnets (e.g., `2001:0db8:85a3:0000::/64`)
- This groups mobile users on the same network who frequently rotate IPv6 addresses
- Prevents legitimate mobile users from appearing as different users with each IP rotation
- Balances security (prevents abuse) with usability (doesn't over-restrict mobile users)

### Admin Authentication

Admin routes (`/admin/*`) require Basic Authentication with the following security measures:

- **HTTPS enforcement** - Admin routes require HTTPS in production environments
- **Rate limiting** - 5 attempts per 15 minutes per IP address to prevent brute force attacks
- **Constant-time comparison** - Prevents timing attacks on password verification
- **Configurable username** - Set via `ADMIN_USERNAME` environment variable (defaults to "admin")
- **Strong password required** - Set via `ADMIN_PASSWORD` environment variable
- **Persistent rate limiting** - Uses Upstash Redis in production for rate limits that persist across server restarts

#### Setting Admin Password

Generate a strong password:

```bash
# Generate a 32-character password
openssl rand -base64 32
```

Set in environment variables:

```bash
# For Vercel deployment
vercel env add ADMIN_PASSWORD

# For local development (.env.local)
echo "ADMIN_PASSWORD=your_generated_password" > .env.local
echo "ADMIN_USERNAME=your_custom_username" >> .env.local
```

#### Security Best Practices

1. **Use strong passwords** - At least 32 characters, generated randomly
2. **Rotate passwords regularly** - Every 90 days recommended
3. **Never commit credentials** - Keep `.env` and `.env.local` files gitignored
4. **Monitor failed attempts** - Review logs for suspicious activity
5. **Use Upstash Redis** - For production rate limiting that persists across deployments
6. **Use non-obvious usernames** - Don't use "admin" in production

#### Timing Attack Protection

All authentication comparisons use `crypto.timingSafeEqual` to prevent timing attacks:

- **Constant-time comparison**: Takes the same time regardless of input, preventing attackers from measuring response times to guess credentials character-by-character
- **No early exit**: Always compares full strings even on mismatch, eliminating timing side-channels
- **No username enumeration**: Both username and password are always checked before returning any error, preventing attackers from determining valid usernames by timing differences
- **Native crypto module**: Uses Node.js's built-in `timingSafeEqual` which is implemented in C++ and provides constant-time guarantees at the native level

**Why This Matters**

Without constant-time comparison, attackers can:

1. Measure response times to guess passwords character-by-character
2. Determine valid usernames by timing differences
3. Reduce brute-force time from O(n^m) to O(n\*m) where n is the character set size and m is the password length
4. Bypass rate limiting by detecting invalid credentials early

**Implementation Details**

The `secureCompare` function in `src/lib/auth/secure-compare.ts`:

- Converts strings to buffers for use with `crypto.timingSafeEqual`
- For different-length strings, performs a dummy comparison to maintain constant time
- Never short-circuits or returns early based on input characteristics
- Provides additional helper functions for hashing and comparing hashed values

### API Security

- **CSRF Protection** - Origin validation for state-changing operations (POST, PUT, DELETE requests)
  - Validates `Origin` and `Referer` headers against allowed origins
  - Default allowed origins: `https://costaricatreeatlas.com`, `https://www.costaricatreeatlas.com`
  - Additional origins configurable via `ALLOWED_ORIGINS` environment variable
  - Development mode allows configurable localhost origins via `DEV_ALLOWED_ORIGINS` (defaults to `localhost:3000`, `127.0.0.1:3000`, `localhost:3001`)
  - Returns 403 Forbidden for requests from unauthorized origins
  - No bypass: All requests must have valid origin or referer header, even in development
- Rate limiting on API endpoints that call external paid services
- Input validation and sanitization
- File upload size and type restrictions
- No sensitive data in API responses
- AI identification feature disabled by default (requires explicit opt-in)

#### Configuring Allowed Origins

To add additional allowed origins for CSRF protection:

```bash
# Production origins (in .env.local or deployment environment)
ALLOWED_ORIGINS=https://costaricatreeatlas.org,https://app.costaricatreeatlas.com

# Development origins (optional, in .env.local)
# Defaults: http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001
DEV_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
```

Multiple origins should be comma-separated. Production origins will be combined with the default allowed origins. Development origins are only used when `NODE_ENV=development`.

### HTTP Security Headers

- Strict-Transport-Security (HSTS)
- Content-Security-Policy (CSP) with strict directives
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy (camera, microphone, geolocation disabled)
- upgrade-insecure-requests directive

### Content Security Policy (CSP)

This application implements **two Content Security Policy configurations** with nonce-based inline scripts to prevent XSS attacks and other code injection vulnerabilities.

#### Two-Policy Architecture

1. **Strict CSP (Default)** - Used for all pages by default
2. **Relaxed CSP** - Used only for specific marketing pages requiring Google Tag Manager

This separation allows the application to maintain strong security on most pages while supporting GTM on specific marketing/analytics pages.

#### Key Security Features

✅ **NO `unsafe-eval` in production** (except on /marketing/\* pages) - Prevents arbitrary code execution  
✅ **NO `unsafe-inline` for scripts** - All inline scripts require cryptographic nonces  
✅ **Per-request nonces** - Unique cryptographic nonces generated for each request with collision detection  
✅ **`strict-dynamic`** - Nonce-approved scripts can dynamically load other scripts  
✅ **Specific domains** - No wildcard domains that could allow unauthorized CDNs  
✅ **Automatic nonce cleanup** - In-memory nonce tracking prevents memory leaks

#### Strict CSP (Default Policy)

Used on all pages except `/en/marketing/*` and `/es/marketing/*`.

**script-src**:

- `'self'` - Scripts from same origin
- `'nonce-{random}'` - Inline scripts with per-request nonces
- `'strict-dynamic'` - Nonce-approved scripts can load other scripts
- Privacy-friendly analytics: `https://plausible.io`, `https://scripts.simpleanalyticscdn.com`
- `https:` - Fallback for browsers that don't support `strict-dynamic`
- **Development only**: `'unsafe-eval'` (required for Next.js hot reloading)
- **Production**: NO `unsafe-eval` or `unsafe-inline` ✅

#### Relaxed CSP (Marketing Pages Only)

Used only on `/en/marketing/*` and `/es/marketing/*` routes.

**script-src**:

- All sources from Strict CSP, plus:
- `https://www.googletagmanager.com` - Google Tag Manager
- `https://www.google-analytics.com` - Google Analytics
- `'unsafe-eval'` - Required by GTM (security trade-off)

**Additional sources**:

- **img-src**: Adds `https://www.google-analytics.com`, `https://www.googletagmanager.com`
- **connect-src**: Adds `https://www.google-analytics.com`, `https://www.googletagmanager.com`

#### Common CSP Directives (Both Policies)

- **default-src**: `'self'` - Only load resources from the same origin

- **style-src**:
  - `'self'` - Stylesheets from same origin
  - `'nonce-{random}'` - Inline styles with per-request nonces
  - `https://fonts.googleapis.com` - Google Fonts
  - `'unsafe-inline'` - TODO: Remove after extracting critical CSS

- **img-src**:
  - `'self'`, `data:`, `blob:` - Local and data URLs
  - `https://static.inaturalist.org` - iNaturalist images
  - `https://inaturalist-open-data.s3.amazonaws.com` - iNaturalist S3 bucket
  - `https://api.gbif.org` - GBIF biodiversity images

- **font-src**: `'self'`, `https://fonts.gstatic.com` - Google Fonts

- **connect-src**:
  - `'self'` - Same origin connections
  - Biodiversity APIs: `https://api.gbif.org`, `https://api.inaturalist.org`
  - Privacy-friendly analytics: `https://plausible.io`, `https://queue.simpleanalyticscdn.com`

- **frame-src**: `'self'` - Only embed frames from same origin
- **object-src**: `'none'` - No plugins (Flash, Java, etc.)
- **base-uri**: `'self'` - Restrict base tag URLs
- **form-action**: `'self'` - Forms can only submit to same origin
- **frame-ancestors**: `'self'` - Can only be embedded by same origin
- **upgrade-insecure-requests** - Automatically upgrade HTTP to HTTPS

#### Nonce-Based CSP Implementation

The application generates cryptographically secure nonces for every request with collision detection:

```typescript
// In middleware (generates nonce per request)
import { generateNonce, buildCSP, buildRelaxedCSP } from "@/lib/security/csp";

const nonce = generateNonce(); // Unique 16-byte base64 nonce with collision detection

// Use appropriate CSP based on route
const csp = pathname.match(/^\/(en|es)\/marketing\//)
  ? buildRelaxedCSP(nonce) // Marketing pages: allows GTM
  : buildCSP(nonce); // Default: strict, no unsafe-eval

response.headers.set("Content-Security-Policy", csp);
response.headers.set("X-Nonce", nonce); // Pass to pages
```

Components receive nonces from the middleware via headers:

```typescript
// In server components
import { headers } from "next/headers";

const headersList = await headers();
const nonce = headersList.get("x-nonce") || undefined;

// Use nonce in inline scripts
<script nonce={nonce}>...</script>
```

#### CSP Violation Reporting

CSP violations can be monitored to detect potential attacks or misconfigurations.

To enable CSP violation reporting, set the `CSP_REPORT_URI` environment variable:

```bash
CSP_REPORT_URI=/api/csp-report
```

Violations will be sent to the configured endpoint with:

- Document URI where the violation occurred
- Violated directive
- Blocked URI
- Source file and line number
- Timestamp

#### Nonce Collision Detection

The nonce generation system includes collision detection and automatic cleanup:

**Collision Detection:**

- Each nonce is checked against recently used nonces before being returned
- If a collision is detected (extremely rare), up to 3 attempts are made to generate a unique nonce
- Multiple collisions trigger a warning log (indicates possible PRNG issues)

**Automatic Cleanup:**

- Recent nonces are tracked in-memory with timestamps for collision detection
- Nonces older than 1 minute are cleaned up on each generateNonce() call
- Full cleanup of the nonce map occurs every 5 minutes to prevent memory leaks
- No setTimeout in serverless environment - cleanup happens during next request
- No persistent storage - all tracking is in-memory only

**Monitoring:**

Watch application logs for nonce collision warnings:

```
⚠️ Multiple nonce collisions detected - possible PRNG issue
```

If this warning appears:

1. Check server entropy sources
2. Verify Web Crypto API is functioning correctly
3. Consider investigating potential PRNG compromise
4. Monitor frequency - single occurrences can be ignored, repeated warnings require investigation

#### Development vs Production

- **Development**: Includes `'unsafe-eval'` for Next.js hot reloading and development features
- **Production Strict CSP**: **NO `unsafe-eval`** or `unsafe-inline` for scripts - used on all pages except marketing
- **Production Relaxed CSP**: Includes `'unsafe-eval'` for GTM - used only on `/marketing/*` routes

#### Testing CSP Compatibility

The CSP configuration has been tested with:

- ✅ Next.js 16 (App Router with Edge Runtime)
- ✅ Plausible Analytics (with nonces)
- ✅ Simple Analytics (with nonces)
- ✅ JSON-LD structured data (with nonces)
- ✅ Tailwind CSS 4
- ✅ Image optimization (next/image)
- ✅ Web Crypto API (Edge Runtime compatible)

#### Verifying CSP in Production

Check CSP headers on different routes:

**For regular pages (strict CSP):**

```bash
curl -I https://costaricatreeatlas.com/en | grep -i content-security-policy
```

Should show:

- ✅ `'nonce-{random}'` in script-src
- ✅ `'strict-dynamic'` in script-src
- ✅ NO `'unsafe-eval'` in script-src (strict policy)
- ✅ Specific domain names (no wildcards like `*.plausible.io`)
- ✅ Privacy-friendly analytics only (Plausible, Simple Analytics)

**For marketing pages (relaxed CSP):**

```bash
curl -I https://costaricatreeatlas.com/en/marketing/landing | grep -i content-security-policy
```

Should show:

- ✅ `'nonce-{random}'` in script-src
- ✅ `'strict-dynamic'` in script-src
- ✅ `'unsafe-eval'` in script-src (required for GTM)
- ✅ GTM domains: `https://www.googletagmanager.com`, `https://www.google-analytics.com`

**Testing CSP with different analytics providers:**

1. **Plausible Analytics** (works with strict CSP) - No unsafe-eval needed
2. **Simple Analytics** (works with strict CSP) - No unsafe-eval needed
3. **Google Tag Manager** (requires relaxed CSP) - Needs unsafe-eval, use only on /marketing/\* routes

### Environment Variables

#### Environment Variable Security

All environment variables are validated at build time using Zod schemas to ensure security and prevent misconfigurations.

#### Required Variables

**Production deployments MUST set:**

- `ADMIN_PASSWORD` - Min 12 chars with uppercase, lowercase, number, and special character
- `UPSTASH_REDIS_REST_URL` - For persistent rate limiting
- `UPSTASH_REDIS_REST_TOKEN` - Redis authentication

#### Generating Secure Secrets

```bash
npm run generate:secrets
```

This generates cryptographically secure passwords. Copy the output to `.env.local`.

#### Validation

The app validates all environment variables at startup. If validation fails:

- Build will fail in CI/CD
- App won't start locally
- Clear error messages indicate which variables are invalid

You can manually validate your environment variables:

```bash
npm run validate:env
```

#### Client vs Server Variables

- `NEXT_PUBLIC_*` - Exposed to browser (use sparingly)
- All others - Server-only (never in client bundle)

#### Security Requirements

**ADMIN_PASSWORD must:**

- Be at least 12 characters long
- Contain at least one uppercase letter
- Contain at least one lowercase letter
- Contain at least one number
- Contain at least one special character (@$!%\*?&)

Example of generating a secure password:

```bash
# Using the provided script (recommended)
npm run generate:secrets

# Using openssl (alternative)
openssl rand -base64 32
```

#### Storage and Management

- All API keys and secrets are stored in environment variables
- `.env` files are gitignored
- Only `.env.example` with empty values is committed
- Never commit actual secrets to version control

### Dependencies

- Regular dependency audits via `npm audit`
- Dependabot alerts enabled

## Responsible Disclosure

We kindly ask that you:

- Allow us a reasonable time to respond and fix the issue before public disclosure
- Make a good faith effort to avoid privacy violations, data destruction, and service interruption
- Do not access or modify data that does not belong to you
