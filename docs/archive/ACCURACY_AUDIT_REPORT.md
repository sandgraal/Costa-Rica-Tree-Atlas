# 🔬 Costa Rica Tree Atlas - Scientific Accuracy Audit Report

**Audit Date:** December 21, 2025
**Corrections Applied:** December 21, 2025
**Auditor:** Deep Dive Accuracy Review  
**Scope:** 107 tree species in English and Spanish content files  
**Purpose:** Ensure accuracy for educational and scientific reference use

---

## ✅ Status: ALL CRITICAL ISSUES CORRECTED

All critical accuracy issues identified in this audit have been corrected in both English and Spanish versions of the affected files.

---

## Executive Summary

The Costa Rica Tree Atlas is **well-researched** with solid taxonomic foundations. This audit identified critical errors that have now been **corrected**.

### Key Statistics

| Category               | Issues Found | Severity  |
| ---------------------- | ------------ | --------- |
| Conservation Status    | 3 incorrect  | 🔴 HIGH   |
| Native/Introduced Tags | 2-3 errors   | 🔴 HIGH   |
| Taxonomic Names        | 2-3 outdated | 🟡 MEDIUM |
| Physical Descriptions  | 1 inflated   | 🟡 MEDIUM |
| References Coverage    | Good         | ✅        |

---

## 🔴 CRITICAL ISSUES - Must Fix Immediately

### 1. Conservation Status Errors (IUCN Red List)

The following species have **outdated or incorrect** IUCN conservation statuses:

| Species                   | Common Name    | Current Website | Correct Status                 | Assessment Year |
| ------------------------- | -------------- | --------------- | ------------------------------ | --------------- |
| **Dalbergia retusa**      | Cocobolo       | VU (Vulnerable) | **CR (Critically Endangered)** | 2019            |
| **Swietenia macrophylla** | Caoba/Mahogany | VU (Vulnerable) | **EN (Endangered)**            | 2023            |
| **Dipteryx panamensis**   | Almendro       | VU (Vulnerable) | **LC (Least Concern)**         | 2020            |

**Action Required:**

- `cocobolo.mdx`: Update `conservationStatus: "VU"` → `conservationStatus: "CR"`
- `caoba.mdx`: Update `conservationStatus: "VU"` → `conservationStatus: "EN"`
- `almendro.mdx`: Update `conservationStatus: "VU"` → `conservationStatus: "LC"`

> ⚠️ **Note on Almendro:** While IUCN global status is LC, the species may have regional/national protected status in Costa Rica due to importance for Great Green Macaw. Consider adding clarification.

---

### 2. Native/Introduced Classification Errors

| Species               | Common Name       | Current Tag  | Correct Tag      | Evidence                             |
| --------------------- | ----------------- | ------------ | ---------------- | ------------------------------------ |
| **Tamarindus indica** | Tamarindo         | `native`     | **`introduced`** | African origin stated in description |
| **Manilkara zapota**  | Níspero/Sapodilla | `introduced` | **`native`**     | Native to Mexico/Central America     |

**Files to Correct:**

**tamarindo.mdx (EN and ES):**

```yaml
# Change this line:
tags:
  - "native"   # ❌ WRONG
# To:
tags:
  - "introduced"   # ✅ CORRECT
```

**nispero.mdx (EN and ES):**

```yaml
# Change this line:
tags:
  - "introduced"   # ❌ WRONG
# To:
tags:
  - "native"   # ✅ CORRECT
```

---

### 3. Cativo Conservation Status Contradiction

In `cativo.mdx`:

- **Frontmatter:** `conservationStatus: "VU"`
- **Body Text:** States "globally assessed as Least Concern by IUCN"

**Resolution:** The body text is correct (IUCN global status is LC as of 2021). The frontmatter "VU" likely refers to Costa Rican national status.

**Recommended Fix:**

1. Either change frontmatter to `conservationStatus: "LC"` (global status)
2. OR add clarification text noting the difference between global (LC) and national (protected) status

---

## 🟡 MEDIUM PRIORITY ISSUES

### 4. Outdated Taxonomic Names

| Current Name            | Updated Name                 | Notes                                 |
| ----------------------- | ---------------------------- | ------------------------------------- |
| _Tabebuia rosea_        | _Handroanthus roseus_        | Some authorities now use updated name |
| _Tabebuia impetiginosa_ | _Handroanthus impetiginosus_ | Per taxonomic revisions               |
| _Dipteryx panamensis_   | _Dipteryx oleifera_          | Accepted name per IUCN 2020           |

**Recommendation:** These are **acceptable** as _Tabebuia_ names remain in common use. However, for scientific rigor:

- Add taxonomic notes mentioning synonyms
- Consider using updated _Handroanthus_ names with _Tabebuia_ noted as synonym

