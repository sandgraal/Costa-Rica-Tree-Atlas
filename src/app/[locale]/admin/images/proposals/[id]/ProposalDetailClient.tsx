"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@i18n/navigation";
import {
  type ImageProposal,
  type ImageProposalStatus,
  type ImageAudit,
} from "@/types/image-review";

interface ProposalDetailResponse {
  data: ImageProposal & {
    votes: {
      upvotes: number;
      downvotes: number;
      flags: number;
    };
    auditHistory: ImageAudit[];
  };
}

interface ProposalDetailClientProps {
  proposalId: string;
}

export default function ProposalDetailClient({
  proposalId,
}: ProposalDetailClientProps) {
  const [proposal, setProposal] = useState<
    ProposalDetailResponse["data"] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");

  useEffect(() => {
    const fetchProposal = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/admin/images/proposals/${proposalId}`
        );

        if (response.status === 503) {
          setError("Database not initialized. Please run migrations first.");
          return;
        }

        if (response.status === 401) {
          setError("Unauthorized. Please log in.");
          return;
        }

        if (response.status === 404) {
          setError("Proposal not found.");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch proposal");
        }

        const data: ProposalDetailResponse = await response.json();
        setProposal(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    void fetchProposal();
  }, [proposalId]);

  const handleStatusChange = async (newStatus: ImageProposalStatus) => {
    if (!proposal) return;
    setActionLoading(true);

    try {
      const response = await fetch(
        `/api/admin/images/proposals/${proposalId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: newStatus,
            reviewNotes: reviewNotes || undefined,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update proposal");
      }

      // Refresh the proposal
      const refreshResponse = await fetch(
        `/api/admin/images/proposals/${proposalId}`
      );
      const data: ProposalDetailResponse = await refreshResponse.json();
      setProposal(data.data);
      setReviewNotes("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update proposal");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status: ImageProposalStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case "APPROVED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "APPLIED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "DENIED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="h-8 bg-muted rounded w-1/3 mb-4" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-xl" />
            <div className="aspect-square bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-6 text-red-600">
        <p className="font-medium">Error</p>
        <p className="text-sm">{error}</p>
        <Link
          href="/admin/images/proposals"
          className="inline-block mt-4 text-sm underline hover:no-underline"
        >
          ← Back to Proposals
        </Link>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <p className="text-muted-foreground">Proposal not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with status */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-foreground">
                <Link
                  href={`/trees/${proposal.treeSlug}`}
                  className="hover:text-primary"
                >
                  {proposal.treeSlug}
                </Link>
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(proposal.status)}`}
              >
                {proposal.status}
              </span>
            </div>
            <p className="text-muted-foreground mt-1">
              {proposal.imageType} image • {proposal.source.replace("_", " ")} •
              Created {formatDate(proposal.createdAt)}
            </p>
          </div>

          {/* Vote summary */}
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1 text-green-600">
              <span className="text-lg">👍</span> {proposal.votes.upvotes}
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <span className="text-lg">👎</span> {proposal.votes.downvotes}
            </span>
            {proposal.votes.flags > 0 && (
              <span className="flex items-center gap-1 text-orange-600">
                <span className="text-lg">🚩</span> {proposal.votes.flags}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Image Comparison
        </h3>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Current image */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Current Image
            </h4>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border">
              {proposal.currentUrl ? (
                <Image
                  src={proposal.currentUrl}
                  alt="Current image"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <span className="text-4xl block mb-2">📷</span>
                    <span className="text-sm">No current image</span>
                  </div>
                </div>
              )}
            </div>
            {proposal.currentSource && (
              <p className="text-xs text-muted-foreground mt-2 truncate">
                Source: {proposal.currentSource}
              </p>
            )}
          </div>

          {/* Proposed image */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Proposed Image
            </h4>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted border-2 border-primary">
              <Image
                src={proposal.proposedUrl}
                alt="Proposed image"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                NEW
              </div>
            </div>
            {proposal.proposedSource && (
              <p className="text-xs text-muted-foreground mt-2 truncate">
                Source: {proposal.proposedSource}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quality metrics */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Quality Metrics
          </h3>
          <dl className="space-y-3">
            {proposal.qualityScore !== null && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Quality Score</dt>
                <dd className="font-medium">
                  <span
                    className={
                      proposal.qualityScore >= 80
                        ? "text-green-600"
                        : proposal.qualityScore >= 60
                          ? "text-amber-600"
                          : "text-red-600"
                    }
                  >
                    {proposal.qualityScore.toFixed(0)}%
                  </span>
                </dd>
              </div>
            )}
            {proposal.resolution && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Resolution</dt>
                <dd className="font-medium">{proposal.resolution}</dd>
              </div>
            )}
            {proposal.fileSize && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">File Size</dt>
                <dd className="font-medium">
                  {(proposal.fileSize / 1024).toFixed(0)} KB
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Image Type</dt>
              <dd className="font-medium">{proposal.imageType}</dd>
            </div>
          </dl>
        </div>

        {/* Reason */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Proposal Reason
          </h3>
          {proposal.reason ? (
            <p className="text-muted-foreground">{proposal.reason}</p>
          ) : (
            <p className="text-muted-foreground italic">No reason provided</p>
          )}
          {proposal.workflowRunId && (
            <p className="text-xs text-muted-foreground mt-4">
              Workflow Run:{" "}
              <code className="bg-muted px-1 rounded">
                {proposal.workflowRunId}
              </code>
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      {(proposal.status === "PENDING" || proposal.status === "APPROVED") && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Take Action
          </h3>

          {/* Review notes */}
          <div className="mb-4">
            <label
              htmlFor="reviewNotes"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Review Notes (optional)
            </label>
            <textarea
              id="reviewNotes"
              value={reviewNotes}
              onChange={(e) => {
                setReviewNotes(e.target.value);
              }}
              placeholder="Add notes about your decision..."
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {proposal.status === "PENDING" && (
              <>
                <button
                  onClick={() => handleStatusChange("APPROVED")}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading ? "..." : "✓ Approve"}
                </button>
                <button
                  onClick={() => handleStatusChange("DENIED")}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading ? "..." : "✗ Deny"}
                </button>
                <button
                  onClick={() => handleStatusChange("ARCHIVED")}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading ? "..." : "Archive"}
                </button>
              </>
            )}

            {proposal.status === "APPROVED" && (
              <button
                onClick={() => handleStatusChange("APPLIED")}
                disabled={actionLoading}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading ? "..." : "🚀 Apply Image"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Review info (if already reviewed) */}
      {proposal.reviewedAt && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Review Information
          </h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Reviewed At</dt>
              <dd className="font-medium">{formatDate(proposal.reviewedAt)}</dd>
            </div>
            {proposal.reviewedBy && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Reviewed By</dt>
                <dd className="font-medium">{proposal.reviewedBy}</dd>
              </div>
            )}
            {proposal.reviewNotes && (
              <div className="mt-3">
                <dt className="text-muted-foreground mb-1">Review Notes</dt>
                <dd className="bg-muted rounded-lg p-3 text-sm">
                  {proposal.reviewNotes}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Audit history */}
      {proposal.auditHistory && proposal.auditHistory.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Audit History
          </h3>
          <div className="space-y-3">
            {proposal.auditHistory.map((audit) => (
              <div
                key={audit.id}
                className="flex items-start gap-3 text-sm border-l-2 border-muted pl-4"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {audit.action.replace(/_/g, " ")}
                  </p>
                  {audit.notes && (
                    <p className="text-muted-foreground">{audit.notes}</p>
                  )}
                </div>
                <time className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(audit.createdAt)}
                </time>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
