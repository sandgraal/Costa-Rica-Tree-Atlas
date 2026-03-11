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

  const localeResults = Object.entries(payload).find(
    ([key]) => key === locale
  )?.[1];
  if (Array.isArray(localeResults)) {
    return localeResults;
  }

  return [];
}

export function buildTreesProvinceHref(province?: string | null): string {
  if (!province) {
    return "/trees";
  }

  return `/trees?province=${province}`;
}

export function buildCompareToolHref(species: string[]): string {
  return `/compare?trees=${species.join(",")}`;
}
