"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  AUTO_DEFAULT_MS,
  AUTO_MAX_MS,
  AUTO_MIN_MS,
  AUTO_PRESETS_MS,
} from "@/lib/timing";
import { cn } from "@/lib/utils";

function formatSeconds(ms: number) {
  const seconds = ms / 1000;
  return Number.isInteger(seconds) ? `${seconds}s` : `${seconds.toFixed(1)}s`;
}

type AutomateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (delayMs: number) => void;
  initialDelayMs?: number;
};

export function AutomateDialog({
  open,
  onOpenChange,
  onStart,
  initialDelayMs = AUTO_DEFAULT_MS,
}: AutomateDialogProps) {
  const [delayMs, setDelayMs] = useState(initialDelayMs);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Automate spins</DialogTitle>
          <DialogDescription>
            The game will keep calling new combinations on its own. Choose how
            long to wait between spins.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label className="text-xs tracking-widest text-gold/70 uppercase">
              Presets
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {AUTO_PRESETS_MS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={delayMs === preset ? "default" : "outline"}
                  onClick={() => setDelayMs(preset)}
                  className={cn(
                    "h-10 font-mono text-sm font-bold",
                    delayMs === preset && "ring-2 ring-gold/60"
                  )}
                  aria-pressed={delayMs === preset}
                >
                  {formatSeconds(preset)}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <Label
                htmlFor="auto-delay"
                className="text-xs tracking-widest text-gold/70 uppercase"
              >
                Time between spins
              </Label>
              <span className="font-mono text-lg font-bold text-gold tabular-nums">
                {formatSeconds(delayMs)}
              </span>
            </div>
            <Slider
              id="auto-delay"
              min={AUTO_MIN_MS}
              max={AUTO_MAX_MS}
              step={500}
              value={[delayMs]}
              onValueChange={([next]) => setDelayMs(next)}
              aria-label="Seconds between spins"
            />
            <div className="flex justify-between font-mono text-[0.7rem] text-cream/40">
              <span>{formatSeconds(AUTO_MIN_MS)}</span>
              <span>{formatSeconds(AUTO_MAX_MS)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            className="h-10"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-10 px-6 font-bold"
            onClick={() => {
              onStart(delayMs);
              onOpenChange(false);
            }}
          >
            Start auto-spin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
