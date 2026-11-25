// Tambola announcer. Plays pre-generated clips from /public/audio/tambola (see
// scripts/gen-tambola-audio.mjs, which writes manifest.json), one at a time, ducking
// the background music while speaking. Falls back to the browser's speech engine.
import { callSpoken, EXTRA_CLIPS, HYPE } from '../games/tambola/calls';
import { duckMusic } from './music';

interface Manifest {
  ext: string;
  voice?: string;
  durations: Record<string, number>; // seconds, by file name
  hype: number;
}

let manifest: Manifest | null = null;
let muted = false;
let queue: string[] = [];
let playing = false;
let token = 0;
let current: HTMLAudioElement | null = null;

export function setMuted(m: boolean) {
  muted = m;
  if (m) {
    queue = [];
    if (current) current.pause();
    try {
      window.speechSynthesis && window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
    finish();
  }
}
export function isMuted() {
  return muted;
}

export function loadVoices() {
  if (manifest) return;
  fetch('/audio/tambola/manifest.json', { cache: 'no-cache' })
    .then((r) => (r.ok && (r.headers.get('content-type') || '').indexOf('json') >= 0 ? r.json() : null))
    .then((m) => {
      if (m && m.durations) manifest = m;
    })
    .catch(() => {});
}

/** Clip file name for a voice key: 'n25' -> '25', 'hype' -> 'hype3' (random). */
function fileFor(key: string): string {
  if (key[0] === 'n' && /^n\d+$/.test(key)) return key.slice(1);
  if (key === 'hype') return 'hype' + (1 + Math.floor(Math.random() * (manifest ? manifest.hype : HYPE.length)));
  return key;
}

function textFor(file: string): string {
  if (/^\d+$/.test(file)) return callSpoken(Number(file));
  if (file.indexOf('hype') === 0) return HYPE[Number(file.slice(4)) - 1] || '';
  return EXTRA_CLIPS[file] || '';
}

/** How long a line takes to say (ms), so the game can wait for the announcer. */
export function voiceMs(key: string): number {
  if (muted) return 0;
  if (key === 'hype') return manifest ? avgHype() : 2500;
  const file = fileFor(key);
  const d = manifest && manifest.durations[file];
  if (d) return Math.round(d * 1000);
  return Math.round(textFor(file).length * 75); // rough speaking rate
}

function avgHype(): number {
  if (!manifest) return 2500;
  let sum = 0;
  let n = 0;
  for (let i = 1; i <= manifest.hype; i++) {
    const d = manifest.durations['hype' + i];
    if (d) {
      sum += d;
      n++;
    }
  }
  return n ? Math.round((sum / n) * 1000) : 2500;
}

export function playVoice(key: string) {
  if (muted) return;
  // Never let a backlog build up: drop pending filler lines first.
  if (queue.length >= 2) queue = queue.filter((f) => f.indexOf('hype') !== 0);
  queue.push(fileFor(key));
  if (!playing) next();
}

function finish() {
  playing = false;
  duckMusic('voice', false);
}

function next() {
  const file = queue.shift();
  if (!file) return finish();
  playing = true;
  duckMusic('voice', true);
  const my = ++token;
  const done = () => {
    if (my !== token) return;
    token++;
    if (current) current.pause();
    next();
  };
  // safety net in case 'ended' never fires
  setTimeout(done, voiceMs(file[0] >= '0' && file[0] <= '9' ? 'n' + file : file) + 2500);
  if (!manifest) return speak(textFor(file), done);
  try {
    const a = new Audio('/audio/tambola/' + file + '.' + manifest.ext);
    current = a;
    a.onended = done;
    a.onerror = () => speak(textFor(file), done);
    const p = a.play();
    if (p && p.catch) p.catch(() => speak(textFor(file), done));
  } catch {
    speak(textFor(file), done);
  }
}

function speak(text: string, done: () => void) {
  try {
    const synth = window.speechSynthesis;
    if (!synth || !text) return done();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-IN';
    u.rate = 1;
    const voices = synth.getVoices();
    const v = voices.find((x) => x.lang === 'en-IN') || voices.find((x) => x.lang.indexOf('en') === 0);
    if (v) u.voice = v;
    u.onend = done;
    u.onerror = done;
    synth.speak(u);
  } catch {
    done();
  }
}
