import { useEffect, useState } from 'react';
import type { PlayerView } from '../../shared/types';
import type { PlayerClient } from '../../phone/client';
import { fmt, secondsLeft, useNow } from '../../lib/hooks';
import { vibrate } from '../../lib/sfx';
import { FinalButtons } from '../../phone/common';
import { GAME_META } from '../registry';
import { OPTION_COLORS, OPTION_SHAPES } from './QuizTv';
import { YEAR_MAX, YEAR_MIN } from './quizRunner';

const CFG: Record<string, { base: number; speed: number }> = { emoji: { base: 300, speed: 700 }, quiz: { base: 500, speed: 500 }, filmy: { base: 300, speed: 700 } };

export function QuizPhone({ client, v, g }: { client: PlayerClient; v: PlayerView; g: any }) {
  const now = useNow(200, client.offset);
  const meta = GAME_META[g.game as 'emoji' | 'quiz' | 'filmy'];
  const [year, setYear] = useState(1990);

  const key = g.phase + ':' + g.qi;
  useEffect(() => {
    if (g.phase === 'question') {
      vibrate(40);
      setYear(1990);
    }
    if (g.phase === 'reveal' && g.my) vibrate(g.my.ok ? [60, 50, 60] : 250);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const rankLine = g.rank ? `#${g.rank} of ${g.count}` : '';

  if (g.phase === 'intro') {
    return (
      <div className="qp center">
        <div className="ph-logo">{meta.icon}</div>
        <h1 className="ph-title small" style={{ color: meta.accent }}>
          {meta.title}
        </h1>
        <p className="ph-sub">📺 Read the rules on the TV — starting soon!</p>
        <div className="countdown-ph">{secondsLeft(g.endsAt, now)}</div>
      </div>
    );
  }

  if (g.phase === 'board') {
    return (
      <div className="qp center">
        <div className="ph-logo">📊</div>
        <h1 className="ph-title small">You're {rankLine}!</h1>
        <p className="big-score">{fmt(g.score)} pts</p>
        {g.streak >= 2 && <p className="streak-big">🔥 {g.streak} in a row!</p>}
        <p className="ph-sub">📺 Check the scoreboard on the TV</p>
      </div>
    );
  }

  if (g.phase === 'final') {
    return (
      <div className="qp center">
        <div className="ph-logo">{g.rank === 1 ? '🏆' : g.rank === 2 ? '🥈' : g.rank === 3 ? '🥉' : '🎉'}</div>
        <h1 className="ph-title small">{g.rank === 1 ? 'You won!!' : `You finished ${rankLine}`}</h1>
        <p className="big-score">{fmt(g.score)} pts</p>
        {g.stars ? <p className="big-stars">Party ⭐ +{g.stars}</p> : null}
        <FinalButtons client={client} v={v} />
      </div>
    );
  }

  const header = (
    <div className="qp-head">
      <span>
        {g.icon} Question {g.qi + 1}/{g.total}
      </span>
      {g.double && <span className="qp-double">💥 ×2</span>}
      {g.phase === 'question' && <span className={'qp-secs' + (g.endsAt - now < 5000 ? ' hot' : '')}>{g.paused ? '⏸' : secondsLeft(g.endsAt, now)}</span>}
    </div>
  );

  if (g.phase === 'reveal') {
    const my = g.my;
    const correctText = g.kind === 'year' ? String(g.correct) : (g.options || [])[g.correct];
    let cls = 'none';
    let title = '😴 No answer!';
    let sub = '';
    if (my) {
      if (g.kind === 'year') {
        cls = my.diff === 0 ? 'ok' : my.pts > 0 ? 'meh' : 'bad';
        const off = `${my.diff} year${my.diff === 1 ? '' : 's'} off`;
        title = my.diff === 0 ? '🎯 Exact year!' : my.pts > 0 ? `👍 ${off}` : `🙈 ${off}`;
        sub = `You said: ${my.v}`;
      } else {
        cls = my.ok ? 'ok' : 'bad';
        title = my.ok ? '✅ Correct!' : '❌ Wrong!';
      }
    }
    return (
      <div className="qp">
        {header}
        <div className={'result-card ' + cls}>
          <h2>{title}</h2>
          {sub && <p>{sub}</p>}
          <div className="gain">{g.gain > 0 ? '+' + fmt(g.gain) : '+0'}</div>
          {g.streak >= 2 && <p className="streak-big">🔥 Streak {g.streak}!</p>}
        </div>
        <div className="correct-line">
          Correct answer: <b>{correctText}</b>
        </div>
        {g.extra && <p className="muted center-text">💡 {g.extra}</p>}
        <div className="score-line">
          Score <b>{fmt(g.score)}</b> · Rank <b>{rankLine}</b>
        </div>
      </div>
    );
  }

  // ----- question -----
  const my = g.my;
  if (my) {
    const chosen = g.kind === 'year' ? String(my.v) : (g.options || [])[my.v];
    return (
      <div className="qp">
        {header}
        <div className="locked" style={{ background: g.kind === 'year' ? '#4cc9f0' : OPTION_COLORS[my.v % 4] }}>
          <div className="lock-icon">🔒</div>
          <h2>{chosen}</h2>
          <p>{g.kind === 'year' ? 'Locked in!' : `If correct: +${fmt(my.pts)}`}</p>
        </div>
        <p className="ph-sub">Fingers crossed 🤞 · 📺 watch the TV</p>
      </div>
    );
  }

  const live = Math.round((CFG[g.game].base + CFG[g.game].speed * Math.max(0, Math.min(1, (g.endsAt - now) / Math.max(1, g.endsAt - g.startedAt)))) / 10) * 10 * (g.double ? 2 : 1) * (g.hint ? 0.5 : 1);

  return (
    <div className="qp">
      {header}
      {g.game === 'emoji' ? (
        <p className="qp-look">📺 Look at the emojis on the TV — which movie?</p>
      ) : g.game === 'filmy' && !g.prompt ? (
        <p className="qp-look">🔊 Listen to the TV — which film is this dialogue from?</p>
      ) : g.game === 'filmy' ? (
        <p className="qp-prompt">🎵 Which film is the song {g.prompt} from?</p>
      ) : (
        <p className="qp-prompt">{g.prompt}</p>
      )}
      {g.paused && <div className="tp-paused">⏸ Game paused</div>}

      {g.kind === 'year' ? (
        <div className="year-picker">
          <div className="yp-value">{year}</div>
          <input type="range" min={YEAR_MIN} max={YEAR_MAX} value={year} onChange={(e) => setYear(Number(e.target.value))} />
          <div className="yp-steps">
            {[-10, -1, +1, +10].map((d) => (
              <button
                key={d}
                className="btn"
                onClick={() => {
                  vibrate(8);
                  setYear((y) => Math.max(YEAR_MIN, Math.min(YEAR_MAX, y + d)));
                }}
              >
                {d > 0 ? '+' + d : d}
              </button>
            ))}
          </div>
          <button className="btn primary big" disabled={g.paused} onClick={() => client.game({ k: 'ans', v: year })}>
            🔒 Lock in {year}
          </button>
        </div>
      ) : (
        <div className={'qp-options n' + (g.options || []).length}>
          {(g.options || []).map((o: string, i: number) => (
            <button
              key={i}
              className="qp-opt"
              disabled={g.paused}
              style={{ background: OPTION_COLORS[i % 4] }}
              onClick={() => {
                vibrate(20);
                client.game({ k: 'ans', v: i });
              }}
            >
              <span className="shape">{OPTION_SHAPES[i % 4]}</span>
              <span>{o}</span>
            </button>
          ))}
        </div>
      )}

      {g.kind !== 'year' && (
        <div className="live-pts">
          Lock in now: <b>{fmt(live)}</b> pts
        </div>
      )}
      {g.canHint && !g.hint && g.hintsLeft > 0 && (
        <button className="btn hint-btn" onClick={() => client.game({ k: 'hint' })}>
          💡 Get a hint (half points) · {g.hintsLeft} left
        </button>
      )}
      {g.hint && <div className="hint-card">💡 {g.hint}</div>}
    </div>
  );
}
