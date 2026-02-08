-- CreateEnum: ImageProposalStatus
CREATE TYPE "ImageProposalStatus" AS ENUM ('PENDING', 'APPROVED', 'APPLIED', 'DENIED', 'ARCHIVED');

-- CreateEnum: ImageProposalSource
-- Note: If upgrading an existing database where this enum already exists without USER_UPLOAD,
-- run: ALTER TYPE "ImageProposalSource" ADD VALUE 'USER_UPLOAD' BEFORE 'USER_FLAG';
CREATE TYPE "ImageProposalSource" AS ENUM ('WORKFLOW', 'USER_UPLOAD', 'USER_FLAG', 'ADMIN', 'SCRIPT');

-- CreateEnum: ImageType
CREATE TYPE "ImageType" AS ENUM ('FEATURED', 'TREE', 'BARK', 'LEAVES', 'FLOWERS', 'FRUIT', 'ROOTS', 'HABITAT');

-- CreateEnum: ImageFlagReason
CREATE TYPE "ImageFlagReason" AS ENUM ('MISLABELED', 'WRONG_SPECIES', 'POOR_QUALITY', 'INAPPROPRIATE', 'COPYRIGHT', 'OTHER');

-- CreateEnum: ImageAuditAction
CREATE TYPE "ImageAuditAction" AS ENUM ('PROPOSAL_CREATED', 'PROPOSAL_APPROVED', 'PROPOSAL_DENIED', 'PROPOSAL_APPLIED', 'PROPOSAL_ARCHIVED', 'IMAGE_REPLACED', 'IMAGE_DELETED', 'VOTE_CAST', 'FLAG_SUBMITTED');

-- CreateTable: image_proposals
CREATE TABLE "image_proposals" (
    "id" TEXT NOT NULL,
    "tree_slug" VARCHAR(100) NOT NULL,
    "image_type" "ImageType" NOT NULL,
    "current_url" TEXT,
    "current_source" VARCHAR(255),
    "current_alt" TEXT,
    "proposed_url" TEXT NOT NULL,
    "proposed_source" VARCHAR(255),
    "proposed_alt" TEXT,
    "quality_score" DOUBLE PRECISION,
    "resolution" VARCHAR(20),
    "file_size" INTEGER,
    "source" "ImageProposalSource" NOT NULL,
    "reason" TEXT,
    "workflow_run_id" VARCHAR(100),
    "status" "ImageProposalStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "review_notes" TEXT,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "flag_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "image_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable: image_votes
CREATE TABLE "image_votes" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT,
    "tree_slug" VARCHAR(100) NOT NULL,
    "image_type" "ImageType" NOT NULL,
    "is_upvote" BOOLEAN,
    "is_flag" BOOLEAN NOT NULL DEFAULT false,
    "flag_reason" "ImageFlagReason",
    "flag_notes" TEXT,
    "session_id" VARCHAR(64) NOT NULL,
    "ip_hash" VARCHAR(64),
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "image_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable: image_audits
CREATE TABLE "image_audits" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT,
    "tree_slug" VARCHAR(100) NOT NULL,
    "image_type" "ImageType",
    "action" "ImageAuditAction" NOT NULL,
    "actor_id" TEXT,
    "actor_session" VARCHAR(64),
    "ip_address" VARCHAR(45),
    "previous_value" TEXT,
    "new_value" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "image_audits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: image_proposals
CREATE INDEX "image_proposals_tree_slug_idx" ON "image_proposals"("tree_slug");
CREATE INDEX "image_proposals_status_idx" ON "image_proposals"("status");
CREATE INDEX "image_proposals_source_idx" ON "image_proposals"("source");
CREATE INDEX "image_proposals_created_at_idx" ON "image_proposals"("created_at");

-- CreateIndex: image_votes
CREATE UNIQUE INDEX "image_votes_proposal_id_session_id_key" ON "image_votes"("proposal_id", "session_id");
CREATE UNIQUE INDEX "image_votes_tree_slug_image_type_session_id_key" ON "image_votes"("tree_slug", "image_type", "session_id");
CREATE INDEX "image_votes_proposal_id_idx" ON "image_votes"("proposal_id");
CREATE INDEX "image_votes_tree_slug_image_type_idx" ON "image_votes"("tree_slug", "image_type");
CREATE INDEX "image_votes_session_id_idx" ON "image_votes"("session_id");

-- CreateIndex: image_audits
CREATE INDEX "image_audits_proposal_id_idx" ON "image_audits"("proposal_id");
CREATE INDEX "image_audits_tree_slug_idx" ON "image_audits"("tree_slug");
CREATE INDEX "image_audits_action_idx" ON "image_audits"("action");
CREATE INDEX "image_audits_created_at_idx" ON "image_audits"("created_at");

-- AddForeignKey: image_votes -> image_proposals
ALTER TABLE "image_votes" ADD CONSTRAINT "image_votes_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "image_proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: image_audits -> image_proposals
ALTER TABLE "image_audits" ADD CONSTRAINT "image_audits_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "image_proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
