"use client";

import { useEffect } from "react";

/** Registers the offline-first service worker (production only). */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline caching is progressive enhancement; ignore failures.
    });
  }, []);

  return null;
}
