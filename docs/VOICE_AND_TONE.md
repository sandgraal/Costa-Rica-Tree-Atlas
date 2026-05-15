# Voice & Tone — Costa Rica first, world welcome

**Last Updated:** 2026-05-15
**Status:** v1.0 — Authoritative for content additions and copyedits

This document defines the voice of the Costa Rica Tree Atlas. It is for
writers, copyeditors, AI agents working on content, and reviewers
checking PRs. The voice is **Costa Rica first, world welcome**.

For grammar mechanics, see the
[spanish-copyeditor](../.claude/agents/spanish-copyeditor.md) subagent
guide.

---

## The home register is Costa Rican Spanish

Spanish is the home language of the atlas. English is full parity, not
the primary. When authoring new content, write Spanish first; let
English be a sibling, not a parent.

**Costa Rican Spanish (español tico)**, not Castilian:

- Latin American verb conjugations and orthography.
- `usted` for the authoritative voice; `vos` is allowed in
  oral-history quotations or first-person Tico narrative passages.
- Avoid Castilian-only words ("ordenador," "zumo," "móvil"); prefer
  "computadora," "jugo," "celular."
- Costa Rican common names take precedence over more general Spanish
  forms. _Guapinol_, not _algarrobo_. _Madero negro_, not _matarratón_,
  unless the article is explicitly cross-referencing a region where the
  alternative is dominant.

When a Spanish term is region-specific within Costa Rica (Guanacaste vs.
Caribbean vs. Central Valley vs. South), name it as a regional variant
rather than choosing one as "standard."

---

## Three voices for three audiences

The site is read by Costa Ricans, by scientists, and by tourists /
educators / curious humans. They want different things; we serve all
three with the same writing.

### To the Costa Rican reader

You're writing for someone who knows what _guayacán real_ blooms look
like in March, who learned about Costa Rica's _Pago por Servicios
Ambientales_ in school, and who is reasonably tired of being told their
country is "an ecological paradise."

- Treat Costa Rican context as the home context, not the exotic context.
  Don't translate _Pura Vida_ for the reader.
- National-pride hooks land when they're specific: _Sin Ejército_ since
  1948, the 1996 Forestry Law (Ley Forestal 7575), 99%+ renewable
  electricity, MEP biology curriculum, the work of SINAC and INBio.
  Don't paste these on top; weave them in where germane.
- Don't be a tour guide. Avoid "Costa Rica's stunning biodiversity,"
  "this magical country," and similar fawning. The reader already knows.

### To the scientist / researcher

You're writing for someone who will cite this if it's good enough.

- Be precise about taxonomy. Author citations, synonymy, canonical IDs
  (POWO, WFO, GBIF) are required.
- Hedge appropriately: "Recent phylogenetic work places X in family Y,
  though some authors retain it in Z" beats "X is in family Y."
- Source the strong claims. Two independent sources for high-risk
  sections.
- Distinguish global vs. national vs. regional IUCN scope explicitly.

### To the tourist / educator / curious reader

You're writing for someone who wants to learn and might not have
botanical training.

- Lead with the striking fact. The flame of the _guayacán real_ in
  bloom, the explosive seedpods of the _javillo_, the buttress roots of
  _cachimbo_ that look like the prow of a ship.
- Define terms inline or in the glossary. Don't assume someone knows
  what "emergent canopy" or "dehiscent fruit" mean.
- Practical guidance is welcome: where to see this tree in the wild, in
  what season, near which park. Field-tool framing.

These voices are not three different versions of the page. They coexist
in one piece of writing. A scientist tolerates an evocative opening
sentence; a tourist appreciates a sourced citation. The skill is
weaving rather than separating.

---

## Tone — what we are and aren't

We are:

- **Reverent without being precious.** These trees matter. The voice
  carries that. But "precious" tips into condescension; we don't
  patronize.
- **Curious.** Trees are interesting on their own; we don't have to
  inflate them. Specifics over superlatives.
- **Direct.** A 15-word sentence beats a 25-word sentence.
- **Bilingual in spirit.** We don't apologize for being in two
  languages, we don't translate idioms that should stay in their home
  language. _Matapalo_ is a matapalo. _Comezón_ doesn't need an English
  equivalent in parens.

