import type { Metadata } from "next";

import { MathBingoGame } from "@/components/game/math-bingo-game";

export const metadata: Metadata = {
  title: "Playing — Math Bingo",
};

export default function GamePage() {
  return <MathBingoGame />;
}
