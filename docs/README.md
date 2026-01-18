# Documentation Index

Welcome to the Costa Rica Tree Atlas documentation. This index helps you find the right documentation for your needs.

## 🚀 Getting Started

Start here if you're new to the project:

- **[Main README](../README.md)** - Project overview, features, and quick start
- **[Contributing Guide](../CONTRIBUTING.md)** - How to contribute, setup instructions, and development workflow

## 👥 For Contributors

### Development Guides

- **[AGENTS.md](../AGENTS.md)** - AI agent instructions and coding conventions
- **[GitHub Instructions](./.github/instructions/)** - Pattern-specific guidelines:
  - [i18n.instructions.md](../.github/instructions/i18n.instructions.md) - Internationalization
  - [content.instructions.md](../.github/instructions/content.instructions.md) - Tree content standards
  - [components.instructions.md](../.github/instructions/components.instructions.md) - React components
  - [api.instructions.md](../.github/instructions/api.instructions.md) - API routes
  - [scripts.instructions.md](../.github/instructions/scripts.instructions.md) - Utility scripts

### Content Creation

- **[CONTENT_STANDARDIZATION_GUIDE.md](./CONTENT_STANDARDIZATION_GUIDE.md)** - Standards for tree profile pages
- **[MISSING_SPECIES_LIST.md](./MISSING_SPECIES_LIST.md)** - Comprehensive list of ~53 species to add (cloud forest, dry forest, etc.)
- **[SPECIES_ADDITION_PROCESS.md](./SPECIES_ADDITION_PROCESS.md)** - Guide for reviewing missing list and adding new trees
- **[improvement-roadmap.md](./improvement-roadmap.md)** - Project roadmap and feature status (comprehensive, 86KB)

### Testing & Quality

- **[NEXT_STEPS.md](./NEXT_STEPS.md)** - External testing tasks for launch readiness
- **[accessibility-testing-checklist.md](./accessibility-testing-checklist.md)** - Accessibility testing procedures
- **[performance-testing-checklist.md](./performance-testing-checklist.md)** - Performance audit procedures

## 🛠️ Technical Guides

### Images

- **[IMAGE_OPTIMIZATION.md](./IMAGE_OPTIMIZATION.md)** - Image optimization pipeline with Sharp
- **[IMAGE_QUALITY_MONITORING.md](./IMAGE_QUALITY_MONITORING.md)** - Automated weekly image monitoring
- **[IMAGE_RESOURCES.md](./IMAGE_RESOURCES.md)** - Image sources and licensing
- **[IMAGE_INTEGRATION.md](./IMAGE_INTEGRATION.md)** - iNaturalist integration for images

### Architecture

- **[REACT_QUERY_SETUP.md](./REACT_QUERY_SETUP.md)** - React Query singleton pattern and caching
- **[REACT_HOOKS_GUIDE.md](./REACT_HOOKS_GUIDE.md)** - React Hooks best practices
- **[VIRTUALIZATION.md](./VIRTUALIZATION.md)** - Virtualized list components for performance
- **[SCROLL_LOCK.md](./SCROLL_LOCK.md)** - Modal scroll lock implementation

### Security

- **[SECURITY_SETUP.md](./SECURITY_SETUP.md)** - Security infrastructure overview
- **[VALIDATION_SECURITY.md](./VALIDATION_SECURITY.md)** - Input validation security
- **[CSP_CONFIGURATION.md](./CSP_CONFIGURATION.md)** - Content Security Policy setup
- **[SAFETY_SYSTEM.md](./SAFETY_SYSTEM.md)** - Tree toxicity safety features

## 📊 Project Status

### Current State (January 2026)

- ✅ **Content**: 128 species with complete safety data (EN+ES)
- ✅ **Educational**: 100 glossary terms, 60 species with care guidance, 14 comparison guides
- ✅ **Features**: All planned features implemented (Phase 1-4 complete, Phase 5 at 95%)
- ✅ **Build**: Pages generated successfully (last verified 2026-01-18)
- ✅ **Documentation**: Consolidated and accurate (audit: [DOCUMENTATION_AUDIT_2026-01-18.md](./DOCUMENTATION_AUDIT_2026-01-18.md))
- ⏸️ **Testing**: Awaiting external audits (axe DevTools, Lighthouse, screen readers)

See [improvement-roadmap.md](./improvement-roadmap.md) for detailed status and [NEXT_STEPS.md](./NEXT_STEPS.md) for launch tasks.

## 🔍 Finding Documentation

### By Topic

- **Content Creation**: CONTENT_STANDARDIZATION_GUIDE.md, MISSING_SPECIES_LIST.md, SPECIES_ADDITION_PROCESS.md
- **Internationalization**: .github/instructions/i18n.instructions.md
- **Images**: IMAGE_OPTIMIZATION.md, IMAGE_QUALITY_MONITORING.md, IMAGE_RESOURCES.md
- **Performance**: performance-testing-checklist.md, VIRTUALIZATION.md, REACT_QUERY_SETUP.md
- **Accessibility**: accessibility-testing-checklist.md, NEXT_STEPS.md
- **Security**: SECURITY_SETUP.md, VALIDATION_SECURITY.md, CSP_CONFIGURATION.md, SAFETY_SYSTEM.md
- **Testing**: NEXT_STEPS.md, accessibility-testing-checklist.md, performance-testing-checklist.md

### By Role

**Content Writers:**

- Main README, CONTRIBUTING, CONTENT_STANDARDIZATION_GUIDE, MISSING_SPECIES_LIST, SPECIES_ADDITION_PROCESS

**Developers:**

- AGENTS, .github/instructions/, all technical guides in docs/

**Testers:**

- NEXT_STEPS, accessibility-testing-checklist, performance-testing-checklist

**Project Managers:**

- improvement-roadmap, MISSING_SPECIES_LIST, SPECIES_ADDITION_PROCESS, NEXT_STEPS, Main README

## 📦 Archived Documentation

Outdated implementation summaries and one-time audit reports have been moved to `docs/archive/`:

- AUTONOMOUS_AGENT_SUMMARY.md - Session summary (2026-01-12)
- EDUCATIONAL_ENHANCEMENTS.md - Implementation summary (outdated)
- audit-report.md - Image audit report (2026-01-11)
- IMPLEMENTATION_SUMMARY.md - Validation security work (outdated)
- KNOWN_BUILD_ISSUES.md - Build issues (resolved)
- ACCURACY_AUDIT_REPORT.md - Content audit (one-time)
- VIRTUALIZATION_SUMMARY.md - Consolidated into VIRTUALIZATION.md

These are kept for historical reference but should not be used for current development.

## 🤝 Contributing to Documentation

Found outdated information or have suggestions? Please:

1. Check if the issue is already documented
2. Verify the information against the actual code
3. Open a PR with proposed changes
4. Update the relevant documentation index if adding new docs

**Documentation Standards:**

- Use clear, concise language
- Include code examples where relevant
- Keep information up-to-date with code changes
- Cross-reference related documentation
- Use consistent formatting (Markdown)

---

**Last Updated:** 2026-01-14  
**Maintained By:** Costa Rica Tree Atlas Contributors