We are not:

- **Brochure-y.** "Magical," "stunning," "must-see," "hidden gem,"
  "off-the-beaten-path" — these belong in tourism marketing, not here.
- **Sentimental.** "Every tree has a story" reads like a greeting card.
  Tell the tree's specific story.
- **Lecturing.** We don't tell readers what to feel about deforestation.
  We tell them what's happening, sourced, and trust their reaction.
- **Performatively grim.** Conservation status is real, but a page that
  reads like an obituary doesn't help. Document the threat, document the
  response, document the path forward.

---

## Voice tells (examples)

### Bad (avoid)

> Costa Rica, a magical country known worldwide for its breathtaking
> biodiversity, is home to the stunning Cocobolo tree, a true treasure
> of Central American dry forests.

Why it's bad: tour-brochure adjectives, no specifics, generic awe, the
reader learns nothing.

### Good

> _Cocobolo_ (_Dalbergia retusa_) is a Central American dry-forest tree
> whose heartwood, swirled with orange and black, has commanded
> $100–300 per board foot for centuries. That price drove it to
> Critically Endangered globally; CITES Appendix II protection now
> regulates international trade, with mixed enforcement in Costa Rica's
> dry Pacific provinces.

Why it works: specific numbers, named status, named geography, no
filler adjectives.

### Bad (Spanish version)

> Costa Rica, un país mágico conocido mundialmente por su impresionante
> biodiversidad, alberga el espectacular Cocobolo, un verdadero tesoro
> de los bosques secos centroamericanos.

Same problems, plus literal-translation feel.

### Good (Spanish version)

> El _Cocobolo_ (_Dalbergia retusa_) es un árbol del bosque seco
> centroamericano cuyo corazón, veteado de naranja y negro, ha valido
> entre $100 y $300 el pie tablar durante siglos. Ese precio lo llevó
> al estado En Peligro Crítico a nivel global; la protección CITES
> Apéndice II ahora regula el comercio internacional, con cumplimiento
> variable en las provincias secas del Pacífico costarricense.

Why it works: feels written, not translated. Specific. Costa-Rican
geography named directly.

---

## On indigenous content

You do not write indigenous content. Indigenous-language tree names,
ceremonial uses, oral histories, and any material attributed to an
indigenous community are governed by
[INDIGENOUS_KNOWLEDGE_GOVERNANCE.md](INDIGENOUS_KNOWLEDGE_GOVERNANCE.md).
The default is "ask first," and refusal is a valid answer.

When the source for a Bribrí, Cabécar, Maleku, Boruca, Térraba, Ngäbe,
Huetar, or Chorotega name is present and consented, present the name
with its Local Contexts TK / BC label and its native-speaker
pronunciation recording where available. Don't paraphrase the meaning
unless the source explicitly explained it. Don't invent etymology.

---

## On safety content

Safety pages have a different register: blunter, more imperative,
shorter sentences.

### Good

> _Javillo_ (_Hura crepitans_): the sap blinds. The seedpods explode
> when ripe and can scatter shrapnel up to 40 meters. Do not stand under
> a fruiting tree. Do not let children climb it. If sap contacts the
> eye, irrigate with clean water for 15 minutes and seek a hospital.

Why: a parent in Pérez Zeledón needs to know this in 8 seconds, in
Spanish, and so does an unprepared tourist.

---

## On uncertainty

You will encounter species where the conservation status is contested,
the ethnobotanical use is reported in one paper and contradicted by
another, the common name varies by region. Document the uncertainty
honestly:

> Some authors record _X_ as treated with the bark of _Y_; others find
> no traditional precedent and suggest the practice was imported
> post-conquest. We have not been able to confirm with a regional
> source.

This is better than asserting one side or both.

---

## When in doubt

Ask: _would a Costa Rican grandmother in Pérez Zeledón be proud of
this page about her favorite tree? Would a taxonomist in Edinburgh cite
it? Would a 5th-grade biology teacher in Liberia hand it to her class?_

If yes to all three, ship it. If you're unsure, lean Spanish-first,
specific, sourced, and unsentimental.
