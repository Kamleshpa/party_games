// Same-browser transport for testing: open the TV in one tab and phones in other tabs with ?net=local.
import type { ClientToHost, HostToClient } from '../shared/types';
import { randomId } from '../lib/rand';
import type { ClientStatus, ClientTransport, HostTransport } from './transport';

export class LocalHost implements HostTransport {
  kind = 'local' as const;
  onMessage: (connId: string, msg: ClientToHost) => void = () => {};
  onClose: (connId: string) => void = () => {};
  private bc: BroadcastChannel | null = null;

  async start(code: string) {
    this.bc = new BroadcastChannel('dpn-local-' + code);
    this.bc.onmessage = (e) => {
      const d = e.data;
      if (d && d.dir === 'c') {
        if (d.bye) this.onClose(d.from);
        else this.onMessage(d.from, d.m);
      }
    };
  }

  send(connId: string, msg: HostToClient) {
    this.bc?.postMessage({ dir: 'h', to: connId, m: msg });
  }

  stop() {
    this.bc?.close();
  }
}

export class LocalClient implements ClientTransport {
  kind = 'local' as const;
  onMessage: (msg: HostToClient) => void = () => {};
  onStatus: (status: ClientStatus, info?: string) => void = () => {};
  private bc: BroadcastChannel | null = null;
  private id = randomId();

  connect(code: string) {
    this.bc = new BroadcastChannel('dpn-local-' + code);
    this.bc.onmessage = (e) => {
      const d = e.data;
      if (d && d.dir === 'h' && d.to === this.id) this.onMessage(d.m);
    };
    setTimeout(() => this.onStatus('open'), 50);
  }

  send(msg: ClientToHost) {
    this.bc?.postMessage({ dir: 'c', from: this.id, m: msg });
  }

  close() {
    try {
      this.bc?.postMessage({ dir: 'c', from: this.id, bye: true });
      this.bc?.close();
    } catch {
      /* ignore */
    }
  }
}
