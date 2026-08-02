# Archived: `prisma/manual/*.sql`

These scripts used to live in `prisma/manual/` and were applied by hand,
outside the `prisma migrate` pipeline. They are kept here for history only.
**Do not run them.**

## Why they were removed

They defined the image-review tables with **snake_case** columns
(`tree_slug`, `created_at`), while `prisma/migrations/20260222175434_init/`
defined the same tables with **camelCase** columns (`treeSlug`, `createdAt`).
Two mutually exclusive DDL definitions for one set of tables.

`prisma/schema.prisma` had no field-level `@map`, so the generated Prisma
client expected camelCase — but roughly ten API routes issued raw SQL in
snake_case. Whichever DDL had actually been applied, half the code was
querying columns that did not exist.

Nothing surfaced the conflict, because every affected route wrapped its table
probe in `catch { return false }` and answered:

> `503 Image review system not initialized — Database migration required.
Run: npx prisma migrate dev`

A schema mismatch, a permissions failure and a dead connection were all
indistinguishable from a missing migration, so the defect could sit behind a
plausible-looking operator message indefinitely. `src/lib/prisma.ts` types the
client as `any`, so `tsc` could not catch it either.

## What replaced them

- `prisma/schema.prisma` now carries `@map` directives making **snake_case**
  canonical for these tables — matching the majority of the raw SQL and the
  `tree_ratings` / `contributor_profiles` migrations, which were already
  snake_case.
- `prisma/migrations/20260802000000_converge_snake_case_columns/` renames any
  camelCase columns that are present. It is guarded per column, so it is
  correct against a database built from either source and a no-op against one
  already in the target state.
- `src/lib/db/table-check.ts` replaces the six copied `catch { return false }`
  probes and only reports "missing" for Postgres `42P01`.

## Rule going forward

Schema changes go through `prisma migrate`. If a migration must be written by
hand, it still belongs in `prisma/migrations/` so it is versioned, ordered, and
recorded in `_prisma_migrations`.
