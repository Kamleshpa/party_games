# 🪔 Desi Party Night

A party game app for get-togethers. The **TV shows the game** in its browser; everyone **plays on their phone** by scanning a QR code. Nothing to install.

| Game | What happens |
|---|---|
| 🎟️ **Tambola Night** | Housie with auto-generated tickets on each phone. A game-show announcer calls every number with a fun line ("Two and five… twenty-five! Quarter century — silver jubilee!", "Knock at the door — it's the in-laws, hide the snacks!") over a bhangra-style game-show beat, with hype lines, a halfway call, and a "somebody is ONE number away from Full House!" moment. Claim Early Five / Top, Middle, Bottom Line / Four Corners / Full House from the phone. A false claim = **BOGEY 🚨** + 3 numbers in jail. "Auto-mark" mode for kids. |
| 🎬 **Emoji Movie** | Emojis pop up one at a time on the TV — guess the film. Lock in early for more points, 2 hints per game, and the last 2 questions count double. Bollywood classics, 2000s hits, and a Kids & Hollywood pack. |
| 📼 **90s Kids Quiz** | Doordarshan, ads and jingles, cricket, Indipop, comics, gadgets. Multiple choice, True or False, and Guess the Year (a slider; the TV shows everyone's guesses on a number line). |

Across the whole evening, players earn ⭐ party stars, shown on the lobby leaderboard.

**Background music** is generated live in the browser: an original desi game-show groove, so there's nothing to license. There's a chilled lobby track, the Tambola bhangra beat (it gets more intense near the end), and a ticking "thinking" track for the quizzes. It dips automatically while the announcer talks. Turn it on or off with 🎵 on the TV, or from the Captain's phone.

## Playing

1. On the **TV browser** open `https://<your-app>.vercel.app/tv` and press **OK** on "Start the Party!" (this also turns on the sound).
2. Everyone scans the **QR code** (or opens the site and types the 4-letter code).
3. The **first person to join is Captain 👑**. They pick the game and its settings, start it, and get Pause / Skip / Lobby controls on their phone.
4. Phones can send reactions (😂🔥👏) that float up on the TV.

**TV remote (no Captain needed):** left/right to choose a game, **OK** to start, Play/Pause to pause, OK on the results screen to go back to the lobby. Press **down** to reach the 🎵 music and 🔊 sound buttons in the corner, and **OK** to switch them.

If the TV page gets refreshed, choose **"Continue last party"**. Scores, tickets and the current game come back, and phones reconnect on their own.

## Deploy to Vercel

```bash
git init && git add -A && git commit -m "Desi Party Night"
# push to a GitHub repo, then in Vercel: Add New → Project → import the repo
```

Vercel auto-detects **Vite**, so there's nothing to configure. Or deploy from your laptop with `npx vercel`.

### How phones talk to the TV

- **Without setup: direct, phone to TV (peer-to-peer).** The TV browser runs the game, and phones connect to it directly over WebRTC. It only works reliably when **every phone is on the same home Wi-Fi as the TV**. Phones on mobile data or guest Wi-Fi often get stuck on "Connecting…". The phone then shows a "Can't reach the TV" screen with tips.
- **Recommended for parties: Ably relay (free).** Everyone connects through Ably's servers, so any network works (Wi-Fi, guest Wi-Fi, mobile data), and it's kinder to smart-TV browsers too:
  1. Sign up at ably.com (the free plan is plenty), and create an app with any name.
  2. Open the app's **API Keys** tab and copy the root key (it looks like `abc123.def456:xyz…`).
  3. In Vercel → your project → **Settings → Environment Variables**, add `ABLY_API_KEY` = that key, then **redeploy** (Deployments → ⋯ → Redeploy).
  4. Refresh the TV page. On phones, the connecting screen now says "Connection: relay".

  To test the relay locally, put `ABLY_API_KEY=…` in a `.env.local` file (it's git-ignored) and run `npm run dev`.

After every deploy, **refresh the TV page** (choose "Continue last party"). If the TV is still on an older version, phones show a warning banner.

If the TV browser still struggles, open `/tv` on a laptop connected to the TV with HDMI, or on a Fire TV Stick / Chromecast with Google TV browser.

## Developing

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # engine tests (tickets, claims, scoring)
npm run build
```

**Test on one computer without phones:** open `http://localhost:5173/tv?net=local&bots=8` (8 bot players auto-play). Then open phone tabs at `http://localhost:5173/?r=CODE&net=local&p=1` (use `p=2`, `p=3`… for more players).

### Adding your own content
- Emoji movies: `src/games/emoji/data.ts`
- Quiz questions: `src/games/quiz/data.ts` (for multiple choice, put the correct answer **first**; options get shuffled)
- Tambola calls and announcer lines: `src/games/tambola/calls.ts`. After editing, regenerate the voice clips (see below). Only the lines you changed get re-recorded.

## Making the announcer sound like a real person

The announcer is an original comic Delhi tapori host who talks in Hindi; only the number call itself is in English. The TV screen keeps showing the English lines (`FUN` in `calls.ts`); the spoken Hindi lines are `SPOKEN` and `LINES`. The clips in `public/audio/tambola` are pre-recorded. The free fallback uses the Mac's built-in voice, which sounds flat. For the real thing, record them once with OpenAI's voice, which follows the acting directions in `scripts/gen-tambola-audio.mjs` (PERSONA). The full script is under 10,000 characters and costs well under a dollar.

1. Get an API key at platform.openai.com → API keys (the account needs a little prepaid credit).
2. Put it in a file called `.env.local` in the project folder. That file is git-ignored, so the key never goes to GitHub or Vercel:
   ```
   OPENAI_API_KEY=sk-...
   ```
3. Record:
   ```bash
   npm run gen:audio
   ```
4. Commit and push `public/audio/tambola`, and Vercel serves the new voice. Refresh the TV page.

If it stops part-way (network, rate limit), run it again: it resumes, and the game keeps the old voice until a run completes. To try a different voice, add `OPENAI_VOICE=ash FORCE=1` in front of the command (default `echo`; others: `verse`, `ballad`, `coral`, `sage`). ElevenLabs also works: put `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` in `.env.local` and run with `VOICE_PROVIDER=elevenlabs`.

### Layout
```
src/host/room.ts            game server (runs in the TV browser)
src/net/                    transports: peer (WebRTC), ably (relay), local (testing)
src/games/tambola|emoji|quiz  engines, TV screens, phone screens, content
src/games/common/           shared question-game engine + screens
src/tv/  src/phone/         app shells (lobby, join, captain controls)
api/realtime-token.js       optional Ably token endpoint (Vercel function)
```
