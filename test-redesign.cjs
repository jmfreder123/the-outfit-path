const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const elements = new Map();
const listeners = new Map();
let pointTarget = null;
const element = key => elements.get(key) || elements.set(key, {
  innerHTML: '',
  textContent: '',
  classList: { add() {}, remove() {}, toggle() {} },
  addEventListener() {},
  focus() {},
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
    elementFromPoint() { return pointTarget; },
    addEventListener(type, handler, options) {
      const rows = listeners.get(type) || [];
      rows.push({handler, capture: options === true || options?.capture === true});
      listeners.set(type, rows);
    }
  },
  window: {}
};

vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('docs/app.js', 'utf8'), sandbox);
vm.runInContext(fs.readFileSync('docs/editorial.js', 'utf8'), sandbox);
const run = code => vm.runInContext(code, sandbox);
const dataKey = name => name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
const eventTarget = (dataset, options = {}) => ({
  dataset,
  disabled: false,
  classList: {add() {}, remove() {}},
  getAttribute(name) { return name === 'draggable' && dataset.outfitItem ? 'true' : null; },
  closest(selector) {
    if (selector === 'button') return options.button === false ? null : this;
    if (selector === '[data-outfit-item][draggable="true"]') return dataset.outfitItem ? this : null;
    return selector.split(',').some(part => {
      const trimmed = part.trim();
      const action = /^\[data-action="([^"]+)"\]$/.exec(trimmed);
      if (action) return dataset.action === action[1];
      const match = /^\[data-([a-z-]+)\]$/.exec(trimmed);
      return match ? dataset[dataKey(match[1])] !== undefined : false;
    }) ? this : null;
  }
});
const dispatch = (type, target, extra = {}) => {
  let stopped = false;
  const event = {target, preventDefault() {}, stopImmediatePropagation() { stopped = true; }, ...extra};
  const rows = listeners.get(type) || [];
  for (const row of [...rows.filter(row => row.capture), ...rows.filter(row => !row.capture)]) {
    if (stopped) break;
    row.handler(event);
  }
  return event;
};

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

const interactionMarkup = run('renderBuilder()');
assert(interactionMarkup.includes('Choose myself') && interactionMarkup.includes('Suggest a look') && interactionMarkup.includes('Mix & match'));
assert(interactionMarkup.includes('name="planning-date"') && interactionMarkup.includes('data-outfit-slot="shape"'));
assert(interactionMarkup.includes('data-close-wardrobe'));

dispatch('click', eventTarget({editorialMode:'manual'}));
dispatch('click', eventTarget({useItem:'starter-6'}));
assert.equal(run('previewItems().map(item=>item.id).join(",")'), 'starter-6', 'manual touch/keyboard action should place only the chosen piece');
dispatch('click', eventTarget({removeSlot:'shape'}));
assert.equal(run('previewItems().map(item=>item.id).join(",")'), '', 'manual remove should empty the chosen slot');

const dropTarget = eventTarget({outfitSlot:'shape'});
dispatch('drop', dropTarget, {dataTransfer:{getData(){return 'starter-6';}}});
assert.equal(run('previewItems().map(item=>item.id).join(",")'), 'starter-6', 'drop should place a compatible closet piece');
dispatch('drop', eventTarget({outfitSlot:'shoes'}), {dataTransfer:{getData(){return 'starter-15';}}});
assert(run('renderBuilder().includes("does not fit the shoes slot")'), 'invalid drop targets should explain the mismatch');

const pointerCard = eventTarget({outfitItem:'starter-15'}, {button:false});
pointTarget = eventTarget({outfitSlot:'top'}, {button:false});
dispatch('pointerdown', pointerCard, {pointerType:'mouse', clientX:10, clientY:10});
dispatch('pointerup', pointTarget, {pointerType:'mouse', clientX:20, clientY:20});
assert(run('previewItems().some(item=>item.id==="starter-15")'), 'pointer drag fallback should place a compatible closet piece');
pointTarget = null;

dispatch('click', eventTarget({editorialMode:'hybrid'}));
dispatch('click', eventTarget({useItem:'starter-15'}));
const hybridBefore = run('previewItems().map(item=>item.id)');
dispatch('change', {name:'editorial-occasion', value:'evening'});
const hybridAfter = run('previewItems().map(item=>item.id)');
assert(hybridBefore.includes('starter-15') && hybridAfter.includes('starter-15'), 'hybrid changes must preserve chosen locked pieces');

