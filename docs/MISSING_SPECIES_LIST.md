# Missing Species — Expansion List

**Last Updated:** 2026-07-04
**Current Species Count:** 180 documented, target 250 (Deep-250, see
[`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) lane L3)
**This rebuild:** ~68 unique, individually-verified candidates across the 8
ecoregions defined in [`ECOREGIONS.md`](ECOREGIONS.md), plus a proposed 9th
category (páramo). Supersedes the pre-2026-07-04 "missing species" section
below, which is preserved as a historical record (see
[Archive](#archive-pre-2026-07-04-methodology) at the bottom) — it named
only ~13 forward-looking candidates against a since-updated 75-species
target, and predates the ecoregion-weighted curation approach.

## How this list was built

A research pass (2026-07-04) cross-referenced GBIF species-match and
Costa-Rica-filtered occurrence data, POWO, and iNaturalist against the
current 175-species list, ecoregion by ecoregion. Every candidate below
was verified to actually resolve to a real, accepted taxon and to have
documented Costa Rican occurrence — not just genus-level plausibility.
Two candidates that the initial research surfaced were caught and removed
during a follow-up cross-check against the live species list: **Magnolia
poasana** and **Astronium graveolens** ("Ron Ron") are already documented
in the atlas (`magnolia`, `ron-ron`) — a reminder that even careful
per-agent verification still needs a final check against ground truth
before anything is queued.

**Confidence labels** (STRONG / GOOD / MODERATE / WEAK) reflect how
solidly the species' Costa Rica-specific occurrence and encyclopedic
sourcing were verified — not conservation status. Species flagged
MODERATE or WEAK are still real, verified taxa; they just need more
research before committing to a full Tier-1 page. **Naming-collision
flags** call out where a new candidate's common name overlaps with an
already-documented species under a similar name — these need explicit
disambiguation in the frontmatter/title, not just in this list.

---

## Tropical Dry Forest (Guanacaste)

1. **Poro Poro / Bototillo** — _Cochlospermum vitifolium_ (Willd.) Spreng., Cochlospermaceae. Dry-season phenology icon (blooms leafless), ACG restoration/succession literature. **STRONG.** Also reaches the Central Pacific transition zone.
2. **Palo Santo** — _Bursera graveolens_ (Kunth) Triana & Planch., Burseraceae. Congener of the documented _B. simaruba_ (indio-desnudo); real conservation-trade angle (international incense-market harvest pressure). **MODERATE-STRONG** — the strong ceremonial narrative found in sources is Andean (Ecuador/Peru), not demonstrably Costa Rican; lean on the ecology/trade angle for this page, not an implied CR ceremonial tradition.
3. **Corteza Amarilla de Guanacaste / Guayacán Amarillo** — _Handroanthus chrysanthus_ (Jacq.) S.O.Grose, Bignoniaceae. Iconic synchronized dry-season bloom. **STRONG.** ⚠️ **Naming collision** — the atlas already has `corteza-amarilla` = _Handroanthus ochraceus_; this needs a clearly distinguishing title. Also widely planted as an urban ornamental (see Riparian/Urban-Heritage).
4. **Casco de Venado** — _Bauhinia ungulata_ L., Fabaceae. Most common native _Bauhinia_ in ACG; bat-pollinated. **STRONG** — direct ACG primary-source confirmation. Avoid the common name "pata de vaca" (used in CR for introduced Asian _Bauhinia_).
5. **Chaperno** — _Lonchocarpus costaricensis_ (Donn.Sm.) Pittier, Fabaceae. **Costa Rican endemic**, restricted to the dry northwest. **STRONG** per dedicated verification — two independent academic papers (taxonomy + population genetics) focus specifically on this species. No confirmed IUCN assessment found; verify via `iucn-verifier` before drafting frontmatter rather than assuming a category.
6. **Cabalonga / Guayabillo Venenoso** — _Karwinskia calderonii_ Standl., Rhamnaceae. Dry-forest-restricted (Chiapas–Guanacaste); documented livestock toxicity gives a real Safety-page hook. **MODERATE** — thin photographic record (7 CR iNaturalist observations); most toxicology literature covers the congener _K. humboldtiana_, so avoid over-generalizing genus-level chemistry to this exact species without a citation naming it specifically.
7. **Aromo** — _Vachellia farnesiana_ (L.) Wight & Arn., Fabaceae. Guanacaste-specific botanical variety (_var. guanacastensis_) described from Janzen's own 1976 ACG collections. **MODERATE** — verify independently whether this species (vs. congeners like _V. collinsii_, cornizuelo) actually hosts obligate ant colonies before repeating that claim.
8. **Nacascolo** — _Caesalpinia coriaria_ (Jacq.) Willd., Fabaceae. Historic tannin-export economic botany (colonial-era leather trade). **STRONG.**
9. **Guachapelí** — _Albizia guachapele_ (Kunth) Dugand, Fabaceae. Major dry-forest/premontane timber tree. **MODERATE** — GBIF synonym handling noted. ⚠️ **Naming collision** — easily confused with the documented `guachipelin` = _Diphysa americana_; disambiguate clearly.
10. **Jícaro Sabanero** — _Crescentia cujete_ L., Bignoniaceae. Sister species to the documented `jicaro` (_C. alata_); larger fruit historically used for gourd vessels. **STRONG** for botany/ecology. 🔒 **Indigenous-content gate** — any Chorotega-specific ceremonial/craft claims beyond general "used for gourd vessels" must route through `needs-indigenous-review` per [`INDIGENOUS_KNOWLEDGE_GOVERNANCE.md`](INDIGENOUS_KNOWLEDGE_GOVERNANCE.md), not be drafted autonomously.
11. **Pochote de Espinas** — _Ceiba aesculifolia_ (Kunth) Britten & Bak.f., Malvaceae. Mesoamerican dry-forest sister species to the documented _Ceiba pentandra_. **MODERATE** — CR-specific occurrence documentation is thinner than range-wide (Mexico/Guatemala) literature; confirmed occurrences cluster in Guanacaste/Heredia. Verify against a CR-specific flora source (e.g. Manual de Plantas de Costa Rica) before committing a full page.
12. **Barrigón** — _Pseudobombax septenatum_ (Jacq.) Dugand, Malvaceae. Swollen water-storage trunk. **STRONG** — see Central Pacific for the primary, more specific verification (Garabito/Jacó); also present in Guanacaste dry-forest remnants.
13. _Optional/specialist:_ **Rehdera trinervis**, Verbenaceae — dominant intermediate-successional-stage species per Mesoamerican forest-succession literature. **WEAK-MODERATE** — no common English name, thin photographic record (9 global iNaturalist observations), no ethnobotanical literature found. Include only if the atlas wants a dedicated succession-ecology teaching page.

_Also researched and correctly excluded:_ _Pithecellobium dulce_ (naturalized, not native), _Bombacopsis quinata_ (synonym of the documented `pochote`), _Guazuma ulmifolia_ (already documented as `guacimo`), _Cordia guanacastensis_ (synonym risk), _Luehea candida_ (already documented as `guacimo-molenillo`), _Sabal mexicana_ (CR presence unconfirmed), _Handroanthus guayacan_ (proposed by an initial pass but dropped after a direct GBIF occurrence-search check found no Guanacaste/Central Pacific records contradicting the claim — flag for a fresh look if revisited, don't assume the initial proposal was right).

---

## Mangrove (Both Coasts)

The atlas already documents all 5 true Costa Rican mangrove-forming genera (`mangle-rojo`, `mangle-negro`, `mangle-blanco`, `mangle-botoncillo`, `mangle-pinuela`) plus mangrove-associates _Pterocarpus officinalis_, _Mora oleifera_, and _Campnosperma panamense_. This is **not** a coverage emergency — see [`ECOREGIONS.md`](ECOREGIONS.md) — but the research pass found a genuinely citable fact: Costa Rica's Pacific mangroves (Golfo Dulce, Térraba-Sierpe, Golfo de Nicoya) are documented as more diverse than the Caribbean side.

1. **Mangle Rojo Gigante** — _Rhizophora racemosa_ G.Mey., Rhizophoraceae. Co-dominant (sometimes dominant) with _R. mangle_ in Golfo Dulce/Térraba-Sierpe; substrate for the culturally significant piangua (_Anadara tuberculosa_) shellfish fishery recognized by the Ramsar Convention. **STRONG** — peer-reviewed CR-specific studies (UCR Revista de Biología Tropical) plus named localities.
2. **Mangle Negro Pacífico** — _Avicennia bicolor_ Standl., Acanthaceae. Innermost/landward zone in Golfo de Nicoya, behind _Rhizophora_ and _A. germinans_. **STRONG** — IUCN **Vulnerable** (2010, criteria A2cd, range-restricted + 31-42% habitat loss), a strong conservation-narrative hook; thin iNaturalist count (4) reflects genuine rarity, not weak verification (curator-confirmed, multiple independent academic sources). Note: "_Avicennia tonduzii_," seen in older CR literature, is a synonym of this species — don't double-count it as a third Avicennia.
3. **Anonillo / Anona de Manglar** — _Annona glabra_ L., Annonaceae. Landward mangrove-margin, buoyant water-dispersed fruit; documented medicinal use plus emerging anticancer-compound research interest. **STRONG.** ⚠️ **Naming collision** — the atlas already has `anona` = _Annona reticulata_ (a cultivated orchard fruit, ecologically unrelated); use a distinct slug (e.g. `anonillo`) with explicit cross-referencing.
4. **Majagua / Hibisco Marítimo** — _Talipariti tiliaceum_ (L.) Fryxell (= _Hibiscus tiliaceus_ L.), Malvaceae. Landward mangrove-margin cordage-fiber tree, forms pure stands at the high-tide line on both coasts. **VERY STRONG** — 377 CR iNaturalist observations, the best-documented mangrove candidate found. Lead with _Talipariti tiliaceum_ as current-accepted name, note _Hibiscus tiliaceus_ as the still-widely-used synonym.
5. **Pie de Paloma** — _Tabebuia palustris_ Hemsl., Bignoniaceae. Mangrove-margin shrub/small tree on elevated brackish soils — a "hidden diversity" story (Bignoniaceae otherwise represented in the atlas only by upland/dry-forest species). **STRONG** — 104 GBIF Costa Rica occurrence records with named localities (Golfito, Rincón de Osa mangrove, Guanacaste); common name confirmed via SINAC's national forest inventory.
6. _Documented but rare, consider as a sidebar rather than a standalone page:_ **Mangle Rojo Híbrido** — _Rhizophora × harrisonii_ Leechm. Natural hybrid of _R. mangle_ × _R. racemosa_, documented near Río Tarcolés and Damas Island. **MODERATE** — real and GBIF-accepted, but only 1 CR iNaturalist observation and field identification is genuinely difficult (often confused with straight _R. racemosa_).
7. _Hold for further verification:_ **Chaperno** — _Pithecellobium lanceolatum_, Fabaceae — mangrove-margin association is only weakly pinned to Costa Rica specifically (general range description, not a CR-specific citation).
8. _Hold for further verification:_ **Mostrenco / Algarrobo** — _Prosopis juliflora_, Fabaceae — mangrove-edge/dry-forest-fringe association is generic rather than site-specific. ⚠️ If pursued, note explicitly that this genus has a global reputation as invasive elsewhere (Africa, South Asia) while apparently native/naturalized in Guanacaste's dry Pacific zone — state this precisely, don't imply it's a problem species in its native range.

_Also researched and correctly excluded:_ _Mora megistosperma_ (synonym of documented `sota`), _Rhabdadenia biflora_ (a vine, not a tree), _Terminalia catappa_ (non-native, not ecologically mangrove-specific — see Riparian/Urban-Heritage for a different, civic-tree framing of this same species), _Cynometra_ spp. (no CR-specific verification found), _Muellera frutescens_ (no CR-specific citation found), _Coccoloba_ spp. other than the documented papaturro (none verified).

---

## Tropical Moist Forest — Caribbean Lowlands

1. **Palma Amargo** — _Welfia regia_ H.Wendl. ex André, Arecaceae. Canopy-dominant palm at La Selva/Sarapiquí, co-dominant with the documented `gavilan` (_Pentaclethra macroloba_). **STRONG.**
2. **Palma Zancona (Walking Palm)** — _Socratea exorrhiza_ (Mart.) H.Wendl., Arecaceae. Iconic stilt-root palm; studied root-ecology plus a popular "can trees walk?" myth-busting angle. **STRONG.**
3. **Maquenque (Copa Palm)** — _Iriartea deltoidea_ Ruiz & Pav., Arecaceae. Key macaw/mammal food source. **STRONG.**
4. **Otoba** — _Otoba novogranatensis_ Cuatrec., Myristicaceae. Aromatic nutmeg-family canopy tree, bat-dispersed. **MODERATE-STRONG** — broad-range species (also strong in the southern Pacific), Caribbean-specific ecological detail thinner than general.
5. **Chaconia** — _Warszewiczia coccinea_ (Vahl) Klotzsch ex M.R.Schomb., Rubiaceae. Enlarged scarlet floral bracts, major hummingbird nectar source; Trinidad & Tobago's national flower gives a comparative-symbolism angle. **STRONG** — 1,032 iNaturalist observations. ⚠️ **Naming collision** — distinct from the documented `llama-del-bosque` (_Spathodea campanulata_, an introduced African species); lead with "Chaconia" in the title.
6. **Titor / Cocorón** — _Sacoglottis trichogyna_ Cuatrec., Humiriaceae. Canopy emergent whose seeds are documented alternative food for the Great Green Macaw (Macaw Recovery Network) when preferred trees are scarce — a distinctive keystone-wildlife story. **STRONG** on taxonomy/range; no confirmed IUCN assessment found (document as Not Evaluated).
7. **Cocora / Trompillo** — _Guarea guidonia_ (L.) Sleumer, Meliaceae. Common Caribbean-slope mahogany-family tree, distinct from the atlas's other Meliaceae. **STRONG** — 1,464 iNaturalist observations.
8. _Flag for a follow-up occurrence check:_ **San Juan** — _Goethalsia meiantha_ (Donn.Sm.) Burret, Malvaceae — monotypic genus (taxonomic-rarity value), but thin field documentation (~17 observations).

_Also researched and correctly excluded:_ _Dipteryx oleifera_ (synonym of documented `almendro`), _Hyeronima oblonga_ (synonym of documented `zapatero`), _Vantanea barbourii_ (confirmed occurrences are southern-Pacific, not Caribbean).

---

## Tropical Moist Forest — Central Pacific

1. **Jagua / Guaitil** — _Genipa americana_ L., Rubiaceae. Culturally significant genipin dye tree (body-painting traditions across the Americas), edible fruit. **STRONG** — 417 GBIF CR occurrences confirmed at Quepos, Turrubares, Carara-adjacent sites. 🔒 Any description of specific community ceremonial/body-painting practice (beyond general published ethnobotany) should route through `needs-indigenous-review`. Also present in dry-forest riparian corridors.
2. **Molenillo** — _Quararibea asterolepis_ Standl., Malvaceae. Plank-buttressed canopy tree, major food source for monkeys/bats/birds at Manuel Antonio, Carara, Punta Leona. **GOOD** — cites Croat (1978) and Stiles & Skutch (1989).
3. **Cacao de Mono** — _Herrania purpurea_ (Pittier) R.E.Schult., Malvaceae. Wild relative of _Theobroma cacao_ (already documented) — direct comparative-botany tie-in. **STRONG** — 217 GBIF CR occurrences.
4. **Barrigón** — _Pseudobombax septenatum_ (Jacq.) Dugand, Malvaceae. Swollen water-storage trunk, bat-pollinated night flowers. **STRONG** — 135 GBIF CR occurrences with strong Garabito/Jacó representation. See Dry Forest for the same species' broader range.
5. **Corozo / Sujo** — _Attalea rostrata_ Kunth ex Mart., Arecaceae. Feather palm, important mammal food source; fills a Central-Pacific gap (the atlas's existing palms lean Caribbean/wetland). **MODERATE** — modest occurrence count (36), likely under-photographed rather than genuinely rare.
6. Cross-reference: **Poro Poro** — _Cochlospermum vitifolium_ — primary entry under Dry Forest, also reaches this ecoregion's dry-to-moist transition.

_Also researched and explicitly rejected after a direct GBIF occurrence-search re-check_ (a reminder that a plausible-sounding claim from an earlier pass still needs independent confirmation): _Handroanthus guayacan_ and _Sterculia recordiana_ — both real, GBIF-accepted species, but their confirmed Costa Rican occurrences cluster in Guanacaste/Heredia/Sarapiquí, not the Central Pacific as an earlier pass claimed. _Ceiba aesculifolia_ was also checked and its confirmed occurrences are Guanacaste/Heredia — see Dry Forest instead.

---

## Premontane Wet Forest (Tilarán / Talamanca)

1. **Aguacatillo Blanco** — _Ocotea whitei_ Woodson, Lauraceae. Monteverde-belt, documented quetzal food. **MODERATE** — real (GBIF exact match) but only 5 CR iNaturalist observations.
2. **Meliosma vernicosa** (no confirmed common name) — Sabiaceae, a family with zero current presence in the atlas. Canopy tree at 800–2300m, directly in the Tilarán/Sarchí corridor. **GOOD** — a dedicated Sida journal taxonomic synopsis exists.
3. **Arrayán Mora** — _Weinmannia wercklei_ Standl., Cunoniaceae. Second, distinct _Weinmannia_ beyond the documented `arrayan` (_W. pinnata_); documented in CR cloud-forest ethnobotany as a construction-timber source. **MODERATE** — a peer-reviewed campesino-ethnobotany paper (Mountain Research and Development) names it directly.
4. **Oreopanax capitatus** (EN: "broad-leaved balsam"; ES name uncertain — don't guess) — Araliaceae. Distinct from the documented `lorito` (_O. xalapensis_). **GOOD** — 45 CR iNaturalist observations, the broadest in this batch.
5. **Turpinia occidentalis** (no confirmed common name) — Staphyleaceae, absent from the current 175. **GOOD** — 19 CR observations including one precisely geotagged at 1,565m on the Monteverde Continental Divide.
6. **Clusia stenophylla** (no confirmed common name) — Clusiaceae; the atlas has _Clusia rosea_ (`copey`) but this is a taxonomically distinct species. **WEAK** — the most speculative pick in this ecoregion; no dedicated secondary literature found beyond taxonomic databases.
7. **Gavilán Colorado** — _Alfaroa costaricensis_ Standl., Juglandaceae (the walnut family, absent from the current 175). Nut-bearing timber tree; Costa Rica hosts more _Alfaroa_ species than any other country — a genuine national-distinction hook. **GOOD** — a BioOne/Novon taxonomic revision plus a likely dedicated ACG page.
8. **Miconia trinervia** (no single confirmed common name) — Melastomataceae; the atlas has one Melastomataceae already (`lengua-de-vaca` = _Miconia argentea_), so this adds a second, distinct species in a conspicuous cloud/premontane-forest family. **GOOD** — 55 CR iNaturalist observations, the strongest count in this batch, plus a bilingual ACG species page.
9. **Capulín** — _Styrax argenteus_ C.Presl, Styracaceae. IUCN Least Concern (an easy conservation-status entry). **MODERATE.** ⚠️ **Naming collision** — "capulín" is also used regionally for the already-documented _Muntingia calabura_, an unrelated species; disambiguate clearly.

_Also researched and explicitly dropped:_ _Guarea kunthiana_ and _Quararibea costaricensis_ for this ecoregion specifically (too few CR observations here — though _G. kunthiana_ is included under Cloud Forest, where a site-specific peer-reviewed study exists). _Sapium glandulosum_ is already documented as `yos`.

---

## Montane Oak Forest

**The most under-covered ecoregion in the current corpus, confirmed by data, not assumption** — see [`ECOREGIONS.md`](ECOREGIONS.md). Zero of 175 current species have a minimum elevation ≥2000m.

1. **Roble de Altura** — _Quercus costaricensis_ Liebm., Fagaceae. Talamanca-endemic canopy dominant above ~1800m, core Resplendent Quetzal habitat (Los Quetzales NP). **STRONG** — 82-89 CR observations across two independent verification passes.
2. **Roble Blanco / Copey Oak** — _Quercus copeyensis_ C.H.Mull., Fagaceae. Co-dominant Talamanca oak forming the oak-bamboo forest belt around Cerro de la Muerte/Copey. **STRONG** on species reality. ⚠️ **Taxonomic-name flag** — GBIF's backbone currently treats this as a synonym of _Quercus bumelioides_, but the International Oak Society and WFO disagree on which name is primary. Pick one and cite the synonymy explicitly rather than silently choosing.
3. **Chicalaba** — _Quercus insignis_ M.Martens & Galeotti, Fagaceae. Large-acorn oak, broader elevation range into the premontane transition. **VERY STRONG** — 187 CR observations, the best-documented Quercus candidate; IUCN **Endangered** (a ready-made, citable conservation-status source).
4. **Roble Encino (named species)** — _Quercus corrugata_ Hook., Fagaceae, 700-2200m. **STRONG** on taxonomy. This is an editorial choice, not a clean net-new addition: the atlas's current `roble-encino` entry is a generic `Quercus spp.` placeholder — the team should decide whether to add this alongside it or use it to sharpen the existing placeholder into a named species.
5. _Bonus 5th option, not yet fully scoped:_ **Quercus benthamii** — confirmed accepted (GBIF), a Talamanca oak not covered above if a 5th named oak is wanted.
6. **Podocarpus oleifolius** (no confirmed common name) — Podocarpaceae. Second native conifer; Costa Rica's Podocarpaceae are the country's only native gymnosperm lineage in these highlands. **STRONG** — 70 CR observations concentrated at Cerro de la Muerte. ⚠️ **Naming collision** — avoid reusing "ciprecillo," already used for the documented _P. costaricensis_.
7. **Drimys granadensis** L.fil. (no confirmed common name; regionally "canelo de páramo," unverified for CR) — Winteraceae, one of the most primitive living angiosperm lineages. **STRONG** — 80 CR observations spanning both cordilleras (Copey/Dota, Juan Castro Blanco, Poás, El Guarco). Also proposed independently under Cloud Forest and as a páramo-edge transition species — this is the same species; place the full page here (montane oak/páramo transition) and cross-reference from Cloud Forest.
8. _Border case with strong elevation data:_ **Prunus annularis** Koehne — Rosaceae. **MODERATE** (only 8 observations) but individual records span 1,600m–3,000m within a single species, directly relevant evidence for the páramo-boundary question below.

_Also researched:_ _Quercus seemannii_ (too few observations, dropped) and _Quercus rapurahuensis_ (confirmed synonym of the accepted _Quercus benthamii_ — same species as #5 above, don't double-count).

⚠️ **REMOVED — already documented:** _Magnolia poasana_ was proposed by the initial research pass but is already in the atlas (`magnolia`). Do not re-add.

---

## Páramo — proposed 9th ecoregion category

Not one of the 8 categories in the original L3 plan, but the research pass found strong, specific evidence for treating it separately rather than folding it into montane oak forest — see the reasoning in [`ECOREGIONS.md`](ECOREGIONS.md).

1. **Hypericum irazuense** Kuntze ex N.Robson — Hypericaceae. **VERY STRONG** — 382 CR observations, the single best-documented candidate across this entire research pass; a genuine shrub (not herb), clustered specifically at Irazú/Cerro de la Muerte summit habitat, IUCN Near Threatened.
2. **Vaccinium consanguineum** Klotzsch — Ericaceae, a native blueberry relative. **STRONG** — 123 observations at Volcán Irazú, Dota, Pérez Zeledón summit zones.
3. **Comarostaphylis arbutoides** Lindl. ("dwarf madrone") — Ericaceae. **STRONG** — 148 observations, though this one actually straddles montane-oak-forest and páramo-edge rather than being purebred páramo.
4. **Cavendishia bracteata** (Ruiz & Pav. ex A.St.-Hil.) Hoerold — Ericaceae. **STRONG** — 365 observations, the best-documented of the four, but skews toward montane-oak-forest/cloud-forest elevations rather than true above-treeline páramo — consider placing this one under Montane Oak Forest instead if the páramo category is adopted with a strict elevation boundary.

**Open scope question for the team, not a research gap:** the strongest páramo candidates (#1, #2) are shrubs, not trees in the tall-canopy sense the atlas otherwise uses. Whether "tree" is defined strictly enough to exclude them is an editorial call — flagging here rather than deciding unilaterally.

---

## Cloud Forest (Monteverde, Talamanca)

1. **Ocotea monteverdensis** W.C.Burger (no confirmed common name) — Lauraceae. Critically Endangered, Monteverde-endemic canopy giant (to 35m); documented critical food-pulse source for the Resplendent Quetzal and three-wattled bellbird. **STRONG** — the best-documented cloud-forest candidate, with independent confirmation from Monteverde Institute, Fondation Franklinia, and CIEE conservation sources (>95% population decline over 180 years).
2. **Guayabillo de Monteverde** — _Guarea kunthiana_ A.Juss., Meliaceae. **STRONG** — a site-specific peer-reviewed study exists (_Journal of Tropical Ecology_, on two-stage bird/agouti seed dispersal, specifically at Monteverde).
3. **Lloró** — _Cornus disciflora_ Moc. & Sessé ex DC., Cornaceae. Costa Rica's native dogwood, co-dominant with oak and jaúl in premontane/montane forest. **STRONG** — a dedicated Revista Ambientico feature article plus a Kurú (Revista Forestal de Costa Rica) technical note.
4. **Jaúl** — _Alnus acuminata_ Kunth, Betulaceae. Upper-montane dominant, also Costa Rica's principal reforestation species above 1500m. **STRONG** — FAO/ITTO forestry documentation, 243 GBIF CR records.
5. **Cocora** — _Billia rosea_ (Planch. & Linden) C.Ulloa & P.M.Jørg. (syn. _B. hippocastanum_), Sapindaceae. Epiphyte-laden canopy tree across CR's principal mountain ranges. **MODERATE-STRONG** — 445 iNaturalist observations, though no Monteverde/Talamanca-specific case study found.
6. **Higuerón Amarillo / Amate Dorado** — _Ficus aurea_ Nutt., Moraceae. Strangler fig. **STRONG** on taxonomy; the specific "year-round quetzal/toucanet food at Monteverde" claim traces to secondary summaries of Nathaniel Wheelwright's Monteverde frugivory research rather than a directly-fetched primary paper — pull the primary citation before publishing that specific claim.
7. Cross-reference: **Quercus costaricensis**, **Quercus copeyensis** — primary entries under Montane Oak Forest, also present at the lower edge of cloud forest.
8. Cross-reference: **Drimys granadensis** — primary entry under Montane Oak Forest/páramo transition.

_Also researched and deprioritized after thin verification:_ _Weinmannia wercklei_ (see Premontane Wet Forest instead — same species, better-verified there), _Clusia alata_, _Podocarpus guatemalensis_, _Magnolia sororum_ — all real but only 4-12 global observations or old herbarium-only records with no Monteverde/Talamanca-specific literature found.

---

## Riparian + Urban/Heritage

1. **Sauce Criollo** — _Salix humboldtiana_ Willd., Salicaceae. The only native willow in the American tropics; streambank specialist. **STRONG** — 53 CR records concentrated in Cartago riverside/urban-edge sites.
2. **Madre de Agua** — _Erythrina fusca_ Lour., Fabaceae. Distinct from the documented `poro` (_E. poeppigiana_); grows at river edges, lagoon borders, flooded forest. **STRONG** — 124 CR records at Río Tárcoles, Caño Negro.
3. **Carne Asada / Almendro de Río** — _Andira inermis_ (W.Wright) DC., Fabaceae. Dual-fit: naturally a riverbank tree, also independently documented as a recommended native shade tree for Meseta Central urban parks. Bark smells of roasted meat (source of the common name). **STRONG** — 404 CR records; distinct genus from the documented `almendro` (_Dipteryx panamensis_).
4. **Higuerón / Jagüey** — _Ficus citrifolia_ Mill., Moraceae. Distinct from the documented `higueron` (_F. insipida_) and the generic `matapalo` placeholder. **STRONG** on taxonomy (447 CR records); **WEAK/flag** on the specific "urban heritage tree" narrative — general confirmation that centenary trees exist in San José parks was found, but not a citation naming this exact species at a specific named plaza. Treat the cultural-heritage framing as generic-genus-level until a dedicated source turns up.
5. **Almendro de Playa** — _Terminalia catappa_ L., Combretaceae. Functions as a de facto community gathering-point tree along Costa Rican coastal towns (net-mending, vendor stalls). **STRONG** sourcing. ⚠️ **Must state clearly: introduced/naturalized (native to India/tropical Asia), not native to Costa Rica** — the only candidate on this list that isn't native. Same species was investigated and correctly excluded from Mangrove (not ecologically mangrove-specific there); this is a different, civic-tree claim.
6. **Nacedero** — _Trichanthera gigantea_ (Bonpl.) Nees, Acanthaceae. Genuine streambank specialist (name means "spring/source" in Spanish); used regionally for erosion control. **MODERATE** — only 7 CR records; likely needs to draw on broader Latin American (mostly Colombian) riparian-restoration literature rather than CR-specific sources.
7. Cross-reference: **Corteza Amarilla de Guanacaste** (_Handroanthus chrysanthus_) — primary entry under Dry Forest, also widely planted as an urban ornamental (confirmed example: Universidad para la Paz).

_Also researched and correctly excluded/deprioritized:_ a hypothesis that Costa Rica's coat of arms features real coconut palms was disproven during research (it depicts stylized decorative "palmas de mirto," not a real species) — a useful example of why that angle didn't produce a candidate. _Sabal mexicana_ as a plaza palm and a specific named heritage-tree individual were also investigated without surviving verification.

---

## Summary tally

| Ecoregion                   | Solidly verified (STRONG/GOOD)        | Moderate/weak, needs more work       | Priority (see ECOREGIONS.md)                                         |
| --------------------------- | ------------------------------------- | ------------------------------------ | -------------------------------------------------------------------- |
| Tropical dry forest         | 10                                    | 3                                    | HIGH                                                                 |
| Mangrove                    | 5                                     | 3                                    | LOW-MEDIUM (coverage), but high value for the Pacific-diversity fact |
| Caribbean lowlands          | 7                                     | 1                                    | MEDIUM                                                               |
| Central Pacific             | 5                                     | 1                                    | MEDIUM                                                               |
| Premontane wet forest       | 8                                     | 1                                    | MEDIUM                                                               |
| Montane oak forest          | 7                                     | 1                                    | **CRITICAL**                                                         |
| Páramo (proposed)           | 4                                     | 0 (scope question, not verification) | HIGH, pending scope decision                                         |
| Cloud forest                | 6                                     | 0 (2 are cross-references)           | MEDIUM-HIGH                                                          |
| Riparian/urban-heritage     | 6                                     | 1                                    | MEDIUM                                                               |
| **Total unique candidates** | **~58 solid + ~10 needing more work** |                                      |                                                                      |

This is short of a round 75, deliberately — every research pass was told to prioritize accuracy over hitting a quota, and several plausible-sounding leads were investigated and dropped rather than padded in. The gap is a feature: it's an honest starting queue, not a target to pad out with unverified names before curation begins.

---

## Archive: pre-2026-07-04 methodology

The section below is the original species-tracking list, preserved for
historical continuity. It used a different organizing principle
(ecological category rather than ecoregion) and its "recently added"
changelog documents real, completed work — the atlas's growth from ~110
to 175 species. Its forward-looking "missing species" section is
superseded by the ecoregion-mapped list above.

### ✅ Recently Added Species

#### Latest Additions (2026-02-22)

- **Pochote de Agua** - _Pachira aquatica_ - Malabar Chestnut, ornamental/edible wetland tree ✅
- **Canelo** - _Ocotea tenera_ - Lauraceae cloud forest timber, aromatic bark ✅
- **Cedro Macho** - _Carapa guianensis_ - Crabwood, andiroba oil, Meliaceae timber ✅
- **Copal** - _Protium costaricense_ - Ceremonial incense resin, Burseraceae ✅
- **Sota** - _Mora oleifera_ - Endangered Fabaceae, massive buttress roots, Osa Peninsula ✅
- **Guácimo Molenillo** - _Luehea candida_ - White Linden, fibrous bark for cordage ✅

#### Previous Additions (2026-02-16)

- **Bálsamo** - _Myroxylon balsamum_ - Aromatic resin/timber legume, CITES Appendix III ✅
- **Hule** - _Castilla elastica_ - Panama Rubber Tree, pre-Columbian rubber source ✅
- **Güítite** - _Acnistus arborescens_ - Keystone bird-habitat tree, 50+ bird species ✅
- **Burío** - _Heliocarpus appendiculatus_ - Pioneer fiber tree, traditional cordage ✅
- **Peine de Mico** - _Apeiba tibourbou_ - Spiny fruit rainforest tree, wildlife food source ✅

#### Previous Additions (2026-02-15)

- **Nim** - _Azadirachta indica_ - Introduced drought-tolerant medicinal/agroforestry tree ✅

#### Latest Additions (2026-02-12)

- **Zorrillo** - _Senna reticulata_ - Medicinal wetland legume ✅
- **Contra** - _Rauvolfia tetraphylla_ - Traditional medicinal shrub-tree (toxic) ✅
- **Achotillo** - _Brosimum costaricanum_ - Native rainforest Moraceae tree ✅
- **Guarumbo Hembra** - _Cecropia peltata_ - Pioneer succession tree distinct from _C. obtusifolia_ ✅
- **Bambú Gigante** - _Guadua angustifolia_ - Structural giant bamboo (special-case woody grass) ✅
- **Cedro Dulce** - _Cedrela tonduzii_ - Highland cedar, montane timber species ✅
- **Quina** - _Cinchona pubescens_ - Quinine tree, historic medicinal bark ✅

#### Previous Additions (2026-02-10)

- **Granadillo** - _Dalbergia tucurensis_ - Guatemalan Rosewood, vulnerable timber species ✅

#### Previous Additions (2026-01-15)

- **Sigua** - _Nectandra cissiflora_ - Laurel family, fragrant wood timber ✅
- **Comenegro** - _Simarouba glauca_ - Paradise tree, medicinal bark ✅
- **Mayo** - _Vochysia hondurensis_ - Important timber species ✅
- **Lechoso Montañero** - _Brosimum lactescens_ - Mountain breadnut, milk tree ✅

#### Previous Additions (2026-01-14)

- **Quizarrá** - _Nectandra salicina_ - Cloud forest laurel ✅
- **Llama del Bosque** - _Spathodea campanulata_ - African tulip tree (invasive ornamental) ✅

#### Previous Additions (Since 2026-01-12)

The following 12 species from the original missing list were successfully documented: all 5 mangrove species (mangle rojo, negro, blanco, piñuela, botoncillo), 3 native forest trees (cachimbo, mastate, ira rosa), 2 cloud forest species (arrayán, lorito), 3 dry forest species (cornizuelo, madroño, quebracho), and 1 conservation priority species (nazareno).

### Confirmed duplicates removed (historical verification pass, 2026-01-19)

Nine species were found to already be documented under different common
names: Kerosén = Ron Ron (_Astronium graveolens_), Chilamate = Higuerón
(_Ficus insipida_), Cañafístula Rosada = Carao (_Cassia grandis_), Cas
Dulce = Cas (_Psidium friedrichsthalianum_), Marañón de Playa = Espavel
(_Anacardium excelsum_), Guarumo Colorado = Guarumo (_Cecropia
obtusifolia_), Balso = Balsa (_Ochroma pyramidale_), Laurel Aguacatillo =
Aguacatillo (_Persea caerulea_), Ajo Montañero = Ajo (_Caryocar
costaricense_). **Lesson carried forward into the 2026-07-04 rebuild:**
always verify scientific names against the live species list before
queuing a candidate — this caught two more duplicates this round
(_Magnolia poasana_, _Astronium graveolens_ again, independently
re-proposed by a research agent who hadn't seen this historical note).

### Content requirements per species (unchanged)

- Full bilingual content (EN + ES) at Tier 1 depth (≥600 EN / ≥500 ES lines)
- Safety data (toxicity, hazards)
- Care guidance (if cultivatable)
- High-quality images (featured + gallery, ≥5 images)
- iNaturalist integration
- Geographic distribution
- Conservation status (IUCN + CITES + SINAC where applicable)
- Canonical taxonomic IDs (POWO, GBIF, IUCN assessment ID)

### See also

- [ECOREGIONS.md](./ECOREGIONS.md) — the coverage map this list is organized around
- [CONTENT_STANDARDIZATION_GUIDE.md](./CONTENT_STANDARDIZATION_GUIDE.md) — Tier definitions and section templates
- [`.claude/skills/add-species.md`](../.claude/skills/add-species.md) — the guided procedure for adding a species from this list
