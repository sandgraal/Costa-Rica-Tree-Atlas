"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  Contribution,
  ContributionType,
  ContributionStatus,
} from "@/types/contributions";

const TYPE_LABELS: Record<ContributionType, string> = {
  NEW_SPECIES: "New Species",
  CORRECTION: "Correction",
  LOCAL_KNOWLEDGE: "Local Knowledge",
  TRANSLATION: "Translation",
};

const TYPE_COLORS: Record<ContributionType, string> = {
  NEW_SPECIES:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  CORRECTION:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  LOCAL_KNOWLEDGE:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  TRANSLATION: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};

const STATUS_LABELS: Record<ContributionStatus, string> = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  IMPLEMENTED: "Implemented",
  REJECTED: "Rejected",
  DUPLICATE: "Duplicate",
};

const STATUS_COLORS: Record<ContributionStatus, string> = {
  PENDING: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  UNDER_REVIEW: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  APPROVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  IMPLEMENTED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  DUPLICATE:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
};

export function ContributionsListClient() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{
    type: ContributionType | "ALL";
    status: ContributionStatus | "ALL";
  }>({
    type: "ALL",
    status: "PENDING",
  });
  const [selectedContribution, setSelectedContribution] =
    useState<Contribution | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");

  const fetchContributions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filter.type !== "ALL") params.set("type", filter.type);
      if (filter.status !== "ALL") params.set("status", filter.status);

      const response = await fetch(`/api/contributions?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch contributions");
      }

      setContributions(data.contributions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void fetchContributions();
  }, [fetchContributions]);

  const handleAction = async (
    action: "approve" | "reject" | "review" | "implement" | "duplicate"
  ) => {
    if (!selectedContribution) return;
    setActionLoading(true);

    try {
      const response = await fetch(
        `/api/admin/contributions/${selectedContribution.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, notes: reviewNotes }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update contribution");
      }

      // Refresh list and close modal
      await fetchContributions();
      setSelectedContribution(null);
      setReviewNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedContribution) return;
    if (!confirm("Are you sure you want to delete this contribution?")) return;

    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/admin/contributions/${selectedContribution.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete contribution");
      }

      await fetchContributions();
      setSelectedContribution(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-card rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Type:</label>
          <select
            value={filter.type}
            onChange={(e) =>
              setFilter((f) => ({
                ...f,
                type: e.target.value as ContributionType | "ALL",
              }))
            }
            className="px-3 py-1.5 rounded border border-border bg-background text-sm"
          >
            <option value="ALL">All Types</option>
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Status:</label>
          <select
            value={filter.status}
            onChange={(e) =>
              setFilter((f) => ({
                ...f,
                status: e.target.value as ContributionStatus | "ALL",
              }))
            }
            className="px-3 py-1.5 rounded border border-border bg-background text-sm"
          >
            <option value="ALL">All Statuses</option>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchContributions}
          className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:opacity-90 transition"
        >
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12 text-muted-foreground">
          Loading contributions...
        </div>
      )}

      {/* Empty state */}
      {!loading && contributions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold mb-2">No contributions found</h3>
          <p className="text-muted-foreground">
            No contributions match your current filters.
          </p>
        </div>
      )}

      {/* Contributions list */}
      {!loading && contributions.length > 0 && (
        <div className="space-y-4">
          {contributions.map((contribution) => (
            <div
              key={contribution.id}
              onClick={() => {
                setSelectedContribution(contribution);
              }}
              className="p-4 bg-card rounded-lg border border-border hover:border-primary cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded ${TYPE_COLORS[contribution.type as ContributionType]}`}
                    >
                      {TYPE_LABELS[contribution.type as ContributionType]}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded ${STATUS_COLORS[contribution.status as ContributionStatus]}`}
                    >
                      {STATUS_LABELS[contribution.status as ContributionStatus]}
                    </span>
                  </div>
                  <h3 className="font-semibold truncate">
                    {contribution.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {contribution.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    {contribution.treeSlug && (
                      <span>Tree: {contribution.treeSlug}</span>
                    )}
                    <span>
                      {new Date(contribution.createdAt).toLocaleDateString()}
                    </span>
                    {contribution.contributorName && (
                      <span>By: {contribution.contributorName}</span>
                    )}
                  </div>
                </div>
                <div className="text-2xl">→</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedContribution && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded ${TYPE_COLORS[selectedContribution.type as ContributionType]}`}
                    >
                      {
                        TYPE_LABELS[
                          selectedContribution.type as ContributionType
                        ]
                      }
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded ${STATUS_COLORS[selectedContribution.status as ContributionStatus]}`}
                    >
                      {
                        STATUS_LABELS[
                          selectedContribution.status as ContributionStatus
                        ]
                      }
                    </span>
                  </div>
                  <h2 className="text-xl font-bold">
                    {selectedContribution.title}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setSelectedContribution(null);
                  }}
                  className="text-2xl text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>

              {/* Details */}
              <div className="space-y-4">
                {selectedContribution.treeSlug && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Target Tree
                    </label>
                    <p className="mt-1">{selectedContribution.treeSlug}</p>
                  </div>
                )}

                {selectedContribution.targetField && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Target Field
                    </label>
                    <p className="mt-1">{selectedContribution.targetField}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Description
                  </label>
                  <p className="mt-1 whitespace-pre-wrap">
                    {selectedContribution.description}
                  </p>
                </div>

                {selectedContribution.evidence && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Evidence/Sources
                    </label>
                    <p className="mt-1 whitespace-pre-wrap">
                      {selectedContribution.evidence}
                    </p>
                  </div>
                )}

                {/* New species specific fields */}
                {selectedContribution.type === "NEW_SPECIES" && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedContribution.scientificName && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Scientific Name
                        </label>
                        <p className="mt-1 italic">
                          {selectedContribution.scientificName}
                        </p>
                      </div>
                    )}
                    {selectedContribution.family && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Family
                        </label>
                        <p className="mt-1">{selectedContribution.family}</p>
                      </div>
                    )}
                    {selectedContribution.commonNameEn && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Common Name (EN)
                        </label>
                        <p className="mt-1">
                          {selectedContribution.commonNameEn}
                        </p>
                      </div>
                    )}
                    {selectedContribution.commonNameEs && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Common Name (ES)
                        </label>
                        <p className="mt-1">
                          {selectedContribution.commonNameEs}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Contributor info */}
                <div className="border-t border-border pt-4">
                  <label className="text-sm font-medium text-muted-foreground">
                    Contributor
                  </label>
                  <div className="mt-1 text-sm">
                    {selectedContribution.contributorName || "Anonymous"}
                    {selectedContribution.contributorEmail && (
                      <span className="ml-2 text-muted-foreground">
                        ({selectedContribution.contributorEmail})
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Submitted:{" "}
                    {new Date(selectedContribution.createdAt).toLocaleString()}
                  </div>
                </div>

                {/* Review notes */}
                {selectedContribution.status === "PENDING" && (
                  <div className="border-t border-border pt-4">
                    <label className="text-sm font-medium">
                      Review Notes (optional)
                    </label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => {
                        setReviewNotes(e.target.value);
                      }}
                      placeholder="Add notes about your decision..."
                      rows={3}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background resize-y"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              {selectedContribution.status === "PENDING" && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                  <button
                    onClick={() => handleAction("approve")}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleAction("review")}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    📋 Mark for Review
                  </button>
                  <button
                    onClick={() => handleAction("duplicate")}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition"
                  >
                    📄 Duplicate
                  </button>
                  <button
                    onClick={() => handleAction("reject")}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
                  >
                    ✗ Reject
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50 transition"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}

              {selectedContribution.status === "APPROVED" && (
                <div className="flex gap-2 pt-4 border-t border-border">
                  <button
                    onClick={() => handleAction("implement")}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
                  >
                    ✓ Mark as Implemented
                  </button>
                </div>
              )}

              {/* Close */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setSelectedContribution(null)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
