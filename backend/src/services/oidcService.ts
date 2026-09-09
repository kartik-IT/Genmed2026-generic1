import { createHash, randomBytes, createPublicKey, verify, type JsonWebKey as NodeJsonWebKey } from 'crypto';
import { config } from '../config.js';

export interface AuthUser {
  id: string;
  name?: string;
  email?: string;
  picture?: string;
}

interface DiscoveryDocument { authorization_endpoint: string; token_endpoint: string; jwks_uri: string }
interface LoginAttempt { verifier: string; nonce: string; expiresAt: number }
interface Session { user: AuthUser; expiresAt: number }
interface IdTokenClaims { sub: string; iss: string; aud: string | string[]; exp: number; nonce?: string; name?: string; email?: string; picture?: string }
type Jwk = NodeJsonWebKey & { kid?: string; kty: string };

const loginAttempts = new Map<string, LoginAttempt>();
const sessions = new Map<string, Session>();
const LOGIN_TTL_MS = 10 * 60_000;
const SESSION_TTL_MS = 8 * 60 * 60_000;

export function isOidcConfigured(): boolean {
  return Boolean(config.oidcIssuer && config.oidcClientId && config.oidcClientSecret);
}

export async function beginLogin(): Promise<{ state: string; authorizationUrl: string }> {
  const discovery = await discover();
  const state = randomToken();
  const nonce = randomToken();
  const verifier = randomToken();
  loginAttempts.set(state, { verifier, nonce, expiresAt: Date.now() + LOGIN_TTL_MS });

  const params = new URLSearchParams({
    response_type: 'code', client_id: config.oidcClientId, redirect_uri: config.oidcRedirectUri,
    scope: 'openid profile email', state, nonce,
    code_challenge: sha256Base64Url(verifier), code_challenge_method: 'S256',
  });
  return { state, authorizationUrl: `${discovery.authorization_endpoint}?${params}` };
}

export async function completeLogin(code: string, state: string): Promise<string> {
  const attempt = loginAttempts.get(state);
  loginAttempts.delete(state);
  if (!attempt || attempt.expiresAt < Date.now()) throw new Error('Login state is invalid or expired');

  const discovery = await discover();
  const response = await fetch(discovery.token_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code', code, redirect_uri: config.oidcRedirectUri,
      client_id: config.oidcClientId, client_secret: config.oidcClientSecret,
      code_verifier: attempt.verifier,
    }),
  });
  if (!response.ok) throw new Error('OIDC token exchange failed');
  const tokenResponse = (await response.json()) as { id_token?: string };
  if (!tokenResponse.id_token) throw new Error('OIDC provider did not return an ID token');

  const claims = await validateIdToken(tokenResponse.id_token, discovery.jwks_uri, attempt.nonce);
  const sessionId = randomToken();
  sessions.set(sessionId, {
    user: { id: claims.sub, name: claims.name, email: claims.email, picture: claims.picture },
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return sessionId;
}

export function getSession(sessionId?: string): AuthUser | null {
  if (!sessionId) return null;
  const session = sessions.get(sessionId);
  if (!session || session.expiresAt < Date.now()) { sessions.delete(sessionId); return null; }
  return session.user;
}

export function revokeSession(sessionId?: string): void { if (sessionId) sessions.delete(sessionId); }

async function discover(): Promise<DiscoveryDocument> {
  const response = await fetch(`${config.oidcIssuer.replace(/\/$/, '')}/.well-known/openid-configuration`);
  if (!response.ok) throw new Error('Unable to discover OIDC configuration');
  const document = (await response.json()) as Partial<DiscoveryDocument>;
  if (!document.authorization_endpoint || !document.token_endpoint || !document.jwks_uri) throw new Error('OIDC discovery document is incomplete');
  return document as DiscoveryDocument;
}

async function validateIdToken(idToken: string, jwksUri: string, expectedNonce: string): Promise<IdTokenClaims> {
  const [encodedHeader, encodedClaims, encodedSignature] = idToken.split('.');
  if (!encodedHeader || !encodedClaims || !encodedSignature) throw new Error('Malformed ID token');
  const header = decodeJson<{ alg?: string; kid?: string }>(encodedHeader);
  const claims = decodeJson<IdTokenClaims>(encodedClaims);
  if (header.alg !== 'RS256' || !header.kid) throw new Error('Unsupported ID token signing algorithm');
  if (claims.iss !== config.oidcIssuer || claims.exp * 1000 <= Date.now() || claims.nonce !== expectedNonce) throw new Error('ID token claims are invalid');
  if (!(Array.isArray(claims.aud) ? claims.aud : [claims.aud]).includes(config.oidcClientId)) throw new Error('ID token audience is invalid');

  const jwksResponse = await fetch(jwksUri);
  if (!jwksResponse.ok) throw new Error('Unable to retrieve OIDC signing keys');
  const jwks = (await jwksResponse.json()) as { keys?: Jwk[] };
  const jwk = jwks.keys?.find((key) => key.kid === header.kid && key.kty === 'RSA');
  if (!jwk) throw new Error('OIDC signing key was not found');
  const key = createPublicKey({ key: jwk, format: 'jwk' });
  const valid = verify('RSA-SHA256', Buffer.from(`${encodedHeader}.${encodedClaims}`), key, Buffer.from(encodedSignature, 'base64url'));
  if (!valid) throw new Error('ID token signature is invalid');
  return claims;
}

function decodeJson<T>(input: string): T { return JSON.parse(Buffer.from(input, 'base64url').toString('utf8')) as T; }
function randomToken(): string { return randomBytes(32).toString('base64url'); }
function sha256Base64Url(value: string): string { return createHash('sha256').update(value).digest('base64url'); }
