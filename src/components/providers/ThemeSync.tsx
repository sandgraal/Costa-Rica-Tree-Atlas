"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

/**
 * Component that syncs theme with system preference changes
 * Only active when theme is set to "system"
 */
export function ThemeSync() {
  const theme = useStore((state) => state.theme);
  const setResolvedTheme = useStore((state) => state.setResolvedTheme);

  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const resolved = e.matches ? "dark" : "light";
      setResolvedTheme(resolved);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme, setResolvedTheme]);

  return null;
}
