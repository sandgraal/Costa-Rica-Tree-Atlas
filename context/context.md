# Project Context

## Project Summary

- Costa Rica Tree Atlas is a bilingual (EN/ES) Next.js 16 app documenting Costa Rican tree species with MDX content, locale routing, and strict TypeScript.
- The highest-priority unchecked implementation item was Priority 0.3 validation-gate completion for the image proposal workflow.
- This work focused on validating proposal lifecycle behavior (creation, listing, detail comparison payload, and audit logging on review status changes).

## Dependency Graph (High Level)

- **Framework/runtime**: `next`, `react`, `react-dom`
- **Content**: `contentlayer2`, `next-contentlayer2`, MDX tooling
- **Auth/data**: `next-auth`, `@prisma/client`, Prisma SQL access through `@/lib/prisma`
- **Testing**: `vitest`, `jsdom`, Next.js route handlers with mocked auth/DB

## Commands Map

- Development: `npm run dev`
- Lint: `npm run lint`
- Type checks: `npm run type-check`
- Build: `npm run build`
- Targeted validation gate test: `npm run test:run -- tests/image-review/validation-gate.test.ts`

## Key Paths by Feature

- Implementation tracking: `docs/IMPLEMENTATION_PLAN.md`
- Image review architecture/runbook: `docs/IMAGE_REVIEW_SYSTEM.md`
- Proposal list/create API: `src/app/api/admin/images/proposals/route.ts`
- Proposal detail/update API: `src/app/api/admin/images/proposals/[id]/route.ts`
- New validation test: `tests/image-review/validation-gate.test.ts`

## Known Constraints & Feature Flags

- Proposal APIs depend on migrated `image_proposals`, `image_votes`, and `image_audits` tables.
- Tests in this PR mock auth (`getServerSession`) and DB raw SQL calls to provide deterministic validation coverage independent of external DB state.
- Workflow proposal automation remains dependent on deployed API endpoint and `IMAGE_PROPOSALS_API_BASE_URL` secret.
