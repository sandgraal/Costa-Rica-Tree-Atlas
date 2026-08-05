-- Remove the Supabase Data API attack surface.
--
-- CRITICAL. This corrects a real exposure, not a hypothetical one.
--
-- Supabase publishes every table in the `public` schema through PostgREST and
-- pg_graphql, and its default grants gave the `anon` and `authenticated` roles
-- SELECT, INSERT, UPDATE, DELETE and TRUNCATE on all of them — verified via
-- information_schema.role_table_grants before this ran. That included:
--
--   users.password_hash        Argon2id hashes for every admin account
--   sessions.session_token     live session tokens
--   mfa_secrets.totp_secret    encrypted TOTP secrets
--   mfa_secrets.backup_codes   MFA backup codes
--   verification_tokens.token  email verification tokens
--
-- The `anon` key is a PUBLIC credential by design — it ships to browsers in a
-- normal Supabase app. Anyone holding it could read those columns over HTTPS,
-- and could TRUNCATE the tables.
--
-- This application never uses supabase-js, PostgREST, or pg_graphql. It reaches
-- Postgres exclusively through Prisma over a direct connection as the owning
-- role. Those APIs are therefore pure attack surface with no compensating
-- benefit, and the correct posture is to close them entirely rather than to
-- write RLS policies that grant partial access.
--
-- Three layers, so a single mistake does not re-open it:
--   1. revoke the existing grants
--   2. revoke DEFAULT privileges, so new tables do not silently inherit them
--   3. enable RLS with no policies (deny-all) as a backstop
--
-- The `postgres` role owns these tables and is unaffected by all three: owners
-- bypass RLS unless FORCE ROW LEVEL SECURITY is set. Prisma is unchanged.
--
-- If you ever adopt supabase-js on the client, do NOT simply revert this —
-- add narrowly-scoped RLS policies for the specific tables involved and leave
-- the auth tables closed.

-- 1. Revoke existing grants.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;
REVOKE USAGE ON SCHEMA public FROM anon, authenticated;

-- 2. Stop future objects inheriting them.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'postgres') THEN
    EXECUTE 'ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated';
    EXECUTE 'ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated';
    EXECUTE 'ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_admin') THEN
    EXECUTE 'ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated';
    EXECUTE 'ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated';
    EXECUTE 'ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated';
  END IF;
END $$;

-- 3. Deny-by-default RLS.
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mfa_secrets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "image_proposals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "image_votes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "image_audits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contributions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tree_ratings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "search_queries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contributor_profiles" ENABLE ROW LEVEL SECURITY;
