import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ReactNode } from 'react';
import QRCode from 'qrcode';
import { Emo } from '../lib/Emo';
import type { Player } from '../games/types';

export const STAGE_W = 1920;
export const STAGE_H = 1080;

/** Fixed 1920x1080 canvas scaled to whatever the TV reports. Layout is authored in px. */
export function Stage({ children }: { children: ReactNode }) {
  const [box, setBox] = useState({ scale: 1, left: 0, top: 0 });
  useEffect(() => {
    const fit = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const scale = Math.min(w / STAGE_W, h / STAGE_H);
      setBox({ scale, left: (w - STAGE_W * scale) / 2, top: (h - STAGE_H * scale) / 2 });
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return (
    <div className="stage-wrap">
      <div
        className="stage"
        style={{ transform: `scale(${box.scale})`, WebkitTransform: `scale(${box.scale})`, left: box.left, top: box.top }}
      >
        {children}
      </div>
    </div>
  );
}

export function Garland() {
  return <div className="garland" aria-hidden="true" />;
}

export function Avatar({ p, size = 96, crown, dim, badge }: { p: Pick<Player, 'avatar' | 'color' | 'name'>; size?: number; crown?: boolean; dim?: boolean; badge?: ReactNode }) {
  return (
    <div className={'av' + (dim ? ' dim' : '')} style={{ width: size, height: size, borderColor: p.color, background: p.color + '33' }}>
      <Emo e={p.avatar} size={Math.round(size * 0.62)} />
      {crown && <span className="av-crown"><Emo e="👑" size={Math.round(size * 0.42)} /></span>}
      {badge != null && <span className="av-badge">{badge}</span>}
    </div>
  );
}

export function Qr({ text, size }: { text: string; size: number }) {
  const [svg, setSvg] = useState('');
  useEffect(() => {
    QRCode.toString(text, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#1a0b3d', light: '#ffffff' } })
      .then(setSvg)
      .catch(() => setSvg(''));
  }, [text]);
  return <div className="qr" style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function joinUrl(code: string, net: string): string {
  return window.location.origin + '/?r=' + code + (net === 'local' ? '&net=local' : '');
}

export function JoinChip({ code }: { code: string }) {
  return (
    <div className="join-chip">
      <span>Join:</span> <b>{window.location.host}</b> <span>code</span> <b className="code-sm">{code}</b>
    </div>
  );
}

export function TimerBar({ startedAt, endsAt, now, paused }: { startedAt: number; endsAt: number; now: number; paused?: boolean }) {
  const total = Math.max(1, endsAt - startedAt);
  const frac = Math.max(0, Math.min(1, (endsAt - now) / total));
  const hot = endsAt - now < 5000;
  return (
    <div className={'timer-bar' + (hot ? ' hot' : '')}>
      <div className="timer-fill" style={{ width: (paused ? 100 : frac * 100) + '%' }} />
    </div>
  );
}

export function PausedOverlay() {
  return (
    <div className="paused-overlay">
      <Emo e="⏸️" size={160} />
      <h1>Hold on!</h1>
      <p>Game paused — the Captain can resume it from their phone</p>
    </div>
  );
}

// ---------- Confetti ----------
export interface ConfettiHandle {
  fire(big?: boolean): void;
}

const CONFETTI_COLORS = ['#ffb703', '#ff4d8d', '#06d6a0', '#4cc9f0', '#fb8500', '#b388ff', '#fff4dc'];

export const Confetti = forwardRef<ConfettiHandle>(function Confetti(_props, ref) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const parts = useRef<any[]>([]);
  const running = useRef(false);

  useImperativeHandle(ref, () => ({
    fire(big?: boolean) {
      const n = big ? 220 : 110;
      for (let i = 0; i < n; i++) {
        const fromLeft = i % 2 === 0;
        parts.current.push({
          x: big ? Math.random() * STAGE_W : fromLeft ? 0 : STAGE_W,
          y: big ? -20 - Math.random() * 300 : STAGE_H * 0.7,
          vx: big ? (Math.random() - 0.5) * 6 : (fromLeft ? 1 : -1) * (8 + Math.random() * 14),
          vy: big ? 2 + Math.random() * 5 : -(14 + Math.random() * 14),
          r: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.3,
          w: 10 + Math.random() * 12,
          h: 6 + Math.random() * 8,
          c: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          marigold: Math.random() < 0.25,
        });
      }
      if (!running.current) loop();
    },
  }));

  function loop() {
    const cv = canvas.current;
    const g = cv && cv.getContext('2d');
    if (!cv || !g) return;
    running.current = true;
    const step = () => {
      g.clearRect(0, 0, STAGE_W, STAGE_H);
      const ps = parts.current;
      for (const p of ps) {
        p.vy += 0.35;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.r);
        g.fillStyle = p.c;
        if (p.marigold) {
          g.beginPath();
          g.arc(0, 0, p.w * 0.55, 0, Math.PI * 2);
          g.fill();
        } else g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        g.restore();
      }
      parts.current = ps.filter((p) => p.y < STAGE_H + 40);
      if (parts.current.length) requestAnimationFrame(step);
      else {
        g.clearRect(0, 0, STAGE_W, STAGE_H);
        running.current = false;
      }
    };
    requestAnimationFrame(step);
  }

  return <canvas ref={canvas} className="confetti" width={STAGE_W} height={STAGE_H} />;
});
