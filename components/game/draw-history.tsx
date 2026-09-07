"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";

import { pairKey, product, type Pair } from "@/lib/bingo";
import { cn } from "@/lib/utils";

type DrawHistoryProps = {
  drawn: Pair[];
  total: number;
  /** Keys of calls that satisfied a verified BINGO, flashed for the room. */
  highlighted?: Set<string>;
};

export function DrawHistory({ drawn, total, highlighted }: DrawHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the newest call in view as the board fills up.
  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [drawn.length]);

  return (
    <section className="w-full" aria-label="Numbers called">
      {/* <div className="mb-2 flex items-baseline justify-between px-1">
        <h2 className="text-xs font-semibold tracking-[0.2em] text-gold/70 uppercase">
          Called
        </h2>
        <p className="font-mono text-xs text-cream/50 tabular-nums">
          {drawn.length} of {total}
        </p>
      </div> */}

      <div
        ref={scrollRef}
        className="rail-gold h-48 overflow-y-auto rounded-2xl p-3 shadow-[inset_0_4px_16px_-4px_rgba(0,0,0,0.7)] sm:h-56"
      >
        {drawn.length === 0 ? (
          <p className="flex h-full items-center justify-center text-center text-sm text-cream/40">
            No numbers called yet — press Spin to start the game.
          </p>
        ) : (
          <ul className="flex flex-wrap content-start gap-2">
            {drawn.map((pair, index) => {
              const key = pairKey(pair.a, pair.b);
              const isHit = highlighted?.has(key) ?? false;
              return (
                <motion.li
                  key={key}
                  initial={{ opacity: 0, scale: 0.4, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 22 }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-base font-bold tabular-nums transition-colors sm:text-lg",
                    isHit
                      ? "border-gold bg-gold text-[oklch(0.22_0.05_90)] shadow-[0_0_18px_-2px_var(--gold)]"
                      : "border-gold/25 bg-felt-deep/60 text-cream"
                  )}
                  title={`${pair.a} × ${pair.b} = ${product(pair)}`}
                >
                  <span>{pair.a}</span>
                  <span className={isHit ? "opacity-60" : "text-gold/70"}>×</span>
                  <span>{pair.b}</span>
                  <span className="sr-only">
                    is call number {index + 1}, product {product(pair)}
                  </span>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
