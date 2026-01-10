# Costa Rica Tree Atlas - Improvement Roadmap & Task Checklist

This document provides a comprehensive checklist of incomplete tasks and improvement opportunities for the Costa Rica Tree Atlas project. Each item includes detailed specifications to enable AI agents and developers to complete work following best practices.

**Last Updated:** 2026-01-10
**Status:** Active Development

---

## 🚨 CRITICAL INCOMPLETE TASKS

### Priority 1: Complete Safety Information System

#### Background
PR #106 implemented the safety information infrastructure with schema fields, UI components (SafetyBadge, SafetyWarning, SafetyCard, SafetyIcon, SafetyDisclaimer), and bilingual translations. However, only 8 trees have safety data populated.

#### Trees WITH Safety Data (Complete)
- [x] Javillo (Hura crepitans) - SEVERE toxicity
- [x] Manchineel (Hippomane mancinella) - SEVERE toxicity  
- [x] Yellow Oleander (Thevetia peruviana) - SEVERE toxicity
- [x] Jaboncillo (Sapindus saponaria) - MODERATE toxicity
- [x] Anona (Annona reticulata) - MODERATE toxicity (seeds)
- [x] Espavel (Anacardium excelsum) - LOW toxicity
- [x] Madero Negro (Gliricidia sepium) - MODERATE toxicity
- [x] Chirca (Thevetia peruviana ES) - SEVERE toxicity

#### Trees NEEDING Safety Data (Incomplete)

**High Priority - Commonly Encountered/Cultivated:**
- [ ] Guanábana (Annona muricata) - Research Annonaceae family toxicity
- [ ] Cacao (Theobroma cacao) - Theobromine toxicity to pets
- [ ] Carambola (Averrhoa carambola) - Oxalic acid kidney concerns
- [ ] Mamón Chino (Nephelium lappaceum) - Seed safety
- [ ] Cas (Psidium friedrichsthalianum) - Generally safe, document
- [ ] Jícaro (Crescentia alata) - Fruit/seed safety

**Medium Priority - Native Forest Species:**
- [ ] Ceiba (Ceiba pentandra) - Spines, kapok fiber irritation
- [ ] Laurel (Cordia alliodora) - Generally safe, document
- [ ] Pilon (Hyeronima alchorneoides) - Safety assessment needed
- [ ] Amarillón (Terminalia amazonia) - Safety assessment needed
- [ ] Zapatero (Hieronyma oblonga) - Red bark compounds
- [ ] Chancho Blanco (Vochysia guatemalensis) - Safety assessment needed
- [ ] Orey (Campnosperma panamense) - Anacardiaceae family check
- [ ] Sangrillo (Pterocarpus officinalis) - Sap assessment
- [ ] Madroño (Calycophyllum candidissimum) - Safety assessment needed

**Medium Priority - Timber Species:**
- [ ] Cocobolo (Dalbergia retusa) - Wood dust allergenicity (KNOWN ISSUE)
- [ ] Melina (Gmelina arborea) - Safety assessment needed

**Lower Priority - Endemic/Rare:**
- [ ] Ciprecillo (Podocarpus costaricensis) - Safety assessment needed

**Additional Species (Audit Needed):**
- [ ] Caña India (Dracaena fragrans) - Pet toxicity concerns
- [ ] All remaining tree species in content/trees/en/ and content/trees/es/

#### Implementation Specifications

**Safety Data Schema (Already Exists - Reference):**
```yaml
# Add to frontmatter of each tree MDX file
toxicityLevel: "none" | "low" | "moderate" | "severe"
toxicParts: ["all" | "sap" | "seeds" | "leaves" | "flowers" | "bark" | "fruit"]
skinContactRisk: "none" | "low" | "moderate" | "severe"
allergenRisk: "none" | "low" | "moderate" | "high"
structuralRisks: ["sharp-spines" | "falling-branches" | "explosive-pods" | "buttress-roots"]
childSafe: boolean
petSafe: boolean
requiresProfessionalCare: boolean
toxicityDetails: "Detailed bilingual explanation"
skinContactDetails: "Detailed bilingual explanation"
allergenDetails: "Detailed bilingual explanation"
structuralRiskDetails: "Detailed bilingual explanation"
safetyNotes: "General safety guidance"
wildlifeRisks: "Risks to domestic animals"
```

**Research Sources for Safety Data:**
- ASPCA Toxic and Non-Toxic Plants: https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants
- Royal Botanic Gardens Kew Toxicity Database
- Cornell University Poisonous Plants Database
- USDA Plants Database
- Costa Rican Instituto Nacional de Biodiversidad (INBio)
- PubMed/scientific literature on plant toxicology
- Traditional knowledge databases

