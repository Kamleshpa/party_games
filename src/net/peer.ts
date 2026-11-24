import { Peer, type DataConnection } from 'peerjs';
import type { ClientToHost, HostToClient } from '../shared/types';
import { HOST_PREFIX, type ClientStatus, type ClientTransport, type HostTransport } from './transport';

export class PeerHost implements HostTransport {
  kind = 'p2p' as const;
  onMessage: (connId: string, msg: ClientToHost) => void = () => {};
  onClose: (connId: string) => void = () => {};
  private peer: Peer | null = null;
  private conns = new Map<string, DataConnection>();
  private stopped = false;

  start(code: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const open = () => {
        attempts++;
        const peer = new Peer(HOST_PREFIX + code, { debug: 0 });
        this.peer = peer;
        peer.on('open', () => resolve());
        peer.on('connection', (conn) => this.accept(conn));
        peer.on('disconnected', () => {
          // Lost the signalling server (not the players). Reconnect so new phones can still join.
          if (this.stopped) return;
          setTimeout(() => {
            try {
              if (!peer.destroyed && peer.disconnected) peer.reconnect();
            } catch {
              /* ignore */
            }
          }, 1500);
        });
        peer.on('error', (err: any) => {
          const type = err && err.type;
          if (type === 'unavailable-id' && attempts < 10) {
            // Happens for a few seconds after a TV refresh while the old id is released.
            peer.destroy();
            setTimeout(open, 2500);
          } else if (type === 'unavailable-id' || type === 'browser-incompatible') {
            reject(new Error(type));
          } else if (type === 'network' || type === 'server-error' || type === 'socket-error') {
            if (attempts === 1 && !peer.open) reject(new Error(type));
          }
        });
      };
      open();
    });
  }

  private accept(conn: DataConnection) {
    const id = conn.connectionId;
    this.conns.set(id, conn);
    conn.on('data', (d) => this.onMessage(id, d as ClientToHost));
    const closed = () => {
      if (this.conns.get(id) === conn) {
        this.conns.delete(id);
        this.onClose(id);
      }
    };
    conn.on('close', closed);
    conn.on('error', closed);
  }

  send(connId: string, msg: HostToClient) {
    const c = this.conns.get(connId);
    if (c && c.open) {
      try {
        c.send(msg);
      } catch {
        /* ignore */
      }
    }
  }

  stop() {
    this.stopped = true;
    this.conns.forEach((c) => {
      try {
        c.close();
      } catch {
        /* ignore */
      }
    });
    this.peer?.destroy();
  }
}

export class PeerClient implements ClientTransport {
  kind = 'p2p' as const;
  onMessage: (msg: HostToClient) => void = () => {};
  onStatus: (status: ClientStatus, info?: string) => void = () => {};
  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  private done = false;

  connect(code: string) {
    const peer = new Peer({ debug: 0 });
    this.peer = peer;
    peer.on('open', () => {
      const conn = peer.connect(HOST_PREFIX + code, { reliable: true, serialization: 'json' });
      this.conn = conn;
      conn.on('open', () => this.status('open'));
      conn.on('data', (d) => this.onMessage(d as HostToClient));
      conn.on('close', () => this.status('closed'));
      conn.on('error', () => this.status('error', 'conn'));
    });
    peer.on('error', (err: any) => {
      const type = err && err.type;
      this.status('error', type === 'peer-unavailable' ? 'no-room' : type || 'unknown');
    });
  }

  private status(s: ClientStatus, info?: string) {
    if (this.done) return;
    if (s !== 'open') this.done = true;
    this.onStatus(s, info);
  }

  send(msg: ClientToHost) {
    if (this.conn && this.conn.open) {
      try {
        this.conn.send(msg);
      } catch {
        /* ignore */
      }
    }
  }

  close() {
    this.done = true;
    try {
      this.conn?.close();
    } catch {
      /* ignore */
    }
    try {
      this.peer?.destroy();
    } catch {
      /* ignore */
    }
  }
}
