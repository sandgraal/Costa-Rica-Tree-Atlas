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
  type ContributorStats,
} from "@/lib/reputation";

interface ContributionCountRow {
  type: string;
  status: string;
  count: bigint;
}

interface RatingCountRow {
  count: bigint;
}

interface PhotoCountRow {
  count: bigint;
}

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

      // Compute nextBadge from stored stats
      const storedStats: ContributorStats = {
        totalContributions: p.total_contributions,
        approvedContributions: p.approved_contributions,
        rejectedContributions: p.rejected_contributions,
        approvedKnowledge: 0, // Not stored separately, but getNextBadge handles gracefully
        approvedCorrections: 0,
        totalRatings: p.total_ratings,
        totalPhotos: p.total_photos,
      };
      const nextBadge = getNextBadge(storedStats, p.badges);

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
    const stats = await computeStatsFromDb(sessionId);
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

    await prisma.$executeRaw`
      INSERT INTO contributor_profiles (
        id, session_id, total_contributions, approved_contributions,
        rejected_contributions, total_ratings, total_photos,
        reputation_score, trust_level, badges, created_at, updated_at
      ) VALUES (
        gen_random_uuid()::text,
        ${sessionId},
        ${stats.totalContributions},
        ${stats.approvedContributions},
        ${stats.rejectedContributions},
        ${stats.totalRatings},
        ${stats.totalPhotos},
        ${result.reputationScore},
        ${result.trustLevel}::"TrustLevel",
        ${result.badges}::text[],
        NOW(),
        NOW()
      )
      ON CONFLICT (session_id) DO UPDATE SET
        total_contributions = EXCLUDED.total_contributions,
        approved_contributions = EXCLUDED.approved_contributions,
        rejected_contributions = EXCLUDED.rejected_contributions,
        total_ratings = EXCLUDED.total_ratings,
        total_photos = EXCLUDED.total_photos,
        reputation_score = EXCLUDED.reputation_score,
        trust_level = EXCLUDED.trust_level,
        badges = EXCLUDED.badges,
        updated_at = NOW()
    `;

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

/**
 * Compute contributor stats from raw database records.
 * Used when no pre-computed profile exists yet.
 */
async function computeStatsFromDb(
  sessionId: string
): Promise<ContributorStats | null> {
  try {
    // Get contribution counts by type and status
    const contributionCounts = await prisma.$queryRaw<ContributionCountRow[]>`
      SELECT type, status, COUNT(*) as count
      FROM contributions
      WHERE session_id = ${sessionId}
      GROUP BY type, status
    `;

    // Get rating count
    const ratingCounts = await prisma.$queryRaw<RatingCountRow[]>`
      SELECT COUNT(*) as count
      FROM tree_ratings
      WHERE session_id = ${sessionId}
    `;

    // Get photo count (approved image proposals from this session)
    let photoCounts: PhotoCountRow[] = [{ count: BigInt(0) }];
    try {
      photoCounts = await prisma.$queryRaw<PhotoCountRow[]>`
        SELECT COUNT(*) as count
        FROM image_proposals
        WHERE source = 'USER_UPLOAD'::"ImageProposalSource"
        AND status IN ('APPROVED'::"ImageProposalStatus", 'APPLIED'::"ImageProposalStatus")
        AND id IN (
          SELECT proposal_id FROM image_audits
          WHERE actor_session = ${sessionId}
          AND action = 'PROPOSAL_CREATED'::"ImageAuditAction"
        )
      `;
    } catch {
      // image_proposals table may not exist; default to 0
    }

    const totalContributions = contributionCounts.reduce(
      (sum: number, r: ContributionCountRow) => sum + Number(r.count),
      0
    );

    if (totalContributions === 0 && Number(ratingCounts[0]?.count || 0) === 0) {
      return null; // No activity at all
    }

    const approvedContributions = contributionCounts
      .filter(
        (r: ContributionCountRow) =>
          r.status === "APPROVED" || r.status === "IMPLEMENTED"
      )
      .reduce(
        (sum: number, r: ContributionCountRow) => sum + Number(r.count),
        0
      );

    const rejectedContributions = contributionCounts
      .filter((r: ContributionCountRow) => r.status === "REJECTED")
      .reduce(
        (sum: number, r: ContributionCountRow) => sum + Number(r.count),
        0
      );

    const approvedKnowledge = contributionCounts
      .filter(
        (r: ContributionCountRow) =>
          r.type === "LOCAL_KNOWLEDGE" &&
          (r.status === "APPROVED" || r.status === "IMPLEMENTED")
      )
      .reduce(
        (sum: number, r: ContributionCountRow) => sum + Number(r.count),
        0
      );

    const approvedCorrections = contributionCounts
      .filter(
        (r: ContributionCountRow) =>
          r.type === "CORRECTION" &&
          (r.status === "APPROVED" || r.status === "IMPLEMENTED")
      )
      .reduce(
        (sum: number, r: ContributionCountRow) => sum + Number(r.count),
        0
      );

    return {
      totalContributions,
      approvedContributions,
      rejectedContributions,
      approvedKnowledge,
      approvedCorrections,
      totalRatings: Number(ratingCounts[0]?.count || 0),
      totalPhotos: Number(photoCounts[0]?.count || 0),
    };
  } catch {
    return null;
  }
}
