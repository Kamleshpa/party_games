// Generates the Tambola announcer clips + manifest.json into public/audio/tambola.
//
// Real, human-sounding voice (pick one; you need your own API key):
//   ELEVENLABS_API_KEY=xxx ELEVENLABS_VOICE_ID=yyy npm run gen:audio
//   OPENAI_API_KEY=xxx [OPENAI_VOICE=ash] npm run gen:audio
// Free fallback (robotic macOS voice):
//   npm run gen:audio
//
// Only clips whose text (or voice) changed are re-generated, so re-runs are cheap.
// FORCE=1 re-records everything. Commit public/audio/tambola afterwards so Vercel serves it.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { callSpoken, EXTRA_CLIPS, HYPE } from '../src/games/tambola/calls.ts';

const OUT = 'public/audio/tambola';
const env = process.env;
const provider = env.ELEVENLABS_API_KEY ? 'elevenlabs' : env.OPENAI_API_KEY ? 'openai' : 'mac';
const ext = provider === 'mac' ? 'm4a' : 'mp3';

const ELEVEN_VOICE = env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'; // premade "Adam"; pick an Indian voice in the Voice Library
const ELEVEN_MODEL = env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
const OPENAI_VOICE = env.OPENAI_VOICE || 'ash';
const OPENAI_MODEL = env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';
const MAC_VOICE = env.VOICE || 'Rishi';
const label =
  provider === 'elevenlabs' ? `elevenlabs:${ELEVEN_VOICE}:${ELEVEN_MODEL}` : provider === 'openai' ? `openai:${OPENAI_VOICE}:${OPENAI_MODEL}` : `mac:${MAC_VOICE}`;

const PERSONA =
  'You are the host of a high-energy Indian TV game show, calling Tambola (Housie) numbers at a family party. ' +
  'Warm Indian-English accent. Big, theatrical, playful energy: build a little suspense before the number, ' +
  'punch the number itself loud and clear, then deliver the fun line with a big smile, like you are cracking up the room. ' +
  'Never flat, never robotic.';

const jobs = [];
for (let n = 1; n <= 90; n++) jobs.push([String(n), callSpoken(n)]);
for (const [k, t] of Object.entries(EXTRA_CLIPS)) jobs.push([k, t]);
HYPE.forEach((t, i) => jobs.push(['hype' + (i + 1), t]));

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
      if (i >= 3 || !/ (429|5\d\d):/.test(String(e.message))) throw e;
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
const old = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
const oldHashes = old.ext === ext ? old.hashes || {} : {};
for (const f of readdirSync(OUT)) if (/\.(m4a|mp3)$/.test(f) && !f.endsWith('.' + ext)) unlinkSync(join(OUT, f));

const todo = jobs.filter(([name, text]) => env.FORCE === '1' || oldHashes[name] !== hash(text) || !existsSync(join(OUT, `${name}.${ext}`)));
const chars = todo.reduce((n, [, t]) => n + t.length, 0);
console.log(`Voice: ${label}\nClips to record: ${todo.length} of ${jobs.length} (${chars} characters)`);

const tmp = mkdtempSync(join(tmpdir(), 'tambola-'));
const hashes = { ...oldHashes };
try {
  for (const [name, text] of todo) {
    const file = join(OUT, `${name}.${ext}`);
    if (provider === 'mac') mac(text, file, tmp);
    else writeFileSync(file, await retry(() => (provider === 'openai' ? openai(text) : elevenlabs(text))));
    hashes[name] = hash(text);
    process.stdout.write('.');
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
  const durations = {};
  for (const [name] of jobs) {
    const file = join(OUT, `${name}.${ext}`);
    if (existsSync(file)) durations[name] = Number(seconds(file).toFixed(2));
  }
  writeFileSync(manifestPath, JSON.stringify({ ext, voice: label, hype: HYPE.length, durations, hashes }, null, 1) + '\n');
}
console.log(`\nDone. ${Object.keys(hashes).length} clips in ${OUT}`);
