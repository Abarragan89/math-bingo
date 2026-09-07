"use client";

import { AnimatePresence, motion } from "motion/react";
import Confetti from "react-confetti";

import { Button } from "@/components/ui/button";
import { useWindowSize } from "@/hooks/use-window-size";

const LETTERS = ["B", "I", "N", "G", "O"];
const CONFETTI_COLORS = ["#f4c542", "#fff3c4", "#e8543f", "#3fbf7f", "#ffffff"];

export function BingoCelebration({
  open,
  onDismiss,
}: {
  open: boolean;
  onDismiss: () => void;
}) {
  // Zero until the window has been measured, which only happens on the client
  // — that is also the guard react-confetti needs, since it reads the DOM.
  const { width, height } = useWindowSize();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-felt-deep/85 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {width > 0 && (
            <div className="pointer-events-none absolute inset-0">
              <Confetti
                width={width}
                height={height}
                numberOfPieces={420}
                recycle={false}
                gravity={0.22}
                tweenDuration={9000}
                colors={CONFETTI_COLORS}
              />
            </div>
          )}

          <div className="pointer-events-none flex gap-1 sm:gap-3">
            {LETTERS.map((letter, i) => (
              <motion.span
                key={letter}
                initial={{ scale: 0.2, opacity: 0, rotate: -25 }}
                animate={{ scale: [0.2, 1.4, 1], opacity: 1, rotate: 0 }}
                transition={{
                  delay: i * 0.11,
                  duration: 0.75,
                  times: [0, 0.6, 1],
                  ease: "easeOut",
                }}
                className="text-marquee text-6xl font-black tracking-tight sm:text-8xl"
              >
                {letter}
              </motion.span>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className="px-6 text-center text-lg text-cream/80"
          >
            Every product was called. That&rsquo;s a winner!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <Button
              size="lg"
              onClick={onDismiss}
              className="h-12 px-8 text-base font-bold"
            >
              Back to the game
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
