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

#### Rate Limiting Configuration

For local development, rate limiting is stored in-memory (resets on restart).

For production, configure Upstash Redis:

```bash
# Sign up at https://upstash.com and create a Redis database
# Then add these environment variables:
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

### API Security

- **CSRF Protection** - Origin validation for state-changing operations (POST, PUT, DELETE requests)
  - Validates `Origin` and `Referer` headers against allowed origins
  - Default allowed origins: `https://costaricatreeatlas.com`, `https://www.costaricatreeatlas.com`
  - Additional origins configurable via `ALLOWED_ORIGINS` environment variable
  - Development mode automatically allows localhost origins (`http://localhost:3000`, `http://127.0.0.1:3000`)
  - Returns 403 Forbidden for requests from unauthorized origins
- Rate limiting on API endpoints that call external paid services
- Input validation and sanitization
- File upload size and type restrictions
- No sensitive data in API responses
- AI identification feature disabled by default (requires explicit opt-in)

#### Configuring Allowed Origins

To add additional allowed origins for CSRF protection:

```bash
# In .env.local or deployment environment
ALLOWED_ORIGINS=https://costaricatreeatlas.org,https://app.costaricatreeatlas.com
```

Multiple origins should be comma-separated. These will be combined with the default allowed origins.

### HTTP Security Headers

- Strict-Transport-Security (HSTS)
- Content-Security-Policy (CSP) with strict directives
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy (camera, microphone, geolocation disabled)
- upgrade-insecure-requests directive

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
