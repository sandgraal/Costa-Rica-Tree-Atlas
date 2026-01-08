/**
 * Validates scientific names with ReDoS protection and homograph detection
 *
 * Security features:
 * - Length limits prevent ReDoS
 * - Character-by-character validation (no regex backtracking)
 * - Comprehensive homograph detection
 * - Zero-width character blocking
 * - Multiple normalization forms checked
 */

const MAX_NAME_LENGTH = 200;
const MIN_NAME_LENGTH = 2;

// Allowed character ranges (explicit, no regex)
const ALLOWED_CHARS = {
  basicLatin: (code: number) =>
    (code >= 0x0041 && code <= 0x005a) || // A-Z
    (code >= 0x0061 && code <= 0x007a) || // a-z
    code === 0x0020 || // space
    code === 0x002d || // hyphen
    code === 0x002e, // period

  latinExtended: (code: number) =>
    (code >= 0x00c0 && code <= 0x00ff) || // Latin-1 Supplement
    (code >= 0x0100 && code <= 0x017f) || // Latin Extended-A
    (code >= 0x0180 && code <= 0x024f), // Latin Extended-B
};

// Dangerous character ranges (homograph attacks)
const DANGEROUS_CHARS = {
  cyrillic: (code: number) => code >= 0x0400 && code <= 0x04ff,
  greek: (code: number) => code >= 0x0370 && code <= 0x03ff,
  arabic: (code: number) => code >= 0x0600 && code <= 0x06ff,
  hebrew: (code: number) => code >= 0x0590 && code <= 0x05ff,

  // Zero-width and invisible characters
  zeroWidth: (code: number) =>
    [
      0x200b, // Zero-width space
      0x200c, // Zero-width non-joiner
      0x200d, // Zero-width joiner
      0x200e, // Left-to-right mark
      0x200f, // Right-to-left mark
      0xfeff, // Zero-width no-break space
    ].includes(code),

  // Control characters
  control: (code: number) =>
    (code >= 0x0000 && code <= 0x001f) || // C0 controls
    (code >= 0x007f && code <= 0x009f), // C1 controls

  // Emoji and symbols (not allowed in scientific names)
  emoji: (code: number) =>
    (code >= 0x1f300 && code <= 0x1f9ff) || // Emoticons, symbols
    (code >= 0x2600 && code <= 0x26ff) || // Misc symbols
    (code >= 0x2700 && code <= 0x27bf), // Dingbats
};

interface ValidationResult {
  valid: boolean;
  sanitized?: string;
  error?: string;
}

/**
 * Validate scientific name with comprehensive security checks
 */
