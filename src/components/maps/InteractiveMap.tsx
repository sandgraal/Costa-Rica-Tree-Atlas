"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useGoogleMaps } from "./GoogleMapsProvider";
import type { Locale } from "@/types/tree";

// Costa Rica bounds and center
const COSTA_RICA_CENTER = { lat: 9.7489, lng: -83.7534 };
const COSTA_RICA_BOUNDS = {
  north: 11.2195,
  south: 8.0256,
  west: -85.95,
  east: -82.5528,
};

export interface MapMarker {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  subtitle?: string;
  icon?: string;
  color?: string;
  onClick?: () => void;
}

interface InteractiveMapProps {
  markers?: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  locale: Locale;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (position: { lat: number; lng: number }) => void;
  showUserLocation?: boolean;
  restrictToCR?: boolean;
}

export function InteractiveMap({
  markers = [],
  center = COSTA_RICA_CENTER,
  zoom = 8,
  className = "",
  locale,
  onMarkerClick,
  onMapClick,
  showUserLocation = false,
  restrictToCR = true,
}: InteractiveMapProps) {
  const { isLoaded, loadError, google } = useGoogleMaps();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const userMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null
  );
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !google || !mapRef.current || mapInstanceRef.current)
      return;

    const mapOptions: google.maps.MapOptions = {
      center,
      zoom,
      mapId: "costa-rica-tree-atlas",
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        position: google.maps.ControlPosition.TOP_RIGHT,
      },
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      gestureHandling: "cooperative",
      ...(restrictToCR && {
        restriction: {
          latLngBounds: COSTA_RICA_BOUNDS,
          strictBounds: false,
        },
      }),
    };

    const map = new google.maps.Map(mapRef.current, mapOptions);
    mapInstanceRef.current = map;

    // Handle map click
    if (onMapClick) {
      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        }
      });
    }
  }, [isLoaded, google, center, zoom, onMapClick, restrictToCR]);

  // Update markers
  useEffect(() => {
    if (!isLoaded || !google || !mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    markersRef.current = [];

    // Add new markers
    markers.forEach((markerData) => {
      const pinElement = document.createElement("div");
      pinElement.className = "tree-marker";
      
      // Create inner div safely without innerHTML to prevent XSS
      const innerDiv = document.createElement("div");
      innerDiv.className = "w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform";
      innerDiv.style.backgroundColor = markerData.color || "#2d5a27";
      // Use textContent for safe emoji/text insertion
      innerDiv.textContent = markerData.icon || "🌳";
      pinElement.appendChild(innerDiv);

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapInstanceRef.current,
        position: markerData.position,
        title: markerData.title,
        content: pinElement,
      });

      marker.addListener("click", () => {
        if (markerData.onClick) {
          markerData.onClick();
        }
        if (onMarkerClick) {
          onMarkerClick(markerData);
        }
      });

      markersRef.current.push(marker);
    });
  }, [isLoaded, google, markers, onMarkerClick]);

  // Get user location
  useEffect(() => {
    if (!showUserLocation || !isLoaded || !google || !mapInstanceRef.current)
      return;

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(userPos);

        // Add user marker safely without innerHTML
        if (userMarkerRef.current) {
          userMarkerRef.current.map = null;
        }

        const userPin = document.createElement("div");
        const outerCircle = document.createElement("div");
        outerCircle.className = "w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center";
        const innerCircle = document.createElement("div");
        innerCircle.className = "w-2 h-2 rounded-full bg-white animate-ping";
        outerCircle.appendChild(innerCircle);
        userPin.appendChild(outerCircle);

        userMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
          map: mapInstanceRef.current,
          position: userPos,
          title: locale === "es" ? "Tu ubicación" : "Your location",
          content: userPin,
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
      { enableHighAccuracy: true }
    );
  }, [showUserLocation, isLoaded, google, locale]);

  // Fly to user location
  const flyToUser = useCallback(() => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.panTo(userLocation);
      mapInstanceRef.current.setZoom(12);
    }
  }, [userLocation]);

  if (loadError) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-xl ${className}`}
      >
        <div className="text-center p-8">
          <span className="text-4xl mb-4 block">🗺️</span>
          <p className="text-muted-foreground">
            {locale === "es" ? "Error al cargar el mapa" : "Error loading map"}
          </p>
          <p className="text-sm text-muted-foreground mt-2">{loadError}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-xl animate-pulse ${className}`}
      >
        <div className="text-center p-8">
          <span className="text-4xl mb-4 block animate-bounce">🗺️</span>
          <p className="text-muted-foreground">
            {locale === "es" ? "Cargando mapa..." : "Loading map..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      <div ref={mapRef} className="w-full h-full min-h-[400px]" />

      {/* User location button */}
      {showUserLocation && userLocation && (
        <button
          onClick={flyToUser}
          className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          title={locale === "es" ? "Ir a mi ubicación" : "Go to my location"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export { COSTA_RICA_CENTER, COSTA_RICA_BOUNDS };
