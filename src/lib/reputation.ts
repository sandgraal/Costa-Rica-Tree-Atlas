/**
 * Contributor Reputation System
 *
 * Pure functions for calculating reputation scores, trust levels, and badges.
 * No database dependencies — operates on aggregated stats.
 *
 * @see prisma/schema.prisma ContributorProfile model
 */

// ---------------------------------------------------------------------------
// Trust Levels
// ---------------------------------------------------------------------------

export type TrustLevel = "NEW" | "CONTRIBUTOR" | "TRUSTED" | "EXPERT";

export const TRUST_LEVELS: readonly TrustLevel[] = [
  "NEW",
  "CONTRIBUTOR",
  "TRUSTED",
  "EXPERT",
] as const;

export interface TrustLevelInfo {
  level: TrustLevel;
  label: string;
  description: string;
  minApproved: number;
  maxRejectionRate: number;
  adminOnly: boolean;
}

export const TRUST_LEVEL_CONFIG: Record<TrustLevel, TrustLevelInfo> = {
  NEW: {
    level: "NEW",
    label: "New Contributor",
    description: "Welcome! Your contributions will be reviewed by moderators.",
    minApproved: 0,
    maxRejectionRate: 1,
    adminOnly: false,
  },
  CONTRIBUTOR: {
    level: "CONTRIBUTOR",
    label: "Contributor",
    description: "An active community member with verified contributions.",
    minApproved: 3,
    maxRejectionRate: 0.5,
    adminOnly: false,
  },
  TRUSTED: {
    level: "TRUSTED",
    label: "Trusted Contributor",
    description:
      "A reliable contributor with a strong track record of quality submissions.",
    minApproved: 10,
    maxRejectionRate: 0.2,
    adminOnly: false,
  },
  EXPERT: {
    level: "EXPERT",
    label: "Expert",
    description: "Recognized expert — this level is granted by administrators.",
    minApproved: 0,
    maxRejectionRate: 1,
    adminOnly: true,
  },
};

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji icon for display
  category: "contributions" | "knowledge" | "photos" | "ratings";
}

export const BADGE_DEFINITIONS: readonly BadgeDefinition[] = [
  // Contribution badges
  {
    id: "first_contribution",
    name: "First Steps",
    description: "Submitted your first approved contribution",
    icon: "🌱",
    category: "contributions",
  },
  {
    id: "naturalist_5",
    name: "Naturalist",
    description: "5 approved contributions",
    icon: "🌿",
    category: "contributions",
  },
  {
    id: "naturalist_10",
    name: "Expert Naturalist",
    description: "10 approved contributions",
    icon: "🌳",
    category: "contributions",
  },
  {
    id: "naturalist_25",
    name: "Master Naturalist",
    description: "25 approved contributions",
    icon: "🏔️",
    category: "contributions",
  },
  // Knowledge badges
  {
    id: "knowledge_keeper",
    name: "Knowledge Keeper",
    description: "3 approved local knowledge contributions",
    icon: "🧠",
    category: "knowledge",
  },
  {
    id: "corrector",
    name: "Fact Checker",
    description: "5 approved corrections",
    icon: "✏️",
    category: "contributions",
  },
  // Photo badges
  {
    id: "photographer",
    name: "Photographer",
    description: "3 approved photo uploads",
    icon: "📸",
    category: "photos",
  },
  // Rating badges
  {
    id: "active_rater",
    name: "Active Reviewer",
    description: "Rated 10 or more trees",
    icon: "⭐",
    category: "ratings",
  },
  {
    id: "explorer",
    name: "Explorer",
    description: "Rated 25 or more trees",
    icon: "🧭",
    category: "ratings",
  },
] as const;

/** Map of badge ID → definition for quick lookup */
export const BADGE_MAP = new Map<string, BadgeDefinition>(
  BADGE_DEFINITIONS.map((b) => [b.id, b])
);

// ---------------------------------------------------------------------------
// Contributor Stats (input to calculation)
// ---------------------------------------------------------------------------

export interface ContributorStats {
  totalContributions: number;
  approvedContributions: number;
  rejectedContributions: number;
  /** Number of approved LOCAL_KNOWLEDGE contributions */
  approvedKnowledge: number;
  /** Number of approved CORRECTION contributions */
  approvedCorrections: number;
  totalRatings: number;
  totalPhotos: number;
  /** Whether the user has been manually granted EXPERT level */
  isExpert?: boolean;
}

// ---------------------------------------------------------------------------
// Reputation Calculation
// ---------------------------------------------------------------------------

