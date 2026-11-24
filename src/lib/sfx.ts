// Tiny WebAudio synth so we need no sound files (and nothing to license).
import type { SfxName } from '../games/types';

let ac: AudioContext | null = null;
let master: GainNode | null = null;

export function unlockAudio() {
  try {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    if (!ac) {
      ac = new AC() as AudioContext;
      master = ac.createGain();
      master.gain.value = 0.7;
      master.connect(ac.destination);
    }
    if (ac.state === 'suspended') ac.resume();
    // a silent blip fully unlocks iOS/old webkit
    const o = ac.createOscillator();
    const g = ac.createGain();
    g.gain.value = 0;
    o.connect(g);
    g.connect(master!);
    o.start();
    o.stop(ac.currentTime + 0.01);
  } catch {
    /* no audio */
  }
}

function tone(freq: number, at: number, dur: number, type: OscillatorType = 'sine', gain = 0.2, slideTo?: number) {
  if (!ac || !master) return;
  const t = ac.currentTime + at;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

let noiseBuf: AudioBuffer | null = null;
function noise(at: number, dur: number, gain = 0.2, freq = 1200, q = 0.8) {
  if (!ac || !master) return;
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = ac.currentTime + at;
  const src = ac.createBufferSource();
  src.buffer = noiseBuf;
  const f = ac.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ac.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f);
  f.connect(g);
  g.connect(master);
  src.start(t);
  src.stop(t + dur + 0.05);
}

const N = { C4: 261.6, E4: 329.6, G4: 392, A4: 440, C5: 523.3, D5: 587.3, E5: 659.3, G5: 784, A5: 880, C6: 1046.5 };

export function sfx(name: SfxName) {
  if (!ac) return;
  switch (name) {
    case 'pop':
      tone(500, 0, 0.12, 'sine', 0.25, 1100);
      break;
    case 'tick':
      tone(1400, 0, 0.04, 'square', 0.05);
      break;
    case 'lock':
      tone(900, 0, 0.05, 'square', 0.08);
      tone(1300, 0.04, 0.06, 'square', 0.06);
      break;
    case 'whoosh':
      noise(0, 0.4, 0.25, 600, 0.6);
      noise(0.08, 0.35, 0.18, 1800, 0.6);
      break;
    case 'ding':
      tone(N.E5 * 2, 0, 0.8, 'sine', 0.2);
      tone(N.E5 * 3, 0, 0.5, 'sine', 0.06);
      break;
    case 'correct':
      [N.C5, N.E5, N.G5, N.C6].forEach((f, i) => tone(f, i * 0.08, 0.3, 'triangle', 0.22));
      break;
    case 'wrong':
      tone(240, 0, 0.45, 'sawtooth', 0.12, 110);
      break;
    case 'buzzer':
      for (let i = 0; i < 3; i++) {
        tone(620, i * 0.36, 0.18, 'square', 0.12);
        tone(880, i * 0.36 + 0.18, 0.18, 'square', 0.12);
      }
      tone(110, 0, 1.1, 'sawtooth', 0.12);
      break;
    case 'fanfare':
      [N.G4, N.C5, N.E5, N.G5].forEach((f, i) => tone(f, i * 0.12, 0.2, 'triangle', 0.22));
      [N.C5, N.E5, N.G5, N.C6].forEach((f) => tone(f, 0.5, 0.9, 'triangle', 0.15));
      break;
    case 'drumroll':
      for (let i = 0; i < 20; i++) noise(i * 0.075, 0.08, 0.05 + i * 0.012, 900, 0.9);
      tone(90, 1.55, 0.4, 'sine', 0.5, 50);
      break;
    case 'start': {
      // dha - dhin - dhin - dha (dhol-ish) + bell
      const pat = [0, 0.22, 0.36, 0.58, 0.8, 0.94];
      pat.forEach((t, i) => {
        tone(i % 3 === 0 ? 85 : 140, t, 0.25, 'sine', 0.55, i % 3 === 0 ? 50 : 90);
        noise(t, 0.06, 0.12, 2500, 1);
      });
      tone(N.A5, 1.15, 1.2, 'sine', 0.15);
      tone(N.A5 * 2.76, 1.15, 0.6, 'sine', 0.04);
      break;
    }
  }
}

export function vibrate(pattern: number | number[]) {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
}