**Best Practices for Safety Documentation:**
1. **Default to Conservative:** If uncertain, mark as requiring caution
2. **Cite Sources:** Include research references in toxicityDetails
3. **Bilingual Accuracy:** Ensure medical terminology is correct in both EN and ES
4. **Specific Symptoms:** Document actual symptoms (e.g., "causes vomiting, diarrhea" not "causes illness")
5. **Dose Information:** Include fatal doses where known (e.g., "1-2 seeds fatal to children")
6. **Traditional Knowledge:** Note historical uses as poison/medicine as evidence of toxicity
7. **Pet Safety:** Always assess Theobromine, oxalates, saponins for pets
8. **Wood Safety:** For timber species, research wood dust allergenicity and sensitization

**Example Implementation (Cocobolo):**
```yaml
toxicityLevel: "low"
toxicParts: []
skinContactRisk: "moderate"
allergenRisk: "high"
structuralRisks: ["falling-branches"]
childSafe: true
petSafe: true
requiresProfessionalCare: false
toxicityDetails: "Wood is non-toxic. No known ingestion hazards from the tree itself."
skinContactDetails: "Cocobolo sawdust and wood oils contain sensitizing compounds that can cause allergic contact dermatitis in woodworkers. Fresh sawdust is more problematic than aged wood. Skin reactions are cumulative - sensitivity increases with repeated exposure."
allergenDetails: "HIGHLY ALLERGENIC to woodworkers. Cocobolo dust is a known sensitizer causing respiratory issues (asthma, rhinitis) and skin reactions. Ranked among the most allergenic tropical hardwoods. Woodworkers must use respiratory protection and dust collection. Cross-reactivity possible with other Dalbergia species (rosewood family)."
structuralRiskDetails: "Large tree reaching 25 meters. Branches can fall during storms. Standard large tree precautions apply."
safetyNotes: "Safe as a living tree for general public. Primary concerns are for woodworkers who must handle sawdust with proper protective equipment. Not toxic to pets or children in landscape settings."
```

---

## 🎯 HIGH-PRIORITY IMPROVEMENTS

### 1. Safety System Enhancements

#### 1.1 Safety Filtering in Tree Directory
- [ ] Add safety filter to tree directory page
- [ ] Implement filter options: "Safe for Children", "Safe for Pets", "No Toxicity", "Low Risk", "Requires Caution"
- [ ] Add visual safety badges to tree cards in directory view
- [ ] Update search/filter UI component

**Technical Implementation:**
```typescript
// Add to tree directory filter state
const [safetyFilter, setSafetyFilter] = useState<SafetyLevel[]>([])

// Filter logic
const filteredTrees = trees.filter(tree => {
  if (safetyFilter.length === 0) return true
  if (safetyFilter.includes('child-safe') && !tree.childSafe) return false
  if (safetyFilter.includes('pet-safe') && !tree.petSafe) return false
  if (safetyFilter.includes('no-toxicity') && tree.toxicityLevel !== 'none') return false
  return true
})
```

#### 1.2 Dedicated Safety Page
- [ ] Create `/safety` route with dedicated page
- [ ] List all trees with moderate to severe toxicity
- [ ] Group by toxicity level with expandable sections
- [ ] Include quick reference charts
- [ ] Add emergency contact information section
- [ ] Make page printable with CSS print styles

**Content Structure:**
```markdown
# Tree Safety Guide for Costa Rica

## Emergency Contacts
- Costa Rica Poison Control: 2223-1028 (24/7)
- Emergency Services: 911
- Instituto Nacional de Seguros Medical: 800-8000-911

## Severely Toxic Trees (Avoid All Contact)
[List with photos, scientific names, common locations]

## Moderately Toxic Trees (Handle with Caution)
[List with specific warnings]

## Trees Toxic to Pets
[Separate section for pet owners]

## First Aid Procedures
[By type of exposure: ingestion, skin contact, eye contact]
```

#### 1.3 Emergency Information Section
- [ ] Add structured emergency contact data to site config
- [ ] Create EmergencyContacts component
- [ ] Display on safety page and toxic tree pages
- [ ] Include provincial hospital contacts
- [ ] Add map links for nearest emergency facilities

**Data Structure:**
```typescript
interface EmergencyContact {
  name: string
  phone: string
  available: "24/7" | "business-hours"
  languages: string[]
  services: string[]
}

const emergencyContacts: EmergencyContact[] = [
  {
    name: "Costa Rica Poison Control Center",
    phone: "2223-1028",
    available: "24/7",
    languages: ["Spanish", "English"],
    services: ["Plant poisoning", "Chemical exposure", "Animal bites"]
  }
]
```

#### 1.4 Safety QR Codes for Public Plantings
- [ ] Create QR code generator for tree safety cards
- [ ] Design printable safety warning templates
- [ ] Generate PDFs with tree photo, QR code, emergency info
- [ ] Add "Generate Safety Sign" button to tree pages

