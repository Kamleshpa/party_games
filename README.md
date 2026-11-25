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

**TV remote (no Captain needed):** arrow keys to choose a game, **OK** to start, Play/Pause to pause, OK on the results screen to go back to the lobby.

If the TV page gets refreshed, choose **"Continue last party"**. Scores, tickets and the current game come back, and phones reconnect on their own.

## Deploy to Vercel

```bash
git init && git add -A && git commit -m "Desi Party Night"
# push to a GitHub repo, then in Vercel: Add New → Project → import the repo
```

Vercel auto-detects **Vite**, so there's nothing to configure. Or deploy from your laptop with `npx vercel`.

### How phones talk to the TV

- **Default: peer-to-peer (free, zero setup).** The TV browser runs the game, and phones connect to it directly over WebRTC (using the free public PeerJS service to find each other). This works best when **everyone is on the house Wi-Fi**.
- **Optional, more reliable: Ably relay.** Some smart-TV browsers have weak or missing WebRTC, and guests on mobile data can sometimes fail to connect. To fix both:
  1. Create a free account at ably.com, then create an app and copy its **API key**.
  2. In Vercel → Project → Settings → Environment Variables, add `ABLY_API_KEY` = your key.
  3. Redeploy. The app detects the key and switches automatically. No code changes.

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

The clips in `public/audio/tambola` are pre-recorded. The free fallback uses the Mac's built-in voice, which sounds robotic. For a real, lively game-show host, generate them once with a neural voice service. The full script is about 6,300 characters.

**Option A: ElevenLabs (most human-sounding).** The free plan covers one full recording.
1. Sign up at elevenlabs.io and copy your API key (Profile → API Keys).
2. Open the **Voice Library** and search for something like "Indian", "energetic" or "host". Add a voice you like to My Voices and copy its **Voice ID**.
3. Run:
   ```bash
   ELEVENLABS_API_KEY=your_key ELEVENLABS_VOICE_ID=the_voice_id npm run gen:audio
   ```

**Option B: OpenAI.** The voice is directed to act as an "excited Indian game-show host". It costs a few cents.
```bash
OPENAI_API_KEY=your_key npm run gen:audio
```
To try other voices, add `OPENAI_VOICE=coral` (or `ash`, `ballad`, `verse`, `sage`) and `FORCE=1` to re-record everything.

Then commit and push `public/audio/tambola`, and Vercel serves the new voice. The key is only used on your laptop for this one step. Don't put it in the code or in Vercel.

### Layout
```
src/host/room.ts            game server (runs in the TV browser)
src/net/                    transports: peer (WebRTC), ably (relay), local (testing)
src/games/tambola|emoji|quiz  engines, TV screens, phone screens, content
src/games/common/           shared question-game engine + screens
src/tv/  src/phone/         app shells (lobby, join, captain controls)
api/realtime-token.js       optional Ably token endpoint (Vercel function)
```
