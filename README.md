# 🌳 Costa Rica Tree Atlas

A bilingual (English/Spanish) open-source web application showcasing the magnificent trees of Costa Rica. Built with Next.js 15, TypeScript, and modern web technologies.

![License](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)

## ✨ Features

- 🌐 **Bilingual Support**: Full English and Spanish translations with locale-based routing
- 📝 **MDX Content**: Write tree profiles in Markdown with React component support
- 🎨 **Nature-Inspired Design**: Custom Tailwind theme with forest greens and earth tones
- 🌙 **Dark Mode**: Automatic and manual dark mode support
- 📱 **Responsive**: Mobile-first design that works on all devices
- 🔍 **SEO Optimized**: Proper meta tags, alternate language links, and structured data
- ⚡ **Static Generation**: Fast page loads with Next.js static site generation
- ♿ **Accessible**: Semantic HTML, keyboard navigation, and screen reader support

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/sandgraal/Costa-Rica-Tree-Atlas.git
   cd Costa-Rica-Tree-Atlas
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
Costa-Rica-Tree-Atlas/
├── content/
│   └── trees/
│       ├── en/           # English tree profiles
│       │   └── guanacaste.mdx
│       └── es/           # Spanish tree profiles
│           └── guanacaste.mdx
├── i18n/                 # Internationalization config
│   ├── navigation.ts
│   ├── request.ts
│   └── routing.ts
├── messages/             # Translation strings
│   ├── en.json
│   └── es.json
├── public/
│   └── images/           # Static images
├── src/
│   ├── app/
│   │   └── [locale]/     # Locale-based routing
│   │       ├── page.tsx
│   │       ├── layout.tsx
│   │       └── trees/
│   │           ├── page.tsx
│   │           └── [slug]/
│   │               └── page.tsx
│   ├── components/       # React components
│   └── lib/              # Utility functions
├── contentlayer.config.ts
├── middleware.ts
├── next.config.ts
└── tailwind.config.ts
```

## 📝 Adding New Trees

1. Create a new MDX file in both `content/trees/en/` and `content/trees/es/`:

   ```bash
   # English version
   content/trees/en/your-tree.mdx

   # Spanish version
   content/trees/es/your-tree.mdx
   ```

2. Add the required frontmatter:

   ```yaml
   ---
   title: "Tree Name"
   scientificName: "Genus species"
   family: "Family Name"
   locale: "en" # or "es" for Spanish
   slug: "your-tree"
   description: "A brief description for SEO"
   nativeRegion: "Native region"
   conservationStatus: "IUCN Status"
   maxHeight: "Height in meters"
   uses:
     - "Use 1"
     - "Use 2"
   featuredImage: "/images/trees/your-tree.jpg"
   publishedAt: "2024-01-01"
   ---
   ```

3. Write your content in Markdown below the frontmatter.

## 🛠️ Available Scripts

| Command                | Description               |
| ---------------------- | ------------------------- |
| `npm run dev`          | Start development server  |
| `npm run build`        | Build for production      |
| `npm run start`        | Start production server   |
| `npm run lint`         | Run ESLint                |
| `npm run format`       | Format code with Prettier |
| `npm run format:check` | Check code formatting     |

## 🎨 Customization

### Theme Colors

The nature-inspired color palette is defined in `src/app/globals.css`:

- **Primary**: Forest greens (#2d5a27)
- **Secondary**: Earth browns (#8b5a2b)
- **Accent**: Tropical gold (#c9a227)

### Adding Languages

1. Add the locale to `i18n/routing.ts`
2. Create a new message file in `messages/`
3. Add content directories for the new locale

## 🗺️ Roadmap

### ✅ Completed Features

- [x] **Bilingual Architecture**: Full English/Spanish support with locale-based routing
- [x] **MDX Content System**: Contentlayer integration for type-safe tree profiles
- [x] **Nature-Inspired Design**: Custom color palette with forest greens and earth tones
- [x] **Dark Mode**: System preference detection with manual toggle
- [x] **Responsive Layout**: Mobile-first design approach
- [x] **SEO Foundation**: Meta tags, alternate language links, structured URLs
- [x] **Sample Content**: Guanacaste tree profile as a template
- [x] **Code Quality**: ESLint + Prettier configuration
- [x] **Static Generation**: Pre-rendered pages for optimal performance

### 🚧 In Progress

- [ ] **Content Expansion**: Adding more tree profiles (aiming for 50+ species)
- [ ] **Image Optimization**: Next.js Image component integration with proper sizing

### 📋 Planned Features

#### Phase 1: Core Content & Discovery

- [ ] **Search Functionality**: Full-text search across tree names, descriptions, and scientific names
- [ ] **Category Filtering**: Filter trees by botanical family, native region, or conservation status
- [ ] **Alphabetical Index**: Browse trees A-Z in both languages
- [ ] **Tag System**: Add tags for characteristics (deciduous, evergreen, flowering, etc.)

#### Phase 2: Enhanced User Experience

- [ ] **Interactive Maps**: Geographic distribution maps showing where species are found
- [ ] **Image Gallery**: Multiple images per tree with lightbox viewing
- [ ] **Comparison Tool**: Side-by-side comparison of tree characteristics
- [ ] **Identification Guide**: Interactive key for identifying trees by features
- [ ] **Print-Friendly Views**: Optimized layouts for field guides

#### Phase 3: Community & Data

- [ ] **Community Contributions**: User-submitted sightings and photographs
- [ ] **External API Integration**: Connect with biodiversity databases (GBIF, iNaturalist)
- [ ] **Conservation Data**: Real-time IUCN status updates and population trends
- [ ] **Educational Resources**: Lesson plans and classroom materials

#### Phase 4: Performance & Accessibility

- [ ] **Performance Audit**: Core Web Vitals optimization
- [ ] **Accessibility Audit**: WCAG 2.1 AA compliance verification
- [ ] **PWA Support**: Offline access for field use
- [ ] **Analytics Integration**: Privacy-respecting usage analytics

### 💡 Future Ideas

- Audio pronunciations for scientific names
- AR tree identification using device camera
- Seasonal calendar showing flowering/fruiting times
- Partnership with Costa Rican conservation organizations
- Multi-language expansion (German, French for tourists)

## 🤝 Contributing

Contributions are welcome! We're building this as an open-source resource for education and conservation.

Please read our **[Contributing Guidelines](CONTRIBUTING.md)** for details on:

- How to fork the repository and submit pull requests
- Code style and formatting requirements
- Content contribution guidelines for new tree profiles
- Translation standards for bilingual content

### Ways to Contribute

- 🌱 **Add Tree Profiles**: Document new species with descriptions and images
- 🌍 **Improve Translations**: Enhance Spanish content or add new languages
- 🐛 **Fix Bugs**: Report issues or submit fixes
- ✨ **Add Features**: Implement items from the roadmap
- 📚 **Improve Documentation**: Clarify instructions or add examples
- 🖼️ **Contribute Photography**: Share high-quality tree photographs (with proper licensing)
- 🧪 **Testing**: Help test on different devices and browsers

### Quick Start for Contributors

```bash
# Fork and clone the repository
git clone https://github.com/YOUR-USERNAME/Costa-Rica-Tree-Atlas.git