**QR Code Content:**
```
Tree: Manchineel (Hippomane mancinella)
WARNING: Extremely Toxic
Do not touch any part
Emergency: 911
Details: [Link to tree page]
```

### 2. Search & Discovery Improvements

#### 2.1 Advanced Filtering System
- [ ] Implement comprehensive filter system with multiple categories
- [ ] Add filter persistence (URL params and localStorage)
- [ ] Create FilterPanel component with collapsible sections
- [ ] Add "Clear All Filters" button
- [ ] Show active filter count

**Filter Categories to Implement:**
```typescript
interface TreeFilters {
  // Safety
  toxicity: ('none' | 'low' | 'moderate' | 'severe')[]
  childSafe: boolean | null
  petSafe: boolean | null
  
  // Conservation
  conservation: ('LC' | 'NT' | 'VU' | 'EN' | 'CR' | 'EX')[]
  
  // Characteristics  
  uses: ('edible' | 'timber' | 'medicinal' | 'ornamental' | 'shade')[]
  size: ('small' | 'medium' | 'large')[] // <10m, 10-25m, >25m
  nativeStatus: ('native' | 'endemic' | 'introduced')[]
  
  // Temporal
  floweringMonth: Month[]
  fruitingMonth: Month[]
  
  // Geographic
  distribution: Province[]
  elevation: ('0-500m' | '500-1000m' | '1000-1500m' | '1500-2000m' | '>2000m')[]
  
  // Ecological
  ecosystem: ('rainforest' | 'dry-forest' | 'wetland' | 'cloud-forest' | 'mangrove')[]
  wildlifeValue: ('birds' | 'mammals' | 'insects' | 'pollinators')[]
}
```

#### 2.2 "Flowering This Month" Seasonal Guide
- [ ] Create `/seasonal` route
- [ ] Display trees by current month's flowering/fruiting
- [ ] Add calendar view with interactive month selection
- [ ] Include photos of flowers/fruits
- [ ] Add "Subscribe to Notifications" for flowering alerts

**Component Structure:**
```tsx
<SeasonalGuide>
  <MonthSelector currentMonth={currentMonth} />
  <section>
    <h2>Trees Flowering in {monthName}</h2>
    <TreeGrid trees={floweringTrees} />
  </section>
  <section>
    <h2>Trees Fruiting in {monthName}</h2>
    <TreeGrid trees={fruitingTrees} />
  </section>
</SeasonalGuide>
```

#### 2.3 "Trees Like This" Recommendation Engine
- [ ] Implement similarity algorithm based on characteristics
- [ ] Add "Similar Trees" section to tree detail pages
- [ ] Show 3-6 related species
- [ ] Base recommendations on: family, size, uses, ecosystem

**Algorithm Factors:**
```typescript
function calculateSimilarity(tree1: Tree, tree2: Tree): number {
  let score = 0
  if (tree1.family === tree2.family) score += 30
  if (tree1.nativeRegion === tree2.nativeRegion) score += 20
  if (overlap(tree1.uses, tree2.uses).length > 0) score += 15
  if (overlap(tree1.tags, tree2.tags).length > 2) score += 20
  if (similar(tree1.maxHeight, tree2.maxHeight, 5)) score += 10
  if (overlap(tree1.distribution, tree2.distribution).length > 3) score += 5
  return score
}
```

#### 2.4 Use Case Search
- [ ] Create use case search page `/search/use-cases`
- [ ] Add predefined searches: "Trees for coffee shade", "Reforestation species", "Safe for playgrounds", "Windbreaks", "Erosion control"
- [ ] Display curated results with justification

### 3. Interactive Maps & Visualizations

#### 3.1 Distribution Maps
- [ ] Integrate Leaflet or Mapbox for interactive maps
- [ ] Create province-level distribution heatmaps
- [ ] Add elevation range visualization
- [ ] Link to iNaturalist observations on map
- [ ] Add "Report Observation" feature

**Technical Stack:**
```bash
npm install leaflet react-leaflet
npm install @types/leaflet
```

**Map Component:**
```tsx
<TreeDistributionMap
  tree={tree}
  observations={iNaturalistData}
  provinces={tree.distribution}
  elevationRange={tree.elevation}
/>
```

#### 3.2 Phenology Calendar Visualization
- [ ] Create interactive annual calendar showing all trees' flowering/fruiting
- [ ] Use D3.js or Recharts for visualization
- [ ] Color code by family or toxicity
- [ ] Allow hover for tree details
- [ ] Make it filterable by characteristics

**Visualization Type:** Gantt chart style with months as columns, species as rows

