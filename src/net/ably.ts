// Optional relay transport. Enabled automatically when ABLY_API_KEY is set in Vercel.
// Uses plain WebSockets (with long-polling fallback), so it works on smart-TV browsers
// where WebRTC is missing or flaky, and on phones using mobile data.
import type { ClientToHost, HostToClient } from '../shared/types';
import { randomId } from '../lib/rand';
import type { ClientStatus, ClientTransport, HostTransport } from './transport';

async function realtime(clientId: string): Promise<any> {
  const mod: any = await import('ably');
  const Realtime = mod.Realtime || (mod.default && mod.default.Realtime);
  return new Realtime({
    authUrl: '/api/realtime-token',
    authParams: { clientId },
    clientId,
    echoMessages: false,
  });
}

const CHUNK = 12000; // stay well under Ably's message size limit

export class AblyHost implements HostTransport {
  kind = 'ably' as const;
  onMessage: (connId: string, msg: ClientToHost) => void = () => {};
  onClose: (connId: string) => void = () => {};
  private rt: any = null;
  private ch: any = null;
  private queue: [string, HostToClient][] = [];
  private scheduled = false;

  async start(code: string) {
    this.rt = await realtime('host-' + code + '-' + randomId(4));
    this.ch = this.rt.channels.get('dpn:' + code);
    await this.ch.subscribe('c', (msg: any) => {
      const d = msg.data;
      if (d && d.f) this.onMessage(d.f, d.m);
    });
  }

  send(connId: string, msg: HostToClient) {
    this.queue.push([connId, msg]);
    if (!this.scheduled) {
      this.scheduled = true;
      setTimeout(() => this.flush(), 0);
    }
  }

  private flush() {
    this.scheduled = false;
    const q = this.queue;
    this.queue = [];
    let batch: [string, HostToClient][] = [];
    let size = 0;
    const publish = () => {
      if (batch.length) this.ch?.publish('h', { b: batch }).catch(() => {});
      batch = [];
      size = 0;
    };
    for (const item of q) {
      const len = JSON.stringify(item).length;
      if (size + len > CHUNK) publish();
      batch.push(item);
      size += len;
    }
    publish();
  }

  stop() {
    try {
      this.rt?.close();
    } catch {
      /* ignore */
    }
  }
}

export class AblyClient implements ClientTransport {
  kind = 'ably' as const;
  onMessage: (msg: HostToClient) => void = () => {};
  onStatus: (status: ClientStatus, info?: string) => void = () => {};
  private rt: any = null;
  private ch: any = null;
  private id = randomId();
  private done = false;

  connect(code: string) {
    realtime(this.id)
      .then((rt) => {
        if (this.done) {
          rt.close();
          return;
        }
        this.rt = rt;
        this.ch = rt.channels.get('dpn:' + code);
        rt.connection.on('suspended', () => this.status('closed'));
        rt.connection.on('failed', () => this.status('error', 'ably-failed'));
        return this.ch
          .subscribe('h', (msg: any) => {
            const b = msg.data && msg.data.b;
            if (!b) return;
            for (const [to, m] of b) if (to === this.id) this.onMessage(m);
          })
          .then(() => {
            if (!this.done) this.onStatus('open');
          });
      })
      .catch(() => this.status('error', 'ably-auth'));
  }

  private status(s: ClientStatus, info?: string) {
    if (this.done) return;
    this.done = true;
    this.onStatus(s, info);
  }

  send(msg: ClientToHost) {
    this.ch?.publish('c', { f: this.id, m: msg }).catch(() => {});
  }

  close() {
    this.done = true;
    try {
      this.rt?.close();
    } catch {
      /* ignore */
    }
  }
}
