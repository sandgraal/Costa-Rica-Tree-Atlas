# Costa Rica Tree Atlas

Costa Rica Tree Atlas will truly never have ads, donations, sales, or other revenue

A bilingual (English/Spanish) open-source web application showcasing the magnificent trees of Costa Rica. Built with Next.js 16, TypeScript, and modern web technologies.

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC_BY--NC--SA_4.0-lightgrey.svg)](LICENSE-CONTENT.md)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)
[![Security Checks](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/workflows/Security%20Checks/badge.svg)](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/actions)
[![Dependabot](https://img.shields.io/badge/Dependabot-enabled-success)](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/security/dependabot)

## Features

### Bilingual Content

- Full English and Spanish support with locale-based routing
- 128 species with comprehensive bilingual profiles (256 documents)
- MDX content system for rich tree profiles with React components

### Education Tools

- **Interactive Lessons**: Structured learning modules about Costa Rican trees and ecosystems
- **Progress Tracking**: Track completed lessons and earn points
- **Printable Resources**: Downloadable worksheets and field guides for classrooms
- **Tree Identification Guide**: Interactive key for identifying trees by leaf shape, bark, flowers, and more

### Discovery & Search

- **Quick Search**: Global ⌘K keyboard shortcut for instant tree lookup
- **Full-Text Search**: Search across tree names, descriptions, and scientific names
- **Category Filtering**: Filter by botanical family, conservation status, or tags
- **Seasonal Filtering**: Find trees "flowering now" or "fruiting now" based on current month
- **Alphabetical Index**: Browse trees A-Z with sticky navigation

### Maps & Conservation

- **Interactive Distribution Maps**: Geographic maps showing where species are found
- **External API Integration**: Live data from GBIF and iNaturalist biodiversity databases
- **Conservation Status**: IUCN Red List display with visual scale and population trends

### Seasonal Features

- **Seasonal Calendar**: Monthly flowering and fruiting calendar with tree activity view
- **Now Blooming**: Homepage section highlighting currently active trees
- **Tree of the Day**: Daily rotating featured tree

### Personal Collections

- **Favorites System**: Save and bookmark trees with localStorage persistence
- **Recently Viewed**: Track and display browsing history on homepage
- **Share Favorites**: Generate shareable URLs to share collections with friends
- **Export Field Guide**: Print favorites as a styled field guide PDF
- **Quick Compare**: Side-by-side comparison of tree characteristics

### Safety Information ⚠️

- **Toxicity Warnings**: Comprehensive safety data for dangerous species (severe, high, moderate, low, none)
- **Visual Risk Indicators**: Color-coded badges (🟢🔵🟡🟠🔴⛔) on tree cards and detail pages
- **Detailed Hazard Info**: Toxic parts, skin contact risks, allergen information, structural hazards
- **Child & Pet Safety**: Clear indicators for family-safe vs. hazardous trees
- **First Aid Guidance**: Emergency protocols and poison control contacts (Costa Rica: 2223-1028)
- **Bilingual Warnings**: Medically accurate safety information in English and Spanish
- **Critical Species Documented**: Javillo/Sandbox Tree (explosive pods, caustic sap), Madero Negro, and more

### Design & Accessibility

- **Nature-Inspired Theme**: Custom color palette with forest greens and earth tones
- **Dark Mode**: System preference detection with manual toggle
- **Mobile-First Design**: Responsive layout with full-screen mobile navigation
- **WCAG 2.1 AA Compliant**: Accessible to all users
- **PWA Support**: Offline access for field use
- **Audio Pronunciation**: Text-to-speech for scientific names

### Keyboard Shortcuts

| Shortcut        | Action                       |
| --------------- | ---------------------------- |
| `?`             | Show keyboard shortcuts help |
| `H`             | Go to home                   |
| `T`             | Go to trees directory        |
| `F`             | Go to favorites              |
| `R`             | Show random tree             |
| `D`             | Toggle dark/light theme      |
| `⌘K` / `Ctrl+K` | Quick search                 |

## Rate Limiting

API endpoints are protected with persistent rate limiting using Upstash Redis:

| Endpoint              | Limit        | Window   |
| --------------------- | ------------ | -------- |
| `/api/identify`       | 10 requests  | 1 hour   |
| `/api/species`        | 60 requests  | 1 minute |
| `/api/species/images` | 30 requests  | 1 minute |
| `/api/species/random` | 100 requests | 1 minute |

Rate limit information is included in response headers:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Timestamp when limit resets
- `Retry-After`: Seconds to wait (only when rate limited)

### Setup for Development

Rate limiting is disabled in development mode if Redis is not configured. To test rate limiting locally:

1. Sign up for free Upstash Redis: https://upstash.com
2. Create a database
3. Add credentials to `.env.local`:
   ```env
   UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your_token_here
   ```

## Roadmap

### Future Ideas

- Community contributions: User-submitted sightings and photographs
- AR tree identification using device camera
- Partnership with Costa Rican conservation organizations
- Multi-language expansion (German, French for tourists)

## Documentation

Comprehensive documentation is available in the **[docs/](docs/)** directory:

- **[Documentation Index](docs/README.md)** - Complete guide to all documentation
- **[Contributing Guide](CONTRIBUTING.md)** - Setup and contribution instructions
- **[Content Standards](docs/CONTENT_STANDARDIZATION_GUIDE.md)** - Tree profile standards
- **[Project Roadmap](docs/improvement-roadmap.md)** - Feature status and roadmap
- **[AI Agent Instructions](AGENTS.md)** - Coding conventions and patterns

## Contributing

Contributions are welcome! We're building this as an open-source resource for education and conservation.

See our **[Contributing Guidelines](CONTRIBUTING.md)** for setup instructions and how to get started.

### Ways to Contribute

- **Add Tree Profiles**: Document new species with descriptions and images
- **Improve Translations**: Enhance Spanish content or add new languages
- **Fix Bugs**: Report issues or submit fixes
- **Add Features**: Implement items from the roadmap
- **Contribute Photography**: Share high-quality tree photographs (with proper licensing)

### Automated Quality Assurance

The project includes automated weekly image quality monitoring that:

- Validates all tree images (featured + gallery)
- Automatically fixes broken or missing images
- Generates quality metrics and health reports
- Creates PRs for manual review before merging

See **[Image Quality Monitoring](docs/IMAGE_QUALITY_MONITORING.md)** for details on our automated maintenance system.

### Image Optimization

The project uses Sharp for high-performance image optimization:

- **Multiple Formats**: WebP, AVIF, and JPEG for maximum compatibility
- **Responsive Sizes**: 400w, 800w, 1200w, 1600w variants for different devices
- **Smart Compression**: Quality optimized per format (80% JPEG, 75% WebP, 70% AVIF)
- **Blur Placeholders**: Tiny base64 data URLs for progressive loading
- **Metadata Generation**: Complete image information in JSON format

**Audit and validate:**

```bash
npm run images:audit           # Check featured images status
npm run images:audit:gallery   # Check gallery images
npm run images:validate        # Validate all image references (CI-ready)
npm run images:validate:verbose # Detailed validation output
```

**Optimize images:**

```bash
npm run images:optimize         # Optimize new/changed images
npm run images:optimize:force   # Re-optimize all images
```

**Download/refresh images:**

```bash
npm run images:download        # Download missing images from iNaturalist
npm run images:refresh         # Update with better quality versions
npm run images:refresh:gallery # Refresh gallery images
```

**Cleanup:**

```bash
npm run images:check           # Check for orphaned images
npm run images:cleanup         # Clean up obsolete images
```

See **[Image Optimization Guide](docs/IMAGE_OPTIMIZATION.md)** for complete documentation and **[Image Audit Report](docs/IMAGE_AUDIT.md)** for current status.

### Security & Code Quality

This project takes security seriously. We use automated security scanning including:

- **Dependabot** for dependency vulnerabilities
- **CodeQL** for static code analysis
- **TruffleHog** for secret scanning
- **ESLint Security** for code patterns
- **License compliance** checking

See **[Security Setup Guide](docs/SECURITY_SETUP.md)** for details on our security infrastructure.

### AI-Assisted Development

This repository is configured with GitHub Copilot instructions (`AGENTS.md` and `.github/instructions/`) to help AI coding agents understand our architecture, conventions, and best practices. Feel free to use GitHub Copilot when contributing!

## License

This project uses a **dual-license structure** to protect both the technical infrastructure and educational content:

### 📜 Code License: AGPL-3.0

All software, code, and technical infrastructure is licensed under the [GNU Affero General Public License v3.0](LICENSE).

**What this means:**

- You can freely use, modify, and distribute the code
- Any modifications or deployments must remain open source
- Network use requires sharing source code of modifications
- Ensures derivative works remain free and open

**Applies to:**

- TypeScript/JavaScript files (`.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`)
- Configuration files (`next.config.ts`, `tailwind.config.js`, etc.)
- Build scripts and utilities
- API routes and server code

### 📚 Content License: CC BY-NC-SA 4.0

All educational content, tree data, and images are licensed under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0](LICENSE-CONTENT.md).

**What this means:**

- Free for educational, research, and non-commercial use
- Attribution required when sharing or adapting
- Derivative works must use the same license
- Commercial use requires permission

**Applies to:**

- Tree descriptions and profiles (`.mdx` files)
- Photographs and illustrations
- Educational documentation
- Multimedia content

### 🌿 Why This Approach?

We chose this dual-license structure to:

1. **Protect the educational mission**: Prevent commercial exploitation of biodiversity data
2. **Ensure accessibility**: Keep the resource free for education and conservation
3. **Maintain openness**: Guarantee all improvements remain available to the community
4. **Support conservation**: Align with ethical, sustainable use of natural history information

### 💼 Commercial Licensing

Interested in commercial use? We're open to discussion, especially for:

- Eco-tourism educational materials
- Conservation-focused applications
- Environmental education platforms
- Documentary and publishing projects

Please open a [GitHub Issue](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/issues) to discuss commercial licensing.

### 📋 Usage Policy

For detailed ethical usage guidelines, see [USAGE-POLICY.md](USAGE-POLICY.md).

### 📄 Full License Texts

- [LICENSE](LICENSE) - AGPL-3.0 for code
- [LICENSE-CONTENT.md](LICENSE-CONTENT.md) - CC BY-NC-SA 4.0 for content

## Acknowledgments

- The magnificent trees of Costa Rica for their beauty and ecological importance
- [SINAC](https://www.sinac.go.cr/) - Costa Rica's National System of Conservation Areas
- [INBio](https://inbio.ac.cr/) - Costa Rica's National Biodiversity Institute
- The conservation organizations working to protect Costa Rica's forests
- The open-source community for the amazing tools that made this project possible

## Contact & Support

- **Issues**: [GitHub Issues](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/issues)
- **Discussions**: [GitHub Discussions](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/discussions)

---

<p align="center">
  Made with 💚 for Costa Rica's forests 🇨🇷
  <br>
  <em>"The nation that destroys its soil destroys itself. Forests are the lungs of our land."</em>
  <br>
  — Franklin D. Roosevelt
</p>