#### 3.3 Conservation Dashboard
- [ ] Create `/conservation` route with dashboard
- [ ] Show CR/EN/VU species statistics
- [ ] Visualize endemic species (Costa Rica only)
- [ ] Add conservation status trends over time
- [ ] Link to conservation organizations

---

## 📚 EDUCATIONAL CONTENT EXPANSION

### 4. Glossary Expansion

#### Current Status
Only 5 glossary terms exist: Pinnate, Buttress Roots, Deciduous, Drupe, Pioneer Species

#### 4.1 Botanical Terminology (Target: 50 terms)
- [ ] Leaf types: palmate, compound, simple, alternate, opposite, whorled
- [ ] Flower parts: sepal, petal, stamen, pistil, inflorescence
- [ ] Tree structure: crown, canopy, understory, emergent
- [ ] Reproduction: monoecious, dioecious, hermaphrodite, wind-pollinated
- [ ] Bark types: smooth, fissured, papery, scaly
- [ ] Root types: taproot, fibrous, aerial roots, pneumatophores
- [ ] Growth forms: shrub, tree, multi-stemmed

**Implementation:**
```yaml
# content/glossary/en/palmate.mdx
---
term: "Palmate"
category: "leaf-morphology"
definition: "A leaf shape where leaflets radiate from a single point, resembling an open hand with fingers spread."
relatedTerms: ["compound", "pinnate", "digitate"]
exampleSpecies: ["ceiba", "guanacaste-tree"]
image: "/images/glossary/palmate-leaf.jpg"
---
```

#### 4.2 Ecological Concepts (Target: 20 terms)
- [ ] Succession: primary, secondary, climax forest
- [ ] Nitrogen fixation
- [ ] Mycorrhizal relationships
- [ ] Keystone species
- [ ] Endemic species
- [ ] Seed dispersal mechanisms: anemochory, zoochory, hydrochory
- [ ] Forest strata: emergent, canopy, understory, forest floor
- [ ] Ecological niche

#### 4.3 Indigenous Terminology (Target: 15 terms)
- [ ] Bribri plant names and their meanings
- [ ] Cabécar ethnobotanical terms
- [ ] Traditional ecological knowledge concepts
- [ ] Indigenous classification systems

#### 4.4 Timber & Wood Terms (Target: 15 terms)
- [ ] Heartwood vs sapwood
- [ ] Grain: straight-grain, interlocked, figured
- [ ] Wood density and Janka hardness
- [ ] Durability classes
- [ ] Workability
- [ ] CITES categories

### 5. Audio Pronunciations
- [ ] Record audio files for scientific names (Latin pronunciation)
- [ ] Record audio for local common names (Spanish, indigenous)
- [ ] Add <audio> elements with play buttons to tree pages
- [ ] Create pronunciation guide page

**Implementation:**
```tsx
<PronunciationButton 
  audioFile="/audio/ceiba-pentandra.mp3"
  text="Ceiba pentandra"
  ipa="ˈsaɪbə pɛnˈtændrə"
/>
```

### 6. Field Guide PDF Generator
- [ ] Create PDF generation endpoint using jsPDF or Puppeteer
- [ ] Design printable template with species info, photos, identification tips
- [ ] Add "Create Custom Field Guide" feature
- [ ] Allow users to select multiple species
- [ ] Include QR codes linking back to website

**User Flow:**
1. Browse trees and click "Add to Field Guide"
2. Go to "My Field Guide" (collection cart)
3. Arrange order, select format (pocket, letter, A4)
4. Click "Generate PDF"
5. Download professionally formatted guide

### 7. Tree Identification Game/Quiz
- [ ] Create `/quiz` route with interactive quiz
- [ ] Multiple game modes: "Guess from Photo", "Match Leaves", "Flowering Season", "Safety Quiz"
- [ ] Track scores and progress
- [ ] Award badges for completing sections
- [ ] Share results on social media

**Quiz Structure:**
```typescript
interface Quiz {
  type: 'photo' | 'leaf' | 'season' | 'safety'
  difficulty: 'beginner' | 'intermediate' | 'expert'
  questions: QuizQuestion[]
}

interface QuizQuestion {
  id: string
  question: string
  image?: string
  options: string[]
  correctAnswer: string
  explanation: string
  treeSlug: string
}
```

---

## 🌐 COMMUNITY & ENGAGEMENT

### 8. User Contributions

#### 8.1 Photo Uploads
- [ ] Implement image upload system (Cloudinary/Uploadcare)
- [ ] Add "Contribute Photo" button to tree pages
- [ ] Create moderation queue for submitted photos
- [ ] Credit photographers with attribution
- [ ] Link to user profiles (if auth implemented)

