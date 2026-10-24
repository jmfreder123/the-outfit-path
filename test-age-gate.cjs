const fs = require('node:fs');
const assert = require('node:assert/strict');

const index = fs.readFileSync('docs/index.html', 'utf8');
const gate = fs.readFileSync('docs/age-gate.js', 'utf8');

const initialScripts = [...index.matchAll(/<script\s+src="([^"]+)"/g)].map(match => match[1]);
assert.deepEqual(initialScripts, ['age-gate.js']);
assert.match(index, /Are you 18 or older\?/);
assert.match(index, /self-attestation, not verified proof of age/i);
assert.match(index, /not a birth date or identity document/i);
assert.doesNotMatch(index, /type="date"|<input[^>]+name="(?:dob|birth|age|identity|id_document)"|<input[^>]+type="file"[^>]+(?:id|identity)/i);

for (const script of ['app.js', 'scanner.js', 'supabase-config.js', '@supabase/supabase-js@2.76.1', 'supabase-sync.js?v=7']) {
  assert.match(gate, new RegExp(script.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}
assert.match(gate, /sessionStorage\.setItem\(SESSION_KEY, 'yes'\)/);
assert.match(gate, /sessionStorage\.getItem\(SESSION_KEY\) === 'yes'/);
assert.doesNotMatch(gate, /localStorage|birth|dob|identity document|government/i);
assert.match(gate, /decline\.addEventListener\('click'/);
assert.match(gate, /No wardrobe, account, or cloud scripts were loaded\./);
assert.match(gate, /gate\.addEventListener\('cancel', event => event\.preventDefault\(\)\)/);
assert.match(gate, /accept\.addEventListener\('click',[\s\S]+startApp\(\)/);

console.log('PASS: 18+ self-attestation gates app/auth/cloud scripts, minimizes age data, and has a no-save decline path.');
