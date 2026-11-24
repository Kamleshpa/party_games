import { useRef, useState } from 'react';
import { REACTIONS } from '../shared/avatars';
import type { PlayerView } from '../shared/types';
import { vibrate } from '../lib/sfx';
import type { PlayerClient } from './client';

export function ReactionBar({ client, compact }: { client: PlayerClient; compact?: boolean }) {
  const [last, setLast] = useState<string | null>(null);
  const t = useRef<any>(null);
  return (
    <div className={'reaction-bar' + (compact ? ' compact' : '')}>
      {REACTIONS.map((e) => (
        <button
          key={e}
          className={last === e ? 'sent' : ''}
          onClick={() => {
            client.react(e);
            vibrate(15);
            setLast(e);
            clearTimeout(t.current);
            t.current = setTimeout(() => setLast(null), 500);
          }}
        >
          {e}
        </button>
      ))}
    </div>
  );
}

export function FinalButtons({ client, v }: { client: PlayerClient; v: PlayerView }) {
  if (!v.captain) return <p className="muted center-text">👑 {v.captainName} will pick the next game… 📺 watch the TV</p>;
  return (
    <div className="final-btns">
      <button className="btn primary big" onClick={() => client.cap({ cmd: 'replay' })}>
        🔁 Play again
      </button>
      <button className="btn big" onClick={() => client.cap({ cmd: 'lobby' })}>
        🏠 Pick another game
      </button>
    </div>
  );
}

export function Notice({ icon, title, text, spinner }: { icon: string; title: string; text: string; spinner?: boolean }) {
  return (
    <div className="phone center">
      <div className={'ph-logo' + (spinner ? ' pulse' : '')}>{icon}</div>
      <h1 className="ph-title small">{title}</h1>
      <p className="ph-sub">{text}</p>
    </div>
  );
}
