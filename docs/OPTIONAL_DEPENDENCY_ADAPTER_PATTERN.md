# Optional-Dependency Adapter Pattern

This document describes the adapter pattern used throughout the codebase to handle optional or heavy dependencies gracefully.

## Problem

Some dependencies are:

- **Only available at runtime** (e.g., Prisma Client requires a database URL)
- **Heavy and should be lazy-loaded** (e.g., Fuse.js, html2canvas)
- **Environment-specific** (e.g., `@prisma/adapter-pg` for Postgres, TOTP for MFA)

Importing these statically would cause build failures or unnecessary bundle bloat.

## Pattern: Dynamic Import with Graceful Fallback

### 1. Try/Catch Adapter (runtime-optional dependency)

Use when a dependency may not be available at all (e.g., missing env vars, optional feature).

```typescript
// src/lib/prisma.ts
let prisma: any;

try {
  const { PrismaClient } = require("@prisma/client");
  const { PrismaPg } = require("@prisma/adapter-pg");
  // ... configure and create client
  prisma = new PrismaClient({ adapter });
} catch (error) {
  // Graceful degradation: return a proxy that throws descriptive errors
  prisma = new Proxy(
    {},
    {
      get() {
        throw new Error(
          "Prisma Client is not available. Database features are disabled."
        );
      },
    }
  );
}
```

**When to use:** The feature is entirely optional (e.g., admin auth requires a database, but the public site works without one).

### 2. Lazy Dynamic Import (heavy dependency)

Use when a dependency is always available but should only be loaded on first use.

```typescript
// src/lib/search/index.ts
let FuseClass: typeof import("fuse.js").default | null = null;

async function getOrCreateIndex(trees: Tree[]) {
  if (!FuseClass) {
    const mod = await import("fuse.js");
    FuseClass = mod.default ?? mod;
  }
  // ... use FuseClass
}
```

**When to use:** The dependency is heavy and only needed for a specific user action (search, export, etc.).

### 3. Browser-Only Dynamic Import (client-side dependency)

Use when a dependency requires browser APIs and can't run during SSR.

```typescript
// src/app/[locale]/education/certificate/CertificateClient.tsx
const handleDownload = async () => {
  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(ref.current, { scale: 2 });
  // ... use canvas
};
```

**When to use:** The library accesses `window`, `document`, `canvas`, or other browser-only APIs.

### 4. Guarded Dynamic Import (feature-gated dependency)

Use when a dependency is needed only for a specific feature path.

```typescript
// src/app/api/auth/[...nextauth]/route.ts
try {
  const { TOTP } = await import("@otplib/totp");
  const totp = new TOTP();
  const result = await totp.verify(code, { secret });
  mfaValid = result.valid;
} catch {
  mfaValid = false;
}
```

**When to use:** The feature (MFA, analytics, etc.) is optional and the dependency may fail to load, or you only want to load the library when the feature is actually used.

> **Note:** For server-only modules where the feature is mandatory and the dependency is guaranteed to be installed (e.g., API routes that always perform MFA with `@otplib/totp`), a static import at the top of the file is acceptable because it is never bundled into client code. Use the guarded dynamic import pattern in shared libraries or any code that might execute in multiple environments.

## Guidelines for New Integrations

1. **Never statically import optional or feature-gated dependencies** at the module top level in shared libraries or code that may be bundled for the client; server-only modules (e.g., API routes where the feature is mandatory and the dependency is guaranteed to exist) may use static imports instead.
2. **Always provide a fallback behavior** — either a no-op proxy, a descriptive error, or feature disablement
3. **Log a warning** when a dependency is unavailable so operators can diagnose missing configuration
4. **Cache the loaded module** in a module-scoped variable to avoid re-importing on every call
5. **Use `await import()` over `require()`** unless you need synchronous loading during module initialization
