# 🌳 Costa Rica Tree Atlas

A bilingual (English/Spanish) open-source web application showcasing the magnificent trees of Costa Rica. Built with Next.js 16, TypeScript, and modern web technologies.

![License](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
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

## 🗺️ Roadmap

### ✅ Completed Features

- [x] **Bilingual Architecture**: Full English/Spanish support with locale-based routing
- [x] **MDX Content System**: Contentlayer integration for type-safe tree profiles
- [x] **Nature-Inspired Design**: Custom color palette with forest greens and earth tones
- [x] **Dark Mode**: System preference detection with manual toggle
- [x] **Responsive Layout**: Mobile-first design with hamburger menu navigation
- [x] **SEO Foundation**: Meta tags, alternate language links, structured URLs
- [x] **Content Library**: 53 species with comprehensive bilingual profiles (106 documents)
- [x] **Code Quality**: ESLint + Prettier configuration
- [x] **Static Generation**: Pre-rendered pages for optimal performance
- [x] **Search Functionality**: Full-text search across tree names, descriptions, and scientific names
- [x] **Quick Search**: Global ⌘K keyboard shortcut for instant tree lookup
- [x] **Category Filtering**: Filter trees by botanical family and conservation status
- [x] **Seasonal Filtering**: Filter trees by "flowering now" or "fruiting now" based on current month
- [x] **Alphabetical Index**: Browse trees A-Z with sticky alphabet navigation
- [x] **Sorting Options**: Sort by common name, scientific name, or family
- [x] **Image Optimization**: Next.js Image component integration with proper sizing
- [x] **Tag System**: Add tags for characteristics (deciduous, evergreen, flowering, etc.)
- [x] **Image Gallery**: Multiple images per tree with lightbox viewing
- [x] **Print-Friendly Views**: Optimized layouts for field guides
- [x] **Comparison Tool**: Side-by-side comparison of tree characteristics
- [x] **Identification Guide**: Interactive key for identifying trees by features
- [x] **Interactive Maps**: Geographic distribution maps showing where species are found
- [x] **Related Trees**: Intelligent suggestions based on family, tags, and seasonality
- [x] **Social Sharing**: Share tree profiles on Twitter, Facebook, WhatsApp, LinkedIn
- [x] **Reading Time**: Estimated reading time displayed on tree detail pages
- [x] **Scroll Progress**: Back-to-top button with scroll progress indicator
- [ ] **Community Contributions**: User-submitted sightings and photographs
- [x] **External API Integration**: Connect with biodiversity databases (GBIF, iNaturalist)
- [x] **Conservation Data**: IUCN Red List status display with visual scale and population trends
- [x] **Educational Resources**: Lesson plans and classroom materials
- [x] **Seasonal Calendar**: Monthly flowering and fruiting calendar with tree activity view
- [x] **Now Blooming**: Homepage section showing currently active trees
- [x] **Performance Audit**: Core Web Vitals optimization
- [x] **Accessibility Audit**: WCAG 2.1 AA compliance verification
- [x] **PWA Support**: Offline access for field use
- [x] **Analytics Integration**: Privacy-respecting usage analytics
- [x] **Tree of the Day**: Daily rotating featured tree on homepage
- [x] **Mobile Navigation**: Full-screen responsive menu with quick actions
- [x] **Audio Pronunciation**: Text-to-speech for scientific names using Web Speech API
- [x] **Favorites System**: Save and bookmark trees with localStorage persistence
- [x] **Recently Viewed**: Track and display browsing history on homepage
- [x] **Share Favorites**: Generate shareable URLs to share favorite lists with friends
- [x] **Export Field Guide**: Print favorites as a styled field guide PDF
- [x] **Quick Compare**: Select favorites for side-by-side comparison
- [x] **Keyboard Shortcuts**: Power user navigation with ? help modal
  - `?` - Show keyboard shortcuts help
  - `H` - Go to home
  - `T` - Go to trees directory
  - `F` - Go to favorites
  - `R` - Show random tree
  - `D` - Toggle dark/light theme
  - `⌘K` / `Ctrl+K` - Quick search

### 💡 Future Ideas

- AR tree identification using device camera
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

## 🔧 Environment Variables

The vision-based tree identification feature requires a Google Cloud Vision API key. Analytics can be configured with privacy-respecting options:

| Variable                              | Description                                            | Required               |
| ------------------------------------- | ------------------------------------------------------ | ---------------------- |
| `GOOGLE_CLOUD_VISION_API_KEY`         | Google Cloud Vision API key for image identification   | Yes (identify feature) |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`        | Plausible Analytics domain (privacy-first, no cookies) | No                     |
| `NEXT_PUBLIC_ENABLE_SIMPLE_ANALYTICS` | Enable Simple Analytics (set to "true")                | No                     |
| `NEXT_PUBLIC_GA_ID`                   | Google Analytics 4 measurement ID                      | No                     |
| `NEXT_PUBLIC_MAPS_API_KEY`            | Maps API key for geographic features                   | No                     |

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
