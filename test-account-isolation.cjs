const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const appSource = fs.readFileSync('docs/app.js', 'utf8');
const scannerSource = fs.readFileSync('docs/scanner.js', 'utf8');
const syncSource = fs.readFileSync('docs/supabase-sync.js', 'utf8');

const legacy = {
  version: 1,
  items: Array.from({ length: 43 }, (_, index) => ({
    id: `legacy-${index}`,
    name: index === 42 ? 'Legacy watch' : `Legacy piece ${index}`,
    type: index === 42 ? 'jewelry' : 'top',
    color: 'gray',
    hex: '#96948c',
    style: 'classic',
    season: 'all',
    available: true,
    notes: '',
    ...(index === 42 ? { photoId: 'legacy-watch-photo' } : {})
  })),
  looks: [],
  ratings: [],
  name: '',
  learning: true
};
const storage = new Map([['outfit-path-v1', JSON.stringify(legacy)]]);
const elements = new Map();
const el = key => elements.get(key) || elements.set(key, {
  innerHTML: '', textContent: '', open: false,
  classList: { add() {}, remove() {}, toggle() {} },
  addEventListener() {}, showModal() { this.open = true; }, close() { this.open = false; }
}).get(key);
const appSandbox = {
  console,
  crypto: require('node:crypto').webcrypto,
  setTimeout, clearTimeout,
  localStorage: {
    getItem(key) { return storage.get(key) ?? null; },
    setItem(key, value) { storage.set(key, String(value)); }
  },
  document: {
    body: { classList: { add() {}, remove() {} } },
    activeElement: null,
    querySelector: el,
    querySelectorAll() { return []; },
    addEventListener() {}
  },
  window: {}
};
vm.createContext(appSandbox);
vm.runInContext(appSource, appSandbox);
vm.runInContext(scannerSource, appSandbox);
const run = code => vm.runInContext(code, appSandbox);

