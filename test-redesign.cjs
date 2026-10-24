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
const visiblePieceIds = html => [...html.matchAll(/data-(?:edit|demo-add)="([^"]+)"/g)].map(match => match[1]);
const baselinePieceIds = visiblePieceIds(run('renderBuilder()'));
assert.deepEqual(baselinePieceIds, ['demo-emerald-slip-dress', 'demo-patterned-midi-skirt', 'demo-rust-blazer', 'demo-cobalt-hoodie', 'demo-indigo-jeans', 'demo-black-sport-leggings', 'demo-off-white-chunky-sneakers', 'starter-20', 'demo-black-crossbody']);
for (const preference of ['none', 'feminine', 'masculine', 'androgynous']) {
  run(`answers.stylePreference='${preference}'`);
  assert.deepEqual(visiblePieceIds(run('renderBuilder()')), baselinePieceIds, `${preference} must not hide wardrobe pieces`);
}
run("data.items.push({id:'user-fixture',name:'User fixture',type:'top',color:'blue',hex:'#6e8494',style:'relaxed',season:'all',available:true,notes:''})");
assert.equal(visiblePieceIds(run('renderBuilder()'))[0], 'user-fixture', 'user-owned pieces should appear before demo samples');
run("data.items.pop()");
run("answers.stylePreference='androgynous'");
assert(run("Object.keys(features([data.items[0]],answers)).some(key=>key.startsWith('context:aesthetic:androgynous:'))"));

const editorialSource = fs.readFileSync('docs/editorial.js', 'utf8');
for (const mismatchedStarter of ['starter-13', 'starter-25', 'starter-38']) {
  assert(!new RegExp(`['"]${mismatchedStarter}['"]\\s*:`).test(editorialSource), mismatchedStarter + ' must not claim a mismatched raster asset');
}
assert(run('renderBuilder().includes("Add sample to closet")'));
assert(run('renderBuilder().includes("type=\\"image/webp\\"")'));

const directionSets = {};
for (const [theme, occasion] of [['business','work'],['business-casual','work'],['everyday','everyday'],['evening','date'],['sporty','weekend'],['streetwear','weekend']]) {
  run(`answers={occasionTheme:'${theme}',occasion:'${occasion}',stylePreference:'none'}`);
  directionSets[theme] = run('previewItems().map(item=>item.id).join(",")');
}
assert(new Set(Object.values(directionSets)).size >= 5, 'occasion controls should produce visibly distinct demo suggestions');

run(`data={version:1,looks:[],ratings:[],name:'',learning:true,items:[
  {id:'user-classic-pants',name:'Classic pants',type:'pants',color:'black',hex:'#343634',style:'classic',season:'all',available:true,notes:''},
  {id:'user-relaxed-pants',name:'Relaxed pants',type:'pants',color:'blue',hex:'#6e8494',style:'relaxed',season:'all',available:true,notes:''},
  {id:'user-classic-top',name:'Classic top',type:'top',color:'white',hex:'#f5f1e7',style:'classic',season:'all',available:true,notes:''},
  {id:'user-romantic-top',name:'Romantic top',type:'top',color:'pink',hex:'#c98989',style:'romantic',season:'all',available:true,notes:''},
  {id:'user-relaxed-top',name:'Relaxed top',type:'top',color:'blue',hex:'#6e8494',style:'relaxed',season:'all',available:true,notes:''},
  {id:'user-boots',name:'Boots',type:'boots',color:'black',hex:'#343634',style:'classic',season:'all',available:true,notes:''},
  {id:'user-sneakers',name:'Sneakers',type:'sneakers',color:'white',hex:'#f5f1e7',style:'relaxed',season:'all',available:true,notes:''},
  {id:'user-blazer',name:'Blazer',type:'layer',color:'black',hex:'#343634',style:'classic',season:'all',available:true,notes:''},
  {id:'user-bag',name:'Bag',type:'bag',color:'black',hex:'#343634',style:'classic',season:'all',available:true,notes:''}
]}`);
run("answers={occasionTheme:'business',occasion:'work',stylePreference:'none'}");
const businessOwned = run('previewItems().map(item=>item.id)');
run("answers={occasionTheme:'everyday',occasion:'everyday',stylePreference:'none'}");
const everydayOwned = run('previewItems().map(item=>item.id)');
assert(businessOwned.includes('user-classic-pants') && businessOwned.includes('user-classic-top') && businessOwned.includes('user-boots'));
assert(everydayOwned.includes('user-relaxed-pants') && everydayOwned.includes('user-relaxed-top') && everydayOwned.includes('user-sneakers'));
assert.notDeepEqual(businessOwned, everydayOwned, 'occasion should change an owned-closet suggestion when suitable pieces exist');

run("answers={occasionTheme:'business-casual',occasion:'work',stylePreference:'feminine'}");
const feminineTop = run("previewItems().find(item=>item.type==='top')?.id");
run("answers={occasionTheme:'business-casual',occasion:'work',stylePreference:'masculine'}");
const masculineTop = run("previewItems().find(item=>item.type==='top')?.id");
assert.equal(feminineTop, 'user-romantic-top');
assert.equal(masculineTop, 'user-classic-top');

run("photoCache.set('photo-fixture','data:image/jpeg;base64,AA==')");
const photoBoard = run("board([{id:'user-photo',name:'Photo item',type:'top',color:'blue',hex:'#6e8494',style:'relaxed',season:'all',available:true,notes:'',photoId:'photo-fixture'}])");
assert(photoBoard.includes('data-photo="photo-fixture"') && photoBoard.includes('garment-photo'), 'right-side composition must preserve user-photo rendering');
run('data=initial();answers={}');

for (const asset of ['blazer.png', 'watch.png', 'tote.png', 'cream-knit.png', 'charcoal-trousers.png', 'white-shirt.png', 'loafers.png', 'emerald-slip-dress.png', 'patterned-midi-skirt.png', 'rust-blazer.png', 'cobalt-hoodie.png', 'indigo-jeans.png', 'sport-leggings.png', 'chunky-sneakers.png', 'ankle-boots.png', 'crossbody-bag.png']) {
  const pngSize = fs.statSync('docs/assets/design3/' + asset).size;
  const webpSize = fs.statSync('docs/assets/design3/' + asset.replace(/\.png$/, '.webp')).size;
  assert(pngSize > 1000, asset + ' should be a non-empty local asset');
  assert(webpSize > 1000 && webpSize < pngSize, asset + ' should have a smaller WebP delivery copy');
}

console.log('PASS: editorial shell, rich right-side imagery, occasion/style-responsive suggestions, opt-in demo separation, truthful mappings, unchanged starter count, and local asset manifest.');
