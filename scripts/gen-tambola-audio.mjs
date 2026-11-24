// Generates the Tambola announcer clips with macOS text-to-speech (Indian-English voice "Rishi").
// Run on a Mac:  npm run gen:audio      (optional: VOICE=Rishi RATE=170)
// Output: public/audio/tambola/{1..90}.m4a + prize clips. Commit them so Vercel serves them.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { callSpoken, EXTRA_CLIPS } from '../src/games/tambola/calls.ts';

const out = 'public/audio/tambola';
mkdirSync(out, { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), 'tambola-'));
const voice = process.env.VOICE || 'Rishi';
const rate = process.env.RATE || '170';

const jobs = [];
for (let n = 1; n <= 90; n++) jobs.push([String(n), callSpoken(n)]);
for (const [k, t] of Object.entries(EXTRA_CLIPS)) jobs.push([k, t]);

for (const [name, text] of jobs) {
  const aiff = join(tmp, name + '.aiff');
  execFileSync('say', ['-v', voice, '-r', rate, '-o', aiff, text]);
  execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '48000', aiff, join(out, name + '.m4a')]);
  process.stdout.write('.');
}
rmSync(tmp, { recursive: true, force: true });
console.log(`\nDone: ${jobs.length} clips in ${out}`);
