import { useEffect, useRef } from "react";

// Reference counter to track how many components want scroll locked
let lockCount = 0;
let originalOverflow: string | null = null;
let originalPaddingRight: string | null = null;

/**
 * Get scrollbar width to prevent layout shift
 */
function getScrollbarWidth(): number {
  if (typeof window === "undefined") return 0;

  const outer = document.createElement("div");
  outer.style.visibility = "hidden";
  outer.style.overflow = "scroll";
  document.body.appendChild(outer);

  const inner = document.createElement("div");
  outer.appendChild(inner);

  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  outer.parentNode?.removeChild(outer);

  return scrollbarWidth;
}

/**
 * Lock body scroll with proper cleanup and iOS support
 */
function lockScroll() {
  if (typeof window === "undefined") return;

  // Store original values on first lock
  if (lockCount === 0) {
    const scrollbarWidth = getScrollbarWidth();

    originalOverflow = document.body.style.overflow;
    originalPaddingRight = document.body.style.paddingRight;

    // Prevent layout shift by adding padding for scrollbar
    if (scrollbarWidth > 0) {
      const computedPadding = window.getComputedStyle(
        document.body
      ).paddingRight;
      const currentPadding = parseInt(computedPadding, 10) || 0;
      document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }

    // Lock scroll
    document.body.style.overflow = "hidden";

    // iOS fix: prevent body scroll when modal is open
    // Save scroll position to restore later
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.dataset.scrollY = String(scrollY);
  }

  lockCount++;
}

/**
 * Unlock body scroll only when all locks are released
 */
function unlockScroll() {
  if (typeof window === "undefined") return;

  lockCount = Math.max(0, lockCount - 1);

  // Only restore when no more locks
  if (lockCount === 0) {
    // Restore iOS scroll position
    const scrollY = document.body.dataset.scrollY;
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    delete document.body.dataset.scrollY;

    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY, 10));
    }

    // Restore original overflow and padding
    document.body.style.overflow = originalOverflow || "";
    document.body.style.paddingRight = originalPaddingRight || "";

    originalOverflow = null;
    originalPaddingRight = null;
  }
}

/**
 * Hook to lock/unlock scroll when component mounts/unmounts or when active changes
 *
 * @param active - Whether scroll should be locked
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * function Modal({ isOpen }) {
 *   useScrollLock(isOpen);
 *   return isOpen ? <div>Modal content</div> : null;
 * }
 * ```
 */
export function useScrollLock(
  active: boolean = true,
  options: {
    /**
     * Disable scroll lock on mobile (for native scroll behaviors)
     */
    disableOnMobile?: boolean;
    /**
     * Custom breakpoint for mobile detection (default: 768px)
     */
    mobileBreakpoint?: number;
  } = {}
) {
  const { disableOnMobile = false, mobileBreakpoint = 768 } = options;

  // Track if this instance currently has a lock
  const hasLockRef = useRef(false);

  useEffect(() => {
    // Check if should be disabled
    const isMobile =
      disableOnMobile &&
      typeof window !== "undefined" &&
      window.innerWidth < mobileBreakpoint;

    if (isMobile) return;

    // Lock or unlock based on active state
    if (active && !hasLockRef.current) {
      lockScroll();
      hasLockRef.current = true;
    } else if (!active && hasLockRef.current) {
      unlockScroll();
      hasLockRef.current = false;
    }

    // Cleanup: unlock on unmount if we have a lock
    return () => {
      if (hasLockRef.current) {
        unlockScroll();
        hasLockRef.current = false;
      }
    };
  }, [active, disableOnMobile, mobileBreakpoint]);
}

/**
 * Imperative API for cases where hooks don't work
 * Use hooks when possible!
 */
export const scrollLock = {
  lock: lockScroll,
  unlock: unlockScroll,
  getCount: () => lockCount,
};
