# Contributing to Costa Rica Tree Atlas

Thanks for your interest in the Costa Rica Tree Atlas.

> **Private repository; external contributions not accepted at this time.**

This repository is currently maintained by internal collaborators only.

## Public Contribution Status

- We are **not** accepting public pull requests, fork-based contributions, or external patch submissions.
- Previous guidance about public fork/PR workflows is archived and no longer applies.
- Previous contributor license agreement assumptions for public contributors are archived and no longer apply to this private workflow.

## Internal Collaborators

If you are an approved collaborator with repository access, follow the internal process document:

- [Internal Collaboration Process](.github/INTERNAL_COLLABORATION.md)

## Reporting Issues

## Contributor Rights & Assignment

By contributing to this repository, you confirm that:

- You have the legal right to submit the contribution.
- You grant the project owner the right to use, modify, and redistribute your
  contribution under the repository's proprietary terms.
- Your contribution does not include third-party material that conflicts with
  the repository's all-rights-reserved model.

All accepted contributions are governed by [LICENSE](LICENSE) and
[LICENSE-CONTENT.md](LICENSE-CONTENT.md).

## Getting Started

### Prerequisites

- Node.js 20.19 or later
- npm, yarn, or pnpm
- Git
- A code editor (VS Code recommended)

### Setting Up Your Development Environment

1. **Clone the repository**

   ```bash
   git clone https://github.com/sandgraal/Costa-Rica-Tree-Atlas.git
   cd Costa-Rica-Tree-Atlas
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** to see the site.

### Admin Access

The project includes admin routes (e.g., `/{locale}/admin/images` such as `/en/admin/images` or `/es/admin/images` for reviewing tree images) that require **NextAuth + database-backed authentication**.

To enable admin access during development:

1. **Copy `.env.example` to `.env.local`**

   ```bash
   cp .env.example .env.local
   ```

2. **Configure required auth/database environment variables**

   ```bash
   # In .env.local
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
   NEXTAUTH_SECRET=your-generated-secret
   NEXTAUTH_URL=http://localhost:3000
   MFA_ENCRYPTION_KEY=your-64-char-hex-key
   ```

3. **Generate Prisma Client and run migrations**

   ```bash
   npm run prisma:generate:optional
   npx prisma migrate dev
   ```

4. **Create the first admin user**

   With your dev server running, call the one-time setup endpoint to create the initial admin user:

   ```bash
   curl -X POST http://localhost:3000/api/admin/setup
   ```

5. **Access admin routes**

   Visit `http://localhost:3000/{locale}/admin/login` (for example, `/en/admin/login` or `/es/admin/login`) and sign in with your database-backed credentials.

**Security Note**: Never commit `.env.local` or share secrets/passwords publicly.

## Development Workflow

### Staying Up to Date

Before starting new work, pull the latest from main:

```bash
git checkout main
git pull origin main
```

### Creating a Branch

Create a descriptive branch name for your work:

```bash
# For new features
git checkout -b feature/search-functionality

# For bug fixes
git checkout -b fix/language-switcher-mobile

# For content additions
git checkout -b content/add-ceiba-tree

# For documentation
git checkout -b docs/improve-readme
```

### Making Changes

1. Make your changes in small, logical commits
2. Test your changes locally
3. Run linting and formatting before committing

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format

