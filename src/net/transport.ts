import type { ClientToHost, HostToClient } from '../shared/types';
import { params } from '../lib/storage';

export type NetKind = 'p2p' | 'ably' | 'local';

/** Runs on the TV. The TV browser *is* the game server. */
export interface HostTransport {
  kind: NetKind;
  start(code: string): Promise<void>;
  onMessage: (connId: string, msg: ClientToHost) => void;
  onClose: (connId: string) => void;
  send(connId: string, msg: HostToClient): void;
  stop(): void;
}

export type ClientStatus = 'open' | 'closed' | 'error';

/** Runs on each phone. */
export interface ClientTransport {
  kind: NetKind;
  connect(code: string): void;
  onMessage: (msg: HostToClient) => void;
  onStatus: (status: ClientStatus, info?: string) => void;
  send(msg: ClientToHost): void;
  close(): void;
}

export const HOST_PREFIX = 'desi-party-night-v1-';

let cachedKind: Promise<NetKind> | null = null;

/**
 * Pick the realtime transport. Both TV and phones run the same logic, so they agree:
 *  - ?net=local  -> BroadcastChannel (same-browser testing)
 *  - ABLY_API_KEY set on Vercel -> Ably relay (most reliable on smart TVs)
 *  - otherwise -> WebRTC peer-to-peer via PeerJS (zero setup)
 */
export function detectNetKind(): Promise<NetKind> {
  if (cachedKind) return cachedKind;
  const forced = params().get('net');
  if (forced === 'local' || forced === 'p2p' || forced === 'ably') {
    cachedKind = Promise.resolve(forced);
    return cachedKind;
  }
  cachedKind = fetch('/api/realtime-token?probe=1', { cache: 'no-store' })
    .then(async (r) => {
      if (!r.ok) return 'p2p' as NetKind;
      const ct = r.headers.get('content-type') || '';
      if (ct.indexOf('json') < 0) return 'p2p' as NetKind;
      const j = await r.json();
      return (j && j.enabled ? 'ably' : 'p2p') as NetKind;
    })
    .catch(() => 'p2p' as NetKind);
  return cachedKind;
}

export async function createHostTransport(kind: NetKind): Promise<HostTransport> {
  if (kind === 'local') return new (await import('./local')).LocalHost();
  if (kind === 'ably') return new (await import('./ably')).AblyHost();
  return new (await import('./peer')).PeerHost();
}

export async function createClientTransport(kind: NetKind, clientId?: string): Promise<ClientTransport> {
  if (kind === 'local') return new (await import('./local')).LocalClient();
  if (kind === 'ably') return new (await import('./ably')).AblyClient(clientId);
  return new (await import('./peer')).PeerClient();
}
