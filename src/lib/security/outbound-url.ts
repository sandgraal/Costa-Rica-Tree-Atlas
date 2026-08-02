/**
 * Outbound URL guard for server-side fetches (SSRF protection).
 *
 * The image-proposal apply flow downloads a URL that arrives in a request body.
 * Without a guard, an admin clicking "apply" makes the server fetch whatever the
 * proposal author chose — including cloud metadata endpoints (169.254.169.254),
 * localhost admin panels, and private-network hosts.
 *
 * The allowlist below mirrors `images.remotePatterns` in `next.config.ts`: if a
 * host is not trusted enough to render an image from, it is not trusted enough
 * to fetch server-side either.
 */

/** Hosts we will fetch images from. Keep in sync with next.config.ts. */
export const ALLOWED_IMAGE_HOSTS: readonly string[] = [
  "inaturalist-open-data.s3.amazonaws.com",
  "static.inaturalist.org",
  "api.gbif.org",
  "images.unsplash.com",
  "res.cloudinary.com",
];

/**
 * Literal IP hosts are always rejected — they bypass the hostname allowlist.
 *
 * Written without a regex on purpose: the equivalent pattern trips
 * `security/detect-unsafe-regex`, and character checks are clearer here anyway.
 */
function isIpLiteral(hostname: string): boolean {
  // Bracketed IPv6, e.g. [::1]
  if (hostname.startsWith("[") || hostname.includes(":")) return true;

  // Dotted-quad IPv4
  const octets = hostname.split(".");
  if (octets.length !== 4) return false;
  return octets.every(
    (octet) =>
      octet.length > 0 &&
      octet.length <= 3 &&
      [...octet].every((char) => char >= "0" && char <= "9")
  );
}

export class BlockedUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlockedUrlError";
  }
}

/**
 * Throw unless `rawUrl` is an HTTPS URL on an allowlisted host.
 *
 * Must be called for every hop of a redirect chain, not just the initial URL —
 * an allowlisted host can still redirect to an internal address.
 *
 * @returns the parsed, validated URL
 */
export function assertAllowedImageUrl(rawUrl: string): URL {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new BlockedUrlError("Image URL is not a valid absolute URL.");
  }

  if (url.protocol !== "https:") {
    throw new BlockedUrlError(
      `Image URL must use https (got "${url.protocol}").`
    );
  }

  if (isIpLiteral(url.hostname)) {
    throw new BlockedUrlError("Image URL must use a hostname, not an IP.");
  }

  if (!ALLOWED_IMAGE_HOSTS.includes(url.hostname.toLowerCase())) {
    throw new BlockedUrlError(
      `Image host "${url.hostname}" is not on the allowlist.`
    );
  }

  return url;
}

/** Non-throwing variant, for validation paths that report rather than abort. */
export function isAllowedImageUrl(rawUrl: string): boolean {
  try {
    assertAllowedImageUrl(rawUrl);
    return true;
  } catch {
    return false;
  }
}
