# Brand Identity — Costa Rica Tree Atlas

**Last Updated:** 2026-05-16
**Status:** v1.0 — Authoritative for visual identity, naming, and brand
posture. Pairs with [VOICE_AND_TONE.md](VOICE_AND_TONE.md) (verbal voice)
and [INDIGENOUS_KNOWLEDGE_GOVERNANCE.md](INDIGENOUS_KNOWLEDGE_GOVERNANCE.md)
(content provenance).

---

## What we are (in one sentence)

**The bilingual tree atlas Costa Rica is proud of, that the world can
cite.**

In Spanish: _El atlas de árboles del que Costa Rica está orgullosa, y que
el mundo puede citar._

That sentence is load-bearing. Every word does work:

- **Bilingual** — Spanish is the home register; English is sibling
  parity. Not a translated site.
- **Tree atlas** — checklist + reference + field tool, scoped to trees.
  Not a generic flora portal.
- **Costa Rica is proud of** — locally legitimate before globally
  ambitious. The grandmother test.
- **The world can cite** — DOI, Darwin Core Archive, sourced, machine-
  readable. Primary source, not aggregator.

## What we are not

- Not a tourism site. We are not "Costa Rica, the rainforest nation"
  marketing.
- Not a research database stripped of voice. Editorial narrative is part
  of the product.
- Not English-first with Spanish as a translation layer.
- Not a content farm. Every species page is editorially curated and
  sourced.
- Not a citizen-science platform. We send users to iNaturalist for that.

---

## Names

| Use                           | EN                      | ES                             |
| ----------------------------- | ----------------------- | ------------------------------ |
| Full name                     | Costa Rica Tree Atlas   | Atlas de Árboles de Costa Rica |
| Short / handle                | Tree Atlas              | Atlas de Árboles               |
| Internal short                | CRTA                    | CRTA                           |
| Repository                    | `costa-rica-tree-atlas` | (same)                         |
| Twitter / X / Mastodon handle | `@treeatlas` (reserved) | (same)                         |

Rules:

- The full EN name is always **three words, no hyphen**: Costa Rica Tree
  Atlas. Never "CRTreeAtlas," "CR-Tree-Atlas," or "Costa-Rica-Tree-Atlas"
  in prose (the repo slug is the only place the dashes appear).
- The ES name keeps the article: _Atlas de Árboles de Costa Rica_, not
  _Costa Rica Atlas de Árboles_.
- `CRTA` is internal-only (changelogs, commits, dashboards). Don't put it
  in user-facing copy.

## Tagline

EN: **A bilingual reference and field tool for the trees of Costa Rica.**
ES: **Referencia y herramienta de campo bilingüe para los árboles de
Costa Rica.**

Avoid: "Discover the magic of Costa Rican trees." "Your guide to..."
"The ultimate..." Any superlative is a brand violation.

---

## Audience promise

We promise three readers:

1. **Una abuela costarricense en Pérez Zeledón** — she finds her favorite
   tree, reads its page in her language, and recognizes herself.
2. **A taxonomist in Edinburgh** — she cites the DOI in her monograph
   because the data is rigorous and machine-readable.
3. **A 5th-grade biology teacher in Liberia** — she prints the field
   guide for a school visit to Rincón de la Vieja.

If a design decision serves one and fails another, we redesign. The page
that wins the grandmother test usually wins the others too.

---

## Visual identity

### Color tokens (source of truth)

The canonical palette lives in [src/app/globals.css](../src/app/globals.css).
This table reflects what's actually in the codebase. When tokens change,
update both places in the same PR.

#### Light mode (default)

