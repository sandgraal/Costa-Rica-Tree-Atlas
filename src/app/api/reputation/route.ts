import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { captureApiError } from "@/lib/error-tracking";
import {
  rateLimitOrNull,
  getRateLimitResult,
  addRateLimitHeaders,
} from "@/lib/api-rate-limit";
import {
  calculateReputation,
  getNextBadge,
  BADGE_MAP,
  TRUST_LEVEL_CONFIG,
} from "@/lib/reputation";
import {
  computeContributorStats,
  upsertContributorProfile,
} from "@/lib/contributor-stats";

interface ProfileRow {
  id: string;
  session_id: string;
  display_name: string | null;
  total_contributions: number;
  approved_contributions: number;
  rejected_contributions: number;
  total_ratings: number;
  total_photos: number;
  reputation_score: number;
  trust_level: string;
  badges: string[];
  created_at: Date;
  updated_at: Date;
}

/**
 * GET /api/reputation — Get current session's contributor profile
 *
 * Returns the contributor's reputation score, trust level, badges, and stats.
 * Uses the contribution_session cookie for identification.
 */
export async function GET(request: NextRequest) {
  // Rate limit
  const blocked = rateLimitOrNull(request);
  if (blocked) return blocked;

  try {
    const sessionId = request.cookies.get("contribution_session")?.value;

    if (!sessionId) {
      // No session — return empty profile (not an error)
      const rl = getRateLimitResult(request);
      const headers = new Headers();
      addRateLimitHeaders(headers, rl);

      return NextResponse.json(
        {
          profile: null,
          message:
            "No contribution session found. Submit a contribution to start building your reputation.",
        },
        { headers }
      );
    }

    // Try to fetch existing profile
    const profiles = await prisma.$queryRaw<ProfileRow[]>`
      SELECT * FROM contributor_profiles WHERE session_id = ${sessionId}
    `;

    if (profiles.length > 0) {
      const p = profiles[0];

      // Fetch full stats from DB for accurate nextBadge progress
      // (approvedKnowledge and approvedCorrections are not stored in the profile row)
      const fullStats = await computeContributorStats(sessionId);
      const nextBadge = getNextBadge(fullStats ?? {
        totalContributions: p.total_contributions,
        approvedContributions: p.approved_contributions,
        rejectedContributions: p.rejected_contributions,
        approvedKnowledge: 0,
        approvedCorrections: 0,
        totalRatings: p.total_ratings,
        totalPhotos: p.total_photos,
      }, p.badges);

      const rl = getRateLimitResult(request);
      const headers = new Headers();
      addRateLimitHeaders(headers, rl);

      return NextResponse.json(
        {
          profile: {
            displayName: p.display_name,
            totalContributions: p.total_contributions,
            approvedContributions: p.approved_contributions,
            rejectedContributions: p.rejected_contributions,
            totalRatings: p.total_ratings,
            totalPhotos: p.total_photos,
            reputationScore: p.reputation_score,
            trustLevel: p.trust_level,
            trustLevelInfo:
              TRUST_LEVEL_CONFIG[
                p.trust_level as keyof typeof TRUST_LEVEL_CONFIG
              ],
            badges: p.badges
              .map((badgeId: string) => {
                const def = BADGE_MAP.get(badgeId);
                return def ? { badgeId, ...def } : null;
              })
              .filter(Boolean),
            nextBadge: nextBadge
              ? {
                  badge: {
                    id: nextBadge.badge.id,
                    name: nextBadge.badge.name,
                    icon: nextBadge.badge.icon,
                  },
                  progress: nextBadge.progress,
                  target: nextBadge.target,
                }
              : null,
            memberSince: p.created_at,
          },
        },
        { headers }
      );
    }

    // No profile yet — compute from raw data
    const stats = await computeContributorStats(sessionId);
    if (!stats) {
      const rl = getRateLimitResult(request);
      const headers = new Headers();
      addRateLimitHeaders(headers, rl);

      return NextResponse.json(
        {
          profile: null,
          message:
            "No contributions found for this session. Submit a contribution to start building your reputation.",
        },
        { headers }
      );
    }

    // Calculate reputation and create profile
    const result = calculateReputation(stats);
    const nextBadge = getNextBadge(stats, result.badges);

    await upsertContributorProfile(sessionId, stats, result);

    const rl = getRateLimitResult(request);
    const headers = new Headers();
    addRateLimitHeaders(headers, rl);

    return NextResponse.json(
      {
        profile: {
          displayName: null,
          totalContributions: stats.totalContributions,
          approvedContributions: stats.approvedContributions,
          rejectedContributions: stats.rejectedContributions,
          totalRatings: stats.totalRatings,
          totalPhotos: stats.totalPhotos,
          reputationScore: result.reputationScore,
          trustLevel: result.trustLevel,
          trustLevelInfo: TRUST_LEVEL_CONFIG[result.trustLevel],
          badges: result.badges
            .map((badgeId) => {
              const def = BADGE_MAP.get(badgeId);
              return def ? { badgeId, ...def } : null;
            })
            .filter(Boolean),
          nextBadge: nextBadge
            ? {
                badge: {
                  id: nextBadge.badge.id,
                  name: nextBadge.badge.name,
                  icon: nextBadge.badge.icon,
                },
                progress: nextBadge.progress,
                target: nextBadge.target,
              }
            : null,
          memberSince: new Date(),
        },
      },
      { headers }
    );
  } catch (error) {
    captureApiError(error, "/api/reputation", "GET");

    // Graceful fallback for missing tables
    if (
      error instanceof Error &&
      (error.message.includes("contributor_profiles") ||
        error.message.includes("P1001"))
    ) {
      return NextResponse.json(
        {
          profile: null,
          message: "Reputation system is being set up. Please try again later.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch reputation profile." },
      { status: 500 }
    );
  }
}
