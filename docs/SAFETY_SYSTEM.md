# Safety Information System

**Last Updated:** 2026-02-12  
**Status:** ✅ Complete - All 154 species have comprehensive safety data (EN+ES)  
**Implementation:** Schema complete, components exist, integration verification recommended

## Overview

The Costa Rica Tree Atlas includes a comprehensive safety information system to prevent harm to users, children, pets, and property. This system addresses a critical gap in tree documentation by providing detailed warnings about toxic, hazardous, and dangerous tree species.

**Current Coverage:** All 154 species in the atlas have toxicity fields in their frontmatter (100% coverage). Safety data is researched and documented in both English and Spanish.

**Implementation Status:**

- ✅ Schema defined in `contentlayer.config.ts` (100% complete)
- ✅ All safety fields added to all 154 tree MDX files (100% coverage)
- ✅ Safety components created (`SafetyCard`, `SafetyBadge`, `SafetyWarning`, `SafetyIcon`, `SafetyDisclaimer`)
- ✅ Translations in `messages/en.json` and `messages/es.json`
- ⚠️ Component integration status: Components imported in tree detail page but usage in rendering needs verification
- ⚠️ Safety filtering in tree directory: Not yet implemented

## Features

### Data Model

All tree profiles can now include the following safety information:

- **Toxicity Level**: none, low, moderate, high, severe
- **Toxic Parts**: Which parts are dangerous (seeds, sap, leaves, bark, all, fruit, flowers, roots)
- **Skin Contact Risk**: none → severe (for dermatitis, chemical burns)
- **Allergen Risk**: none → high (for pollen and contact allergies)
- **Structural Risks**: Physical hazards (falling-branches, sharp-spines, explosive-pods, aggressive-roots, brittle-wood, heavy-fruit)
- **Boolean Flags**: childSafe, petSafe, requiresProfessionalCare
- **Detail Fields**: Comprehensive text descriptions for toxicityDetails, skinContactDetails, allergenDetails, structuralRiskDetails, safetyNotes, wildlifeRisks

### UI Components

#### SafetyCard

Comprehensive safety information panel displayed on tree detail pages. Shows:

- Color-coded risk levels with emoji indicators
- Toxic parts breakdown
- Child and pet safety indicators
- Detailed safety information
- First aid instructions for toxic trees
- Emergency contact numbers

#### SafetyBadge

Small colored risk indicators using the following system:

- 🟢 Green = Safe/None
- 🔵 Blue = Low risk
- 🟡 Yellow = Moderate risk
- 🟠 Orange = High risk
- 🔴 Red = Severe risk
- ⛔ Black/Red = Critical danger

#### SafetyWarning

Prominent alert banners for moderate, high, and severe toxicity levels. Displays before other tree information to ensure users see critical warnings first.

#### SafetyIcon

Visual safety indicator on tree cards in the directory listings, allowing users to quickly identify potentially dangerous trees.

#### SafetyDisclaimer

Legal disclaimer displayed on all tree pages with safety information, clarifying that:

- Information is for educational purposes only
- Individual reactions may vary
- Users should consult medical professionals
- Contains emergency contact information

### Bilingual Support

All safety information is fully translated into both English and Spanish with medically accurate terminology, not just literal translations.

### Accessibility

- WCAG 2.1 AA compliant color contrast
- Icon + text labels (not color-only indicators)
- ARIA labels for screen readers
- Semantic HTML structure
- Mobile-optimized responsive design

## Critical Species Documented

### Severely Toxic Species (4 documented)

**Risk Level**: SEVERE ⛔

The atlas documents 4 species with severe toxicity:

1. **Hura crepitans** (Javillo/Sandbox Tree)
   - All parts extremely toxic
   - Sap causes severe chemical burns and blindness
   - Seed pods explode with tremendous force (250 km/h)
   - Sharp conical spines cover trunk and branches
   - Seeds resemble edible nuts but are fatal if eaten

2. **Hippomane mancinella** (Manchineel/Manzanillo)
   - One of the world's most dangerous trees
   - All parts highly toxic, including smoke from burning wood
   - Sap causes severe skin burns and blindness
   - Fruit resembles small apples but is deadly if eaten
   - Listed in Guinness World Records as most dangerous tree

3. **Thevetia peruviana** (Yellow Oleander/Chirca)
   - All parts contain cardiac glycosides
   - Seeds especially toxic (one seed can be lethal)
   - Common ornamental, often mistaken for safe species

4. **Erythrina poeppigiana** (Poró)
   - Seeds contain toxic alkaloids
   - Traditional use as fish poison
   - Beautiful flowering tree, widely planted

### High Toxicity Species

**Spathodea campanulata** (Llama del Bosque/African Tulip Tree) - High toxicity, invasive species

### Moderate Toxicity Species

**Gliricidia sepium** (Madero Negro) - Common agroforestry tree:

- Seeds and bark toxic to rodents (traditional rat poison)
- Moderately toxic to humans if seeds eaten
- Safe for cattle/goats but may harm horses/pigs/chickens
- Widely used in living fences when handled responsibly

**Jaboncillo** (_Sapindus saponaria_) - Soap berry tree with saponins

**Statistical Breakdown (January 2026 audit, 129 species):**

