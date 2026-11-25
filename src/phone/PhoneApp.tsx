import { useEffect, useState, useSyncExternalStore } from 'react';
import { AVATARS } from '../shared/avatars';
import { load, params, save } from '../lib/storage';
import { normalizeCode, randomId } from '../lib/rand';
import { PlayerClient, type Identity } from './client';
import { PhoneLobby } from './Lobby';
import { Notice, ReactionBar } from './common';
import { TambolaPhone } from '../games/tambola/Phone';
import { QuizPhone } from '../games/common/QuizPhone';
import { GAME_META } from '../games/registry';

// ?p=2 lets you open several "phones" as tabs in one browser while testing.
const KEY = 'dpn-me' + (params().get('p') || '');

function loadIdentity(): Identity {
  const me = load<Partial<Identity>>(KEY, {});
  return { pid: me.pid || randomId(12), name: me.name || '', avatar: me.avatar || AVATARS[Math.floor(Math.random() * 16)] };
}

let wakeLock: any = null;
async function keepAwake() {
  try {
    const nav: any = navigator;
    if (nav.wakeLock && (!wakeLock || wakeLock.released)) wakeLock = await nav.wakeLock.request('screen');
  } catch {
    /* not supported */
  }
}

export function PhoneApp() {
  const [code, setCode] = useState(() => normalizeCode(params().get('r') || ''));
  const [me, setMe] = useState<Identity>(loadIdentity);
  const [client, setClient] = useState<PlayerClient | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const onVis = () => document.visibilityState === 'visible' && client && keepAwake();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [client]);

  function join(ident: Identity) {
    save(KEY, ident);
    setMe(ident);
    keepAwake();
    if (client) {
      client.stop();
    }
    const c = new PlayerClient(code, ident);
    c.start();
    setClient(c);
    setEditing(false);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('r', code);
      window.history.replaceState(null, '', url.toString());
    } catch {
      /* ignore */
    }
  }

  if (!code || code.length < 4) return <CodeScreen onCode={setCode} />;
  if (!client || editing) return <JoinScreen code={code} me={me} onJoin={join} onBack={() => setCode('')} />;
  return <InRoom client={client} onEdit={() => setEditing(true)} />;
}

function CodeScreen({ onCode }: { onCode: (c: string) => void }) {
  const [v, setV] = useState('');
  return (
    <div className="phone center">
      <div className="ph-logo">🪔</div>
      <h1 className="ph-title">Desi Party Night</h1>
      <p className="ph-sub">Tambola · Emoji Movie · 90s Kids Quiz</p>
      <div className="card">
        <label>Room code shown on the TV</label>
        <input
          className="code-input"
          value={v}
          maxLength={4}
          placeholder="ABCD"
          autoCapitalize="characters"
          autoComplete="off"
          onChange={(e) => setV(normalizeCode(e.target.value))}
        />
        <button className="btn primary" disabled={v.length < 4} onClick={() => onCode(v)}>
          Next →
        </button>
      </div>
      <a className="tv-link" href={'/tv' + window.location.search}>
        📺 Use this screen as the TV (host)
      </a>
    </div>
  );
}

function JoinScreen({ code, me, onJoin, onBack }: { code: string; me: Identity; onJoin: (i: Identity) => void; onBack: () => void }) {
  const [name, setName] = useState(me.name);
  const [avatar, setAvatar] = useState(me.avatar);
  const ok = name.trim().length > 0;
  return (
    <div className="phone">
      <div className="join-head">
        <button className="link" onClick={onBack}>
          ← Change code
        </button>
        <span className="room-pill">Room {code}</span>
      </div>
      <h1 className="ph-title small">What's your name?</h1>
      <input
        className="name-input"
        value={name}
        maxLength={14}
        placeholder="e.g. Pinky Aunty"
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && ok && onJoin({ ...me, name: name.trim(), avatar })}
      />
      <p className="label">Pick your avatar</p>
      <div className="avatar-grid">
        {AVATARS.map((a) => (
          <button key={a} className={'av-pick' + (a === avatar ? ' sel' : '')} onClick={() => setAvatar(a)}>
            {a}
          </button>
        ))}
      </div>
      <div className="sticky-bottom">
        <button className="btn primary big" disabled={!ok} onClick={() => onJoin({ ...me, name: name.trim(), avatar })}>
          {avatar} Let's go! 🚀
        </button>
      </div>
    </div>
  );
}

function InRoom({ client, onEdit }: { client: PlayerClient; onEdit: () => void }) {
  useSyncExternalStore(client.subscribe, () => client.version);
  const v = client.view;
  const st = client.state;

  if (st === 'full') return <Notice icon="😬" title="Room is full!" text="This room already has 20 players. Ask the Captain to remove someone." />;
  if (st === 'kicked') return <Notice icon="👋" title="You were removed from the room" text="By mistake? Refresh the page to join again." />;
  if (!v) {
    return (
      <Notice
        icon={st === 'no-room' ? '🔍' : '📡'}
        title={st === 'no-room' ? `Room ${client.code} not found` : 'Connecting…'}
        text={
          st === 'no-room'
            ? "Check the code on the TV. If the TV is still starting up, we'll keep trying…"
            : 'Your phone and the TV both need internet. Home Wi-Fi works best!'
        }
        spinner
      />
    );
  }

  let body;
  if (v.phase === 'lobby' || !v.gameId || !v.game) body = <PhoneLobby client={client} v={v} onEdit={onEdit} />;
  else if (v.gameId === 'tambola') body = <TambolaPhone client={client} v={v} g={v.game} />;
  else body = <QuizPhone client={client} v={v} g={v.game} />;

  const showReactions = !(v.phase === 'game' && v.gameId === 'tambola');
  return (
    <div className={'phone in-room' + (showReactions ? ' has-reactions' : '')}>
      {st !== 'open' && <div className="conn-banner">📡 Connection lost… reconnecting</div>}
      {v.phase === 'game' && v.captain && <CaptainBar client={client} v={v} />}
      {body}
      {showReactions && <ReactionBar client={client} />}
    </div>
  );
}

function CaptainBar({ client, v }: { client: PlayerClient; v: any }) {
  const [open, setOpen] = useState(false);
  const g = v.game || {};
  const meta = GAME_META[v.gameId as keyof typeof GAME_META];
  return (
    <div className="cap-bar">
      <button className="cap-toggle" onClick={() => setOpen(!open)}>
        👑 Captain controls {open ? '▲' : '▼'}
      </button>
      {open && (
        <div className="cap-menu">
          {g.paused ? (
            <button className="btn" onClick={() => client.cap({ cmd: 'resume' })}>
              ▶ Resume
            </button>
          ) : (
            <button className="btn" onClick={() => client.cap({ cmd: 'pause' })}>
              ⏸ Pause
            </button>
          )}
          <button className="btn" onClick={() => client.cap({ cmd: 'skip' })}>
            {v.gameId === 'tambola' ? '⏭ Next number' : '⏭ Skip'}
          </button>
          <button className="btn" onClick={() => client.cap({ cmd: 'music', on: !v.music })}>
            {v.music ? '🔇 Music off' : '🎵 Music on'}
          </button>
          <button className="btn" onClick={() => client.cap({ cmd: 'replay' })}>
            🔁 Restart {meta ? meta.title : 'game'}
          </button>
          <button
            className="btn danger"
            onClick={() => {
              if (window.confirm('End this game and go back to the lobby?')) client.cap({ cmd: 'end' });
            }}
          >
            🏠 Lobby
          </button>
        </div>
      )}
    </div>
  );
}
