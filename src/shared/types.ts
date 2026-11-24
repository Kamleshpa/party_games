export type GameId = 'tambola' | 'emoji' | 'quiz';

export interface PublicPlayer {
  id: string;
  name: string;
  avatar: string;
  color: string;
  connected: boolean;
  stars: number;
  bot?: boolean;
}

/** Everything a phone needs to render. Sent whenever it changes. */
export interface PlayerView {
  code: string;
  phase: 'lobby' | 'game';
  selected: GameId;
  gameId?: GameId;
  ended: boolean;
  captain: boolean;
  captainName?: string;
  me: PublicPlayer;
  players: PublicPlayer[];
  settings: Record<GameId, any>;
  game: any;
}

export type HostToClient =
  | { k: 'state'; t: number; v: PlayerView }
  | { k: 'ping'; t: number }
  | { k: 'rehello' }
  | { k: 'bye'; reason: 'full' | 'kicked' | 'closed' };

export type ClientToHost =
  | { k: 'hello'; pid: string; name: string; avatar: string }
  | { k: 'act'; a: any }
  | { k: 'pong' };

export type CaptainCmd =
  | { cmd: 'select'; gameId: GameId }
  | { cmd: 'settings'; gameId: GameId; settings: any }
  | { cmd: 'start' }
  | { cmd: 'pause' }
  | { cmd: 'resume' }
  | { cmd: 'skip' }
  | { cmd: 'end' }
  | { cmd: 'replay' }
  | { cmd: 'lobby' }
  | { cmd: 'kick'; pid: string };
