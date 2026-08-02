# Costa Rica Ecoregions — Coverage Map for Deep-250

**Status:** New, 2026-07-04. Referenced by [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md)
lane L3 ("Coverage: Deep 250"). This doc exists to make ecoregion-weighted
curation possible — up to now, species were added opportunistically rather
than against a coverage map.

## How to read this document

Each ecoregion section has three parts:

1. **Definition** — boundaries and defining climate/elevation, at the level
   of established Costa Rican biogeography (Holdridge life-zone system,
   which originated in Costa Rica and is the standard reference).
2. **Current coverage** — an _approximate_ count of how many of the current
   180 species touch this ecoregion, computed from the `distribution`
   (province list) and `elevation` frontmatter fields already in each
   tree's MDX. **This is a heuristic, not a rigorous classification** — a
   species tagged `puntarenas` could be a Central Pacific lowland tree or
   an Osa Peninsula wet-forest tree; province ≠ ecoregion. Treat the counts
   as directional (which ecoregions are thin vs. well-served), not precise.
   A real fix is tracked in L3 as "Distribution polygons" (GeoJSON via
   SINAC ASP overlays + GBIF occurrence convex hulls) — until that lands,
   this is the best available signal.
3. **Curation priority** — what the gap actually looks like and why it
   matters for Deep-250.

## The 8 ecoregions

### 1. Tropical dry forest (Guanacaste)

**Definition:** Pacific northwest lowlands, pronounced ~5-month dry season
(roughly December–April), Holdridge Tropical Dry Forest life zone.
Deciduous canopy in dry season is the defining visual signature.

**Current coverage:** 105 of 180 species (58%) list `guanacaste` in their
`distribution` field — but most of these are broad-range species that also
occur elsewhere, not dry-forest specialists. This is the weakest signal in
the dataset; a real dry-forest-endemic count would be much smaller.

**Curation priority: HIGH.** Species-research pass (2026-07-04) verified 7
solid candidates not yet in the atlas: _Cochlospermum vitifolium_ (poro
poro — a dry-forest phenology icon, flowers on bare branches at dry-season
peak), _Pseudobombax septenatum_ (barrigón — swollen water-storage trunk),
_Handroanthus guayacan_ (guayacán de bola — major timber species, distinct
from the guayacan-real and corteza-amarilla already documented),
_Caesalpinia coriaria_ (nacascolo — historic tannin-export economic
botany), _Albizia guachapele_ (guachapelí — **name-collision risk with the
already-documented guachipelín/Diphysa americana; any new page must
disambiguate clearly**), _Crescentia cujete_ (jícaro sabanero — sister
species to the documented jícaro/C. alata), and _Ceiba aesculifolia_
(pochote de espinas — Mesoamerican dry-forest sister to the documented
Ceiba pentandra, though CR-specific occurrence documentation is thinner
than range-wide literature; verify against a CR-specific flora source
before committing a full page). See [`MISSING_SPECIES_LIST.md`](MISSING_SPECIES_LIST.md)
for full verification notes per candidate.

### 2. Tropical moist forest (Caribbean lowlands)

**Definition:** Northeastern and eastern lowlands (Limón, Sarapiquí),
year-round rainfall with no pronounced dry season, Holdridge Tropical Wet
Forest / Premontane Wet Forest transition.

**Current coverage:** 156 of 180 species (87%) list `limon` and/or reach no
higher than ~1200m — again a broad heuristic, not a precise count of
Caribbean-lowland specialists.

**Curation priority: MEDIUM.** Well-represented among the existing 180
(this is historically the best-studied region), but see the
research-agent findings folded into `MISSING_SPECIES_LIST.md` for specific
gap candidates once that research completes.

### 3. Tropical moist forest (Central Pacific)

**Definition:** Central Pacific coast and adjacent lowlands (Puntarenas,
Quepos/Manuel Antonio, extending toward the Osa Peninsula's wetter
transition), Holdridge Tropical Moist/Wet Forest.

