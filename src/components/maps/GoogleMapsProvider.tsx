"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

type GoogleMapsType = typeof globalThis.google;

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: string | null;
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

// Declare google on window
declare global {
  interface Window {
    initGoogleMaps?: () => void;
  }
}

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [googleInstance, setGoogleInstance] = useState<GoogleMapsType | null>(
    null
  );

  const initMaps = useCallback(() => {
    if (typeof globalThis.google !== "undefined") {
      setGoogleInstance(globalThis.google);
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_MAPS_API_KEY;

    if (!apiKey) {
      setLoadError("Maps API key not configured");
      return;
    }

    // Check if already loaded
    if (typeof globalThis.google !== "undefined") {
      setGoogleInstance(globalThis.google);
      setIsLoaded(true);
      return;
    }

    // Check if script is already in document
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    );
    if (existingScript) {
      // Wait for it to load
      existingScript.addEventListener("load", initMaps);
      return;
    }

    // Set up callback
    window.initGoogleMaps = initMaps;

    // Load script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      setLoadError("Failed to load Google Maps");
    };

    document.head.appendChild(script);

    return () => {
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
