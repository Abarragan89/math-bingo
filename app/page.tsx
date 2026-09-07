import Link from "next/link";

import { Button } from "@/components/ui/button";
import { withBasePath } from "@/lib/base-path";
import { MAX_NUMBER, MIN_NUMBER } from "@/lib/bingo";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div className="space-y-4">
        <p className="font-mono text-xs tracking-[0.35em] text-gold/60 uppercase">
          {MIN_NUMBER}&ndash;{MAX_NUMBER} times tables
        </p>
        <h1 className="text-marquee text-6xl font-black tracking-tight sm:text-7xl">
          Math Bingo
        </h1>
        <p className="mx-auto max-w-sm text-base text-cream/60">
          Spin two reels, call the multiplication, and let the room hunt for the
          product on their <a className="text-blue-500 underline" href={withBasePath("/bingo-card.pdf")} download>Bingo cards</a>.
        </p>
      </div>

      <Button
        asChild
        className="h-16 px-10 text-xl font-black tracking-wide shadow-[0_6px_0_var(--gold-deep)] active:shadow-[0_2px_0_var(--gold-deep)]"
      >
        <Link href="/game">Start new game</Link>
      </Button>

      <ul className="grid gap-2 text-sm text-cream/45">
        <li>Spin by hand, or let the game run itself on a timer.</li>
        <li>Check a player&rsquo;s card the moment they shout BINGO.</li>
      </ul>
    </main>
  );
}
