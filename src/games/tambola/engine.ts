import type { GameCtx, GameModule } from '../types';
import { makeTicket, missing, PRIZES, winningCells, type PrizeId, type Ticket } from './tickets';
import { randomId, shuffle } from '../../lib/rand';

export type Speed = 'slow' | 'normal' | 'fast';
export interface TambolaSettings {
  speed: Speed;
  tickets: 1 | 2;
  prizes: PrizeId[];
}

export const SPEED_MS: Record<Speed, number> = { slow: 12000, normal: 8500, fast: 5500 };
const SUSPENSE_MS = 1800;
const SHOW_OK_MS = 6500;
const SHOW_BOGEY_MS = 5500;
const INTRO_MS = 7000;
const JAIL_CALLS = 3;

export interface ClaimShow {
  pid: string;
  prize: PrizeId;
  valid: boolean;
  ticket: number;
  cells: number[];
  seq: number;
  at: number;
  until: number;
  revealed: boolean;
}

export interface TambolaState {
  id: string;
  phase: 'intro' | 'calling' | 'final';
  settings: TambolaSettings;
  tickets: Record<string, Ticket[]>;
  bag: number[];
  called: number[];
  nextAt: number;
  paused: boolean;
  pauseLeft: number;
  introUntil: number;
  prizes: Partial<Record<PrizeId, { winners: string[]; atCall: number }>>;
  show: ClaimShow | null;
  queue: ClaimShow[];
  jail: Record<string, number>;
  bogeys: Record<string, number>;
  lastClaim: Record<string, { prize: PrizeId; ok: boolean; seq: number; revealed: boolean; note?: string }>;
  seq: number;
  stars: Record<string, number>;
  nearFull?: boolean;
}

function interval(s: TambolaState) {
  return SPEED_MS[s.settings.speed] || SPEED_MS.normal;
}

function enabledPrizes(s: TambolaState): PrizeId[] {
  return PRIZES.map((p) => p.id).filter((id) => s.settings.prizes.indexOf(id) >= 0);
}

/** A prize can still be claimed if nobody has it, or someone won it on this very number (shared win). */
export function prizeOpen(s: TambolaState, prize: PrizeId, pid?: string): boolean {
  const w = s.prizes[prize];
  if (!w) return true;
  if (w.atCall !== s.called.length) return false;
  return pid ? w.winners.indexOf(pid) < 0 : true;
}

/** Something worth announcing after a number? (one line at most) */
function announcement(ctx: GameCtx, s: TambolaState): string | null {
  if (!s.nearFull && !s.prizes.full) {
    const called = new Set(s.called);
    const near = ctx.active().some((p) => (s.tickets[p.id] || []).some((t) => missing(t, 'full', called) === 1));
    if (near) {
      s.nearFull = true;
      return 'onefull';
    }
  }
  if (s.called.length === 45) return 'half';
  if (s.called.length >= 6 && s.called.length % 6 === 0 && Math.random() < 0.7) return 'hype';
  return null;
}

function startShow(ctx: GameCtx, s: TambolaState, show: ClaimShow) {
  const now = ctx.now();
  show.at = now;
  // keep the claim on screen until the announcer has finished the line
  const talk = ctx.voiceMs(show.valid ? show.prize : 'bogey') + 800;
  show.until = now + SUSPENSE_MS + Math.max(show.valid ? SHOW_OK_MS : SHOW_BOGEY_MS, talk);
  show.revealed = false;
  s.show = show;
  ctx.fx({ t: 'sfx', name: 'drumroll' });
}