export interface ReputationResult {
  reputationScore: number;
  trustLevel: TrustLevel;
  badges: string[];
}

/**
 * Calculate reputation score, trust level, and earned badges from stats.
 *
 * Scoring:
 * - +10 per approved contribution
 * - -3 per rejected contribution
 * - +2 per rating given
 * - +5 per approved photo
 * - +15 bonus per approved local knowledge (on top of the +10)
 *
 * Trust level thresholds:
 * - NEW: default
 * - CONTRIBUTOR: 3+ approved, <50% rejection rate
 * - TRUSTED: 10+ approved, <20% rejection rate
 * - EXPERT: admin-granted only (preserved if isExpert=true)
 */
export function calculateReputation(stats: ContributorStats): ReputationResult {
  // Calculate score
  const score =
    stats.approvedContributions * 10 +
    stats.rejectedContributions * -3 +
    stats.totalRatings * 2 +
    stats.totalPhotos * 5 +
    stats.approvedKnowledge * 15; // bonus for knowledge sharing

  const reputationScore = Math.max(0, score);

  // Calculate rejection rate
  const totalReviewed =
    stats.approvedContributions + stats.rejectedContributions;
  const rejectionRate =
    totalReviewed > 0 ? stats.rejectedContributions / totalReviewed : 0;

  // Determine trust level
  let trustLevel: TrustLevel = "NEW";

  if (stats.isExpert) {
    trustLevel = "EXPERT";
  } else if (
    stats.approvedContributions >= TRUST_LEVEL_CONFIG.TRUSTED.minApproved &&
    rejectionRate <= TRUST_LEVEL_CONFIG.TRUSTED.maxRejectionRate
  ) {
    trustLevel = "TRUSTED";
  } else if (
    stats.approvedContributions >= TRUST_LEVEL_CONFIG.CONTRIBUTOR.minApproved &&
    rejectionRate <= TRUST_LEVEL_CONFIG.CONTRIBUTOR.maxRejectionRate
  ) {
    trustLevel = "CONTRIBUTOR";
  }

  // Calculate earned badges
  const badges: string[] = [];

  if (stats.approvedContributions >= 1) badges.push("first_contribution");
  if (stats.approvedContributions >= 5) badges.push("naturalist_5");
  if (stats.approvedContributions >= 10) badges.push("naturalist_10");
  if (stats.approvedContributions >= 25) badges.push("naturalist_25");
  if (stats.approvedKnowledge >= 3) badges.push("knowledge_keeper");
  if (stats.approvedCorrections >= 5) badges.push("corrector");
  if (stats.totalPhotos >= 3) badges.push("photographer");
  if (stats.totalRatings >= 10) badges.push("active_rater");
  if (stats.totalRatings >= 25) badges.push("explorer");

  return { reputationScore, trustLevel, badges };
}

/**
 * Get the next badge the contributor is closest to earning.
 * Returns null if all badges are earned.
 */
export function getNextBadge(
  stats: ContributorStats,
  earnedBadges: string[]
): { badge: BadgeDefinition; progress: number; target: number } | null {
  const thresholds: {
    badgeId: string;
    current: number;
    target: number;
  }[] = [
    {
      badgeId: "first_contribution",
      current: stats.approvedContributions,
      target: 1,
    },
    {
      badgeId: "naturalist_5",
      current: stats.approvedContributions,
      target: 5,
    },
    {
      badgeId: "naturalist_10",
      current: stats.approvedContributions,
      target: 10,
    },
    {
      badgeId: "naturalist_25",
      current: stats.approvedContributions,
      target: 25,
    },
    {
      badgeId: "knowledge_keeper",
      current: stats.approvedKnowledge,
      target: 3,
    },
    {
      badgeId: "corrector",
      current: stats.approvedCorrections,
      target: 5,
    },
    { badgeId: "photographer", current: stats.totalPhotos, target: 3 },
    { badgeId: "active_rater", current: stats.totalRatings, target: 10 },
    { badgeId: "explorer", current: stats.totalRatings, target: 25 },
  ];

  // Find the first unearned badge with highest progress ratio
  let best: {
    badge: BadgeDefinition;
    progress: number;
    target: number;
  } | null = null;
  let bestRatio = -1;

  for (const { badgeId, current, target } of thresholds) {
    if (earnedBadges.includes(badgeId)) continue;
    const badge = BADGE_MAP.get(badgeId);
    if (!badge) continue;

    const ratio = current / target;
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = { badge, progress: current, target };
    }
  }

  return best;
}
