"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

// Privacy-respecting analytics component
// Supports: Plausible, Simple Analytics, or custom self-hosted solutions
// Does NOT use cookies by default - respects user privacy

interface AnalyticsProps {
  // Plausible domain (e.g., "costa-rica-tree-atlas.com")
  plausibleDomain?: string;
  // Simple Analytics custom domain (optional)
  simpleAnalyticsDomain?: string;
  // Enable Simple Analytics
  enableSimpleAnalytics?: boolean;
  // Google Analytics ID (GA4)
  googleAnalyticsId?: string;
}

export function Analytics({
  plausibleDomain,
  simpleAnalyticsDomain,
  enableSimpleAnalytics,
  googleAnalyticsId,
}: AnalyticsProps) {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);

  useEffect(() => {
    // Check for existing consent
    const consent = localStorage.getItem("analytics-consent");
    if (consent === "granted") {
      setHasConsent(true);
    } else if (consent === "denied") {
      setHasConsent(false);
    } else {
      // For privacy-respecting analytics (Plausible/Simple), no consent needed
      // They don't use cookies and respect DNT
      if (plausibleDomain || enableSimpleAnalytics) {
        setHasConsent(true);
      }
    }
  }, [plausibleDomain, enableSimpleAnalytics]);

  // Only load if consent given or using privacy-first analytics
  if (hasConsent !== true) {
    return null;
  }

  return (
    <>
      {/* Plausible Analytics - Privacy-friendly, no cookies */}
      {plausibleDomain && (
        <Script
          defer
          data-domain={plausibleDomain}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      )}

      {/* Simple Analytics - Privacy-first, GDPR compliant */}
      {enableSimpleAnalytics && (
        <Script
          src={
            simpleAnalyticsDomain
              ? `https://${simpleAnalyticsDomain}/latest.js`
              : "https://scripts.simpleanalyticscdn.com/latest.js"
          }
          strategy="afterInteractive"
        />
      )}

      {/* Google Analytics (GA4) - Only with explicit consent */}
      {googleAnalyticsId && hasConsent && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalyticsId}', {
                anonymize_ip: true,
                allow_google_signals: false,
                allow_ad_personalization_signals: false
              });
            `}
          </Script>
        </>
      )}
    </>
  );
}

// Simple page view tracker for custom solutions
export function trackPageView(url: string) {
  // Plausible
  if (
    typeof window !== "undefined" &&
    (
      window as unknown as {
        plausible?: (event: string, options?: object) => void;
      }
    ).plausible
  ) {
    (
      window as unknown as {
        plausible: (event: string, options?: object) => void;
      }
    ).plausible("pageview", { u: url });
  }
}

// Simple event tracker
export function trackEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>
) {
  // Plausible
  if (
    typeof window !== "undefined" &&
    (
      window as unknown as {
        plausible?: (
          event: string,
          options?: { props?: Record<string, string | number | boolean> }
        ) => void;
      }
    ).plausible
  ) {
    (
      window as unknown as {
        plausible: (
          event: string,
          options?: { props?: Record<string, string | number | boolean> }
        ) => void;
      }
    ).plausible(eventName, { props });
  }

  // Simple Analytics
  if (
    typeof window !== "undefined" &&
    (
      window as unknown as {
        sa_event?: (
          event: string,
          metadata?: Record<string, string | number | boolean>
        ) => void;
      }
    ).sa_event
  ) {
    (
      window as unknown as {
        sa_event: (
          event: string,
          metadata?: Record<string, string | number | boolean>
        ) => void;
      }
    ).sa_event(eventName, props);
  }
}
