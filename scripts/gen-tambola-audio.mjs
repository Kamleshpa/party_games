// Generates the Tambola announcer clips + manifest.json into public/audio/tambola.
//
// Real, human-sounding voice: put your own key in .env.local (git-ignored, never committed),
//   OPENAI_API_KEY=sk-...            (recommended: follows the PERSONA directions below)
//   ELEVENLABS_API_KEY=... ELEVENLABS_VOICE_ID=...
// then run:  npm run gen:audio
// Options: OPENAI_VOICE=verse (default ash), VOICE_PROVIDER=openai|elevenlabs|mac.
// Without a key it falls back to the robotic macOS voice.
//
// Only clips whose text (or voice) changed are re-generated, so re-runs are cheap.
// FORCE=1 re-records everything. Commit public/audio/tambola afterwards so Vercel serves it.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { callSpoken, clipName, LINES } from '../src/games/tambola/calls.ts';

try {
  process.loadEnvFile('.env.local'); // your API keys; variables already set in the shell win
} catch {
  /* no .env.local */
}

const OUT = 'public/audio/tambola';
const env = process.env;
const provider = env.VOICE_PROVIDER || (env.OPENAI_API_KEY ? 'openai' : env.ELEVENLABS_API_KEY ? 'elevenlabs' : 'mac');
const ext = provider === 'mac' ? 'm4a' : 'mp3';

const ELEVEN_VOICE = env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'; // premade "Adam"; pick an Indian voice in the Voice Library
const ELEVEN_MODEL = env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
const OPENAI_VOICE = env.OPENAI_VOICE || 'ash';
const OPENAI_MODEL = env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';
const MAC_VOICE = env.VOICE || 'Rishi';
const label =
  provider === 'elevenlabs' ? `elevenlabs:${ELEVEN_VOICE}:${ELEVEN_MODEL}` : provider === 'openai' ? `openai:${OPENAI_VOICE}:${OPENAI_MODEL}` : `mac:${MAC_VOICE}`;

// Delivery direction for OpenAI's TTS. An original character, not an impression of anyone real.
const PERSONA =
  'You are an original, zany comedy commentator on a slapstick TV game show, calling Tambola (Housie) numbers ' +
  'live at a desi family party in America. Accent: warm, natural Indian English; say the Hindi words ' +
  '(arre, bhai sahab, kya baat hai, bechara, shabash, haaye, dhishoom, ekdum) the authentic Hindi way. ' +
  'Delivery: fast, punchy running commentary with big swings in energy. Drop to a sly, suspenseful hush before a number, ' +
  'punch the number itself loud and crystal clear, then fire off the joke with mock drama: fake shock, fake sympathy, ' +
  'cheeky teasing, as if you can barely stop yourself from laughing. Stretch the sound words like dhishoom, whoosh and oho. ' +
  'A huge grin in the voice the whole time. Never flat, never slow, never robotic.';

const jobs = [];
for (let n = 1; n <= 90; n++) jobs.push([String(n), callSpoken(n)]);
const pools = {};
for (const [key, texts] of Object.entries(LINES)) {
  pools[key] = texts.length;
  texts.forEach((t, i) => jobs.push([clipName(key, i + 1), t]));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hash = (s) => createHash('sha1').update(label + '|' + s).digest('hex').slice(0, 12);

async function elevenlabs(text) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({
      text,
      model_id: ELEVEN_MODEL,
      voice_settings: { stability: 0.3, similarity_boost: 0.8, style: 0.6, use_speaker_boost: true },
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return Buffer.from(await res.arrayBuffer());
}

async function openai(text) {
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OPENAI_MODEL, voice: OPENAI_VOICE, input: text, instructions: PERSONA, response_format: 'mp3' }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return Buffer.from(await res.arrayBuffer());
}

function mac(text, file, tmp) {
  const aiff = join(tmp, 'clip.aiff');
  execFileSync('say', ['-v', MAC_VOICE, '-r', env.RATE || '175', '-o', aiff, text.replace(/…/g, '...')]);
  execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '48000', aiff, file]);
}

async function retry(fn) {
  for (let i = 0; ; i++) {
    try {
      return await fn();
    } catch (e) {
      const msg = String(e.message);
      // 429 is also "out of credits", which waiting won't fix
      if (i >= 3 || !/ (429|5\d\d):/.test(msg) || /insufficient_quota|credit_balance/.test(msg)) throw e;
      await sleep(2500 * (i + 1));
    }
  }
}

function seconds(file) {
  try {
    const m = execFileSync('afinfo', [file]).toString().match(/estimated duration: ([\d.]+)/);
    if (m) return Number(m[1]);
  } catch {
    /* not on a Mac */
  }
  return statSync(file).size / (ext === 'mp3' ? 16000 : 6000);
}

mkdirSync(OUT, { recursive: true });
const manifestPath = join(OUT, 'manifest.json');
// progress of an interrupted run that switched voice format, so a re-run resumes
const partialPath = 'node_modules/.cache/tambola-audio-partial.json';
const readJson = (p) => {
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch {
    return {};
  }
};
const old = readJson(manifestPath);
const partial = readJson(partialPath);
const oldHashes = { ...(old.ext === ext ? old.hashes : {}), ...(partial.ext === ext ? partial.hashes : {}) };

const todo = jobs.filter(([name, text]) => env.FORCE === '1' || oldHashes[name] !== hash(text) || !existsSync(join(OUT, `${name}.${ext}`)));
const chars = todo.reduce((n, [, t]) => n + t.length, 0);
console.log(`Voice: ${label}\nClips to record: ${todo.length} of ${jobs.length} (${chars} characters)`);
if (provider === 'mac') console.log('Tip: add OPENAI_API_KEY=... to .env.local for a real, expressive voice.');

const tmp = mkdtempSync(join(tmpdir(), 'tambola-'));
const hashes = {};
for (const [name] of jobs) if (oldHashes[name]) hashes[name] = oldHashes[name];
let ok = false;
try {
  for (const [name, text] of todo) {
    const file = join(OUT, `${name}.${ext}`);
    if (provider === 'mac') mac(text, file, tmp);
    else writeFileSync(file, await retry(() => (provider === 'openai' ? openai(text) : elevenlabs(text))));
    hashes[name] = hash(text);
    process.stdout.write('.');
  }
  ok = true;
} finally {
  rmSync(tmp, { recursive: true, force: true });
  if (ok || old.ext === ext) {
    // remove clips from another voice format or for lines that no longer exist
    const wanted = new Set(jobs.map(([name]) => `${name}.${ext}`));
    for (const f of readdirSync(OUT)) if (/\.(m4a|mp3)$/.test(f) && !wanted.has(f)) unlinkSync(join(OUT, f));
    const durations = {};
    for (const [name] of jobs) {
      const file = join(OUT, `${name}.${ext}`);
      if (existsSync(file)) durations[name] = Number(seconds(file).toFixed(2));
    }
    writeFileSync(manifestPath, JSON.stringify({ ext, voice: label, pools, durations, hashes }, null, 1) + '\n');
    rmSync(partialPath, { force: true });
  } else {
    // switching voice and stopped part-way: the TV keeps the previous voice until a run completes
    mkdirSync('node_modules/.cache', { recursive: true });
    writeFileSync(partialPath, JSON.stringify({ ext, hashes }));
    console.log('\nStopped part-way. The game still uses the previous voice; run the same command again to resume.');
  }
}
console.log(`\nDone. ${Object.keys(hashes).length} clips in ${OUT}`);
