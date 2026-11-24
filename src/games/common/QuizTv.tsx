import type { Room } from '../../host/room';
import type { Player } from '../types';
import { fmt, secondsLeft, useNow } from '../../lib/hooks';
import { Emo } from '../../lib/Emo';
import { Avatar, PausedOverlay, TimerBar } from '../../tv/common';
import { GAME_META } from '../registry';
import { emojisShown, potentialPoints, ranks, YEAR_MAX, YEAR_MIN, type QuizState } from './quizRunner';

export const OPTION_COLORS = ['#ff4d8d', '#4cc9f0', '#ffb703', '#06d6a0'];
export const OPTION_SHAPES = ['▲', '◆', '●', '■'];

const CFG = { emoji: { base: 300, speed: 700 }, quiz: { base: 500, speed: 500 } };

export function QuizTv({ room, s }: { room: Room; s: QuizState }) {
  const now = useNow(150);
  const meta = GAME_META[s.game];
  const players = room.s.players.filter((p) => p.connected || p.bot || s.scores[p.id]);
  const q = s.qs[s.qi];
  const shownNow = s.paused ? s.pausedAt : now;

  let body;
  if (s.phase === 'intro') {
    body = (
      <div className="qz-intro">
        <Emo e={meta.icon} size={190} className="wobble" />
        <h1 style={{ color: meta.accent }}>{meta.title}</h1>
        <p className="qz-tag">{meta.tagline}</p>
        <ul className="qz-rules">
          {meta.rules.map((r, i) => (
            <li key={i} style={{ animationDelay: 0.3 + i * 0.4 + 's' }}>
              {r}
            </li>
          ))}
        </ul>
        <div className="countdown">{secondsLeft(s.endsAt, shownNow)}</div>
      </div>
    );
  } else if (s.phase === 'question' || s.phase === 'reveal') {
    const reveal = s.phase === 'reveal';
    body = (
      <div className={'qz-q ' + (reveal ? 'is-reveal' : 'is-question')}>
        <div className="qz-head">
          <span className="qz-num">
            Question {s.qi + 1}/{s.qs.length}
          </span>
          <span className="qz-cat">
            <Emo e={q.icon} size={40} /> {q.cat}
          </span>
          {q.double && <span className="qz-double">💥 DOUBLE POINTS ×2</span>}
          {q.kind === 'tf' && <span className="qz-kind">True or False?</span>}
          {q.kind === 'year' && <span className="qz-kind">Guess the Year! 📅</span>}
          {!reveal && <span className="qz-secs">{secondsLeft(s.endsAt, shownNow)}</span>}
        </div>
        {!reveal && <TimerBar startedAt={s.startedAt} endsAt={s.endsAt} now={shownNow} paused={s.paused} />}

        {q.emojis ? (
          <div className="emoji-row">
            {q.emojis.map((e, i) => {
              const visible = reveal || i < emojisShown(q, s.startedAt, shownNow);
              return (
                <div key={i} className={'emoji-slot' + (visible ? ' show' : '')}>
                  {visible ? <Emo e={e} size={190} /> : <span className="emoji-q">?</span>}
                </div>
              );
            })}
          </div>
        ) : (
          <h2 className={'qz-prompt' + ((q.prompt || '').length > 60 ? ' long' : '')}>{q.prompt}</h2>
        )}

        {q.kind === 'year' ? <YearPanel room={room} s={s} reveal={reveal} /> : <Options room={room} s={s} reveal={reveal} />}

        {!reveal && (
          <div className="qz-foot">
            <div className="answered">
              {players.map((p) => (
                <div key={p.id} className={'ans-dot' + (s.answers[p.id] ? ' done' : '')}>
                  <Avatar p={p} size={66} dim={!s.answers[p.id]} />
                </div>
              ))}
            </div>
            {q.kind !== 'year' && (
              <div className="pts-now">
                Lock in now: <b>{fmt(potentialPoints(CFG[s.game], q, s.startedAt, s.endsAt, shownNow))}</b> pts 📉
              </div>
            )}
          </div>
        )}
        {reveal && <RevealFoot room={room} s={s} />}
      </div>
    );
  } else if (s.phase === 'board') {
    body = <Board room={room} s={s} />;
  } else {
    body = <Podium room={room} s={s} />;
  }

  return (
    <div className={'qz game-' + s.game}>
      {body}
      {s.paused && <PausedOverlay />}
    </div>
  );
}

