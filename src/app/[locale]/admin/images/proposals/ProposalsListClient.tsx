"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@i18n/navigation";
import {
  type ImageProposal,
  type ImageProposalStatus,
  type ImageProposalSource,
  IMAGE_PROPOSAL_STATUSES,
  IMAGE_PROPOSAL_SOURCES,
} from "@/types/image-review";

interface ProposalsResponse {
  data: ImageProposal[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type FilterStatus = ImageProposalStatus | "ALL";

export default function ProposalsListClient() {
  const t = useTranslations("admin.images");
  const [proposals, setProposals] = useState<ImageProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("PENDING");
  const [filterSource, setFilterSource] = useState<ImageProposalSource | "ALL">(
    "ALL"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");
      if (filterStatus !== "ALL") params.set("status", filterStatus);
      if (filterSource !== "ALL") params.set("source", filterSource);
      if (searchQuery) params.set("treeSlug", searchQuery);

      const response = await fetch(`/api/admin/images/proposals?${params}`);

      if (response.status === 503) {
        setError(t("proposals.errors.databaseNotInitialized"));
        setProposals([]);
        return;
      }

      if (response.status === 401) {
        setError(t("proposals.errors.unauthorized"));
        setProposals([]);
        return;
      }

      if (!response.ok) {
        throw new Error(t("proposals.errors.fetchFailed"));
      }

      const data: ProposalsResponse = await response.json();
      setProposals(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("proposals.errors.generic")
      );
      setProposals([]);
    } finally {
      setLoading(false);
    }
  }, [filterSource, filterStatus, page, searchQuery, t]);

  useEffect(() => {
    void fetchProposals();
  }, [fetchProposals]);

