// Shared engine for question games (Emoji Movie + 90s Kids Quiz).
// Flow: intro -> (question -> reveal [-> board]) x N -> final
import type { GameCtx, GameModule } from '../types';
import { randInt, randomId } from '../../lib/rand';

export type QKind = 'mcq' | 'tf' | 'year';

export interface RunQ {
  kind: QKind;
  prompt?: string;
  emojis?: string[];
  options?: string[];
  correct: number; // option index, or the year
  cat: string;
  icon: string;
  extra?: string; // shown at reveal
  hint?: string; // emoji lifeline
  double?: boolean;
  duration: number;
}

export interface Ans {
  v: number;
  at: number;
  pts: number;
  ok: boolean;
  diff?: number;
  hint?: boolean;
}

export type QuizPhase = 'intro' | 'question' | 'reveal' | 'board' | 'final';

export interface QuizState {
  id: string;
  game: 'emoji' | 'quiz';
  phase: QuizPhase;
  qs: RunQ[];
  qi: number;
  startedAt: number;
  endsAt: number;
  qStart: number; // when the current question began (for 'fastest' times)
  paused: boolean;
  pausedAt: number;
  answers: Record<string, Ans>;
  hintsLeft: Record<string, number>;
  hinted: Record<string, boolean>;
  scores: Record<string, number>;
  streak: Record<string, number>;
  gains: Record<string, number>;
  boardFrom: Record<string, number>; // scores at the previous leaderboard (for "+X" animation)
  stars: Record<string, number>;
  played: Record<string, boolean>;
  botPlan: Record<string, { qi: number; at: number; v: number }>;
}

export interface QuizConfig<S> {
  game: 'emoji' | 'quiz';
  defaults: S;
  build(settings: S): RunQ[];
  hints: number;
  introMs: number;
  boardEvery: number;
  /** Points for a correct mcq/tf answer = base + speed * remainingFraction */
  base: number;
  speed: number;
  botAccuracy: number;
  /** Pacing; each falls back to the quick defaults below. */
  revealMs?: number;
  boardMs?: number;
  /** Pause after everyone has locked in, before the answer shows. */
  allInMs?: number;
}

export const YEAR_MIN = 1970;
export const YEAR_MAX = 2010;
const REVEAL_MS = 7500;
const REVEAL_YEAR_MS = 9000;
const BOARD_MS = 7000;
const ALL_IN_MS = 900;
const STAR_TABLE = [10, 7, 5, 3, 2];

export function ranks(scores: Record<string, number>, pids: string[]): Record<string, number> {
  const sorted = pids.slice().sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
  const out: Record<string, number> = {};
  let rank = 0;
  let prev = NaN;
  sorted.forEach((pid, i) => {
    const sc = scores[pid] || 0;
    if (sc !== prev) rank = i + 1;
    prev = sc;
    out[pid] = rank;
  });
  return out;
}

export function yearPoints(diff: number): number {
  if (diff === 0) return 1000;
  if (diff === 1) return 700;
  if (diff === 2) return 500;
  if (diff === 3) return 300;
  if (diff <= 5) return 150;
  return 0;
}

/** How many emojis are visible at time `now` (they pop in one by one). */
export function emojisShown(q: RunQ, startedAt: number, now: number): number {
  const n = q.emojis ? q.emojis.length : 0;
  if (n <= 1) return n;
  const step = Math.min(3500, (q.duration * 0.5) / (n - 1));
  return Math.min(n, 1 + Math.floor(Math.max(0, now - startedAt) / step));
}

export function potentialPoints(cfg: { base: number; speed: number }, q: RunQ, startedAt: number, endsAt: number, now: number): number {
  const frac = Math.max(0, Math.min(1, (endsAt - now) / Math.max(1, endsAt - startedAt)));
  return Math.round((cfg.base + cfg.speed * frac) / 10) * 10 * (q.double ? 2 : 1);
}

