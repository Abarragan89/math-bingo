"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { withBasePath } from "@/lib/base-path";

const SOUNDS = {
  spin: withBasePath("/sounds/number-spin.wav"),
  win: withBasePath("/sounds/bingo-winner.wav"),
} as const;

type SoundName = keyof typeof SOUNDS;

/**
 * The game's sound effects. Each clip gets one element, built up front so the
 * files are fetched and decoded before the first press rather than on it, and
 * restarted on each play. One mute switch covers them all.
 */
export function useGameSounds() {
  const elements = useRef<Partial<Record<SoundName, HTMLAudioElement>>>({});
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const built = elements.current;
    for (const [name, src] of Object.entries(SOUNDS)) {
      const audio = new Audio(src);
      audio.preload = "auto";
      built[name as SoundName] = audio;
    }
    return () => {
      for (const audio of Object.values(built)) audio?.pause();
      elements.current = {};
    };
  }, []);

  useEffect(() => {
    for (const audio of Object.values(elements.current)) {
      if (audio) audio.muted = muted;
    }
  }, [muted]);

  const play = useCallback((name: SoundName) => {
    const audio = elements.current[name];
    if (!audio || audio.muted) return;
    // Restart rather than overlap, in case a previous play is still running.
    audio.currentTime = 0;
    // Browsers refuse playback before the page has been interacted with. Every
    // play here follows a click, so a rejection is not worth surfacing.
    void audio.play().catch(() => {});
  }, []);

  const playSpin = useCallback(() => play("spin"), [play]);
  const playWin = useCallback(() => play("win"), [play]);
  const toggleMuted = useCallback(() => setMuted((m) => !m), []);

  return { playSpin, playWin, muted, toggleMuted };
}
