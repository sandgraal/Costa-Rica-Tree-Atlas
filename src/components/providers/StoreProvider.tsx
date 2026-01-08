"use client";

import { type ReactNode } from "react";

interface StoreProviderProps {
  children: ReactNode;
}

/**
 * Unified store provider
 * Theme synchronization is now handled by the ThemeSync component
 */
export function StoreProvider({ children }: StoreProviderProps) {
  return <>{children}</>;
}
