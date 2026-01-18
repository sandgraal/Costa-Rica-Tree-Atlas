import { STORE_KEY } from "@/lib/store";

/**
 * Inline script to prevent theme flash
 * This MUST run before first paint (blocking in <head>)
 *
 * The script reads from localStorage and sets theme classes/attributes
 * before the browser paints, preventing any flash of incorrect theme.
 *
 * Exported as a constant string to be used with Next.js Script component,
 * avoiding dangerouslySetInnerHTML which triggers XSS warnings.
 */
export const THEME_SCRIPT = `
(function() {
  try {
    var stored = localStorage.getItem('${STORE_KEY}');
    var theme = 'light';
    
    if (stored) {
      var parsed = JSON.parse(stored);
      var savedTheme = parsed.state?.theme || 'system';
      
      if (savedTheme === 'system') {
        // Use system preference
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        theme = savedTheme;
      }
    } else {
      // No stored preference - check system
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    // Set immediately before first paint
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
  } catch (e) {
    // Fail gracefully - default to light theme
    console.error('Theme initialization error:', e);
  }
})();
`.trim();
