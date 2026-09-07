"use client";

import { useState } from "react";
import { CheckIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  checkBingo,
  pairKey,
  parseProducts,
  type BingoResult,
  type Pair,
} from "@/lib/bingo";
import { cn } from "@/lib/utils";

type BingoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drawn: Pair[];
  /** Fired only on a verified win, with the calls that covered the card. */
  onWin: (matchedKeys: Set<string>) => void;
};

export function BingoDialog({
  open,
  onOpenChange,
  drawn,
  onWin,
}: BingoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* Lives inside the content, which Radix unmounts on close — so every
            shout-out starts from a blank form with no reset effect. */}
        <BingoCheck
          drawn={drawn}
          onWin={onWin}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function BingoCheck({
  drawn,
  onWin,
  onClose,
}: {
  drawn: Pair[];
  onWin: (matchedKeys: Set<string>) => void;
  onClose: () => void;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BingoResult | null>(null);

  const handleCheck = () => {
    setResult(null);

    if (drawn.length === 0) {
      setError("No numbers have been called yet. Spin at least once first.");
      return;
    }

    const { values, invalid } = parseProducts(input);

    if (invalid.length > 0) {
      setError(
        `Not a whole number: ${invalid.join(", ")}. Enter products separated by commas.`,
      );
      return;
    }
    if (values.length === 0) {
      setError("Enter at least one product, for example: 24, 36, 8");
      return;
    }

    setError(null);
    const checked = checkBingo(values, drawn);
    setResult(checked);

    if (checked.won) {
      const matchedKeys = new Set(
        checked.checks
          .map((c) => c.pair)
          .filter((p): p is Pair => p !== undefined)
          .map((p) => pairKey(p.a, p.b)),
      );
      onWin(matchedKeys);
    }
  };

  const missCount = result?.checks.filter((c) => !c.matched).length ?? 0;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">Someone shouted BINGO!</DialogTitle>
        <DialogDescription>
          Enter the products from their card. Each one is checked against the
          combinations called so far.
        </DialogDescription>
      </DialogHeader>

      <form
        className="space-y-3 py-1"
        onSubmit={(e) => {
          e.preventDefault();
          handleCheck();
        }}
      >
        <Label
          htmlFor="bingo-products"
          className="text-xs tracking-widest text-gold/70 uppercase"
        >
          Products
        </Label>
        <Input
          id="bingo-products"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="24, 36, 8, 144, 15"
          autoComplete="off"
          inputMode="numeric"
          autoFocus
          className="h-11 font-mono text-base"
          aria-invalid={error !== null}
          aria-describedby="bingo-hint"
        />
        <p id="bingo-hint" className="text-xs text-cream/45">
          Separate with commas or spaces. Duplicates are ignored.
        </p>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {/* Enables Enter-to-submit without showing a second button. */}
        <button type="submit" className="sr-only">
          Check
        </button>
      </form>

      {result && (
        <div className="space-y-3">
          <div
            className={cn(
              "rounded-lg border px-3 py-2 text-sm font-semibold",
              result.won
                ? "border-gold/50 bg-gold/10 text-gold"
                : "border-destructive/40 bg-destructive/10 text-destructive",
            )}
            role="status"
          >
            {result.won
              ? "Verified — every product was called!"
              : `Not a bingo yet — ${missCount} of ${result.checks.length} ${
                  missCount === 1 ? "product has" : "products have"
                } not been called.`}
          </div>

          <ul className="max-h-44 space-y-1 overflow-y-auto">
            {result.checks.map((check) => (
              <li
                key={check.value}
                className="flex items-center justify-between gap-3 rounded-md bg-felt-deep/50 px-3 py-1.5 font-mono text-sm"
              >
                <span className="flex items-center gap-2 tabular-nums">
                  {check.matched ? (
                    <CheckIcon className="size-4 text-gold" />
                  ) : (
                    <XIcon className="size-4 text-destructive" />
                  )}
                  {check.value}
                </span>
                <span
                  className={cn(
                    "text-xs",
                    check.matched ? "text-cream/60" : "text-destructive/80",
                  )}
                >
                  {check.pair
                    ? `called as ${check.pair.a} × ${check.pair.b}`
                    : "not called"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <DialogFooter>
        <Button variant="ghost" className="h-10" onClick={onClose}>
          Close
        </Button>
        <Button className="h-10 px-6 font-bold" onClick={handleCheck}>
          Check card
        </Button>
      </DialogFooter>
    </>
  );
}
