/**
 * Party password. Vercel runs this on its servers before every page and /api request, so people
 * who find the link can't open the game or host their own party on it.
 *
 * Turn it on: Vercel → the project → Settings → Environment Variables → PARTY_PASSWORD, then redeploy.
 * Without it the site stays open. `npm run dev` never runs this file (use `vercel dev` to try it).
 *
 * Getting in: type the password once on the password page, or scan the TV's QR code, which carries
 * an access key (`?k=…`) made from the password, never the password itself. A cookie then remembers
 * that phone or TV for a year. Changing the password locks everyone out again, old QR photos too.
 */
import { next } from '@vercel/functions/middleware';

// Static files: the app's scripts have unguessable names that only the locked pages reveal,
// and the voice clips are harmless, so they skip this check and load fast.
export const config = { matcher: ['/((?!assets/|audio/).*)'] };

export const COOKIE = 'dpn_key';
/** The password page hands the typed password over in this short-lived cookie (Vercel doesn't pass form bodies to middleware). */
export const TRY = 'dpn_try';
const YEAR = 60 * 60 * 24 * 365;

/** Case and spaces don't matter: phones capitalise the first letter, and TV keyboards are fiddly. */
const tidy = (s: string) => s.toLowerCase().replace(/\s+/g, '');

/** The key that goes in the cookie and the QR code. */
export async function accessKey(password: string): Promise<string> {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey('raw', enc.encode(tidy(password)), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode('desi-party-night')));
  return Array.from(sig.slice(0, 16), (b) => b.toString(16).padStart(2, '0')).join('');
}

function cookie(request: Request, name: string): string | null {
  for (const part of (request.headers.get('cookie') || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return null;
}

function decode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

const forget = `${TRY}=; Path=/; Max-Age=0`;

/** Saves the key on this device, then reloads the page without the key in the address bar. */
function letIn(location: string, key: string, secure: boolean): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      'Set-Cookie': `${COOKIE}=${key}; Path=/; Max-Age=${YEAR}; SameSite=Lax${secure ? '; Secure' : ''}`,
      'Cache-Control': 'no-store',
    },
  });
}

export default async function middleware(request: Request): Promise<Response> {
  const password = tidy(process.env.PARTY_PASSWORD || '');
  if (!password) return next();
  const key = await accessKey(password);
  const url = new URL(request.url);
  const secure = url.protocol === 'https:';
  const fromQr = url.searchParams.get('k');
  url.searchParams.delete('k');
  const here = url.pathname.replace(/^\/{2,}/, '/') + url.search; // "//other.site" would leave this site

  if (cookie(request, COOKIE) === key) return next(); // already in (the app clears any typed password)

  const back = url.origin + here; // a full address: `vercel dev` mangles relative ones
  if (fromQr === key) return letIn(back, key, secure);
  const typed = cookie(request, TRY);
  if (typed !== null) {
    if (tidy(decode(typed)) === password) return letIn(back, key, secure);
    await new Promise((r) => setTimeout(r, 800)); // slows down guessing
    return lockedPage(here, typed ? "That's not the party password. Try again!" : '');
  }
  if (fromQr !== null) return lockedPage(here, 'This QR code is from an old party. Scan the one on the TV now, or type the party password.');

  if (url.pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({ error: 'locked' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
  return lockedPage(here, '');
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => '&#' + c.charCodeAt(0) + ';');

/** Plain HTML, CSS and ES5 that old smart-TV browsers can run, big enough to read across the room. */
function lockedPage(here: string, error: string): Response {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Desi Party Night</title>
<style>
  html { font-size: 18px; }
  @media (min-width: 900px) { html { font-size: 30px; } }
  body { margin: 0; min-height: 100vh; background: #1a0b3d; background: linear-gradient(160deg, #2b1263, #1a0b3d 60%); color: #fff;
    font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; }
  main { width: 100%; max-width: 22rem; padding: 1.5rem 16px; box-sizing: border-box; text-align: center; }
  .lamp { font-size: 3.5rem; line-height: 1; }
  h1 { font-size: 1.8rem; margin: 0.6rem 0 0.3rem; color: #ffd23f; }
  p { font-size: 1rem; line-height: 1.4; margin: 0 0 1.2rem; color: #e6dcff; }
  input { display: block; width: 100%; box-sizing: border-box; font-size: 1.3rem; padding: 0.6rem 0.8rem; border-radius: 0.6rem;
    border: 3px solid #ffd23f; background: #fff; color: #1a0b3d; text-align: center; }
  input:focus { outline: none; box-shadow: 0 0 0 4px rgba(255, 210, 63, 0.5); }
  button { margin-top: 0.8rem; width: 100%; font-size: 1.3rem; font-weight: bold; padding: 0.6rem; border: 0; border-radius: 0.6rem;
    background: #ffd23f; color: #1a0b3d; cursor: pointer; }
  button:focus { outline: none; box-shadow: 0 0 0 4px #fff; }
  .error { color: #ffb3b3; font-weight: bold; }
</style>
</head>
<body>
<main>
  <div class="lamp">🪔</div>
  <h1>Private party!</h1>
  <p>Scan the QR code on the TV to join, or type the party password.</p>
  ${error ? `<p class="error">${esc(error)}</p>` : ''}
  <form id="f">
    <input id="pw" type="text" placeholder="Party password" aria-label="Party password" autofocus
      autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" required>
    <button type="submit">Let me in 🎉</button>
  </form>
</main>
<script>
  document.getElementById('f').onsubmit = function () {
    var pw = document.getElementById('pw').value;
    if (!pw) return false;
    document.cookie = '${TRY}=' + encodeURIComponent(pw) + '; path=/; max-age=60; samesite=lax';
    window.location.replace(${JSON.stringify(here).replace(/</g, '\\u003c')});
    return false;
  };
</script>
</body>
</html>`;
  return new Response(html, {
    status: 401,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'Set-Cookie': forget },
  });
}
