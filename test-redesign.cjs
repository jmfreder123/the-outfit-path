const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const elements = new Map();
const element = key => elements.get(key) || elements.set(key, {
  innerHTML: '',
  textContent: '',
  classList: { add() {}, remove() {}, toggle() {} },
  addEventListener() {},
  showModal() { this.open = true; },
  close() { this.open = false; }
}).get(key);

const sandbox = {
  console,
  crypto: require('node:crypto').webcrypto,
  setTimeout,
  clearTimeout,
  localStorage: { getItem() { return null; }, setItem() {} },
  document: {
    body: { classList: { add() {}, remove() {} } },
    activeElement: null,
    querySelector: element,
    querySelectorAll() { return []; },
    addEventListener() {}
  },
  window: {}
};

vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('docs/app.js', 'utf8'), sandbox);
vm.runInContext(fs.readFileSync('docs/editorial.js', 'utf8'), sandbox);
const run = code => vm.runInContext(code, sandbox);

assert.equal(run('data.items.length'), 42, 'redesign must not add samples to stored closet data');
assert(run('renderBuilder().includes("Your wardrobe. Your rules.")'));
assert(run("renderBuilder().includes('name=\"editorial-occasion\"')"));
assert(run("renderBuilder().includes('name=\"editorial-style\"')"));
assert(run('renderBuilder().includes("Every style is open to everyone.")'));
assert(!run('renderBuilder().includes("Men")'));
assert(!run('renderBuilder().includes("Women")'));
const visiblePieceIds = html => [...html.matchAll(/data-edit="([^"]+)"/g)].map(match => match[1]);
const baselinePieceIds = visiblePieceIds(run('renderBuilder()'));
for (const preference of ['none', 'feminine', 'masculine', 'androgynous']) {
  run(`answers.stylePreference='${preference}'`);
  assert.deepEqual(visiblePieceIds(run('renderBuilder()')), baselinePieceIds, `${preference} must not hide wardrobe pieces`);
}
run("answers.stylePreference='androgynous'");
assert(run("Object.keys(features([data.items[0]],answers)).some(key=>key.startsWith('context:aesthetic:androgynous:'))"));

for (const asset of ['blazer.png', 'watch.png', 'tote.png', 'cream-knit.png', 'charcoal-trousers.png', 'white-shirt.png', 'loafers.png']) {
  assert(fs.statSync('docs/assets/design3/' + asset).size > 1000, asset + ' should be a non-empty local asset');
}

console.log('PASS: editorial shell, separate genderless occasion/style selectors, unchanged starter count, learned aesthetic context, and local asset manifest.');
