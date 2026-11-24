import { useEffect, useState } from 'react';

/** Re-render every `ms` milliseconds; returns Date.now() (+ optional clock offset). */
export function useNow(ms = 250, offset = 0): number {
  const [now, setNow] = useState(() => Date.now() + offset);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now() + offset), ms);
    return () => clearInterval(id);
  }, [ms, offset]);
  return now;
}

export function secondsLeft(endsAt: number, now: number): number {
  return Math.max(0, Math.ceil((endsAt - now) / 1000));
}

export function fmt(n: number): string {
  return Math.round(n).toLocaleString('en-IN');
}
