# Input Validation Security Enhancements

**Last Updated:** 2026-01-12  
**Status:** ✅ Active - Comprehensive input validation in src/lib/validation/

## Overview

This document describes the comprehensive security improvements made to the input validation system, now implemented in `src/lib/validation/` with modular, security-focused validation functions.

## Architecture

The validation system is now split into specialized modules:

- **`scientific-name.ts`**: Core scientific name validation with ReDoS protection, homograph detection, and character-by-character validation
- **`entropy.ts`**: Shannon entropy calculation to detect suspicious patterns
- **`index.ts`**: Main exports and comprehensive `validateScientificNameStrict()` function
- **`json-ld.ts`**: JSON-LD validation for structured data

## Security Vulnerabilities Addressed

### 1. ReDoS (Regular Expression Denial of Service)

**Problem:** The previous regex `/^[\p{L}\s\-\.]+$/u` with Unicode property escapes and unbounded quantifiers could cause exponential backtracking with malicious input.

**Solution:**

- **Eliminated regex-based validation** for scientific names
- Implemented character-by-character validation with explicit bounds
- Length checks performed **before** any processing (MAX_NAME_LENGTH = 200)
- No backtracking possible - O(n) time complexity guaranteed
- Validates in < 1ms even for maximum-length inputs

**Performance Benchmarks:**
| Input Type | Size | Validation Time | Result |
|------------|------|-----------------|--------|
| Valid name | 20 chars | < 0.1ms | Accepted |
| Max length | 200 chars | < 1ms | Processed |
| Attack (10KB) | 10,000 chars | < 1ms | Rejected (length check) |
| 10K validations | - | < 1 second | Avg 0.1ms each |

### 2. Homograph Attacks (Visual Spoofing)

**Problem:** Previous implementation only checked Latin+Cyrillic/Greek, missing Latin+Arabic, Latin+Hebrew, Latin+Emoji, and mixed RTL/LTR attacks.

**Solution:**

- **Comprehensive script detection** covering:
  - Cyrillic (U+0400-U+04FF)
  - Greek (U+0370-U+03FF)
  - Arabic (U+0600-U+06FF)
  - Hebrew (U+0590-U+05FF)
  - Emoji (U+1F300-U+1F9FF, U+2600-U+26FF, U+2700-U+27BF)
- Rejects any mixing of Latin with non-Latin scripts
- `detectHomoglyphs()` function identifies specific lookalike characters
- Returns detailed error messages with Unicode codepoints

**Examples Blocked:**

```typescript
validateScientificName("Quеrcus"); // Cyrillic 'е'
// => { valid: false, error: 'Mixed scripts detected (possible homograph attack)' }

validateScientificName("Αlpha"); // Greek 'Α'
// => { valid: false, error: 'Mixed scripts detected (possible homograph attack)' }

validateScientificName("Quercus⚠️"); // Emoji
// => { valid: false, error: 'Emoji not allowed in scientific names' }
```

### 3. Zero-Width Character Attacks

**Problem:** Zero-width joiners, spaces, and other invisible Unicode characters could bypass validation.

**Solution:**

- **Explicit blocking** of all zero-width characters:
  - U+200B: Zero-width space
  - U+200C: Zero-width non-joiner
  - U+200D: Zero-width joiner
  - U+200E: Left-to-right mark
  - U+200F: Right-to-left mark
  - U+FEFF: Zero-width no-break space
- Character-by-character validation catches these instantly
- Returns clear error: "Zero-width characters not allowed"

### 4. Unicode Normalization Inconsistencies

**Problem:** Only used NFC normalization, but attackers could use NFD, NFKC, or NFKD to create visually identical strings that differ in binary representation.

**Solution:**

- **Multiple normalization form validation**:
  - Normalizes input to NFC (Canonical Composition)
  - Compares with NFD, NFKC, and NFKD forms
  - Detects if normalization forms differ (homograph attack indicator)
  - Returns error: "Suspicious Unicode normalization detected"

**Example:**

```typescript
// These normalize to the same NFC form
validateScientificName("Café"); // NFC: é as single char
validateScientificName("Cafe\u0301"); // NFD: é as e + combining acute
// Both accepted and normalized to same sanitized output

// This is rejected due to normalization mismatch
validateScientificName("ﬁ"); // Latin Small Ligature FI
// => { valid: false, error: 'Suspicious Unicode normalization detected' }
```

### 5. Entropy Validation

**New Feature:** Detects suspicious patterns through Shannon entropy analysis.

**Implementation:**

- Calculates Shannon entropy: H = -Σ(p(x) × log₂(p(x)))
- Valid scientific names typically have entropy between 2.0 and 4.5
- Rejects:
  - **Too low entropy**: "aaaaaaaaaa" (repeated characters)
  - **Too high entropy**: "xQz9!Kp2@" (random garbage)

**Examples:**