export function validateScientificName(name: string): ValidationResult {
  // 1. Length check (prevent ReDoS via length)
  if (!name || name.length < MIN_NAME_LENGTH) {
    return { valid: false, error: "Name too short" };
  }

  if (name.length > MAX_NAME_LENGTH) {
    return { valid: false, error: "Name too long (possible ReDoS attempt)" };
  }

  // 2. Normalize to NFC (canonical composition)
  const normalized = name.normalize("NFC");

  // 3. Check if other normalization forms differ (homograph attack)
  const nfd = name.normalize("NFD");
  const nfkc = name.normalize("NFKC");
  const nfkd = name.normalize("NFKD");

  if (nfkc !== normalized || nfkd !== nfd) {
    return {
      valid: false,
      error: "Suspicious Unicode normalization detected",
    };
  }

  // 4. Character-by-character validation (no regex!)
  let hasLatin = false;
  let hasCyrillic = false;
  let hasGreek = false;
  let hasArabic = false;
  let hasHebrew = false;

  for (let i = 0; i < normalized.length; i++) {
    // Safe: i is a controlled index within normalized string length
    // eslint-disable-next-line security/detect-object-injection
    const char = normalized[i];
    const code = char.charCodeAt(0);

    // Check for dangerous characters
    if (DANGEROUS_CHARS.control(code)) {
      return { valid: false, error: "Invalid control characters" };
    }

    if (DANGEROUS_CHARS.zeroWidth(code)) {
      return { valid: false, error: "Zero-width characters not allowed" };
    }

    if (DANGEROUS_CHARS.emoji(code)) {
      return { valid: false, error: "Emoji not allowed in scientific names" };
    }

    // Track script usage for mixed-script detection
    if (ALLOWED_CHARS.basicLatin(code) || ALLOWED_CHARS.latinExtended(code)) {
      hasLatin = true;
    } else if (DANGEROUS_CHARS.cyrillic(code)) {
      hasCyrillic = true;
    } else if (DANGEROUS_CHARS.greek(code)) {
      hasGreek = true;
    } else if (DANGEROUS_CHARS.arabic(code)) {
      hasArabic = true;
    } else if (DANGEROUS_CHARS.hebrew(code)) {
      hasHebrew = true;
    } else {
      // Unrecognized character
      return {
        valid: false,
        error: `Invalid character: "${char}" (U+${code.toString(16).toUpperCase()})`,
      };
    }
  }

  // 5. Mixed-script detection (homograph attack)
  const scriptCount = [
    hasLatin,
    hasCyrillic,
    hasGreek,
    hasArabic,
    hasHebrew,
  ].filter(Boolean).length;

  if (scriptCount > 1) {
    return {
      valid: false,
      error: "Mixed scripts detected (possible homograph attack)",
    };
  }

  if (!hasLatin) {
    return {
      valid: false,
      error: "Scientific names must use Latin script",
    };
  }

  // 6. Check for repeated zero-width sequences
  if (/([\u200B-\u200F]){2,}/.test(normalized)) {
    return { valid: false, error: "Suspicious character repetition" };
  }

  // 7. Validate structure (basic scientific name format)
  // Should be: Genus species [subspecies] [author]
  const parts = normalized.trim().split(/\s+/);

  if (parts.length < 1 || parts.length > 6) {
    return { valid: false, error: "Invalid scientific name structure" };
  }

  // First part (genus) should start with uppercase
  if (!/^[A-Z]/.test(parts[0])) {
    return { valid: false, error: "Genus must start with uppercase letter" };
  }

  // Second part (species) should be lowercase (if present)
  if (parts.length >= 2 && !/^[a-z]/.test(parts[1])) {
    return {
      valid: false,
      error: "Species name must start with lowercase letter",
    };
  }

  return { valid: true, sanitized: normalized };
}

/**
 * Detect potential homograph attacks by checking for visually similar characters
 */
export function detectHomoglyphs(text: string): {
  suspicious: boolean;
  details: string[];
} {
  const details: string[] = [];

  // Common Latin-Cyrillic lookalikes
  const lookalikes: [string, string, string][] = [
    ["a", "а", "Cyrillic"], // Latin 'a' vs Cyrillic 'а'
    ["e", "е", "Cyrillic"],
    ["o", "о", "Cyrillic"],
    ["p", "р", "Cyrillic"],
    ["c", "с", "Cyrillic"],
    ["y", "у", "Cyrillic"],
    ["x", "х", "Cyrillic"],
    // Greek
    ["A", "Α", "Greek"], // Latin 'A' vs Greek 'Α'
    ["B", "Β", "Greek"],
    ["E", "Ε", "Greek"],
    ["Z", "Ζ", "Greek"],
    ["H", "Η", "Greek"],
    ["I", "Ι", "Greek"],
    ["K", "Κ", "Greek"],
    ["M", "Μ", "Greek"],
    ["N", "Ν", "Greek"],
    ["O", "Ο", "Greek"],
    ["P", "Ρ", "Greek"],
    ["T", "Τ", "Greek"],
    ["X", "Χ", "Greek"],
    ["Y", "Υ", "Greek"],
    // Arabic
    ["o", "ο", "Arabic"], // Various 'o' lookalikes
  ];

  for (const [latin, lookalike, script] of lookalikes) {
    if (text.includes(lookalike)) {
      details.push(
        `Found ${script} '${lookalike}' (U+${lookalike.charCodeAt(0).toString(16)}) ` +
          `that looks like Latin '${latin}'`
      );
    }
  }

  return {
    suspicious: details.length > 0,
    details,
  };
}
