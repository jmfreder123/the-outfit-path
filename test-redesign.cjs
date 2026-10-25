const fs = require("node:fs"),
  vm = require("node:vm"),
  assert = require("node:assert/strict");
const elements = new Map(), listeners = new Map();
let writes = 0, fail = false;
const el = (k) =>
  elements.get(k) ||
  elements.set(k, {
    innerHTML: "",
    textContent: "",
    open: false,
    classList: { add() {}, toggle() {}, remove() {} },
    focus() {},
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
  FormData: class {
    constructor(form) {
      this.form = form;
    }
    get() {
      return this.form.value;
    }
  },
  localStorage: {
    getItem() {
      return null;
    },
    setItem() {
      if (fail) throw Error("full");
      writes++;
    },
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
// Test-only observation interface; no testing hooks ship in the application.
let src = fs.readFileSync("docs/editorial.js", "utf8");
src = src.replace(
  /\}\)\(\);\s*$/,
  `window.qa={state:()=>clone({draft,planningDate,source,pendingReplacement}),select:selectItem,suggest,nav:navigateDate,source:s=>{remember();source=s;draft=clone(drafts.get(draftKey())||fresh());},open:openSaved,reset:resetSession,date:localDateKey,shift:shiftDate};})();`,
);
vm.runInContext(src, sandbox);
const run = (s) => vm.runInContext(s, sandbox),
  state = () => JSON.parse(JSON.stringify(sandbox.window.qa.state()));
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
  for (const r of listeners.get("change") || []) {
    r.h({ target: { name, value } });
  }
}
function submit(name) {
  let stop = false;
  for (
    const r of [
      ...listeners.get("submit").filter((r) => r.c),
      ...listeners.get("submit").filter((r) => !r.c),
    ]
  ) {
    if (stop) break;
    r.h({
      target: { id: "simple-look-form", value: name },
      preventDefault() {},
      stopImmediatePropagation() {
        stop = true;
      },
    });
  }
}
assert.equal(run("data.items.length"), 42);
assert.equal(state().draft.items.length, 0);
assert(run('renderBuilder().includes("My wardrobe")'));
assert(!run('renderBuilder().includes("draggable")'));
assert(!run('renderBuilder().includes("data-outfit-slot")'));
assert(!run('renderBuilder().includes("Choose myself")'));
run("data.items[0].name='User customized skirt'");
assert(run('renderBuilder().includes("User customized skirt")'));
run("data=initial()");
// Explicit sample source is separate and never imported.
change("simple-source", "sample");
click({ selectPiece: "demo-emerald-slip-dress" });
click({ suggest: "" });
assert(state().draft.items.some((i) => i.type === "dress"));
assert(
  state().draft.items.some((i) =>
    ["sneakers", "boots", "flats"].includes(i.type)
  ),
);
assert.equal(run("data.items.length"), 42);
assert.equal(writes, 0);
assert(run('renderBuilder().includes("data-save-draft disabled")'));
change("simple-source", "owned");
assert.equal(state().draft.items.length, 0);
run(
  `data.items=[{...seed()[15],id:'top-a'},{...seed()[13],id:'top-b'},{...seed()[6],id:'pants-a'},{...seed()[5],id:'pants-b'},{...seed()[8],id:'dress-a'},{...seed()[11],id:'dress-b'},{...seed()[20],id:'shoe-a'},{...seed()[27],id:'shoe-b'},{...seed()[33],id:'layer-a'},{...seed()[36],id:'bag-a'},{...seed()[39],id:'jewelry-a'}]`,
);
click({ selectPiece: "top-a" });
assert.deepEqual(state().draft.pins, ["top-a"]);
click({ selectPiece: "top-a" });
assert.equal(state().draft.items.length, 1);
click({ suggest: "" });
assert(state().draft.items.some((i) => i.id === "top-a"));
assert(state().draft.items.some((i) => i.type === "pants"));
assert(!state().draft.items.some((i) => i.type === "dress"));
click({ pinPiece: "top-a" });
assert(state().draft.items.some((i) => i.id === "top-a"));
assert(!state().draft.pins.includes("top-a"));
click({ suggest: "" });
assert(state().draft.items.some((i) => i.id === "top-b"));
click({ selectPiece: "top-b" });
click({ selectPiece: "dress-a" });
assert(state().pendingReplacement);
const before = state().draft;
click({ cancelReplace: "" });
assert.deepEqual(state().draft, before);
click({ selectPiece: "dress-a" });
click({ confirmReplace: "" });
assert(
  !state().draft.items.some((i) => i.type === "top" || i.type === "pants"),
);
assert(state().draft.pins.includes("dress-a"));
click({ selectPiece: "pants-a" });
assert(state().pendingReplacement);
click({ confirmReplace: "" });
assert(!state().draft.items.some((i) => i.type === "dress"));
assert(state().draft.items.some((i) => i.id === "pants-a"));
click({ removePiece: "pants-a" });
assert(!state().draft.items.some((i) => i.id === "pants-a"));
assert.equal(run("data.items.length"), 11);
const ids = () => state().draft.items.map((i) => i.id);
const old = ids();
for (const style of ["feminine", "masculine", "androgynous", "none"]) {
  change("simple-style", style);
  assert.deepEqual(ids(), old);
}
for (
  const occasion of [
    "business",
    "business-casual",
    "everyday",
    "evening",
    "sporty",
    "streetwear",
  ]
) {
  change("simple-occasion", occasion);
  assert.deepEqual(ids(), old);
}
// Each style reaches ranking; never gates access or writes preferences durably.
const scores = [];
for (const style of ["feminine", "masculine", "androgynous"]) {
  scores.push(
    run(
      `pieceScore(data.items.find(i=>i.id==='dress-b'),{...answers,stylePreference:'${style}'})`,
    ),
  );
}
assert(new Set(scores).size > 1);
const dayA = state().planningDate, draftA = state().draft;
click({ day: "1" });
assert.equal(state().draft.items.length, 0);
click({ selectPiece: "shoe-a" });
const dayB = state().planningDate;
click({ day: "-1" });
assert.deepEqual(state().draft, draftA);
click({ day: "1" });
assert.deepEqual(ids(), ["shoe-a"]);
assert.equal(writes, 0);
// Partial save, rollback on failure, and duplicate submissions.
click({ saveDraft: "" });
fail = true;
submit("Partial fixture");
assert.equal(run("data.looks.length"), 0);
assert(state().draft.dirty);
fail = false;
submit("Partial fixture");
assert.equal(run("data.looks.length"), 1);
assert(state().draft.readOnly);
submit("Duplicate");
assert.equal(run("data.looks.length"), 1);
const saved = run("data.looks[0].id");
click({ selectPiece: "top-a" });
assert.deepEqual(ids(), ["shoe-a"]);
click({ editSaved: "" });
click({ selectPiece: "top-a" });
assert.equal(run("data.looks[0].items.length"), 1);
click({ saveDraft: "" });
submit("Updated fixture");
assert.equal(run("data.looks.length"), 1);
assert.equal(run("data.looks[0].id"), saved);
assert.equal(run("data.looks[0].items.length"), 2);
assert.equal(run("data.looks[0].plannedDate"), dayB);
click({ newDraft: "" });
click({ selectPiece: "shoe-b" });
click({ saveDraft: "" });
submit("Second look same date");
assert.equal(run("data.looks.length"), 2);
assert.equal(run("data.looks[1].plannedDate"), dayB);
assert.notEqual(run("data.looks[1].id"), saved);
click({ newDraft: "" });
click({ selectPiece: "top-a" });
click({ saveDraft: "" });
click({ day: "1" });
submit("Stale modal");
assert.equal(
  run("data.looks.length"),
  2,
  "stale save modal cannot save a different day",
);
click({ day: "-1" });
click({ openlook: saved });
assert(el("#modal-body").innerHTML.includes("Keep your unsaved draft"));
click({ discardOpen: saved });
assert(state().draft.readOnly);
// Legacy undated data remains undated through explicit edit and update.
run(`data.looks.push({...data.looks[0],id:'legacy',plannedDate:undefined})`);
click({ openlook: "legacy" });
assert(state().draft.readOnly);
click({ editSaved: "" });
click({ saveDraft: "" });
submit("Undated");
assert.equal(run('data.looks.find(l=>l.id==="legacy").plannedDate'), undefined);
assert.equal(sandbox.window.qa.shift("2026-12-31", 1), "2027-01-01");
assert.equal(sandbox.window.qa.shift("2026-03-08", 1), "2026-03-09");
// Photo rendering uses accepted user photo, never a catalog substitution.
run(`photoCache.set('photo-fixture','data:image/png;base64,fixture')`);
assert(
  run(
    `garmentArt({...data.items[0],photoId:'photo-fixture'}).includes('data:image/png;base64,fixture')`,
  ),
);
assert(run(`garmentArt(data.items[0]).includes('Image unavailable')`));
assert(
  run(
    `garmentArt({...seed()[20],color:'pink',hex:'#c98989'}).includes('Image unavailable')`,
  ),
  "modified real item must not borrow mismatching catalog photo",
);
const savedData = run("JSON.stringify(data)");
sandbox.window.qa.reset();
assert.equal(state().draft.items.length, 0);
assert.equal(run("JSON.stringify(data)"), savedData);
assert(!src.includes("addEventListener('drag"));
console.log(
  "PASS: tap/pin/unpin/remove; confirmed conflicts; pinned completion; source isolation; no implicit preference writes; dated draft round trips; save failure/retry/update/read-only; undated retention; local dates; image parity; account draft reset.",
);
