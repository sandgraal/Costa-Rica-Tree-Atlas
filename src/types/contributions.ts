/**
 * Community Contributions System Types
 *
 * These types mirror the Prisma schema definitions for the contribution system.
 * They can be used in places where Prisma client types are not yet available
 * (e.g., before migrations are applied).
 *
 * @see prisma/schema.prisma for the authoritative schema
 */

// Types of community contributions
export type ContributionType =
  | "NEW_SPECIES" // Suggest a new tree species to add
  | "CORRECTION" // Suggest correction to existing content
  | "LOCAL_KNOWLEDGE" // Share traditional/local knowledge
  | "TRANSLATION"; // Suggest translation improvement

export const CONTRIBUTION_TYPES: ContributionType[] = [
  "NEW_SPECIES",
  "CORRECTION",
  "LOCAL_KNOWLEDGE",
  "TRANSLATION",
];

// Status of a contribution
export type ContributionStatus =
  | "PENDING" // Awaiting review
  | "UNDER_REVIEW" // Being reviewed by moderator
  | "APPROVED" // Approved, pending implementation
  | "IMPLEMENTED" // Changes applied to content
  | "REJECTED" // Rejected by moderator
  | "DUPLICATE"; // Already exists or submitted

export const CONTRIBUTION_STATUSES: ContributionStatus[] = [
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "IMPLEMENTED",
  "REJECTED",
  "DUPLICATE",
];

// Priority levels for contributions
export type ContributionPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export const CONTRIBUTION_PRIORITIES: ContributionPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

// Target fields that can be corrected
export const CORRECTABLE_FIELDS = [
  "title",
  "scientificName",
  "description",
  "family",
  "nativeRegion",
  "distribution",
  "habitat",
  "cultivation",
  "uses",
  "ecology",
  "conservation",
  "taxonomy",
  "etymology",
  "other",
] as const;

export type CorrectableField = (typeof CORRECTABLE_FIELDS)[number];

// Knowledge types for LOCAL_KNOWLEDGE contributions
export const KNOWLEDGE_TYPES = [
  "traditional_uses", // Medicinal, cultural, spiritual uses
  "local_names", // Regional/indigenous names
  "folklore", // Stories, legends, beliefs
  "preparation", // How to prepare/process
  "harvesting", // Best practices for harvesting
  "cultivation_tips", // Local growing advice
  "wildlife", // Animal interactions observed
  "other",
] as const;

export type KnowledgeType = (typeof KNOWLEDGE_TYPES)[number];

/**
 * Base contribution interface
 */
export interface Contribution {
  id: string;
  type: ContributionType;

  // Target (null for new species)
  treeSlug: string | null;
  targetField: string | null;

  // Content
  title: string;
  description: string;
  evidence: string | null;

  // For NEW_SPECIES type
  scientificName: string | null;
  commonNameEn: string | null;
  commonNameEs: string | null;
  family: string | null;
  proposedImages: string[];

  // Contributor info
  contributorName: string | null;
  contributorEmail: string | null;
  sessionId: string;
  ipHash: string | null;
  userId: string | null;

  // Review workflow
  status: ContributionStatus;
  priority: ContributionPriority;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  reviewNotes: string | null;
  resolvedPrId: string | null;

  // Metadata
  locale: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Form data for submitting a new species suggestion
 */
export interface NewSpeciesFormData {
  // Required
  title: string; // What they call it locally
  description: string; // Description of the tree

  // Species info
  scientificName?: string;
  commonNameEn?: string;
  commonNameEs?: string;
  family?: string;

  // Evidence/sources
  evidence?: string;

  // Contributor info (optional)
  contributorName?: string;
  contributorEmail?: string;

  // Location info
  whereFound?: string;
}

/**
 * Form data for submitting a correction
 */
export interface CorrectionFormData {
  // Required
  treeSlug: string;
  targetField: CorrectableField;
  title: string; // Brief summary of the correction
  description: string; // The correct information

  // Evidence/sources
  evidence?: string;

  // Contributor info (optional)
  contributorName?: string;
  contributorEmail?: string;
}

/**
 * Form data for sharing local knowledge
 */
export interface LocalKnowledgeFormData {
  // Required
  treeSlug: string;
  knowledgeType: KnowledgeType;
  title: string; // Brief summary
  description: string; // The knowledge being shared

  // Optional context
  evidence?: string; // Sources, personal experience
  region?: string; // Where this knowledge is from

  // Contributor info
  contributorName?: string;
  contributorEmail?: string;
}

/**
 * Form data for translation suggestions
 */
export interface TranslationFormData {
  // Required
  treeSlug: string;
  targetField: CorrectableField;
  title: string; // Brief summary
  description: string; // The improved translation

  // Contributor info (optional)
  contributorName?: string;
  contributorEmail?: string;
}

/**
 * API response for contribution operations
 */
export interface ContributionResponse {
  success: boolean;
  contribution?: Contribution;
  error?: string;
  message?: string;
}

/**
 * API response for listing contributions
 */
export interface ContributionsListResponse {
  contributions: Contribution[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Filters for listing contributions
 */
export interface ContributionFilters {
  type?: ContributionType;
  status?: ContributionStatus;
  treeSlug?: string;
  priority?: ContributionPriority;
  page?: number;
  pageSize?: number;
}

/**
 * Admin review action
 */
export interface ContributionReviewAction {
  contributionId: string;
  action: "approve" | "reject" | "review" | "implement";
  notes?: string;
  priority?: ContributionPriority;
  resolvedPrId?: string;
}
