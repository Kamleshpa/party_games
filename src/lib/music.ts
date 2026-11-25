// Background music, synthesized live with WebAudio. It's original, so there's nothing to license.
// "Desi game show": dhol + claps + disco octave bass + brass stabs + a tumbi riff.
// Tracks change on the next bar so it never stutters; music ducks under the announcer.
import { audioGraph } from './sfx';

export type Track = 'off' | 'lobby' | 'tambola' | 'quiz';

const BASE_VOLUME = 0.32;

let bus: GainNode | null = null; // music volume / fades
let duckNode: GainNode | null = null; // ducking under the voice
let timer: any = null;
let current: Track = 'off';
let want: Track = 'off';
let level = 1; // 0 calm, 1 normal, 2 hype
let nextTime = 0;
let step = 0;
const ducks = new Set<string>();

const midiHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

function graph() {
  const g = audioGraph();
  if (!g) return null;
  if (!bus) {
    bus = g.ac.createGain();
    bus.gain.value = 0;
    duckNode = g.ac.createGain();
    duckNode.gain.value = 1;
    bus.connect(duckNode);
    duckNode.connect(g.master);
  }
  return g;
}

function ramp(v: number, secs: number) {
  const g = graph();
  if (!g || !bus) return;
  const now = g.ac.currentTime;
  bus.gain.cancelScheduledValues(now);
  bus.gain.setValueAtTime(bus.gain.value, now);
  bus.gain.linearRampToValueAtTime(v, now + secs);
}

/** Ask for a track. intensity: 0 calm, 1 normal, 2 hype. */
export function setMusic(track: Track, intensity = 1) {
  if (track === want && intensity === level && (timer || track === 'off')) return;
  level = intensity;
  want = track;
  const g = graph();
  if (!g) return;
  if (want === 'off') {
    ramp(0, 0.5); // loop stops at the next bar
    return;
  }
  ramp(BASE_VOLUME, 0.8);
  if (current === 'off') {
    current = want;
    step = 0;
    nextTime = g.ac.currentTime + 0.05;
  }
  if (!timer) timer = setInterval(pump, 40);
}

/** Lower the music while something important plays (reasons stack: 'voice', 'show'). */
export function duckMusic(reason: string, on: boolean) {
  if (on) ducks.add(reason);
  else ducks.delete(reason);
  const g = graph();
  if (!g || !duckNode) return;
  const target = ducks.has('show') ? 0.15 : ducks.size ? 0.35 : 1;
  duckNode.gain.setTargetAtTime(target, g.ac.currentTime, 0.12);
}

export function musicState() {
  return { current, want, level, step, ducks: Array.from(ducks) };
}

function pump() {
  const g = audioGraph();
  if (!g) return;
  const ac = g.ac;
  if (nextTime < ac.currentTime - 0.5) nextTime = ac.currentTime + 0.05; // tab was asleep: don't burst
  while (nextTime < ac.currentTime + 0.35) {
    if (step % 16 === 0 && want !== current) {
      if (want === 'off') {
        current = 'off';
        clearInterval(timer);
        timer = null;
        return;
      }
      current = want;
      step = 0;
    }
    if (current === 'off') return;
    const def = TRACKS[current];
    const spb = 60 / def.bpm / 4;
    const swing = step % 2 === 1 ? spb * def.swing : 0;
    try {
      def.play(step % 16, Math.floor(step / 16), nextTime + swing, spb);
    } catch {
      /* never let music break the game */
    }
    nextTime += spb;
    step++;
  }
}

// ------------------------------------------------------------------ instruments
let noiseBuf: AudioBuffer | null = null;
const pluckCache = new Map<number, AudioBuffer>();

function ctx(): AudioContext {
  return audioGraph()!.ac;
}

function envGain(t: number, peak: number, decay: number, attack = 0.002): GainNode {
  const g = ctx().createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  return g;
}

function tone(type: OscillatorType, f0: number, f1: number, t: number, peak: number, decay: number, slide = decay) {
  const ac = ctx();
  const o = ac.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + slide);
  const g = envGain(t, peak, decay);
  o.connect(g);
  g.connect(bus!);
  o.start(t);
  o.stop(t + decay + 0.05);
}

function noiseHit(t: number, type: BiquadFilterType, freq: number, q: number, peak: number, decay: number) {
  const ac = ctx();
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = ac.createBufferSource();
  src.buffer = noiseBuf;
  const f = ac.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = envGain(t, peak, decay, 0.001);
  src.connect(f);
  f.connect(g);
  g.connect(bus!);
  src.start(t, Math.random() * 0.5);
  src.stop(t + decay + 0.05);
}

