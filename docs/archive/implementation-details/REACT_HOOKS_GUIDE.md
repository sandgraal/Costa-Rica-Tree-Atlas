# React Hooks Best Practices

**Last Updated:** 2026-01-12  
**Status:** ✅ Active - General React Hooks guidance for the project

## Overview

This guide documents best practices for using React Hooks in the Costa Rica Tree Atlas project, with a focus on `useEffect` dependencies and common patterns.

## useEffect Dependencies

### ✅ DO: Include all dependencies

Always include all values from the component scope that are used inside the effect:

```tsx
useEffect(() => {
  if (user && data) {
    processData(user, data);
  }
}, [user, data]); // All values from scope included
```

### ❌ DON'T: Disable exhaustive-deps

Never use eslint-disable comments to suppress the exhaustive-deps rule:

```tsx
// ❌ BAD - Will use stale values!
useEffect(() => {
  if (user && data) {
    processData(user, data);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [data]); // Missing user - will use stale value!
```

**Why it's bad:**

- Creates stale closure bugs
- Effect won't run when it should
- Hard to debug runtime issues
- Violates React's rules

## Common Patterns and Solutions

### Pattern 1: Use functional updates to avoid dependencies

When updating state based on previous state, use the functional update form:

```tsx
// ❌ Instead of:
useEffect(() => {
  setCount(count + 1);
}, [count]); // Runs every time count changes

// ✅ Do:
useEffect(() => {
  setCount((c) => c + 1);
}, []); // Runs once
```

### Pattern 2: Use refs for event listeners

Use refs for event listeners or intervals that need the latest state:

```tsx
const latestCallback = useRef(callback);

// Keep ref in sync with callback
useEffect(() => {
  latestCallback.current = callback;
}, [callback]);

// Event listener doesn't need to be re-added
useEffect(() => {
  const interval = setInterval(() => {
    latestCallback.current(); // Always uses latest
  }, 1000);
  return () => clearInterval(interval);
}, []); // Empty deps OK - interval doesn't need recreation
```

### Pattern 3: Split complex effects

Instead of one effect with many dependencies, split into focused effects:

```tsx
// ❌ Instead of one effect with many deps:
useEffect(() => {
  updateA();
  updateB();
  updateC();
}, [depA, depB, depC, depD, depE]);

// ✅ Split into focused effects:
useEffect(() => {
  updateA();
}, [depA, depB]);

useEffect(() => {
  updateB();
}, [depC]);

useEffect(() => {
  updateC();
}, [depD, depE]);
```

### Pattern 4: Avoid object/array recreations

Objects and arrays created inline will trigger the effect on every render:

```tsx
// ❌ BAD - config is a new object every render
const config = { api: apiUrl, token: token };
useEffect(() => {
  doSomething(config);
}, [config]); // Runs every render

// ✅ GOOD - Use useMemo
const config = useMemo(
  () => ({
    api: apiUrl,
    token: token,
  }),
  [apiUrl, token]
);

useEffect(() => {
  doSomething(config);
}, [config]); // Only runs when apiUrl or token changes

// ✅ ALTERNATIVE - Depend on primitives directly
useEffect(() => {
  doSomething({ api: apiUrl, token: token });
}, [apiUrl, token]);
```

### Pattern 5: Memoize functions with useCallback

Functions recreated on every render will cause effects to re-run:

```tsx
// ❌ BAD - handleData is recreated every render
const handleData = (data) => {
  // ... logic
};

useEffect(() => {
  handleData(data);
}, [handleData, data]); // Runs every render

// ✅ GOOD - Memoize with useCallback
const handleData = useCallback(
  (data) => {
    // ... logic
  },
  [
    /* deps */
  ]
);

useEffect(() => {
  handleData(data);
}, [handleData, data]); // Now handleData is stable
```

## Special Cases

### Using optional chaining for dependencies

When a value might be undefined, use optional chaining in the dependency array:

```tsx
useEffect(() => {
  if (!studentInfo?.name) return;

  // Do something with studentInfo.name
  updateStudent(studentInfo.name);
}, [studentInfo?.name]); // Only re-run when name changes
```

This is better than including the entire object which might cause unnecessary re-renders.

### Cleanup functions

Always clean up side effects in the return function:

```tsx
useEffect(() => {
  // Setup
  const subscription = api.subscribe(data);
  document.addEventListener("keydown", handleKeyDown);
  const interval = setInterval(tick, 1000);

  // Cleanup
  return () => {
    subscription.unsubscribe();
    document.removeEventListener("keydown", handleKeyDown);
    clearInterval(interval);
  };
}, [dependencies]);
```

