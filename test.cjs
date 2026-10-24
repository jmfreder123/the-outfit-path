const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map();const el=key=>elements.get(key)||elements.set(key,{innerHTML:'',textContent:'',classList:{add(){},remove(){},toggle(){}},addEventListener(){},showModal(){this.open=true},close(){this.open=false}}).get(key);
const sandbox={console,crypto:require('node:crypto').webcrypto,setTimeout,clearTimeout,localStorage:{getItem(){return null},setItem(){}},document:{querySelector:el,querySelectorAll(){return []},addEventListener(){}},window:{}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('docs/app.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('docs/scanner.js','utf8'),sandbox);const run=code=>vm.runInContext(code,sandbox);
assert.equal(run('data.items.length'),42);
let paths=0;
for(const shape of ['skirt','pants','dress','surprise'])for(const shoes of ['boots','heels','flats','sneakers','sandals','any'])for(const weather of ['cool','mild','warm','rain']){
let r=run(`generate({shape:'${shape}',shoes:'${shoes}',occasion:'work',weather:'${weather}',mood:'classic',palette:'neutral',finish:'balanced'})`);assert(r);assert(r.items.every(i=>i.available));if(shape!=='surprise')assert(r.items.some(i=>i.type===shape));if(shoes!=='any')assert(r.items.some(i=>i.type===shoes));assert.equal(r.items.filter(i=>['skirt','pants','dress'].includes(i.type)).length,1);if(r.items.some(i=>i.type==='dress'))assert(!r.items.some(i=>i.type==='top'));else assert(r.items.some(i=>i.type==='top'));if(['cool','rain'].includes(weather))assert(r.items.some(i=>i.type==='layer'));paths++;
}
run("data.items.find(i=>i.id==='starter-0').available=false");for(let i=0;i<20;i++)assert(!run("generate({shape:'skirt',shoes:'boots',occasion:'everyday',weather:'mild',mood:'romantic',finish:'minimal'}).items.some(i=>i.id==='starter-0')"));
run("data.items.filter(i=>i.type==='boots').forEach(i=>i.available=false)");assert.equal(run("generate({shape:'skirt',shoes:'boots'})"),null);run('data=initial()');
run("var testA={shape:'pants',shoes:'sneakers',occasion:'everyday',weather:'mild',mood:'relaxed',palette:'neutral',finish:'minimal'}; var testLook=generate(testA); var f=features(testLook.items,testA); var before=predict(f); data.ratings=[{id:'test-rating',y:1,features:f}]; train();");assert(run('predict(f)>before'));run('data.ratings[0].y=0;train()');assert(run('predict(f)<before'));run('data.learning=false');assert.equal(run('modelScore(testLook.items,testA)'),.5);
assert(run('validateBackup(JSON.parse(JSON.stringify(data))).items.length')===42);
assert.throws(()=>run("validateBackup({...initial(),items:[{...seed()[0],hex:'red;bad'}]})"));assert.throws(()=>run("validateBackup({...initial(),items:[{...seed()[0],id:'\" onclick=\"bad'}]})"));
run('data=initial();result=generate(testA)');assert(run('renderResult().includes("From your closet")'));run('result=null');for(let s=0;s<6;s++)assert(run(`step=${s};renderBuilder().length`)>1000);assert(run('renderLooks().includes("Your favorites")'));assert(run('renderLearn().includes("logistic regression")'));assert(run('renderCloset().includes("42 total")'));
console.log(`PASS: ${paths} decision paths; unavailable/missing garments; required outfit pieces; positive and negative ML updates; learning pause; backup validation; all screen rendering.`);

assert.equal(run('nearestColor(180,25,25)'), 'red');
assert.equal(run('nearestColor(245,245,245)'), 'white');
assert.equal(run('nearestColor(25,25,25)'), 'black');
assert.equal(run('nearestColor(25,35,85)'), 'navy');
assert.throws(()=>run("validatePhotos({photos:{bad:'javascript:alert(1)'}})"));
assert.throws(()=>run("validatePhotos({items:[{photoId:'missing'}],photos:{}})"));
assert(run("validatePhotos({items:[{photoId:'valid'}],photos:{valid:'data:image/jpeg;base64,YWJj'}}).valid"));
assert(run("garmentArt({...seed()[0],photoId:'not-loaded'}).includes('data-photo')"));
console.log('PASS: scanner color mapping, photo backup validation, missing-photo rejection, and image rendering fallback.');