# Build to verify everything works
npm run build
```

## Contributing Content

Adding new tree profiles is one of the most valuable contributions you can make!

### Adding a New Tree

1. **Create both language versions**

   Every tree needs both English and Spanish content files:

   ```
   content/trees/en/your-tree-slug.mdx  # English version
   content/trees/es/your-tree-slug.mdx  # Spanish version
   ```

   > ⚠️ **Important**: Both files must have the same filename (slug) to link properly.

2. **Use the correct frontmatter**

   ```yaml
   ---
   title: "Common Name" # Required: The common name
   scientificName: "Genus species" # Required: Scientific name in italics format
   family: "Familyaceae" # Required: Botanical family
   locale: "en" # Required: "en" or "es"
   slug: "your-tree-slug" # Required: URL-friendly identifier (same for both languages)
   description: "Brief SEO description (150-160 characters)" # Required
   nativeRegion: "Geographic region" # Optional but recommended
   conservationStatus: "IUCN Status" # Optional: e.g., "Least Concern", "Vulnerable"
   maxHeight: "Height range" # Optional: e.g., "20-30 meters"
   uses: # Optional: List of uses
     - "Use one"
     - "Use two"
   featuredImage: "/images/trees/slug.jpg" # Optional: Path to main image
   publishedAt: "2024-01-15" # Optional: Publication date
   updatedAt: "2024-01-15" # Optional: Last update date
   ---
   ```

3. **Write engaging content**

   Structure your content with clear sections:

   ```markdown
   # Tree Common Name

   Opening paragraph introducing the tree and its significance.

   ## Description

   Physical characteristics, appearance, size, etc.

   ## Ecological Importance

   Role in the ecosystem, wildlife relationships, etc.

   ## Cultural Significance

   Traditional uses, historical importance, local names, etc.

   ## Where to See It

   Notable locations in Costa Rica where this tree can be found.
   ```

4. **Content quality guidelines**
   - ✅ Use accurate scientific information (cite sources when possible)
   - ✅ Keep descriptions engaging and accessible to non-experts
   - ✅ Include both metric and imperial measurements
   - ✅ Mention conservation status if known
   - ✅ Note any cultural or historical significance
   - ❌ Don't copy content from copyrighted sources
   - ❌ Avoid overly technical jargon without explanation

### Translation Guidelines

When creating Spanish translations:

- Translate naturally, not literally—adapt to Spanish conventions
- Use Latin American Spanish conventions when there are regional differences
- Keep scientific names unchanged (they're the same in all languages)
- Translate measurements but include both systems
- Research local Costa Rican names for trees when available

### Contributing Images

If you have tree photographs to contribute:

1. Ensure you have the rights to share the image (your own photo or properly licensed)
2. Provide attribution information
3. Optimal image size: 1200×800 pixels minimum
4. Supported formats: JPG, PNG, WebP
5. Place images in `public/images/trees/`
6. Note the license in your PR description

## Contributing Code

### Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Content**: MDX with Contentlayer2
- **i18n**: next-intl

### Using GitHub Copilot

This repository is configured with AI agent instructions to help GitHub Copilot understand our codebase and conventions. When using Copilot:

- **Project-wide guidance**: See `AGENTS.md` at the repository root
- **Scoped instructions**: Pattern-specific guidelines in `.github/instructions/`
  - `i18n.instructions.md` - Internationalization guidelines
  - `content.instructions.md` - MDX tree content standards
  - `components.instructions.md` - React component development
  - `api.instructions.md` - API route patterns
  - `scripts.instructions.md` - Utility script conventions

These instructions help Copilot:

- Follow project conventions and patterns
- Understand the bilingual architecture
- Apply consistent code style
- Make appropriate technical decisions

GitHub Copilot coding agent can be assigned to issues to help with tasks like bug fixes, feature additions, and content updates.

### Code Quality Requirements

Before submitting code:

1. **Ensure no linting errors**

   ```bash
   npm run lint
   ```

2. **Format your code**

   ```bash
   npm run format
   ```

3. **Verify the build succeeds**

   ```bash
   npm run build
   ```

4. **Test in both languages**

   Visit `/en` and `/es` routes to verify functionality.

### Project Structure Overview

```
src/
├── app/
│   └── [locale]/      # Locale-based routing
│       ├── page.tsx   # Homepage
│       └── trees/     # Tree listing and detail pages
├── components/        # Reusable React components
├── lib/               # Utility functions and helpers
```

## Style Guidelines

### TypeScript

- Use explicit types; avoid `any`
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names

### React Components

- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks

### CSS/Tailwind

- Follow mobile-first responsive design
- Use semantic class naming
- Leverage the existing color palette (forest, earth, tropical themes)

### File Naming

- Components: `PascalCase.tsx` (e.g., `TreeCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Content files: `kebab-case.mdx` (e.g., `guanacaste.mdx`)

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `content`: Adding or updating tree content

### Examples

```bash
feat(search): add full-text search for tree names
fix(i18n): correct language switcher on mobile devices
content: add Ceiba pentandra tree profile
docs: improve contribution guidelines
style: format components with prettier
```

## Pull Request Process

1. **Update your branch** with the latest from `main`:

   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Push your branch**:

   ```bash
   git push origin your-branch-name
   ```

3. **Create a Pull Request** to `main`

4. **Fill out the PR template** with:
   - Clear description of changes
   - Screenshots for UI changes
   - Link to related issues
   - Confirmation that you've tested your changes

5. **Respond to feedback** from reviewers promptly

6. **Wait for approval** before merging

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-reviewed my own code
- [ ] Changes generate no new warnings
- [ ] Added/updated relevant documentation
- [ ] For content: both English AND Spanish versions included
- [ ] Tested in development environment
- [ ] Build succeeds without errors

## Reporting Bugs

### Before Submitting

1. Check if the bug has already been reported in [Issues](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/issues)
2. Try to reproduce the bug on the latest `main` branch

### Bug Report Contents

Please include:

- **Clear title** describing the issue
- **Environment** (browser, OS, device)
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Screenshots** if applicable
- **Console errors** if any

## Suggesting Features

We welcome feature suggestions! When proposing a new feature:

1. **Check existing issues** to avoid duplicates
2. **Describe the use case** - what problem does it solve?
3. **Provide examples** of how it would work
4. **Consider scope** - is it feasible? Does it align with project goals?

## Questions?

- **GitHub Discussions**: For general questions and conversations
- **GitHub Issues**: For bugs and feature requests

---

Thank you for contributing to the Costa Rica Tree Atlas! Your efforts help preserve and share knowledge about Costa Rica's incredible biodiversity. 🌴🦜🌺
