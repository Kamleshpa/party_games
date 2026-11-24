// Vercel serverless function. Optional: only used when ABLY_API_KEY is set in the
// Vercel project's Environment Variables. Without it the app uses peer-to-peer WebRTC.
import Ably from 'ably';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const key = process.env.ABLY_API_KEY;
  if (!key) {
    res.status(404).json({ enabled: false });
    return;
  }
  if (req.query && req.query.probe) {
    res.status(200).json({ enabled: true });
    return;
  }
  const clientId = String((req.query && req.query.clientId) || 'anon').slice(0, 64);
  try {
    const rest = new Ably.Rest({ key });
    const tokenRequest = await rest.auth.createTokenRequest({
      clientId,
      capability: { 'dpn:*': ['publish', 'subscribe'] },
    });
    res.status(200).json(tokenRequest);
  } catch (e) {
    res.status(500).json({ error: 'token-failed' });
  }
}
