import Script from "next/script";

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
  // CSP nonce for inline scripts
  nonce?: string;
}

export function Analytics({
  plausibleDomain,
  simpleAnalyticsDomain,
  enableSimpleAnalytics,
  googleAnalyticsId,
  nonce,
}: AnalyticsProps) {
  return (
    <>
      {/* Plausible Analytics - Privacy-friendly, no cookies */}
      {plausibleDomain && (
        <Script
          nonce={nonce}
          defer
          data-domain={plausibleDomain}
          src="https://plausible.io/js/script.js"
          strategy="lazyOnload"
        />
      )}

      {/* Simple Analytics - Privacy-first, GDPR compliant */}
      {enableSimpleAnalytics && (
        <Script
          nonce={nonce}
          src={
            simpleAnalyticsDomain
              ? `https://${simpleAnalyticsDomain}/latest.js`
              : "https://scripts.simpleanalyticscdn.com/latest.js"
          }
          strategy="lazyOnload"
        />
      )}

      {/* Google Analytics (GA4) - Only with explicit consent */}
      {googleAnalyticsId && (
        <>
          <Script
            nonce={nonce}
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="lazyOnload"
          />
          <Script nonce={nonce} id="google-analytics" strategy="lazyOnload">
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
