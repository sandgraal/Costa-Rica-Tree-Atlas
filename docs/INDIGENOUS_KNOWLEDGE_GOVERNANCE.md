# Indigenous Knowledge Governance

**Last Updated:** 2026-03-22  
**Purpose:** Define how the repository handles indigenous names, meanings, use-cases, ceremonial references, attribution, and review

## Why this policy exists

The atlas documents trees that carry ecological, linguistic, medicinal, and ceremonial significance. Indigenous knowledge should not be treated like anonymous filler text. This policy sets the minimum handling rules for maintainers, collaborators, and AI agents.

## Scope

This policy applies to:

- indigenous names or alternate spellings
- translations or claimed meanings of indigenous terms
- ceremonial, spiritual, or sacred use claims
- traditional medicinal or material uses tied to a community
- oral-history summaries that attribute knowledge to a specific people or tradition

## Core Rules

### 1. Do not add unsourced claims

Autonomous contributors must not add new indigenous or ceremonial claims unless the claim is explicitly supported by a cited source.

### 2. Human review is required

Any PR that adds, removes, or materially changes indigenous knowledge content requires human review before merge, even when sourced.

### 3. Attribute communities specifically

Avoid generic phrasing like “indigenous people used this tree.” Attribute claims as specifically as the source allows, for example:

- Bribri
- Cabécar
- Ngäbe
- Boruca

If the source is broad or uncertain, say so plainly instead of over-claiming.

### 4. Separate documented use from interpretation

Write only what the source supports. Do not infer ceremonial meaning, symbolic roles, or community-wide practice from a passing mention.

### 5. Prefer living-community-safe wording

Avoid language that presents living traditions as relics, curiosities, or universally shared practices. Use present-tense phrasing only when the source supports ongoing use.

## Source Requirements

### Minimum sourcing standard

- one explicit source for a straightforward name or use attribution
- two independent sources for medicinal, ceremonial, sacred, or safety-adjacent claims

### Preferred source types

1. community-authored or community-approved publications
2. museum, university, or linguistic documentation with clear attribution
3. peer-reviewed ethnobotanical research
4. reputable governmental or conservation institutions

If no source meets that bar, do not merge the claim.

## Consent and Review Workflow

When indigenous knowledge content is touched:

1. **Flag the PR** as requiring indigenous-content review in the summary.
2. **Apply the PR routing convention** `needs-indigenous-review` (or include that exact text in the PR body if labels are unavailable).
3. **List every affected slug and locale**.
4. **Cite the exact source** for each indigenous name, meaning, or use claim.
5. **Mark uncertain claims for follow-up** instead of smoothing them into confident prose.
6. **Require human approval** before merge.

If a future community reviewer or partner requests correction, removal, or attribution changes, that request should be prioritized over stylistic preferences.

## PR Label / Routing Convention

Use `needs-indigenous-review` for any PR that:

- adds a new indigenous name or meaning
- changes ceremonial, spiritual, or sacred-use language
- changes attributed traditional medicinal or material uses
- edits oral-history passages tied to a specific community

This convention is intentionally simple so reviewers can filter sensitive content quickly even before a formal CODEOWNERS-style system exists.

## Writing Rules

- Prefer direct, sourced statements over paraphrase-heavy summaries.
- Distinguish clearly between botanical facts and cultural interpretation.
- Do not collapse multiple communities into a single practice unless the source does so.
- Do not extrapolate from one region to all of Costa Rica.
- Do not introduce ceremonial detail purely to make a page feel richer.

## Escalation Cases

Stop and request human review immediately when a change involves:

- ceremonial or sacred practices
- healing claims with safety implications
- contested translations or alternate spellings
- sensitive historical narratives
- claims with unclear attribution to a specific people

## Repository Expectations

Related documents:

- `docs/CONTENT_PR_ACCEPTANCE_CRITERIA.md`
- `docs/SPECIES_ADDITION_PROCESS.md`
- `docs/IMPLEMENTATION_PLAN.md`

This policy is intentionally conservative. When in doubt, omit the claim, document the gap, and leave room for qualified human review.
