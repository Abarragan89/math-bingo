export const MIN_NUMBER = 1;
export const MAX_NUMBER = 12;

export type Pair = {
  /** Left-hand number as displayed. */
  a: number;
  /** Right-hand number as displayed. */
  b: number;
};

/**
 * Identity of a combination, ignoring order: `2 x 5` and `5 x 2` share a key.
 * This is what makes a combination un-drawable twice in one game.
 */
export function pairKey(a: number, b: number): string {
  return a <= b ? `${a}x${b}` : `${b}x${a}`;
}

export function product(pair: Pair): number {
  return pair.a * pair.b;
}

/** Every unordered combination of MIN_NUMBER..MAX_NUMBER, doubles included. */
export function allPairs(): Pair[] {
  const pairs: Pair[] = [];
  for (let a = MIN_NUMBER; a <= MAX_NUMBER; a++) {
    for (let b = a; b <= MAX_NUMBER; b++) {
      pairs.push({ a, b });
    }
  }
  return pairs;
}

export const TOTAL_COMBINATIONS = allPairs().length;

/**
 * Shuffles combinations into a draw order. Drawing pops off the end, so a game
 * can never repeat a combination and never has to re-roll to find an unused
 * one. Takes any subset, so a restored game can rebuild its remaining deck.
 */
export function shuffleDeck(pairs: Pair[]): Pair[] {
  const deck = [...pairs];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  // The combination is spent either way, so flipping how it reads keeps the
  // reels from always showing the smaller number on the left.
  return deck.map(({ a, b }) => (Math.random() < 0.5 ? { a, b } : { a: b, b: a }));
}

/** A shuffled deck of every combination — a brand new game. */
export function buildDeck(): Pair[] {
  return shuffleDeck(allPairs());
}

export type ParsedProducts = {
  values: number[];
  /** Tokens that were not a positive whole number, echoed back for the error. */
  invalid: string[];
};

/** Reads "24, 36 8" leniently: any mix of commas and whitespace, deduped. */
export function parseProducts(input: string): ParsedProducts {
  const tokens = input
    .split(/[\s,]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  const values: number[] = [];
  const invalid: string[] = [];
  const seen = new Set<number>();

  for (const token of tokens) {
    const value = Number(token);
    if (!Number.isInteger(value) || value <= 0) {
      invalid.push(token);
      continue;
    }
    if (seen.has(value)) continue;
    seen.add(value);
    values.push(value);
  }

  return { values, invalid };
}

export type ProductCheck = {
  value: number;
  matched: boolean;
  /** The called combination that covers this product, if any. */
  pair?: Pair;
};

export type BingoResult = {
  checks: ProductCheck[];
  won: boolean;
};

/**
 * A product counts as covered when *any* called combination multiplies to it —
 * a card square reading 12 is satisfied by 2 x 6, 3 x 4 or 1 x 12 alike.
 */
export function checkBingo(products: number[], drawn: Pair[]): BingoResult {
  const byProduct = new Map<number, Pair>();
  for (const pair of drawn) {
    const value = product(pair);
    if (!byProduct.has(value)) byProduct.set(value, pair);
  }

  const checks = products.map<ProductCheck>((value) => {
    const pair = byProduct.get(value);
    return { value, matched: pair !== undefined, pair };
  });

  return { checks, won: checks.length > 0 && checks.every((c) => c.matched) };
}
