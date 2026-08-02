import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Debounces a value - returns the value after it stops changing for `delay` ms
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const [search, setSearch] = useState('');
 *   const debouncedSearch = useDebounce(search, 300);
 *
 *   // Only run expensive operation when debounced value changes
 *   useEffect(() => {
 *     performSearch(debouncedSearch);
 *   }, [debouncedSearch]);
 *
 *   return <input value={search} onChange={e => setSearch(e.target.value)} />;
 * }
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up timeout to update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancel timeout if value changes before delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Alternative: Returns a debounced callback function.
 * Use when you want to debounce a function call, not a value.
 *
 * Three defects fixed here, all invisible because nothing imported this and
 * nothing tested it:
 *  - the pending timer lived in `useState`, so every invocation queued an
 *    extra render purely to store a timer id;
 *  - the returned function was rebuilt on every render, so passing it to a
 *    memoized child or an effect dependency array defeated the memoization;
 *  - the timer was never cleared on unmount, so a pending callback could fire
 *    against a torn-down component.
 */
export function useDebouncedCallback<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the latest callback without changing the debounced function's
  // identity, so callers can safely depend on it.
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}