```typescript
calculateEntropy("Quercus robur"); // ~3.2 (valid)
calculateEntropy("aaaaaaaaaa"); // ~0 (rejected)
calculateEntropy("xQz9!Kp2@W"); // ~4.7 (rejected)
```

### 6. Control Character Detection

**Enhanced:** Now catches all control characters, not just null bytes.

**Solution:**

- C0 controls: U+0000-U+001F (including null byte, newline, tab)
- C1 controls: U+007F-U+009F
- Instant rejection with detailed error messages

## API Functions

### Core Validation Functions

#### `validateScientificName(name: string): ValidationResult`

**Location:** `src/lib/validation/scientific-name.ts`

**Security checks (in order):**

1. **Length check** (prevents ReDoS) - min 2, max 200 chars
2. **Unicode normalization** to NFC (Canonical Composition)
3. **Normalization form comparison** (NFD, NFKC, NFKD)
4. **Character-by-character validation**:
   - Control characters (C0/C1)
   - Zero-width characters
   - Emoji and symbols
   - Script detection (Latin, Cyrillic, Greek, Arabic, Hebrew)
5. **Mixed-script detection** (homograph attack)
6. **Latin script requirement**
7. **Structure validation** (Genus species format)

**Returns:**

```typescript
interface ValidationResult {
  valid: boolean;
  sanitized?: string; // NFC-normalized output
  error?: string; // Detailed error message
}
```

**Examples:**

```typescript
// Valid inputs
validateScientificName("Quercus robur");
// => { valid: true, sanitized: "Quercus robur" }

validateScientificName("Piña colada");
// => { valid: true, sanitized: "Piña colada" }

// Invalid inputs
validateScientificName("quercus"); // No uppercase genus
// => { valid: false, error: "Genus must start with uppercase letter" }

validateScientificName("Quercus123"); // Numbers not allowed
// => { valid: false, error: 'Invalid character: "1" (U+31)' }
```

#### `detectHomoglyphs(text: string): HomoglyphResult`

**Location:** `src/lib/validation/scientific-name.ts`

Scans text for specific lookalike characters from different scripts.

**Returns:**

```typescript
interface HomoglyphResult {
  suspicious: boolean;
  details: string[]; // Array of detected lookalikes with details
}
```

**Example:**

```typescript
detectHomoglyphs("Quеrcus"); // Cyrillic 'е'
// => {
//   suspicious: true,
//   details: ["Found Cyrillic 'е' (U+435) that looks like Latin 'e'"]
// }
```

#### `calculateEntropy(str: string): number`

**Location:** `src/lib/validation/entropy.ts`

Calculates Shannon entropy to detect suspicious patterns.

**Formula:** H = -Σ(p(x) × log₂(p(x)))

**Returns:** Entropy value (0 to ~5 for typical inputs)

#### `validateEntropy(name: string): EntropyResult`

**Location:** `src/lib/validation/entropy.ts`

Validates that string has reasonable entropy for scientific names (2.0-4.5).

**Returns:**

```typescript
interface EntropyResult {
  valid: boolean;
  entropy: number;
  reason?: string;
}
```

#### `validateScientificNameStrict(name: string): StrictResult`

**Location:** `src/lib/validation/index.ts`

Comprehensive validation combining all checks.

**Returns:**

```typescript
interface StrictResult {
  valid: boolean;
  sanitized?: string;
  errors: string[]; // Blocking errors
  warnings: string[]; // Non-blocking warnings (e.g., low entropy)
}
```

**Example:**

```typescript
validateScientificNameStrict("aaaaaaaa");
// => {
//   valid: false,
//   errors: ["Genus must start with uppercase letter"],
//   warnings: ["Low entropy (0.00): Too many repeated characters"]
// }
```

## Blocked Character Ranges

### Explicitly Blocked

| Range           | Description               | Example                            |
| --------------- | ------------------------- | ---------------------------------- |
| U+0000-U+001F   | C0 control characters     | Null byte, newline, tab            |
| U+007F-U+009F   | C1 control characters     | Delete, various controls           |
| U+200B-U+200F   | Zero-width characters     | ZW space, ZW joiner, LTR/RTL marks |
| U+FEFF          | Zero-width no-break space | BOM character                      |
| U+0400-U+04FF   | Cyrillic script           | а, е, о, р, с (lookalikes)         |
| U+0370-U+03FF   | Greek script              | Α, Ε, Ο, Ρ (lookalikes)            |
| U+0600-U+06FF   | Arabic script             | RTL script                         |
| U+0590-U+05FF   | Hebrew script             | RTL script                         |
| U+1F300-U+1F9FF | Emoji                     | 🌳, ⚠️, etc.                       |
| U+2600-U+26FF   | Miscellaneous symbols     | ☀, ★, etc.                         |
| U+2700-U+27BF   | Dingbats                  | ✓, ✗, etc.                         |

### Explicitly Allowed

