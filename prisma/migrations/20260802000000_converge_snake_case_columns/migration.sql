-- Converge column naming on snake_case.
--
-- Two mutually exclusive DDL definitions existed for these tables:
--   prisma/migrations/20260222175434_init/migration.sql -> "treeSlug", "createdAt"
--   prisma/manual/add_image_review_system.sql           -> "tree_slug", "created_at"
--
-- Roughly ten API routes issue raw SQL in snake_case; the Prisma client (which
-- had no field-level @map) expected camelCase. Whichever DDL was applied, half
-- the code was querying columns that did not exist — and every route wrapped the
-- failure in `catch { return false }`, reporting it as "system not initialized".
--
-- schema.prisma now carries @map directives for these models, so snake_case is
-- canonical. This migration renames the camelCase columns IF they are present,
-- which makes it correct against a database built from either source and a no-op
-- against one already in the target state.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_proposals' AND column_name = 'treeSlug'
  ) THEN
    EXECUTE 'ALTER TABLE "image_proposals" RENAME COLUMN "treeSlug" TO "tree_slug"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_proposals' AND column_name = 'imageType'
  ) THEN
    EXECUTE 'ALTER TABLE "image_proposals" RENAME COLUMN "imageType" TO "image_type"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_proposals' AND column_name = 'currentUrl'
  ) THEN
    EXECUTE 'ALTER TABLE "image_proposals" RENAME COLUMN "currentUrl" TO "current_url"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_proposals' AND column_name = 'currentSource'
  ) THEN
    EXECUTE 'ALTER TABLE "image_proposals" RENAME COLUMN "currentSource" TO "current_source"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_proposals' AND column_name = 'currentAlt'
  ) THEN
    EXECUTE 'ALTER TABLE "image_proposals" RENAME COLUMN "currentAlt" TO "current_alt"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_proposals' AND column_name = 'proposedUrl'
  ) THEN
    EXECUTE 'ALTER TABLE "image_proposals" RENAME COLUMN "proposedUrl" TO "proposed_url"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_proposals' AND column_name = 'proposedSource'
  ) THEN
    EXECUTE 'ALTER TABLE "image_proposals" RENAME COLUMN "proposedSource" TO "proposed_source"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_proposals' AND column_name = 'proposedAlt'
  ) THEN
    EXECUTE 'ALTER TABLE "image_proposals" RENAME COLUMN "proposedAlt" TO "proposed_alt"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_proposals' AND column_name = 'qualityScore'
  ) THEN
    EXECUTE 'ALTER TABLE "image_proposals" RENAME COLUMN "qualityScore" TO "quality_score"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_proposals' AND column_name = 'fileSize'
  ) THEN
    EXECUTE 'ALTER TABLE "image_proposals" RENAME COLUMN "fileSize" TO "file_size"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_proposals' AND column_name = 'workflowRunId'
  ) THEN
    EXECUTE 'ALTER TABLE "image_proposals" RENAME COLUMN "workflowRunId" TO "workflow_run_id"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_proposals' AND column_name = 'reviewedBy'
  ) THEN
    EXECUTE 'ALTER TABLE "image_proposals" RENAME COLUMN "reviewedBy" TO "reviewed_by"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_proposals' AND column_name = 'reviewedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "image_proposals" RENAME COLUMN "reviewedAt" TO "reviewed_at"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_proposals' AND column_name = 'reviewNotes'
  ) THEN
    EXECUTE 'ALTER TABLE "image_proposals" RENAME COLUMN "reviewNotes" TO "review_notes"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_proposals' AND column_name = 'flagCount'
  ) THEN
    EXECUTE 'ALTER TABLE "image_proposals" RENAME COLUMN "flagCount" TO "flag_count"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_proposals' AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "image_proposals" RENAME COLUMN "createdAt" TO "created_at"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_proposals' AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "image_proposals" RENAME COLUMN "updatedAt" TO "updated_at"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_votes' AND column_name = 'proposalId'
  ) THEN
    EXECUTE 'ALTER TABLE "image_votes" RENAME COLUMN "proposalId" TO "proposal_id"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_votes' AND column_name = 'treeSlug'
  ) THEN
    EXECUTE 'ALTER TABLE "image_votes" RENAME COLUMN "treeSlug" TO "tree_slug"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_votes' AND column_name = 'imageType'
  ) THEN
    EXECUTE 'ALTER TABLE "image_votes" RENAME COLUMN "imageType" TO "image_type"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_votes' AND column_name = 'isUpvote'
  ) THEN
    EXECUTE 'ALTER TABLE "image_votes" RENAME COLUMN "isUpvote" TO "is_upvote"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_votes' AND column_name = 'isFlag'
  ) THEN
    EXECUTE 'ALTER TABLE "image_votes" RENAME COLUMN "isFlag" TO "is_flag"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_votes' AND column_name = 'flagReason'
  ) THEN
    EXECUTE 'ALTER TABLE "image_votes" RENAME COLUMN "flagReason" TO "flag_reason"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_votes' AND column_name = 'flagNotes'
  ) THEN
    EXECUTE 'ALTER TABLE "image_votes" RENAME COLUMN "flagNotes" TO "flag_notes"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_votes' AND column_name = 'sessionId'
  ) THEN
    EXECUTE 'ALTER TABLE "image_votes" RENAME COLUMN "sessionId" TO "session_id"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_votes' AND column_name = 'ipHash'
  ) THEN
    EXECUTE 'ALTER TABLE "image_votes" RENAME COLUMN "ipHash" TO "ip_hash"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_votes' AND column_name = 'userId'
  ) THEN
    EXECUTE 'ALTER TABLE "image_votes" RENAME COLUMN "userId" TO "user_id"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_votes' AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "image_votes" RENAME COLUMN "createdAt" TO "created_at"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_audits' AND column_name = 'proposalId'
  ) THEN
    EXECUTE 'ALTER TABLE "image_audits" RENAME COLUMN "proposalId" TO "proposal_id"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_audits' AND column_name = 'treeSlug'
  ) THEN
    EXECUTE 'ALTER TABLE "image_audits" RENAME COLUMN "treeSlug" TO "tree_slug"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_audits' AND column_name = 'imageType'
  ) THEN
    EXECUTE 'ALTER TABLE "image_audits" RENAME COLUMN "imageType" TO "image_type"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_audits' AND column_name = 'actorId'
  ) THEN
    EXECUTE 'ALTER TABLE "image_audits" RENAME COLUMN "actorId" TO "actor_id"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_audits' AND column_name = 'actorSession'
  ) THEN
    EXECUTE 'ALTER TABLE "image_audits" RENAME COLUMN "actorSession" TO "actor_session"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_audits' AND column_name = 'ipAddress'
  ) THEN
    EXECUTE 'ALTER TABLE "image_audits" RENAME COLUMN "ipAddress" TO "ip_address"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_audits' AND column_name = 'previousValue'
  ) THEN
    EXECUTE 'ALTER TABLE "image_audits" RENAME COLUMN "previousValue" TO "previous_value"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_audits' AND column_name = 'newValue'
  ) THEN
    EXECUTE 'ALTER TABLE "image_audits" RENAME COLUMN "newValue" TO "new_value"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_audits' AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "image_audits" RENAME COLUMN "createdAt" TO "created_at"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributions' AND column_name = 'treeSlug'
  ) THEN
    EXECUTE 'ALTER TABLE "contributions" RENAME COLUMN "treeSlug" TO "tree_slug"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributions' AND column_name = 'targetField'
  ) THEN
    EXECUTE 'ALTER TABLE "contributions" RENAME COLUMN "targetField" TO "target_field"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributions' AND column_name = 'scientificName'
  ) THEN
    EXECUTE 'ALTER TABLE "contributions" RENAME COLUMN "scientificName" TO "scientific_name"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributions' AND column_name = 'commonNameEn'
  ) THEN
    EXECUTE 'ALTER TABLE "contributions" RENAME COLUMN "commonNameEn" TO "common_name_en"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributions' AND column_name = 'commonNameEs'
  ) THEN
    EXECUTE 'ALTER TABLE "contributions" RENAME COLUMN "commonNameEs" TO "common_name_es"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributions' AND column_name = 'proposedImages'
  ) THEN
    EXECUTE 'ALTER TABLE "contributions" RENAME COLUMN "proposedImages" TO "proposed_images"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributions' AND column_name = 'contributorName'
  ) THEN
    EXECUTE 'ALTER TABLE "contributions" RENAME COLUMN "contributorName" TO "contributor_name"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributions' AND column_name = 'contributorEmail'
  ) THEN
    EXECUTE 'ALTER TABLE "contributions" RENAME COLUMN "contributorEmail" TO "contributor_email"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributions' AND column_name = 'sessionId'
  ) THEN
    EXECUTE 'ALTER TABLE "contributions" RENAME COLUMN "sessionId" TO "session_id"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributions' AND column_name = 'ipHash'
  ) THEN
    EXECUTE 'ALTER TABLE "contributions" RENAME COLUMN "ipHash" TO "ip_hash"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributions' AND column_name = 'userId'
  ) THEN
    EXECUTE 'ALTER TABLE "contributions" RENAME COLUMN "userId" TO "user_id"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributions' AND column_name = 'reviewedBy'
  ) THEN
    EXECUTE 'ALTER TABLE "contributions" RENAME COLUMN "reviewedBy" TO "reviewed_by"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributions' AND column_name = 'reviewedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "contributions" RENAME COLUMN "reviewedAt" TO "reviewed_at"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributions' AND column_name = 'reviewNotes'
  ) THEN
    EXECUTE 'ALTER TABLE "contributions" RENAME COLUMN "reviewNotes" TO "review_notes"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributions' AND column_name = 'resolvedPrId'
  ) THEN
    EXECUTE 'ALTER TABLE "contributions" RENAME COLUMN "resolvedPrId" TO "resolved_pr_id"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributions' AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "contributions" RENAME COLUMN "createdAt" TO "created_at"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributions' AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "contributions" RENAME COLUMN "updatedAt" TO "updated_at"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tree_ratings' AND column_name = 'treeSlug'
  ) THEN
    EXECUTE 'ALTER TABLE "tree_ratings" RENAME COLUMN "treeSlug" TO "tree_slug"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tree_ratings' AND column_name = 'sessionId'
  ) THEN
    EXECUTE 'ALTER TABLE "tree_ratings" RENAME COLUMN "sessionId" TO "session_id"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tree_ratings' AND column_name = 'ipHash'
  ) THEN
    EXECUTE 'ALTER TABLE "tree_ratings" RENAME COLUMN "ipHash" TO "ip_hash"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tree_ratings' AND column_name = 'userId'
  ) THEN
    EXECUTE 'ALTER TABLE "tree_ratings" RENAME COLUMN "userId" TO "user_id"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tree_ratings' AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "tree_ratings" RENAME COLUMN "createdAt" TO "created_at"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tree_ratings' AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "tree_ratings" RENAME COLUMN "updatedAt" TO "updated_at"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'search_queries' AND column_name = 'normalizedQuery'
  ) THEN
    EXECUTE 'ALTER TABLE "search_queries" RENAME COLUMN "normalizedQuery" TO "normalized_query"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'search_queries' AND column_name = 'resultsCount'
  ) THEN
    EXECUTE 'ALTER TABLE "search_queries" RENAME COLUMN "resultsCount" TO "results_count"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'search_queries' AND column_name = 'selectedResult'
  ) THEN
    EXECUTE 'ALTER TABLE "search_queries" RENAME COLUMN "selectedResult" TO "selected_result"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'search_queries' AND column_name = 'sessionId'
  ) THEN
    EXECUTE 'ALTER TABLE "search_queries" RENAME COLUMN "sessionId" TO "session_id"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'search_queries' AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "search_queries" RENAME COLUMN "createdAt" TO "created_at"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributor_profiles' AND column_name = 'sessionId'
  ) THEN
    EXECUTE 'ALTER TABLE "contributor_profiles" RENAME COLUMN "sessionId" TO "session_id"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributor_profiles' AND column_name = 'displayName'
  ) THEN
    EXECUTE 'ALTER TABLE "contributor_profiles" RENAME COLUMN "displayName" TO "display_name"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributor_profiles' AND column_name = 'totalContributions'
  ) THEN
    EXECUTE 'ALTER TABLE "contributor_profiles" RENAME COLUMN "totalContributions" TO "total_contributions"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributor_profiles' AND column_name = 'approvedContributions'
  ) THEN
    EXECUTE 'ALTER TABLE "contributor_profiles" RENAME COLUMN "approvedContributions" TO "approved_contributions"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributor_profiles' AND column_name = 'rejectedContributions'
  ) THEN
    EXECUTE 'ALTER TABLE "contributor_profiles" RENAME COLUMN "rejectedContributions" TO "rejected_contributions"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributor_profiles' AND column_name = 'totalRatings'
  ) THEN
    EXECUTE 'ALTER TABLE "contributor_profiles" RENAME COLUMN "totalRatings" TO "total_ratings"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributor_profiles' AND column_name = 'totalPhotos'
  ) THEN
    EXECUTE 'ALTER TABLE "contributor_profiles" RENAME COLUMN "totalPhotos" TO "total_photos"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributor_profiles' AND column_name = 'reputationScore'
  ) THEN
    EXECUTE 'ALTER TABLE "contributor_profiles" RENAME COLUMN "reputationScore" TO "reputation_score"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributor_profiles' AND column_name = 'trustLevel'
  ) THEN
    EXECUTE 'ALTER TABLE "contributor_profiles" RENAME COLUMN "trustLevel" TO "trust_level"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributor_profiles' AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "contributor_profiles" RENAME COLUMN "createdAt" TO "created_at"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributor_profiles' AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "contributor_profiles" RENAME COLUMN "updatedAt" TO "updated_at"';
  END IF;
END $$;
