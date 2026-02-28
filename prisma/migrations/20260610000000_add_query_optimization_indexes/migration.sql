-- Add missing indexes for query optimization
-- These are safe, additive changes (CREATE INDEX IF NOT EXISTS)

-- Account.userId: Needed for user-account lookups (e.g., "find accounts for user X")
CREATE INDEX IF NOT EXISTS "accounts_userId_idx" ON "accounts" ("userId");

-- ImageProposal compound index: Optimizes the most common admin query pattern
-- (list proposals by status, sorted by creation date)
CREATE INDEX IF NOT EXISTS "image_proposals_status_createdAt_idx" ON "image_proposals" ("status", "createdAt");

-- Contribution compound index: Same pattern for contribution listings
CREATE INDEX IF NOT EXISTS "contributions_status_createdAt_idx" ON "contributions" ("status", "createdAt");