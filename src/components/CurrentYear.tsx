"use client";

import { useEffect, useState } from "react";

/**
 * Client-side component that displays the current year.
 * Ensures the year is always fresh and not frozen at build time.
 */
export function CurrentYear() {
  const [year, setYear] = useState<number>(() => new Date().getFullYear());

  useEffect(() => {
    // Update year on mount to ensure it's current
    setYear(new Date().getFullYear());
  }, []);

  return <>{year}</>;
}