| Role          | Token             | Hex       | Use                                                                              |
| ------------- | ----------------- | --------- | -------------------------------------------------------------------------------- |
| Background    | `--background`    | `#f7f4ec` | Page surface. Warm off-white evoking aged book paper, not sterile gallery white. |
| Foreground    | `--foreground`    | `#1f2f25` | Body text. Deep forest green-black; never `#000`.                                |
| Primary       | `--primary`       | `#2f6d4f` | Primary action / brand color. The forest canopy green.                           |
| Primary light | `--primary-light` | `#4f8b66` | Hover state, secondary surface.                                                  |
| Primary dark  | `--primary-dark`  | `#1f4a35` | Active state, deep emphasis.                                                     |
| Secondary     | `--secondary`     | `#9b6a3c` | Bark/wood tone. Used for warmth in cards and dividers.                           |
| Accent        | `--accent`        | `#e1b447` | _Cortez amarillo_ yellow — the brief signal color. Use sparingly.                |
| Muted         | `--muted`         | `#eef1e6` | Surface variants, subtle separators.                                             |
| Card          | `--card`          | `#fffdf7` | Card surface, slightly warmer than the page background.                          |
| Border        | `--border`        | `#d7dfd1` | All dividers.                                                                    |
| Success       | `--success`       | `#22c55e` | Status only. Not brand expression.                                               |
| Warning       | `--warning`       | `#eab308` | Status only. Distinct from `--accent`.                                           |
| Error         | `--error`         | `#ef4444` | Status only.                                                                     |

#### Dark mode

| Role          | Token             | Hex       |
| ------------- | ----------------- | --------- |
| Background    | `--background`    | `#0f1a0f` |
| Foreground    | `--foreground`    | `#e8f0e6` |
| Primary       | `--primary`       | `#65a85e` |
| Primary light | `--primary-light` | `#7cb874` |
| Primary dark  | `--primary-dark`  | `#2d5a27` |
| Secondary     | `--secondary`     | `#c9a06f` |

Dark mode is _not_ a high-contrast mode. A separate AAA-validated
high-contrast variant is on the L10 trust-and-safety lane.

### Naming the colors (when prose needs a label)

| Token          | Name in prose       |
| -------------- | ------------------- |
| `--primary`    | Forest canopy green |
| `--secondary`  | Bark brown          |
| `--accent`     | _Cortez_ yellow     |
| `--background` | Page (cream)        |
| `--muted`      | Mist                |

These names exist so we can say "the _Cortez_ yellow looks off in dark
mode" instead of "the `#e1b447` looks off." Keep prose specific.

### Typography

