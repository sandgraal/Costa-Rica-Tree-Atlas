/**
 * Image Review System Types
 *
 * These types mirror the Prisma schema definitions for the image review system.
 * They can be used in places where Prisma client types are not yet available
 * (e.g., before migrations are applied).
 *
 * @see prisma/schema.prisma for the authoritative schema
 * @see docs/IMAGE_REVIEW_SYSTEM.md for system documentation
 */

// Proposal statuses
export type ImageProposalStatus =
  | "PENDING" // Awaiting admin review
  | "APPROVED" // Approved, ready to apply
  | "APPLIED" // Applied to the tree
  | "DENIED" // Rejected by admin
  | "ARCHIVED"; // Dismissed/expired

export const IMAGE_PROPOSAL_STATUSES: ImageProposalStatus[] = [
  "PENDING",
  "APPROVED",
  "APPLIED",
  "DENIED",
  "ARCHIVED",
];

// Source of the proposal
export type ImageProposalSource =
  | "WORKFLOW" // From weekly-image-quality workflow
  | "USER_UPLOAD" // From user photo upload
  | "USER_FLAG" // From user flagging an image
  | "ADMIN" // Manually created by admin
  | "SCRIPT"; // From ad-hoc scripts

export const IMAGE_PROPOSAL_SOURCES: ImageProposalSource[] = [
  "WORKFLOW",
  "USER_UPLOAD",
  "USER_FLAG",
  "ADMIN",
  "SCRIPT",
];

// Types of images in the tree gallery
export type ImageType =
  | "FEATURED" // Main hero image
  | "TREE" // Full tree view
  | "BARK" // Bark close-up
  | "LEAVES" // Leaves/foliage
  | "FLOWERS" // Flowers/blooms
  | "FRUIT" // Fruit/seeds
  | "ROOTS" // Root system
  | "HABITAT"; // Tree in its habitat/environment

export const IMAGE_TYPES: ImageType[] = [
  "FEATURED",
  "TREE",
  "BARK",
  "LEAVES",
  "FLOWERS",
  "FRUIT",
  "ROOTS",
  "HABITAT",
];

// Reasons for flagging an image
export type ImageFlagReason =
  | "MISLABELED" // Image doesn't match the type
  | "WRONG_SPECIES" // Image shows a different species
  | "POOR_QUALITY" // Blurry, low resolution, bad lighting
  | "INAPPROPRIATE" // Offensive or irrelevant content
  | "COPYRIGHT" // Potential copyright violation
  | "OTHER"; // Other reason

export const IMAGE_FLAG_REASONS: ImageFlagReason[] = [
  "MISLABELED",
  "WRONG_SPECIES",
  "POOR_QUALITY",
  "INAPPROPRIATE",
  "COPYRIGHT",
  "OTHER",
];

// Audit action types
export type ImageAuditAction =
  | "PROPOSAL_CREATED" // New proposal submitted
  | "PROPOSAL_APPROVED" // Admin approved the proposal
  | "PROPOSAL_DENIED" // Admin denied the proposal
  | "PROPOSAL_APPLIED" // Approved proposal was applied
  | "PROPOSAL_ARCHIVED" // Proposal was archived/expired
  | "IMAGE_REPLACED" // Image file was replaced
  | "IMAGE_DELETED" // Image was removed
  | "VOTE_CAST" // User voted on image
  | "FLAG_SUBMITTED"; // User flagged an image

export const IMAGE_AUDIT_ACTIONS: ImageAuditAction[] = [
  "PROPOSAL_CREATED",
  "PROPOSAL_APPROVED",
  "PROPOSAL_DENIED",
  "PROPOSAL_APPLIED",
  "PROPOSAL_ARCHIVED",
  "IMAGE_REPLACED",
  "IMAGE_DELETED",
  "VOTE_CAST",
  "FLAG_SUBMITTED",
];

// Input type for creating a proposal
export interface CreateProposalInput {
  treeSlug: string;
  imageType: ImageType;
  currentUrl?: string;
  currentSource?: string;
  currentAlt?: string;
  proposedUrl: string;
  proposedSource?: string;
  proposedAlt?: string;
  qualityScore?: number;
  resolution?: string;
  fileSize?: number;
  source: ImageProposalSource;
  reason?: string;
  workflowRunId?: string;
}

// Full proposal type (matches Prisma model)
export interface ImageProposal {
  id: string;
  treeSlug: string;
  imageType: ImageType;
  currentUrl: string | null;
  currentSource: string | null;
  currentAlt: string | null;
  proposedUrl: string;
  proposedSource: string | null;
  proposedAlt: string | null;
  qualityScore: number | null;
  resolution: string | null;
  fileSize: number | null;
  source: ImageProposalSource;
  reason: string | null;
  workflowRunId: string | null;
  status: ImageProposalStatus;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  reviewNotes: string | null;
  upvotes: number;
  downvotes: number;
  flagCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Vote type (matches Prisma model)
export interface ImageVote {
  id: string;
  proposalId: string | null;
  treeSlug: string;
  imageType: ImageType;
  isUpvote: boolean | null;
  isFlag: boolean;
  flagReason: ImageFlagReason | null;
  flagNotes: string | null;
  sessionId: string;
  ipHash: string | null;
  userId: string | null;
  createdAt: Date;
}

// Audit entry type (matches Prisma model)
export interface ImageAudit {
  id: string;
  proposalId: string | null;
  treeSlug: string;
  imageType: ImageType | null;
  action: ImageAuditAction;
  actorId: string | null;
  actorSession: string | null;
  ipAddress: string | null;
  previousValue: string | null;
  newValue: string | null;
  notes: string | null;
  createdAt: Date;
}