function pickers(room: Room, s: QuizState, v: number): Player[] {
  const out: Player[] = [];
  for (const pid in s.answers) {
    if (s.answers[pid].v === v) {
      const p = room.ctx.player(pid);
      if (p) out.push(p);
    }
  }
  return out;
}

function Options({ room, s, reveal }: { room: Room; s: QuizState; reveal: boolean }) {
  const q = s.qs[s.qi];
  const opts = q.options || [];
  return (
    <div className={'qz-options n' + opts.length}>
      {opts.map((o, i) => {
        const ok = reveal && i === q.correct;
        const who = reveal ? pickers(room, s, i) : [];
        return (
          <div
            key={i}
            className={'qz-opt' + (reveal ? (ok ? ' right' : ' wrong') : '')}
            style={{ background: OPTION_COLORS[i % 4], animationDelay: i * 0.08 + 's' }}
          >
            <span className="shape">{ok ? '✔' : OPTION_SHAPES[i % 4]}</span>
            <span className="opt-text">{o}</span>
            {reveal && (
              <span className="opt-who">
                {who.slice(0, 8).map((p) => (
                  <Emo key={p.id} e={p.avatar} size={44} />
                ))}
                {who.length > 8 && <b>+{who.length - 8}</b>}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function YearPanel({ room, s, reveal }: { room: Room; s: QuizState; reveal: boolean }) {
  const q = s.qs[s.qi];
  if (!reveal) {
    return (
      <div className="year-panel">
        <div className="year-range">
          <span>{YEAR_MIN}</span>
          <Emo e="📅" size={120} />
          <span>{YEAR_MAX}</span>
        </div>
        <p>Pick the year on your phone — the closer, the more points! Exact = 1000 🎯</p>
      </div>
    );
  }
  const guesses = Object.keys(s.answers).map((pid) => ({ p: room.ctx.player(pid), v: s.answers[pid].v }));
  const vals = guesses.map((g) => g.v).concat(q.correct);
  const lo = Math.min.apply(null, vals) - 2;
  const hi = Math.max.apply(null, vals) + 2;
  const pos = (y: number) => ((y - lo) / Math.max(1, hi - lo)) * 100;
  // stack avatars that guessed the same year
  const stacks: Record<number, number> = {};
  return (
    <div className="year-line-wrap">
      <div className="year-answer">
        Correct answer: <b>{q.correct}</b>
      </div>
      <div className="year-line">
        <div className="yl-axis" />
        <div className="yl-correct" style={{ left: pos(q.correct) + '%' }}>
          <span>{q.correct}</span>
        </div>
        {guesses.map((g, i) => {
          if (!g.p) return null;
          const k = (stacks[g.v] = (stacks[g.v] || 0) + 1);
          return (
            <div key={i} className="yl-guess" style={{ left: pos(g.v) + '%', bottom: 40 + (k - 1) * 72 }}>
              <Emo e={g.p.avatar} size={60} />
              {k === 1 && <small>{g.v}</small>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RevealFoot({ room, s }: { room: Room; s: QuizState }) {
  const q = s.qs[s.qi];
  const correct = Object.keys(s.answers)
    .filter((pid) => s.answers[pid].ok)
    .sort((a, b) => s.answers[a].at - s.answers[b].at);
  const fastest = correct[0] ? room.ctx.player(correct[0]) : undefined;
  const fastMs = correct[0] ? s.answers[correct[0]].at - s.qStart : 0;
  const top = Object.keys(s.gains)
    .filter((pid) => s.gains[pid] > 0)
    .sort((a, b) => s.gains[b] - s.gains[a])
    .slice(0, 5);
  const answerText = q.kind === 'year' ? String(q.correct) : (q.options || [])[q.correct];
  return (
    <div className="reveal-foot">
      <div className="reveal-answer">
        {q.emojis && <div className="big-answer">🎬 {answerText}</div>}
        {q.extra && <div className="reveal-extra">💡 {q.extra}</div>}
        {fastest && q.kind !== 'year' && (
          <div className="fastest">
            ⚡ Fastest: <b style={{ color: fastest.color }}>{fastest.name}</b> <small>({(Math.max(0, fastMs) / 1000).toFixed(1)}s)</small>
          </div>
        )}
        {correct.length === 0 && Object.keys(s.answers).length > 0 && <div className="fastest">😅 Nobody got this one!</div>}
      </div>
      <div className="gains">
        {top.map((pid) => {
          const p = room.ctx.player(pid);
          if (!p) return null;
          return (
            <div key={pid} className="gain-row">
              <Emo e={p.avatar} size={44} />
              <span style={{ color: p.color }}>{p.name}</span>
              <b>+{fmt(s.gains[pid])}</b>
              {(s.streak[pid] || 0) >= 2 && <span className="streak">🔥{s.streak[pid]}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Board({ room, s }: { room: Room; s: QuizState }) {
  const pids = room.s.players.map((p) => p.id).filter((id) => s.played[id] || s.scores[id]);
  const r = ranks(s.scores, pids);
  const hasPrev = Object.keys(s.boardFrom).length > 0;
  const prevR = ranks(s.boardFrom, pids);
  const sorted = pids.slice().sort((a, b) => r[a] - r[b]).slice(0, 10);
  const max = Math.max(1, ...sorted.map((id) => s.scores[id] || 0));
  return (
    <div className="board">
      <h1>
        <Emo e="📊" size={70} /> Scoreboard <small>— {s.qs.length - s.qi - 1} questions left</small>
      </h1>
      <div className="board-rows">
        {sorted.map((pid, i) => {
          const p = room.ctx.player(pid)!;
          const sc = s.scores[pid] || 0;
          const prev = s.boardFrom[pid] || 0;
          const moved = hasPrev ? (prevR[pid] || r[pid]) - r[pid] : 0;
          return (
            <div key={pid} className="board-row" style={{ animationDelay: i * 0.07 + 's' }}>
              <span className="br-rank">{r[pid]}</span>
              <Avatar p={p} size={64} />
              <span className="br-name" style={{ color: p.color }}>
                {p.name}
                {(s.streak[pid] || 0) >= 2 && <span className="streak"> 🔥{s.streak[pid]}</span>}
              </span>
              <div className="br-bar">
                <div
                  className="br-fill"
                  style={
                    {
                      width: (sc / max) * 100 + '%',
                      background: p.color,
                      '--from': prev / Math.max(1, sc),
                    } as any
                  }
                />
              </div>
              <span className="br-score">{fmt(sc)}</span>
              <span className="br-gain">{sc - prev > 0 ? '+' + fmt(sc - prev) : ''}</span>
              <span className={'br-move' + (moved > 0 ? ' up' : moved < 0 ? ' down' : '')}>
                {moved > 0 ? '▲' + moved : moved < 0 ? '▼' + -moved : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Podium({ room, s }: { room: Room; s: QuizState }) {
  const pids = room.s.players.map((p) => p.id).filter((id) => s.played[id]);
  const r = ranks(s.scores, pids);
  const sorted = pids.slice().sort((a, b) => r[a] - r[b]);
  const top = sorted.slice(0, 3);
  const rest = sorted.slice(3, 12);
  const order = [top[1], top[0], top[2]];
  const heights = [220, 290, 170];
  const medals = ['🥈', '🥇', '🥉'];
  return (
    <div className="podium-wrap">
      <h1>
        <Emo e="🏆" size={86} /> And the winners are…
      </h1>
      <div className="podium">
        {order.map((pid, i) => {
          const p = pid ? room.ctx.player(pid) : undefined;
          if (!p) return <div key={i} className="pod empty" />;
          return (
            <div key={pid} className={'pod pod-' + i} style={{ animationDelay: [0.8, 1.6, 0.2][i] + 's' }}>
              <Avatar p={p} size={i === 1 ? 170 : 130} crown={i === 1} />
              <div className="pod-name" style={{ color: p.color }}>
                {p.name}
              </div>
              <div className="pod-score">{fmt(s.scores[pid] || 0)}</div>
              <div className="pod-block" style={{ height: heights[i], borderColor: p.color }}>
                <span>{medals[i]}</span>
                <small>+⭐{s.stars[pid] || 0}</small>
              </div>
            </div>
          );
        })}
      </div>
      {rest.length > 0 && (
        <div className="rest">
          {rest.map((pid) => {
            const p = room.ctx.player(pid)!;
            return (
              <span key={pid}>
                {r[pid]}. <Emo e={p.avatar} size={36} /> {p.name} <b>{fmt(s.scores[pid] || 0)}</b>
              </span>
            );
          })}
        </div>
      )}
      <p className="final-hint">Captain — pick the next game on your phone! (TV remote: OK = lobby)</p>
    </div>
  );
}
