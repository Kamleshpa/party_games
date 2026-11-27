import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import middleware, { COOKIE, TRY, accessKey } from '../middleware';

const SITE = 'https://party.example';
const get = (path: string, cookie = '') => new Request(SITE + path, { headers: cookie ? { cookie } : {} });
/** What the password page does: put the typed password in a cookie and reload. */
const typed = (path: string, pw: string) => get(path, `${TRY}=${encodeURIComponent(pw)}`);
const passes = (r: Response) => r.headers.get('x-middleware-next') === '1';

describe('party password (middleware.ts)', () => {
  let key = '';
  beforeEach(async () => {
    process.env.PARTY_PASSWORD = 'Chai Time';
    key = await accessKey('Chai Time');
  });
  afterEach(() => {
    delete process.env.PARTY_PASSWORD;
  });

  it('leaves the site open when no password is set', async () => {
    delete process.env.PARTY_PASSWORD;
    expect(passes(await middleware(get('/tv')))).toBe(true);
    expect(passes(await middleware(get('/api/realtime-token?probe=1')))).toBe(true);
  });

  it('shows the password page, not the game, without the cookie', async () => {
    const r = await middleware(get('/tv'));
    expect(r.status).toBe(401);
    const html = await r.text();
    expect(html).toContain('Party password');
    expect(html).toContain(`location.replace("/tv")`);
    expect(html).not.toContain('/assets/');
  });

  it('locks the Ably token endpoint too', async () => {
    const r = await middleware(get('/api/realtime-token?clientId=x'));
    expect(r.status).toBe(401);
    expect(await r.json()).toEqual({ error: 'locked' });
  });

  it('lets you in with the password, ignoring case and spaces', async () => {
    const r = await middleware(typed('/tv', '  chaitime '));
    expect(r.status).toBe(302);
    expect(r.headers.get('location')).toBe(SITE + '/tv');
    const set = r.headers.get('set-cookie') || '';
    expect(set).toContain(`${COOKIE}=${key};`);
    expect(set).toContain('Max-Age=31536000');
    expect(set).toContain('Secure');
    expect(set.split(',').length).toBe(1); // one cookie: some servers merge several into one broken header
    expect(set).not.toContain('HttpOnly'); // the TV reads the key to put it in the QR code
    expect(set).not.toMatch(/chai/i);
  });

  it('refuses a wrong password and keeps you on the page', async () => {
    const r = await middleware(typed('/tv', 'samosa'));
    expect(r.status).toBe(401);
    const set = r.headers.get('set-cookie') || '';
    expect(set).not.toContain(COOKIE + '=');
    expect(set).toContain(`${TRY}=; Path=/; Max-Age=0`);
    expect(await r.text()).toContain('not the party password');
  });

  it('only ever sends you to a page on this site', async () => {
    const r = await middleware(typed('//evil.example/x', 'chai time'));
    expect(r.headers.get('location')).toBe(SITE + '/evil.example/x');
  });

  it('a scanned QR code lets the phone in and drops the key from the address', async () => {
    const r = await middleware(get(`/?r=ABCD&k=${key}`));
    expect(r.status).toBe(302);
    expect(r.headers.get('location')).toBe(SITE + '/?r=ABCD');
    expect(r.headers.get('set-cookie')).toContain(`${COOKIE}=${key};`);
  });

  it('an old QR code (password changed) shows the password page', async () => {
    const old = await accessKey('last party');
    const r = await middleware(get(`/?r=ABCD&k=${old}`));
    expect(r.status).toBe(401);
    const html = await r.text();
    expect(html).toContain('old party');
    expect(html).toContain('location.replace("/?r=ABCD")');
  });

  it('remembers a phone or TV that is already in', async () => {
    expect(passes(await middleware(get('/tv', `other=1; ${COOKIE}=${key}`)))).toBe(true);
    expect(passes(await middleware(get('/api/realtime-token?probe=1', `${COOKIE}=${key}`)))).toBe(true);
    expect(passes(await middleware(get(`/?r=ABCD&k=junk`, `${COOKIE}=${key}`)))).toBe(true);
    // the typed password lingers until the app clears it: no redirect loop meanwhile
    expect(passes(await middleware(get('/tv', `${TRY}=chai%20time; ${COOKIE}=${key}`)))).toBe(true);
  });

  it('changing the password locks out the old cookie', async () => {
    process.env.PARTY_PASSWORD = 'new password';
    expect((await middleware(get('/tv', `${COOKIE}=${key}`))).status).toBe(401);
  });

  it('escapes the address it puts in the page', async () => {
    const html = await (await middleware(get('/x?a="><script>alert(1)</script>'))).text();
    expect(html.split('<script>').length).toBe(2); // only the page's own script
    expect(html).not.toContain('<script>alert');
  });
});
