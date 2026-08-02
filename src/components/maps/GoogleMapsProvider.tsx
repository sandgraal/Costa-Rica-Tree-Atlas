/// <reference types="google.maps" />
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

// `google` is declared as a global namespace by @types/google.maps. We
// reference the global namespace directly via `typeof google` rather than
// `typeof globalThis.google` — the latter trips Next.js's strict
// type-check at build time ("type 'typeof globalThis' has no index
// signature"), even though tsc --noEmit accepts it locally.
type GoogleMapsType = typeof google;

/**
 * Why a code rather than a message: `loadError` was a raw English string
 * ("Maps API key not configured" / "Failed to load Google Maps") rendered
 * directly beneath a localized label in InteractiveMap, so Spanish users saw
 * "Error al cargar el mapa" followed by English. The provider reports what
 * happened; the consumer decides how to say it.
 */
export type GoogleMapsLoadError = "missingApiKey" | "loadFailed" | "timeout";

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: GoogleMapsLoadError | null;
  google: GoogleMapsType | null;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  isLoaded: false,
  loadError: null,
  google: null,
});

export function useGoogleMaps() {
  return useContext(GoogleMapsContext);
}

interface GoogleMapsProviderProps {
  children: ReactNode;
}

// Declare initGoogleMaps callback hook on the Window interface so the
// Google Maps API loader script can find it.
declare global {
  interface Window {
    initGoogleMaps?: () => void;
  }
}

/** Give up waiting for the Maps namespace after this long. */
const LOAD_TIMEOUT_MS = 15_000;

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<GoogleMapsLoadError | null>(null);
  const [googleInstance, setGoogleInstance] = useState<GoogleMapsType | null>(
    null
  );

  const initMaps = useCallback(() => {
    // `window.google` can exist before `google.maps` is populated, so check the
    // namespace we actually use rather than just the global.
    if (typeof google !== "undefined" && google.maps) {
      setGoogleInstance(google);
      setIsLoaded(true);
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_MAPS_API_KEY;

    if (!apiKey) {
      setLoadError("missingApiKey");
      return;
    }

    // Already loaded (e.g. a second provider mounted on the same page).
    if (initMaps()) return;

    // A script tag already exists.
    //
    // Previously this attached a `load` listener and returned. If the script had
    // ALREADY finished loading, `load` never fires again: `isLoaded` stayed
    // false, `loadError` stayed null, and InteractiveMap rendered its loading
    // pulse forever with nothing to indicate anything was wrong. We now poll
    // briefly for the namespace and give up with an explicit timeout.
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    );

    let pollId: ReturnType<typeof setInterval> | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const stopWaiting = () => {
      if (pollId !== undefined) clearInterval(pollId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };

    const waitForNamespace = () => {
      pollId = setInterval(() => {
        if (initMaps()) stopWaiting();
      }, 100);
      timeoutId = setTimeout(() => {
        stopWaiting();
        if (!initMaps()) setLoadError("timeout");
      }, LOAD_TIMEOUT_MS);
    };

    if (existingScript) {
      waitForNamespace();
      return stopWaiting;
    }

    // Set up callback
    window.initGoogleMaps = initMaps;

    // Load script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      stopWaiting();
      setLoadError("loadFailed");
    };

    document.head.appendChild(script);
    waitForNamespace();

    return () => {
      stopWaiting();
      delete window.initGoogleMaps;
    };
  }, [initMaps]);

  return (
    <GoogleMapsContext.Provider
      value={{ isLoaded, loadError, google: googleInstance }}
    >
      {children}
    </GoogleMapsContext.Provider>
  );
}