const kick = (t: number, v = 1) => tone('sine', 150, 42, t, 0.9 * v, 0.32, 0.11);
const dagga = (t: number, v = 1) => {
  // the big side of the dhol
  tone('sine', 98, 55, t, 0.75 * v, 0.42, 0.18);
  noiseHit(t, 'lowpass', 600, 0.7, 0.25 * v, 0.03);
};
const tilli = (t: number, v = 1) => {
  // the sharp side of the dhol
  noiseHit(t, 'bandpass', 2600, 1.6, 0.5 * v, 0.07);
  tone('triangle', 460, 400, t, 0.16 * v, 0.06);
};
const clap = (t: number, v = 1) => {
  noiseHit(t, 'bandpass', 1300, 0.9, 0.32 * v, 0.025);
  noiseHit(t + 0.011, 'bandpass', 1300, 0.9, 0.32 * v, 0.025);
  noiseHit(t + 0.022, 'bandpass', 1300, 0.9, 0.3 * v, 0.14);
};
const shaker = (t: number, v = 1) => noiseHit(t, 'highpass', 7000, 0.7, 0.12 * v, 0.035);
const woodblock = (t: number, high: boolean, v = 1) => tone('sine', high ? 1750 : 1250, high ? 1750 : 1250, t, 0.2 * v, 0.045);

function bass(t: number, midi: number, dur: number, v = 1) {
  const ac = ctx();
  const f = midiHz(midi);
  const o = ac.createOscillator();
  o.type = 'sawtooth';
  o.frequency.value = f;
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.Q.value = 7;
  lp.frequency.setValueAtTime(1600, t);
  lp.frequency.exponentialRampToValueAtTime(320, t + dur);
  const g = envGain(t, 0.3 * v, dur);
  o.connect(lp);
  lp.connect(g);
  g.connect(bus!);
  o.start(t);
  o.stop(t + dur + 0.05);
  tone('sine', f, f, t, 0.22 * v, dur);
}

function stab(t: number, notes: number[], dur: number, v = 1) {
  const ac = ctx();
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 2400;
  lp.Q.value = 0.8;
  lp.connect(bus!);
  for (const n of notes) {
    for (const det of [-8, 8]) {
      const o = ac.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = midiHz(n);
      o.detune.value = det;
      const g = envGain(t, 0.05 * v, dur, 0.004);
      o.connect(g);
      g.connect(lp);
      o.start(t);
      o.stop(t + dur + 0.05);
    }
  }
}

function pad(t: number, notes: number[], dur: number, v = 1) {
  const ac = ctx();
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 1100;
  lp.connect(bus!);
  for (const n of notes) {
    const o = ac.createOscillator();
    o.type = 'triangle';
    o.frequency.value = midiHz(n);
    o.detune.value = Math.random() * 10 - 5;
    const g = ac.createGain();
    const peak = 0.045 * v;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.35);
    g.gain.setValueAtTime(peak, t + dur - 0.3);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(lp);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
}

/** Plucked string (Karplus–Strong) — sounds like a tumbi / santoor. Buffers are cached per note. */
function pluck(t: number, midi: number, v = 1) {
  const ac = ctx();
  let buf = pluckCache.get(midi);
  if (!buf) {
    const sr = ac.sampleRate;
    const N = Math.max(2, Math.round(sr / midiHz(midi)));
    const len = Math.floor(sr * 0.9);
    buf = ac.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    const ring = new Float32Array(N);
    for (let i = 0; i < N; i++) ring[i] = Math.random() * 2 - 1;
    let idx = 0;
    for (let i = 0; i < len; i++) {
      const a = ring[idx];
      const b = ring[(idx + 1) % N];
      ring[idx] = 0.995 * 0.5 * (a + b);
      d[i] = a;
      idx = (idx + 1) % N;
    }
    for (let i = len - 800; i < len; i++) d[i] *= (len - i) / 800;
    pluckCache.set(midi, buf);
  }
  const src = ac.createBufferSource();
  src.buffer = buf;
  const hp = ac.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 250;
  const g = ac.createGain();
  g.gain.value = 0.3 * v;
  src.connect(hp);
  hp.connect(g);
  g.connect(bus!);
  src.start(t);
}

// ------------------------------------------------------------------ tracks
interface TrackDef {
  bpm: number;
  swing: number;
  play(s: number, bar: number, t: number, spb: number): void;
}

// Tambola: bouncy bhangra-meets-game-show. Am – F – G – E (that E chord is pure Bollywood drama).
const T_CHORDS = [
  [57, 60, 64],
  [53, 57, 60],
  [55, 59, 62],
  [52, 56, 59],
];
const T_BASS = [45, 41, 43, 40];
const T_RIFF: Record<number, number>[] = [
  { 0: 76, 2: 76, 3: 74, 4: 76, 6: 69, 7: 72, 8: 76, 10: 81, 11: 79, 12: 76, 14: 74 },
  { 0: 77, 2: 77, 3: 76, 4: 77, 6: 72, 7: 76, 8: 77, 10: 81, 11: 79, 12: 77, 14: 76 },
  { 0: 79, 2: 79, 3: 77, 4: 79, 6: 74, 7: 77, 8: 79, 10: 83, 11: 81, 12: 79, 14: 77 },
  { 0: 76, 2: 80, 4: 83, 6: 80, 8: 76, 10: 74, 11: 76, 12: 71, 14: 68 },
];

