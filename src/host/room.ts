// The game server. Runs inside the TV browser; phones talk to it over the transport.
import type { HostTransport } from '../net/transport';
import type { CaptainCmd, ClientToHost, GameId, PlayerView, PublicPlayer } from '../shared/types';
import type { Fx, GameCtx, Player } from '../games/types';
import { MODULES } from '../games/registry';
import { COLORS, REACTIONS } from '../shared/avatars';
import { randomId } from '../lib/rand';
import { save } from '../lib/storage';

export const MAX_PLAYERS = 20;
const HEARTBEAT_MS = 4000;
const STALE_MS = 15000;
export const SAVE_KEY = 'dpn-host-v1';

export interface RoomState {
  v: 1;
  code: string;
  players: Player[];
  phase: 'lobby' | 'game';
  selected: GameId;
  gameId?: GameId;
  game?: any;
  settings: Record<GameId, any>;
  gameNo: number;
  ended: boolean;
  savedAt: number;
}

export function freshRoom(code: string): RoomState {
  return {
    v: 1,
    code,
    players: [],
    phase: 'lobby',
    selected: 'tambola',
    settings: {
      tambola: { ...MODULES.tambola.defaults },
      emoji: { ...MODULES.emoji.defaults },
      quiz: { ...MODULES.quiz.defaults },
    },
    gameNo: 0,
    ended: false,
    savedAt: Date.now(),
  };
}

export class Room {
  s: RoomState;
  version = 0;
  private listeners = new Set<() => void>();
  private fxListeners = new Set<(f: Fx) => void>();
  private connToPid = new Map<string, string>();
  private lastSent = new Map<string, string>();
  private lastReact = new Map<string, number>();
  private timer: any = null;
  private lastBeat = 0;
  private lastSave = 0;
  private dirty = true;
  ctx: GameCtx;

  constructor(public transport: HostTransport, state: RoomState) {
    this.s = state;
    // After a TV refresh nobody is connected until their phone reconnects.
    for (const p of this.s.players) {
      if (!p.bot) {
        p.connected = false;
        p.connId = null;
      }
    }
    this.ctx = {
      now: () => Date.now(),
      players: () => this.s.players,
      active: () => this.s.players.filter((p) => p.connected || p.bot),
      player: (pid) => this.s.players.find((p) => p.id === pid),
      fx: (f) => this.emit(f),
      end: (stars) => {
        if (this.s.ended) return;
        this.s.ended = true;
        for (const p of this.s.players) p.stars += Math.max(0, stars[p.id] || 0);
        this.changed();
      },
    };
  }

  start() {
    this.transport.onMessage = (connId, msg) => this.onMessage(connId, msg);
    this.transport.onClose = (connId) => this.onClose(connId);
    this.timer = setInterval(() => this.tick(), 200);
  }

  stop() {
    clearInterval(this.timer);
    this.transport.stop();
  }