  const handleStatusChange = async (
    proposalId: string,
    newStatus: ImageProposalStatus,
    notes?: string
  ) => {
    setActionLoading(proposalId);

    try {
      const response = await fetch(
        `/api/admin/images/proposals/${proposalId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus, reviewNotes: notes }),
        }
      );

      if (!response.ok) {
        throw new Error(t("proposals.errors.updateFailed"));
      }

      // Refresh the list
      await fetchProposals();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : t("proposals.errors.updateFailed")
      );
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusLabel = (status: ImageProposalStatus | FilterStatus) => {
    switch (status) {
      case "PENDING":
        return t("proposals.statuses.pending");
      case "APPROVED":
        return t("proposals.statuses.approved");
      case "APPLIED":
        return t("proposals.statuses.applied");
      case "DENIED":
        return t("proposals.statuses.denied");
      case "ARCHIVED":
        return t("proposals.statuses.archived");
      case "ALL":
        return t("proposals.allStatuses");
      default:
        return status;
    }
  };

  const getSourceLabel = (source: ImageProposalSource | "ALL") => {
    switch (source) {
      case "WORKFLOW":
        return t("proposals.sources.workflow");
      case "USER_FLAG":
        return t("proposals.sources.userFlag");
      case "ADMIN":
        return t("proposals.sources.admin");
      case "SCRIPT":
        return t("proposals.sources.script");
      case "ALL":
        return t("proposals.allSources");
      default:
        return source;
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

  const getSourceBadgeClass = (source: ImageProposalSource) => {
    switch (source) {
      case "WORKFLOW":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "USER_FLAG":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "ADMIN":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300";
      case "SCRIPT":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              {t("proposals.searchByTreeSlug")}
            </label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder={t("proposals.searchPlaceholder")}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              {t("proposals.status")}
            </label>
            <select
              id="status"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as FilterStatus);
                setPage(1);
              }}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">{t("proposals.allStatuses")}</option>
              {IMAGE_PROPOSAL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <label
              htmlFor="source"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              {t("proposals.source")}
            </label>
            <select
              id="source"
              value={filterSource}
              onChange={(e) => {
                setFilterSource(e.target.value as ImageProposalSource | "ALL");
                setPage(1);
              }}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">{t("proposals.allSources")}</option>
              {IMAGE_PROPOSAL_SOURCES.map((source) => (
                <option key={source} value={source}>
                  {getSourceLabel(source)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick filters */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <button
            onClick={() => {
              setFilterStatus("PENDING");
              setPage(1);
            }}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filterStatus === "PENDING"
                ? "bg-amber-500 text-white"
                : "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300"
            }`}
          >
            ⏳ {t("proposals.statuses.pending")}
          </button>
          <button
            onClick={() => {
              setFilterStatus("APPROVED");
              setPage(1);
            }}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filterStatus === "APPROVED"
                ? "bg-blue-500 text-white"
                : "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
            }`}
          >
            ✓ {t("proposals.statuses.approved")}
          </button>
          <button
            onClick={() => {
              setFilterStatus("APPLIED");
              setPage(1);
            }}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filterStatus === "APPLIED"
                ? "bg-green-500 text-white"
                : "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300"
            }`}
          >
            ✅ {t("proposals.statuses.applied")}
          </button>
          <button
            onClick={() => {
              setFilterStatus("DENIED");
              setPage(1);
            }}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filterStatus === "DENIED"
                ? "bg-red-500 text-white"
                : "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
            }`}
          >
            ✗ {t("proposals.statuses.denied")}
          </button>
          <button
            onClick={() => {
              setFilterStatus("ALL");
              setPage(1);
            }}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filterStatus === "ALL"
                ? "bg-gray-500 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {t("proposals.quickFiltersAll")}
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {loading
          ? t("proposals.loading")
          : t("proposals.resultsCount", { count: total })}
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-4 text-red-600">
          <p className="font-medium">{t("proposals.errorTitle")}</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-4 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-muted rounded w-1/3" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Proposals list */}
      {!loading && !error && proposals.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-muted-foreground">{t("proposals.emptyTitle")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("proposals.emptyDescription")}
          </p>
        </div>
      )}

      {!loading && !error && proposals.length > 0 && (
        <div className="grid gap-4">
          {proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Images comparison */}
                <div className="flex gap-2">
                  {/* Current image */}
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {proposal.currentUrl ? (
                      <Image
                        src={proposal.currentUrl}
                        alt={t("proposals.currentImageAlt")}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        {t("proposals.noCurrent")}
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-0.5 text-center">
                      {t("proposals.current")}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center text-muted-foreground">
                    →
                  </div>

                  {/* Proposed image */}
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0 ring-2 ring-primary">
                    <Image
                      src={proposal.proposedUrl}
                      alt={t("proposals.proposedImageAlt")}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-xs py-0.5 text-center">
                      {t("proposals.proposed")}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        <Link
                          href={`/trees/${proposal.treeSlug}`}
                          className="hover:text-primary"
                        >
                          {proposal.treeSlug}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t("proposals.imageTypeLabel", {
                          imageType: proposal.imageType,
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(proposal.status)}`}
                      >
                        {getStatusLabel(proposal.status)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSourceBadgeClass(proposal.source)}`}
                      >
                        {getSourceLabel(proposal.source)}
                      </span>
                    </div>
                  </div>

                  {/* Reason */}
                  {proposal.reason && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {proposal.reason}
                    </p>
                  )}

                  {/* Metrics */}
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    {proposal.qualityScore !== null && (
                      <span>
                        {t("proposals.quality")}:{" "}
                        {proposal.qualityScore.toFixed(0)}%
                      </span>
                    )}
                    {proposal.resolution && (
                      <span>
                        {t("proposals.resolution")}: {proposal.resolution}
                      </span>
                    )}
                    <span>
                      {t("proposals.created")}: {formatDate(proposal.createdAt)}
                    </span>
                  </div>

                  {/* Vote counts */}
                  <div className="flex gap-4 mt-2 text-xs">
                    <span className="text-green-600">
                      👍 {proposal.upvotes}
                    </span>
                    <span className="text-red-600">
                      👎 {proposal.downvotes}
                    </span>
                    {proposal.flagCount > 0 && (
                      <span className="text-orange-600">
                        🚩 {t("proposals.flags", { count: proposal.flagCount })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {proposal.status === "PENDING" && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() =>
                        handleStatusChange(proposal.id, "APPROVED")
                      }
                      disabled={actionLoading === proposal.id}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading === proposal.id
                        ? "..."
                        : t("proposals.approve")}
                    </button>
                    <button
                      onClick={() => handleStatusChange(proposal.id, "DENIED")}
                      disabled={actionLoading === proposal.id}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading === proposal.id
                        ? "..."
                        : t("proposals.deny")}
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(proposal.id, "ARCHIVED")
                      }
                      disabled={actionLoading === proposal.id}
                      className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading === proposal.id
                        ? "..."
                        : t("proposals.archive")}
                    </button>
                  </div>
                )}

                {proposal.status === "APPROVED" && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleStatusChange(proposal.id, "APPLIED")}
                      disabled={actionLoading === proposal.id}
                      className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading === proposal.id
                        ? "..."
                        : t("proposals.apply")}
                    </button>
                  </div>
                )}

                {(proposal.status === "DENIED" ||
                  proposal.status === "ARCHIVED") && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleStatusChange(proposal.id, "PENDING")}
                      disabled={actionLoading === proposal.id}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading === proposal.id
                        ? "..."
                        : t("proposals.reopen")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => {
              setPage((p) => Math.max(1, p - 1));
            }}
            disabled={page === 1}
            className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t("proposals.previous")}
          </button>
          <span className="px-4 py-2 text-muted-foreground">
            {t("proposals.pageOf", { page, totalPages })}
          </span>
          <button
            onClick={() => {
              setPage((p) => Math.min(totalPages, p + 1));
            }}
            disabled={page === totalPages}
            className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t("proposals.next")}
          </button>
        </div>
      )}
    </div>
  );
}
