// Suggest: whole-outfit local rules. Pins never change, optional roles are
// added only when they suit the occasion, alternatives stay close to the best
// match, and hidden questionnaire answers do not bias ranking.
const fs = require("node:fs"),
  vm = require("node:vm"),
  assert = require("node:assert/strict");

const el = () => ({
  innerHTML: "",
  textContent: "",
  open: false,
  classList: { add() {}, toggle() {}, remove() {} },
  focus() {},
  showModal() {},
  close() {},
});
const elements = new Map();
const listeners = new Map();
let writes = 0;
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
      writes++;
    },
  },
  window: { addEventListener() {} },
  document: {
    body: { classList: { add() {} } },
    querySelector: (k) => elements.get(k) || elements.set(k, el()).get(k),
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
let src = fs.readFileSync("docs/editorial.js", "utf8");
// Test-only observation interface; no testing hooks ship in the application.
src = src.replace(
  /\}\)\(\);\s*$/,
  `window.qa={state:()=>clone({draft,notice}),reset:resetSession,answers:(o)=>Object.assign(draft.answers,o)};})();`,
);
vm.runInContext(src, sandbox);
const run = (s) => vm.runInContext(s, sandbox);
const state = () => JSON.parse(JSON.stringify(sandbox.window.qa.state()));
const ids = () => state().draft.items.map((i) => i.id);
const types = () => state().draft.items.map((i) => i.type);
function click(dataset) {
  let stop = false;
  const target = {
    dataset,
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
  const rows = listeners.get("click");
  for (const r of [...rows.filter((r) => r.c), ...rows.filter((r) => !r.c)]) {
    if (stop) break;
    r.h(e);
  }
}
function change(name, value) {
  for (const r of listeners.get("change") || []) r.h({ target: { name, value } });
}
function fresh(occasion) {
  click({ day: "7" });
  change("simple-occasion", occasion);
}
click({ wardrobeSource: "sample" });

// Optional roles follow the occasion.
fresh("sporty");
click({ suggest: "" });
assert(!types().some((t) => ["layer", "bag", "jewelry"].includes(t)), "sporty adds no layer, bag or jewellery");
assert(types().includes("sneakers"));
fresh("business");
click({ suggest: "" });
assert(types().includes("layer"), "business adds a layer");
assert(types().includes("bag"), "business adds a bag");
assert(!types().includes("sneakers"), "no trainers for business");
assert(!ids().includes("demo-black-sport-leggings"), "no activewear for business");

// A pinned dress keeps its place and gets suitable shoes for the evening.
fresh("evening");
click({ selectPiece: "demo-emerald-slip-dress" });
click({ suggest: "" });
assert(ids().includes("demo-emerald-slip-dress"));
assert(!types().includes("top") && !types().some((t) => ["skirt", "pants"].includes(t)), "a pinned dress is not mixed with separates");
assert(types().some((t) => ["flats", "boots", "heels"].includes(t)), "evening shoes, not trainers");

// Pins never change across repeated suggestions.
fresh("everyday");
click({ selectPiece: "demo-patterned-midi-skirt" });
for (let k = 0; k < 5; k++) {
  click({ suggest: "" });
  assert(ids().includes("demo-patterned-midi-skirt"));
  assert(state().draft.pins.includes("demo-patterned-midi-skirt"));
}
// A print is paired with a plain top rather than a second statement colour.
const top = state().draft.items.find((i) => i.type === "top");
assert(top && top.id !== "demo-cobalt-hoodie", "floral skirt not paired with the cobalt hoodie");

// Repeated Suggest offers a different outfit when a close one exists, and
// says so plainly when none does.
fresh("business");
click({ suggest: "" });
const first = ids().join();
click({ suggest: "" });
assert.notEqual(ids().join(), first, "business has a close alternative");
fresh("sporty");
click({ suggest: "" });
const sporty = ids().join();
click({ suggest: "" });
assert.equal(ids().join(), sporty, "no weaker outfit offered just to be different");
assert(state().notice.includes("already the best match for Sporty"));

// Hidden questionnaire answers (mood, palette) do not change suggestions.
fresh("everyday");
click({ suggest: "" });
const plain = ids().join();
fresh("everyday");
sandbox.window.qa.answers({ mood: "romantic", palette: "color" });
click({ suggest: "" });
assert.equal(ids().join(), plain, "mood and palette are not used");

// A person's own pieces carry no occasion tags and are never filtered out.
sandbox.window.qa.reset();
run(
  `data.items=[{...seed()[5],id:'own-jeans',ownedCopy:true},{...seed()[13],id:'own-top',ownedCopy:true},{...seed()[27],id:'own-shoe',ownedCopy:true}]`,
);
click({ wardrobeSource: "owned" });
for (const occasion of ["business", "evening", "sporty"]) {
  fresh(occasion);
  click({ suggest: "" });
  assert.deepEqual(ids().sort(), ["own-jeans", "own-shoe", "own-top"], `own pieces used for ${occasion}`);
}
assert.equal(writes, 0, "suggesting never writes storage");
console.log(
  "PASS: optional roles by occasion; pinned dress with suitable shoes; pins kept; print not paired with a statement colour; close alternatives or a plain notice; hidden answers ignored; own pieces never filtered; no writes.",
);
