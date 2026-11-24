import type { GameId } from '../shared/types';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  color: string;
  joinedAt: number;
  connId: string | null;
  connected: boolean;
  lastSeen: number;
  stars: number;
  bot?: boolean;
}

export type SfxName =
  | 'pop'
  | 'tick'
  | 'whoosh'
  | 'ding'
  | 'correct'
  | 'wrong'
  | 'buzzer'
  | 'fanfare'
  | 'drumroll'
  | 'lock'
  | 'start';

export type Fx =
  | { t: 'sfx'; name: SfxName }
  | { t: 'voice'; key: string }
  | { t: 'react'; pid: string; emoji: string }
  | { t: 'confetti'; big?: boolean }
  | { t: 'toast'; text: string; avatar?: string; color?: string };

export interface GameCtx {
  now(): number;
  players(): Player[];
  /** Players who can play right now (connected phones + bots). */
  active(): Player[];
  player(pid: string): Player | undefined;
  fx(f: Fx): void;
  /** Game over: award party stars (shown on the lobby leaderboard). */
  end(stars: Record<string, number>): void;
}

export interface GameModule<S = any, Settings = any> {
  id: GameId;
  defaults: Settings;
  create(ctx: GameCtx, settings: Settings): S;
  /** Called ~5x/second. Return true if state changed. */
  tick(ctx: GameCtx, s: S): boolean;
  action(ctx: GameCtx, s: S, pid: string, a: any): boolean;
  control(ctx: GameCtx, s: S, cmd: 'pause' | 'resume' | 'skip'): boolean;
  join?(ctx: GameCtx, s: S, pid: string): boolean;
  view(ctx: GameCtx, s: S, pid: string): any;
  bot?(ctx: GameCtx, s: S, pid: string): boolean;
  isPaused?(s: S): boolean;
}
