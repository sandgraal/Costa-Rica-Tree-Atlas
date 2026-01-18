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

### Authentication and Authorization

The application uses a database-backed authentication system with industry-standard security practices.

#### Password Storage

- **Algorithm**: Argon2id (winner of the Password Hashing Competition)
- **Parameters**:
  - Memory cost: 19456 KiB (19 MiB)
  - Time cost: 2 iterations
  - Parallelism: 1 thread
  - Salt: Unique per password (automatically generated)
- **Properties**: Memory-hard, GPU-resistant, side-channel resistant

#### Session Management

- **Strategy**: JWT (JSON Web Tokens)
- **Storage**: Secure HTTP-only cookies
- **Duration**: 7 days maximum
- **Rotation**: No automatic refresh (re-authentication required)
- **Secret**: 256-bit minimum (`NEXTAUTH_SECRET`)

#### Two-Factor Authentication (MFA)

- **Algorithm**: TOTP (Time-based One-Time Password, RFC 6238)
- **Key storage**: AES-256-GCM encrypted in the database
- **Backup codes**: 10 codes, Argon2id hashed
- **Time window**: 30 seconds (±1 step tolerance)

#### Authentication Flow Security

1. **Constant-time operations**: Password and username verification uses constant-time comparison to prevent timing attacks
2. **Rate limiting**: 5 failed login attempts per 15 minutes per IP
3. **Audit logging**: All authentication events logged to the database
4. **Username enumeration prevention**: Generic error messages for failed logins
5. **HTTPS enforcement**: Required in production (middleware enforced)

#### Admin Route Protection

- **Primary**: NextAuth session verification (JWT)
- **Fallback**: HTTP Basic Auth (deprecated, migration period only)
- **Redirect**: Unauthenticated requests redirected to `/admin/login`
- **CSP headers**: Applied to all admin routes

#### Database Security

- **Provider**: Vercel Postgres (PostgreSQL)
- **Connections**: Connection pooling via Prisma
- **ORM**: Prisma (prevents SQL injection)
- **Secrets**: Never logged or exposed to client

#### API Endpoint Security

- **Setup endpoint** (`/api/admin/setup`): Self-disabling after first admin created
- **MFA endpoints**: Require valid session (authenticated users only)
- **Password operations**: Require current password verification
- **Input validation**: Zod schemas for all API payloads

#### Environment Variables

Sensitive configuration stored in environment variables (never in git):

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: JWT signing secret (256-bit minimum)
- `MFA_ENCRYPTION_KEY`: TOTP secret encryption key (256-bit)
- `ADMIN_PASSWORD`: Legacy Basic Auth (deprecated)

See `.env.example` for full list and generation instructions.

### Filesystem Security and Path Traversal Prevention

The application implements comprehensive protections against path traversal and filesystem access attacks.

#### Slug Validation

All user-provided slugs (tree identifiers, image names, etc.) undergo strict validation before use in filesystem operations:

**Validation Rules:**

- **Alphanumeric only**: Only `a-z`, `0-9`, hyphens (`-`), underscores (`_`), and single dots (`.`) allowed
- **No path separators**: Rejects `/` and `\` to prevent directory navigation
- **No parent references**: Blocks `..` to prevent directory traversal
- **No null bytes**: Prevents null byte injection attacks (`\x00`)
- **No control characters**: Blocks ASCII control characters (`\x00-\x1F`, `\x7F-\x9F`)
- **No hidden files**: Rejects filenames starting or ending with `.` (e.g., `.htaccess`, `.env`)
- **URL-decode validation**: Detects URL-encoded attacks like `%2F` (/) and `%2E%2E` (..)
- **Length limits**: 1-100 characters to prevent DoS attacks

**Rejected Patterns:**

```
../../../etc/passwd        ❌ Parent directory references
..%2F..%2F..%2Fetc%2Fpasswd ❌ URL-encoded path traversal
image\x00.jpg              ❌ Null byte injection
test/../../etc             ❌ Path separators
test\..\..\etc             ❌ Windows path separators
.htaccess                  ❌ Hidden files
test.                      ❌ Trailing dots
test...file                ❌ Multiple consecutive dots
test__file                 ❌ Double underscores
```

**Accepted Patterns:**

```
quercus-robur             ✅ Valid hyphenated slug
tree-123                  ✅ With numbers
scientific_name_2024      ✅ With underscores
test.file                 ✅ Single dot in middle
```

#### Safe Path Construction

The `safePath()` utility provides secure filesystem path construction:

```typescript
import { safePath } from "@/lib/filesystem/safe-path";

