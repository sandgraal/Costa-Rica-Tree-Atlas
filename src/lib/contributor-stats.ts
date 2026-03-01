import prisma from "@/lib/prisma";
import {
  calculateReputation,
  type ContributorStats,
  type ReputationResult,
} from "@/lib/reputation";

interface ContributionCountRow {
  type: string;
  status: string;
  count: bigint;
}

interface CountRow {
  count: bigint;
}

/**
 * Aggregate a contributor's stats from raw database records.
 * Returns null if the session has no activity at all.
 */
export async function computeContributorStats(
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
    const ratingCounts = await prisma.$queryRaw<CountRow[]>`
      SELECT COUNT(*) as count
      FROM tree_ratings
      WHERE session_id = ${sessionId}
    `;

    // Get photo count (approved image proposals from this session)
    let photoCounts: CountRow[] = [{ count: BigInt(0) }];
    try {
      photoCounts = await prisma.$queryRaw<CountRow[]>`
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

    const totalRatings = Number(ratingCounts[0]?.count || 0);
    const totalPhotos = Number(photoCounts[0]?.count || 0);

    if (totalContributions === 0 && totalRatings === 0 && totalPhotos === 0) {
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
  } catch (error) {
    console.error("Failed to compute contributor stats:", error);
    throw error;
  }
}

/**
 * Upsert a contributor profile in the database based on computed stats and
 * reputation result. Preserves EXPERT trust level if admin-granted.
 *
 * Note: `approvedKnowledge` and `approvedCorrections` from stats are used for
 * reputation calculation and badge progress but are not stored as separate
 * columns in `contributor_profiles` (they are recomputed from raw data as
 * needed via `computeContributorStats`).
 */
export async function upsertContributorProfile(
  sessionId: string,
  stats: ContributorStats,
  result: ReputationResult
): Promise<void> {
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
}

/**
 * Recalculate a contributor's reputation after a review action.
 * Looks up the contribution's sessionId, aggregates all their stats,
 * and upserts the ContributorProfile.
 */
export async function recalculateReputationForContribution(
  contributionId: string
): Promise<void> {
  // Get the session ID for this contribution
  const rows = await prisma.$queryRaw<
    [{ session_id: string }]
  >`SELECT session_id FROM contributions WHERE id = ${contributionId}`;

  if (rows.length === 0) return;
  const sessionId = rows[0].session_id;

  const stats = await computeContributorStats(sessionId);
  if (!stats) return;

  // Check if already EXPERT (preserve admin-granted level)
  const existingProfiles = await prisma.$queryRaw<
    [{ trust_level: string }]
  >`SELECT trust_level FROM contributor_profiles WHERE session_id = ${sessionId}`;
  const isExpert =
    existingProfiles.length > 0 && existingProfiles[0].trust_level === "EXPERT";

  const result = calculateReputation({ ...stats, isExpert });
  await upsertContributorProfile(sessionId, stats, result);
}