run("answers={occasionTheme:'sporty',occasion:'weekend',stylePreference:'feminine'}");
dispatch('click', eventTarget({editorialMode:'suggest'}));
const sportyBefore = run('previewItems().map(item=>item.id).join(",")');
dispatch('change', {name:'editorial-style', value:'masculine'});
const sportyAfter = run('previewItems().map(item=>item.id).join(",")');
assert.equal(sportyBefore, sportyAfter, 'limited Sporty source should not fabricate a different outfit');
assert(run('renderBuilder().includes("No different suitable Masculine pieces are available")'), 'unchanged style direction should be explained');

dispatch('click', eventTarget({closeWardrobe:true}));
assert(run('renderBuilder().includes("wardrobe-closed")') && run('renderBuilder().includes("Open wardrobe")'));
dispatch('keydown', {closest(){return null;}}, {key:'Escape'});
dispatch('click', eventTarget({openWardrobe:true}));
assert(!run('renderBuilder().includes("wardrobe-closed")'));

const initialDate = /name="planning-date" value="([^"]+)"/.exec(run('renderBuilder()'))[1];
const lookCountBeforeDateNavigation = run('data.looks.length');
dispatch('click', eventTarget({dateShift:'-1'}));
const previousDate = /name="planning-date" value="([^"]+)"/.exec(run('renderBuilder()'))[1];
assert.notEqual(previousDate, initialDate, 'previous-day navigation should use another local calendar date');
assert.equal(run('data.looks.length'), lookCountBeforeDateNavigation, 'date navigation must not save or overwrite looks');
dispatch('click', eventTarget({dateToday:true}));
assert.equal(/name="planning-date" value="([^"]+)"/.exec(run('renderBuilder()'))[1], initialDate);

const savedAnswers = {shape:'pants',shoes:'boots',occasion:'work',weather:'mild',mood:'classic',finish:'minimal'};
run(`data.looks=[
  {id:'dated-1',items:[data.items[6],data.items[15],data.items[20]],answers:${JSON.stringify(savedAnswers)},created:'2026-10-24T12:00:00.000Z',plannedDate:'${initialDate}',rating:null,name:'First dated look'},
  {id:'dated-2',items:[data.items[6],data.items[15],data.items[20]],answers:${JSON.stringify(savedAnswers)},created:'2026-10-24T13:00:00.000Z',plannedDate:'${initialDate}',rating:null,name:'Second dated look'},
  {id:'legacy-undated',items:[data.items[6],data.items[15],data.items[20]],answers:${JSON.stringify(savedAnswers)},created:'2026-09-01T12:00:00.000Z',rating:null,name:'Undated legacy look'}
]`);
const datedLookbook = run('renderLooks()');
assert(datedLookbook.includes('2 saved looks') && datedLookbook.includes('Earlier saved looks'));
assert(datedLookbook.includes('First dated look') && datedLookbook.includes('Second dated look') && datedLookbook.includes('Undated legacy look'));
dispatch('click', eventTarget({dateShift:'1'}));
const nextDayLookbook = run('renderLooks()');
assert(nextDayLookbook.includes('No saved looks for this day') && nextDayLookbook.includes('Undated legacy look'), 'legacy undated looks must remain visible without guessed dates');
run('data=initial();answers={}');

assert(/draggable="\$\{item\.available\}"/.test(editorialSource), 'closet cards should expose native drag sources');
assert(editorialSource.includes("document.addEventListener('drop'"));
assert(!editorialSource.includes("toISOString().slice(0, 10)"), 'planner dates must not be derived from UTC slicing');
assert(editorialSource.includes('resetEditorialSessionState') && editorialSource.includes('outfitPathCloud.switchScope'), 'account switches must clear unsaved manual/hybrid state');

for (const asset of ['blazer.png', 'watch.png', 'tote.png', 'cream-knit.png', 'charcoal-trousers.png', 'white-shirt.png', 'loafers.png', 'emerald-slip-dress.png', 'patterned-midi-skirt.png', 'rust-blazer.png', 'cobalt-hoodie.png', 'indigo-jeans.png', 'sport-leggings.png', 'chunky-sneakers.png', 'ankle-boots.png', 'crossbody-bag.png']) {
  const pngSize = fs.statSync('docs/assets/design3/' + asset).size;
  const webpSize = fs.statSync('docs/assets/design3/' + asset.replace(/\.png$/, '.webp')).size;
  assert(pngSize > 1000, asset + ' should be a non-empty local asset');
  assert(webpSize > 1000 && webpSize < pngSize, asset + ' should have a smaller WebP delivery copy');
}

console.log('PASS: editorial shell, truthful style feedback, manual/drag/hybrid controls, panel close, local-date navigation, rich imagery, opt-in demo separation, and local asset manifest.');