// Safe: Validates and restricts to base directory
const imagePath = safePath(baseDir, "trees", "quercus-robur.jpg");

// Throws error: Path traversal detected
const evilPath = safePath(baseDir, "..", "..", "etc", "passwd");
```

**Security Features:**

1. **Validates all segments**: Each path component is validated before joining
2. **Absolute paths only**: Requires absolute base directory to prevent relative path attacks
3. **Resolution check**: Resolves symlinks and verifies final path is within base directory
4. **Path traversal detection**: Throws error if resolved path escapes base directory

#### Image Path Resolution

Image optimization and resolution utilities use safe path construction:

```typescript
import { resolveImagePath } from "@/lib/filesystem/safe-path";

// Returns validated path or error
const result = resolveImagePath("quercus-robur", "optimized");
if (result.success) {
  // Safe to use result.path
  const imagePath = result.path;
}
```

**Protected Operations:**

- Image optimization (`src/lib/image-optimizer.ts`)
- Image resolution (`src/lib/image-resolver.ts`, `src/lib/image/image-resolver.ts`)
- File serving and access

#### Prevented Attack Vectors

Based on OWASP path traversal guidelines, the following attacks are prevented:

| Attack Type     | Example                  | Protection                   |
| --------------- | ------------------------ | ---------------------------- |
| Basic traversal | `../../../etc/passwd`    | Slug validation rejects `..` |
| URL encoding    | `..%2F..%2Fetc%2Fpasswd` | URL-decode and re-validate   |
| Double encoding | `%252e%252e%255c`        | Recursive decode detection   |
| Null byte       | `image\x00.jpg`          | Null byte detection          |
| Windows paths   | `..\..\etc\passwd`       | Backslash rejection          |
| Hidden files    | `.htaccess`, `.env`      | Leading dot rejection        |
| Symlink attacks | `/path/to/symlink`       | Path resolution check        |
| Very long paths | `a` × 5000               | Length limits (100 chars)    |

#### Testing

Comprehensive security tests validate path traversal prevention:

```bash
npm run test:run
```

Test coverage includes:

- ✅ 61 path traversal prevention tests
- ✅ OWASP attack vector validation
- ✅ Windows and Unix path separator handling
- ✅ URL encoding and unicode attacks
- ✅ Control character detection
- ✅ Long path handling
- ✅ Symlink and directory escape detection

#### Best Practices

When working with filesystem operations:

1. **Always validate slugs**: Use `validateSlug()` from `@/lib/validation/slug`
2. **Use safePath()**: Never use `path.join()` directly with user input
3. **Check results**: Validate function return values before using paths
4. **Log attempts**: Failed validation attempts are logged for monitoring
5. **Whitelist approach**: Only allow known-safe characters, reject everything else

### JSON-LD Sanitization

All JSON-LD structured data undergoes comprehensive XSS sanitization before being rendered to prevent code injection attacks.

#### Multi-Layer Defense Strategy

The application implements defense-in-depth with multiple sanitization layers:

1. **Pre-render validation** - Scans for dangerous patterns before rendering
2. **Content sanitization** - Removes/escapes malicious content if validation fails
3. **Character escaping** - Converts dangerous characters to Unicode escape sequences
4. **Pattern matching** - Detects and blocks known attack vectors
5. **Final validation** - Verifies sanitized output is safe

#### Blocked Attack Vectors

The following XSS attack vectors are detected and neutralized:

| Attack Vector        | Example                              | Protection Method                                    |
| -------------------- | ------------------------------------ | ---------------------------------------------------- |
| Script tag injection | `</script><script>alert(1)</script>` | Case-insensitive pattern matching + Unicode escaping |
| Case variation       | `</ScRiPt>`, `<SCRIPT>`              | Case-insensitive regex patterns                      |
| Extra whitespace     | `</script >`, `< script>`            | Pattern matching with `[^>]*`                        |
| Unicode homoglyphs   | `＜/script＞` (fullwidth)            | Fullwidth character detection + Unicode escaping     |
| HTML entities        | `&lt;/script&gt;`                    | Entity pattern detection                             |
| Style tag escape     | `</style><style>...</style>`         | Style tag pattern matching                           |
| HTML comment escape  | `-->`                                | Direct string detection                              |
| CDATA escape         | `]]>`                                | Direct string detection                              |
| Event handlers       | `onerror="alert(1)"`                 | Event handler pattern matching                       |
| JavaScript protocol  | `javascript:alert(1)`                | Protocol pattern matching                            |
| Data URI HTML        | `data:text/html,...`                 | Data URI pattern matching                            |
| Zero-width chars     | U+200B, U+200C, U+200D, U+FEFF       | Zero-width character detection                       |

#### Implementation Details

**Component: `SafeJsonLd.tsx`**

- Client-side rendering only (no hydration mismatches)
- CSP nonce support for inline scripts
- Uses `textContent` instead of `innerHTML` for safety
- Comprehensive Unicode character escaping
- Pattern-based dangerous content removal
- Final validation before DOM injection
- Fallback to empty object if sanitization fails

**Library: `json-ld.ts`**

- Recursive scanning of nested objects and arrays
- Validation of `@context` URLs (only schema.org allowed)
- Comprehensive pattern detection for XSS vectors
- Sanitization function that cleans malicious content
- Detailed issue reporting for debugging

#### Unicode Handling

The sanitizer handles various Unicode-based attacks:

```typescript
// ASCII dangerous chars → Unicode escapes
< → \u003c
> → \u003e
& → \u0026

