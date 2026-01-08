# Known Build Issues

This document tracks pre-existing build errors that are **not related** to the virtualization implementation.

## Education Client Components (Pre-existing)

### Files Affected

- `src/app/[locale]/education/field-trip/FieldTripClient.tsx`
- `src/app/[locale]/education/scavenger-hunt/ScavengerHuntClient.tsx`

### Issues

1. **Missing `useMemo` import** (line 44 in FieldTripClient.tsx)

   ```typescript
   // ERROR: Cannot find name 'useMemo'
   const fieldTripStorage = useMemo(...)
   ```

   **Fix:** Add `useMemo` to React imports on line 3

2. **Undefined `createStorage` function** (line 46)

   ```typescript
   // ERROR: createStorage is not defined
   createStorage({...})
   ```

   **Fix:** Import or implement `createStorage` function

3. **Undefined `setStorageError` function** (line 50)

   ```typescript
   // ERROR: setStorageError is not defined
   setStorageError(...)
   ```

   **Fix:** Add state management for storage errors

4. **Undefined `storageError` variable** (line 309)

   ```typescript
   // ERROR: storageError is not defined
   {storageError && (...)}
   ```

   **Fix:** Add useState for storageError

5. **Undefined `fieldTripDataSchema`** (line 48)
   ```typescript
   // ERROR: fieldTripDataSchema is not defined
   schema: fieldTripDataSchema;
   ```
   **Fix:** Define or import the schema

### Similar Issues in ScavengerHuntClient.tsx

- Missing `useMemo` import
- Undefined `createStorage` function
- Undefined `setStorageError` function
- Undefined `storageError` variable
- Undefined `huntSessionSchema`

## Verification

The virtualization implementation does **NOT** introduce any new errors. This can be verified by:

1. Contentlayer builds successfully:

   ```bash
   npm run contentlayer  # ✅ Generated 216 documents
   ```

2. Next.js Turbopack compilation succeeds:

   ```
   ✓ Compiled successfully in 7.0s
   ```

3. Only TypeScript type-checking fails on pre-existing issues

## Recommendation

These education client files should be fixed in a separate PR as they appear to be incomplete implementations. The virtualization feature works correctly in:

- ✅ `TreeGallery` component (20+ images)
- ✅ `TreeGrid` component (30+ trees)
- ✅ `TreeExplorer` component (uses TreeGrid)
- ✅ All virtualization core components
