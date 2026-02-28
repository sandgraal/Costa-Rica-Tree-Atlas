/**
 * Tests for GET /api/reputation
 *
 * Covers:
 *  - No session cookie → null profile
 *  - Existing profile found → returns formatted profile with badges
 *  - No profile but has activity → computes, upserts, returns profile
 *  - No activity at all → null profile
 *  - Database error → 503 graceful fallback
 *  - NextBadge included in response
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

let mockProfile: Record<string, unknown>[] = [];
let mockContributionCounts: Record<string, unknown>[] = [];
let mockRatingCounts: Record<string, unknown>[] = [];
let mockPhotoCounts: Record<string, unknown>[] = [];
let dbError: Error | null = null;

const queryRawMock = vi.fn(async (strings: TemplateStringsArray) => {
  if (dbError) throw dbError;

  const sql = strings.join(" ");

  // Profile lookup
  if (sql.includes("FROM contributor_profiles")) {
    return mockProfile;
  }

  // Contribution counts
  if (sql.includes("FROM contributions") && sql.includes("GROUP BY")) {
    return mockContributionCounts;
  }

  // Rating count
  if (sql.includes("FROM tree_ratings")) {
    return mockRatingCounts;
  }

  // Photo count
  if (sql.includes("FROM image_proposals")) {
    return mockPhotoCounts;
  }

  return [];
});

const executeRawMock = vi.fn(async () => ({ count: 1 }));

vi.mock("@/lib/prisma", () => ({
  default: {
    $queryRaw: queryRawMock,
    $executeRaw: executeRawMock,
  },
}));

vi.mock("@/lib/error-tracking", () => ({
  captureApiError: vi.fn(),
}));

vi.mock("@/lib/api-rate-limit", () => ({
  rateLimitOrNull: vi.fn(() => null),
  getRateLimitResult: vi.fn(() => ({
    success: true,
    remaining: 10,
    limit: 20,
  })),
  addRateLimitHeaders: vi.fn(),
}));

const { GET } = await import("@/app/api/reputation/route");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createRequest(sessionId?: string): NextRequest {
  const req = new NextRequest(
    new URL("/api/reputation", "http://localhost:3000")
  );
  if (sessionId) {
    req.cookies.set("contribution_session", sessionId);
  }
  return req;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GET /api/reputation", () => {
  beforeEach(() => {
    mockProfile = [];
    mockContributionCounts = [];
    mockRatingCounts = [{ count: BigInt(0) }];
    mockPhotoCounts = [{ count: BigInt(0) }];
    dbError = null;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null profile when no session cookie", async () => {
    const res = await GET(createRequest());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.profile).toBeNull();
    expect(data.message).toBeTruthy();
  });

  it("returns existing profile from database", async () => {
    mockProfile = [
      {
        id: "prof-1",
        session_id: "test-session",
        display_name: "Test User",
        total_contributions: 5,
        approved_contributions: 3,
        rejected_contributions: 1,
        total_ratings: 10,
        total_photos: 2,
        reputation_score: 57,
        trust_level: "CONTRIBUTOR",
        badges: ["first_contribution", "naturalist_5"],
        created_at: new Date("2025-01-01"),
        updated_at: new Date("2025-02-01"),
      },
    ];

    const res = await GET(createRequest("test-session"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.profile).not.toBeNull();
    expect(data.profile.displayName).toBe("Test User");
    expect(data.profile.trustLevel).toBe("CONTRIBUTOR");
    expect(data.profile.reputationScore).toBe(57);
    expect(data.profile.badges).toHaveLength(2);
    expect(data.profile.badges[0].badgeId).toBe("first_contribution");
    expect(data.profile.trustLevelInfo).toBeTruthy();
    expect(data.profile.memberSince).toBeTruthy();
  });

  it("includes nextBadge in profile response", async () => {
    mockProfile = [
      {
        id: "prof-1",
        session_id: "test-session",
        display_name: null,
        total_contributions: 4,
        approved_contributions: 4,
        rejected_contributions: 0,
        total_ratings: 0,
        total_photos: 0,
        reputation_score: 40,
        trust_level: "CONTRIBUTOR",
        badges: ["first_contribution"],
        created_at: new Date("2025-01-01"),
        updated_at: new Date("2025-02-01"),
      },
    ];

    const res = await GET(createRequest("test-session"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.profile.nextBadge).not.toBeNull();
    expect(data.profile.nextBadge.badge.id).toBe("naturalist_5");
    expect(data.profile.nextBadge.progress).toBe(4);
    expect(data.profile.nextBadge.target).toBe(5);
  });

  it("computes profile from raw data when no profile record exists", async () => {
    mockProfile = [];
    mockContributionCounts = [
      { type: "CORRECTION", status: "APPROVED", count: BigInt(2) },
      { type: "LOCAL_KNOWLEDGE", status: "APPROVED", count: BigInt(1) },
    ];
    mockRatingCounts = [{ count: BigInt(5) }];
    mockPhotoCounts = [{ count: BigInt(0) }];

    const res = await GET(createRequest("new-session"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.profile).not.toBeNull();
    expect(data.profile.totalContributions).toBe(3);
    expect(data.profile.approvedContributions).toBe(3);
    expect(data.profile.totalRatings).toBe(5);
    // Should have created/upserted the profile
    expect(executeRawMock).toHaveBeenCalled();
  });

  it("returns null profile when session exists but no activity", async () => {
    mockProfile = [];
    mockContributionCounts = [];
    mockRatingCounts = [{ count: BigInt(0) }];

    const res = await GET(createRequest("empty-session"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.profile).toBeNull();
    expect(data.message).toBeTruthy();
  });

  it("returns 503 when contributor_profiles table is missing", async () => {
    dbError = new Error('relation "contributor_profiles" does not exist');

    const res = await GET(createRequest("test-session"));
    const data = await res.json();

    expect(res.status).toBe(503);
    expect(data.profile).toBeNull();
    expect(data.message).toContain("being set up");
  });

  it("returns 500 for unexpected errors", async () => {
    dbError = new Error("unexpected database error");

    const res = await GET(createRequest("test-session"));

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBeTruthy();
  });
});
