-- Create the search_queries table.
--
-- `model SearchQuery` has existed in prisma/schema.prisma with no corresponding
-- CREATE TABLE in any migration. `POST /api/search-analytics` probes for the
-- table, finds it missing, and returns `{ ok: true }` while discarding the
-- write — so the endpoint reported success to every caller and stored nothing,
-- and the /admin/search-analytics dashboard that reads it had no data to show.
--
-- Column names are snake_case, matching the raw SQL in the route and the
-- @map directives on the model.

CREATE TABLE IF NOT EXISTS "search_queries" (
    "id" TEXT NOT NULL,
    "query" VARCHAR(500) NOT NULL,
    "normalized_query" VARCHAR(500) NOT NULL,
    "locale" VARCHAR(5) NOT NULL,
    "results_count" INTEGER NOT NULL,
    "selected_result" VARCHAR(255),
    "session_id" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_queries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "search_queries_normalized_query_idx"
    ON "search_queries" ("normalized_query");
CREATE INDEX IF NOT EXISTS "search_queries_locale_idx"
    ON "search_queries" ("locale");
CREATE INDEX IF NOT EXISTS "search_queries_created_at_idx"
    ON "search_queries" ("created_at");
-- Fast filter for zero-result queries, which are the actionable ones.
CREATE INDEX IF NOT EXISTS "search_queries_results_count_idx"
    ON "search_queries" ("results_count");
-- Aggregation by query + locale.
CREATE INDEX IF NOT EXISTS "search_queries_normalized_query_locale_idx"
    ON "search_queries" ("normalized_query", "locale");
