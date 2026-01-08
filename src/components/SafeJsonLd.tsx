"use client";

import { useEffect, useRef } from "react";

interface SafeJsonLdProps {
  data: object;
}

/**
 * Safely render JSON-LD structured data with XSS protection
 *
 * Defense layers:
 * 1. JSON.stringify escapes quotes and backslashes
 * 2. Replace < to prevent </script> injection
 * 3. Replace unicode line/paragraph separators (U+2028, U+2029)
 *
 * @param data - The JSON-LD structured data object to render
 * @returns A script tag with JSON-LD data
 */
export function SafeJsonLd({ data }: SafeJsonLdProps) {
  const ref = useRef<HTMLScriptElement>(null);

  useEffect(() => {
    if (ref.current) {
      // JSON.stringify handles basic escaping
      let json = JSON.stringify(data);

      // Escape < to prevent </script> injection
      json = json.replace(/</g, "\\u003c");

      // Escape > for symmetry (not strictly required)
      json = json.replace(/>/g, "\\u003e");

      // Escape unicode line separators that can break JavaScript
      json = json.replace(/\u2028/g, "\\u2028");
      json = json.replace(/\u2029/g, "\\u2029");

      // Use textContent for additional safety
      ref.current.textContent = json;
    }
  }, [data]);

  return <script ref={ref} type="application/ld+json" />;
}
