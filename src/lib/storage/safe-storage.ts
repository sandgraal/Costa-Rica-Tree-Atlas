import { z } from "zod";

export interface StorageOptions<T> {
  key: string;
  schema: z.ZodSchema<T>;
  version?: number; // For future migrations
  onError?: (error: Error) => void;
}

export class SafeStorage<T> {
  constructor(private options: StorageOptions<T>) {}

  /**
   * Get data from localStorage with validation
   * Returns null if data is missing, corrupted, or invalid
   */
  get(): T | null {
    if (typeof window === "undefined") return null;

    try {
      const raw = localStorage.getItem(this.options.key);
      if (!raw) return null;

      const parsed = JSON.parse(raw);

      // Validate with Zod
      const result = this.options.schema.safeParse(parsed);

      if (!result.success) {
        console.warn(
          `Invalid data in localStorage key "${this.options.key}":`,
          result.error
        );
        // Clear corrupted data
        this.clear();
        this.options.onError?.(
          new Error(`Invalid data structure: ${result.error.message}`)
        );
        return null;
      }

      return result.data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(
        `Failed to read localStorage key "${this.options.key}":`,
        err
      );
      // Clear corrupted data
      this.clear();
      this.options.onError?.(err);
      return null;
    }
  }

  /**
   * Set data in localStorage with validation
   * Returns true if successful, false if validation fails
   */
  set(data: T): boolean {
    if (typeof window === "undefined") return false;

    try {
      // Validate before saving
      const result = this.options.schema.safeParse(data);
      if (!result.success) {
        console.error(
          `Cannot save invalid data to "${this.options.key}":`,
          result.error
        );
        return false;
      }

      localStorage.setItem(this.options.key, JSON.stringify(data));
      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(
        `Failed to write localStorage key "${this.options.key}":`,
        err
      );
      this.options.onError?.(err);
      return false;
    }
  }

  /**
   * Clear data from localStorage
   */
  clear(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(this.options.key);
    } catch (error) {
      console.error(
        `Failed to clear localStorage key "${this.options.key}":`,
        error
      );
    }
  }

  /**
   * Check if data exists (doesn't validate)
   */
  exists(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(this.options.key) !== null;
  }
}

/**
 * Helper to create a SafeStorage instance
 */
export function createStorage<T>(options: StorageOptions<T>): SafeStorage<T> {
  return new SafeStorage(options);
}
