import type { PlayerView } from '../shared/types';
import { GAME_META, GAME_ORDER } from '../games/registry';
import { vibrate } from '../lib/sfx';
import type { PlayerClient } from './client';

export function PhoneLobby({ client, v, onEdit }: { client: PlayerClient; v: PlayerView; onEdit: () => void }) {
  const meta = GAME_META[v.selected];
  const settings = v.settings[v.selected] || {};
  const ranked = v.players.filter((p) => p.stars > 0).sort((a, b) => b.stars - a.stars);
  const humans = v.players.filter((p) => !p.bot);

  return (
    <div className="ph-lobby">
      <div className="me-card" style={{ borderColor: v.me.color }}>
        <span className="me-av" style={{ background: v.me.color + '33' }}>
          {v.me.avatar}
        </span>
        <div className="me-info">
          <b style={{ color: v.me.color }}>{v.me.name}</b>
          <small>
            Room {v.code}
            {v.me.stars ? ` · ⭐${v.me.stars}` : ''}
          </small>
        </div>
        <button className="link" onClick={onEdit}>
          ✏️ edit
        </button>
      </div>

      {v.captain ? (
        <>
          <div className="cap-hello">👑 You're the Captain! Pick a game:</div>
          <div className="ph-games">
            {GAME_ORDER.map((id) => {
              const m = GAME_META[id];
              const sel = id === v.selected;
              return (
                <button
                  key={id}
                  className={'ph-game' + (sel ? ' sel' : '')}
                  style={{ borderColor: sel ? m.accent : undefined }}
                  onClick={() => {
                    vibrate(10);
                    client.cap({ cmd: 'select', gameId: id });
                  }}
                >
                  <span className="pg-icon">{m.icon}</span>
                  <span className="pg-text">
                    <b style={{ color: m.accent }}>{m.title}</b>
                    <small>{m.tagline}</small>
                  </span>
                </button>
              );
            })}
          </div>
          {meta.options.map((o) => (
            <div key={o.key} className="opt-row">
              <span className="opt-label">{o.label}</span>
              <div className="seg">
                {o.choices.map((c) => (
                  <button
                    key={String(c.value)}
                    className={settings[o.key] === c.value ? 'on' : ''}
                    onClick={() => client.cap({ cmd: 'settings', gameId: v.selected, settings: { [o.key]: c.value } })}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button
            className="btn primary big start-btn"
            onClick={() => {
              vibrate([30, 30, 60]);
              client.cap({ cmd: 'start' });
            }}
          >
            {meta.icon} {meta.title} — START!
          </button>
          <p className="muted center-text">{humans.length} {humans.length === 1 ? 'player has' : 'players have'} joined. More can join anytime.</p>
          <details className="manage">
            <summary>Manage players</summary>
            {v.players.map((p) => (
              <div key={p.id} className="manage-row">
                <span>
                  {p.avatar} {p.name} {p.connected ? '' : '💤'}
                  {p.bot ? ' 🤖' : ''}
                </span>
                {p.id !== v.me.id && (
                  <button
                    className="link danger"
                    onClick={() => {
                      if (window.confirm(`Remove ${p.name} from the room?`)) client.cap({ cmd: 'kick', pid: p.id });
                    }}
                  >
                    remove ✕
                  </button>
                )}
              </div>
            ))}
          </details>
        </>
      ) : (
        <>
          <div className="tv-look">
            <span className="big-emoji">📺</span>
            <div>
              <b>You're in! Watch the TV.</b>
              <small>👑 {v.captainName || 'The Captain'} is picking a game…</small>
            </div>
          </div>
          <div className="ph-game sel static" style={{ borderColor: meta.accent }}>
            <span className="pg-icon">{meta.icon}</span>
            <span className="pg-text">
              <b style={{ color: meta.accent }}>{meta.title}</b>
              <small>{meta.tagline}</small>
            </span>
          </div>
          <ul className="ph-rules">
            {meta.rules.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </>
      )}

      {ranked.length > 0 && (
        <div className="party-board">
          <h3>⭐ Party Leaderboard</h3>
          {ranked.map((p, i) => (
            <div key={p.id} className={'pb-row' + (p.id === v.me.id ? ' me' : '')}>
              <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1 + '.'}</span>
              <span>
                {p.avatar} {p.name}
              </span>
              <b>⭐{p.stars}</b>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
