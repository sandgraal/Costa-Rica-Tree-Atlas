# Costa Rica Tree Atlas

Costa Rica Tree Atlas will truly never have ads, donations, sales, or other revenue

A bilingual (English/Spanish) open-source web application showcasing the magnificent trees of Costa Rica. Built with Next.js 16, TypeScript, and modern web technologies.

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)
[![Security Checks](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/workflows/Security%20Checks/badge.svg)](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/actions)
[![Dependabot](https://img.shields.io/badge/Dependabot-enabled-success)](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/security/dependabot)

## Features

### Bilingual Content

- Full English and Spanish support with locale-based routing
- 108 species with comprehensive bilingual profiles (216 documents)
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

This project is open source and available under the **[MIT License](LICENSE)**.

### Content Licensing

- **Code**: MIT License
- **Tree Descriptions**: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) (unless otherwise noted)
- **Images**: Individual licensing noted per image (see attribution in content files)

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
