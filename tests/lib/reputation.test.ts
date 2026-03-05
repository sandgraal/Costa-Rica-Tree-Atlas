/**
 * Tests for src/lib/reputation.ts
 *
 * Covers:
 *  - calculateReputation scoring formula
 *  - Trust level determination (NEW, CONTRIBUTOR, TRUSTED, EXPERT)
 *  - Badge earning logic for all 9 badges
 *  - Edge cases: zero stats, negative score clamped, high rejection rate
 *  - getNextBadge: progress tracking, all-earned case, closest-badge logic
 */

import { describe, expect, it } from "vitest";
import {
  calculateReputation,
  getNextBadge,
  BADGE_DEFINITIONS,
  BADGE_MAP,
  TRUST_LEVEL_CONFIG,
  TRUST_LEVELS,
  type ContributorStats,
} from "@/lib/reputation";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Default zero-activity stats */
function makeStats(
  overrides: Partial<ContributorStats> = {}
): ContributorStats {
  return {
    totalContributions: 0,
    approvedContributions: 0,
    rejectedContributions: 0,
    approvedKnowledge: 0,
    approvedCorrections: 0,
    totalRatings: 0,
    totalPhotos: 0,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// calculateReputation
// ---------------------------------------------------------------------------

describe("calculateReputation", () => {
  describe("scoring", () => {
    it("returns 0 for zero-activity stats", () => {
      const result = calculateReputation(makeStats());
      expect(result.reputationScore).toBe(0);
    });

    it("awards +10 per approved contribution", () => {
      const result = calculateReputation(
        makeStats({ totalContributions: 5, approvedContributions: 5 })
      );
      expect(result.reputationScore).toBe(50);
    });

    it("deducts -3 per rejected contribution", () => {
      const result = calculateReputation(
        makeStats({
          totalContributions: 2,
          approvedContributions: 1,
          rejectedContributions: 1,
        })
      );
      // 1*10 + 1*(-3) = 7
      expect(result.reputationScore).toBe(7);
    });

    it("awards +2 per rating", () => {
      const result = calculateReputation(makeStats({ totalRatings: 10 }));
      expect(result.reputationScore).toBe(20);
    });

    it("awards +5 per approved photo", () => {
      const result = calculateReputation(makeStats({ totalPhotos: 3 }));
      expect(result.reputationScore).toBe(15);
    });

    it("awards +15 bonus per approved local knowledge", () => {
      const result = calculateReputation(
        makeStats({
          totalContributions: 2,
          approvedContributions: 2,
          approvedKnowledge: 2,
        })
      );
      // 2*10 (approved) + 2*15 (knowledge bonus) = 50
      expect(result.reputationScore).toBe(50);
    });

    it("clamps score to minimum 0 (many rejections)", () => {
      const result = calculateReputation(
        makeStats({
          totalContributions: 10,
          approvedContributions: 0,
          rejectedContributions: 10,
        })
      );
      // 0*10 + 10*(-3) = -30 → clamped to 0
      expect(result.reputationScore).toBe(0);
    });

    it("combines all scoring factors correctly", () => {
      const result = calculateReputation(
        makeStats({
          totalContributions: 12,
          approvedContributions: 10,
          rejectedContributions: 2,
          approvedKnowledge: 3,
          approvedCorrections: 2,
          totalRatings: 15,
          totalPhotos: 4,
        })
      );
      // 10*10 + 2*(-3) + 15*2 + 4*5 + 3*15
      // = 100 - 6 + 30 + 20 + 45 = 189
      expect(result.reputationScore).toBe(189);
    });
  });

  describe("trust levels", () => {
    it("assigns NEW for zero activity", () => {
      const result = calculateReputation(makeStats());
      expect(result.trustLevel).toBe("NEW");
    });

    it("assigns NEW for 2 approved (below CONTRIBUTOR threshold)", () => {
      const result = calculateReputation(
        makeStats({ totalContributions: 2, approvedContributions: 2 })
      );
      expect(result.trustLevel).toBe("NEW");
    });

    it("assigns CONTRIBUTOR for 3+ approved with low rejection rate", () => {
      const result = calculateReputation(
        makeStats({
          totalContributions: 4,
          approvedContributions: 3,
          rejectedContributions: 1,
        })
      );
      // rejection rate = 1/4 = 25% < 50%
      expect(result.trustLevel).toBe("CONTRIBUTOR");
    });

    it("does NOT assign CONTRIBUTOR if rejection rate > 50%", () => {
      const result = calculateReputation(
        makeStats({
          totalContributions: 8,
          approvedContributions: 3,
          rejectedContributions: 5,
        })
      );
      // rejection rate = 5/8 = 62.5% > 50%
      expect(result.trustLevel).toBe("NEW");
    });

    it("assigns CONTRIBUTOR when rejection rate equals exactly 50%", () => {
      const result = calculateReputation(
        makeStats({
          totalContributions: 6,
          approvedContributions: 3,
          rejectedContributions: 3,
        })
      );
      // rejection rate = 3/6 = 50% — <= 50% qualifies
      expect(result.trustLevel).toBe("CONTRIBUTOR");
    });

    it("assigns TRUSTED for 10+ approved with low rejection rate", () => {
      const result = calculateReputation(
        makeStats({
          totalContributions: 12,
          approvedContributions: 10,
          rejectedContributions: 2,
        })
      );
      // rejection rate = 2/12 ≈ 16.7% < 20%
      expect(result.trustLevel).toBe("TRUSTED");
    });

    it("does NOT assign TRUSTED if rejection rate >= 20%", () => {
      const result = calculateReputation(
        makeStats({
          totalContributions: 15,
          approvedContributions: 10,
          rejectedContributions: 5,
        })
      );
      // rejection rate = 5/15 ≈ 33% >= 20%
      // But 10 approved, 33% rejection → falls back to CONTRIBUTOR check
      // 33% < 50% and 10 >= 3 → CONTRIBUTOR
      expect(result.trustLevel).toBe("CONTRIBUTOR");
    });

    it("preserves EXPERT when isExpert is true", () => {
      const result = calculateReputation(makeStats({ isExpert: true }));
      expect(result.trustLevel).toBe("EXPERT");
    });

    it("EXPERT overrides computed level", () => {
      const result = calculateReputation(
        makeStats({
          totalContributions: 30,
          approvedContributions: 25,
          rejectedContributions: 0,
          isExpert: true,
        })
      );
      expect(result.trustLevel).toBe("EXPERT");
    });
  });

  describe("badges", () => {
    it("awards first_contribution at 1 approved", () => {
      const result = calculateReputation(
        makeStats({ totalContributions: 1, approvedContributions: 1 })
      );
      expect(result.badges).toContain("first_contribution");
    });

    it("awards naturalist_5 at 5 approved", () => {
      const result = calculateReputation(
        makeStats({ totalContributions: 5, approvedContributions: 5 })
      );
      expect(result.badges).toContain("naturalist_5");
      expect(result.badges).toContain("first_contribution");
    });

    it("awards naturalist_10 at 10 approved", () => {
      const result = calculateReputation(
        makeStats({ totalContributions: 10, approvedContributions: 10 })
      );
      expect(result.badges).toContain("naturalist_10");
    });

    it("awards naturalist_25 at 25 approved", () => {
      const result = calculateReputation(
        makeStats({ totalContributions: 25, approvedContributions: 25 })
      );
      expect(result.badges).toContain("naturalist_25");
    });

    it("awards knowledge_keeper at 3 approved knowledge contributions", () => {
      const result = calculateReputation(
        makeStats({
          totalContributions: 3,
          approvedContributions: 3,
          approvedKnowledge: 3,
        })
      );
      expect(result.badges).toContain("knowledge_keeper");
    });

    it("awards corrector at 5 approved corrections", () => {
      const result = calculateReputation(
        makeStats({
          totalContributions: 5,
          approvedContributions: 5,
          approvedCorrections: 5,
        })
      );
      expect(result.badges).toContain("corrector");
    });

    it("awards photographer at 3 approved photos", () => {
      const result = calculateReputation(makeStats({ totalPhotos: 3 }));
      expect(result.badges).toContain("photographer");
    });

    it("awards active_rater at 10 ratings", () => {
      const result = calculateReputation(makeStats({ totalRatings: 10 }));
      expect(result.badges).toContain("active_rater");
    });

    it("awards explorer at 25 ratings", () => {
      const result = calculateReputation(makeStats({ totalRatings: 25 }));
      expect(result.badges).toContain("explorer");
      expect(result.badges).toContain("active_rater");
    });

    it("awards no badges for zero activity", () => {
      const result = calculateReputation(makeStats());
      expect(result.badges).toEqual([]);
    });

    it("does NOT award badges below threshold", () => {
      const result = calculateReputation(
        makeStats({
          totalContributions: 4,
          approvedContributions: 4,
          approvedKnowledge: 2,
          approvedCorrections: 4,
          totalRatings: 9,
          totalPhotos: 2,
        })
      );
      expect(result.badges).not.toContain("naturalist_5");
      expect(result.badges).not.toContain("knowledge_keeper");
      expect(result.badges).not.toContain("corrector");
      expect(result.badges).not.toContain("active_rater");
      expect(result.badges).not.toContain("photographer");
      // But should earn first_contribution
      expect(result.badges).toContain("first_contribution");
    });
  });
});

// ---------------------------------------------------------------------------
// getNextBadge
// ---------------------------------------------------------------------------

describe("getNextBadge", () => {
  it("returns the closest unearned badge", () => {
    const stats = makeStats({
      totalContributions: 4,
      approvedContributions: 4,
    });
    const earned = ["first_contribution"];
    const next = getNextBadge(stats, earned);
    expect(next).not.toBeNull();
    expect(next!.badge.id).toBe("naturalist_5");
    expect(next!.progress).toBe(4);
    expect(next!.target).toBe(5);
  });

  it("returns null when all badges are earned", () => {
    const stats = makeStats({
      totalContributions: 25,
      approvedContributions: 25,
      approvedKnowledge: 3,
      approvedCorrections: 5,
      totalRatings: 25,
      totalPhotos: 3,
    });
    const allBadgeIds = BADGE_DEFINITIONS.map((b) => b.id);
    const next = getNextBadge(stats, allBadgeIds);
    expect(next).toBeNull();
  });

  it("prefers the badge with highest progress ratio", () => {
    const stats = makeStats({
      totalContributions: 2,
      approvedContributions: 2,
      totalRatings: 9, // 9/10 = 90% toward active_rater
    });
    const earned = ["first_contribution"];
    const next = getNextBadge(stats, earned);
    // 9/10 = 90% vs 2/5 = 40% (naturalist_5)
    expect(next).not.toBeNull();
    expect(next!.badge.id).toBe("active_rater");
    expect(next!.progress).toBe(9);
    expect(next!.target).toBe(10);
  });

  it("works with zero progress (brand new user)", () => {
    const stats = makeStats();
    const next = getNextBadge(stats, []);
    expect(next).not.toBeNull();
    // Should return some badge (first_contribution with 0/1)
    expect(next!.progress).toBe(0);
    expect(next!.target).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe("constants", () => {
  it("TRUST_LEVELS has 4 levels", () => {
    expect(TRUST_LEVELS).toHaveLength(4);
  });

  it("TRUST_LEVEL_CONFIG has entries for all levels", () => {
    for (const level of TRUST_LEVELS) {
      expect(TRUST_LEVEL_CONFIG).toHaveProperty(level);
      const configEntry = Object.values(TRUST_LEVEL_CONFIG).find(
        (config) => config.level === level
      );
      expect(configEntry).toBeDefined();
      expect(configEntry?.level).toBe(level);
    }
  });

  it("BADGE_DEFINITIONS has 9 badges", () => {
    expect(BADGE_DEFINITIONS).toHaveLength(9);
  });

  it("BADGE_MAP contains all badge definitions", () => {
    expect(BADGE_MAP.size).toBe(BADGE_DEFINITIONS.length);
    for (const badge of BADGE_DEFINITIONS) {
      expect(BADGE_MAP.has(badge.id)).toBe(true);
    }
  });

  it("all badges have required fields", () => {
    for (const badge of BADGE_DEFINITIONS) {
      expect(badge.id).toBeTruthy();
      expect(badge.name).toBeTruthy();
      expect(badge.description).toBeTruthy();
      expect(badge.icon).toBeTruthy();
      expect(["contributions", "knowledge", "photos", "ratings"]).toContain(
        badge.category
      );
    }
  });

  it("EXPERT trust level is admin-only", () => {
    expect(TRUST_LEVEL_CONFIG.EXPERT.adminOnly).toBe(true);
  });

  it("non-EXPERT trust levels are not admin-only", () => {
    expect(TRUST_LEVEL_CONFIG.NEW.adminOnly).toBe(false);
    expect(TRUST_LEVEL_CONFIG.CONTRIBUTOR.adminOnly).toBe(false);
    expect(TRUST_LEVEL_CONFIG.TRUSTED.adminOnly).toBe(false);
  });
});