**Current coverage:** 171 of 180 species (95%) list `puntarenas` and/or
reach no higher than ~1200m — the highest raw touch-count of any region,
but `puntarenas` is Costa Rica's largest and most ecologically varied
province (it spans dry-forest-adjacent zones near the Nicoya Gulf all the
way to Golfo Dulce's wet tropical forest), so this number overstates true
specialist coverage more than any other in this document.

**Curation priority: MEDIUM.** Same caveat as above — real gaps here need
the research pass's specific candidates, not this province-level count.

### 4. Premontane wet forest (Tilarán / Talamanca cordilleras)

**Definition:** Mid-elevation (roughly 700–1500m) slopes of the Tilarán and
Talamanca mountain ranges — the transition zone between lowland forest and
true cloud/montane forest.

**Current coverage:** 150 of 180 species (83%) have an elevation range
overlapping 700–1500m. This is the _least_ useful count in this document —
almost every species with a broad elevation tolerance touches this band by
definition, since it sits in the middle of Costa Rica's elevation range.
Treat this ecoregion's real coverage as unknown until reclassified more
precisely.

**Curation priority: MEDIUM** (needs a better classification method before
the priority can be assessed with confidence).

### 5. Montane oak forest

**Definition:** High elevation (roughly 2000m+) _Quercus_-dominated forest
on the Talamanca and Central Volcanic ranges — Costa Rica's coolest,
mossiest forest type, home to the resplendent quetzal's preferred habitat.

**Current coverage: 1 species with a minimum elevation ≥2000m** —
`roble-de-altura`. 4 Fagaceae (oak family) species are
now documented: `chicalaba`, `roble-corrugata`, `roble-de-altura`, `roble-encino`.
A further 25 species have elevation ranges that _reach_ 2000m+ at their
upper bound without being highland specialists.

> Superseded note: this section previously read "ZERO species with a minimum
> elevation ≥2000m … only one Fagaceae species exists in the current 175".
> That was true when written; the montane-oak curation batch has since landed
> (`chicalaba`, `roble-corrugata`, `roble-de-altura`). The gap is
> narrowing, not closed.

**Curation priority: CRITICAL — the most under-covered ecoregion in the
current corpus, confirmed by hard data, not just the plan's prior
assumption.** This should be the top priority for the next curation batch.
The 2026-07-04 research pass directly verified (via GBIF + Costa
Rica-filtered iNaturalist occurrence data, not just name resolution) a
strong slate of real highland oaks: _Quercus costaricensis_ (roble de
altura, Talamanca-endemic canopy dominant, 82 CR observations),
_Quercus insignis_ (chicalaba, IUCN Endangered, 187 CR observations — the
best-documented candidate found), _Quercus corrugata_ (a specific named
species that could sharpen the atlas's existing generic `roble-encino`
placeholder), and _Quercus copeyensis_ (roble blanco — **flag: GBIF's
backbone currently treats this as a synonym of _Quercus bumelioides_; the
International Oak Society and WFO disagree on which name is primary. Pick
one and cite the synonymy explicitly rather than silently choosing**).
Also verified: a second native conifer (_Podocarpus oleifolius_ — flag a
common-name collision risk with the already-documented _P. costaricensis_,
both loosely called "ciprecillo") and _Drimys granadensis_ (one of the
most primitive living angiosperm lineages, spanning both cordilleras per
80 CR observations). Note: _Magnolia poasana_ was proposed by the initial
research pass but is already documented in the atlas (`magnolia`) — caught
during a duplicate cross-check; see `MISSING_SPECIES_LIST.md`.

**Páramo — recommend treating as a distinct 9th category**, based on
direct evidence rather than assumption: _Hypericum irazuense_ (382 CR
observations, the single best-documented candidate across this entire
research pass, a genuine shrub not an herb, clustered specifically at
Irazú/Cerro de la Muerte summit habitat) and _Vaccinium consanguineum_
(123 observations, same summit-zone pattern) show a real, well-documented,
elevationally distinct assemblage above the oak-forest canopy line
(roughly 2800m+). **Open scope question the team needs to resolve, not a
research gap:** the strongest páramo candidates are shrubs, not trees in
the tall-canopy sense. Whether the atlas's "tree" definition is strict
enough to exclude them is an editorial call, not a botanical one — flagging
here rather than deciding unilaterally.

### 6. Cloud forest (Monteverde, Talamanca)

**Definition:** Roughly 1200–2000m, near-constant cloud cover / mist,
extremely high epiphyte load. Costa Rica's most internationally
recognized forest type (Monteverde Cloud Forest Reserve).

**Current coverage:** 84 of 180 species (47%) have an elevation range
overlapping 1200–2000m.

**Curation priority: MEDIUM-HIGH.** Better represented than montane oak
forest but still a minority of the corpus, and cloud forest is one of the
atlas's highest-recognition ecoregions internationally — worth prioritizing
alongside montane oak forest in the next batch.

### 7. Mangrove (both coasts)

**Definition:** Intertidal coastal wetland forest, Pacific coast
(Golfo Dulce, Térraba-Sierpe — the largest mangrove system in Central
America — and Golfo de Nicoya) and Caribbean coast (Tortuguero area,
though the Caribbean side has less mangrove extent and diversity than the
Pacific).

**Current coverage: NOT actually under-covered at the genus level** — this
corrects an assumption in earlier planning notes. All five true
mangrove-forming genera present in Costa Rica are already documented:
`mangle-rojo` (_Rhizophora mangle_), `mangle-negro` (_Avicennia
germinans_), `mangle-blanco` (_Laguncularia racemosa_), `mangle-botoncillo`
(_Conocarpus erectus_), and `mangle-pinuela` (_Pelliciera rhizophorae_) —
plus mangrove-associated species already covered (_Pterocarpus officinalis_,
_Mora oleifera_, _Campnosperma panamense_).

**Curation priority: LOW-MEDIUM, but with a genuinely valuable specific
opportunity.** The 2026-07-04 research pass verified 4 solid candidates
that would deepen (not fill) coverage with a citable, distinctive fact:
Costa Rica's Pacific mangroves document _higher species diversity_ than
the Caribbean side, including a second _Rhizophora_ species
(_R. racemosa_) and a second _Avicennia_ species (_A. bicolor_) — both
verified present in Golfo Dulce/Térraba-Sierpe literature. Also verified:
_Annona glabra_ (mangrove-margin, buoyant-seed adaptation) and _Hibiscus
tiliaceus_ (majagua — culturally significant cordage-fiber tree of the
upper mangrove margin). This is a "the world can cite this" fact worth the
research effort even though it's not a coverage emergency.

### 8. Riparian + urban/heritage trees

**Definition:** Streamside gallery-forest species, and trees notable for
civic/cultural presence (plaza and park specimens, national-symbol trees)
rather than a single wild habitat type — this category exists because some
of Costa Rica's most culturally important trees (the guanacaste as
national tree, ceiba as plaza specimen) are defined by cultural role as
much as by ecology.

**Current coverage:** Not computable from province/elevation data — this
category is qualitative by nature. No systematic count attempted; assess
by direct review during curation.

**Curation priority: MEDIUM.** Lower urgency than montane oak forest, but
genuinely under-explored as a _framing_ — several species already in the
atlas could arguably be cross-tagged here (e.g. `guanacaste`,
`ceiba`) rather than treated as a wholly separate coverage gap.

---

## Summary: curation priority order for the next batch

1. **Montane oak forest** — critical, zero specialist coverage, confirmed by data.
2. **Cloud forest** — medium-high, meaningfully under-represented.
3. **Tropical dry forest** — high, 7 verified candidates ready to queue.
4. **Mangrove** — low-medium priority for coverage, but high value for the
   specific "higher Pacific diversity" citable fact.
5. **Caribbean lowlands / Central Pacific / premontane wet forest /
   riparian-urban** — medium, needs the completed research pass and/or a
   better classification method (see Distribution polygons, L3) before a
   confident priority call.

See [`MISSING_SPECIES_LIST.md`](MISSING_SPECIES_LIST.md) for the full,
per-species candidate list with verification notes.
