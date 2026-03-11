/**
 * Shared query/contract helpers used across UI surfaces.
 * Keep these functions pure so they are easy to regression-test.
 */

export function getLocaleSearchIndex<T>(
  payload: T[] | Record<string, T[]>,
  locale: string
): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Object.hasOwn(payload, locale)) {
    // Object.hasOwn guard above ensures locale is a safe own-property key.
    // eslint-disable-next-line security/detect-object-injection
    const localeResults = (payload as Record<string, T[]>)[locale];
    if (Array.isArray(localeResults)) {
      return localeResults;
    }
  }

  return [];
}

export function buildTreesProvinceHref(province?: string | null): string {
  if (!province) {
    return "/trees";
  }

  return `/trees?${new URLSearchParams({ province }).toString()}`;
}

export function buildCompareToolHref(species: string[]): string {
  return `/compare?trees=${species.map(encodeURIComponent).join(",")}`;
}
