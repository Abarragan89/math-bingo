"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { animate, useReducedMotion } from "motion/react";

import { MAX_NUMBER, MIN_NUMBER } from "@/lib/bingo";
import { cn } from "@/lib/utils";

/** Reel window height, and the height of one number. Must stay in sync with CSS. */
const ITEM_HEIGHT = 112;
/** How many times 1..12 is repeated down the strip. */
const COPIES = 8;

const NUMBERS = Array.from(
  { length: MAX_NUMBER - MIN_NUMBER + 1 },
  (_, i) => MIN_NUMBER + i
);
const STRIP = Array.from({ length: COPIES }, () => NUMBERS).flat();

/** Offset that puts `value` in view within the given copy of the strip. */
function offsetFor(value: number, copy: number) {
  return -((copy * NUMBERS.length + (value - MIN_NUMBER)) * ITEM_HEIGHT);
}

type SlotReelProps = {
  /** The number this reel should be showing once it settles. */
  value: number;
  /** Changes on every spin; that change is what starts the reel moving. */
  spinToken: number;
  /** Stagger, so the two reels don't stop together. */
  delayMs?: number;
  durationMs: number;
  label: string;
};

export function SlotReel({
  value,
  spinToken,
  delayMs = 0,
  durationMs,
  label,
}: SlotReelProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const mountValue = useRef(value);

  // Seed the resting position once. After this, motion owns the transform and
  // React must never write to it, or a re-render would snap the reel away.
  useLayoutEffect(() => {
    const node = stripRef.current;
    if (node) {
      node.style.transform = `translateY(${offsetFor(mountValue.current, 0)}px)`;
    }
  }, []);

  useEffect(() => {
    const node = stripRef.current;
    if (!node) return;

    const rest = offsetFor(value, 0);
    const landed = offsetFor(value, COPIES - 1);

    // spinToken 0 is a fresh game: return to the resting number, no travel.
    if (spinToken === 0 || reducedMotion) {
      animate(node, { y: rest }, { duration: 0 });
      return;
    }

    let cancelled = false;
    let running: ReturnType<typeof animate> | null = null;

    const step = async (y: number, options: Parameters<typeof animate>[2]) => {
      running = animate(node, { y }, options);
      await running;
    };

    // The strip always sits at the first copy between spins, so every spin is a
    // long forward travel down to the last copy — the reel never rewinds.
    const run = async () => {
      await step(landed, {
        duration: durationMs / 1000,
        delay: delayMs / 1000,
        ease: [0.1, 0.62, 0.16, 1],
      });
      if (cancelled) return;
      // Land with a small bounce, the way a real reel settles into its detent.
      await step(landed + 7, { duration: 0.09, ease: "easeOut" });
      if (cancelled) return;
      await step(landed, { duration: 0.13, ease: "easeIn" });
      if (cancelled) return;
      // Reset to the equivalent position in copy 0, ready for the next spin.
      animate(node, { y: rest }, { duration: 0 });
    };

    void run();
    return () => {
      cancelled = true;
      running?.stop();
    };
    // Only a new spinToken starts a spin; value is read as of that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinToken]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "rail-gold relative w-24 overflow-hidden rounded-2xl sm:w-28 md:w-32",
          "shadow-[inset_0_10px_20px_-8px_rgba(0,0,0,0.85),inset_0_-10px_20px_-8px_rgba(0,0,0,0.85),0_8px_24px_-8px_rgba(0,0,0,0.6)]"
        )}
        style={{ height: ITEM_HEIGHT }}
        role="img"
        aria-label={`${label}: ${value}`}
      >
        <div ref={stripRef}>
          {STRIP.map((n, i) => (
            <div
              key={i}
              style={{ height: ITEM_HEIGHT }}
              className="flex items-center justify-center font-mono text-6xl font-bold tabular-nums text-cream sm:text-7xl"
            >
              {n}
            </div>
          ))}
        </div>
        {/* Glass: darkened top and bottom edges plus a centre highlight line. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70" />
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gold/25" />
      </div>
      <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-gold/60 uppercase">
        {label}
      </span>
    </div>
  );
}
