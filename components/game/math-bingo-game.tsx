"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  BotIcon,
  PartyPopperIcon,
  RotateCcwIcon,
  SquareIcon,
  Volume2Icon,
  VolumeXIcon,
} from "lucide-react";

import { AutomateDialog } from "@/components/game/automate-dialog";
import { BingoCelebration } from "@/components/game/bingo-celebration";
import { BingoDialog } from "@/components/game/bingo-dialog";
import { DrawHistory } from "@/components/game/draw-history";
import { SlotReel } from "@/components/game/slot-reel";
import { Button } from "@/components/ui/button";
import { useBingoGame } from "@/hooks/use-bingo-game";
import { useGameSounds } from "@/hooks/use-game-sounds";
import { REEL_SPIN_MS, REEL_STAGGER_MS } from "@/lib/timing";
import { cn } from "@/lib/utils";

export function MathBingoGame() {
  const [automateOpen, setAutomateOpen] = useState(false);
  const [bingoOpen, setBingoOpen] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [winningKeys, setWinningKeys] = useState<Set<string>>(new Set());

  const sound = useGameSounds();
  // A player is being checked — hold the calls until the room is settled.
  const game = useBingoGame({
    paused: bingoOpen || celebrating,
    onSpinStart: sound.playSpin,
  });

  const celebrateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (celebrateTimer.current) clearTimeout(celebrateTimer.current);
    };
  }, []);

  const handleWin = (matchedKeys: Set<string>) => {
    setWinningKeys(matchedKeys);
    game.stopAuto();
    // Let the verdict register in the dialog before the confetti takes over.
    celebrateTimer.current = setTimeout(() => {
      setBingoOpen(false);
      setCelebrating(true);
      sound.playWin();
      celebrateTimer.current = null;
    }, 900);
  };

  const handleNewGame = () => {
    // Cancel a celebration still on its way in, or it would land on an empty board.
    if (celebrateTimer.current) clearTimeout(celebrateTimer.current);
    celebrateTimer.current = null;
    game.reset();
    setWinningKeys(new Set());
    setCelebrating(false);
  };

  const displayPair = game.current ?? { a: 1, b: 1 };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-5 px-4 py-6 sm:gap-6 sm:py-10">
      <header className="text-center">
        <h1 className="text-marquee text-5xl font-black tracking-tight sm:text-6xl">
          Math Bingo
        </h1>
        <p className="mt-2 text-sm text-cream/50">
          Spin the reels and call out the multiplication.
        </p>
      </header>

      {/* Cabinet and controls share a row on wider screens, so the called
          board sits higher up the page. */}
      <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:items-stretch sm:justify-center sm:gap-4">
        <div className="rail-gold flex items-center justify-center gap-4 rounded-3xl px-5 py-5 shadow-[0_18px_50px_-18px_rgba(0,0,0,0.9)] sm:gap-5 sm:px-6">
          <SlotReel
            value={displayPair.a}
            spinToken={game.spinToken}
            durationMs={REEL_SPIN_MS}
            label="First"
          />
          <motion.span
            aria-hidden
            animate={game.isSpinning ? { scale: [1, 1.25, 1] } : { scale: 1 }}
            transition={{
              duration: 0.6,
              repeat: game.isSpinning ? Infinity : 0,
            }}
            className="pb-6 font-mono text-4xl font-bold text-gold sm:text-5xl"
          >
            ×
          </motion.span>
          <SlotReel
            value={displayPair.b}
            spinToken={game.spinToken}
            delayMs={REEL_STAGGER_MS}
            durationMs={REEL_SPIN_MS}
            label="Second"
          />
        </div>

        {/* Two rows under the reels on phones; a column beside them from sm up,
            where flex-1 makes the three buttons fill the cabinet's height. */}
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-44 sm:flex-col sm:gap-3">
          <Button
            onClick={game.spin}
            disabled={!game.canSpin}
            className="col-span-2 h-14 text-xl font-black tracking-wide shadow-[0_6px_0_var(--gold-deep)] active:shadow-[0_2px_0_var(--gold-deep)] disabled:shadow-none sm:h-auto sm:flex-1"
          >
            {game.isSpinning ? "Spinning…" : "Spin"}
          </Button>

          <Button
            variant={game.isAuto ? "destructive" : "secondary"}
            onClick={() =>
              game.isAuto ? game.stopAuto() : setAutomateOpen(true)
            }
            disabled={game.isExhausted && !game.isAuto}
            className="h-12 text-sm font-bold sm:h-auto sm:flex-1"
          >
            {game.isAuto ? (
              <>
                <SquareIcon className="marquee-pulse fill-current" />
                Stop auto
              </>
            ) : (
              <>
                <BotIcon />
                Automate spin
              </>
            )}
          </Button>

          <Button
            variant="secondary"
            onClick={() => setBingoOpen(true)}
            className={cn(
              "h-12 text-sm font-black tracking-widest sm:h-auto sm:flex-1",
              "bg-neon/90 text-white hover:bg-neon",
            )}
          >
            <PartyPopperIcon />
            BINGO!
          </Button>
        </div>
      </div>

      <DrawHistory
        drawn={game.drawn}
        total={game.totalCombinations}
        highlighted={winningKeys}
      />

      {/* Status line */}
      <div className="flex min-h-6 items-center gap-3 text-xs text-cream/45">
        {game.isAuto && (
          <span className="flex items-center gap-2">
            <span className="marquee-pulse size-2 rounded-full bg-neon" />
            Auto-spinning every {(game.autoDelayMs ?? 0) / 1000}s
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs">
        <Button
          variant="ghost"
          onClick={handleNewGame}
          className="text-cream/50 hover:text-cream"
        >
          <RotateCcwIcon />
          New game
        </Button>
        <Button
          variant="ghost"
          onClick={sound.toggleMuted}
          aria-pressed={sound.muted}
          className="text-cream/50 hover:text-cream"
        >
          {sound.muted ? <VolumeXIcon /> : <Volume2Icon />}
          {sound.muted ? "Sound off" : "Sound on"}
        </Button>
        <Link
          href="/"
          className="text-cream/40 underline-offset-4 hover:text-cream hover:underline"
        >
          Home
        </Link>
      </div>

      <AutomateDialog
        open={automateOpen}
        onOpenChange={setAutomateOpen}
        onStart={game.startAuto}
      />
      <BingoDialog
        open={bingoOpen}
        onOpenChange={setBingoOpen}
        drawn={game.drawn}
        onWin={handleWin}
      />
      <BingoCelebration
        open={celebrating}
        onDismiss={() => setCelebrating(false)}
      />
    </div>
  );
}
