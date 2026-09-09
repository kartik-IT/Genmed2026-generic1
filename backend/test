import assert from 'node:assert/strict';
import test from 'node:test';
import { getSession, isOidcConfigured, revokeSession } from '../server/services/oidcService';

test('OIDC does not enable itself without provider credentials', () => {
  assert.equal(isOidcConfigured(), false);
});

test('missing or revoked sessions never expose a user', () => {
  assert.equal(getSession(), null);
  revokeSession('not-a-session');
  assert.equal(getSession('not-a-session'), null);
});
