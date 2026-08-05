# Database

**Provider: Supabase Postgres.** Project `itrzuyzahpxuhmhavxza`
("Costa Rica Tree Atlas", us-east-1).

Access is exclusively through **Prisma over a direct Postgres connection**. The
app does not use `supabase-js`, PostgREST, or pg_graphql, and those APIs are
deliberately closed — see [Data API lockdown](#data-api-lockdown).

---

## Connection strings

Two URLs, for two different jobs. Both come from the Supabase dashboard under
**Project Settings → Database → Connection string**.

| Variable       | Supabase tab | Port | Used by                    |
| -------------- | ------------ | ---- | -------------------------- |
| `DATABASE_URL` | Transaction  | 6543 | the application at runtime |
| `DIRECT_URL`   | Session      | 5432 | `prisma migrate` only      |

Append `?pgbouncer=true&connection_limit=1` to `DATABASE_URL`.

**Why two.** Serverless functions open and drop connections constantly, and
Postgres cannot absorb that directly — hence the transaction-mode pooler
(Supavisor) on 6543. But a transaction pooler cannot carry advisory locks or
multi-statement DDL, which is exactly what `prisma migrate` needs, so migrations
use the session connection on 5432.

`src/lib/prisma.ts` also sets `max: 1` on the local pool. Each serverless
invocation is its own process, so a larger local pool multiplies across
concurrent invocations and exhausts the upstream pooler.

---

## Column naming

**snake_case, enforced.** `prisma/schema.prisma` carries `@map` directives on
every field of the seven raw-SQL models. `tests/schema-drift.test.ts` fails the
build if a camelCase field loses its `@map`, or if a route quotes a camelCase
SQL identifier.

This is not cosmetic. The repo previously held two mutually exclusive DDL
definitions for these tables — a camelCase Prisma migration and a snake_case
hand-applied script — while the routes issued snake_case SQL. Half the data
layer queried columns that did not exist, and six routes disguised the failure
as _"Image review system not initialized."_

---

## Data API lockdown

Supabase publishes `public` schema tables through PostgREST and pg_graphql. Its
default grants gave `anon` and `authenticated` **SELECT, INSERT, UPDATE, DELETE
and TRUNCATE** on every table — including `users.password_hash`,
`sessions.session_token`, `mfa_secrets.totp_secret` and
`mfa_secrets.backup_codes`.

The `anon` key is a **public** credential by design. Anyone holding it could
have read every password hash and MFA secret over HTTPS, and could have
truncated the tables.

`prisma/migrations/20260802210000_lock_down_data_api_exposure/` closes this in
three layers: revoke existing grants, revoke default privileges so new tables do
not inherit them, and enable deny-all RLS as a backstop. The `postgres` role
owns the tables and bypasses all three, so Prisma is unaffected.

**If you later adopt `supabase-js` on the client**, do not revert that
migration. Add narrowly-scoped RLS policies for the specific tables involved and
leave the auth tables closed.

Check the posture at any time:

```sql
-- expect 0
select count(*) from information_schema.role_table_grants
where table_schema = 'public' and grantee in ('anon', 'authenticated');
```

---

## History: why this looks the way it does

| Date       | Event                                                                                                                 |
| ---------- | --------------------------------------------------------------------------------------------------------------------- |
| 2026-01-18 | Supabase project created                                                                                              |
| 2026-01-19 | Image-review schema applied by hand in the SQL editor (snake_case), outside `prisma migrate`                          |
| 2026-02-22 | Moved to Neon; a camelCase init migration was applied via `prisma migrate`                                            |
| 2026-08-02 | Neon exceeded its compute quota (`53000`), taking every DB-backed route to 500 in production. Moved back to Supabase. |

The word "supabase" never appeared in the git history before this document —
the original move happened outside the repo, which is why nothing recorded it
and why the schema drifted unnoticed for six months.

**Data note:** the Neon database was not migrated back. It held no recoverable
user-generated content: the contributions, image-proposal and voting routes had
been querying non-existent columns since 2026-02-22 (the camelCase/snake_case
split above), so those writes never landed. Supabase retains the original admin
user and its audit log.

---

## Common tasks

```bash
# Apply migrations (needs DIRECT_URL)
npx prisma migrate deploy

# Inspect drift between schema.prisma and the live database
npx prisma migrate diff --from-url "$DIRECT_URL" --to-schema prisma/schema.prisma --script

# Regenerate the client
npm run prisma:generate:optional

# Create the first admin user
node scripts/setup-first-admin.mjs
```

The app is designed to build and run **without** a database — `src/lib/prisma.ts`
degrades to a throwing proxy and admin features switch off. That is why a
missing `DATABASE_URL` does not fail the build.
