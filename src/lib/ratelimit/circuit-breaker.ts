/**
 * Circuit breaker for Redis rate limiting
 * Prevents cascade failures when Redis is down
 */
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: "closed" | "open" | "half-open" = "closed";

  constructor(
    private failureThreshold = 5,
    private timeout = 60000, // 1 minute
    private halfOpenAttempts = 3
  ) {}

  async execute<T>(fn: () => Promise<T>, fallback: () => T): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = "half-open";
      } else {
        console.warn("Circuit breaker OPEN - using fallback");
        return fallback();
      }
    }

    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Redis timeout")), 5000)
        ),
      ]);

      if (this.state === "half-open") {
        this.state = "closed";
        this.failureCount = 0;
      }

      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.failureThreshold) {
        this.state = "open";
        console.error(
          `Circuit breaker tripped after ${this.failureCount} failures`
        );
      }

      console.warn("Rate limit check failed, using fallback", error);
      return fallback();
    }
  }
}

/**
 * In-memory fallback rate limiter with LRU eviction
 * Used when Redis is unavailable
 */
export class InMemoryRateLimiter {
  private cache = new Map<string, { count: number; resetAt: number }>();
  private maxSize = 10000;

  check(
    identifier: string,
    limit: number,
    windowMs: number
  ): {
    success: boolean;
    remaining: number;
    reset: number;
  } {
    this.evictOld();

    const now = Date.now();
    const record = this.cache.get(identifier);

    if (!record || now > record.resetAt) {
      this.cache.set(identifier, { count: 1, resetAt: now + windowMs });
      return { success: true, remaining: limit - 1, reset: now + windowMs };
    }

    if (record.count >= limit) {
      return { success: false, remaining: 0, reset: record.resetAt };
    }

    record.count++;
    return {
      success: true,
      remaining: limit - record.count,
      reset: record.resetAt,
    };
  }

  private evictOld() {
    if (this.cache.size < this.maxSize) return;

    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    for (const [key, value] of entries) {
      if (now > value.resetAt) {
        this.cache.delete(key);
      }
    }

    // If still over limit, delete 10% oldest entries
    if (this.cache.size >= this.maxSize) {
      const toDelete = Math.floor(this.maxSize * 0.1);
      let deleted = 0;
      const keys = Array.from(this.cache.keys());
      for (const key of keys) {
        this.cache.delete(key);
        if (++deleted >= toDelete) break;
      }
    }
  }
}
