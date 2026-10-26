// Invitation and reset links: the password-setup screen opens only for a
// session that really came from the link (its access token) or from a
// Supabase PASSWORD_RECOVERY sign-in, never from "#type=recovery" typed onto
// the address of an already signed-in browser.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const source = fs.readFileSync('docs/supabase-sync.js', 'utf8');
const settle = () => new Promise(resolve => setTimeout(resolve, 0));

async function start({ hash, sessionToken }) {
  const state = { scopes: [], pending: false, gateHtml: '', updates: 0, authCallback: null, submit: null };
  const user = { id: 'owner-id', email: 'owner@example.test' };
  const gate = {
    open: false, set innerHTML(v) { state.gateHtml = v; }, get innerHTML() { return state.gateHtml; },
    addEventListener() {}, showModal() { this.open = true; }, close() { this.open = false; }
  };
  let gateAdded = false;
  const client = {
    auth: {
      async getUser() { return { data: { user }, error: null }; },
      async getSession() { return { data: { session: { access_token: sessionToken, user } }, error: null }; },
      onAuthStateChange(cb) { state.authCallback = cb; return { data: { subscription: {} } }; },
      async updateUser() { state.updates++; return { error: null }; },
      mfa: {
        async getAuthenticatorAssuranceLevel() { return { data: { currentLevel: 'aal1', nextLevel: 'aal1' }, error: null }; },
        async listFactors() { return { data: { totp: [] }, error: null }; }
      }
    }
  };
  const sandbox = {
    console, setTimeout, clearTimeout, queueMicrotask, URLSearchParams,
    FormData: class { constructor(form) { this.form = form; } get(name) { return this.form.values?.[name] || ''; } },
    atob: value => Buffer.from(value, 'base64').toString('binary'),
    location: { hash, search: '', origin: 'http://127.0.0.1:4173', pathname: '/' },
    history: { replaceState() {} },
    SUPABASE_CONFIG: { url: 'https://example.supabase.co', publishableKey: 'publishable-key' },
    supabase: { createClient() { return client; } },
    outfitPathCloud: { async switchScope(id) { state.scopes.push(id ? `user:${id}` : 'guest'); }, matchesUser: () => true },
    document: {
      body: {
        classList: { add(n) { if (n === 'account-pending') state.pending = true; }, remove(n) { if (n === 'account-pending') state.pending = false; } },
        append() { gateAdded = true; }
      },
      createElement() { return gate; },
      querySelector(sel) { if (sel === '#auth-entry-gate') return gateAdded ? gate : null; if (sel === '#modal') return { close() {} }; return null; },
      addEventListener(type, h) { if (type === 'submit') state.submit = h; }
    },
    toast() {}
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);
  await settle(); await settle(); await settle();
  return state;
}
const setupForm = { id: 'account-setup-form', values: { password: 'a-long-new-password' }, reset() {}, querySelectorAll() { return []; } };

(async () => {
  // A signed-in browser opened with a hand-made "#type=recovery": no setup
  // screen, the wardrobe opens, and the setup form cannot change the password.
  for (const hash of ['#type=recovery', '#type=invite', '#access_token=made-up&type=recovery']) {
    const s = await start({ hash, sessionToken: 'real-session-token' });
    assert.equal(s.scopes.at(-1), 'user:owner-id', `${hash}: wardrobe opens normally`);
    assert.equal(s.pending, false);
    assert(!s.gateHtml.includes('account-setup-form'), `${hash}: no password setup screen`);
    await s.submit({ target: setupForm, preventDefault() {} });
    assert.equal(s.updates, 0, `${hash}: password not changed`);
  }

  // A real link: the session's token matches the link's token.
  let s = await start({ hash: '#access_token=link-token&type=invite', sessionToken: 'link-token' });
  assert(s.gateHtml.includes('Finish setting up your account'), 'real invitation shows setup');
  assert.equal(s.pending, true);
  assert.equal(s.scopes.at(-1), 'guest', 'wardrobe stays hidden until the password is set');
  await s.submit({ target: setupForm, preventDefault() {} });
  await settle(); await settle();
  assert.equal(s.updates, 1, 'real invitation can set the password');
  assert.equal(s.scopes.at(-1), 'user:owner-id');

  s = await start({ hash: '#access_token=link-token&type=recovery', sessionToken: 'link-token' });
  assert(s.gateHtml.includes('Choose a new password.'), 'real reset link shows setup');

  // Supabase reports a recovery sign-in.
  s = await start({ hash: '', sessionToken: 'real-session-token' });
  assert.equal(s.scopes.at(-1), 'user:owner-id');
  s.authCallback('PASSWORD_RECOVERY', { user: { id: 'owner-id', email: 'owner@example.test' } });
  await settle(); await settle(); await settle();
  assert(s.gateHtml.includes('Choose a new password.'), 'PASSWORD_RECOVERY shows setup');
  console.log('PASS: password setup opens only for a session from the link itself or a PASSWORD_RECOVERY sign-in; a hand-made #type=recovery cannot change the password.');
})().catch(error => { console.error(error); process.exit(1); });
