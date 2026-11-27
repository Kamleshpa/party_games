import type { Room } from '../host/room';
import { GAME_META, GAME_ORDER } from '../games/registry';
import { Emo } from '../lib/Emo';
import { Avatar, Qr, joinUrl } from './common';

export function Lobby({ room, net }: { room: Room; net: string }) {
  const s = room.s;
  const captainId = room.captainId;
  const captain = s.players.find((p) => p.id === captainId);
  const players = s.players;
  const size = players.length <= 6 ? 140 : players.length <= 14 ? 100 : 78;
  const meta = GAME_META[s.selected];
  const settings = s.settings[s.selected] || {};
  const ranked = players.filter((p) => p.stars > 0).sort((a, b) => b.stars - a.stars);
  const medal = (id: string) => {
    const i = ranked.findIndex((p) => p.id === id);
    return i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
  };

  return (
    <div className="lobby">
      <header className="lobby-head">
        <div className="logo">
          <Emo e="🪔" size={84} />
          <div>
            <h1>Desi Party Night</h1>
            <p>Tambola · Emoji Movie · Filmy Dialogues · 90s Kids Quiz</p>
          </div>
        </div>
        {ranked.length > 0 && (
          <div className="party-top">
            <span>Tonight's superstars</span>
            {ranked.slice(0, 3).map((p) => (
              <b key={p.id}>
                {medal(p.id)} {p.name} <small>⭐{p.stars}</small>
              </b>
            ))}
          </div>
        )}
      </header>

      <section className="join-card">
        <h2>Join on your phone! 📱</h2>
        <Qr text={joinUrl(s.code, net)} size={360} />
        <p className="join-url">{window.location.host}</p>
        <div className="code-tiles">
          {s.code.split('').map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
        <p className="join-tip">Scan the QR code with your camera, or open the site and enter the code</p>
      </section>

      <section className="players-area">
        <h2>
          Players <span className="count">{players.filter((p) => p.connected || p.bot).length}</span>
        </h2>
        {players.length === 0 ? (
          <div className="empty-players">
            <Emo e="🙏" size={120} />
            <p>Welcome! The first one to join becomes Captain 👑</p>
          </div>
        ) : (
          <div className="player-grid">
            {players.map((p) => (
              <div key={p.id} className={'pl pop-in' + (p.connected || p.bot ? '' : ' away')} style={{ width: size + 44 }}>
                <Avatar p={p} size={size} crown={p.id === captainId} badge={p.stars ? `⭐${p.stars}` : undefined} />
                <span className="pl-name" style={{ color: p.color }}>
                  {medal(p.id)} {p.name}
                  {p.bot ? ' 🤖' : ''}
                  {!p.connected && !p.bot ? ' 💤' : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="games-area">
        <div className="game-cards">
          {GAME_ORDER.map((id) => {
            const m = GAME_META[id];
            const sel = id === s.selected;
            return (
              <div key={id} className={'game-card' + (sel ? ' sel' : '')} style={{ borderColor: sel ? m.accent : undefined }}>
                <Emo e={m.icon} size={64} />
                <div>
                  <h3 style={{ color: m.accent }}>{m.title}</h3>
                  <p>{m.tagline}</p>
                  <small>⏱ {m.minutes}</small>
                </div>
              </div>
            );
          })}
        </div>
        <div className="rules" style={{ borderColor: meta.accent }}>
          <div className="rules-list">
            <h3>
              <Emo e={meta.icon} size={44} /> {meta.title} — how to play
            </h3>
            <ul>
              {meta.rules.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
          <div className="rules-settings">
            {meta.options.map((o) => {
              const c = o.choices.find((c) => c.value === settings[o.key]);
              return (
                <span key={o.key} className="chip">
                  {o.label}: <b>{c ? c.label : settings[o.key]}</b>
                </span>
              );
            })}
          </div>
        </div>
        <div className="lobby-hint">
          {captain ? (
            <>
              <Emo e="👑" size={44} /> <b style={{ color: captain.color }}>{captain.name}</b> is Captain — pick a game on your phone and hit <b>START</b>!
            </>
          ) : (
            <>TV remote: left/right to choose a game, OK to start, down for music &amp; sound</>
          )}
        </div>
      </section>
    </div>
  );
}
