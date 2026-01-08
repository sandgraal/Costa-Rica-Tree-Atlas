# Scroll Lock Management

## Problem

Multiple modals/overlays need to prevent body scroll, but they can conflict if not coordinated.

### Issues with Direct DOM Manipulation

When multiple components independently manipulate `document.body.style.overflow`:

1. **Race conditions**: Last component to unmount restores scroll, even if others are still open
2. **No reference counting**: Components don't know if others also want scroll locked
3. **iOS Safari issues**: Requires special handling for iOS scroll prevention
4. **Layout shift**: Scrollbar disappearing causes content to jump
5. **State conflicts**: Components fight over the overflow state

## Solution

Use the `useScrollLock` hook which implements reference counting to coordinate multiple scroll locks.

## Usage

### Basic Usage

```tsx
import { useScrollLock } from "@/hooks/useScrollLock";

function Modal({ isOpen }) {
  useScrollLock(isOpen);

  if (!isOpen) return null;
  return <div>Modal content</div>;
}
```

### With Options

```tsx
// Disable on mobile (for native scroll behaviors)
useScrollLock(isOpen, { disableOnMobile: true });

// Custom mobile breakpoint
useScrollLock(isOpen, {
  disableOnMobile: true,
  mobileBreakpoint: 1024,
});
```

### Multiple Locks

The hook handles multiple locks automatically:

```tsx
function App() {
  return (
    <>
      <MobileNav /> {/* Can lock scroll */}
      <Modal /> {/* Can also lock scroll */}
      <Lightbox /> {/* Can also lock scroll */}
    </>
  );
}
```

Scroll unlocks only when ALL locks are released.

## How It Works

### Reference Counting

1. **First lock**: Saves original overflow, adds padding for scrollbar, locks scroll
2. **Additional locks**: Increments counter, doesn't change styles
3. **Unlock**: Decrements counter, restores styles only when counter reaches 0

### iOS Support

Includes special handling for iOS Safari:

- Fixes position to prevent scroll
- Saves and restores scroll position
- Prevents body scroll behind modal

### Layout Shift Prevention

- Measures scrollbar width
- Adds equivalent padding to body
- Prevents content jump when scrollbar disappears

## Implementation Details

### Module-Level State

The hook uses module-level variables to maintain state across all instances:

```typescript
let lockCount = 0; // Number of active locks
let originalOverflow: string | null = null; // Saved overflow value
let originalPaddingRight: string | null = null; // Saved padding value
```

### Cleanup

Each hook instance tracks whether it currently has a lock:

- On mount/active: Acquires lock
- On unmount/inactive: Releases lock
- Cleanup function ensures lock is always released

## API

### `useScrollLock(active, options)`

Hook to lock/unlock scroll when component mounts/unmounts or when active changes.

**Parameters:**

- `active` (boolean, default: `true`): Whether scroll should be locked
- `options` (object, optional):
  - `disableOnMobile` (boolean, default: `false`): Disable scroll lock on mobile
  - `mobileBreakpoint` (number, default: `768`): Custom breakpoint for mobile detection

**Example:**

```tsx
function Lightbox({ isOpen, onClose }) {
  useScrollLock(isOpen);

  return isOpen ? (
    <div className="fixed inset-0">
      <button onClick={onClose}>Close</button>
      {/* Lightbox content */}
    </div>
  ) : null;
}
```

### `scrollLock` (Imperative API)

For cases where hooks don't work (class components, vanilla JS).

**Methods:**

- `scrollLock.lock()`: Acquire a scroll lock
- `scrollLock.unlock()`: Release a scroll lock
- `scrollLock.getCount()`: Get current number of locks

**Example:**

```typescript
// Acquire lock
scrollLock.lock();

// Do something...

// Release lock
scrollLock.unlock();
```

⚠️ **Note**: Prefer using the hook when possible. The imperative API requires manual cleanup.

## Benefits

1. ✅ **No conflicts**: Multiple components can lock scroll safely
2. ✅ **Proper cleanup**: Scroll always unlocks when appropriate
3. ✅ **iOS support**: Actually works on iOS Safari
4. ✅ **No layout shift**: Compensates for scrollbar width
5. ✅ **Type-safe**: Full TypeScript support
6. ✅ **Testable**: Pure logic, easy to unit test
7. ✅ **Declarative**: React-friendly hook API

## Components Using Scroll Lock

- `src/components/MobileNav.tsx` - Mobile navigation menu
- `src/components/TreeGallery.tsx` - Image lightbox
- `src/components/mdx/index.tsx` - MDX image gallery lightbox

## Testing

Tests are located in `src/hooks/__tests__/useScrollLock.test.ts`.

Run tests:

```bash
npm test -- src/hooks/__tests__/useScrollLock.test.ts
```

## Migration from Direct DOM Manipulation

### Before

```tsx
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
  return () => {
    document.body.style.overflow = "";
  };
}, [isOpen]);
```

### After

```tsx
import { useScrollLock } from "@/hooks/useScrollLock";

useScrollLock(isOpen);
```

## Best Practices

1. **Always use the hook**: Don't manipulate `body.style.overflow` directly
2. **Pass active state**: Control when scroll is locked with the active parameter
3. **Consider mobile**: Use `disableOnMobile` option if native scroll is preferred
4. **Clean up properly**: The hook handles cleanup automatically on unmount

## Troubleshooting

### Scroll not locking on iOS

The hook includes iOS-specific fixes. Ensure you're testing on actual iOS devices, not just Safari on macOS.

### Content jumping when locking

This should be prevented automatically. If you see jumps:

1. Check if other code is also manipulating body styles
2. Verify scrollbar width calculation is working

### Multiple components conflicting

This shouldn't happen with the reference counting. If you see conflicts:

1. Check that all components use `useScrollLock` hook
2. Verify no components manipulate `body.style.overflow` directly
3. Check the lock count: `scrollLock.getCount()`

## Further Reading

- [MDN: overflow](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow)
- [iOS Safari scroll locking](https://stackoverflow.com/questions/41594997/ios-10-safari-prevent-scrolling-behind-a-fixed-overlay-and-maintain-scroll-posi)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
