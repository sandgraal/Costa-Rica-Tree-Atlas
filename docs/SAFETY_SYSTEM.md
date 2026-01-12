# Safety Information System

**Last Updated:** 2026-01-12  
**Status:** ✅ Complete - All 110 species have comprehensive safety data (EN+ES)

## Overview

The Costa Rica Tree Atlas now includes a comprehensive safety information system to prevent harm to users, children, pets, and property. This system addresses a critical gap in tree documentation by providing detailed warnings about toxic, hazardous, and dangerous tree species.

All 110 species in the atlas have been researched and documented with safety information in both English and Spanish.

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

### Hura crepitans (Javillo/Sandbox Tree)

**Risk Level**: SEVERE ⛔

One of the world's most dangerous trees:

- All parts extremely toxic
- Sap causes severe chemical burns and blindness
- Seed pods explode with tremendous force (250 km/h)
- Sharp conical spines cover trunk and branches
- Seeds resemble edible nuts but are fatal if eaten

### Gliricidia sepium (Madero Negro)

**Risk Level**: MODERATE 🟡

Common agroforestry tree with specific warnings:

- Seeds and bark toxic to rodents (traditional rat poison)
- Moderately toxic to humans if seeds eaten
- Safe for cattle/goats but may harm horses/pigs/chickens
- Widely used in living fences when handled responsibly

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

## Future Enhancements

Planned improvements include:

- Safety-based filtering in tree directory (child-safe, pet-safe, non-toxic)
- Additional critical species documentation (Manchineel, Yellow Oleander, Jatropha)
- Print-friendly safety information for field guides
- Integration with poison control databases
- Community reporting of safety incidents

## Technical Details

### Files Modified/Created

- `contentlayer.config.ts` - Added safety fields to schema
- `src/types/tree.ts` - Added safety TypeScript interfaces
- `messages/en.json` - English translations
- `messages/es.json` - Spanish translations
- `src/components/safety/` - New component directory
  - `SafetyBadge.tsx`
  - `SafetyCard.tsx`
  - `SafetyWarning.tsx`
  - `SafetyIcon.tsx`
  - `SafetyDisclaimer.tsx`
  - `index.ts`
- `src/app/[locale]/trees/[slug]/page.tsx` - Integrated safety components
- `src/components/tree/TreeCard.tsx` - Added safety icons

### Build & Deployment

- All components compile successfully
- No breaking changes to existing functionality
- Static generation working correctly
- Type safety maintained throughout

---

_Last updated: 2025-01-10_
