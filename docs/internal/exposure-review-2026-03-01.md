# One-Time Exposure Review (2026-03-01)

## Scope

Requested checks:

1. Public forks, release tarballs, package publishes, mirrors.
2. Published artifacts inventory.
3. Decision per artifact: leave as-is, takedown, or replace terms.
4. Internal note on what remains reachable and mitigations.

## Findings

### 1) Public forks / release tarballs / package publishes / mirrors

- **GitHub repository endpoint currently not publicly accessible** (`https://github.com/sandgraal/Costa-Rica-Tree-Atlas` returns 404; GitHub REST endpoints return 404).
- **Public forks:** Not enumerable from current public API visibility (repo 404).
- **GitHub Releases / release assets:** Not enumerable from current public API visibility (repo 404).
- **Source tarballs:** No tags in local clone (`git tag --list` empty), and no releases visible via API.
- **npm publish:** Package name `costa-rica-tree-atlas` is **not found** in npm registry.
- **Mirrors:** No explicit mirror endpoints found in repo docs/config. Historical public exposure is still indicated by web archives.

### 2) Published artifacts inventory

| Artifact                                                       | Observed status                                 | Evidence                             | Decision                                                  |
| -------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------ | --------------------------------------------------------- |
| GitHub repo URL (`github.com/sandgraal/Costa-Rica-Tree-Atlas`) | Currently 404 (not publicly browsable)          | Direct HTTP check + API 404s         | **Leave as-is**                                           |
| GitHub forks list                                              | Not publicly enumerable due 404 repo            | Forks API returns 404                | **Leave as-is**, monitor if repo reopens                  |
| GitHub Releases/assets                                         | Not publicly enumerable due 404 repo            | Releases API returns 404             | **Leave as-is**, verify again if repo reopens             |
| npm package (`costa-rica-tree-atlas`)                          | Not published                                   | `npm view` returns E404              | **Leave as-is**                                           |
| Primary site (`https://costaricatreeatlas.com`)                | Domain resolves, endpoint currently returns 503 | Direct HTTP check                    | **Leave as-is** (availability issue, not exposure leak)   |
| Wayback archive snapshots (GitHub repo URL)                    | Historical captures exist                       | CDX query returns Jan 2026 snapshots | **Request takedown** if private content/licensing concern |
| Wayback archive snapshots (site URL)                           | No 200 snapshots returned by query              | CDX query empty                      | **Leave as-is**                                           |

### 3) Decision rationale

- Keep currently unavailable/non-published channels as-is unless business/legal wants broader suppression.
- **Only clear externally reachable historical artifact identified:** archived copies of the formerly public GitHub repo URL in the Internet Archive index.
- If legal/compliance requires minimizing historical exposure, file targeted archival removal requests for specific archive captures.

## Internal note: what remains publicly reachable & mitigations

### Publicly reachable (as of review time)

- `https://costaricatreeatlas.com` hostname is publicly reachable at DNS/HTTP level but responds `503 Service Unavailable`.
- Internet Archive lists historical captures for `https://github.com/sandgraal/Costa-Rica-Tree-Atlas`.

### Mitigation actions

1. **Archive takedown path (recommended):**
   - Submit removal request to Internet Archive for the captured GitHub repository URLs if those snapshots expose material that should no longer be public.
2. **Future hardening if repo becomes public again:**
   - Disable/limit release generation until license/terms text is finalized.
   - Add explicit repository metadata (`LICENSE`, `README` terms section already present) and ensure release notes include current terms.
3. **Monitoring:**
   - Re-run this review monthly for 3 months or after any visibility change (repo made public, domain restored, package published).
