import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@i18n/routing";
import { getMessages, setRequestLocale } from "next-intl/server";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  StoreProvider,
  QueryProvider,
  ThemeSync,
} from "@/components/providers";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { PWARegister } from "@/components/PWARegister";
import { Analytics } from "@/components/Analytics";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SafeJsonLd } from "@/components/SafeJsonLd";
import { getThemeScript } from "@/lib/theme/theme-script";
import type { Metadata, Viewport } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Only preload primary font
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
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client side
  const messages = await getMessages();

  // Get nonce from middleware
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") || undefined;

  return (
    <html lang={locale}>
      <head>
        {/* Theme script - MUST be first to prevent flash */}
        <script
          dangerouslySetInnerHTML={{ __html: getThemeScript() }}
          nonce={nonce}
        />

        {/* Site-wide structured data */}
        <SafeJsonLd
          nonce={nonce}
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
        {/* Preconnect to external image hosts for faster loading */}
        <link
          rel="preconnect"
          href="https://inaturalist-open-data.s3.amazonaws.com"
        />
        <link rel="preconnect" href="https://static.inaturalist.org" />
        <link
          rel="dns-prefetch"
          href="https://inaturalist-open-data.s3.amazonaws.com"
        />
        <link rel="dns-prefetch" href="https://static.inaturalist.org" />

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
            <ThemeSync />
            <NextIntlClientProvider messages={messages}>
              <a href="#main-content" className="skip-link">
                Skip to main content
              </a>
              <Header />
              <main id="main-content" className="flex-grow">
                {children}
              </main>
              <Footer />
              <ScrollToTop />
              <KeyboardShortcuts />
              <PWARegister />
              {/* Privacy-respecting analytics - configure via env vars */}
              <Analytics
                nonce={nonce}
                plausibleDomain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
                enableSimpleAnalytics={
                  process.env.NEXT_PUBLIC_ENABLE_SIMPLE_ANALYTICS === "true"
                }
                googleAnalyticsId={process.env.NEXT_PUBLIC_GA_ID}
              />
              {/* Vercel Web Analytics */}
              <VercelAnalytics />
            </NextIntlClientProvider>
          </StoreProvider>
        </QueryProvider>
        {/* Vercel Speed Insights - placed outside providers for optimal performance monitoring */}
        <SpeedInsights />
      </body>
    </html>
  );
}
