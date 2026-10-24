const fs = require('node:fs');
const assert = require('node:assert/strict');

const sync = fs.readFileSync('docs/supabase-sync.js', 'utf8');
const privacy = fs.readFileSync('docs/privacy.html', 'utf8');
const runbook = fs.readFileSync('INVITE-ONLY-BETA.md', 'utf8');

assert.doesNotMatch(sync, /\.auth\.signUp\s*\(/);
assert.doesNotMatch(sync, /auth\.admin|inviteUserByEmail|sb_secret_[A-Za-z0-9_-]+/i);
assert.doesNotMatch(sync, />\s*Create account\s*</i);
assert.match(sync, /Invite-only cloud backup/);
assert.match(sync, /This private beta has no public signup/);
assert.match(sync, /Sign in to your private wardrobe/);
assert.match(sync, /INVITE-ONLY · ADULTS 18\+/);
assert.match(sync, /Only adults invited by John M\. Fredericks/);
assert.match(sync, /account-setup-form/);
assert.match(sync, /Set password and continue/);
assert.match(sync, /\.auth\.signInWithPassword\(/);
assert.match(sync, /\.auth\.updateUser\(\{ password \}\)/);
assert.match(sync, /autocomplete="new-password" minlength="12"/);
assert.match(sync, /Forgot password\?/);
assert.match(sync, /password-recovery-form/);
assert.match(sync, /\.auth\.resetPasswordForEmail\(email, \{ redirectTo \}\)/);
assert.match(sync, /If this email belongs to an invited account/);
assert.match(sync, /This invitation or password-reset link could not be completed/);
assert.match(sync, /PRIVATE PASSWORD RECOVERY/);
assert.match(sync, /origin === 'http:\/\/127\.0\.0\.1:4173'/);
assert.match(sync, /origin === 'https:\/\/theoutfitpath\.com'/);

assert.match(privacy, /Invite-only beta/);
assert.match(privacy, /live “Allow new users to sign up” setting was disabled by John M\. Fredericks and verified off after reload/);
assert.match(runbook, /Allow new users to sign up\*\*.*remained off/s);
assert.match(runbook, /Turn \*\*Allow new users to sign up\*\* off/);
assert.match(runbook, /Keep \*\*Allow anonymous sign-ins\*\* off/);
assert.match(runbook, /Add user → Send invitation/);
assert.match(runbook, /No production hosting target is currently verified/);
assert.match(runbook, /direct `signUp`.+must fail/);

console.log('PASS: public signup is absent from the client and the backend owner handoff/test plan is explicit.');
