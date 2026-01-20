import { NextRequest, NextResponse } from "next/server";
import { allTrees, type Tree } from "contentlayer/generated";
import type {
  TreeAPIResponse,
  PaginatedResponse,
  TreeFilterOptions,
} from "@/types/api";

// Rate limiting: simple in-memory store (use Redis/Upstash in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 100; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

/**
 * Get client identifier for rate limiting
 */
function getClientId(request: NextRequest): string {
  // Check for API key first
  const apiKey = request.headers.get("X-API-Key");
  if (apiKey) {
    return `key:${apiKey}`;
  }

  // Fall back to IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous";
  return `ip:${ip}`;
}

/**
 * Check rate limit
 */
function checkRateLimit(clientId: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(clientId);

  if (!record || record.resetAt < now) {
    // New window
    rateLimitStore.set(clientId, { count: 1, resetAt: now + RATE_WINDOW });
    return {
      allowed: true,
      remaining: RATE_LIMIT - 1,
      resetAt: now + RATE_WINDOW,
    };
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Add rate limit headers to response
 */
function addRateLimitHeaders(
  headers: Headers,
  rateLimit: { remaining: number; resetAt: number }
): void {
  headers.set("X-RateLimit-Limit", String(RATE_LIMIT));
  headers.set("X-RateLimit-Remaining", String(rateLimit.remaining));
  headers.set("X-RateLimit-Reset", String(Math.ceil(rateLimit.resetAt / 1000)));
}

/**
 * Transform tree to API response format
 */
function transformTree(tree: Tree, baseUrl: string): TreeAPIResponse {
  return {
    slug: tree.slug,
    locale: tree.locale,
    title: tree.title,
    scientificName: tree.scientificName,
    family: tree.family,
    description: tree.description,
    nativeRegion: tree.nativeRegion,
    maxHeight: tree.maxHeight,
    elevation: tree.elevation,
    conservationStatus: tree.conservationStatus,
    uses: tree.uses,
    tags: tree.tags,
    distribution: tree.distribution,
    floweringSeason: tree.floweringSeason,
    fruitingSeason: tree.fruitingSeason,
    toxicityLevel: tree.toxicityLevel,
    toxicParts: tree.toxicParts,
    skinContactRisk: tree.skinContactRisk,
    allergenRisk: tree.allergenRisk,
    featuredImage: tree.featuredImage
      ? `${baseUrl}${tree.featuredImage}`
      : undefined,
    images: tree.images?.map((img) => `${baseUrl}${img}`),
    publishedAt: tree.publishedAt,
    updatedAt: tree.updatedAt,
    _links: {
      self: `${baseUrl}/api/v1/trees/${tree.slug}?locale=${tree.locale}`,
      html: `${baseUrl}/${tree.locale}/trees/${tree.slug}`,
    },
  };
}

/**
 * GET /api/v1/trees - List all trees with filtering and pagination
 */
export async function GET(request: NextRequest) {
  const clientId = getClientId(request);
  const rateLimit = checkRateLimit(clientId);

  // Check rate limit
  if (!rateLimit.allowed) {
    const headers = new Headers();
    addRateLimitHeaders(headers, rateLimit);
    return NextResponse.json(
      {
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Please try again later.",
          details: {
            retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
          },
        },
        _links: {
          documentation: "/api/docs",
        },
      },
      { status: 429, headers }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    // Parse filter options
    const filters: TreeFilterOptions = {
      locale: (searchParams.get("locale") as "en" | "es") || undefined,
      family: searchParams.get("family") || undefined,
      conservationStatus: searchParams.get("conservationStatus") || undefined,
      tag: searchParams.get("tag") || undefined,
      distribution: searchParams.get("distribution") || undefined,
      floweringSeason: searchParams.get("floweringSeason") || undefined,
      fruitingSeason: searchParams.get("fruitingSeason") || undefined,
      search: searchParams.get("search") || undefined,
      page: parseInt(searchParams.get("page") || "1", 10),
      pageSize: Math.min(
        Math.max(parseInt(searchParams.get("pageSize") || "20", 10), 1),
        100
      ),
      sort: (searchParams.get("sort") as TreeFilterOptions["sort"]) || "title",
      order: (searchParams.get("order") as "asc" | "desc") || "asc",
    };

    // Filter trees
    let trees = [...allTrees];

    // Locale filter
    if (filters.locale) {
      trees = trees.filter((t) => t.locale === filters.locale);
    }

    // Family filter
    if (filters.family) {
      const familyLower = filters.family.toLowerCase();
      trees = trees.filter((t) => t.family.toLowerCase() === familyLower);
    }

    // Conservation status filter
    if (filters.conservationStatus) {
      trees = trees.filter(
        (t) =>
          t.conservationStatus?.toUpperCase() ===
          filters.conservationStatus?.toUpperCase()
      );
    }

    // Tag filter
    if (filters.tag) {
      const tagLower = filters.tag.toLowerCase();
      trees = trees.filter((t) =>
        t.tags?.some((tag) => tag.toLowerCase() === tagLower)
      );
    }

    // Distribution filter
    if (filters.distribution) {
      const distLower = filters.distribution.toLowerCase();
      trees = trees.filter((t) =>
        t.distribution?.some((d) => d.toLowerCase() === distLower)
      );
    }

    // Flowering season filter
    if (filters.floweringSeason) {
      const monthLower = filters.floweringSeason.toLowerCase();
      trees = trees.filter((t) =>
        t.floweringSeason?.some((m) => m.toLowerCase() === monthLower)
      );
    }

    // Fruiting season filter
    if (filters.fruitingSeason) {
      const monthLower = filters.fruitingSeason.toLowerCase();
      trees = trees.filter((t) =>
        t.fruitingSeason?.some((m) => m.toLowerCase() === monthLower)
      );
    }

    // Search filter (searches title, scientific name, description)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      trees = trees.filter(
        (t) =>
          t.title.toLowerCase().includes(searchLower) ||
          t.scientificName.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    const sortField = filters.sort || "title";
    const sortOrder = filters.order === "desc" ? -1 : 1;
    trees.sort((a, b) => {
      const aVal = a[sortField] || "";
      const bVal = b[sortField] || "";
      return String(aVal).localeCompare(String(bVal)) * sortOrder;
    });

    // Pagination
    const total = trees.length;
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    const paginatedTrees = trees.slice(offset, offset + pageSize);

    // Transform to API format
    const data = paginatedTrees.map((t) => transformTree(t, baseUrl));

    // Build pagination links
    const buildUrl = (p: number) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", String(p));
      return `${baseUrl}/api/v1/trees?${params}`;
    };

    const response: PaginatedResponse<TreeAPIResponse> = {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      _links: {
        self: buildUrl(page),
        first: buildUrl(1),
        last: buildUrl(totalPages),
        ...(page < totalPages && { next: buildUrl(page + 1) }),
        ...(page > 1 && { prev: buildUrl(page - 1) }),
      },
    };

    const headers = new Headers();
    addRateLimitHeaders(headers, rateLimit);
    headers.set("Cache-Control", "public, max-age=300, s-maxage=600");

    return NextResponse.json(response, { headers });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
        _links: {
          documentation: "/api/docs",
        },
      },
      { status: 500 }
    );
  }
}