// Fullwidth variants → Unicode escapes
＜ → \uff1c
＞ → \uff1e
＆ → \uff06

// Zero-width chars → Removed
U+200B (zero-width space) → ""
U+200C (zero-width non-joiner) → ""
U+200D (zero-width joiner) → ""
U+FEFF (zero-width no-break space) → ""

// Line separators → Unicode escapes
U+2028 (line separator) → \u2028
U+2029 (paragraph separator) → \u2029
```

#### Validation Before Rendering

All JSON-LD data is validated before rendering:

```typescript
// 1. Validate the data
const validation = validateJsonLd(jsonLdData);

// 2. If invalid, sanitize it
if (!validation.valid) {
  console.error("Validation failed:", validation.issues);
  jsonLdData = sanitizeJsonLd(jsonLdData);
}

// 3. Render with comprehensive escaping
<SafeJsonLd data={jsonLdData} nonce={cspNonce} />
```

#### Example: Prevented Attacks

**Attack 1: Script Tag with Case Variation**

```json
{ "name": "</ScRiPt><ScRiPt>alert('XSS')</ScRiPt>" }
```

✅ **Blocked:** Case-insensitive pattern matching detects all variations

**Attack 2: Unicode Homoglyph**

```json
{ "name": "＜script＞alert(1)＜/script＞" }
```

✅ **Blocked:** Fullwidth characters detected and escaped to Unicode

**Attack 3: Zero-Width Character Obfuscation**

```json
{ "name": "test\u200B<script\u200C>alert(1)</script\u200D>" }
```

✅ **Blocked:** Zero-width characters removed, script tags detected

**Attack 4: Event Handler Injection**

```json
{ "url": "https://example.com\" onerror=\"alert(1)" }
```

✅ **Blocked:** Event handler pattern matching removes `onerror=`

**Attack 5: Nested Object Attack**

```json
{
  "author": {
    "name": "<script>alert(1)</script>"
  }
}
```

✅ **Blocked:** Recursive scanning detects malicious content in nested objects

#### Testing

Comprehensive test suite covers:

- ✅ Case variation attacks (`</ScRiPt>`, `<SCRIPT>`)
- ✅ Unicode homoglyph attacks (fullwidth characters)
- ✅ Event handler injection (`onerror=`, `onclick=`)
- ✅ Style tag escapes
- ✅ HTML comment and CDATA escapes
- ✅ Zero-width character attacks
- ✅ Nested object/array attacks
- ✅ JavaScript protocol attacks
- ✅ Data URI attacks
- ✅ Sanitization effectiveness

Tests located in:

- `src/components/__tests__/SafeJsonLd.test.tsx`
- `src/lib/validation/__tests__/json-ld.test.ts`

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

Rate limiting uses atomic Redis operations via Lua scripts with fixed window algorithm:

- **Lua-based atomicity** - All rate limit checks use Lua scripts executed atomically in Redis
- **No race conditions** - Even with concurrent serverless instances, limits are enforced correctly
- **Circuit breaker protection** - Gracefully degrades to in-memory limiting when Redis is unavailable
- **In-memory fallback** - LRU-based memory cache prevents service disruption during Redis outages
- **Fixed window algorithm** - Simple and efficient, preventing burst traffic with atomic INCR operations

**Why Lua scripts:**

- Lua scripts execute atomically in Redis - no possibility of race conditions
- Multiple serverless instances cannot bypass limits by reading the same count
- Simpler than sliding windows and more reliable in distributed environments
- No clock skew issues unlike timestamp-based sliding windows

**Circuit Breaker Behavior:**

The circuit breaker protects against Redis failures with three states:

1. **Closed** (normal): All requests go to Redis
2. **Open** (failure): After 5 consecutive failures, falls back to in-memory limiting for 1 minute
3. **Half-open** (testing): After timeout, tries Redis again to see if it's recovered

When Redis is unavailable:

- Requests continue to work using in-memory rate limiting
- No 500 errors are returned to users
- Circuit breaker automatically recovers when Redis is back online
- Console warnings logged for monitoring

**In-Memory Fallback:**

The in-memory rate limiter:

- Maintains up to 10,000 rate limit records
- Uses LRU eviction to prevent memory exhaustion
- Automatically expires old records
- Provides same rate limit guarantees within a single instance
- Note: Each serverless instance has its own memory cache (not shared)

#### Rate Limit Headers

Most API responses include standard rate limit headers:

- `X-RateLimit-Limit`: Maximum number of requests allowed in the window
- `X-RateLimit-Remaining`: Number of requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when the rate limit resets

When rate limit is exceeded (429 response):

- `Retry-After`: Number of seconds until the client can retry

**Security Note for Admin Authentication:**

Admin authentication failures (HTTP 401) **do NOT include** `X-RateLimit-Remaining` header to prevent username enumeration attacks. Including rate limit information could allow attackers to detect valid usernames through different rate limit consumption patterns between "wrong username" and "correct username with wrong password" scenarios.

#### Configuring Upstash Redis

For production rate limiting that persists across deployments:

```bash
# Sign up at https://upstash.com and create a Redis database
# Add these environment variables:
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Optional: Configure trusted proxy count (default: 2 for Cloudflare + Vercel)
TRUSTED_PROXY_COUNT=2
```

**Trusted Proxy Configuration:**

The `TRUSTED_PROXY_COUNT` environment variable configures how many proxy hops to skip when extracting the client IP from the `x-forwarded-for` header:

- **Default: 2** - Assumes Cloudflare + Vercel (most common setup)
- **Behind Cloudflare only: 1** - Set to 1 if not using Vercel
- **Behind custom CDN + Cloudflare + Vercel: 3** - Set to 3 for three proxy layers
- **Direct to Vercel: 1** - Set to 1 if no CDN in front

**How it works:**

The `x-forwarded-for` header format is: `client-ip, proxy1-ip, proxy2-ip, ...`

- With `TRUSTED_PROXY_COUNT=2`, the system skips the rightmost 2 IPs (trusted proxies) and uses the 3rd from right as client IP
- If header has fewer IPs than `TRUSTED_PROXY_COUNT + 1`, uses the leftmost IP
- Example with Cloudflare + Vercel: `203.0.113.1, 1.2.3.4, 5.6.7.8` → extracts `203.0.113.1` as client IP

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

IPv6 addresses are intelligently normalized based on network type:

- **Mobile carriers** (e.g., T-Mobile, Sprint): Normalized to /64 subnets (first 4 groups)
  - Example: `2600:1234:5678:9abc::1` → `2600:1234:5678:9abc::/64`
  - Mobile carriers frequently rotate IPv6 addresses within /64 subnets
  - Prevents legitimate mobile users from appearing as different users
- **Corporate/Residential** (all others): Normalized to /48 subnets (first 3 groups)
  - Example: `2001:0db8:85a3:0000::1` → `2001:0db8:85a3::/48`
  - More restrictive to prevent entire office buildings from sharing same rate limit
  - Balances security with usability for enterprise networks

**Mobile Carrier Detection:**

The system maintains a list of known mobile carrier IPv6 prefixes:

- T-Mobile US: `2600:`, `2607:fb90:`
- Sprint/T-Mobile: `2001:4888:`
- Telefonica/O2: `2a00:23c5:`, `2a00:23c6:`

This list can be expanded as needed to cover additional carriers worldwide.

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

All authentication comparisons use **hash-based constant-time comparison** to prevent timing attacks:

**Security Properties:**

- **Fixed-length comparison**: All comparisons operate on 32-byte SHA-256 hashes, regardless of input length
- **No length oracle**: Hash normalization eliminates length-based timing differences
- **No encoding time variation**: Hashing before comparison eliminates UTF-8 encoding complexity timing
- **Cache-timing resistant**: Hash operations have constant-time behavior
- **No early exit**: Always compares full hashes even on mismatch
- **No username enumeration**: Both username AND password are always checked before returning any error
- **Native crypto module**: Uses Node.js's built-in `crypto.timingSafeEqual` and `crypto.createHash`

**Why This Matters**

Without proper constant-time comparison, attackers can:

1. **Timing attacks**: Measure response times to guess passwords character-by-character
2. **Length oracle attacks**: Determine password length from comparison timing
3. **Cache timing attacks**: Exploit CPU cache behavior during string operations
4. **Username enumeration**: Determine valid usernames by timing differences or rate limit patterns
5. **Brute-force optimization**: Reduce attack complexity from O(n^m) to O(n\*m)

**Implementation Details**

The `secureCompare` function in `src/lib/auth/secure-compare.ts`:

1. **Hash both inputs FIRST** using SHA-256 to fixed 32-byte length
   - Eliminates variable encoding time (UTF-8 multibyte characters)
   - Eliminates length oracle (both hashes always 32 bytes)
   - Eliminates cache timing (hash operation time is constant)

2. **Use timingSafeEqual** on fixed-length hashes
   - No length checks needed (both always 32 bytes)
   - No branches based on input characteristics
   - True constant-time comparison at the native level

3. **Never short-circuits** or returns early based on input

**Username Enumeration Prevention**

Additional measures prevent username enumeration attacks:

1. **Always check both credentials**: The middleware ALWAYS checks both username and password using constant-time comparison, regardless of whether username matches
   - Prevents timing differences between "wrong username" and "wrong password" scenarios
   - Ensures consistent execution path for all authentication attempts

2. **No rate limit hints in responses**: The `X-RateLimit-Remaining` header is NOT included in authentication failure responses (HTTP 401)
   - Prevents attackers from detecting valid usernames through different rate limit consumption patterns
   - Wrong username and correct username with wrong password have identical responses

3. **Constant-time rate limiting**: Rate limit checks include artificial delays to ensure consistent timing
   - All rate limit checks take minimum 50ms regardless of result
   - Prevents timing-based detection of rate limit status

**Note on SHA-256 for Password Storage**

⚠️ **IMPORTANT**: While we use SHA-256 for constant-time comparison, this is NOT suitable for password storage! SHA-256 is too fast and vulnerable to brute-force attacks. For password hashing, always use bcrypt, scrypt, or argon2.

The current implementation compares plaintext passwords directly (not storing hashed passwords), which is acceptable for Basic Authentication with strong passwords and rate limiting.

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