**Schema:**
```typescript
interface UserPhoto {
  id: string
  treeSlug: string
  imageUrl: string
  caption: string
  location: { lat: number, lng: number, province: string }
  dateTaken: Date
  uploadedBy: string
  verified: boolean
  licenses: 'CC-BY' | 'CC-BY-SA' | 'CC0'
}
```

#### 8.2 "Add Your Story" Feature
- [ ] Add comment/story section to tree pages
- [ ] Allow users to share traditional knowledge, memories, uses
- [ ] Moderate submissions before publishing
- [ ] Highlight featured stories
- [ ] Add voting/helpful buttons

#### 8.3 Tree Observation Challenges
- [ ] Create monthly challenges: "Document 10 native trees"
- [ ] Integration with iNaturalist for verification
- [ ] Leaderboard of top contributors
- [ ] Award digital badges

---

## 💻 TECHNICAL ENHANCEMENTS

### 9. Progressive Web App (PWA)

#### 9.1 Offline Mode
- [ ] Configure Next.js PWA with service worker
- [ ] Cache tree pages and images for offline access
- [ ] Add "Download for Offline" button with size estimate
- [ ] Implement offline indicator UI
- [ ] Sync observations when back online

**Dependencies:**
```bash
npm install next-pwa
```

**Configuration:**
```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }
      }
    }
  ]
})
```

#### 9.2 Install as App
- [ ] Create app manifest.json
- [ ] Design app icons (192x192, 512x512)
- [ ] Add install prompt UI
- [ ] Test on iOS and Android

#### 9.3 Push Notifications
- [ ] Implement web push notification system
- [ ] Add subscription UI
- [ ] Send notifications for: flowering alerts, new content, conservation news
- [ ] Make notifications customizable per user

### 10. Public API

#### 10.1 RESTful API Endpoints
- [ ] Create `/api/trees` endpoint with filtering
- [ ] Create `/api/trees/[slug]` for individual trees
- [ ] Create `/api/search` for full-text search
- [ ] Create `/api/safety/toxic` for toxic trees
- [ ] Create `/api/conservation/endangered` 
- [ ] Create `/api/seasonal/[month]` for flowering/fruiting
- [ ] Add API documentation with OpenAPI/Swagger

**API Response Example:**
```json
GET /api/trees?toxicity=severe&limit=10

{
  "data": [
    {
      "slug": "manchineel",
      "scientificName": "Hippomane mancinella",
      "toxicityLevel": "severe",
      "conservation": "LC",
      ...
    }
  ],
  "pagination": {
    "total": 3,
    "limit": 10,
    "offset": 0
  }
}
```

#### 10.2 API Rate Limiting & Authentication
- [ ] Implement rate limiting (100 requests/hour for free tier)
- [ ] Add API key system for researchers
- [ ] Document rate limits
- [ ] Create API usage dashboard

### 11. Performance Optimizations

#### 11.1 Image Optimization
- [ ] Convert all images to WebP format with JPEG fallbacks
- [ ] Implement responsive images with `next/image`
- [ ] Add lazy loading for images below fold
- [ ] Optimize featured images (compress without quality loss)
- [ ] Use blur-up placeholders

**Example:**
```tsx
<Image
  src={tree.featuredImage}
  alt={tree.title}
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL={tree.blurDataURL}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

#### 11.2 Analytics Integration
- [ ] Implement privacy-respecting analytics (Plausible or Umami)
- [ ] Track most viewed trees
- [ ] Track search terms
- [ ] Track filter usage
- [ ] Create internal analytics dashboard

---

## 🌱 CONSERVATION & IMPACT

### 12. Conservation Features

#### 12.1 Endangered Species Spotlight
- [ ] Create monthly featured endangered species
- [ ] Highlight conservation efforts
- [ ] Add "Conservation Status History" timeline
- [ ] Show population trend graphs if data available

#### 12.2 Reforestation Guides
- [ ] Create comprehensive planting guides per species
- [ ] Include: seed collection, germination, nursery care, planting, maintenance
- [ ] Add seasonal planting calendar
- [ ] Link to local nurseries that sell native species

**Guide Structure:**
```markdown
# Growing [Species Name] from Seed

## Seed Collection
- Best collection time: [months]
- Seed viability: [duration]
- Processing: [steps]

## Germination
- Pre-treatment: [scarification/stratification]
- Medium: [soil type]
- Time to germination: [days/weeks]
- Success rate: [percentage]

## Nursery Care
...

