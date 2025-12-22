"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Delay registration to not block initial page load
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (
                    newWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    // New service worker available
                    // Dispatch event so app can show update notification if desired
                    window.dispatchEvent(new CustomEvent("swUpdate"));
                  }
                });
              }
            });
          })
          .catch((error) => {
            // Log registration failures for debugging but don't break the app
            // This can happen when running without HTTPS in dev mode
            if (process.env.NODE_ENV === "development") {
              console.debug(
                "Service worker registration skipped:",
                error.message
              );
            }
          });
      });
    }
  }, []);

  return null;
}
