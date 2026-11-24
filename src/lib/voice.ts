// Announcer voice for Tambola (Indian-English). Uses pre-generated clips in /public/audio/tambola
// (see scripts/gen-tambola-audio.mjs); falls back to the browser's speech engine.
import { callSpoken, EXTRA_CLIPS } from '../games/tambola/calls';

let current: HTMLAudioElement | null = null;
let clipsOk: boolean | null = null;
let muted = false;

export function setMuted(m: boolean) {
  muted = m;
  if (m && current) current.pause();
}
export function isMuted() {
  return muted;
}

function textFor(key: string): string {
  if (key[0] === 'n') return callSpoken(Number(key.slice(1)));
  return EXTRA_CLIPS[key] || '';
}

function fileFor(key: string): string {
  return '/audio/tambola/' + (key[0] === 'n' ? key.slice(1) : key) + '.m4a';
}

export function checkClips() {
  if (clipsOk !== null) return;
  clipsOk = false;
  const a = new Audio();
  if (!a.canPlayType || a.canPlayType('audio/mp4') === '') return;
  fetch(fileFor('n1'), { method: 'HEAD' })
    .then((r) => {
      const ct = r.headers.get('content-type') || '';
      clipsOk = r.ok && ct.indexOf('html') < 0;
    })
    .catch(() => (clipsOk = false));
}

function speak(text: string) {
  try {
    const synth = window.speechSynthesis;
    if (!synth || !text) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-IN';
    u.rate = 0.95;
    const voices = synth.getVoices();
    const v = voices.find((x) => x.lang === 'en-IN') || voices.find((x) => x.lang.indexOf('en') === 0);
    if (v) u.voice = v;
    synth.speak(u);
  } catch {
    /* no speech */
  }
}

export function playVoice(key: string) {
  if (muted) return;
  const text = textFor(key);
  if (!clipsOk) {
    speak(text);
    return;
  }
  try {
    if (current) current.pause();
    const a = new Audio(fileFor(key));
    current = a;
    a.play().catch(() => speak(text));
  } catch {
    speak(text);
  }
}