function finish(ctx: GameCtx, s: TambolaState) {
  s.phase = 'final';
  s.show = null;
  s.queue = [];
  const stars: Record<string, number> = {};
  for (const p of PRIZES) {
    const w = s.prizes[p.id];
    if (!w) continue;
    const each = Math.ceil(p.stars / w.winners.length);
    for (const pid of w.winners) stars[pid] = (stars[pid] || 0) + each;
  }
  for (const pid in s.bogeys) stars[pid] = Math.max(0, (stars[pid] || 0) - s.bogeys[pid]);
  s.stars = stars;
  ctx.end(stars);
  ctx.fx({ t: 'sfx', name: 'fanfare' });
  ctx.fx({ t: 'confetti', big: true });
  ctx.fx({ t: 'voice', key: 'final' });
}

export const tambola: GameModule<TambolaState, TambolaSettings> = {
  id: 'tambola',
  defaults: { speed: 'normal', tickets: 1, prizes: ['early5', 'top', 'middle', 'bottom', 'corners', 'full'] },

  create(ctx, settings) {
    const now = ctx.now();
    const s: TambolaState = {
      id: randomId(6),
      phase: 'intro',
      settings: { ...settings, prizes: settings.prizes.indexOf('full') >= 0 ? settings.prizes : settings.prizes.concat('full') },
      tickets: {},
      bag: shuffle(Array.from({ length: 90 }, (_, i) => i + 1)),
      called: [],
      nextAt: 0,
      paused: false,
      pauseLeft: 0,
      introUntil: now + Math.max(INTRO_MS, ctx.voiceMs('start') + 1200),
      prizes: {},
      show: null,
      queue: [],
      jail: {},
      bogeys: {},
      lastClaim: {},
      seq: 0,
      stars: {},
    };
    for (const p of ctx.players()) this.join!(ctx, s, p.id);
    ctx.fx({ t: 'voice', key: 'start' });
    return s;
  },

  join(_ctx, s, pid) {
    if (s.tickets[pid] || s.phase === 'final') return false;
    s.tickets[pid] = Array.from({ length: s.settings.tickets }, makeTicket);
    return true;
  },

  tick(ctx, s) {
    const now = ctx.now();
    if (s.phase === 'intro') {
      if (now >= s.introUntil) {
        s.phase = 'calling';
        s.nextAt = now + 800;
        return true;
      }
      return false;
    }
    if (s.phase !== 'calling') return false;

    if (s.show) {
      const show = s.show;
      if (!show.revealed && now >= show.at + SUSPENSE_MS) {
        show.revealed = true;
        const fb = s.lastClaim[show.pid];
        if (fb && fb.seq === show.seq) fb.revealed = true;
        if (show.valid) {
          ctx.fx({ t: 'sfx', name: 'fanfare' });
          ctx.fx({ t: 'voice', key: show.prize });
          ctx.fx({ t: 'confetti', big: show.prize === 'full' });
        } else {
          ctx.fx({ t: 'sfx', name: 'buzzer' });
          ctx.fx({ t: 'voice', key: 'bogey' });
        }
        return true;
      }
      if (now >= show.until) {
        s.show = null;
        const next = s.queue.shift();
        if (next) {
          startShow(ctx, s, next);
          return true;
        }
        const all = enabledPrizes(s).every((id) => !!s.prizes[id]);
        if (s.prizes.full || all) {
          finish(ctx, s);
          return true;
        }
        s.nextAt = Math.max(s.nextAt, now + 2000);
        return true;
      }
      return false;
    }

    if (!s.paused && now >= s.nextAt) {
      const n = s.bag.pop();
      if (n === undefined) {
        finish(ctx, s);
        return true;
      }
      s.called.push(n);
      ctx.fx({ t: 'voice', key: 'n' + n });
      // give the announcer time to finish (plus a breath) before the next number
      let talk = ctx.voiceMs('n' + n);
      const extra = announcement(ctx, s);
      if (extra) {
        ctx.fx({ t: 'voice', key: extra });
        talk += ctx.voiceMs(extra) + 300;
      }
      s.nextAt = now + Math.max(interval(s), talk + 1500);
      return true;
    }
    return false;
  },

  action(ctx, s, pid, a) {
    if (!a || a.k !== 'claim' || s.phase !== 'calling') return false;
    const prize = a.prize as PrizeId;
    if (enabledPrizes(s).indexOf(prize) < 0) return false;
    const seq = ++s.seq;
    if ((s.jail[pid] || 0) > s.called.length) {
      s.lastClaim[pid] = { prize, ok: false, seq, revealed: true, note: 'jail' };
      return true;
    }
    if (!prizeOpen(s, prize, pid)) {
      s.lastClaim[pid] = { prize, ok: false, seq, revealed: true, note: 'gone' };
      return true;
    }
    const pending = (s.show ? [s.show] : []).concat(s.queue);
    if (pending.some((c) => c.pid === pid && c.prize === prize)) return false;

    const called = new Set(s.called);
    const tickets = s.tickets[pid] || [];
    let ticket = tickets.findIndex((t) => missing(t, prize, called) === 0);
    const valid = ticket >= 0;
    if (!valid) ticket = 0;
    const cells = valid ? winningCells(tickets[ticket], prize, called) : [];
    if (valid) {
      const w = s.prizes[prize];
      if (w) w.winners.push(pid);
      else s.prizes[prize] = { winners: [pid], atCall: s.called.length };
    } else {
      s.jail[pid] = s.called.length + JAIL_CALLS;
      s.bogeys[pid] = (s.bogeys[pid] || 0) + 1;
    }
    s.lastClaim[pid] = { prize, ok: valid, seq, revealed: false };
    const show: ClaimShow = { pid, prize, valid, ticket, cells, seq, at: 0, until: 0, revealed: false };
    if (s.show) s.queue.push(show);
    else startShow(ctx, s, show);
    return true;
  },

  control(ctx, s, cmd) {
    const now = ctx.now();
    if (cmd === 'pause' && !s.paused) {
      s.paused = true;
      s.pauseLeft = Math.max(0, s.nextAt - now);
      return true;
    }
    if (cmd === 'resume' && s.paused) {
      s.paused = false;
      s.nextAt = now + Math.max(1500, s.pauseLeft);
      return true;
    }
    if (cmd === 'skip' && s.phase === 'calling' && !s.show) {
      s.paused = false;
      s.nextAt = now;
      return true;
    }
    if (cmd === 'skip' && s.phase === 'intro') {
      s.introUntil = now;
      return true;
    }
    return false;
  },

  isPaused(s) {
    return s.paused;
  },

  view(ctx, s, pid) {
    const name = (id: string) => {
      const p = ctx.player(id);
      return p ? p.avatar + ' ' + p.name : '?';
    };
    return {
      id: s.id,
      phase: s.phase,
      paused: s.paused,
      tickets: s.tickets[pid] || [],
      called: s.called,
      prizes: enabledPrizes(s).map((id) => {
        const w = s.prizes[id];
        return {
          id,
          winners: w ? w.winners.map(name) : [],
          open: prizeOpen(s, id, pid),
          mine: !!w && w.winners.indexOf(pid) >= 0,
        };
      }),
      jail: Math.max(0, (s.jail[pid] || 0) - s.called.length),
      claim: s.lastClaim[pid] || null,
      stars: s.phase === 'final' ? s.stars[pid] || 0 : undefined,
    };
  },

  bot(ctx, s, pid) {
    if (s.phase !== 'calling' || s.show) return false;
    const called = new Set(s.called);
    const tickets = s.tickets[pid] || [];
    for (const prize of enabledPrizes(s)) {
      if (!prizeOpen(s, prize, pid)) continue;
      if (tickets.some((t) => missing(t, prize, called) === 0) && Math.random() < 0.06) {
        return this.action(ctx, s, pid, { k: 'claim', prize });
      }
    }
    if (Math.random() < 0.0004 && s.called.length > 10) {
      const open = enabledPrizes(s).filter((p) => prizeOpen(s, p, pid));
      if (open.length) return this.action(ctx, s, pid, { k: 'claim', prize: open[0] });
    }
    return false;
  },
};
