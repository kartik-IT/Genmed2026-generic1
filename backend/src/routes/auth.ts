import { Router, Request, Response } from 'express';
import { beginLogin, completeLogin, getSession, isOidcConfigured, revokeSession } from '../services/oidcService';
import { config } from '../config';

const router = Router();
const cookieName = 'genmed_session';

function sessionCookie(value: string, maxAge = 8 * 60 * 60): string {
  return `${cookieName}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${config.isDev ? '' : '; Secure'}`;
}
function readCookie(req: Request): string | undefined {
  return req.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
}

router.get('/status', (_req, res) => res.json({ configured: isOidcConfigured() }));
router.get('/me', (req, res) => {
  const user = getSession(readCookie(req));
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ user });
});
router.get('/login', async (_req, res) => {
  if (!isOidcConfigured()) return res.status(503).json({ error: 'Authentication is not configured' });
  try { res.redirect((await beginLogin()).authorizationUrl); }
  catch { res.status(503).json({ error: 'Authentication provider is unavailable' }); }
});
router.get('/callback', async (req, res) => {
  const code = typeof req.query.code === 'string' ? req.query.code : '';
  const state = typeof req.query.state === 'string' ? req.query.state : '';
  if (!code || !state) return res.status(400).send('Authentication response is incomplete.');
  try {
    const sessionId = await completeLogin(code, state);
    res.setHeader('Set-Cookie', sessionCookie(sessionId));
    res.redirect('/');
  } catch { res.status(401).send('Authentication could not be verified.'); }
});
router.post('/logout', (req, res) => { revokeSession(readCookie(req)); res.setHeader('Set-Cookie', sessionCookie('', 0)); res.status(204).end(); });

export default router;
