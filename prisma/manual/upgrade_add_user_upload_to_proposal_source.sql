-- Upgrade migration: Add USER_UPLOAD to existing ImageProposalSource enum
-- This migration is for databases that already have the ImageProposalSource enum
-- created without the USER_UPLOAD value.
--
-- Usage:
--   psql -d your_database -f upgrade_add_user_upload_to_proposal_source.sql
--
-- This adds USER_UPLOAD before USER_FLAG to maintain logical ordering.

-- Check if the enum value already exists before attempting to add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'USER_UPLOAD'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ImageProposalSource')
    ) THEN
        ALTER TYPE "ImageProposalSource" ADD VALUE 'USER_UPLOAD' BEFORE 'USER_FLAG';
    END IF;
END
$$;
