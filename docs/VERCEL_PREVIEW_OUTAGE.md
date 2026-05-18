# Vercel Preview deploys — known outage

**Status:** Preview deploys broken since **2026-02-23T10:11Z**. Production
deploys on `main` are unaffected. PRs #750 onward have been merged through
a red Vercel check. Fix lives in the Vercel dashboard, not the repo.

If you came here because the `Vercel` check on your PR is red and you're
about to spend an hour staring at a 0ms build with no logs: **don't**.
Read this file, treat the check as non-blocking, and merge if everything
else is green.

---

## Symptom

On every PR (`#750` … `#755` and counting):

```
Vercel | failure | Deployment has failed — run this Vercel CLI command:
  npx vercel inspect dpl_<id> --logs
```

`vercel inspect` shows:

```
status   ● Error
target   preview
Builds
  ╶ .   [0ms]
```

`--logs` returns nothing past the status line. The events endpoint
(`/v3/now/deployments/<id>/events`) returns `[]`.

## Root cause

The build container is **never provisioned**. The full deployment object
from the Vercel API shows:

| field          | value                          |
| -------------- | ------------------------------ |
| `readyState`   | `ERROR`                        |
| `errorCode`    | `BUILD_FAILED`                 |
| `errorMessage` | `Resource provisioning failed` |
| `buildSkipped` | `false`                        |
| `builds`       | `[]`                           |
| elapsed        | ~1.2 s (create → ready)        |

This is a **Vercel platform-side rejection** that happens before the
build sandbox is allocated. The `ignoreCommand`
(`bash scripts/vercel-ignore-build.sh`) never runs on these deploys —
its exit code can't be the cause.

### Why we know it's not the repo

Diffed the last working preview deploy against the first failing one,
14 minutes apart:

| deploy                             | created              | state | `projectSettings` | `config`  |
| ---------------------------------- | -------------------- | ----- | ----------------- | --------- |
| `dpl_9m6PNMEfLJAgrrg5gSUo6PtVGYZb` | 2026-02-23T09:57:48Z | READY | identical         | identical |
| `dpl_Fvmxk8tFFQ4MVXqZ9jjeiR3rRHYM` | 2026-02-23T10:11:43Z | ERROR | identical         | identical |

Same `vercel.json`, same `commandForIgnoringBuildStep`, same Node
version (`24.x`), same framework, same resource config. Nothing in
the repo changed at that boundary.

Locally simulating the ignore script against the failing PR #755 head
commit also exits cleanly:

```bash
VERCEL_GIT_COMMIT_REF="claude/zen-tereshkova-66ab14" \
VERCEL_GIT_COMMIT_SHA="c60e081469c481cdec6e738641f95b155fe6c110" \
VERCEL_GIT_PREVIOUS_SHA="80d4c3ed8a2326281cce61c4dd6a46d83182cdcb" \
  bash scripts/vercel-ignore-build.sh
# Changed files: src/app/[locale]/safety/page.tsx, src/lib/seo/safety-faq.ts
# ✅ App-impacting changes detected.
# ➡️ Proceeding with build.
# exit=1
```

Exit 1 = "build, please." The script does its job.

### Where to look in the team config

Notable team-level state at the time of writing:

```jsonc
{
  "plan": "pro",
  "planIteration": "plus",
  "billing": { "status": "active", "entitlements": {} },
  "resourceConfig": {
    "concurrentBuilds": 1,
    "elasticConcurrencyEnabled": false,
  },
  "createdDirectToHobby": true,
}
```

Two flags are suspicious for a Pro account:

- **`resourceConfig.concurrentBuilds: 1`** — Pro normally allows ≥ 3
  concurrent builds. With production deploys on the fast lane
  (`productionDeploymentsFastLane: true` on the project), a preview
  build that needs the single slot may be denied at provisioning time.
- **`billing.entitlements: {}`** — empty entitlements map on an active
  Pro plan is unusual; it normally carries the included Sandbox /
  Function / Bandwidth allocations. May indicate a Hobby→Pro upgrade
  that didn't fully provision entitlements (the team is flagged
  `createdDirectToHobby: true`).

Either of these would explain a sharp boundary failure that ignores
all repo-side configuration. They cannot be repaired from the repo.

## Three preview outcomes (don't conflate them)

`npx vercel ls` shows preview deploys in one of three states. Only one
is a real failure:

| CLI label | `readyState` | `buildSkipped` | what it means                                               |
| --------- | ------------ | -------------- | ----------------------------------------------------------- |
| `● Ready` | `READY`      | `false`        | Build ran and succeeded. We haven't seen this since Feb.    |
| `● Error` | `ERROR`      | `false`        | **The outage.** Vercel refused to provision a build.        |
| `UNKNOWN` | `BLOCKED`    | `true`         | Our ignore script told Vercel to skip. Working as intended. |

The "UNKNOWN" rows are not symptoms — they're the ignore script
correctly skipping builds for docs-only / non-app commits.

## What to do

### As a contributor

Treat the `Vercel` check on your PR as **non-blocking** while this is
open. Verify the build locally instead:

```bash
npm run contentlayer
npm run build
```

If both pass and the other CI checks are green, the PR is safe to
merge. Production deploys on `main` continue to work.

### As the project owner (Vercel dashboard, in order of likelihood)

1. **Settings → Functions / Resource Allocation → Concurrent Builds.**
   Bump `concurrentBuilds` above `1`. Pro Plus normally includes more
   than one. With `productionDeploymentsFastLane: true` on the project,
   the single slot is effectively reserved for production traffic and
   preview builds get pushed out at allocation time.
2. **Open a Vercel support ticket** referencing a recent failed
   deployment ID (e.g. `dpl_5UxVcVnRnFuTttsw3ps2EmLtnEWj`) and the
   verbatim error `BUILD_FAILED: Resource provisioning failed`.
   Highlight the empty `billing.entitlements` and
   `createdDirectToHobby: true` flags — they point to a possible
   Hobby→Pro upgrade-path provisioning gap that only support can
   repair. This is dashboard-invisible and the most likely real cause.
3. **Settings → Billing → Usage.** Sanity-check sandbox / build-minute
   usage. Not expected to be the cause (Spend Management actions are
   notifications, webhooks, or pausing _production_ — it does not
   selectively suppress only preview builds; see
   <https://vercel.com/docs/accounts/spend-management>), but worth a
   glance to rule out an exhausted included allocation.

## How to verify it's fixed

After making a dashboard change, push any commit that touches a file
under `src/`, `content/`, `messages/`, etc. (anything that makes
`scripts/vercel-ignore-build.sh` exit 1), then:

```bash
npx vercel ls costa-rica-tree-atlas | head
# Look for the new preview row going ● Building → ● Ready (not ● Error).

npx vercel api "/v13/deployments/<dpl_id>" \
  | node -e 'const j=JSON.parse(require("fs").readFileSync(0));
             console.log(j.readyState, j.errorCode || "", j.errorMessage || "")'
# Want: READY  (empty)  (empty)
```

If the next preview build returns READY, delete this file in the same
PR.