  // ---------- subscriptions for the TV UI ----------
  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }
  onFx(fn: (f: Fx) => void) {
    this.fxListeners.add(fn);
    return () => {
      this.fxListeners.delete(fn);
    };
  }
  emit(f: Fx) {
    this.fxListeners.forEach((fn) => fn(f));
  }
  changed() {
    this.dirty = true;
    this.version++;
    this.listeners.forEach((fn) => fn());
  }

  get captainId(): string | undefined {
    const humans = this.s.players.filter((p) => p.connected && !p.bot);
    humans.sort((a, b) => a.joinedAt - b.joinedAt);
    return humans[0] && humans[0].id;
  }

  // ---------- networking ----------
  private onMessage(connId: string, msg: ClientToHost) {
    if (!msg || typeof msg !== 'object') return;
    const now = Date.now();
    if (msg.k === 'hello') {
      this.hello(connId, msg);
      return;
    }
    const pid = this.connToPid.get(connId);
    const p = pid ? this.ctx.player(pid) : undefined;
    if (!p) {
      // Unknown connection (e.g. the TV was refreshed): ask the phone to introduce itself again.
      this.transport.send(connId, { k: 'rehello' });
      return;
    }
    p.lastSeen = now;
    if (!p.connected) {
      p.connected = true;
      this.changed();
    }
    if (msg.k === 'act') this.act(p, msg.a);
    this.flush();
  }

  private hello(connId: string, msg: Extract<ClientToHost, { k: 'hello' }>) {
    const now = Date.now();
    const name = String(msg.name || '').trim().slice(0, 14) || 'Guest';
    const avatar = String(msg.avatar || '🦁').slice(0, 8);
    let p = this.ctx.player(String(msg.pid));
    if (!p) {
      if (this.s.players.filter((x) => !x.bot).length >= MAX_PLAYERS) {
        this.transport.send(connId, { k: 'bye', reason: 'full' });
        return;
      }
      const used = new Set(this.s.players.map((x) => x.color));
      const color = COLORS.find((c) => !used.has(c)) || COLORS[this.s.players.length % COLORS.length];
      p = {
        id: String(msg.pid).slice(0, 40) || randomId(),
        name: this.uniqueName(name),
        avatar,
        color,
        joinedAt: now,
        connId,
        connected: true,
        lastSeen: now,
        stars: 0,
      };
      this.s.players.push(p);
      this.emit({ t: 'sfx', name: 'pop' });
      this.emit({ t: 'toast', text: `${p.name} joined!`, avatar: p.avatar, color: p.color });
      if (this.s.phase === 'game' && this.s.gameId) {
        const mod = MODULES[this.s.gameId];
        mod.join && mod.join(this.ctx, this.s.game, p.id);
      }
    } else {
      // Rejoin (phone slept / refreshed). Allow a name/avatar change in the lobby.
      if (p.connId && p.connId !== connId) this.connToPid.delete(p.connId);
      p.connId = connId;
      if (!p.connected) this.emit({ t: 'toast', text: `${p.name} is back`, avatar: p.avatar, color: p.color });
      p.connected = true;
      p.lastSeen = now;
      if (this.s.phase === 'lobby') {
        if (name !== p.name) p.name = this.uniqueName(name, p.id);
        p.avatar = avatar;
      }
    }
    this.connToPid.set(connId, p.id);
    this.lastSent.delete(p.id);
    this.changed();
    this.flush();
  }

  private uniqueName(name: string, selfId?: string): string {
    const taken = new Set(this.s.players.filter((p) => p.id !== selfId).map((p) => p.name.toLowerCase()));
    if (!taken.has(name.toLowerCase())) return name;
    for (let i = 2; i < 50; i++) {
      const n = `${name} ${i}`;
      if (!taken.has(n.toLowerCase())) return n;
    }
    return name;
  }

  private onClose(connId: string) {
    const pid = this.connToPid.get(connId);
    this.connToPid.delete(connId);
    const p = pid ? this.ctx.player(pid) : undefined;
    if (p && p.connId === connId && p.connected) {
      p.connected = false;
      this.changed();
    }
  }

  // ---------- actions ----------
  private act(p: Player, a: any) {
    if (!a || typeof a !== 'object') return;
    if (a.k === 'react') {
      const now = Date.now();
      if (REACTIONS.indexOf(a.e) < 0) return;
      if (now - (this.lastReact.get(p.id) || 0) < 600) return;
      this.lastReact.set(p.id, now);
      this.emit({ t: 'react', pid: p.id, emoji: a.e });
      return;
    }
    if (a.k === 'cap') {
      if (p.id !== this.captainId) return;
      this.captain(a.c as CaptainCmd);
      return;
    }
    if (a.k === 'game' && this.s.phase === 'game' && this.s.gameId) {
      if (MODULES[this.s.gameId].action(this.ctx, this.s.game, p.id, a.a)) this.changed();
    }
  }

  /** Captain commands. Also used by the TV remote. */
  captain(c: CaptainCmd) {
    const s = this.s;
    switch (c.cmd) {
      case 'select':
        if (s.phase === 'lobby' && MODULES[c.gameId]) s.selected = c.gameId;
        break;
      case 'settings':
        if (MODULES[c.gameId]) s.settings[c.gameId] = { ...s.settings[c.gameId], ...c.settings };
        break;
      case 'start':
        if (s.phase === 'lobby') this.startGame(s.selected);
        break;
      case 'replay':
        if (s.phase === 'game' && s.gameId) this.startGame(s.gameId);
        break;
      case 'pause':
      case 'resume':
      case 'skip':
        if (s.phase === 'game' && s.gameId) MODULES[s.gameId].control(this.ctx, s.game, c.cmd);
        break;
      case 'end':
        if (s.phase === 'game') {
          s.phase = 'lobby';
          s.game = undefined;
          s.gameId = undefined;
        }
        break;
      case 'lobby':
        s.phase = 'lobby';
        s.game = undefined;
        s.gameId = undefined;
        break;
      case 'kick': {
        const p = this.ctx.player(c.pid);
        if (p && s.phase === 'lobby') {
          if (p.connId) this.transport.send(p.connId, { k: 'bye', reason: 'kicked' });
          s.players = s.players.filter((x) => x.id !== c.pid);
        }
        break;
      }
    }
    this.changed();
  }

  startGame(id: GameId) {
    const s = this.s;
    s.gameNo++;
    s.ended = false;
    s.gameId = id;
    s.selected = id;
    s.phase = 'game';
    s.game = MODULES[id].create(this.ctx, s.settings[id]);
    this.emit({ t: 'sfx', name: 'start' });
    this.changed();
  }

  addBots(n: number) {
    const names = ['Pappu', 'Bunty', 'Pinky', 'Chintu', 'Sweety', 'Golu', 'Babli', 'Monty', 'Dolly', 'Raju', 'Tinku', 'Rinku'];
    const avatars = ['🐒', '🐼', '🦊', '🐸', '🐨', '🐻', '🦄', '🐙', '🐧', '🦉', '🐬', '🐢'];
    for (let i = 0; i < n; i++) {
      const used = new Set(this.s.players.map((x) => x.color));
      this.s.players.push({
        id: 'bot-' + randomId(5),
        name: names[i % names.length],
        avatar: avatars[i % avatars.length],
        color: COLORS.find((c) => !used.has(c)) || COLORS[i % COLORS.length],
        joinedAt: Date.now() + 100000 + i,
        connId: null,
        connected: true,
        lastSeen: Date.now(),
        stars: 0,
        bot: true,
      });
    }
    this.changed();
  }

  // ---------- loop ----------
  private tick() {
    const now = Date.now();
    const s = this.s;
    if (s.phase === 'game' && s.gameId) {
      const mod = MODULES[s.gameId];
      if (mod.tick(this.ctx, s.game)) this.changed();
      if (mod.bot) for (const p of s.players) if (p.bot && mod.bot(this.ctx, s.game, p.id)) this.changed();
    }
    if (now - this.lastBeat > HEARTBEAT_MS) {
      this.lastBeat = now;
      for (const p of s.players) {
        if (p.bot || !p.connId) continue;
        if (p.connected && now - p.lastSeen > STALE_MS) {
          p.connected = false;
          this.changed();
        }
        this.transport.send(p.connId, { k: 'ping', t: now });
      }
    }
    this.flush();
  }

  /** Send each phone its view, but only if it changed. */
  flush() {
    if (!this.dirty) return;
    this.dirty = false;
    const now = Date.now();
    const s = this.s;
    const captainId = this.captainId;
    const captain = captainId ? this.ctx.player(captainId) : undefined;
    const players: PublicPlayer[] = s.players.map(pub);
    const mod = s.phase === 'game' && s.gameId ? MODULES[s.gameId] : null;
    for (const p of s.players) {
      if (p.bot || !p.connId || !p.connected) continue;
      const v: PlayerView = {
        code: s.code,
        phase: s.phase,
        selected: s.selected,
        gameId: s.gameId,
        ended: s.ended,
        captain: p.id === captainId,
        captainName: captain && captain.name,
        me: pub(p),
        players,
        settings: s.settings,
        game: mod ? mod.view(this.ctx, s.game, p.id) : null,
      };
      const json = JSON.stringify(v);
      if (this.lastSent.get(p.id) === json) continue;
      this.lastSent.set(p.id, json);
      this.transport.send(p.connId, { k: 'state', t: now, v });
    }
    if (now - this.lastSave > 1000) {
      this.lastSave = now;
      s.savedAt = now;
      save(SAVE_KEY, s);
    }
  }
}

function pub(p: Player): PublicPlayer {
  const o: PublicPlayer = { id: p.id, name: p.name, avatar: p.avatar, color: p.color, connected: p.connected, stars: p.stars };
  if (p.bot) o.bot = true;
  return o;
}