// Lobby: laid-back, a gentle santoor melody. Am – F – C – G
const L_CHORDS = [
  [57, 60, 64],
  [57, 60, 65],
  [55, 60, 64],
  [55, 59, 62],
];
const L_BASS = [45, 41, 48, 43];
const L_MELODY: Record<number, number>[] = [
  { 0: 76, 4: 74, 8: 72, 12: 69 },
  { 0: 72, 4: 74, 8: 76, 12: 72 },
  { 0: 79, 4: 76, 8: 74, 12: 72 },
  { 0: 74, 4: 71, 8: 67, 10: 69, 12: 71 },
];

// Quiz: "thinking" groove with a ticking clock. Dm – Bb – Gm – A
const Q_CHORDS = [
  [50, 53, 57],
  [46, 50, 53],
  [43, 46, 50],
  [45, 49, 52],
];
const Q_BASS = [38, 34, 43, 45];
const Q_ARP = [0, 3, 6, 10];

const TRACKS: Record<Exclude<Track, 'off'>, TrackDef> = {
  tambola: {
    bpm: 112,
    swing: 0.12,
    play(s, bar, t, spb) {
      const b = bar % 4;
      const cycle = Math.floor(bar / 4);
      if (s === 0 || s === 8) kick(t, 0.9);
      if (s === 0 || s === 3 || s === 8 || s === 11) dagga(t, 0.85);
      if (b === 3 && s >= 13) dagga(t, 0.5 + (s - 13) * 0.15); // little fill into the loop
      if (s === 4 || s === 6 || s === 12 || s === 14) tilli(t, 0.7);
      else if (s === 2 || s === 10) tilli(t, 0.3);
      if (s === 4 || s === 12) clap(t, 0.8);
      if (level >= 2 || s % 2 === 0) shaker(t, s % 4 === 2 ? 1 : 0.55);
      if (s % 2 === 0) bass(t, T_BASS[b] + (s % 4 === 2 ? 12 : 0), spb * 1.6);
      if (level >= 1 && (s === 6 || s === 14)) stab(t, T_CHORDS[b], 0.16);
      if (level >= 1 && s === 0 && b === 0) stab(t, T_CHORDS[0].map((n) => n + 12), 0.4, 1.2);
      if (level >= 1 && (cycle % 2 === 1 || level >= 2)) {
        const n = T_RIFF[b][s];
        if (n) pluck(t, n, 0.9);
      }
    },
  },
  lobby: {
    bpm: 96,
    swing: 0.18,
    play(s, bar, t, spb) {
      const b = bar % 4;
      const cycle = Math.floor(bar / 4);
      if (s === 0) pad(t, L_CHORDS[b], spb * 16);
      if (s === 0 || s === 10) kick(t, 0.5);
      if (s === 0 || s === 7 || s === 10) dagga(t, 0.5);
      if (s === 4 || s === 12) tilli(t, 0.45);
      if (s % 2 === 0) shaker(t, s % 4 === 2 ? 0.6 : 0.3);
      if (s === 0 || s === 8) bass(t, L_BASS[b], spb * 6, 0.8);
      if (cycle % 2 === 1) {
        const n = L_MELODY[b][s];
        if (n) pluck(t, n, 0.6);
      }
    },
  },
  quiz: {
    bpm: 120,
    swing: 0,
    play(s, bar, t, spb) {
      const b = bar % 4;
      const cycle = Math.floor(bar / 4);
      if (s % 2 === 0) woodblock(t, s % 4 === 0, s % 4 === 0 ? 0.9 : 0.6);
      if (s === 0 || s === 8) kick(t, 0.6);
      if (s === 0) pad(t, Q_CHORDS[b], spb * 16, 0.8);
      if (s % 2 === 0) bass(t, Q_BASS[b], spb * 1.3, 0.7);
      if (level >= 2) {
        shaker(t, s % 2 === 0 ? 0.8 : 0.5);
        if (s === 4 || s === 12) clap(t, 0.6);
      }
      if (level >= 1 && cycle % 2 === 1) {
        const k = Q_ARP.indexOf(s);
        if (k >= 0) pluck(t, Q_CHORDS[b][k % 3] + 12 + (k === 3 ? 12 : 0), 0.5);
      }
    },
  },
};
