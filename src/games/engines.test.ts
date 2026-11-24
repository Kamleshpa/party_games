import { describe, expect, it } from 'vitest';
import { makeTicket, missing, ticketNumbers } from './tambola/tickets';
import { tambola, type TambolaState } from './tambola/engine';
import { emoji } from './emoji/engine';
import { quiz, buildQuiz } from './quiz/engine';
import { EMOJI_MOVIES } from './emoji/data';
import { QUIZ } from './quiz/data';
import { callSpoken, callTitle } from './tambola/calls';
import type { Fx, GameCtx, Player } from './types';

function fakeCtx(n = 3) {
  let now = 1_000_000;
  const players: Player[] = Array.from({ length: n }, (_, i) => ({
    id: 'p' + i, name: 'P' + i, avatar: '🦁', color: '#fff', joinedAt: i, connId: 'c' + i,
    connected: true, lastSeen: now, stars: 0,
  }));
  const fx: Fx[] = [];
  let ended: Record<string, number> | null = null;
  const ctx: GameCtx = {
    now: () => now,
    players: () => players,
    active: () => players.filter((p) => p.connected),
    player: (id) => players.find((p) => p.id === id),
    fx: (f) => fx.push(f),
    end: (s) => { ended = s; },
  };
  return { ctx, advance: (ms: number) => (now += ms), fx, ended: () => ended, players };
}

describe('tambola tickets', () => {
  it('generates valid 3x9 tickets', () => {
    for (let i = 0; i < 500; i++) {
      const t = makeTicket();
      expect(t.length).toBe(3);
      for (const row of t) {
        expect(row.length).toBe(9);
        expect(row.filter((n) => n > 0).length).toBe(5);
      }
      const nums = ticketNumbers(t);
      expect(nums.length).toBe(15);
      expect(new Set(nums).size).toBe(15);
      for (let c = 0; c < 9; c++) {
        const col = [t[0][c], t[1][c], t[2][c]].filter((n) => n > 0);
        expect(col.length).toBeGreaterThanOrEqual(1);
        const lo = c === 0 ? 1 : c * 10;
        const hi = c === 8 ? 90 : c * 10 + 9;
        for (const n of col) expect(n >= lo && n <= hi).toBe(true);
        expect(col).toEqual(col.slice().sort((a, b) => a - b));
      }
    }
  });

  it('missing() counts correctly', () => {
    const t = makeTicket();
    const nums = ticketNumbers(t);
    expect(missing(t, 'full', new Set(nums))).toBe(0);
    expect(missing(t, 'early5', new Set(nums.slice(0, 5)))).toBe(0);
    expect(missing(t, 'early5', new Set(nums.slice(0, 3)))).toBe(2);
    expect(missing(t, 'top', new Set(t[0].filter((n) => n)))).toBe(0);
    expect(missing(t, 'full', new Set())).toBe(15);
  });

  it('has a call for every number', () => {
    for (let n = 1; n <= 90; n++) {
      expect(callTitle(n).length).toBeGreaterThan(1);
      expect(callSpoken(n).length).toBeGreaterThan(1);
    }
    expect(callTitle(25)).toBe('Two and five — twenty-five');
    expect(callTitle(22)).toBe('Two and two — twenty-two');
    expect(callTitle(7)).toBe('Single number seven');
    expect(callSpoken(25)).toBe('Two and five, twenty-five! Quarter century!');
  });
});

