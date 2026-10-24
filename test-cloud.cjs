const fs = require('node:fs');
const assert = require('node:assert/strict');

const sql = fs.readFileSync('supabase/migrations/20261024180000_create_wardrobe_documents.sql', 'utf8');
const sync = fs.readFileSync('docs/supabase-sync.js', 'utf8');
const config = fs.readFileSync('docs/supabase-config.js', 'utf8');

assert.match(sql, /enable row level security/i);
assert.match(sql, /force row level security/i);
assert.match(sql, /revoke all.+from anon/i);
assert.doesNotMatch(sql, /grant[^;]+delete/i);
assert.equal((sql.match(/\(select auth\.uid\(\)\) = user_id/g) || []).length, 4);
assert.match(sync, /sb_secret_/);
assert.match(sync, /service_role/);
assert.match(sync, /delete item\.photoId/);
assert.doesNotMatch(config, /sb_secret_/);
assert.doesNotMatch(config, /service_role/);

console.log('PASS: RLS ownership policies, anonymous denial, no delete grant, secret-key guard, and photo exclusion.');
