"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@i18n/navigation";
import { BadgeDisplay } from "@/components/BadgeDisplay";

interface ProfileData {
  displayName: string | null;
  totalContributions: number;
  approvedContributions: number;
  rejectedContributions: number;
  totalRatings: number;
  totalPhotos: number;
  reputationScore: number;
  trustLevel: string;
  trustLevelInfo: { minApproved: number; label: string };
  badges: {
    badgeId: string;
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
  }[];
  nextBadge: {
    badge: { id: string; name: string; icon: string };
    progress: number;
    target: number;
  } | null;
  memberSince: string;
}

interface ApiResponse {
  profile: ProfileData | null;
  message?: string;
}

const TRUST_LEVEL_COLORS: Record<string, string> = {
  NEW: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  CONTRIBUTOR: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  TRUSTED: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  EXPERT: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
};

const TRUST_LEVEL_ICONS: Record<string, string> = {
  NEW: "🌱",
  CONTRIBUTOR: "🌿",
  TRUSTED: "🌳",
  EXPERT: "🏆",
};

export function ContributorProfileClient() {
  const t = useTranslations("reputation");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/reputation");
        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }
        const data: ApiResponse = await res.json();
        setProfile(data.profile);
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-pulse text-muted-foreground">
          {t("loading")}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive mb-4">{error}</p>
        <Link href="/contribute" className="text-primary hover:underline">
          {t("contributions.startContributing")}
        </Link>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-muted-foreground mb-6">{t("noProfile")}</p>
        <Link
          href="/contribute"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          {t("contributions.startContributing")}
        </Link>
      </div>
    );
  }

  const memberDate = new Date(profile.memberSince).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
    }
  );

  return (
    <div className="space-y-8">
      {/* Header with trust level */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 rounded-xl border border-border bg-card">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                TRUST_LEVEL_COLORS[profile.trustLevel] || TRUST_LEVEL_COLORS.NEW
              }`}
            >
              <span aria-hidden="true">
                {TRUST_LEVEL_ICONS[profile.trustLevel] || "🌱"}
              </span>
              {t(`trustLevel.${profile.trustLevel}` as Parameters<typeof t>[0])}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {t(
              `trustLevel.${profile.trustLevel}_description` as Parameters<
                typeof t
              >[0]
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("memberSince")} {memberDate}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/5 border border-primary/20">
          <span className="text-2xl font-bold text-primary">
            {profile.reputationScore}
          </span>
          <span className="text-xs text-muted-foreground">
            {t("stats.score")}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">{t("stats.title")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            label={t("stats.totalContributions")}
            value={profile.totalContributions}
          />
          <StatCard
            label={t("stats.approved")}
            value={profile.approvedContributions}
            accent="green"
          />
          <StatCard
            label={t("stats.rejected")}
            value={profile.rejectedContributions}
            accent={profile.rejectedContributions > 0 ? "red" : undefined}
          />
          <StatCard label={t("stats.ratings")} value={profile.totalRatings} />
          <StatCard label={t("stats.photos")} value={profile.totalPhotos} />
        </div>
      </div>

      {/* Badges */}
      <BadgeDisplay
        earnedBadges={profile.badges}
        nextBadge={profile.nextBadge}
      />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
        <Link
          href="/contribute"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          {t("contributions.startContributing")}
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "green" | "red";
}) {
  const accentClasses =
    accent === "green"
      ? "text-green-600 dark:text-green-400"
      : accent === "red"
        ? "text-red-600 dark:text-red-400"
        : "text-foreground";

  return (
    <div className="p-4 rounded-lg border border-border bg-card text-center">
      <p className={`text-2xl font-bold ${accentClasses}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