describe('tambola engine', () => {
  it('runs a full game: valid claim, bogey, full house', () => {
    const { ctx, advance, ended } = fakeCtx(3);
    const s: TambolaState = tambola.create(ctx, { ...tambola.defaults, speed: 'fast' });
    expect(Object.keys(s.tickets).length).toBe(3);
    advance(8000);
    tambola.tick(ctx, s);
    expect(s.phase).toBe('calling');
    // bogey: claim full house immediately
    advance(1000);
    tambola.tick(ctx, s);
    expect(s.called.length).toBe(1);
    tambola.action(ctx, s, 'p1', { k: 'claim', prize: 'full' });
    expect(s.show && s.show.valid).toBe(false);
    expect(s.jail.p1).toBe(1 + 3);
    // while the bogey show runs, numbers stop
    advance(3000);
    tambola.tick(ctx, s);
    expect(s.called.length).toBe(1);
    // call until p0 has full house
    let guard = 0;
    while (s.phase === 'calling' && guard++ < 1000) {
      advance(6000);
      tambola.tick(ctx, s);
      const called = new Set(s.called);
      if (!s.prizes.full && missing(s.tickets.p0[0], 'full', called) === 0) {
        tambola.action(ctx, s, 'p0', { k: 'claim', prize: 'full' });
        expect(s.prizes.full!.winners).toEqual(['p0']);
      }
    }
    expect(s.phase).toBe('final');
    expect(ended()).not.toBeNull();
    expect(ended()!.p0).toBeGreaterThanOrEqual(10);
  });

  it('shares a prize claimed on the same number', () => {
    const { ctx, advance } = fakeCtx(2);
    const s: TambolaState = tambola.create(ctx, tambola.defaults);
    // rig both tickets: same top row
    s.tickets.p1 = [JSON.parse(JSON.stringify(s.tickets.p0[0]))];
    advance(8000);
    tambola.tick(ctx, s);
    s.called = s.tickets.p0[0][0].filter((n) => n > 0);
    s.bag = s.bag.filter((n) => s.called.indexOf(n) < 0);
    tambola.action(ctx, s, 'p0', { k: 'claim', prize: 'top' });
    tambola.action(ctx, s, 'p1', { k: 'claim', prize: 'top' });
    expect(s.prizes.top!.winners).toEqual(['p0', 'p1']);
    expect(s.queue.length).toBe(1);
  });
});

describe('quiz engines', () => {
  it('emoji data is sane', () => {
    const names = EMOJI_MOVIES.map((m) => m.a);
    expect(new Set(names).size).toBe(names.length);
    for (const m of EMOJI_MOVIES) expect(m.e.length).toBeGreaterThanOrEqual(3);
  });

  it('quiz data is sane', () => {
    for (const q of QUIZ) {
      if (q.k === 'mcq') {
        expect(q.o.length).toBe(4);
        expect(new Set(q.o).size).toBe(4);
      }
      if (q.k === 'year') expect(q.a >= 1970 && q.a <= 2010).toBe(true);
    }
    const qs = buildQuiz({ rounds: 12 });
    expect(qs.length).toBe(12);
    expect(qs.filter((q) => q.double).length).toBe(2);
    for (const q of qs) if (q.kind !== 'year') expect(q.options![q.correct]).toBeTruthy();
  });

  it('scores fast correct answers higher and runs to final', () => {
    const { ctx, advance, ended } = fakeCtx(3);
    const s = emoji.create(ctx, { rounds: 8, cat: 'mix' });
    advance(10000);
    emoji.tick(ctx, s);
    expect(s.phase).toBe('question');
    const q = s.qs[0];
    advance(1000);
    emoji.action(ctx, s, 'p0', { k: 'ans', v: q.correct });
    advance(8000);
    emoji.action(ctx, s, 'p1', { k: 'ans', v: q.correct });
    emoji.action(ctx, s, 'p2', { k: 'ans', v: (q.correct + 1) % 4 });
    expect(s.answers.p0.pts).toBeGreaterThan(s.answers.p1.pts);
    expect(s.answers.p2.pts).toBe(0);
    // all answered -> ends after a short grace period
    emoji.tick(ctx, s);
    expect(s.phase).toBe('question');
    advance(1000);
    emoji.tick(ctx, s);
    expect(s.phase).toBe('reveal');
    expect(s.scores.p0).toBeGreaterThan(s.scores.p1);
    let guard = 0;
    while (s.phase !== 'final' && guard++ < 500) {
      advance(5000);
      emoji.tick(ctx, s);
    }
    expect(s.phase).toBe('final');
    expect(ended()!.p0).toBe(10);
  });

  it('year questions score by distance', () => {
    const { ctx, advance } = fakeCtx(2);
    const s = quiz.create(ctx, { rounds: 8 });
    s.qs[0] = { kind: 'year', prompt: 'x', correct: 1995, cat: 'x', icon: 'x', duration: 20000 };
    advance(10000);
    quiz.tick(ctx, s);
    quiz.action(ctx, s, 'p0', { k: 'ans', v: 1995 });
    quiz.action(ctx, s, 'p1', { k: 'ans', v: 1998 });
    expect(s.answers.p0.pts).toBe(1000);
    expect(s.answers.p1.pts).toBe(300);
  });
});
