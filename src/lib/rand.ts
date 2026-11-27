export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function randomId(len = 10): string {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

const CODE_CHARS = 'ABCDEFGHJKLMNPRSTUVWXYZ';
export function roomCode(): string {
  let s = '';
  for (let i = 0; i < 4; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return s;
}

export function normalizeCode(s: string): string {
  return s.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
}

/**
 * Up to n items, never-shown ones first (in random order), then the ones shown longest ago.
 * `seen` lists ids oldest first, so a restarted game doesn't repeat questions until the pool runs out.
 */
export function freshFirst<T>(items: T[], id: (t: T) => string, seen: string[], n: number): T[] {
  const when = new Map<string, number>();
  seen.forEach((k, i) => when.set(k, i));
  return items
    .map((t) => {
      const w = when.get(id(t));
      return { t, w: w === undefined ? -1 : w, r: Math.random() };
    })
    .sort((a, b) => a.w - b.w || a.r - b.r)
    .slice(0, n)
    .map((x) => x.t);
}
