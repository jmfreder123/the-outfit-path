const fs = require('node:fs');
const assert = require('node:assert/strict');

const index = fs.readFileSync('docs/index.html', 'utf8');
const ageGate = fs.readFileSync('docs/age-gate.js', 'utf8');
const privacy = fs.readFileSync('docs/privacy.html', 'utf8');
const style = fs.readFileSync('docs/style.css', 'utf8');
const sync = fs.readFileSync('docs/supabase-sync.js', 'utf8');
const headers = fs.readFileSync('docs/_headers', 'utf8');
const audit = fs.readFileSync('SECURITY-PRIVACY-REVIEW.md', 'utf8');

assert.match(index, /Content-Security-Policy/);
assert.match(index, /default-src 'self'/);
assert.match(index, /object-src 'none'/);
assert.match(index, /script-src 'self' https:\/\/cdn\.jsdelivr\.net/);
assert.match(index, /worker-src 'self' blob: https:\/\/cdn\.jsdelivr\.net\/npm\/@huggingface\/transformers@3\.8\.1\/dist\//);
assert.doesNotMatch(index, /script-src[^;]+unsafe-inline/);
assert.match(index, /style-src 'self' 'unsafe-inline'/);
assert.match(ageGate, /sha384-E5rUTHDRUm1TnfCJj1VyMaNq7zE7vCkjW4KJxzdA4YVj11kqsx\+5dY3gUioXdGsP/);
assert.match(ageGate, /referrerPolicy = 'no-referrer'/);
assert.doesNotMatch(style, /fonts\.googleapis\.com|fonts\.gstatic\.com/);
assert.match(headers, /Content-Security-Policy:/);
assert.match(headers, /frame-ancestors 'none'/);
assert.match(headers, /X-Frame-Options: DENY/);
assert.match(headers, /X-Content-Type-Options: nosniff/);
assert.match(headers, /Permissions-Policy:/);
assert.match(headers, /X-Robots-Tag: noindex, nofollow/);
assert.doesNotMatch(headers, /sb_secret_|service_role/i);

assert.match(sync, /signOut\(\{ scope: 'local' \}\)/);
assert.match(sync, /Sign in to your private wardrobe/);
assert.match(sync, /body\?\.classList\?\.add\('account-pending'\)/);
assert.match(sync, /The account action could not be completed\. Your wardrobe is unchanged\./);
assert.match(sync, /If this email belongs to an invited account/);
assert.match(sync, /getAuthenticatorAssuranceLevel/);
assert.doesNotMatch(sync, /message\(error\.message/);
assert.doesNotMatch(sync, /target\.innerHTML[^;]+error\.message/);

for (const text of [
  'John M. Fredericks',
  'jfredericks4@gmail.com',
  'John Fredericks',
  '1235 Pennsylvania Ave SE',
  'Unit #1357',
  'Washington, DC 20003',
  'not represented as a physical business location or registered-agent address',
  'Not ready for public launch',
  'The current preview has no self-service cloud-copy or account deletion control',
  'photos as base64 data',
  'no app analytics',
  'live two-account isolation testing',
  '[CLOUD ACCOUNT/DOCUMENT RETENTION PERIOD — REQUIRED]',
  '[APPLICABLE JURISDICTIONS AND LEGAL BASES — REQUIRED]',
  'The service is for adults age 18 and over',
  'self-attestation, not verified proof of age'
]) assert.match(privacy, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));

assert.doesNotMatch(privacy, /private home address|home address placeholder/i);

assert.match(audit, /current two-account RLS checks passed with synthetic data/i);
assert.match(audit, /No self-service cloud-copy deletion or account deletion/);
assert.match(audit, /no public deployment, push, or security-setting mutation/i);
assert.doesNotMatch(`${privacy}\n${audit}`, /sb_secret_[A-Za-z0-9_-]+/i);

console.log('PASS: privacy draft, CSP/SRI, local sign-out, generic errors, and launch blockers are documented.');
