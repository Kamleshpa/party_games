// Tambola announcer. Plays pre-generated clips from /public/audio/tambola (see
// scripts/gen-tambola-audio.mjs, which writes manifest.json), one at a time, ducking
// the background music while speaking. Falls back to the browser's speech engine.
import { clipName, clipText, LINES } from '../games/tambola/calls';
import { duckMusic } from './music';

interface Manifest {
  ext: string;
  voice?: string;
  durations: Record<string, number>; // seconds, by file name
  pools?: Record<string, number>; // variants recorded per event line
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

const lastPick: Record<string, number> = {};

function variants(key: string): number {
  const recorded = manifest && manifest.pools && manifest.pools[key];
  return recorded || (LINES[key] ? LINES[key].length : 0);
}

/** Clip file for a voice key: 'n25' -> '25'; 'bogey' -> 'bogey-2' (random, never the same one twice running). */
function fileFor(key: string): string {
  if (/^n\d+$/.test(key)) return key.slice(1);
  const count = variants(key);
  if (!count) return key;
  let i = 1 + Math.floor(Math.random() * count);
  if (count > 1 && i === lastPick[key]) i = (i % count) + 1;
  lastPick[key] = i;
  return clipName(key, i);
}

function fileMs(file: string): number {
  const d = manifest && manifest.durations[file];
  if (d) return Math.round(d * 1000);
  return Math.round(clipText(file).length * 75); // rough speaking rate
}

/** How long a line takes to say (ms), so the game can wait for the announcer. Event lines: the longest variant. */
export function voiceMs(key: string): number {
  if (muted) return 0;
  if (/^n\d+$/.test(key)) return fileMs(key.slice(1));
  let max = 0;
  for (let i = 1; i <= variants(key); i++) max = Math.max(max, fileMs(clipName(key, i)));
  return max;
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
  setTimeout(done, fileMs(file) + 2500);
  if (!manifest) return speak(clipText(file), done);
  try {
    const a = new Audio('/audio/tambola/' + file + '.' + manifest.ext);
    current = a;
    a.onended = done;
    a.onerror = () => speak(clipText(file), done);
    const p = a.play();
    if (p && p.catch) p.catch(() => speak(clipText(file), done));
  } catch {
    speak(clipText(file), done);
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
