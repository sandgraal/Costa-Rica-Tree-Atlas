/** Centralized application route paths. */
export const ROUTES = {
  home: "/",
  trees: "/trees",
  identify: "/identify",
  compare: "/compare",
  map: "/map",
  seasonal: "/seasonal",
  conservation: "/conservation",
  fieldGuide: "/field-guide",
  education: "/education",
  glossary: "/glossary",
  safety: "/safety",
  quiz: "/quiz",
  diagnose: "/diagnose",
  contribute: "/contribute",
  contributePhoto: "/contribute/photo",
  about: "/about",
  wizard: "/wizard",
  useCases: "/use-cases",
  favorites: "/favorites",
  apiDocs: "/api-docs",
  license: "/license",
} as const;

/**
 * Top-level navigation links.
 * Translation keys correspond to the "nav" namespace.
 * Used by Header and MobileNav.
 */
export const TOP_NAV_ITEMS = [
  { href: ROUTES.home, tKey: "home" },
  { href: ROUTES.trees, tKey: "trees" },
  { href: ROUTES.identify, tKey: "identify" },
  { href: ROUTES.compare, tKey: "compare" },
] as const;

/**
 * Grouped navigation sections shown as dropdown menus on desktop and
 * collapsible groups on mobile.
 * Translation keys correspond to the "nav" namespace.
 * Used by Header (NavDropdown) and MobileNav (MobileNavGroup).
 */
export const NAV_GROUP_ITEMS = [
  {
    tKey: "explore",
    links: [
      { href: ROUTES.map, tKey: "map" },
      { href: ROUTES.seasonal, tKey: "seasonal" },
      { href: ROUTES.conservation, tKey: "conservation" },
      { href: ROUTES.fieldGuide, tKey: "fieldGuide" },
    ],
  },
  {
    tKey: "learn",
    links: [
      { href: ROUTES.education, tKey: "education" },
      { href: ROUTES.glossary, tKey: "glossary" },
      { href: ROUTES.safety, tKey: "safety" },
      { href: ROUTES.quiz, tKey: "quiz" },
      { href: ROUTES.diagnose, tKey: "diagnose" },
    ],
  },
  {
    tKey: "community",
    links: [
      { href: ROUTES.contribute, tKey: "contribute" },
      { href: ROUTES.contributePhoto, tKey: "photoUpload" },
      { href: ROUTES.about, tKey: "about" },
    ],
  },
  {
    tKey: "tools",
    links: [
      { href: ROUTES.wizard, tKey: "wizard" },
      { href: ROUTES.useCases, tKey: "useCases" },
      { href: ROUTES.favorites, tKey: "favorites" },
      { href: ROUTES.apiDocs, tKey: "apiDocs" },
    ],
  },
] as const;