export function makeQuizModule<S>(cfg: QuizConfig<S>): GameModule<QuizState, S> {
  const pids = (ctx: GameCtx) => ctx.players().map((p) => p.id);

  function startQuestion(ctx: GameCtx, s: QuizState, qi: number) {
    const now = ctx.now();
    s.qi = qi;
    s.phase = 'question';
    s.answers = {};
    s.hinted = {};
    s.startedAt = now;
    s.qStart = now;
    s.endsAt = now + s.qs[qi].duration;
    ctx.fx({ t: 'sfx', name: 'whoosh' });
  }

  function reveal(ctx: GameCtx, s: QuizState) {
    const now = ctx.now();
    const q = s.qs[s.qi];
    s.phase = 'reveal';
    s.startedAt = now;
    s.endsAt = now + (q.kind === 'year' ? REVEAL_YEAR_MS : cfg.revealMs || REVEAL_MS);
    s.gains = {};
    let okCount = 0;
    let exact = false;
    for (const p of ctx.players()) {
      const a = s.answers[p.id];
      if (!a) {
        if (p.connected || p.bot) s.streak[p.id] = 0;
        continue;
      }
      s.played[p.id] = true;
      let pts = a.pts;
      if (a.ok) {
        okCount++;
        const st = (s.streak[p.id] || 0) + 1;
        s.streak[p.id] = st;
        pts += Math.min(200, 50 * (st - 1)) * (q.double ? 2 : 1);
      } else {
        s.streak[p.id] = 0;
      }
      if (q.kind === 'year' && a.diff === 0) exact = true;
      a.pts = pts;
      s.gains[p.id] = pts;
      s.scores[p.id] = (s.scores[p.id] || 0) + pts;
    }
    const answered = Object.keys(s.answers).length;
    ctx.fx({ t: 'sfx', name: okCount > 0 ? 'correct' : 'wrong' });
    if (exact || (answered > 1 && okCount / answered >= 0.6)) ctx.fx({ t: 'confetti' });
  }

  function board(ctx: GameCtx, s: QuizState) {
    const now = ctx.now();
    s.phase = 'board';
    s.startedAt = now;
    s.endsAt = now + (cfg.boardMs || BOARD_MS);
    ctx.fx({ t: 'sfx', name: 'drumroll' });
  }

  function finish(ctx: GameCtx, s: QuizState) {
    s.phase = 'final';
    s.startedAt = ctx.now();
    s.endsAt = Infinity;
    const r = ranks(s.scores, pids(ctx).filter((pid) => s.played[pid]));
    const stars: Record<string, number> = {};
    for (const pid in r) stars[pid] = STAR_TABLE[r[pid] - 1] || 1;
    s.stars = stars;
    ctx.end(stars);
    ctx.fx({ t: 'sfx', name: 'fanfare' });
    ctx.fx({ t: 'confetti', big: true });
  }

  function advance(ctx: GameCtx, s: QuizState) {
    if (s.phase === 'intro') return startQuestion(ctx, s, 0);
    if (s.phase === 'question') return reveal(ctx, s);
    if (s.phase === 'reveal') {
      const last = s.qi >= s.qs.length - 1;
      if (last) return finish(ctx, s);
      if ((s.qi + 1) % cfg.boardEvery === 0) return board(ctx, s);
      return startQuestion(ctx, s, s.qi + 1);
    }
    if (s.phase === 'board') {
      s.boardFrom = { ...s.scores };
      return startQuestion(ctx, s, s.qi + 1);
    }
  }

  const mod: GameModule<QuizState, S> = {
    id: cfg.game,
    defaults: cfg.defaults,

    create(ctx, settings) {
      const now = ctx.now();
      const hintsLeft: Record<string, number> = {};
      for (const pid of pids(ctx)) hintsLeft[pid] = cfg.hints;
      return {
        id: randomId(6),
        game: cfg.game,
        phase: 'intro',
        qs: cfg.build(settings),
        qi: 0,
        startedAt: now,
        endsAt: now + cfg.introMs,
        qStart: now,
        paused: false,
        pausedAt: 0,
        answers: {},
        hintsLeft,
        hinted: {},
        scores: {},
        streak: {},
        gains: {},
        boardFrom: {},
        stars: {},
        played: {},
        botPlan: {},
      };
    },

    join(_ctx, s, pid) {
      if (s.hintsLeft[pid] === undefined) s.hintsLeft[pid] = cfg.hints;
      return true;
    },

    tick(ctx, s) {
      if (s.paused || s.phase === 'final') return false;
      const now = ctx.now();
      if (s.phase === 'question') {
        const q = s.qs[s.qi];
        if (q.emojis) {
          // little pop sound as each emoji appears
          const shown = emojisShown(q, s.startedAt, now);
          const before = emojisShown(q, s.startedAt, now - 200);
          if (shown > before) ctx.fx({ t: 'sfx', name: 'pop' });
        }
        const left = s.endsAt - now;
        if (left > 0 && left <= 5000 && Math.floor(left / 1000) !== Math.floor((left + 200) / 1000)) ctx.fx({ t: 'sfx', name: 'tick' });
        const active = ctx.active();
        const allIn = cfg.allInMs || ALL_IN_MS;
        if (active.length > 0 && active.every((p) => s.answers[p.id]) && s.endsAt - now > allIn) {
          s.endsAt = now + allIn;
          return true;
        }
      }
      if (now >= s.endsAt) {
        advance(ctx, s);
        return true;
      }
      return false;
    },

    action(ctx, s, pid, a) {
      if (!a || s.paused || s.phase !== 'question') return false;
      const now = ctx.now();
      const q = s.qs[s.qi];
      if (a.k === 'hint') {
        if (!q.hint || s.hinted[pid] || s.answers[pid] || !(s.hintsLeft[pid] > 0)) return false;
        s.hinted[pid] = true;
        s.hintsLeft[pid]--;
        return true;
      }
      if (a.k !== 'ans' || s.answers[pid] || now >= s.endsAt) return false;
      const v = Math.round(Number(a.v));
      if (!isFinite(v)) return false;
      let ans: Ans;
      if (q.kind === 'year') {
        if (v < YEAR_MIN || v > YEAR_MAX) return false;
        const diff = Math.abs(v - q.correct);
        ans = { v, at: now, diff, ok: diff <= 1, pts: yearPoints(diff) * (q.double ? 2 : 1) };
      } else {
        if (!q.options || v < 0 || v >= q.options.length) return false;
        const ok = v === q.correct;
        let pts = ok ? potentialPoints(cfg, q, s.startedAt, s.endsAt, now) : 0;
        if (s.hinted[pid]) pts = Math.round(pts / 20) * 10;
        ans = { v, at: now, ok, pts, hint: !!s.hinted[pid] };
      }
      s.answers[pid] = ans;
      ctx.fx({ t: 'sfx', name: 'lock' });
      return true;
    },

    control(ctx, s, cmd) {
      const now = ctx.now();
      if (cmd === 'pause' && !s.paused && s.phase !== 'final') {
        s.paused = true;
        s.pausedAt = now;
        return true;
      }
      if (cmd === 'resume' && s.paused) {
        const d = now - s.pausedAt;
        s.paused = false;
        s.startedAt += d;
        s.qStart += d;
        s.endsAt += d;
        return true;
      }
      if (cmd === 'skip' && !s.paused && s.phase !== 'final') {
        advance(ctx, s);
        return true;
      }
      return false;
    },

    isPaused(s) {
      return s.paused;
    },

    view(ctx, s, pid) {
      const q = s.qs[s.qi];
      const r = ranks(s.scores, pids(ctx));
      const v: any = {
        id: s.id,
        game: s.game,
        phase: s.phase,
        qi: s.qi,
        total: s.qs.length,
        paused: s.paused,
        startedAt: s.startedAt,
        endsAt: isFinite(s.endsAt) ? s.endsAt : 0,
        score: s.scores[pid] || 0,
        rank: r[pid] || 0,
        count: ctx.players().length,
        streak: s.streak[pid] || 0,
      };
      if ((s.phase === 'question' || s.phase === 'reveal') && q) {
        v.kind = q.kind;
        v.options = q.options;
        v.cat = q.cat;
        v.icon = q.icon;
        v.double = !!q.double;
        v.prompt = q.prompt;
        v.hintsLeft = s.hintsLeft[pid] || 0;
        v.canHint = !!q.hint;
        if (s.hinted[pid]) v.hint = q.hint;
        const a = s.answers[pid];
        v.my = a ? { v: a.v, pts: a.pts, ok: s.phase === 'reveal' ? a.ok : undefined, diff: s.phase === 'reveal' ? a.diff : undefined } : null;
        if (s.phase === 'reveal') {
          v.correct = q.correct;
          v.extra = q.extra;
          v.gain = s.gains[pid] || 0;
        }
      }
      if (s.phase === 'final') v.stars = s.stars[pid] || 0;
      return v;
    },

    bot(ctx, s, pid) {
      if (s.paused || s.phase !== 'question' || s.answers[pid]) return false;
      const q = s.qs[s.qi];
      let plan = s.botPlan[pid];
      if (!plan || plan.qi !== s.qi) {
        const good = Math.random() < cfg.botAccuracy;
        let v: number;
        if (q.kind === 'year') v = q.correct + (good ? randInt(-1, 1) : randInt(-8, 8));
        else {
          const n = q.options ? q.options.length : 2;
          v = good ? q.correct : (q.correct + randInt(1, n - 1)) % n;
        }
        if (q.kind === 'year') v = Math.max(YEAR_MIN, Math.min(YEAR_MAX, v));
        plan = { qi: s.qi, at: s.startedAt + randInt(1500, Math.floor(q.duration * 0.85)), v };
        s.botPlan[pid] = plan;
      }
      if (ctx.now() >= plan.at) return mod.action(ctx, s, pid, { k: 'ans', v: plan.v });
      return false;
    },
  };
  return mod;
}
