// Generates the voice clips + a manifest.json for each folder:
//   public/audio/tambola  the Tambola host (a Hindi-speaking Delhi tapori)
//   public/audio/filmy    Filmy Dialogues: the dialogues (dramatic narrator) and song-round intros (the host)
//
// Real, human-sounding voice: put your own key in .env.local (git-ignored, never committed),
//   OPENAI_API_KEY=sk-...            (recommended: follows the PERSONA directions below)
//   ELEVENLABS_API_KEY=... ELEVENLABS_VOICE_ID=...
// then run:  npm run gen:audio
// Options: OPENAI_VOICE=ash (the host, default echo), FILMY_VOICE / FILMY_VOICE_F (dialogue
// narrators, default onyx / coral), VOICE_PROVIDER=openai|elevenlabs|mac.
// Without a key it falls back to the robotic macOS voice.
//
// Only clips whose text (or voice) changed are re-generated, so re-runs are cheap.
// DRY=1 only lists what would be recorded. FORCE=1 re-records everything. Commit public/audio afterwards so Vercel serves it.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { callSpoken, clipName, LINES } from '../src/games/tambola/calls.ts';
import { DIALOGUES, SONGS, dialogueClip, songClip, songIntro } from '../src/games/filmy/data.ts';

try {
  process.loadEnvFile('.env.local'); // your API keys; variables already set in the shell win
} catch {
  /* no .env.local */
}

const env = process.env;
const provider = env.VOICE_PROVIDER || (env.OPENAI_API_KEY ? 'openai' : env.ELEVENLABS_API_KEY ? 'elevenlabs' : 'mac');
const ext = provider === 'mac' ? 'm4a' : 'mp3';

const ELEVEN_VOICE = env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'; // premade "Adam"; pick an Indian voice in the Voice Library
const ELEVEN_MODEL = env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
const OPENAI_VOICE = env.OPENAI_VOICE || 'echo';
const FILMY_VOICE = env.FILMY_VOICE || 'onyx';
const FILMY_VOICE_F = env.FILMY_VOICE_F || 'coral';
const OPENAI_MODEL = env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';
const MAC_VOICE = env.VOICE || 'Rishi';
// Only OpenAI gets a different voice per job; the others use their one voice for everything.
const labelFor = (voice) =>
  provider === 'elevenlabs' ? `elevenlabs:${ELEVEN_VOICE}:${ELEVEN_MODEL}` : provider === 'openai' ? `openai:${voice}:${OPENAI_MODEL}` : `mac:${MAC_VOICE}`;
const label = labelFor(OPENAI_VOICE);

// Delivery direction for OpenAI's TTS. An original character, not an impression of anyone real.
const PERSONA =
  'You are an original comic Tambola host at a desi family party: a cheeky, street-smart Delhi tapori with loads of swagger and a big heart. ' +
  'Speak Hindi the way a Delhi local talks with friends: casual, fast, slangy, with a strong Delhi accent and attitude. ' +
  'When a line has an English number call or prize name, say that part clearly in Indian English, then switch into Delhi Hindi for the joke. ' +
  'Delivery: loud and playful, teasing the crowd, cracking yourself up, mock-outraged at fake claims, over-the-top when someone wins. ' +
  'Keep the pace brisk. Never formal, never flat, never robotic.';

// Filmy Dialogues: a famous line read out fresh. An original performance, not an impression.
const DIALOGUE =
  'You are a dramatic Bollywood dubbing artist performing one famous line from a Hindi film for a family party quiz. ' +
  'Full of emotion, attitude and filmy flair, with theatrical pauses where the line has them. ' +
  'Use your own natural voice and do not imitate any particular actor. ' +
  'Speak Hindi with natural Hindi pronunciation, and English words in Indian English.';

// [file, text, voice, instructions]
const host = (file, text) => [file, text, OPENAI_VOICE, PERSONA];
const tambola = [];
for (let n = 1; n <= 90; n++) tambola.push(host(String(n), callSpoken(n)));
const pools = {};
for (const [key, texts] of Object.entries(LINES)) {
  pools[key] = texts.length;
  texts.forEach((t, i) => tambola.push(host(clipName(key, i + 1), t)));
}
const filmy = [];
for (const d of DIALOGUES) filmy.push([dialogueClip(d), d.hi, d.v === 'f' ? FILMY_VOICE_F : FILMY_VOICE, DIALOGUE]);
for (const s of SONGS) filmy.push(host(songClip(s), songIntro(s)));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// The Tambola host's hashes stay exactly as before, so switching scripts re-records nothing.
const hash = (text, voice) => createHash('sha1').update(labelFor(voice) + '|' + text).digest('hex').slice(0, 12);

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

async function openai(text, voice, instructions) {
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OPENAI_MODEL, voice, input: text, instructions, response_format: 'mp3' }),
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

console.log(`Provider: ${provider}`);
if (provider === 'mac') console.log('Tip: add OPENAI_API_KEY=... to .env.local for a real, expressive voice.');
await record('tambola', tambola, { pools });
await record('filmy', filmy, {});

async function record(pack, jobs, extra) {
  const OUT = join('public/audio', pack);
  mkdirSync(OUT, { recursive: true });
  const manifestPath = join(OUT, 'manifest.json');
  // progress of an interrupted run that switched voice format, so a re-run resumes
  const partialPath = `node_modules/.cache/${pack}-audio-partial.json`;
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

  const todo = jobs.filter(([name, text, voice]) => env.FORCE === '1' || oldHashes[name] !== hash(text, voice) || !existsSync(join(OUT, `${name}.${ext}`)));
  const chars = todo.reduce((n, [, t]) => n + t.length, 0);
  console.log(`\n${pack}: ${todo.length} of ${jobs.length} clips to record (${chars} characters)`);
  if (env.DRY === '1') return; // just show what would be recorded

  const tmp = mkdtempSync(join(tmpdir(), pack + '-'));
  const hashes = {};
  for (const [name] of jobs) if (oldHashes[name]) hashes[name] = oldHashes[name];
  let ok = false;
  try {
    for (const [name, text, voice, instructions] of todo) {
      const file = join(OUT, `${name}.${ext}`);
      if (provider === 'mac') mac(text, file, tmp);
      else {
        // the voice services now and then return a clipped take; re-record anything far too short
        for (let take = 1; ; take++) {
          writeFileSync(file, await retry(() => (provider === 'openai' ? openai(text, voice, instructions) : elevenlabs(text))));
          if (seconds(file) >= text.length * 0.05 || take >= 3) break;
        }
        if (seconds(file) < text.length * 0.05) console.log(`\nWarning: ${name} still sounds clipped; delete ${file} and run again.`);
      }
      hashes[name] = hash(text, voice);
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
      const voices = [...new Set(jobs.map(([, , voice]) => labelFor(voice)))].join(' + ');
      writeFileSync(manifestPath, JSON.stringify({ ext, voice: voices, ...extra, durations, hashes }, null, 1) + '\n');
      rmSync(partialPath, { force: true });
    } else {
      // switching voice and stopped part-way: the TV keeps the previous voice until a run completes
      mkdirSync('node_modules/.cache', { recursive: true });
      writeFileSync(partialPath, JSON.stringify({ ext, hashes }));
      console.log('\nStopped part-way. The game still uses the previous voice; run the same command again to resume.');
    }
  }
  console.log(`\nDone. ${Object.keys(hashes).length} clips in ${OUT}`);
}
