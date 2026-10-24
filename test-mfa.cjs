const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const source = fs.readFileSync('docs/supabase-sync.js', 'utf8');
const migration = fs.readFileSync('supabase/migrations/20261024202000_require_aal2_for_enrolled_users.sql', 'utf8');
const handoff = fs.readFileSync('MFA-2FA-HANDOFF.md', 'utf8');

assert.match(source, /getAuthenticatorAssuranceLevel\(\)/);
assert.match(source, /mfa\.listFactors\(\)/);
assert.match(source, /mfa\.enroll\(\{ factorType: 'totp'/);
assert.match(source, /mfa\.challenge\(\{ factorId \}\)/);
assert.match(source, /mfa\.verify\(\{ factorId, challengeId: challenge\.id, code \}\)/);
assert.match(source, /status\.nextLevel === 'aal2' && status\.currentLevel !== 'aal2'/);
assert.match(source, /switchScope\(null\)/);
assert.match(source, /Recent two-step verification is required/);
assert.match(source, /Supabase TOTP does not provide recovery codes in this app/);
assert.match(source, /Google Authenticator/);
assert.match(source, /Microsoft Authenticator/);
assert.match(source, /Authy/);
assert.match(source, /Apple Passwords/);
assert.match(source, /Scan QR code<\/strong> inside the authenticator app—not the phone's ordinary Camera app/);
assert.match(source, /Enter the current six-digit code/);
assert.doesNotMatch(source, /console\.(?:log|debug|info)\([^)]*(?:totp|qr|secret|code)/i);
assert.match(migration, /as restrictive/i);
assert.match(migration, /auth\.jwt\(\)->>'aal'/);
assert.match(migration, /auth\.mfa_factors/);
assert.match(migration, /status = 'verified'/);
assert.match(migration, /with check/i);
assert.match(handoff, /not enforced in the live database/i);

let currentLevel = 'aal1';
let authUser = { id: 'mfa-user', email: 'mfa@example.test' };
let submitHandler;
let challengeCalls = 0;
let verifyCalls = 0;
let bodyPending = true;
const scopes = [];
const gate = {
  id: '', className: '', innerHTML: '', open: false,
  addEventListener() {}, showModal() { this.open = true; }, close() { this.open = false; }
};
const client = {
  auth: {
    async getUser() { return { data: { user: authUser }, error: null }; },
    onAuthStateChange() { return { data: { subscription: {} } }; },
    mfa: {
      async getAuthenticatorAssuranceLevel() { return { data: { currentLevel, nextLevel: 'aal2' }, error: null }; },
      async listFactors() { return { data: { totp: [{ id: 'factor-1', status: 'verified', friendly_name: 'Test authenticator' }], phone: [] }, error: null }; },
      async challenge({ factorId }) { assert.equal(factorId, 'factor-1'); challengeCalls++; return { data: { id: 'challenge-1' }, error: null }; },
      async verify({ factorId, challengeId, code }) {
        assert.deepEqual({ factorId, challengeId, code }, { factorId: 'factor-1', challengeId: 'challenge-1', code: '123456' });
        verifyCalls++; currentLevel = 'aal2'; return { data: {}, error: null };
      }
    }
  }
};
const sandbox = {
  console, setTimeout, clearTimeout, queueMicrotask, URLSearchParams,
  atob: value => Buffer.from(value, 'base64').toString('binary'),
  FormData: class { constructor(form) { this.form = form; } get(name) { return this.form.values?.[name] || ''; } },
  location: { hash: '', search: '', origin: 'http://127.0.0.1:4173', pathname: '/' },
  SUPABASE_CONFIG: { url: 'https://example.supabase.co', publishableKey: 'publishable-key' },
  supabase: { createClient() { return client; } },
  outfitPathCloud: {
    async switchScope(userId) { scopes.push(userId ? `user:${userId}` : 'guest'); },
    matchesUser() { return true; }, guestSummary() { return { items: 0, looks: 0, ratings: 0 }; },
    getData() { return { items: [], looks: [], ratings: [] }; }
  },
  document: {
    body: {
      append() {},
      classList: {
        add(name) { if (name === 'account-pending') bodyPending = true; },
        remove(name) { if (name === 'account-pending') bodyPending = false; }
      }
    },
    createElement() { return gate; },
    querySelector(selector) { if (selector === '#auth-entry-gate') return gate.id ? gate : null; return null; },
    addEventListener(type, handler) { if (type === 'submit') submitHandler = handler; }
  },
  toast() {}
};

vm.createContext(sandbox);
vm.runInContext(source, sandbox);
const settle = () => new Promise(resolve => setTimeout(resolve, 0));

(async () => {
  await settle(); await settle();
  assert.equal(scopes.at(-1), 'guest', 'AAL1 session with a verified factor never loads account-scoped browser data');
  assert.equal(bodyPending, true, 'wardrobe remains hidden before the second factor');
  assert.match(gate.innerHTML, /Enter your authenticator code/);
  assert.doesNotMatch(gate.innerHTML, /outfit builder|My closet/i);

  const form = {
    id: 'mfa-challenge-form', values: { factorId: 'factor-1', code: '123456' },
    reset() {}, querySelectorAll() { return []; }
  };
  await submitHandler({ target: form, preventDefault() {} });
  assert.equal(challengeCalls, 1);
  assert.equal(verifyCalls, 1);
  assert.equal(scopes.at(-1), 'user:mfa-user', 'successful TOTP verification loads only that account scope');
  assert.equal(bodyPending, false, 'wardrobe opens only after AAL2');

  console.log('PASS: optional TOTP enrollment/challenge APIs, AAL1 lock, AAL2 unlock, lost-device guidance, and restrictive RLS handoff.');
})().catch(error => { console.error(error); process.exitCode = 1; });