## Outplanting
...
```

#### 12.3 Partner Organizations
- [ ] Create `/partners` page
- [ ] List conservation organizations with links
- [ ] SINAC (Sistema Nacional de Áreas de Conservación)
- [ ] INBio/Museo Nacional
- [ ] Local reforestation groups
- [ ] Native plant nurseries by province

### 13. Sustainable Use Guidance

#### 13.1 Timber Sustainability Ratings
- [ ] Add sustainability rating to timber species
- [ ] Categories: "Sustainably Harvested", "Plantation Only", "Protected", "CITES Regulated"
- [ ] Link to certification bodies (FSC, PEFC)
- [ ] Note legal restrictions

#### 13.2 Agroforestry Recommendations
- [ ] Create `/agroforestry` guide page
- [ ] Specific recommendations for coffee agroforestry
- [ ] Specific recommendations for cacao systems
- [ ] Include spacing, pruning, economics
- [ ] Case studies from Costa Rican farms

---

## 🎨 CONTENT DEPTH ENHANCEMENTS

### 14. Cultural & Historical Context

#### 14.1 Pre-Columbian Uses
- [ ] Research indigenous uses for each major species
- [ ] Cite ethnobotanical sources
- [ ] Add "Traditional Uses" section to tree pages
- [ ] Note sacred/ceremonial significance where applicable
- [ ] Include preparation methods (with safety warnings)

**Example Section:**
```markdown
## Traditional Uses

### Bribri People
The Bribri have used [tree] for centuries as [use]. The bark was traditionally prepared by [method] to treat [condition]. 

**Important:** Traditional medicinal uses are documented for cultural knowledge only. Do not attempt without expert guidance.

**Source:** [Ethnobotanical database citation]
```

#### 14.2 Historical Economic Importance
- [ ] Document historical timber trade
- [ ] Colonial-era uses
- [ ] Economic impact on Costa Rican development
- [ ] Changes in use over time

### 15. Ecological Relationships

#### 15.1 Pollinator Information
- [ ] Document primary pollinators for each species
- [ ] Add photos of pollinators
- [ ] Link to pollinator species pages (if created)
- [ ] Note pollination syndrome (bird, bat, bee, wind)

#### 15.2 Seed Dispersal
- [ ] Document dispersal mechanism
- [ ] List key disperser species
- [ ] Add educational graphics showing dispersal process

#### 15.3 Wildlife Dependencies
- [ ] List animals that depend on tree for food/shelter
- [ ] Note critical habitat species
- [ ] Create wildlife relationship diagrams

**Data Structure:**
```typescript
interface EcologicalRelationships {
  pollinators: {
    primary: string[]
    secondary: string[]
    syndrome: 'ornithophily' | 'chiropterophily' | 'entomophily' | 'anemophily'
  }
  seedDispersers: {
    primary: string[]
    mechanism: 'endozoochory' | 'epizoochory' | 'anemochory' | 'hydrochory' | 'ballochory'
  }
  dependentSpecies: {
    critical: string[] // Species that require this tree
    important: string[] // Species that heavily use this tree
  }
  associations: {
    epiphytes: string[]
    mycorrhizae: string[]
    nitrogenFixing: boolean
  }
}
```

---

## ♿ ACCESSIBILITY & INCLUSIVITY

### 16. Accessibility Improvements

#### 16.1 WCAG 2.1 AA Compliance
- [ ] Audit all pages with axe DevTools
- [ ] Fix all color contrast issues (text must be 4.5:1 minimum)
- [ ] Add proper heading hierarchy (h1 → h2 → h3)
- [ ] Add alt text to all images
- [ ] Add ARIA labels to interactive elements
- [ ] Ensure all functionality available via keyboard
- [ ] Test with screen readers (NVDA, JAWS, VoiceOver)

#### 16.2 Keyboard Navigation
- [ ] Add visible focus indicators (`:focus-visible`)
- [ ] Implement skip-to-content link
- [ ] Ensure modal dialogs trap focus
- [ ] Add keyboard shortcuts documentation

#### 16.3 Screen Reader Optimization
- [ ] Add ARIA landmarks: `<nav>`, `<main>`, `<aside>`
- [ ] Use semantic HTML elements
- [ ] Add `aria-describedby` for complex interactions
- [ ] Ensure image galleries are navigable
- [ ] Add text alternatives for data visualizations

### 17. Language Expansion

#### 17.1 Portuguese Translation
- [ ] Translate core UI strings to Portuguese
- [ ] Translate 10-20 most popular tree pages to Portuguese
- [ ] Target Brazilian researchers and ecotourists

#### 17.2 Indigenous Languages
- [ ] Create Bribri glossary with common tree names
- [ ] Create Cabécar glossary with common tree names
- [ ] Partner with indigenous communities for authentic translations
- [ ] Add language toggle for indigenous names

#### 17.3 French & German
- [ ] Consider French translation for expat community
- [ ] Consider German for ecotourism market

**Implementation:**
```typescript
// Add to i18n config
const locales = ['en', 'es', 'pt', 'br-bribri', 'br-cabecar']
```

---

## 📊 DATA QUALITY & CREDIBILITY

### 18. Citation & Sources

#### 18.1 Add Source Citations
- [ ] Add `sources` field to tree schema
- [ ] Cite taxonomic authorities
- [ ] Cite ethnobotanical sources
- [ ] Cite toxicity databases
- [ ] Cite conservation status sources

**Schema Addition:**
```yaml
sources:
  taxonomic: "Flora Costaricensis, Burger et al. (1995)"
  ethnobotanical: "Bribri Ethnobotany Database, INBio"
  toxicity: "ASPCA Animal Poison Control Center (2024)"
  conservation: "IUCN Red List ver. 2024-1"
  images: "iNaturalist CC-BY licensed observations"
  distribution: "Costa Rican National Herbarium (CR)"
