/**
 * Trusted proxy IP ranges for IP detection security
 *
 * This module validates that IPs come from trusted reverse proxies (Cloudflare, Vercel)
 * to prevent IP spoofing attacks via x-forwarded-for header manipulation.
 *
 * IP ranges should be updated periodically from official sources:
 * - Cloudflare: https://www.cloudflare.com/ips/
 * - Vercel: https://vercel.com/docs/edge-network/regions
 */

/**
 * Trusted proxy IP ranges
 *
 * These ranges are used to validate that x-forwarded-for headers
 * are actually coming from our trusted reverse proxy infrastructure.
 */
export const TRUSTED_PROXY_RANGES = {
  cloudflare_ipv4: [
    "173.245.48.0/20",
    "103.21.244.0/22",
    "103.22.200.0/22",
    "103.31.4.0/22",
    "141.101.64.0/18",
    "108.162.192.0/18",
    "190.93.240.0/20",
    "188.114.96.0/20",
    "197.234.240.0/22",
    "198.41.128.0/17",
    "162.158.0.0/15",
    "104.16.0.0/13",
    "104.24.0.0/14",
    "172.64.0.0/13",
    "131.0.72.0/22",
  ],
  cloudflare_ipv6: [
    "2400:cb00::/32",
    "2606:4700::/32",
    "2803:f800::/32",
    "2405:b500::/32",
    "2405:8100::/32",
    "2a06:98c0::/29",
    "2c0f:f248::/32",
  ],
  vercel_ipv4: [
    "76.76.21.0/24",
    // Add more Vercel IPs as needed
  ],
} as const;

/**
 * Check if an IPv4 address is within a CIDR range
 *
 * @param ip - IPv4 address to check (e.g., "192.168.1.1")
 * @param cidr - CIDR range (e.g., "192.168.1.0/24")
 * @returns true if IP is within the CIDR range
 */
function ipv4InRange(ip: string, cidr: string): boolean {
  const [range, bits] = cidr.split("/");
  const mask = -1 << (32 - parseInt(bits, 10));

  const ipNum = ip
    .split(".")
    .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0);
  const rangeNum = range
    .split(".")
    .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0);

  return (ipNum & mask) === (rangeNum & mask);
}

/**
 * Check if an IPv6 address is within a CIDR range
 *
 * This is a simplified implementation suitable for the trusted proxy ranges we use.
 * For production use with arbitrary IPv6 ranges, consider using a library like 'ipaddr.js'.
 *
 * @param ip - IPv6 address to check
 * @param cidr - CIDR range (e.g., "2400:cb00::/32")
 * @returns true if IP is within the CIDR range
 */
function ipv6InRange(ip: string, cidr: string): boolean {
  const [range, bits] = cidr.split("/");
  const prefixLength = parseInt(bits, 10);

  // Normalize both addresses by expanding them
  const normalizeIPv6 = (addr: string): string => {
    // Handle :: abbreviation
    if (addr.includes("::")) {
      const parts = addr.split("::");
      const leftParts = parts[0] ? parts[0].split(":") : [];
      const rightParts = parts[1] ? parts[1].split(":") : [];
      const missingParts = 8 - leftParts.length - rightParts.length;
      const middleParts = Array(missingParts).fill("0");
      const allParts = [...leftParts, ...middleParts, ...rightParts];
      return allParts.map((p) => p.padStart(4, "0")).join(":");
    }
    // Already full form, just pad each part
    return addr
      .split(":")
      .map((p) => p.padStart(4, "0"))
      .join(":");
  };

  const normalizedIP = normalizeIPv6(ip);
  const normalizedRange = normalizeIPv6(range);

  // Compare the prefix bits
  const bitsPerGroup = 16;
  const groupsToCompare = Math.floor(prefixLength / bitsPerGroup);
  const remainingBits = prefixLength % bitsPerGroup;

  // Compare complete groups
  const ipGroups = normalizedIP.split(":");
  const rangeGroups = normalizedRange.split(":");

  for (let i = 0; i < groupsToCompare; i++) {
    if (ipGroups[i] !== rangeGroups[i]) {
      return false;
    }
  }

  // Compare remaining bits in the partial group
  if (remainingBits > 0) {
    const ipGroupVal = parseInt(ipGroups[groupsToCompare], 16);
    const rangeGroupVal = parseInt(rangeGroups[groupsToCompare], 16);
    const mask = (0xffff << (bitsPerGroup - remainingBits)) & 0xffff;

    if ((ipGroupVal & mask) !== (rangeGroupVal & mask)) {
      return false;
    }
  }

  return true;
}

/**
 * Check if an IP address belongs to a trusted proxy
 *
 * This function validates that an IP is within the known ranges of our trusted
 * reverse proxy infrastructure (Cloudflare, Vercel). This is used to validate
 * x-forwarded-for headers and prevent IP spoofing.
 *
 * @param ip - IP address to check (IPv4 or IPv6)
 * @returns true if the IP is from a trusted proxy
 *
 * @example
 * ```typescript
 * isTrustedProxy("104.16.0.1")  // true - Cloudflare IP
 * isTrustedProxy("192.168.1.1") // false - private IP
 * isTrustedProxy("2400:cb00::1") // true - Cloudflare IPv6
 * ```
 */
export function isTrustedProxy(ip: string): boolean {
  if (ip.includes(":")) {
    // IPv6
    return TRUSTED_PROXY_RANGES.cloudflare_ipv6.some((range) =>
      ipv6InRange(ip, range)
    );
  } else {
    // IPv4
    return [
      ...TRUSTED_PROXY_RANGES.cloudflare_ipv4,
      ...TRUSTED_PROXY_RANGES.vercel_ipv4,
    ].some((range) => ipv4InRange(ip, range));
  }
}
