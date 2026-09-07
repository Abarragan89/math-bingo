"use client";

import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";

import { buildDeck, TOTAL_COMBINATIONS, type Pair } from "@/lib/bingo";
import { TOTAL_SPIN_MS } from "@/lib/timing";

type UseBingoGameOptions = {
  /** Hold automated calls while something has the room's attention. */
  paused?: boolean;
  /** Fired the moment a spin actually begins, for the reel sound. */
  onSpinStart?: () => void;
};

export function useBingoGame({
  paused = false,
  onSpinStart,
}: UseBingoGameOptions = {}) {
  const [deck, setDeck] = useState<Pair[]>(buildDeck);
  const [drawn, setDrawn] = useState<Pair[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  /** The pair the reels are travelling toward; stays put once they land. */
  const [current, setCurrent] = useState<Pair | null>(null);
  /** Increments on every spin. The reels watch this to know to move. */
  const [spinToken, setSpinToken] = useState(0);
  /** Gap between automated spins, or null when automation is off. */
  const [autoDelayMs, setAutoDelayMs] = useState<number | null>(null);

  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Synchronous guard: state updates are batched, this is not. */
  const spinningRef = useRef(false);

  const isExhausted = deck.length === 0;
  const canSpin = !isSpinning && !isExhausted;
  // Derived rather than cleared in an effect, so running out of combinations
  // flips the UI back without a second render pass.
  const isAuto = autoDelayMs !== null && !isExhausted;

  const spin = useCallback(() => {
    if (spinningRef.current || deck.length === 0) return;

    const pair = deck[deck.length - 1];
    spinningRef.current = true;
    onSpinStart?.();

    setDeck((prev) => prev.slice(0, -1));
    setCurrent(pair);
    setSpinToken((n) => n + 1);
    setIsSpinning(true);

    // The reels are already moving; the call is recorded when they land.
    commitTimer.current = setTimeout(() => {
      setDrawn((prev) => [...prev, pair]);
      spinningRef.current = false;
      setIsSpinning(false);
      commitTimer.current = null;
    }, TOTAL_SPIN_MS);
  }, [deck, onSpinStart]);

  useEffect(() => {
    return () => {
      if (commitTimer.current) clearTimeout(commitTimer.current);
    };
  }, []);

  // Non-reactive: lets the scheduler below reach the latest spin without
  // tearing down and rebuilding its timer every time the deck changes.
  const onAutoTick = useEffectEvent(() => {
    spin();
  });

  // Self-rescheduling chain rather than setInterval, so the configured delay is
  // the quiet gap *between* spins and never overlaps the reel animation.
  useEffect(() => {
    if (autoDelayMs === null || paused || isSpinning) return;
    if (deck.length === 0) return;

    const id = setTimeout(() => onAutoTick(), autoDelayMs);
    return () => clearTimeout(id);
  }, [autoDelayMs, paused, isSpinning, deck.length]);

  const startAuto = useCallback(
    (delayMs: number) => {
      setAutoDelayMs(delayMs);
      // Spin straight away so pressing Start has a visible effect.
      spin();
    },
    [spin]
  );

  const stopAuto = useCallback(() => setAutoDelayMs(null), []);

  const reset = useCallback(() => {
    if (commitTimer.current) clearTimeout(commitTimer.current);
    commitTimer.current = null;
    spinningRef.current = false;
    setDeck(buildDeck());
    setDrawn([]);
    setCurrent(null);
    setSpinToken(0);
    setIsSpinning(false);
    setAutoDelayMs(null);
  }, []);

  return {
    drawn,
    current,
    spinToken,
    isSpinning,
    canSpin,
    isExhausted,
    calledCount: drawn.length,
    totalCombinations: TOTAL_COMBINATIONS,
    isAuto,
    autoDelayMs,
    spin,
    startAuto,
    stopAuto,
    reset,
  };
}
