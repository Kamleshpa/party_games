// Phone-side connection manager: joins the TV's room and reconnects automatically
// when the phone sleeps, switches networks, or the TV refreshes.
import { createClientTransport, detectNetKind, type ClientTransport, type NetKind } from '../net/transport';
import type { CaptainCmd, HostToClient, PlayerView } from '../shared/types';

export type ConnState = 'connecting' | 'open' | 'reconnecting' | 'no-room' | 'full' | 'kicked';

export interface Identity {
  pid: string;
  name: string;
  avatar: string;
}

export class PlayerClient {
  state: ConnState = 'connecting';
  view: PlayerView | null = null;
  kind: NetKind = 'p2p';
  /** Why the last attempt failed ('ice' = can't reach the TV directly). */
  lastError = '';
  failures = 0;
  startedAt = Date.now();
  offset = 0;
  version = 0;
  private t: ClientTransport | null = null;
  private lastMsg = 0;
  private connectStarted = 0;
  private retry = 0;
  private retryTimer: any = null;
  private watch: any = null;
  private samples: number[] = [];
  private listeners = new Set<() => void>();
  private stopped = false;

  constructor(public code: string, public ident: Identity) {}

  async start() {
    this.kind = await detectNetKind();
    this.connect();
    this.watch = setInterval(() => this.watchdog(), 2000);
    document.addEventListener('visibilitychange', this.onWake);
    window.addEventListener('online', this.onWake);
    window.addEventListener('focus', this.onWake);
  }

  stop() {
    this.stopped = true;
    clearInterval(this.watch);
    clearTimeout(this.retryTimer);
    document.removeEventListener('visibilitychange', this.onWake);
    window.removeEventListener('online', this.onWake);
    window.removeEventListener('focus', this.onWake);
    this.t && this.t.close();
  }

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };

  private emit() {
    this.version++;
    this.listeners.forEach((fn) => fn());
  }

  private set(st: ConnState) {
    if (this.state !== st) {
      this.state = st;
      this.emit();
    }
  }

  private async connect() {
    if (this.stopped) return;
    clearTimeout(this.retryTimer);
    this.retryTimer = null;
    if (this.t) this.t.close();
    this.t = null; // never talk to a closed transport while the new one loads
    this.connectStarted = Date.now();
    const t = await createClientTransport(this.kind);
    if (this.stopped) return t.close();
    this.t = t;
    t.onMessage = (m) => {
      if (t === this.t) this.onMsg(m);
    };
    t.onStatus = (s, info) => {
      if (t !== this.t) return;
      if (s === 'open') {
        t.send({ k: 'hello', pid: this.ident.pid, name: this.ident.name, avatar: this.ident.avatar });
      } else {
        if (!this.view) {
          this.failures++;
          this.lastError = info || s;
          this.emit();
        }
        if (info === 'no-room') this.set('no-room');
        else if (this.state === 'open') this.set('reconnecting');
        this.scheduleRetry();
      }
    };
    t.connect(this.code);
  }

  private scheduleRetry() {
    if (this.stopped || this.retryTimer) return;
    const delay = this.state === 'no-room' ? 3000 : Math.min(5000, 700 * Math.pow(2, this.retry++));
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.connect();
    }, delay);
  }

  private onMsg(m: HostToClient) {
    this.lastMsg = Date.now();
    this.retry = 0;
    if (m.k === 'state') {
      this.clock(m.t);
      this.view = m.v;
      this.state = 'open';
      this.emit();
    } else if (m.k === 'ping') {
      this.clock(m.t);
      this.t && this.t.send({ k: 'pong' });
      if (this.state !== 'open' && this.view) this.set('open');
    } else if (m.k === 'rehello') {
      this.t && this.t.send({ k: 'hello', pid: this.ident.pid, name: this.ident.name, avatar: this.ident.avatar });
    } else if (m.k === 'bye') {
      this.set(m.reason === 'full' ? 'full' : 'kicked');
      this.stop();
    }
  }

  /** Estimate host clock offset; the max sample is the one with the least network delay. */
  private clock(hostT: number) {
    this.samples.push(hostT - Date.now());
    if (this.samples.length > 10) this.samples.shift();
    this.offset = Math.max.apply(null, this.samples);
  }

  private watchdog() {
    if (this.stopped) return;
    const now = Date.now();
    // keepalive: lets the TV notice us (and ask for a re-hello) if it was refreshed
    if (this.t && now - this.lastMsg > 4500) this.t.send({ k: 'pong' });
    if (this.state === 'open' && now - this.lastMsg > 12000) {
      this.set('reconnecting');
      this.connect();
    } else if (this.state !== 'open' && !this.retryTimer && now - this.connectStarted > 10000) {
      this.connect();
    }
  }

  private onWake = () => {
    if (this.stopped || document.visibilityState === 'hidden') return;
    if (Date.now() - this.lastMsg > 5000) {
      if (this.state === 'open') this.set('reconnecting');
      this.connect();
    }
  };

  /** "Try again" button: reconnect right away. */
  retryNow() {
    this.retry = 0;
    this.startedAt = Date.now();
    this.failures = 0;
    this.lastError = '';
    this.emit();
    this.connect();
  }

  hostNow() {
    return Date.now() + this.offset;
  }

  act(a: any) {
    this.t && this.t.send({ k: 'act', a });
  }
  game(a: any) {
    this.act({ k: 'game', a });
  }
  cap(c: CaptainCmd) {
    this.act({ k: 'cap', c });
  }
  react(e: string) {
    this.act({ k: 'react', e });
  }
}
