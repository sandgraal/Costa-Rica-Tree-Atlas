"use client";

import { useEffect, useRef } from "react";

interface SafeJsonLdProps {
  data: object;
  nonce?: string;
}

/**
 * Safely renders JSON-LD structured data without using dangerouslySetInnerHTML
 *
 * This component creates a script tag and sets its textContent property directly,
 * which is safer than using dangerouslySetInnerHTML. JSON.stringify() already
 * escapes potentially dangerous characters like < and >, making the output safe.
 *
 * @param data - The JSON-LD structured data object to render
 * @param nonce - Optional CSP nonce for the script tag
 * @returns A script tag with JSON-LD data
 */
export function SafeJsonLd({ data, nonce }: SafeJsonLdProps) {
  const ref = useRef<HTMLScriptElement>(null);

  useEffect(() => {
    if (ref.current) {
      const jsonString = JSON.stringify(data);
      ref.current.textContent = jsonString;
    }
  }, [data]);

  return <script ref={ref} type="application/ld+json" nonce={nonce} />;
}
