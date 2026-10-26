// Closet page: empty state, pieces with photos or drawings, escaping, group
// filters and search, the note about old example pieces, and availability
// changes that are undone if saving fails.
const fs = require("node:fs"),
  vm = require("node:vm"),
  assert = require("node:assert/strict");

let writes = 0, fail = false;
const elements = new Map(), listeners = new Map();
const el = (k) =>
  elements.get(k) ||
  elements.set(k, {
    innerHTML: "",
    textContent: "",
    open: false,
    classList: { add() {}, toggle() {}, remove() {} },
    focus() {},
    addEventListener() {},
    showModal() {
      this.open = true;
    },
    close() {
      this.open = false;
    },
  }).get(k);
const sandbox = {
  console,
  crypto: require("node:crypto").webcrypto,
  queueMicrotask,
  Date,
  setTimeout,
  clearTimeout,
  localStorage: {
    getItem() {
      return null;
    },
    setItem() {
      if (fail) throw Error("full");
      writes++;
    },
    removeItem() {},
  },
  window: { addEventListener() {} },
  document: {
    body: { classList: { add() {} } },
    querySelector: el,
    querySelectorAll() {
      return [];
    },
    addEventListener(t, h, o) {
      const rows = listeners.get(t) || [];
      rows.push({ h, c: o === true });
      listeners.set(t, rows);
    },
  },
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync("docs/app.js", "utf8"), sandbox);
vm.runInContext(fs.readFileSync("docs/editorial.js", "utf8"), sandbox);
vm.runInContext(fs.readFileSync("docs/closet.js", "utf8"), sandbox);
const run = (s) => vm.runInContext(s, sandbox);
const main = () => el("#main").innerHTML;
function click(dataset) {
  let stop = false;
  const target = {
    dataset,
    disabled: false,
    closest(s) {
      return s === "button" ? this : null;
    },
  };
  const e = {
    target,
    preventDefault() {},
    stopImmediatePropagation() {
      stop = true;
    },
  };
  const rows = listeners.get("click") || [];
  for (const r of [...rows.filter((r) => r.c), ...rows.filter((r) => !r.c)]) {
    if (stop) break;
    r.h(e);
  }
}

// Loads after editorial.js and before the scanner.
const gate = fs.readFileSync("docs/age-gate.js", "utf8");
assert(gate.indexOf("'editorial.js'") < gate.indexOf("'closet.js'") && gate.indexOf("'closet.js'") < gate.indexOf("'scanner.js'"));

// Empty closet: plain instructions and both ways to add.
click({ view: "closet" });
assert.equal(run("view"), "closet");
let html = main();
assert(html.includes("<h1>Closet</h1>"));
assert(html.includes("Your closet is empty"));
assert(html.includes('data-action="scan"') && html.includes('data-action="additem"'));
assert(html.includes("open Plan and choose Samples"));
assert(!html.includes("Image unavailable"));

// Pieces: a photo, drawings in their own color, one not available.
run(`photoCache.set('ph1','data:image/jpeg;base64,AAAA');
data.items=[
 {id:'a1',name:'<b>Shirt</b>',type:'top',color:'white',hex:'#f5f1e7',style:'classic',season:'all',available:true,notes:'',photoId:'ph1'},
 {id:'a2',name:'Rust sweater',type:'top',color:'red',hex:'#b4503e',style:'relaxed',season:'cool',available:true,notes:''},
 {id:'a3',name:'Black boots',type:'boots',color:'black',hex:'#343634',style:'bold',season:'all',available:true,notes:''},
 {id:'a4',name:'Green dress',type:'dress',color:'green',hex:'#4f6b4f',style:'romantic',season:'warm',available:false,notes:''}];
render();`);
html = main();
assert.equal((html.match(/class="closet-card/g) || []).length, 4);
assert(html.includes("data:image/jpeg;base64,AAAA"), "photo shown");
assert.equal((html.match(/drawn-piece/g) || []).length, 3, "pieces without photos are drawn");
assert(html.includes("#b4503e"), "drawn in the piece's own color");
assert(!html.includes("<b>Shirt</b>") && html.includes("&lt;b&gt;Shirt&lt;/b&gt;"), "names are escaped");
assert(html.includes("4 pieces · 3 available"));
assert(html.includes('closet-card is-away') && html.includes("Not available"));
assert(html.includes("Red · Top") && html.includes("Black · Boots"));
assert(!html.includes("closet-examples"), "no examples note without old examples");

// Group filters and search.
click({ closetGroup: "tops" });
assert.equal((main().match(/class="closet-card/g) || []).length, 2);
click({ closetGroup: "shoes" });
assert.equal((main().match(/class="closet-card/g) || []).length, 1);
click({ closetGroup: "nonsense" });
assert.equal((main().match(/class="closet-card/g) || []).length, 4, "unknown group shows all");
run("search='rust'; render()");
assert.equal((main().match(/class="closet-card/g) || []).length, 1);
run("search='zzz'; render()");
assert(main().includes("No pieces match"));
click({ closetGroup: "all", closetClear: "" });
assert.equal(run("search"), "");
assert.equal((main().match(/class="closet-card/g) || []).length, 4);

// Availability: saved, or undone if saving fails.
const w0 = writes;
click({ toggle: "a2" });
assert.equal(run("data.items.find(i=>i.id==='a2').available"), false);
assert.equal(writes, w0 + 1);
fail = true;
click({ toggle: "a2" });
fail = false;
assert.equal(run("data.items.find(i=>i.id==='a2').available"), false, "failed save undone");
assert.equal(el("#toast").textContent, "This change could not be saved. Nothing was changed.");

// Old example pieces: explained, with the confirmed remove action.
run("data.items=[...data.items,...seed().slice(0,3)]; render()");
html = main();
assert(html.includes("3 example pieces from an earlier version of the app are still in this closet"));
assert(html.includes("data-remove-examples"));
click({ removeExamples: "" });
assert(el("#modal-body").innerHTML.includes("This removes 3 example pieces"));
click({ confirmRemoveExamples: "" });
assert.equal(run("data.items.length"), 4);
assert(!main().includes("closet-examples"));
console.log(
  "PASS: Closet empty state; photos, drawings and not-available pieces; escaped names; group filters and search; availability saved or undone; old examples explained and removable.",
);
