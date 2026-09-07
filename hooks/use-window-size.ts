"use client";

import { useEffect, useState } from "react";

/**
 * Viewport size for <Confetti />, which needs explicit pixel dimensions.
 * Starts at 0x0 so the server render and first client render agree.
 */
export function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
}
