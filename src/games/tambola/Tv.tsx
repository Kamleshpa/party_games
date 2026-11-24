import { useMemo } from 'react';
import type { Room } from '../../host/room';
import { useNow } from '../../lib/hooks';
import { Emo } from '../../lib/Emo';
import { Avatar, PausedOverlay } from '../../tv/common';
import { callFun, callTitle } from './calls';
import { SPEED_MS, prizeOpen, type TambolaState } from './engine';
import { missing, PRIZES, type PrizeId, type Ticket } from './tickets';

const prizeMeta = (id: PrizeId) => PRIZES.find((p) => p.id === id)!;

export function TicketView({ t, called, win, big }: { t: Ticket; called: Set<number>; win?: number[]; big?: boolean }) {
  return (
    <div className={'ticket' + (big ? ' big' : '')}>
      {t.map((row, r) =>
        row.map((n, c) => (
          <div
            key={r + '-' + c}
            className={'tcell' + (n === 0 ? ' blank' : '') + (n && called.has(n) ? ' called' : '') + (n && win && win.indexOf(n) >= 0 ? ' win' : '')}
          >
            {n || ''}
          </div>
        )),
      )}
    </div>
  );
}

export function TambolaTv({ room, s }: { room: Room; s: TambolaState }) {
  const now = useNow(200);
  const players = room.s.players;
  const player = (id: string) => room.ctx.player(id);
  const calledKey = s.called.length + ':' + Object.keys(s.prizes).length;

  const near = useMemo(() => {
    const called = new Set(s.called);
    const out: { pid: string; prize: PrizeId }[] = [];
    const order = PRIZES.slice().sort((a, b) => b.stars - a.stars);
    for (const pr of order) {
      if (s.settings.prizes.indexOf(pr.id) < 0 || s.prizes[pr.id]) continue;
      for (const p of players) {
        if (!(p.connected || p.bot)) continue;
        const ts = s.tickets[p.id] || [];
        if (ts.some((t) => missing(t, pr.id, called) === 1) && !out.some((o) => o.pid === p.id)) out.push({ pid: p.id, prize: pr.id });
      }
    }
    return out.slice(0, 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calledKey, players.length]);

  if (s.phase === 'intro') {
    const left = Math.max(0, Math.ceil((s.introUntil - now) / 1000));
    return (
      <div className="tam-intro">
        <Emo e="🎟️" size={200} className="wobble" />
        <h1>Tickets are out!</h1>
        <p>Check your phone for your ticket 📱 — tap numbers as they're called</p>
        <div className="intro-avatars">
          {players.map((p, i) => (
            <div key={p.id} className="deal-in" style={{ animationDelay: i * 0.12 + 's' }}>
              <Avatar p={p} size={92} />
            </div>
          ))}
        </div>
        <div className="countdown">{left}</div>
      </div>
    );
  }

  if (s.phase === 'final') return <TambolaFinal room={room} s={s} />;

  const last = s.called[s.called.length - 1];
  const prev = s.called.slice(-8, -1).reverse();
  const called = new Set(s.called);
  const interval = SPEED_MS[s.settings.speed] || 8500;
  const nextFrac = s.paused || s.show ? 0 : Math.max(0, Math.min(1, 1 - (s.nextAt - now) / interval));

  return (
    <div className="tam">
      <div className="tam-head">
        <h1>
          <Emo e="🎟️" size={64} /> Tambola Night
        </h1>
        <div className="tam-count">
          <b>{s.called.length}</b>/90 numbers
        </div>
      </div>

      <div className="tam-left">
        <div className="ball-wrap">
          {last ? (
            <div key={last} className="ball roll-in">
              <span>{last}</span>
            </div>
          ) : (
            <div className="ball waiting">
              <span>?</span>
            </div>
          )}
        </div>
        <div className="call-title">{last ? callTitle(last) : 'First number coming up…'}</div>
        <div className="call-fun">{last ? callFun(last) : ''}</div>
        <div className="next-bar">
          <div style={{ width: nextFrac * 100 + '%' }} />
        </div>
        <div className="prev-balls">
          {prev.map((n) => (
            <span key={n} className="ball-sm">
              {n}
            </span>
          ))}
        </div>
      </div>

      <div className="tam-board">
        {Array.from({ length: 90 }, (_, i) => i + 1).map((n) => (
          <div key={n} className={'bcell' + (called.has(n) ? ' on' : '') + (n === last ? ' last' : '')}>
            {n}
          </div>
        ))}
      </div>

      <div className="tam-prizes">
        {PRIZES.filter((p) => s.settings.prizes.indexOf(p.id) >= 0).map((p) => {
          const w = s.prizes[p.id];
          return (
            <div key={p.id} className={'prize-chip' + (w ? ' won' : '')}>
              <div className="prize-name">
                {p.name} <small>⭐{p.stars}</small>
              </div>
              <div className="prize-who">
                {w
                  ? w.winners.slice(0, 3).map((id) => {
                      const pl = player(id);
                      return pl ? (
                        <span key={id} style={{ color: pl.color }}>
                          <Emo e={pl.avatar} size={34} /> {pl.name}
                        </span>
                      ) : null;
                    })
                  : 'Still open!'}
              </div>
            </div>
          );
        })}
      </div>

      <div className="tam-near">
        {near.length > 0 ? (
          <>
            <span className="near-label">🔥 One number away:</span>
            {near.map((x) => {
              const pl = player(x.pid);
              return pl ? (
                <span key={x.pid} className="near-chip" style={{ borderColor: pl.color }}>
                  <Emo e={pl.avatar} size={36} /> {pl.name} <small>{prizeMeta(x.prize).name}</small>
                </span>
              ) : null;
            })}
          </>
        ) : (
          <span className="near-label dim">👀 Watching everyone's tickets…</span>
        )}
      </div>

      {s.show && <ClaimOverlay room={room} s={s} />}
      {s.paused && !s.show && <PausedOverlay />}
    </div>
  );
}

function ClaimOverlay({ room, s }: { room: Room; s: TambolaState }) {
  const show = s.show!;
  const p = room.ctx.player(show.pid);
  if (!p) return null;
  const pm = prizeMeta(show.prize);
  const ticket = (s.tickets[show.pid] || [])[show.ticket];
  const called = new Set(s.called);
  const w = s.prizes[show.prize];
  const others = w ? w.winners.filter((id) => id !== show.pid) : [];
  const cls = !show.revealed ? 'checking' : show.valid ? 'valid' : 'bogey';
  return (
    <div className={'claim-overlay ' + cls}>
      <div className="claim-card">
        <div className="claim-who">
          <Avatar p={p} size={130} />
          <div>
            <h2 style={{ color: p.color }}>{p.name}</h2>
            <p>
              claims <b>{pm.name}</b>!
            </p>
          </div>
        </div>
        {!show.revealed && (
          <div className="claim-verdict">
            <Emo e="🥁" size={110} className="shake" /> <span>Checking…</span>
          </div>
        )}
        {show.revealed && show.valid && (
          <div className="claim-verdict ok">
            ✅ CORRECT! <small>+⭐{pm.stars}</small>
            {others.length > 0 && <div className="shared">Prize will be shared 🤝</div>}
          </div>
        )}
        {show.revealed && !show.valid && (
          <div className="claim-verdict bad">
            🚨 BOGEY! 🚨
            <div className="shared">False claim! 3 numbers in jail 🔒</div>
          </div>
        )}
        {ticket && show.revealed && <TicketView t={ticket} called={called} win={show.valid ? show.cells : undefined} big />}
        {!show.valid && show.revealed && prizeOpen(s, show.prize) && <p className="claim-note">{pm.name} is still open!</p>}
      </div>
    </div>
  );
}

function TambolaFinal({ room, s }: { room: Room; s: TambolaState }) {
  const player = (id: string) => room.ctx.player(id);
  const bogeys = Object.keys(s.bogeys).sort((a, b) => s.bogeys[b] - s.bogeys[a]);
  const king = bogeys[0] ? player(bogeys[0]) : undefined;
  return (
    <div className="tam-final">
      <h1>
        <Emo e="🏆" size={90} /> Tambola Results
      </h1>
      <div className="final-prizes">
        {PRIZES.filter((p) => s.settings.prizes.indexOf(p.id) >= 0).map((p) => {
          const w = s.prizes[p.id];
          return (
            <div key={p.id} className={'final-row' + (p.id === 'full' ? ' gold' : '')}>
              <span className="fr-name">{p.name}</span>
              <span className="fr-who">
                {w
                  ? w.winners.map((id) => {
                      const pl = player(id);
                      return pl ? (
                        <span key={id} style={{ color: pl.color }}>
                          <Emo e={pl.avatar} size={52} /> {pl.name}
                        </span>
                      ) : null;
                    })
                  : '— nobody —'}
              </span>
              <span className="fr-stars">⭐{p.stars}</span>
            </div>
          );
        })}
      </div>
      {king && (
        <p className="bogey-king">
          🚨 Bogey King: <b style={{ color: king.color }}>{king.name}</b> ({s.bogeys[king.id]}×) 😂
        </p>
      )}
      <p className="final-hint">Captain — pick the next game on your phone! (TV remote: OK = lobby)</p>
    </div>
  );
}
