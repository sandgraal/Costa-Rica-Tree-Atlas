import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@i18n/routing";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StoreProvider, QueryProvider } from "@/components/providers";
import { SafeJsonLd } from "@/components/SafeJsonLd";
import { PageErrorBoundary } from "@/components/PageErrorBoundary";
import { THEME_SCRIPT } from "@/lib/theme/theme-script";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import dynamic from "next/dynamic";
import type { Metadata, Viewport } from "next";

// Lazy load non-critical client components
const KeyboardShortcuts = dynamic(() =>
  import("@/components/KeyboardShortcuts").then((m) => ({
    default: m.KeyboardShortcuts,
  }))
);
const PWARegister = dynamic(() =>
  import("@/components/PWARegister").then((m) => ({ default: m.PWARegister }))
);
const Analytics = dynamic(() =>
  import("@/components/Analytics").then((m) => ({ default: m.Analytics }))
);
const ScrollToTop = dynamic(() =>
  import("@/components/ScrollToTop").then((m) => ({ default: m.ScrollToTop }))
);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Only preload primary font
  adjustFontFallback: true,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// PWA viewport configuration
export const viewport: Viewport = {
  themeColor: "#2d5a27",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  const t = messages as {
    siteTitle: string;
    siteDescription: string;
  };

  return {
    metadataBase: new URL("https://costaricatreeatlas.com"),
    title: {
      default: t.siteTitle,
      template: `%s | ${t.siteTitle}`,
    },
    description: t.siteDescription,
    keywords: [
      "Costa Rica",
      "trees",
      "árboles",
      "flora",
      "nature",
      "conservation",
      "tropical",
      "rainforest",
    ],
    authors: [{ name: "Costa Rica Tree Atlas Contributors" }],
    openGraph: {
      title: t.siteTitle,
      description: t.siteDescription,
      locale: locale === "es" ? "es_CR" : "en_US",
      alternateLocale: locale === "es" ? "en_US" : "es_CR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t.siteTitle,
      description: t.siteDescription,
    },
    alternates: {
      languages: {
        en: "/en",
        es: "/es",
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: localeParam } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!hasLocale(routing.locales, localeParam)) {
    notFound();
  }

  // After validation, we know localeParam is a valid Locale
  const locale = localeParam as Locale;

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client side
  const messages = await getMessages();
  const tNav = await getTranslations("nav");

  // Nonce removed: the layout no longer calls headers(), making all child
  // pages eligible for static generation and Vercel edge caching.
  // Theme bootstrap is an inline script allowed via its SHA-256 hash in the
  // CSP (see src/lib/security/csp.ts).  The CSP uses 'self' + explicit
  // host allowlisting instead of 'strict-dynamic', so Next.js framework
  // scripts load normally without nonce attributes.
  // Analytics scripts use next/script with strategy="lazyOnload".
  // JSON-LD <script type="application/ld+json"> is a data block
  // (non-executable) and does not require a nonce in modern browsers.

  return (
    <html lang={locale}>
      <head>
        {/*
          Theme bootstrap - MUST run synchronously before first paint to
          prevent flash of incorrect theme (FOUC).
          No nonce needed: the script content is static and its SHA-256 hash
          is whitelisted in the CSP, satisfying 'strict-dynamic'.
          Security: THEME_SCRIPT is a compile-time constant — no user input.
        */}
        {/* eslint-disable-next-line react/no-danger */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />

        {/* Site-wide structured data */}
        <SafeJsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": "https://costaricatreeatlas.com/#website",
                url: "https://costaricatreeatlas.com",
                name:
                  locale === "es"
                    ? "Atlas de Árboles de Costa Rica"
                    : "Costa Rica Tree Atlas",
                description:
                  locale === "es"
                    ? "Guía bilingüe de código abierto de los árboles de Costa Rica"
                    : "Open-source bilingual guide to Costa Rican trees",
                inLanguage: locale === "es" ? "es-CR" : "en-US",
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: `https://costaricatreeatlas.com/${locale}/trees?search={search_term_string}`,
                  },
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@type": "Organization",
                "@id": "https://costaricatreeatlas.com/#organization",
                name: "Costa Rica Tree Atlas",
                url: "https://costaricatreeatlas.com",
                logo: {
                  "@type": "ImageObject",
                  url: "https://costaricatreeatlas.com/images/cr-tree-atlas-logo.png",
                },
                sameAs: ["https://github.com/sandgraal/Costa-Rica-Tree-Atlas"],
              },
            ],
          }}
        />

        {/* Resource hints for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://inaturalist-open-data.s3.amazonaws.com"
        />
        <link rel="preconnect" href="https://static.inaturalist.org" />
        <link rel="dns-prefetch" href="https://api.gbif.org" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        {/* Vercel Analytics & Speed Insights */}
        <link rel="preconnect" href="https://va.vercel-scripts.com" />
        <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />

        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CR Trees" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <QueryProvider>
          <StoreProvider>
            <NextIntlClientProvider messages={messages}>
              <PageErrorBoundary>
                <noscript>
                  <div
                    role="alert"
                    className="px-4 py-3 bg-amber-100 text-amber-800 text-center text-sm"
                  >
                    {tNav("noJsBanner")}
                  </div>
                </noscript>
                <a href="#main-content" className="skip-link">
                  Skip to main content
                </a>
                <Header />
                <main id="main-content" className="flex-grow">
                  {children}
                </main>
                <Footer locale={locale} />
                <ScrollToTop />
                <KeyboardShortcuts />
                <PWARegister />
                {/* Privacy-respecting analytics - configure via env vars */}
                <Analytics
                  plausibleDomain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
                  enableSimpleAnalytics={
                    process.env.NEXT_PUBLIC_ENABLE_SIMPLE_ANALYTICS === "true"
                  }
                  googleAnalyticsId={process.env.NEXT_PUBLIC_GA_ID}
                />
                {/* Vercel Web Analytics */}
                <VercelAnalytics />
              </PageErrorBoundary>
            </NextIntlClientProvider>
          </StoreProvider>
        </QueryProvider>
      </body>
      {/* Vercel Speed Insights - deferred to reduce TBT */}
      <SpeedInsights />
    </html>
  );
}