```

#### 18.2 Verification System
- [ ] Add `verifiedBy` field for expert review
- [ ] Add `lastReviewed` date
- [ ] Add `reviewStatus`: "draft" | "reviewed" | "verified"
- [ ] Display verification badge on verified pages
- [ ] Create "Request Review" feature for community to flag issues

#### 18.3 Completeness Scoring
- [ ] Implement completeness calculator
- [ ] Score based on filled fields: photos, safety data, uses, distribution, etc.
- [ ] Display "This profile is 87% complete" on tree pages
- [ ] Highlight missing information for contributors

**Algorithm:**
```typescript
function calculateCompleteness(tree: Tree): number {
  const fields = [
    'featuredImage', 'description', 'uses', 'distribution',
    'elevation', 'floweringSeason', 'fruitingSeason',
    'conservationStatus', 'toxicityLevel', 'nativeRegion'
  ]
  const requiredCount = fields.length
  const filledCount = fields.filter(field => tree[field] && tree[field].length > 0).length
  return Math.round((filledCount / requiredCount) * 100)
}
```

---

## 🎯 QUICK WINS (High Impact, Low Effort)

### 19. Immediate Improvements

- [ ] **Safety Badges on Tree Cards**: Add small badge showing toxicity level in directory
- [ ] **"Safe for Kids" Filter**: One-click filter for child-safe species
- [ ] **Related Trees Section**: Show 3-4 similar species at bottom of tree pages
- [ ] **Citation Links**: Add Wikipedia/GBIF/iNaturalist external links to each tree page
- [ ] **Download PDF Button**: Add print-friendly CSS and "Download PDF" button
- [ ] **Share Buttons**: Add social media share buttons (Twitter, Facebook, WhatsApp)
- [ ] **Search Autocomplete**: Add autocomplete dropdown to search with thumbnails
- [ ] **Breadcrumbs**: Add breadcrumb navigation (Home > Trees > Ceiba)
- [ ] **Reading Time**: Add estimated reading time to tree pages
- [ ] **Last Updated Date**: Display last updated date prominently
- [ ] **Back to Top Button**: Add floating "back to top" button on long pages
- [ ] **Table of Contents**: Auto-generate TOC for long tree pages
- [ ] **Mobile Menu Improvements**: Enhance mobile navigation UX
- [ ] **Loading Skeletons**: Add skeleton screens while data loads
- [ ] **Error Boundaries**: Add proper error handling with recovery options

---

## 📐 BEST PRACTICES & GUIDELINES

### Development Standards

#### Code Quality
- Use TypeScript for all new components
- Follow existing component patterns in `/components`
- Implement proper error handling with try-catch
- Add JSDoc comments to complex functions
- Use semantic HTML elements
- Follow accessibility best practices (WCAG 2.1 AA)

#### Content Guidelines
- All tree content must be bilingual (EN/ES)
- Use consistent terminology across pages
- Cite sources for scientific claims
- Include metric and imperial measurements
- Use scientific names with author citations
- Link to external databases (GBIF, iNaturalist, IUCN)

#### Safety Content Guidelines
- Default to conservative safety assessments
- Include specific symptoms, not vague terms
- Document fatal doses where known
- Always include emergency contact information
- Cite medical/toxicological sources
- Translate medical terms accurately in Spanish
- Include wildlife/pet safety information

#### Image Guidelines
- Use WebP format with JPEG fallback
- Minimum resolution: 1200px width for featured images
- Include proper attribution and license information
- Use descriptive alt text for accessibility
- Compress images while maintaining quality
- Prefer photos showing: whole tree, leaves, flowers, fruits, bark

#### Performance Standards
- Lighthouse score > 90 for all metrics
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Time to Interactive < 3.5s
- Cumulative Layout Shift < 0.1

---

## 🗺️ PRIORITIZED IMPLEMENTATION ROADMAP

### Phase 1: Complete Core Safety (Weeks 1-4)
**Goal:** Full safety coverage across all tree species

1. Week 1: Research and document safety information for 15 high-priority trees
2. Week 2: Research and document safety information for 15 medium-priority trees
3. Week 3: Complete remaining species + add safety filtering
4. Week 4: Create dedicated `/safety` page + emergency contacts

**Success Metrics:** 100% of trees have safety data, safety page live

### Phase 2: Enhanced Discovery (Weeks 5-8)
**Goal:** Improve user ability to find relevant trees

1. Week 5: Implement advanced filtering system (toxicity, conservation, uses, size)
2. Week 6: Add seasonal guide ("Flowering This Month") + phenology calendar
3. Week 7: Create interactive distribution maps with Leaflet
4. Week 8: Implement "Trees Like This" recommendations + search improvements

**Success Metrics:** 5+ filter categories, maps on 100% of trees, seasonal guide functional

### Phase 3: Educational Expansion (Weeks 9-14)
**Goal:** Deepen educational content

1. Week 9-10: Expand glossary to 50+ terms across all categories
2. Week 11: Add audio pronunciations for scientific names
3. Week 12: Create tree identification quiz with 50+ questions
4. Week 13: Build field guide PDF generator
5. Week 14: Add cultural/historical context to top 20 trees

**Success Metrics:** 50+ glossary terms, quiz functional, PDFs generated

### Phase 4: Community & Advanced Features (Weeks 15-20)
**Goal:** Enable community contributions and advanced functionality

1. Week 15-16: Implement PWA with offline mode
2. Week 17: Add user photo contribution system
3. Week 18: Create public API with documentation
4. Week 19: Build conservation dashboard
5. Week 20: Implement push notifications for flowering alerts

**Success Metrics:** PWA installable, API documented, 10+ user contributions

### Phase 5: Polish & Optimization (Weeks 21-24)
**Goal:** Performance, accessibility, and quality improvements

1. Week 21: Complete WCAG 2.1 AA accessibility audit + fixes
2. Week 22: Optimize images, implement lazy loading, improve Lighthouse scores
3. Week 23: Add Portuguese translation for top 20 trees
4. Week 24: Implement all "Quick Wins" + final testing

**Success Metrics:** Lighthouse >90, accessibility audit passes, translations live

---

## 📝 NOTES FOR AI AGENTS

### When Implementing Safety Information:
1. **Research thoroughly** using multiple sources (ASPCA, Kew, scientific literature)
2. **Be specific** about symptoms (not "causes illness" but "causes vomiting, diarrhea, cardiac arrhythmia")
3. **Include doses** where known ("1-2 seeds fatal to children")
4. **Consider all audiences**: children, pets, woodworkers, general public
5. **Translate medical terms carefully** - verify Spanish medical terminology
6. **Default to caution** - if uncertain, mark as requiring care
7. **Cross-reference family traits** - Anacardiaceae = urushiol, Euphorbiaceae = toxic latex
8. **Document traditional uses** as evidence of properties (fish poison = toxic)

### When Creating New Components:
1. **Follow existing patterns** in the codebase
2. **Make components reusable** with proper prop types
3. **Support both English and Spanish** via i18n
4. **Ensure accessibility** from the start (ARIA labels, keyboard navigation)
5. **Add responsive design** for mobile, tablet, desktop
6. **Include loading and error states**
7. **Write meaningful commit messages** following conventional commits

### When Adding Content:
1. **Maintain bilingual parity** - if adding to EN, add to ES
2. **Use consistent formatting** - check existing MDX files for structure
3. **Include metadata** in frontmatter (publishedAt, updatedAt, tags)
4. **Link to related content** - glossary terms, similar species
5. **Cite sources** - add to sources field
6. **Optimize images** before adding to repository
7. **Test locally** before committing

### Testing Checklist:
- [ ] Test on mobile devices (iOS Safari, Android Chrome)
- [ ] Test with keyboard navigation only
- [ ] Test with screen reader (VoiceOver, NVDA)
- [ ] Verify both English and Spanish versions
- [ ] Check Lighthouse scores
- [ ] Validate HTML with W3C validator
- [ ] Test print styles if applicable
- [ ] Check for console errors/warnings

---

## 🔗 USEFUL REFERENCES

### External Resources
- **ASPCA Toxic Plants:** https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants
- **IUCN Red List:** https://www.iucnredlist.org/
- **GBIF:** https://www.gbif.org/
- **iNaturalist:** https://www.inaturalist.org/
- **Kew Gardens:** https://www.kew.org/
- **Flora de Costa Rica:** http://www.tropicos.org/Project/Costa%20Rica
- **Costa Rica INBio:** http://www.inbio.ac.cr/

### Code References
- **Next.js Docs:** https://nextjs.org/docs
- **Contentlayer:** https://contentlayer.dev/
- **Tailwind CSS:** https://tailwindcss.com/
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/

---

**End of Roadmap** | Last Updated: 2026-01-10