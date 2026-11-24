# 🪔 Desi Party Night

A party game app for get-togethers. The **TV shows the game** in its browser; everyone **plays on their phone** by scanning a QR code. Nothing to install.

| Game | What happens |
|---|---|
| 🎟️ **Tambola Night** | Housie with auto-generated tickets on each phone. The TV announces every number with an Indian-English voice and a fun call ("Two and five, twenty-five — Quarter century!", "Two fat laddoos!"). Claim Early Five / Top, Middle, Bottom Line / Four Corners / Full House from the phone. A false claim = **BOGEY 🚨** + 3 numbers in jail. "Auto-mark" mode for kids. |
| 🎬 **Emoji Movie** | Emojis pop up one at a time on the TV — guess the film. Lock in early for more points, 2 hints per game, and the last 2 questions count double. Bollywood classics, 2000s hits, and a Kids & Hollywood pack. |
| 📼 **90s Kids Quiz** | Doordarshan, ads and jingles, cricket, Indipop, comics, gadgets. Multiple choice, True or False, and Guess the Year (a slider; the TV shows everyone's guesses on a number line). |

Across the whole evening, players earn ⭐ party stars, shown on the lobby leaderboard.

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
- Tambola calls: `src/games/tambola/calls.ts`. After editing, regenerate the voice clips on a Mac with `npm run gen:audio` (uses the built-in Indian-English voice "Rishi"), then commit `public/audio/tambola`.

### Layout
```
src/host/room.ts            game server (runs in the TV browser)
src/net/                    transports: peer (WebRTC), ably (relay), local (testing)
src/games/tambola|emoji|quiz  engines, TV screens, phone screens, content
src/games/common/           shared question-game engine + screens
src/tv/  src/phone/         app shells (lobby, join, captain controls)
api/realtime-token.js       optional Ably token endpoint (Vercel function)
```
