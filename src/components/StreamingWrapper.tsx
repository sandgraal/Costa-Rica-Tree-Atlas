"use client";

import { Suspense, useState, useEffect, type ReactNode } from "react";

interface StreamingWrapperProps {
  children: ReactNode;
  fallback: ReactNode;
  /** Optional delay before showing fallback (prevents flash) */
  delay?: number;
}

/**
 * Wrapper for streaming content with Suspense
 * Prevents loading flash for fast-loading content
 */
export function StreamingWrapper({
  children,
  fallback,
  delay = 0,
}: StreamingWrapperProps) {
  if (delay > 0) {
    return (
      <Suspense
        fallback={<DelayedFallback delay={delay}>{fallback}</DelayedFallback>}
      >
        {children}
      </Suspense>
    );
  }

  return <Suspense fallback={fallback}>{children}</Suspense>;
}

function DelayedFallback({
  children,
  delay,
}: {
  children: ReactNode;
  delay: number;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return show ? <>{children}</> : null;
}
