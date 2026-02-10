"use client";

/**
 * Client-side component that displays the current year.
 * Ensures the year is always fresh and not frozen at build time.
 */
export function CurrentYear() {
  return <>{new Date().getFullYear()}</>;
}