(async () => {
  assert.equal(run('activeDataScope'), 'guest');
  assert.equal(run('data.items.length'), 43);
  assert.equal(JSON.parse(storage.get('outfit-path-v2:guest')).items.length, 43);
  assert.equal(JSON.parse(storage.get('outfit-path-v1')).items.length, 43, 'legacy fallback remains untouched');

  await run('switchDataScope("account-a")');
  assert.equal(run('activeDataScope'), 'user:account-a');
  assert.equal(run('data.items.length'), 0, 'new account starts empty, without the guest wardrobe');
  run('data.name="account A"; save()');

  await run('switchDataScope("account-b")');
  assert.equal(run('data.name'), '');
  assert.equal(run('data.items.length'), 0);
  await run('switchDataScope("account-a")');
  assert.equal(run('data.name'), 'account A', 'account A data survives switching');
  await run('switchDataScope(null)');
  assert.equal(run('activeDataScope'), 'guest');
  assert.equal(run('data.items.length'), 43, 'logout restores the preserved guest copy');
  assert.equal(run('data.items[42].name'), 'Legacy watch');

  assert.equal(run('photoStorageKey("user:account-a","photo-1")'), 'outfit-path-v2|user%3Aaccount-a|photo-1');
  assert.equal(run('parsePhotoStorageKey("legacy-watch-photo").scope'), 'guest');
  assert.equal(run('parsePhotoStorageKey(photoStorageKey("user:account-b","photo-2")).scope'), 'user:account-b');
  assert.doesNotMatch(scannerSource, /objectStore\(['"]photos['"]\)\.clear|store\.clear\(/);
  assert.match(scannerSource, /copyPhotosBetweenScopes\('guest'|copyPhotosBetweenScopes/);

  let authUser = { id: 'asu-id', email: 'asu@example.test' };
  let authError = null;
  let authCallback;
  let clickHandler;
  let submitHandler;
  let writes = 0;
  let recoveryRequests = 0;
  let recoveryOptions = null;
  const scopeCalls = [];
  let activeScope = 'guest';
  let forceMismatch = false;
  const panel = { innerHTML: '' };
  const messages = [];
  let bodyPending = true;
  const client = {
    auth: {
      async getUser() { return { data: { user: authError ? null : authUser }, error: authError }; },
      onAuthStateChange(callback) { authCallback = callback; return { data: { subscription: {} } }; },
      async signInWithPassword() { return { data: { user: authUser }, error: null }; },
      async signOut() { return { error: null }; },
      async updateUser() { return { error: null }; },
      async resetPasswordForEmail(email, options) { recoveryRequests++; recoveryOptions = { email, options }; return { error: null }; }
    },
    from() {
      return {
        async upsert() { writes++; return { error: null }; },
        select() { return { eq() { return { async maybeSingle() { return { data: null, error: null }; } }; } }; }
      };
    }
  };
  const syncSandbox = {
    console, setTimeout, clearTimeout, queueMicrotask, URLSearchParams,
    FormData: class { constructor(form) { this.form = form; } get(name) { return this.form.values?.[name] || ''; } },
    atob: value => Buffer.from(value, 'base64').toString('binary'),
    location: { hash: '', search: '', origin: 'http://127.0.0.1:4173', pathname: '/' },
    SUPABASE_CONFIG: { url: 'https://example.supabase.co', publishableKey: 'publishable-key' },
    supabase: { createClient() { return client; } },
    outfitPathCloud: {
      async switchScope(userId) { activeScope = userId ? `user:${userId}` : 'guest'; scopeCalls.push(activeScope); },
      matchesUser(userId) { return !forceMismatch && activeScope === `user:${userId}`; },
      guestSummary() { return { items: 43, looks: 2, ratings: 1 }; },
      getData() { return { items: [], looks: [], ratings: [] }; },
      replaceData() {}, async copyGuestToUser() {}
    },
    document: {
      body: { classList: { add(name) { if (name === 'account-pending') bodyPending = true; }, remove(name) { if (name === 'account-pending') bodyPending = false; } } },
      querySelector(selector) { if (selector === '#cloud-sync-panel') return panel; if (selector === '#modal') return { close() {} }; return null; },
      addEventListener(type, handler) { if (type === 'click') clickHandler = handler; if (type === 'submit') submitHandler = handler; }
    },
    toast(text) { messages.push(text); }
  };
  vm.createContext(syncSandbox);
  vm.runInContext(syncSource, syncSandbox);
  const settle = () => new Promise(resolve => setTimeout(resolve, 0));
  await settle(); await settle();
  assert.equal(scopeCalls.at(-1), 'user:asu-id', 'reload selects the authenticated account scope');
  assert.equal(bodyPending, false, 'verified reload session opens its account wardrobe');

  authUser = { id: 'gmail-id', email: 'gmail@example.test' };
  authCallback('SIGNED_IN', { user: authUser });
  await settle(); await settle();
  assert.equal(scopeCalls.at(-1), 'user:gmail-id', 'account switch selects the new account scope');

  authUser = null;
  authCallback('SIGNED_OUT', null);
  await settle(); await settle();
  assert.equal(scopeCalls.at(-1), 'guest', 'sign-out returns to guest scope');
  assert.equal(bodyPending, true, 'signed-out visitors cannot see the guest wardrobe');

  authUser = { id: 'asu-id', email: 'asu@example.test' };
  authCallback('SIGNED_IN', { user: authUser });
  await settle(); await settle();
  assert.equal(scopeCalls.at(-1), 'user:asu-id', 'invite callback uses the invited account scope');
  assert.equal(bodyPending, false, 'authenticated invite callback may proceed after setup');

  authError = { message: 'JWT expired' };
  await syncSandbox.wardrobeCloud.renderPanel();
  assert.equal(scopeCalls.at(-1), 'guest', 'expired session hides account data behind guest scope');
  assert.equal(bodyPending, true, 'expired sessions return to the blocking sign-in gate');
  authError = null;
  authUser = { id: 'asu-id', email: 'asu@example.test' };
  forceMismatch = true;
  await clickHandler({ target: { closest() { return { dataset: { cloudAction: 'upload' }, disabled: false }; } } });
  await settle();
  assert.equal(writes, 0, 'mismatched local scope blocks cloud upload');
  assert(messages.some(text => /blocked.*does not match/i.test(text)));

  assert.equal(recoveryRequests, 0, 'recovery email is never sent without an explicit form submission');
  const recoveryForm = {
    id: 'password-recovery-form', values: { email: 'existing-invitee@example.test' },
    reset() {}, querySelectorAll() { return []; }
  };
  await submitHandler({ target: recoveryForm, preventDefault() {} });
  assert.equal(recoveryRequests, 1, 'explicit recovery submission requests exactly one email');
  assert.equal(recoveryOptions.email, 'existing-invitee@example.test');
  assert.equal(recoveryOptions.options.redirectTo, 'http://127.0.0.1:4173/');

  assert.match(syncSource, /Copy the preserved guest wardrobe\?/);
  assert.match(syncSource, /Nothing is uploaded, moved, or deleted/);
  assert.match(syncSource, /INVITE-ONLY · ADULTS 18\+/);
  assert.match(syncSource, /Finish setting up your account/);
  assert.match(syncSource, /setupMode = callbackType === 'recovery'/);
  assert.match(syncSource, /Forgot password\?/);
  assert.match(syncSource, /If this email belongs to an invited account/);
  assert.match(syncSource, /event === 'PASSWORD_RECOVERY'/);
  assert.doesNotMatch(syncSource, /\.auth\.signUp\s*\(/);
  console.log('PASS: legacy guest preservation; per-account data/photo namespaces; reload, account switch, sign-out, invite callback, expired-session hiding; explicit guest copy; mismatched-upload rejection.');
})().catch(error => { console.error(error); process.exitCode = 1; });