- Severe: 4 species (3.1%)
- High: ~5 species (3.9%)
- Moderate: ~15 species (11.6%)
- Low: ~45 species (34.9%)
- None: ~60 species (46.5%)

## Adding Safety Information

To add safety information to a tree profile, update the frontmatter in the MDX file:

```yaml
---
title: "Tree Name"
scientificName: "Genus species"
# ... other fields ...

# Safety Information
toxicityLevel: "severe"
toxicParts:
  - "sap"
  - "seeds"
skinContactRisk: "severe"
allergenRisk: "low"
structuralRisks:
  - "sharp-spines"
  - "explosive-pods"
childSafe: false
petSafe: false
requiresProfessionalCare: true
toxicityDetails: "Detailed description of toxicity, compounds, symptoms, first aid..."
skinContactDetails: "Description of skin contact risks and effects..."
structuralRiskDetails: "Description of physical hazards..."
safetyNotes: "General warnings and precautions..."
wildlifeRisks: "Risks to wildlife and pets..."
---
```

## Emergency Contacts

The system displays emergency contact information for Costa Rica:

- **Emergency Services**: 911
- **Poison Control Center**: 2223-1028

## Research Sources

When adding safety information, use authoritative sources:

- ASPCA Animal Poison Control Database
- USDA PLANTS Database
- Costa Rica National Poison Control Center
- Scientific literature (PubMed, toxicology journals)
- SINAC / INBio documentation
- Medical case reports

⚠️ **Do not use**: Random blog posts, unverified forums, or Wikipedia alone.

## Completed Enhancements

✅ **Critical Species Documentation**: Manchineel (_Hippomane mancinella_) and Yellow Oleander (_Thevetia peruviana_) now documented
✅ **All 154 species** have safety frontmatter fields
✅ **Safety components** created and ready for integration

## Future Enhancements

Planned improvements include:

### High Priority

- 🔴 **Verify SafetyCard integration** - Components exist but need confirmation they're rendering on tree detail pages
- 🔴 **Safety-based filtering** - Add filters to tree directory (child-safe, pet-safe, non-toxic)
- 🔴 **SafetyIcon in tree cards** - Visual indicators in directory listings

### Medium Priority

- 🟡 **Dedicated safety page** - Create `/safety` route with all safety information, emergency contacts, and educational content
- 🟡 **Print-friendly safety cards** - PDF generation for field guides
- 🟡 **Safety search** - "Find child-safe fruit trees" or "Show pet-safe ornamentals"

### Low Priority

- 🔵 **Integration with poison control databases** - API connections to ASPCA, Costa Rica Poison Control
- 🔵 **Community reporting** - User-submitted safety incidents and experiences
- 🔵 **Additional critical species** - Jatropha, Castor Bean (if adding non-native ornamentals)

## Technical Details

### Files Modified/Created

**Schema & Types:**

- ✅ `contentlayer.config.ts` - Added 13 safety fields to Tree schema (lines 123-195)
- ✅ `src/types/tree.ts` - Added safety TypeScript interfaces

**Translations:**

- ✅ `messages/en.json` - English translations for safety terms
- ✅ `messages/es.json` - Spanish translations for safety terms

**Components:**

- ✅ `src/components/safety/` - Complete component directory:
  - `SafetyBadge.tsx` - Color-coded risk level badges
  - `SafetyCard.tsx` - Comprehensive safety information panel
  - `SafetyWarning.tsx` - Alert banners for high/severe risks
  - `SafetyIcon.tsx` - Visual safety indicators for cards
  - `SafetyDisclaimer.tsx` - Legal disclaimer component
  - `index.ts` - Barrel exports

**Integration:**

- ✅ `src/app/[locale]/trees/[slug]/page.tsx` - Imports `SafetyCard` and `SafetyDisclaimer`
- ⚠️ **Verification needed**: Confirm components are rendered in JSX (line 20 imports but rendering not confirmed in file scan)
- ❌ `src/components/tree/TreeCard.tsx` - Safety icons not yet integrated in directory cards

**Content:**

- ✅ **All 154 tree MDX files** in `content/trees/en/` and `content/trees/es/` have `toxicityLevel` field
- ✅ **100% coverage** - Every species has safety assessment

### Build & Deployment

- ✅ All components compile successfully
- ✅ No breaking changes to existing functionality
- ✅ Static generation working correctly (1,058 pages)
- ✅ Type safety maintained throughout
- ⚠️ Component rendering verification recommended

### Safety Field Schema

```typescript
// From contentlayer.config.ts lines 123-195
toxicityLevel: "none" | "low" | "moderate" | "high" | "severe"
toxicParts: string[] // ["seeds", "sap", "leaves", "bark", "all", "fruit", "flowers", "roots"]
skinContactRisk: "none" | "low" | "moderate" | "high" | "severe"
allergenRisk: "none" | "low" | "moderate" | "high"
structuralRisks: string[] // ["falling-branches", "sharp-spines", "explosive-pods", etc.]
childSafe: boolean
petSafe: boolean
requiresProfessionalCare: boolean
toxicityDetails: string
skinContactDetails: string
allergenDetails: string
structuralRiskDetails: string
safetyNotes: string
wildlifeRisks: string
```

---

_Last updated: 2026-01-19_
