/**
 * Rate limit configurations for different API endpoints
 */
export const RATE_LIMITS = {
  // AI identification - expensive API calls
  identify: {
    requests: 10,
    window: "1 m",
  },
  // Species lookup - moderate usage
  species: {
    requests: 60,
    window: "1 m",
  },
  // Image fetching - moderate usage
  images: {
    requests: 30,
    window: "1 m",
  },
  // Random species - light usage
  random: {
    requests: 100,
    window: "1 m",
  },
  // Default for other endpoints
  default: {
    requests: 100,
    window: "1 m",
  },
} as const;
