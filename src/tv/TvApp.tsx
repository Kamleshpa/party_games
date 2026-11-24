import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { freshRoom, Room, SAVE_KEY, type RoomState } from '../host/room';
import { createHostTransport, detectNetKind, type NetKind } from '../net/transport';
import { GAME_ORDER } from '../games/registry';
import { load, params, remove } from '../lib/storage';
import { roomCode } from '../lib/rand';
import { sfx, unlockAudio } from '../lib/sfx';
import { checkClips, isMuted, playVoice, setMuted } from '../lib/voice';
import { Emo, setEmojiImages } from '../lib/Emo';
import { Confetti, Garland, JoinChip, Stage, type ConfettiHandle } from './common';
import { Lobby } from './Lobby';
import { TambolaTv } from '../games/tambola/Tv';
import { QuizTv } from '../games/common/QuizTv';

const RESUME_MS = 6 * 3600 * 1000;

let tvLock: any = null;
function keepTvAwake() {
  const req = () => {
    try {
      const nav: any = navigator;
      if (nav.wakeLock && (!tvLock || tvLock.released)) nav.wakeLock.request('screen').then((l: any) => (tvLock = l)).catch(() => {});
    } catch {
      /* unsupported */
    }
  };
  req();
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && req());
}

export function TvApp() {
  const [saved] = useState(() => {
    const s = load<RoomState | null>(SAVE_KEY, null);
    return s && s.v === 1 && Date.now() - s.savedAt < RESUME_MS ? s : null;
  });
  const [room, setRoom] = useState<Room | null>(null);
  const [net, setNet] = useState<NetKind>('p2p');
  const [status, setStatus] = useState<'splash' | 'starting' | 'error'>('splash');
  const [err, setErr] = useState('');

  async function begin(resume: boolean) {
    unlockAudio();
    checkClips();
    setEmojiImages(true);
    try {
      const el: any = document.documentElement;
      const fs = el.requestFullscreen || el.webkitRequestFullscreen;
      if (fs) {
        const r = fs.call(el);
        if (r && r.catch) r.catch(() => {});
      }
    } catch {
      /* not allowed */
    }
    keepTvAwake();
    setStatus('starting');
    try {
      const kind = await detectNetKind();
      setNet(kind);
      let state = resume && saved ? saved : freshRoom(roomCode());
      if (!resume) remove(SAVE_KEY);
      let transport = await createHostTransport(kind);
      try {
        await transport.start(state.code);
      } catch (e) {
        if (resume) throw e;
        transport.stop();
        state = freshRoom(roomCode());
        transport = await createHostTransport(kind);
        await transport.start(state.code);
      }
      const r = new Room(transport, state);
      r.start();
      const bots = Number(params().get('bots') || 0);
      if (bots > 0 && !state.players.some((p) => p.bot)) r.addBots(Math.min(12, bots));
      if (import.meta.env.DEV) (window as any).__room = r;
      setRoom(r);
    } catch (e: any) {
      setErr(String((e && e.message) || e));
      setStatus('error');
    }
  }

  if (room) return <TvRoom room={room} net={net} />;

  return (
    <Stage>
      <div className="tv splash">
        <Garland />
        <div className="splash-inner">
          <div className="splash-diyas">
            <Emo e="🪔" size={110} />
            <Emo e="🎉" size={110} />
            <Emo e="🪔" size={110} />
          </div>
          <h1 className="splash-title">Desi Party Night</h1>
          <p className="splash-sub">Tambola · Emoji Movie · 90s Kids Quiz</p>
          {status === 'splash' && (
            <div className="splash-buttons">
              <button className="big-btn" autoFocus onClick={() => begin(false)}>
                ▶ Start the Party!
              </button>
              {saved && (
                <button className="big-btn alt" onClick={() => begin(true)}>
                  ↩ Continue last party ({saved.code})
                </button>
              )}
              <p className="splash-tip">Press OK on your remote · turn the TV volume up 🔊</p>
            </div>
          )}
          {status === 'starting' && <p className="splash-tip">Setting up the room… ⏳</p>}
          {status === 'error' && (
            <div className="splash-buttons">
              <p className="splash-err">Couldn't connect ({err}). Please check the internet.</p>
              <button className="big-btn" autoFocus onClick={() => begin(false)}>
                🔁 Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </Stage>
  );
}

interface Floater {
  id: number;
  emoji: string;
  name: string;
  color: string;
  x: number;
}
interface Toast {
  id: number;
  text: string;
  avatar?: string;
  color?: string;
}

let fxId = 0;

function TvRoom({ room, net }: { room: Room; net: NetKind }) {
  useSyncExternalStore(
    (cb) => room.subscribe(cb),
    () => room.version,
  );
  const s = room.s;
  const confetti = useRef<ConfettiHandle>(null);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [muted, setMutedState] = useState(isMuted());

  useEffect(
    () =>
      room.onFx((f) => {
        if (f.t === 'sfx') sfx(f.name);
        else if (f.t === 'voice') playVoice(f.key);
        else if (f.t === 'confetti') confetti.current && confetti.current.fire(f.big);
        else if (f.t === 'react') {
          const p = room.ctx.player(f.pid);
          if (!p) return;
          const item: Floater = { id: ++fxId, emoji: f.emoji, name: p.name, color: p.color, x: 80 + Math.random() * 1700 };
          setFloaters((l) => l.slice(-24).concat(item));
          setTimeout(() => setFloaters((l) => l.filter((x) => x.id !== item.id)), 3400);
        } else if (f.t === 'toast') {
          const item: Toast = { id: ++fxId, text: f.text, avatar: f.avatar, color: f.color };
          setToasts((l) => l.slice(-3).concat(item));
          setTimeout(() => setToasts((l) => l.filter((x) => x.id !== item.id)), 3500);
        }
      }),
    [room],
  );

  // TV remote / keyboard controls (fallback when no captain phone)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const st = room.s;
      const k = e.key;
      if (st.phase === 'lobby') {
        const i = GAME_ORDER.indexOf(st.selected);
        if (k === 'ArrowRight' || k === 'ArrowDown') room.captain({ cmd: 'select', gameId: GAME_ORDER[(i + 1) % GAME_ORDER.length] });
        else if (k === 'ArrowLeft' || k === 'ArrowUp') room.captain({ cmd: 'select', gameId: GAME_ORDER[(i + GAME_ORDER.length - 1) % GAME_ORDER.length] });
        else if (k === 'Enter' && st.players.length > 0) room.captain({ cmd: 'start' });
        else return;
        e.preventDefault();
        return;
      }
      // Remote keys: Play/Pause (LG/Samsung send keyCode 415 / 19), 'n' = next (keyboard only).
      const code = e.keyCode;
      const paused = !!(st.gameId && st.game && st.game.paused);
      if (st.ended && k === 'Enter') room.captain({ cmd: 'lobby' });
      else if (k === ' ' || k === 'p' || k === 'MediaPlayPause' || code === 10252) room.captain({ cmd: paused ? 'resume' : 'pause' });
      else if (k === 'MediaPlay' || code === 415) room.captain({ cmd: 'resume' });
      else if (k === 'MediaPause' || code === 19) room.captain({ cmd: 'pause' });
      else if (k === 'n' || k === 'MediaTrackNext') room.captain({ cmd: 'skip' });
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [room]);

  let body;
  if (s.phase === 'lobby' || !s.gameId) body = <Lobby room={room} net={net} />;
  else if (s.gameId === 'tambola') body = <TambolaTv room={room} s={s.game} />;
  else body = <QuizTv room={room} s={s.game} />;

  return (
    <Stage>
      <div className={'tv phase-' + s.phase + (s.gameId ? ' game-' + s.gameId : '')}>
        <Garland />
        {body}
        {s.phase === 'game' && <JoinChip code={s.code} />}
        <div className="floaters">
          {floaters.map((f) => (
            <div key={f.id} className="floater" style={{ left: f.x }}>
              <Emo e={f.emoji} size={110} />
              <span style={{ background: f.color }}>{f.name}</span>
            </div>
          ))}
        </div>
        <div className="toasts">
          {toasts.map((t) => (
            <div key={t.id} className="toast" style={{ borderColor: t.color }}>
              {t.avatar && <Emo e={t.avatar} size={56} />} <span>{t.text}</span>
            </div>
          ))}
        </div>
        <Confetti ref={confetti} />
        <button
          className="mute-btn"
          tabIndex={-1}
          onClick={() => {
            setMuted(!muted);
            setMutedState(!muted);
          }}
        >
          <Emo e={muted ? '🔇' : '🔊'} size={40} />
        </button>
        {net === 'local' && <div className="net-badge">local test mode</div>}
      </div>
    </Stage>
  );
}
