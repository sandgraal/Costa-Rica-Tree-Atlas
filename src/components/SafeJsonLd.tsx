"use client";

import DOMPurify from "isomorphic-dompurify";

interface SafeJsonLdProps {
  data: object;
}

/**
 * Safely renders JSON-LD structured data with XSS protection
 * 
 * This component uses DOMPurify to sanitize JSON-LD structured data before
 * injecting it into the DOM via dangerouslySetInnerHTML. This prevents
 * potential XSS vulnerabilities if user input ever flows into the structured data.
 * 
 * @param data - The JSON-LD structured data object to render
 * @returns A script tag with sanitized JSON-LD data
 */
export function SafeJsonLd({ data }: SafeJsonLdProps) {
  const jsonString = JSON.stringify(data);
  const sanitized = DOMPurify.sanitize(jsonString);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
