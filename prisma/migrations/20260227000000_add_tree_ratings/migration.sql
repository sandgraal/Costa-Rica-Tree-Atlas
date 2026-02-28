-- CreateTable
CREATE TABLE "tree_ratings" (
    "id" TEXT NOT NULL,
    "tree_slug" VARCHAR(100) NOT NULL,
    "rating" INTEGER NOT NULL,
    "session_id" VARCHAR(64) NOT NULL,
    "ip_hash" VARCHAR(64),
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tree_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tree_ratings_tree_slug_idx" ON "tree_ratings"("tree_slug");

-- CreateIndex
CREATE INDEX "tree_ratings_session_id_idx" ON "tree_ratings"("session_id");

-- CreateIndex
CREATE INDEX "tree_ratings_ip_hash_updated_at_idx" ON "tree_ratings"("ip_hash", "updated_at");

-- CreateUniqueIndex
CREATE UNIQUE INDEX "tree_ratings_tree_slug_session_id_key" ON "tree_ratings"("tree_slug", "session_id");