---

### 5. Height Overestimate - Mango

| Species            | Current Claim | Accurate Range | Discrepancy       |
| ------------------ | ------------- | -------------- | ----------------- |
| _Mangifera indica_ | 20-45 meters  | 10-30 meters   | ~50% overestimate |

**File:** `mango.mdx`

```yaml
# Current:
maxHeight: "20-45 meters"
# Should be:
maxHeight: "15-30 meters"
```

---

## ✅ VERIFIED ACCURATE

The following key data points were verified as **correct**:

### Conservation Statuses (Correct)

- Guanacaste (_Enterolobium cyclocarpum_): LC ✅
- Ceiba (_Ceiba pentandra_): LC ✅
- Ciprecillo (_Podocarpus costaricensis_): CR ✅
- Teak (_Tectona grandis_): EN (wild) ✅

### Family Assignments (APG IV Compliant)

- Ceiba: Malvaceae ✅ (formerly Bombacaceae)
- Balsa: Malvaceae ✅ (formerly Bombacaceae)
- Guarumo: Urticaceae ✅ (formerly Cecropiaceae)
- Cacao: Malvaceae ✅ (correctly updated)

### Native/Introduced Tags (Verified Correct)

- Mango: `introduced` ✅
- Teak: `introduced` ✅
- Coconut: `introduced` ✅
- Cashew (Marañón): `introduced` ✅
- Cenízaro: `native` ✅
- Cacao: `native` ✅ (Mesoamerican domesticate)
- Papaya: `native` ✅ (Central American origin)
- Avocado: `native` ✅ (Mesoamerican origin)

---

## 📋 Complete Correction Checklist

### ✅ Corrections Applied (December 21, 2024)

- [x] **cocobolo.mdx** (EN + ES): Changed `conservationStatus` from VU → CR ✅
- [x] **caoba.mdx** (EN + ES): Changed `conservationStatus` from VU → EN ✅
- [x] **almendro.mdx** (EN + ES): Changed `conservationStatus` from VU → LC (added note about national importance) ✅
- [x] **tamarindo.mdx** (EN + ES): Changed tag from `native` → `introduced` ✅
- [x] **nispero.mdx** (EN + ES): Changed tag from `introduced` → `native` ✅
- [x] **cativo.mdx** (EN + ES): Updated conservation status to LC (global status) ✅
- [x] **mango.mdx** (EN + ES): Changed `maxHeight` from "20-45 meters" → "15-30 meters" ✅
- [x] Updated all body text references to conservation statuses ✅
- [x] Updated tags arrays to match corrected statuses ✅

### Recommended Enhancements

- [ ] Add IUCN assessment years to conservation status displays
- [ ] Consider adding taxonomic synonyms for recently-reclassified species
- [ ] Distinguish global vs. national conservation status where applicable
- [ ] Update _Dipteryx panamensis_ to _Dipteryx oleifera_ (current accepted name)
- [ ] Review Tabebuia/Handroanthus nomenclature consistency

---

## 📚 Recommended Verification Sources

For ongoing accuracy maintenance, cross-reference with:

1. **IUCN Red List** - https://www.iucnredlist.org/
   - Conservation status (update annually)
2. **Plants of the World Online (POWO)** - https://powo.science.kew.org/
   - Current accepted scientific names
3. **TROPICOS** - https://www.tropicos.org/
   - Taxonomic nomenclature and synonyms
4. **Flora of Costa Rica (Manual de Plantas de Costa Rica)**
   - Regional native/introduced status
5. **iNaturalist** - https://www.inaturalist.org/
   - Distribution verification
6. **CITES Species Database** - https://speciesplus.net/
   - Trade regulation status

---

## Severity Ratings Explained

| Rating    | Meaning               | Impact                            |
| --------- | --------------------- | --------------------------------- |
| 🔴 HIGH   | Factually incorrect   | Undermines scientific credibility |
| 🟡 MEDIUM | Outdated or imprecise | May cause confusion               |
| 🟢 LOW    | Minor enhancement     | Would improve quality             |

---

## Conclusion

The Costa Rica Tree Atlas contains **valuable, well-researched content** with strong foundational data. The issues identified are **fixable** and mostly involve outdated conservation assessments and a few classification errors.

**After corrections are made**, the Atlas will be suitable for:

- Educational reference
- Scientific citation (with standard verification)
- Conservation awareness
- Public outreach

**Recommended Review Cycle:** Annual review of IUCN conservation statuses for all threatened species (VU, EN, CR).

---

_This audit was conducted by systematically reviewing content files, cross-referencing IUCN Red List data, verifying taxonomic nomenclature against current botanical databases, and checking native/introduced classifications against authoritative sources._