# Create a feature branch
git checkout -b feature/add-ceiba-tree

# Make your changes, then commit
git commit -m "feat: add Ceiba pentandra tree profile"

# Push and create a pull request
git push origin feature/add-ceiba-tree
```

## 🔧 Environment Variables

The vision-based tree identification feature requires a Google Cloud Vision API key. Future integrations may require additional keys:

| Variable                   | Description                          | Required |
| -------------------------- | ------------------------------------ | -------- |
| `GOOGLE_CLOUD_VISION_API_KEY` | Google Cloud Vision API key for image identification | Yes (identify feature) |
| `NEXT_PUBLIC_ANALYTICS_ID` | Analytics tracking ID                | No       |
| `NEXT_PUBLIC_MAPS_API_KEY` | Maps API key for geographic features | No       |

Create a `.env.local` file for local development when needed:

```bash
cp .env.example .env.local
```

## 📄 License

This project is open source and available under the **[MIT License](LICENSE)**.

### Content Licensing

- **Code**: MIT License
- **Tree Descriptions**: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) (unless otherwise noted)
- **Images**: Individual licensing noted per image (see attribution in content files)

## 🙏 Acknowledgments

- 🌳 The magnificent trees of Costa Rica for their beauty and ecological importance
- 🏛️ [SINAC](https://www.sinac.go.cr/) - Costa Rica's National System of Conservation Areas
- 🔬 [INBio](https://inbio.ac.cr/) - Costa Rica's National Biodiversity Institute
- 🌎 The conservation organizations working to protect Costa Rica's forests
- 💻 The open-source community for the amazing tools that made this project possible

## 📞 Contact & Support

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