### Conditional effects

If you need conditional logic, do it inside the effect:

```tsx
// ✅ GOOD
useEffect(() => {
  if (!shouldRun) return;

  doSomething();
}, [shouldRun, ...otherDeps]);

// ❌ BAD - Effect is still declared and checked
if (shouldRun) {
  useEffect(() => {
    doSomething();
  }, [...otherDeps]);
}
```

## Testing Strategy

When fixing or writing effects, verify:

1. ✅ Effect runs when it should
2. ✅ Effect doesn't run when it shouldn't
3. ✅ No infinite loops (especially with object/array deps)
4. ✅ Cleanup functions are called properly
5. ✅ No stale closure bugs

## Common Mistakes to Avoid

### Mistake 1: Using .length for array dependencies

```tsx
// ❌ BAD - Won't detect changes to array contents
useEffect(() => {
  processItems(items);
}, [items.length]);

// ✅ GOOD - Use the array itself
useEffect(() => {
  processItems(items);
}, [items]);
```

### Mistake 2: Missing stable references

```tsx
// ❌ BAD - onSuccess is not stable
function MyComponent({ onSuccess }) {
  useEffect(() => {
    doSomething().then(onSuccess);
  }, [onSuccess]); // Will run every time parent re-renders
}

// ✅ GOOD - Parent wraps in useCallback
function ParentComponent() {
  const handleSuccess = useCallback(() => {
    // handle success
  }, []);

  return <MyComponent onSuccess={handleSuccess} />;
}
```

### Mistake 3: Reading props/state in event handlers without dependencies

```tsx
// ❌ BAD - handleClick reads stale value
useEffect(() => {
  const handleClick = () => {
    if (isEnabled) {
      // isEnabled not in deps
      doSomething();
    }
  };

  button.addEventListener("click", handleClick);
  return () => button.removeEventListener("click", handleClick);
}, []); // Missing isEnabled

// ✅ GOOD - Use ref pattern
const isEnabledRef = useRef(isEnabled);
useEffect(() => {
  isEnabledRef.current = isEnabled;
}, [isEnabled]);

useEffect(() => {
  const handleClick = () => {
    if (isEnabledRef.current) {
      doSomething();
    }
  };

  button.addEventListener("click", handleClick);
  return () => button.removeEventListener("click", handleClick);
}, []); // Correct - listener doesn't need recreation
```

## When to Use Each Hook

- **useEffect**: Side effects, subscriptions, data fetching, DOM manipulation
- **useLayoutEffect**: DOM measurements, synchronous DOM updates before paint
- **useMemo**: Expensive calculations, preventing object recreations
- **useCallback**: Memoizing functions, preventing effect re-runs
- **useRef**: Mutable values that don't trigger re-renders, DOM references

## Resources

- [React Hooks Documentation](https://react.dev/reference/react)
- [Rules of Hooks](https://react.dev/reference/rules)
- [A Complete Guide to useEffect](https://overreacted.io/a-complete-guide-to-useeffect/)

## Project-Specific Patterns

### LocalStorage sync pattern

When syncing state with localStorage, use functional updates:

```tsx
useEffect(() => {
  if (!key) return;

  setState((prev) => {
    const updated = { ...prev, ...changes };
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  });
}, [key, changes]);
```

### Classroom student updates (see ClassroomClient.tsx)

Example of the functional update pattern for complex state:

```tsx
useEffect(() => {
  if (!studentInfo?.name) return;

  setClassroom((prev) => {
    if (!prev) return prev;

    const updatedStudents = prev.students.map((s) =>
      s.name === studentInfo.name
        ? {
            ...s,
            points: totalPoints,
            lessonsCompleted: completedLessons,
            badges: earnedBadgeIcons,
            lastActive: new Date().toISOString(),
          }
        : s
    );

    const updatedClassroom = { ...prev, students: updatedStudents };
    localStorage.setItem(
      CLASSROOM_STORAGE_KEY,
      JSON.stringify(updatedClassroom)
    );
    return updatedClassroom;
  });
}, [studentInfo?.name, totalPoints, completedLessons, earnedBadgeIcons]);
```

This pattern:

- Uses functional update to avoid `classroom` in dependencies
- Uses optional chaining for `studentInfo?.name`
- Includes all primitive dependencies
- Includes the full `earnedBadgeIcons` array (not `.length`)
