"use client";

import { useEffect } from "react";

/**
 * Registers the service worker that makes the game installable and playable
 * offline. Production only: in dev the build assets change on every edit, and
 * a cache-first worker would serve stale chunks over Fast Refresh.
 */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      // Failure here only costs offline support, so it stays quiet.
      void navigator.serviceWorker.register("/sw.js").catch(() => {});
    };

    // Wait for load so registration never competes with the first paint.
    if (document.readyState === "complete") {
      register();
      return;
    }
    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
