import { useEffect, useRef, useState } from 'react';
import type { PlayerView } from '../../shared/types';
import type { PlayerClient } from '../../phone/client';
import { FinalButtons, ReactionBar } from '../../phone/common';
import { load, params, save } from '../../lib/storage';
import { vibrate } from '../../lib/sfx';
import { callFun, callTitle } from './calls';
import { missing, PRIZES, type PrizeId, type Ticket } from './tickets';

interface PrizeView {
  id: PrizeId;
  winners: string[];
  open: boolean;
  mine: boolean;
}
interface TambolaView {
  id: string;
  phase: 'intro' | 'calling' | 'final';
  paused: boolean;
  tickets: Ticket[];
  called: number[];
  prizes: PrizeView[];
  jail: number;
  claim: { prize: PrizeId; ok: boolean; seq: number; revealed: boolean; note?: string } | null;
  stars?: number;
}

const pname = (id: PrizeId) => PRIZES.find((p) => p.id === id)!.name;

export function TambolaPhone({ client, v, g }: { client: PlayerClient; v: PlayerView; g: TambolaView }) {
  const marksKey = 'dpn-marks-' + g.id + (params().get('p') || '');
  const [marks, setMarks] = useState<number[]>(() => load(marksKey, []));
  const [auto, setAuto] = useState<boolean>(() => load('dpn-auto', false));
  const [confirm, setConfirm] = useState<PrizeId | null>(null);
  const [shake, setShake] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const confirmTimer = useRef<any>(null);
  const toastTimer = useRef<any>(null);

  const called = new Set(g.called);
  const last = g.called[g.called.length - 1];
  const marked = auto ? called : new Set(marks.filter((n) => called.has(n)));

  useEffect(() => {
    if (last) vibrate(30);
  }, [last]);

  useEffect(() => {
    save(marksKey, marks);
  }, [marks, marksKey]);

  const claimSeq = g.claim ? g.claim.seq + (g.claim.revealed ? 'r' : '') : '';
  const [hiddenSeq, setHiddenSeq] = useState('');
  useEffect(() => {
    const c = g.claim;
    if (!c || !c.revealed) return;
    if (c.ok) vibrate([80, 60, 80, 60, 200]);
    else vibrate(400);
    const t = setTimeout(() => setHiddenSeq(claimSeq), 6000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claimSeq]);

  function flash(msg: string) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 1800);
  }

  function tapCell(n: number) {
    if (!n || auto) return;
    if (!called.has(n)) {
      setShake(n);
      setTimeout(() => setShake(null), 400);
      flash(`${n} hasn't been called yet! 🙅`);
      vibrate([20, 40, 20]);
      return;
    }
    vibrate(15);
    setMarks((m) => (m.indexOf(n) >= 0 ? m.filter((x) => x !== n) : m.concat(n)));
  }

  function tapPrize(p: PrizeView) {
    if (!p.open || g.jail > 0 || g.phase !== 'calling') return;
    if (confirm !== p.id) {
      setConfirm(p.id);
      vibrate(20);
      clearTimeout(confirmTimer.current);
      confirmTimer.current = setTimeout(() => setConfirm(null), 2500);
      return;
    }
    setConfirm(null);
    vibrate([40, 30, 40]);
    client.game({ k: 'claim', prize: p.id });
  }

  const ready = (id: PrizeId) => g.tickets.some((t) => missing(t, id, marked) === 0);

  if (g.phase === 'final') {
    return (
      <div className="tam-ph final">
        <h1 className="ph-title small">🏆 Tambola over!</h1>
        {g.stars ? <p className="big-stars">You won ⭐{g.stars}</p> : <p className="ph-sub">Better luck next time! 🤞</p>}
        <div className="ph-prize-list">
          {g.prizes.map((p) => (
            <div key={p.id} className={'ppl-row' + (p.mine ? ' mine' : '')}>
              <span>{pname(p.id)}</span>
              <b>{p.winners.length ? p.winners.join(', ') : '—'}</b>
            </div>
          ))}
        </div>
        <FinalButtons client={client} v={v} />
      </div>
    );
  }

  const claim = g.claim && claimSeq !== hiddenSeq ? g.claim : null;
  let banner: { cls: string; text: string } | null = null;
  if (claim) {
    if (!claim.revealed) banner = { cls: 'wait', text: `🥁 Checking ${pname(claim.prize)}… watch the TV!` };
    else if (claim.note === 'gone') banner = { cls: 'bad', text: `😭 ${pname(claim.prize)} is already taken` };
    else if (claim.note === 'jail') banner = { cls: 'bad', text: "🔒 You're in jail — hang on" };
    else if (claim.ok) banner = { cls: 'ok', text: `🎉 Yes! ${pname(claim.prize)} is yours!` };
    else banner = { cls: 'bad', text: '🚨 BOGEY! False claim — 3 numbers in jail' };
  }

  return (
    <div className="tam-ph">
      <div className="tp-top">
        <div className={'tp-ball' + (last ? '' : ' empty')} key={last || 0}>
          {last || '?'}
        </div>
        <div className="tp-call">
          <b>{last ? callTitle(last) : g.phase === 'intro' ? 'Get ready!' : 'First number coming up…'}</b>
          <small>{last ? callFun(last) : 'Numbers will appear on the TV'}</small>
          <span className="tp-prev">
            {g.called
              .slice(-6, -1)
              .reverse()
              .map((n) => (
                <i key={n}>{n}</i>
              ))}
            <em>{g.called.length}/90</em>
          </span>
        </div>
      </div>
      {g.paused && <div className="tp-paused">⏸ Game paused</div>}

      {g.tickets.map((t, ti) => (
        <div key={ti} className="ph-ticket">
          {t.map((row, r) =>
            row.map((n, c) => {
              const isMarked = n > 0 && marked.has(n);
              return (
                <button
                  key={r + '-' + c}
                  className={'pcell' + (n === 0 ? ' blank' : '') + (isMarked ? ' marked' : '') + (shake === n ? ' shake' : '') + (n && n === last && !isMarked ? ' fresh' : '')}
                  onClick={() => tapCell(n)}
                  disabled={n === 0}
                >
                  {n || ''}
                </button>
              );
            }),
          )}
        </div>
      ))}

      <label className="auto-toggle">
        <input
          type="checkbox"
          checked={auto}
          onChange={(e) => {
            setAuto(e.target.checked);
            save('dpn-auto', e.target.checked);
          }}
        />
        <span>Auto-mark (easy mode for kids)</span>
      </label>

      {banner && <div className={'claim-banner ' + banner.cls}>{banner.text}</div>}
      {g.jail > 0 && <div className="claim-banner bad">🔒 Jail: wait {g.jail} more number{g.jail > 1 ? 's' : ''}</div>}

      <div className="claim-grid">
        {g.prizes.map((p) => {
          const meta = PRIZES.find((x) => x.id === p.id)!;
          const disabled = !p.open || g.jail > 0 || g.phase !== 'calling';
          const glow = !disabled && ready(p.id);
          return (
            <button
              key={p.id}
              className={'claim-btn' + (p.mine ? ' mine' : '') + (disabled ? ' off' : '') + (glow ? ' glow' : '') + (confirm === p.id ? ' confirm' : '') + (p.id === 'full' ? ' full' : '')}
              onClick={() => tapPrize(p)}
            >
              {confirm === p.id ? (
                <b>Sure? Tap again!</b>
              ) : (
                <>
                  <b>{meta.name}</b>
                  <small>
                    {p.mine ? '✅ Yours!' : p.winners.length ? '🏆 ' + p.winners[0] + (p.winners.length > 1 ? ' +' + (p.winners.length - 1) : '') : '⭐' + meta.stars}
                  </small>
                </>
              )}
            </button>
          );
        })}
      </div>
      {toast && <div className="ph-toast">{toast}</div>}
      <ReactionBar client={client} compact />
    </div>
  );
}
