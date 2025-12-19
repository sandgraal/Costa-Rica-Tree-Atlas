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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Ways to Contribute

- 🌱 Add new tree profiles
- 🌍 Improve translations
- 🐛 Fix bugs
- ✨ Add new features
- 📚 Improve documentation
- 🖼️ Contribute tree photographs

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- The trees of Costa Rica for their beauty and ecological importance
- The conservation organizations working to protect Costa Rica's forests
- The open-source community for the amazing tools that made this project possible

---

Made with ❤️ for Costa Rica's forests 🇨🇷