- **Body & UI:** [Geist Sans](https://vercel.com/font) — open, neutral,
  legible at small sizes. Already loaded via `next/font`.
- **Code / monospace:** Geist Mono (same family, monospace cut).
- **Scientific names** are always _italic_. _Carica papaya_, never
  Carica papaya.
- **Indigenous-language names** use the Latin script representation
  supplied by the source community; do not italicize, do not transliterate
  to a script the community doesn't use. Pronunciation guides live in
  audio recordings, not in IPA brackets.

No display / decorative fonts. The voice is the styling.

### Iconography

- **Functional icons:** the [Lucide](https://lucide.dev) icon family
  (already used). Stroke width 2, no fill, rounded line caps.
- **Tree species silhouettes** (where used decoratively): hand-traced
  vector outlines rendered in `--primary` at 80% opacity. Never
  photographic. Never tree-emoji 🌳.
- **Status / safety icons** use the semantic status tokens
  (`--success`, `--warning`, `--error`, `--info`). Don't tint with brand
  colors — safety reads as safety.

### Photography & imagery

- **Sourcing:** species photographs come from
  [iNaturalist](https://www.inaturalist.org) under CC BY-NC unless a
  contributor has uploaded under a more permissive license. Every image
  carries `credit` and `license` props. Stripping attribution is a
  license violation, not a design choice.
- **Featured images:** prefer a clean canopy or whole-tree shot when
  available; flowering closeups acceptable when the species is best
  recognized in bloom (_guayacán real_, _cortez amarillo_, _llama del
  bosque_). Avoid hands-holding-leaves stock shots.
- **No people without consent.** Photographs of indigenous communities,
  ceremonies, or named individuals require explicit consent per
  [INDIGENOUS_KNOWLEDGE_GOVERNANCE.md](INDIGENOUS_KNOWLEDGE_GOVERNANCE.md).
- **No AI-generated species imagery.** Ever. The product's credibility
  rests on real photographs of real specimens.

### Logo & wordmark

We do not currently have a custom logo. The wordmark "Costa Rica Tree
Atlas" / "Atlas de Árboles de Costa Rica" set in Geist Sans Medium at
the document's `--foreground` color **is** the wordmark.

If/when a graphical mark is commissioned, the constraint is:

- Must read at 16×16 px (favicon scale).
- Must read in `--primary` solid and in white-on-`--primary`.
- Must not be a generic tree silhouette interchangeable with any
  forestry org. The mark should be specific to Costa Rica's botanical
  context — _Cortez amarillo_ silhouette, _matapalo_ trunk lattice, the
  Crescentia cup. Anything else looks like every other "save the
  rainforest" logo.

PWA icons in [public/icons](../public/icons) are placeholder squares
until the wordmark / mark conversation lands.

---

## Voice + visual together

The brand is the intersection of the voice (terse, specific, sourced,
unsentimental) and the visual (warm cream paper, forest green, careful
typography, no stock photography). The combination should read as
"a citeable reference book that happens to live on the web," not "a
beautiful environmental site."

A useful gut check: if a page could be screenshotted and printed in a
peer-reviewed journal's supplementary materials without looking out of
place, the brand is intact. If it looks like a NGO landing page or a
tourism portal, it isn't.

---

## What's off-limits

- **No "Pura Vida"** in user-facing brand copy. It's beautiful and it's
  not ours to commodify. Used in oral histories where Costa Ricans
  themselves use it — fine.
- **No flags** in UI elements. Bilingual is a posture, not a flag-pair
  decoration. Locale switching uses `EN / ES` labels.
- **No "indigenous artwork" aesthetic** that isn't directly contributed
  by an indigenous artist with consent and credit. Pseudo-indigenous
  motifs as decoration are extractive.
- **No "100% renewable energy" boast in the brand position.** It's true
  of Costa Rica's electricity grid; it's not what the Atlas is.

---

## Open-source posture

The Atlas is open-source: MIT for code, CC BY 4.0 for editorial content,
CC BY 4.0 for the dataset (see [LICENSE](../LICENSE),
[LICENSE-CONTENT.md](../LICENSE-CONTENT.md), [LICENSE-DATA.md](../LICENSE-DATA.md)).
Indigenous-knowledge content remains governed regardless of license.

Brand expression of the open posture:

- The repository link is visible in the footer.
- The "About" page names contributors and acknowledges the iNaturalist /
  GBIF / POWO / IUCN data dependencies in plain language.
- The DOI (once minted) appears in the footer and on every species
  page's "Cite this page" block.

---

## Endorsement language

Until institutional endorsements are signed (SINAC, OTS, INBio archives,
MEP, UCR — see [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) L5), we
do not claim partnership.

| What is fine to say                                                   | What is off-limits            |
| --------------------------------------------------------------------- | ----------------------------- |
| "Data sourced from GBIF, POWO, and iNaturalist."                      | "In partnership with GBIF."   |
| "Conservation status per IUCN Red List assessments where available."  | "Endorsed by IUCN."           |
| "Aligned with SINAC's Decreto 25700-MINAE national status framework." | "An official SINAC resource." |

When an endorsement does land, the language and placement of the badge
get added to this document.

---

## When in doubt

The product gut-check is the grandmother. The brand gut-check is this:

> Could this asset / page / phrasing appear in an offprint a Costa Rican
> botanist hands to a foreign visiting researcher, without either of them
> feeling embarrassed?

If yes, it's on-brand. If it would only land at a tourism conference or
only at a hackathon, it's drifted.
