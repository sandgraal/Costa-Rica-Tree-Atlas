# Content PR Acceptance Criteria

**Last Updated:** 2026-03-22  
**Purpose:** Reviewer-ready acceptance criteria for tree content, factual remediation, and other public-facing content changes

This document defines the minimum bar for content pull requests so factual remediation work does not drift between “looks plausible” and “is defensible.”

## Applies To

Use this checklist for PRs that change any of the following:

- `content/trees/**`
- `content/comparisons/**`
- `content/glossary/**`
- `content/oral-histories/**`
- factual correction queues, citations, or conservation/safety claims that surface on public routes

## Non-Negotiable Acceptance Criteria

### 1. Bilingual parity is preserved

- English and Spanish content must ship together for the same slug unless the change is deliberately language-neutral
- Shared frontmatter values must remain aligned across locales unless the field is intentionally localized
- Images, section structure, and MDX component coverage must remain equivalent across locales

### 2. High-risk claims are explicitly sourced

The following sections require citations whenever they are added or materially changed:

- medicinal uses
- toxicity and safety guidance
- conservation status or threat claims
- cultural, ceremonial, or indigenous knowledge claims
- legal protection or harvest restrictions

**Minimum rule:** two independent sources for high-risk factual claims.

### 3. Source hierarchy is followed

When multiple sources disagree, reviewers should prefer sources in this order:

1. IUCN Red List
2. POWO (Plants of the World Online)
3. Tropicos
4. _Manual de Plantas de Costa Rica_
5. SINAC
6. peer-reviewed papers

If a lower-priority source is used over a higher-priority one, the PR description must explain why.

### 4. Indigenous and ceremonial content requires human review

Autonomous edits must **not** introduce or expand indigenous names, meanings, ceremonial use, or spiritual significance unless the claim is explicitly sourced.

Any PR touching those topics must also follow `docs/INDIGENOUS_KNOWLEDGE_GOVERNANCE.md` and include a human-review note in the PR summary.

Use the PR routing convention `needs-indigenous-review` so sensitive content is easy to spot in review queues.

### 5. Conservation changes use canonical IUCN codes

- `conservationStatus` values must remain one of: `EX`, `EW`, `CR`, `EN`, `VU`, `NT`, `LC`, `DD`, `NE`
- Public-facing copy should render the localized IUCN label rather than ad-hoc English prose
- If a conservation status changes, the PR must cite the authoritative source used for the correction

### 6. Safety fields remain complete

For tree profiles, the required safety fields must stay present and internally consistent. A PR must not improve prose while silently degrading safety completeness.

### 7. Documentation stays in sync

If the PR changes process, counts, or repository rules, update the authoritative docs in the same PR. Typical examples:

- `docs/IMPLEMENTATION_PLAN.md`
- `docs/SPECIES_ADDITION_PROCESS.md`
- `docs/MISSING_SPECIES_LIST.md`
- `docs/README.md`

## PR Description Requirements

Every qualifying content PR should state:

- what content changed
- why it changed
- which slugs/locales were touched
- which sources were used
- whether indigenous/cultural review was required
- whether the `needs-indigenous-review` convention was applied
- what validation was run

## Reviewer Checklist

- [ ] English and Spanish parity preserved
- [ ] Slugs/frontmatter alignment preserved where expected
- [ ] High-risk claims have at least two independent sources
- [ ] Source hierarchy followed or exception explained
- [ ] Indigenous/ceremonial claims routed through human review workflow
- [ ] `needs-indigenous-review` convention used when applicable
- [ ] Conservation status uses valid IUCN code and localized UI path
- [ ] Safety completeness not reduced
- [ ] Relevant docs updated
- [ ] Build and targeted tests passed

## Validation Expectations

At minimum, run the checks relevant to the changed surface:

- `npm run build`
- `npm run lint`
- `npm run test:run -- tests/content-validation-comprehensive.test.ts`
- other targeted route/content regression tests when public-facing strings or metadata change

## Deliberate Exclusions

These criteria do not replace expert botanical review, legal review, or community consent. They define the minimum repository bar for merging content work.
