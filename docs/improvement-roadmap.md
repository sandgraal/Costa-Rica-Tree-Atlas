# Costa Rica Tree Atlas - Improvement Roadmap

A prioritized checklist of improvements for the Costa Rica Tree Atlas. Organized by phase with clear dependencies, success metrics, and scope definitions.

**Last Updated:** 2026-01-10  
**Status:** Active Development - Autonomous Implementation in Progress  
**Last Audited:** 2026-01-10 (Codebase vs. Roadmap accuracy verified - corrections applied)

---

## Table of Contents

- [Dependencies Map](#dependencies-map)
- [Content Completeness Audit](#content-completeness-audit)
- [Phase 1: Safety & Accuracy](#phase-1-safety--accuracy-weeks-1-4)
- [Phase 2: Educational Foundation](#phase-2-educational-foundation-weeks-5-10)
- [Phase 3: Discovery & Search](#phase-3-discovery--search-weeks-11-14)
- [Phase 4: Interactive Visualizations](#phase-4-interactive-visualizations-weeks-15-18)
- [Phase 5: Polish & Accessibility](#phase-5-polish--accessibility-weeks-19-22)
- [Future Considerations](#future-considerations)
- [Research Sources](#research-sources)
- [AI Agent Guidelines](#ai-agent-guidelines)

---

## Dependencies Map

Understanding what blocks what:

```
Safety Data (Phase 1)
├── Safety Filtering (Phase 1)
├── Safety Page (Phase 1)
├── Safety Badges on Cards (Phase 1)
└── Safety Quiz Mode (Phase 2)

Glossary System (Phase 2)
├── Inline Tooltips (Phase 2)
└── Quiz Questions (Phase 2)

Care Guidance (Phase 2)
├── Tree Selection Wizard (Phase 3)
├── Diagnostic Tool (Phase 2)
└── Reforestation Guides (Phase 4)

Image Optimization (Phase 5)
├── PDF Generator (Phase 2)
├── Offline Mode/PWA (Future)
└── Distribution Maps (Phase 4)

Distribution Data (Content)
├── Interactive Maps (Phase 4)
└── Seasonal Guide (Phase 3)
```

---

## Content Completeness Audit

Track content coverage across all 110 species. Update as work progresses.

### Safety Data Coverage

**STATUS: 23/110 species (21%) have safety data in both languages** _(Corrected 2026-01-10 after codebase audit)_

**Complete (23 species with EN+ES):**

- [x] Amarillón (Terminalia amazonia) - EN+ES ✓
- [x] Anona (Annona reticulata) - MODERATE - EN+ES ✓
- [x] Cacao (Theobroma cacao) - EN+ES ✓
- [x] Carambola (Averrhoa carambola) - EN+ES ✓
- [x] Cas (Psidium friedrichsthalianum) - EN+ES ✓
- [x] Ceiba (Ceiba pentandra) - EN+ES ✓
- [x] Chancho Blanco (Vochysia guatemalensis) - EN+ES ✓
- [x] Cocobolo (Dalbergia retusa) - EN+ES ✓
- [x] Espavel (Anacardium excelsum) - LOW - EN+ES ✓
- [x] Guanábana (Annona muricata) - EN+ES ✓
- [x] Jaboncillo (Sapindus saponaria) - MODERATE - EN+ES ✓
- [x] Javillo (Hura crepitans) - SEVERE - EN+ES ✓
- [x] Jícaro (Crescentia alata) - EN+ES ✓
- [x] Laurel (Cordia alliodora) - EN+ES ✓
- [x] Madero Negro (Gliricidia sepium) - MODERATE - EN+ES ✓
- [x] Mamón Chino (Nephelium lappaceum) - EN+ES ✓
- [x] Manchineel (Hippomane mancinella) - SEVERE - EN+ES ✓
- [x] Melina (Gmelina arborea) - EN+ES ✓
- [x] Orey (Campnosperma panamense) - EN+ES ✓
- [x] Pilon (Hyeronima alchorneoides) - EN+ES ✓
- [x] Sangrillo (Pterocarpus officinalis) - EN+ES ✓
- [x] Yellow Oleander/Chirca (Thevetia peruviana) - SEVERE - EN+ES ✓
- [x] Zapatero (Hieronyma oblonga) - EN+ES ✓

**High Priority - Commonly Encountered (Remaining):**

- [ ] Guanacaste (Enterolobium cyclocarpum) - Pod safety
- [ ] Guayaba (Psidium guajava) - Generally safe, document

**Lower Priority:**

- [ ] Ciprecillo (Podocarpus costaricensis)
- [ ] Caña India (Dracaena fragrans) - Pet toxicity
- [ ] All remaining species (~87 trees)

### Glossary Coverage

- [x] 10/100+ terms documented (5 EN + 5 ES with bilingual parity)
- [x] Glossary route exists at `/glossary`
- [ ] Target: 100+ terms covering botanical, ecological, timber, and indigenous terminology

### Care Guidance Coverage

- [ ] 0/110 species have complete care sections
- Schema exists in contentlayer.config.ts but no content yet
- Target: Top 20 most-viewed species first

- [x] 1/20 priority comparison guides documented (5% complete)
- Target: 20 comparison guides
- `/compare` route exists with at least 1 comparison

### Existing Features (Verified 2026-01-10)

**Routes Already Implemented:**

- [x] `/trees` - Tree directory with filtering
- [x] `/glossary` - Botanical terminology (10 terms: 5 EN + 5 ES)
- [x] `/education` - Learning modules with lessons, printables, games
- [x] `/seasonal` - Seasonal flowering/fruiting guide
- [x] `/identify` - Tree identification tool
- [x] `/compare` - Side-by-side tree comparison
- [x] `/favorites` - Personal collection management
- [x] `/map` - Geographic distribution mapping
- [x] `/safety` - Dedicated safety information page _(Verified 2026-01-10)_

**Safety Components Already Built:**

- [x] SafetyCard, SafetyBadge, SafetyIcon components
- [x] Safety data display on tree detail pages
- [x] Toxicity level types and enums defined
- [x] SafetyPageClient with emergency contacts and first aid

**Missing Routes:**

- [ ] `/diagnose` - Tree health diagnostic tool
- [ ] `/quiz` - Educational quiz system
- [ ] `/wizard` or `/selection-wizard` - Tree selection guidance
- [x] `/conservation` - Conservation dashboard _(Created 2026-01-10)_

---

## Phase 1: Safety & Accuracy (Weeks 1-4)

**Goal:** Complete safety coverage to prevent harm to users, children, pets, and property.

**Why:** Many Costa Rican trees are highly toxic or pose structural hazards. This is safety-critical.

### 1.1 Complete Safety Data for All Species

**STATUS: 23/110 complete (21%)** _(Updated 2026-01-10 after codebase audit)_

**MVP Requirements:**

- [ ] Research and add safety data to remaining 87 species (both EN+ES)
- [x] Safety schema already defined in contentlayer.config.ts
- [ ] Prioritize SEVERE/HIGH risk species first
- [ ] Include: toxicity level, toxic parts, skin contact risk, allergen risk, structural risks
- [ ] Document pet safety (theobromine, oxalates, saponins)
- [ ] Document wood dust allergenicity for timber species
- [ ] All data must be bilingual (EN/ES)

**Safety Data Schema (reference):**

```yaml
toxicityLevel: "none" | "low" | "moderate" | "severe"
toxicParts: ["sap", "seeds", "leaves", "flowers", "bark", "fruit", "all"]
skinContactRisk: "none" | "low" | "moderate" | "severe"
allergenRisk: "none" | "low" | "moderate" | "high"
structuralRisks: ["sharp-spines", "falling-branches", "explosive-pods", "buttress-roots"]
childSafe: boolean
petSafe: boolean
requiresProfessionalCare: boolean
toxicityDetails: "Specific symptoms and doses"
skinContactDetails: "Contact reaction details"
safetyNotes: "General guidance"
```

**Best Practices:**

- Default to conservative if uncertain
- Include specific symptoms (not "causes illness" but "causes vomiting, diarrhea")
- Document fatal doses where known ("1-2 seeds fatal to children")
- Cross-reference plant family traits (Anacardiaceae = urushiol, Euphorbiaceae = toxic latex)
- Note traditional uses as evidence (fish poison = toxic)

### 1.2 Safety UI Enhancements

**STATUS: Complete** _(Verified 2026-01-10)_

- [x] Safety filters fully implemented in tree directory UI (child-safe, pet-safe, non-toxic, low-risk)
- [x] Visual safety badges display on tree cards via SafetyIcon component
- [x] Safety components exist: SafetyIcon, SafetyBadge, SafetyCard, SafetyWarning, SafetyDisclaimer
- [x] Safety section displays prominently on tree profile pages
- [x] Safety filter checkboxes functional in TreeExplorer component

### 1.3 Dedicated Safety Page

**STATUS: Exists and functional** _(Verified 2026-01-10)_

- [x] `/[locale]/safety` route exists
- [x] Lists all trees by toxicity level (severe → moderate → low)
- [x] Includes emergency contacts section
- [x] First aid procedures by exposure type
- [x] Page is printable (CSS print styles)
- [ ] Verify completeness and enhance if needed

**Emergency Contacts Included:**

- Costa Rica Poison Control: 2223-1028 (24/7)
- Emergency Services: 911
- Instituto Nacional de Seguros: 800-8000-911

### 1.4 Safety QR Codes (Nice-to-have)

- [ ] Generate printable safety signs for toxic trees
- [ ] Include QR code linking to tree page
- [ ] For use in public gardens, parks, schools

### Success Metrics

- [ ] 100% of species have safety data
- [ ] Safety page live with emergency contacts
- [ ] Safety filtering functional in directory
- [ ] Zero tree profiles missing toxicity assessment

---

## Phase 2: Educational Foundation (Weeks 5-10)

**Goal:** Transform reference catalog into actionable educational resource.

**Why:** Users can identify trees but can't care for them, understand terminology, or distinguish similar species.

### 2.1 Glossary System (100+ Terms)

**STATUS: 10/100+ terms complete (10%)** _(Updated 2026-01-10)_

**MVP Requirements:**

- [x] Glossary content structure exists (`content/glossary/en/`, `content/glossary/es/`)
- [x] Glossary page functional at `/[locale]/glossary`
- [x] 10 terms currently defined (5 EN + 5 ES with bilingual parity)
- [ ] Add 50+ botanical terms (leaf types, flower parts, bark types, root types)
- [ ] Add 20+ ecological terms (succession, nitrogen fixation, endemic, etc.)
- [ ] Add 15+ timber/wood terms (heartwood, grain, Janka hardness, CITES)
- [ ] Add 15+ indigenous terms (Bribri, Cabécar plant names)
- [ ] Each term needs: definition, visual (where applicable), example species, related terms

**Glossary Entry Schema:**

```yaml
term: "Palmate"
category: "leaf-morphology"
definition: "Leaf shape where leaflets radiate from a single point, like fingers on a hand."
relatedTerms: ["compound", "pinnate", "digitate"]
exampleSpecies: ["ceiba", "guanacaste"]
image: "/images/glossary/palmate-leaf.jpg"
```

**UI Requirements:**

- [x] Searchable glossary page with A-Z navigation - Already implemented
- [x] Filter by category - Already implemented
- [ ] Inline tooltips on all pages when terms appear in content (hover/tap for definition) - Not yet implemented

### 2.2 Care & Cultivation Guidance

**STATUS: 0/110 species have care data**

**MVP Requirements:**

- [x] Care fields already in contentlayer schema (growthRate, matureHeight, soilRequirements, etc.)
- [ ] Document care guidance for top 60 most-viewed species first
- [ ] Expand to all 110 species

**Care Data Schema:**

```yaml
growthRate: "slow" | "moderate" | "fast"
growthRateDetails: "2-3 ft/year when young"
matureHeight: "40-60 ft"
matureSpread: "30-40 ft"
soilRequirements: "Well-drained, tolerates clay"
waterNeeds: "Moderate once established"
lightRequirements: "Full sun"
spacingFromBuildings: "20 ft minimum"
propagationMethods: ["seeds", "cuttings"]
plantingSeason: "Rainy season (May-November)"
establishmentCare: "Water deeply twice weekly for first 6 months"
commonProblems: ["pest X causes symptom Y", "disease Z prevention"]
```

**Content Structure Per Species:**

- Quick reference table (growth rate, size, water, light, soil)
- Planting instructions (when, where, how)
- First two years care
- Long-term maintenance
- Common problems and solutions

### 2.3 Similar Species Comparison Guides

**MVP Requirements:**

- [ ] Identify top 20 commonly confused species pairs
- [ ] Create comparison page template
- [ ] Build 20 comparison guides

**Priority Confusion Sets:**

1. Ceiba vs. Pochote
2. Guanacaste vs. Cenízaro
3. Fig species (Ficus spp.)
4. Palm species differentiation
5. Similar flowering trees
6. Similar leaf structure trees
   7-10. [Identify from user feedback/search queries]

**Comparison Guide Structure:**

- Side-by-side photos of distinguishing features
- Comparison table (leaf, bark, flowers, fruit, size, range)
- "Key ID Tip" callout (the single best differentiator)
- Seasonal variation notes
- Range maps showing where each occurs

### 2.5 Tree Health Diagnostic Tool

**STATUS: Does not exist**

**MVP Requirements:**

- [ ] Create `/[locale]/diagnose` route with symptom-based flow
- [ ] Cover common symptoms: yellowing leaves, wilting, spots, pests, bark damage
- [ ] Provide species-specific diagnosis where applicable
- [ ] Include treatment recommendations
- [ ] Add "when to call a professional" guidance

**Diagnostic Flow:**

1. Select symptom category (leaves, bark, roots, whole tree)
2. Select specific symptom (yellowing, spots, wilting, etc.)
3. Optional: Select tree species
4. Show possible causes ranked by likelihood
5. Provide treatment/next steps

### 2.6 Field Guide PDF Generator

- [ ] Create PDF generation for selected species
- [ ] Design printable template with photos, ID tips, safety info
- [ ] Allow users to select multiple species for custom guide
- [ ] Include QR codes linking back to website

### 2.7 Tree Identification Quiz

**STATUS: Does not exist**

- [ ] Create `/[locale]/quiz` route
- [ ] Multiple modes: photo ID, leaf matching, safety quiz
- [ ] Track scores and progress
- [ ] Award badges for completion

### Success Metrics

- [ ] 100+ glossary terms with definitions and visuals
- [ ] Inline tooltips functional across site
- [ ] Top 60 species have complete care guidance
- [ ] 20 comparison guides published
- [ ] Diagnostic tool handles 10+ common symptoms
- [ ] Quiz has 50+ questions

---

## Phase 3: Discovery & Search (Weeks 11-14)

**Goal:** Help users find the right tree for their needs.

**Why:** Users ask "what tree should I plant?" but can't filter by practical criteria.

### 3.1 Advanced Filtering System

**STATUS: Complete** _(Verified 2026-01-10)_

**Filter Categories:**

- **Safety**: ✅ Fully implemented (childSafe, petSafe, nonToxic, lowRisk)
- **Conservation**: ✅ Implemented
- **Characteristics**: ✅ Tag filtering implemented
- **Temporal**: ✅ Seasonal filtering exists
- **Geographic**: ✅ Distribution filtering exists
- **Ecological**: ✅ Via tags

**Requirements:**

- [x] Multi-select filters for tags
- [x] Safety filters UI fully functional with checkboxes
- [x] Filter persistence (localStorage)
- [x] Show active filter count
- [x] "Clear All Filters" button
- [x] Mobile-friendly filter panel
- [x] All filters working and integrated

### 3.2 Seasonal Guide

**Current Status:** Already implemented _(Verified 2026-01-10)_

- [x] `/seasonal` route exists and functional
- [x] Shows trees flowering/fruiting by month
- [x] Interactive month selector
- [ ] Review and enhance: Include photos of flowers/fruits if missing

### 3.3 Use Case Search

- [ ] Create predefined searches for common needs
- [ ] Examples: "Trees for coffee shade", "Safe for playgrounds", "Erosion control", "Windbreaks"
- [ ] Display curated results with explanations

### 3.4 Tree Selection Wizard

**Current Status:** Does not exist

- [ ] Create `/wizard` or `/selection-wizard` route
- [ ] Create guided selection flow
- [ ] Questions: space available, sun exposure, purpose (shade/fruit/privacy), safety requirements
- [ ] Output personalized recommendations

### 3.5 "Similar Trees" Recommendations

- [ ] Add "Similar Trees" section to tree detail pages
- [ ] Show 3-6 related species
- [ ] Base on: family, size, uses, ecosystem

### Success Metrics

- [ ] 5+ filter categories functional
- [ ] Seasonal guide shows all species with flowering data
- [ ] 5+ predefined use case searches
- [ ] Tree wizard recommends appropriate species

---

## Phase 4: Interactive Visualizations (Weeks 15-18)

**Goal:** Visual tools for understanding tree data.
Audit what currently exists before committing to new map infrastructure.

### 4.1 Distribution Maps

- [ ] Integrate Leaflet for interactive maps
- [ ] Province-level distribution display
- [ ] Elevation range visualization
- [ ] Link to iNaturalist observations

### 4.2 Phenology Calendar

- [ ] Annual calendar showing flowering/fruiting for all species
- [ ] Gantt chart style (months as columns, species as rows)
- [ ] Color-coded by family or other criteria
- [ ] Filterable by characteristics

### 4.3 Conservation Dashboard

**Current Status:** Complete _(Created 2026-01-10)_

- [x] Create `/conservation` route at `src/app/[locale]/conservation/page.tsx`
- [x] Statistics for endangered/vulnerable species
- [x] Endemic species visualization
- [x] Links to conservation organizations (IUCN Red List)

### Success Metrics

- [ ] Maps display on all species with distribution data
- [ ] Phenology calendar functional
- [ ] Conservation dashboard live

---

## Phase 5: Polish & Accessibility (Weeks 19-22)

**Goal:** Performance, accessibility, and quality improvements.

### 5.1 WCAG 2.1 AA Compliance

- [ ] Audit all pages with axe DevTools
- [ ] Fix color contrast issues (4.5:1 minimum)
- [ ] Proper heading hierarchy
- [ ] Alt text on all images
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation throughout
- [ ] Screen reader testing (NVDA, VoiceOver)

### 5.2 Performance Optimization

- [ ] Convert images to WebP with JPEG fallbacks
- [ ] Implement responsive images
- [ ] Lazy loading for below-fold images
- [ ] Blur-up placeholders
- [ ] Target: Lighthouse >90 all metrics

### 5.3 UI Polish

- [ ] Breadcrumb navigation
- [ ] Auto-generated table of contents
- [ ] Back to top button
- [ ] Loading skeletons
- [ ] Error boundaries with recovery

### 5.4 Audio Pronunciations

- [ ] Record/generate audio for scientific names
- [ ] Add play buttons to tree pages

### Success Metrics

- [ ] WCAG 2.1 AA audit passes
- [ ] Lighthouse scores >90
- [ ] All UI polish items complete

---

## Future Considerations

Items that are valuable but require significant infrastructure or are lower priority. Revisit after Phase 5.

### Community Features (Requires Moderation Infrastructure)

- User photo contributions with moderation queue
- "Add Your Story" community submissions
- Tree observation challenges with leaderboards

### Public API (Build for Users First)

- RESTful endpoints for tree data
- API key system for researchers
- OpenAPI documentation

### Push Notifications

- Flowering alerts
- Conservation news
- New content notifications

### PWA / Offline Mode

- Service worker for offline access
- "Download for Offline" with size estimate
- Install as app prompts

### Additional Languages

- Portuguese (Brazilian researchers/tourists)
- Indigenous languages (Bribri, Cabécar glossaries)
- German/French for ecotourism market

### Advanced Features

- AR tree identification
- Community-verified observations
- Integration with local nurseries

---

## Research Sources

### Safety & Toxicology

- ASPCA Toxic and Non-Toxic Plants: https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants
- Royal Botanic Gardens Kew Toxicity Database
- Cornell University Poisonous Plants Database
- USDA Plants Database
- PubMed scientific literature

### Costa Rican Sources

- Instituto Nacional de Biodiversidad (INBio)
- SINAC (Sistema Nacional de Áreas de Conservación)
- Costa Rican National Herbarium (CR)
- CATIE (Tropical Agricultural Research Center)
- EARTH University resources

### Care & Cultivation

- Local Costa Rican nurseries
- Reforestation project documentation
- Agricultural extension services
- Scientific cultivation studies

### Identification & Taxonomy

- Flora Costaricensis
- Tropical Trees of Costa Rica field guides
- iNaturalist observations
- GBIF occurrence data

---

## AI Agent Guidelines

### When Implementing Safety Information

1. Research thoroughly using multiple sources
2. Be specific about symptoms ("causes vomiting, diarrhea" not "causes illness")
3. Include doses where known ("1-2 seeds fatal to children")
4. Consider all audiences: children, pets, woodworkers
5. Verify Spanish medical terminology with native speakers
6. Default to caution when uncertain
7. Cross-reference plant family traits
8. Document traditional uses as evidence of properties

### When Adding Care Guidance

1. Research Costa Rica-specific conditions (climate, soil, seasons)
2. Include both metric and imperial measurements
3. Note rainy vs. dry season considerations
4. Verify with local nurseries or agricultural sources
5. Include establishment period (first 2 years) separately

### When Creating Comparisons

1. Focus on the single best differentiator ("Key ID Tip")
2. Include seasonal variation (dry season appearance differs)
3. Use high-quality comparison photos
4. Note geographic range differences

### When Adding Content Generally

1. Maintain bilingual parity (EN and ES)
2. Use consistent formatting (check existing MDX files)
3. Cite sources for scientific claims
4. Link to external databases (GBIF, iNaturalist, IUCN)
5. Include photos where possible
6. Follow conventional commits for version control

---

## Version History

| Date       | Changes                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------ |
| 2026-01-10 | Initial roadmap created                                                                    |
| 2026-01-10 | Reorganized phases, added dependencies map, care guidance, diagnostic tool, reading levels |
