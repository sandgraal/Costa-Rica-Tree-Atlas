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

Rate limits use the most reliable IP address available, with strict validation to prevent injection attacks:

1. **x-real-ip** header (set by Vercel/Cloudflare in production) - most trusted
2. **Rightmost IP** in x-forwarded-for header (closest to our server, added by trusted proxy)
3. Fallback to **"unknown"** if neither available or validation fails

**Security rationale:**
- **x-real-ip** is set by our trusted reverse proxy (Vercel/Cloudflare) and cannot be spoofed by clients
- For **x-forwarded-for**, we take the RIGHTMOST IP (closest to our server) which is added by our trusted proxy. The leftmost IPs can be easily spoofed by clients.
- All IP addresses are validated against proper IPv4 and IPv6 formats to prevent injection attacks
- Invalid or missing IPs are marked as **"unknown"** and receive the strictest rate limits

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

This application implements a strict Content Security Policy to prevent XSS attacks and other code injection vulnerabilities.

#### CSP Directives

The following sources are allowed by directive:

- **default-src**: `'self'` - Only load resources from the same origin
- **script-src**:
  - `'self'` - Scripts from same origin
  - `'unsafe-inline'` and `'unsafe-eval'` - Required for Next.js RSC and third-party analytics compatibility
  - Analytics: Plausible, Simple Analytics, Google Tag Manager, Google Analytics
  - Maps: Google Maps API
- **style-src**:
  - `'self'` - Stylesheets from same origin
  - `'unsafe-inline'` - Required for CSS-in-JS and Tailwind CSS
  - Google Fonts
- **img-src**: `'self'`, `data:`, `blob:`, `https:`, `http:` - Images from any source
- **font-src**: `'self'`, Google Fonts
- **connect-src**:
  - `'self'` - Same origin connections
  - Biodiversity APIs: GBIF, iNaturalist
  - Analytics: Plausible, Simple Analytics, Google Analytics
  - Maps: Google Maps API
- **frame-src**: `'self'` - Only embed frames from same origin
- **object-src**: `'none'` - No plugins (Flash, Java, etc.)
- **base-uri**: `'self'` - Restrict base tag URLs
- **form-action**: `'self'` - Forms can only submit to same origin
- **frame-ancestors**: `'self'` - Can only be embedded by same origin
- **upgrade-insecure-requests** - Automatically upgrade HTTP to HTTPS

#### Nonce-Based CSP

The application supports nonce-based CSP for inline scripts, providing stronger XSS protection. Nonces are cryptographically random values generated per request.

To enable nonce-based CSP:

```typescript
import { generateNonce, buildCSP } from "@/lib/security/csp";

const nonce = generateNonce();
const csp = buildCSP(nonce);
// Include nonce in script tags: <script nonce={nonce}>
```

#### CSP Violation Reporting

CSP violations are logged and can be monitored to detect potential attacks or misconfigurations.

To enable CSP violation reporting, set the `CSP_REPORT_URI` environment variable:

```bash
CSP_REPORT_URI=/api/csp-report
```

Violations will be sent to the configured endpoint and logged with the following information:

- Document URI where the violation occurred
- Violated directive
- Blocked URI
- Source file and line number
- Timestamp

The CSP report endpoint is rate-limited to prevent abuse.

#### Development vs Production

- **Development and Production**: Includes `'unsafe-inline'` and `'unsafe-eval'` in `script-src` for Next.js RSC and third-party analytics compatibility
- Both modes maintain the same CSP directives for consistent behavior across environments

#### Testing CSP Compatibility

The CSP configuration has been tested with:

- ✅ Next.js 16 (App Router)
- ✅ Plausible Analytics
- ✅ Simple Analytics
- ✅ Google Analytics
- ✅ Google Maps API
- ✅ Tailwind CSS 4
- ✅ Image optimization (next/image)

### Environment Variables

- All API keys and secrets are stored in environment variables
- `.env` files are gitignored
- Only `.env.example` with empty values is committed

### Dependencies

- Regular dependency audits via `npm audit`
- Dependabot alerts enabled

## Responsible Disclosure

We kindly ask that you:

- Allow us a reasonable time to respond and fix the issue before public disclosure
- Make a good faith effort to avoid privacy violations, data destruction, and service interruption
- Do not access or modify data that does not belong to you
