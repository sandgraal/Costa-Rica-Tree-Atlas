/**
 * Theme initialization script - prevents flash of incorrect theme (FOUC).
 *
 * MUST load synchronously in <head> (no async/defer) so it runs before
 * first paint. Reads the persisted theme from localStorage and applies
 * the correct class/attribute to <html> immediately.
 *
 * Note: This file is kept as a standalone reference implementation.
 * The layout uses the equivalent inline THEME_SCRIPT (src/lib/theme/theme-script.ts)
 * whitelisted via its SHA-256 hash in the CSP, enabling static generation
 * and edge caching without requiring a per-request nonce.
 */
(function () {
  try {
    var stored = localStorage.getItem("cr-tree-atlas");
    var theme = "light";

    if (stored) {
      var parsed = JSON.parse(stored);
      var savedTheme = (parsed.state && parsed.state.theme) || "system";

      if (savedTheme === "system") {
        theme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      } else {
        theme = savedTheme;
      }
    } else {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
  } catch (e) {
    document.documentElement.classList.add("light");
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.style.colorScheme = "light";
  }
})();
