// Seeded random numbers (mulberry32). The generator state lives in the game state,
// so the same seed and the same commands always produce the same game.

export interface Rng {
  next(): number; // [0, 1)
  int(maxExclusive: number): number;
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
  weighted<T>(items: readonly T[], weight: (item: T) => number): T;
}

export function createRng(holder: { rng: number }): Rng {
  const next = () => {
    holder.rng = (holder.rng + 0x6d2b79f5) | 0;
    let t = holder.rng;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (n: number) => Math.floor(next() * n);
  return {
    next,
    int,
    pick: (items) => items[int(items.length)],
    shuffle: (items) => {
      const a = [...items];
      for (let i = a.length - 1; i > 0; i--) {
        const j = int(i + 1);
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    weighted: (items, weight) => {
      const total = items.reduce((s, it) => s + weight(it), 0);
      let r = next() * total;
      for (const it of items) {
        r -= weight(it);
        if (r < 0) return it;
      }
      return items[items.length - 1];
    },
  };
}
