-- Add region column to contributions table
ALTER TABLE "contributions" ADD COLUMN "region" VARCHAR(255);

-- CreateEnum
CREATE TYPE "TrustLevel" AS ENUM ('NEW', 'CONTRIBUTOR', 'TRUSTED', 'EXPERT');

-- CreateTable
CREATE TABLE "contributor_profiles" (
    "id" TEXT NOT NULL,
    "session_id" VARCHAR(64) NOT NULL,
    "display_name" VARCHAR(255),
    "total_contributions" INTEGER NOT NULL DEFAULT 0,
    "approved_contributions" INTEGER NOT NULL DEFAULT 0,
    "rejected_contributions" INTEGER NOT NULL DEFAULT 0,
    "total_ratings" INTEGER NOT NULL DEFAULT 0,
    "total_photos" INTEGER NOT NULL DEFAULT 0,
    "reputation_score" INTEGER NOT NULL DEFAULT 0,
    "trust_level" "TrustLevel" NOT NULL DEFAULT 'NEW',
    "badges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contributor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contributor_profiles_session_id_key" ON "contributor_profiles"("session_id");

-- CreateIndex
CREATE INDEX "contributor_profiles_trust_level_idx" ON "contributor_profiles"("trust_level");

-- CreateIndex
CREATE INDEX "contributor_profiles_reputation_score_idx" ON "contributor_profiles"("reputation_score");