| Range         | Description        | Example    |
| ------------- | ------------------ | ---------- |
| U+0041-U+005A | Latin uppercase    | A-Z        |
| U+0061-U+007A | Latin lowercase    | a-z        |
| U+0020        | Space              | (space)    |
| U+002D        | Hyphen-minus       | -          |
| U+002E        | Full stop          | .          |
| U+00C0-U+00FF | Latin-1 Supplement | á, é, ñ, ü |
| U+0100-U+017F | Latin Extended-A   | ā, ē, ō    |
| U+0180-U+024F | Latin Extended-B   | ơ, ư       |

## Performance Benchmarks

Based on comprehensive test suite (`__tests__/redos.test.ts`):

| Test Type       | Input                      | Duration   | Result            |
| --------------- | -------------------------- | ---------- | ----------------- |
| Valid name      | "Quercus robur" (13 chars) | < 0.1ms    | Accepted          |
| Max length      | 200 characters             | < 1ms      | Validated         |
| Oversized       | 10,000 characters          | < 1ms      | Rejected (length) |
| Zero-width spam | 1,000 ZW chars             | < 1ms      | Rejected          |
| Homograph       | Cyrillic attack            | < 5ms      | Rejected          |
| Control chars   | Null byte, newline         | < 5ms      | Rejected          |
| 10K validations | 5 different names          | < 1 second | Avg 0.1ms         |

**Key Metrics:**

- ✅ Average validation: **< 0.1ms**
- ✅ Worst case: **< 5ms**
- ✅ 10,000 validations: **< 1 second**
- ✅ No regex backtracking possible
- ✅ O(n) time complexity guaranteed

## Testing

Comprehensive test suite covers all security features:

### Test Files

1. **`scientific-name.test.ts`** (230+ test cases)
   - Basic validation
   - Control character detection
   - Zero-width character detection
   - Homograph attacks (all scripts)
   - Emoji detection
   - Unicode normalization
   - Scientific name structure
   - Invalid character detection

2. **`entropy.test.ts`** (20+ test cases)
   - Entropy calculation
   - Entropy validation
   - Edge cases (empty, repeated, random)

3. **`redos.test.ts`** (10+ test cases)
   - ReDoS prevention
   - Performance benchmarks
   - Worst-case scenarios
   - 10K validation benchmark

### Running Tests

```bash
# Run all validation tests
npm test src/lib/validation/__tests__/

# Run specific test file
npm test src/lib/validation/__tests__/scientific-name.test.ts

# Run performance benchmarks
npm test src/lib/validation/__tests__/redos.test.ts
```

## Migration Guide

### From Old `validation.ts` to New Modules

**Old code:**

```typescript
import { validateScientificName } from "@/lib/validation";

const result = validateScientificName(input);
```

**New code (backward compatible):**

```typescript
// Option 1: Use new module directly
import { validateScientificName } from "@/lib/validation/scientific-name";

const result = validateScientificName(input);

// Option 2: Use comprehensive validator
import { validateScientificNameStrict } from "@/lib/validation";

const result = validateScientificNameStrict(input);
// Returns: { valid, sanitized, errors, warnings }
```

The new implementation is **backward compatible** - same function signature and return type as the old `validateScientificName()` in `validation.ts`.

## Security Summary

### Vulnerabilities Fixed

| Vulnerability                  | Severity    | Status   |
| ------------------------------ | ----------- | -------- |
| ReDoS via unbounded regex      | 🔴 Critical | ✅ Fixed |
| Incomplete homograph detection | 🟡 High     | ✅ Fixed |
| Zero-width character bypass    | 🟡 High     | ✅ Fixed |
| Normalization inconsistencies  | 🟡 High     | ✅ Fixed |
| Control character injection    | 🟠 Medium   | ✅ Fixed |

### New Security Features

- ✅ Character-by-character validation (no regex)
- ✅ Comprehensive script detection (5 scripts)
- ✅ Zero-width character blocking (6 types)
- ✅ Multiple normalization form validation
- ✅ Shannon entropy analysis
- ✅ Detailed error messages with Unicode codepoints
- ✅ Scientific name structure validation
- ✅ Performance benchmarks (< 0.1ms avg)

## Future Considerations

1. **Rate Limiting**: Already implemented in API routes via `@upstash/ratelimit`
2. **Input Logging**: Use `sanitizeForLog()` for all user input logging
3. **Additional Validators**: Can add validators for other inputs (common names, descriptions) using the same patterns
4. **Fuzzing**: Consider adding fuzz testing with random Unicode input
5. **OWASP Testing**: Test with known ReDoS payloads from OWASP

## References

- [Unicode Normalization Forms](https://unicode.org/reports/tr15/)
- [Homograph Attacks](https://en.wikipedia.org/wiki/IDN_homograph_attack)
- [ReDoS Prevention](https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS)
- [Shannon Entropy](<https://en.wikipedia.org/wiki/Entropy_(information_theory)>)
- [Unicode Character Ranges](https://www.unicode.org/charts/)
- [OWASP Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
