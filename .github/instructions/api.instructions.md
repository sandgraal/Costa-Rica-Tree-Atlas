---
description: Instructions for API route development
applyTo: src/app/api/**
---

# API Route Guidelines

## Structure

API routes use Next.js App Router conventions:

- `src/app/api/{endpoint}/route.ts`
- Export named functions: `GET`, `POST`, `PUT`, `DELETE`, etc.

## Pattern

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Parse query params
    const { searchParams } = new URL(request.url);
    const param = searchParams.get("param");

    // Business logic
    const data = await fetchData(param);

    // Success response
    return NextResponse.json({ data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## Response Conventions

- Always return JSON with `NextResponse.json()`
- Include appropriate HTTP status codes
- Wrap responses in consistent shape: `{ data }` or `{ error }`
- Log errors server-side but don't expose internals to client

## Error Handling

```typescript
// 400 - Bad Request
return NextResponse.json(
  { error: "Missing required parameter" },
  { status: 400 }
);

// 404 - Not Found
return NextResponse.json({ error: "Resource not found" }, { status: 404 });

// 500 - Server Error
return NextResponse.json({ error: "Internal server error" }, { status: 500 });
```

## Caching

Use Next.js caching headers when appropriate:

```typescript
export async function GET() {
  const data = await getData();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
```
