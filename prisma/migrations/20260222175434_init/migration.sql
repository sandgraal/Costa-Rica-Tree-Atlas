-- CreateEnum
CREATE TYPE "ImageProposalStatus" AS ENUM ('PENDING', 'APPROVED', 'APPLIED', 'DENIED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ImageProposalSource" AS ENUM ('WORKFLOW', 'USER_UPLOAD', 'USER_FLAG', 'ADMIN', 'SCRIPT');

-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('FEATURED', 'TREE', 'BARK', 'LEAVES', 'FLOWERS', 'FRUIT', 'ROOTS', 'HABITAT');

-- CreateEnum
CREATE TYPE "ImageFlagReason" AS ENUM ('MISLABELED', 'WRONG_SPECIES', 'POOR_QUALITY', 'INAPPROPRIATE', 'COPYRIGHT', 'OTHER');

-- CreateEnum
CREATE TYPE "ImageAuditAction" AS ENUM ('PROPOSAL_CREATED', 'PROPOSAL_APPROVED', 'PROPOSAL_DENIED', 'PROPOSAL_APPLIED', 'PROPOSAL_ARCHIVED', 'IMAGE_REPLACED', 'IMAGE_DELETED', 'VOTE_CAST', 'FLAG_SUBMITTED');

-- CreateEnum
CREATE TYPE "ContributionType" AS ENUM ('NEW_SPECIES', 'CORRECTION', 'LOCAL_KNOWLEDGE', 'TRANSLATION');

-- CreateEnum
CREATE TYPE "ContributionStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'IMPLEMENTED', 'REJECTED', 'DUPLICATE');

-- CreateEnum
CREATE TYPE "ContributionPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mfa_secrets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totpSecret" TEXT,
    "backupCodes" TEXT[],
    "backupCodesUsed" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mfa_secrets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "eventType" VARCHAR(100) NOT NULL,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "image_proposals" (
    "id" TEXT NOT NULL,
    "treeSlug" VARCHAR(100) NOT NULL,
    "imageType" "ImageType" NOT NULL,
    "currentUrl" TEXT,
    "currentSource" VARCHAR(255),
    "currentAlt" TEXT,
    "proposedUrl" TEXT NOT NULL,
    "proposedSource" VARCHAR(255),
    "proposedAlt" TEXT,
    "qualityScore" DOUBLE PRECISION,
    "resolution" VARCHAR(20),
    "fileSize" INTEGER,
    "source" "ImageProposalSource" NOT NULL,
    "reason" TEXT,
    "workflowRunId" VARCHAR(100),
    "status" "ImageProposalStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "flagCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "image_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image_votes" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT,
    "treeSlug" VARCHAR(100) NOT NULL,
    "imageType" "ImageType" NOT NULL,
    "isUpvote" BOOLEAN,
    "isFlag" BOOLEAN NOT NULL DEFAULT false,
    "flagReason" "ImageFlagReason",
    "flagNotes" TEXT,
    "sessionId" VARCHAR(64) NOT NULL,
    "ipHash" VARCHAR(64),
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "image_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image_audits" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT,
    "treeSlug" VARCHAR(100) NOT NULL,
    "imageType" "ImageType",
    "action" "ImageAuditAction" NOT NULL,
    "actorId" TEXT,
    "actorSession" VARCHAR(64),
    "ipAddress" VARCHAR(45),
    "previousValue" TEXT,
    "newValue" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "image_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributions" (
    "id" TEXT NOT NULL,
    "type" "ContributionType" NOT NULL,
    "treeSlug" VARCHAR(100),
    "targetField" VARCHAR(100),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" TEXT,
    "scientificName" VARCHAR(255),
    "commonNameEn" VARCHAR(255),
    "commonNameEs" VARCHAR(255),
    "family" VARCHAR(100),
    "proposedImages" TEXT[],
    "contributorName" VARCHAR(255),
    "contributorEmail" VARCHAR(255),
    "sessionId" VARCHAR(64) NOT NULL,
    "ipHash" VARCHAR(64),
    "userId" TEXT,
    "status" "ContributionStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "ContributionPriority" NOT NULL DEFAULT 'MEDIUM',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "resolvedPrId" VARCHAR(100),
    "locale" VARCHAR(5) NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contributions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_expires_idx" ON "sessions"("expires");

-- CreateIndex
CREATE UNIQUE INDEX "mfa_secrets_userId_key" ON "mfa_secrets"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_eventType_idx" ON "audit_logs"("eventType");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "image_proposals_treeSlug_idx" ON "image_proposals"("treeSlug");

-- CreateIndex
CREATE INDEX "image_proposals_status_idx" ON "image_proposals"("status");

-- CreateIndex
CREATE INDEX "image_proposals_source_idx" ON "image_proposals"("source");

-- CreateIndex
CREATE INDEX "image_proposals_createdAt_idx" ON "image_proposals"("createdAt");

-- CreateIndex
CREATE INDEX "image_votes_proposalId_idx" ON "image_votes"("proposalId");

-- CreateIndex
CREATE INDEX "image_votes_treeSlug_imageType_idx" ON "image_votes"("treeSlug", "imageType");

-- CreateIndex
CREATE INDEX "image_votes_sessionId_idx" ON "image_votes"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "image_votes_proposalId_sessionId_key" ON "image_votes"("proposalId", "sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "image_votes_treeSlug_imageType_sessionId_key" ON "image_votes"("treeSlug", "imageType", "sessionId");

-- CreateIndex
CREATE INDEX "image_audits_proposalId_idx" ON "image_audits"("proposalId");

-- CreateIndex
CREATE INDEX "image_audits_treeSlug_idx" ON "image_audits"("treeSlug");

-- CreateIndex
CREATE INDEX "image_audits_action_idx" ON "image_audits"("action");

-- CreateIndex
CREATE INDEX "image_audits_createdAt_idx" ON "image_audits"("createdAt");

-- CreateIndex
CREATE INDEX "contributions_type_idx" ON "contributions"("type");

-- CreateIndex
CREATE INDEX "contributions_status_idx" ON "contributions"("status");

-- CreateIndex
CREATE INDEX "contributions_treeSlug_idx" ON "contributions"("treeSlug");

-- CreateIndex
CREATE INDEX "contributions_sessionId_idx" ON "contributions"("sessionId");

-- CreateIndex
CREATE INDEX "contributions_createdAt_idx" ON "contributions"("createdAt");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mfa_secrets" ADD CONSTRAINT "mfa_secrets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_votes" ADD CONSTRAINT "image_votes_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "image_proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_audits" ADD CONSTRAINT "image_audits_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "image_proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
