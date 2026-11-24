// Classic 3x9 Tambola/Housie tickets: 15 numbers, 5 per row, column c holds c*10..c*10+9
// (col 0: 1-9, col 8: 80-90), numbers ascending top-to-bottom within a column.
import { shuffle } from '../../lib/rand';

export type Ticket = number[][]; // 3 rows x 9 cols, 0 = blank

export type PrizeId = 'early5' | 'top' | 'middle' | 'bottom' | 'corners' | 'full';

export const PRIZES: { id: PrizeId; name: string; desc: string; stars: number; voice: string }[] = [
  { id: 'early5', name: 'Early Five', desc: 'Any 5 numbers', stars: 3, voice: 'early5' },
  { id: 'top', name: 'Top Line', desc: 'The whole top row', stars: 4, voice: 'top' },
  { id: 'middle', name: 'Middle Line', desc: 'The whole middle row', stars: 4, voice: 'middle' },
  { id: 'bottom', name: 'Bottom Line', desc: 'The whole bottom row', stars: 4, voice: 'bottom' },
  { id: 'corners', name: 'Four Corners', desc: 'First and last numbers of the top and bottom rows', stars: 3, voice: 'corners' },
  { id: 'full', name: 'Full House', desc: 'All 15 numbers', stars: 10, voice: 'full' },
];

function colRange(c: number): [number, number] {
  if (c === 0) return [1, 9];
  if (c === 8) return [80, 90];
  return [c * 10, c * 10 + 9];
}

export function makeTicket(): Ticket {
  for (let attempt = 0; attempt < 2000; attempt++) {
    const counts = [1, 1, 1, 1, 1, 1, 1, 1, 1];
    let extra = 6;
    while (extra > 0) {
      const c = Math.floor(Math.random() * 9);
      if (counts[c] < 3) {
        counts[c]++;
        extra--;
      }
    }
    const rowCount = [0, 0, 0];
    const place: number[][] = [];
    const order = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).sort((a, b) => counts[b] - counts[a]);
    let ok = true;
    for (const c of order) {
      const rows = shuffle([0, 1, 2])
        .sort((a, b) => rowCount[a] - rowCount[b])
        .slice(0, counts[c])
        .sort((a, b) => a - b);
      for (const r of rows) {
        if (rowCount[r] >= 5) ok = false;
        rowCount[r]++;
      }
      place[c] = rows;
    }
    if (!ok || rowCount[0] !== 5 || rowCount[1] !== 5 || rowCount[2] !== 5) continue;
    const t: Ticket = [Array(9).fill(0), Array(9).fill(0), Array(9).fill(0)];
    for (let c = 0; c < 9; c++) {
      const [lo, hi] = colRange(c);
      const pool: number[] = [];
      for (let n = lo; n <= hi; n++) pool.push(n);
      const nums = shuffle(pool).slice(0, counts[c]).sort((a, b) => a - b);
      place[c].forEach((r, i) => (t[r][c] = nums[i]));
    }
    return t;
  }
  throw new Error('ticket generation failed');
}

export function ticketNumbers(t: Ticket): number[] {
  const out: number[] = [];
  for (const row of t) for (const n of row) if (n) out.push(n);
  return out;
}

/** The numbers a prize needs on this ticket (for early5: every number, any 5 count). */
export function prizeCells(t: Ticket, prize: PrizeId): number[] {
  const row = (r: number) => t[r].filter((n) => n > 0);
  switch (prize) {
    case 'top':
      return row(0);
    case 'middle':
      return row(1);
    case 'bottom':
      return row(2);
    case 'corners': {
      const a = row(0);
      const b = row(2);
      return [a[0], a[a.length - 1], b[0], b[b.length - 1]];
    }
    default:
      return ticketNumbers(t);
  }
}

/** How many more numbers this ticket needs for the prize (0 = claimable). */
export function missing(t: Ticket, prize: PrizeId, called: Set<number>): number {
  const cells = prizeCells(t, prize);
  const hit = cells.filter((n) => called.has(n)).length;
  if (prize === 'early5') return Math.max(0, 5 - hit);
  return cells.length - hit;
}

/** Numbers to highlight when showing a winning ticket. */
export function winningCells(t: Ticket, prize: PrizeId, called: Set<number>): number[] {
  const cells = prizeCells(t, prize).filter((n) => called.has(n));
  return prize === 'early5' ? cells.slice(0, 5) : cells;
}
