/**
 * Rate limit configurations for different API endpoints
 * All limits are applied per IP address
 */
export const RATE_LIMITS = {
  /**
   * AI image identification endpoint
   * Restricted due to external paid API usage (Plant.id)
   */
  identify: {
    requests: 10,
    window: "1 h",
    description: "AI image identification (uses external paid API)",
  },
  /**
   * Species biodiversity data fetching from iNaturalist
   * Moderate limit to prevent API abuse while allowing reasonable usage
   */
  species: {
    requests: 60,
    window: "1 m",
    description: "Species biodiversity data fetching",
  },
  /**
   * iNaturalist image fetching
   * Moderate limit to balance bandwidth and user experience
   */
  images: {
    requests: 30,
    window: "1 m",
    description: "iNaturalist image fetching",
  },
  /**
   * Random tree selection endpoint
   * Higher limit for light operations
   */
  random: {
    requests: 100,
    window: "1 m",
    description: "Random tree selection",
  },
  /**
   * Default rate limit for general API endpoints
   * Applied to endpoints without specific rate limits
   */
  default: {
    requests: 100,
    window: "1 m",
    description: "General API endpoints",
  },
  /**
   * Admin authentication attempts
   * Strict limit to prevent brute-force attacks
   */
  admin: {
    requests: 5,
    window: "15 m",
    description: "Admin authentication attempts (anti-brute-force)",
  },
} as const;
