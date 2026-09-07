import {
  allPairs,
  MAX_NUMBER,
  MIN_NUMBER,
  pairKey,
  shuffleDeck,
  type Pair,
} from "@/lib/bingo";

const DB_NAME = "math-bingo";
const DB_VERSION = 1;
const STORE = "game";
const RECORD_KEY = "current";
/** Bump to make older saved games unreadable rather than misread. */
const STATE_VERSION = 1;

type PersistedGame = {
  version: number;
  savedAt: number;
  /**
   * Only the calls are stored. The remaining deck is derived from them on load,
   * which cannot lose or duplicate a combination the way a separately saved
   * deck could — including when the tab is closed mid-spin.
   */
  drawn: Pair[];
};

export type RestoredGame = {
  drawn: Pair[];
  deck: Pair[];
  savedAt: number;
};

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    let request: IDBOpenDBRequest;
    try {
      // Blocked-storage profiles can throw on the property access itself, not
      // just on open(), so even reading `indexedDB` belongs inside the try.
      if (typeof indexedDB === "undefined") {
        resolve(null);
        return;
      }
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      resolve(null);
      return;
    }
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T | null> {
  return new Promise((resolve) => {
    void openDb()
      .catch(() => null)
      .then((db) => {
        if (!db) {
          resolve(null);
          return;
        }
        try {
          const tx = db.transaction(STORE, mode);
          const request = run(tx.objectStore(STORE));
          request.onsuccess = () => resolve(request.result ?? null);
          request.onerror = () => resolve(null);
          tx.oncomplete = () => db.close();
          tx.onabort = () => {
            db.close();
            resolve(null);
          };
        } catch {
          db.close();
          resolve(null);
        }
      });
  });
}

function isPair(value: unknown): value is Pair {
  if (!value || typeof value !== "object") return false;
  const { a, b } = value as Partial<Pair>;
  return (
    Number.isInteger(a) &&
    Number.isInteger(b) &&
    (a as number) >= MIN_NUMBER &&
    (a as number) <= MAX_NUMBER &&
    (b as number) >= MIN_NUMBER &&
    (b as number) <= MAX_NUMBER
  );
}

/**
 * Turns a stored record into a playable game, or null if it cannot be trusted.
 * Anything malformed is discarded rather than partially restored — a wrong deck
 * would let an already-called combination come up twice.
 */
function reconcile(raw: unknown): RestoredGame | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Partial<PersistedGame>;
  if (record.version !== STATE_VERSION) return null;
  if (!Array.isArray(record.drawn) || !record.drawn.every(isPair)) return null;

  const drawn = record.drawn;
  const drawnKeys = new Set(drawn.map((p) => pairKey(p.a, p.b)));
  // A repeat in the saved calls means the record is corrupt.
  if (drawnKeys.size !== drawn.length) return null;

  const remaining = allPairs().filter((p) => !drawnKeys.has(pairKey(p.a, p.b)));
  return {
    drawn,
    deck: shuffleDeck(remaining),
    savedAt: typeof record.savedAt === "number" ? record.savedAt : 0,
  };
}

export async function loadGameState(): Promise<RestoredGame | null> {
  const raw = await runTransaction<unknown>("readonly", (store) =>
    store.get(RECORD_KEY)
  );
  return reconcile(raw);
}

export async function saveGameState(drawn: Pair[]): Promise<void> {
  const record: PersistedGame = {
    version: STATE_VERSION,
    savedAt: Date.now(),
    // Plain objects only: structured clone rejects anything exotic.
    drawn: drawn.map(({ a, b }) => ({ a, b })),
  };
  await runTransaction("readwrite", (store) => store.put(record, RECORD_KEY));
}

export async function clearGameState(): Promise<void> {
  await runTransaction("readwrite", (store) => store.delete(RECORD_KEY));
}
