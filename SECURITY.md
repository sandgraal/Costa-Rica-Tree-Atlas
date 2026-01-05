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

### API Security

- Rate limiting on API endpoints that call external paid services
- Input validation and sanitization
- File upload size and type restrictions
- No sensitive data in API responses
- AI identification feature disabled by default (requires explicit opt-in)

### HTTP Security Headers

- Strict-Transport-Security (HSTS)
- Content-Security-Policy (CSP) with nonce-based strict directives
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy (camera, microphone, geolocation disabled)
- upgrade-insecure-requests directive

## Content Security Policy

This application uses a strict nonce-based Content Security Policy to prevent XSS attacks:

- **No `unsafe-inline`** - Inline scripts must use nonces
- **No `unsafe-eval`** - eval() and similar functions are blocked
- **Strict sources** - Only whitelisted domains allowed
- **CSP reporting** - Violations logged to `/api/csp-report`

### CSP Directives

- `script-src`: Self + nonce + trusted analytics (Plausible, Google Analytics, Vercel)
- `style-src`: Self + nonce + Google Fonts
- `img-src`: Self + specific image CDNs (iNaturalist, GBIF, Unsplash, Google Maps)
- `connect-src`: Self + trusted APIs only (GBIF, iNaturalist, analytics, Google services)
- `font-src`: Self + Google Fonts
- `frame-src`: Self only
- `object-src`: None (blocks plugins)
- `base-uri`: Self only
- `form-action`: Self only
- `frame-ancestors`: Self only

### Testing CSP

Check browser console for violations:

```javascript
// This will be blocked:
eval('alert("blocked")');

// Inline scripts without nonce will be blocked:
<script>alert("blocked")</script>

// Scripts with nonce will work:
<script nonce="ABC123">console.log("allowed")</script>
```

### CSP Reporting

Violations are logged to `/api/csp-report`. In production, configure Sentry or similar service to receive reports.

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
