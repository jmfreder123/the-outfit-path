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
  `window.qa={state:()=>clone({draft,planningDate,source,pendingReplacement,boardMenu,notice}),sample:(id)=>clone(samples().find((i)=>i.id===id)),layout:(items)=>flatLayout(items).map((p)=>({id:p.item.id,x:p.x,y:p.y,w:p.s.w,h:p.s.h})),swap:swapItem,week:weekDays,select:selectItem,suggest,nav:navigateDate,source:s=>{remember();source=s;draft=clone(drafts.get(draftKey())||fresh());},open:openSaved,reset:resetSession,date:localDateKey,shift:shiftDate};})();`,
);
vm.runInContext(src, sandbox);
const run = (s) => vm.runInContext(s, sandbox),
  state = () => JSON.parse(JSON.stringify(sandbox.window.qa.state()));
// inside: classes of ancestors the clicked button sits in, e.g. ".flatlay-menu".
function click(dataset, inside = []) {
  let stop = false;
  const target = {
    dataset,
    closest(s) {
      if (s === "button") return this;
      return s.split(",").some((x) => inside.includes(x.trim())) ? this : null;
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
assert.equal(
  state().source,
  "sample",
  "empty owned wardrobe immediately discovers samples",
);
assert(run('renderBuilder().includes("Sample wardrobe <span>16</span>")'));
assert(!run('renderBuilder().includes("mannequin.svg")'), "rejected mannequin is not shown");
assert(run('renderBuilder().includes("Your outfit will appear here.")'));
assert.equal(
  (run("renderBuilder()").match(/data-select-piece=/g) || []).length,
  16,
);
assert.equal(writes, 0);
assert(!run('renderBuilder().includes("draggable")'));
assert(!run('renderBuilder().includes("data-outfit-slot")'));
assert(!run('renderBuilder().includes("Choose myself")'));
run("data.items[0].name='User customized skirt'");
click({ wardrobeSource: "owned" });
assert(run('renderBuilder().includes("User customized skirt")'));
run("data=initial()");
// Explicit sample source is separate and never imported.
click({ wardrobeSource: "sample" });
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
click({ wardrobeSource: "owned" });
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
run("renderBuilder()");
assert.equal(
  state().source,
  "owned",
  "existing personal pieces remain the default",
);
assert.equal(run("JSON.stringify(data)"), savedData);
for (
  const path of [...src.matchAll(/assets\/design3\/[a-z-]+\.png/g)].map((m) =>
    m[0]
  )
) assert(fs.existsSync("docs/" + path));
assert(!src.includes("addEventListener('drag"));
// Week strip: Monday-first weeks, day taps keep per-date drafts and never save.
{
  const week = (k) => JSON.parse(JSON.stringify(sandbox.window.qa.week(k)));
  assert.deepEqual(week("2026-10-25"), ["2026-10-19","2026-10-20","2026-10-21","2026-10-22","2026-10-23","2026-10-24","2026-10-25"], "Sunday belongs to the week starting Monday");
  assert.equal(week("2026-10-19")[0], "2026-10-19");
  assert.deepEqual([week("2027-01-01")[0], week("2027-01-01")[6]], ["2026-12-28", "2027-01-03"], "weeks cross year boundaries");
  assert.deepEqual([week("2026-03-01")[0], week("2026-03-01")[6]], ["2026-02-23", "2026-03-01"]);
  sandbox.window.qa.reset();
  click({ wardrobeSource: "sample" });
  const today = state().planningDate;
  let html = run("renderBuilder()");
  assert.equal((html.match(/data-goto-date=/g) || []).length, 7);
  assert(html.includes(`data-goto-date="${today}"`) && html.includes('aria-current="date"'));
  assert(!html.includes("data-today"), "Today button hidden when already on today");
  const before = writes;
  click({ selectPiece: "demo-cream-merino-knit" });
  const other = week(today).find((k) => k !== today);
  click({ gotoDate: other });
  assert.equal(state().planningDate, other);
  assert.equal(state().draft.items.length, 0, "another day starts with its own empty draft");
  assert(run("renderBuilder()").includes("data-today"), "Today button shown away from today");
  click({ day: "7" });
  assert.equal(state().planningDate, sandbox.window.qa.shift(other, 7), "next week keeps the weekday");
  click({ today: "" });
  assert.equal(state().planningDate, today);
  assert.deepEqual(state().draft.items.map((i) => i.id), ["demo-cream-merino-knit"], "returning restores the draft");
  assert.equal(writes, before, "day navigation never saves");
  run(`data.looks.push({id:'week-dot',name:'Dot',plannedDate:'${other}',items:[],answers:{}})`);
  html = run("renderBuilder()");
  const dayButton = html.match(new RegExp(`<button[^>]*data-goto-date="${other}"[^>]*>.*?</button>`))[0];
  assert(dayButton.includes("has a saved look") && dayButton.includes('class="saved"'), "saved look marked on its day");
  run("data.looks=data.looks.filter(l=>l.id!=='week-dot')");
  sandbox.window.qa.reset();
}

// Flat-lay board: body order, real-world scale, piece menu, swap.
{
  const L = sandbox.window.qa.layout(run(`[
    window.qa.sample('demo-cream-merino-knit'),
    window.qa.sample('demo-indigo-jeans'),
    window.qa.sample('demo-rust-blazer'),
    window.qa.sample('demo-brown-leather-loafers'),
    window.qa.sample('demo-black-crossbody'),
  ]`));
  const at = (id) => L.find((p) => p.id === id);
  assert.equal(L.length, 5);
  assert(at("demo-cream-merino-knit").y < at("demo-indigo-jeans").y, "top above bottom");
  assert(at("demo-brown-leather-loafers").y > at("demo-cream-merino-knit").y, "shoes below top");
  assert(at("demo-rust-blazer").x < at("demo-cream-merino-knit").x, "layer set to the left");
  assert(at("demo-black-crossbody").x > at("demo-cream-merino-knit").x, "bag set to the right");
  const skirt = sandbox.window.qa.layout(run("[window.qa.sample('demo-patterned-midi-skirt')]"))[0];
  assert(at("demo-indigo-jeans").h > skirt.h + 15, "jeans drawn longer than a midi skirt");
  const dressOnly = sandbox.window.qa.layout(run("[window.qa.sample('demo-emerald-slip-dress'),window.qa.sample('demo-off-white-chunky-sneakers')]"));
  assert.equal(dressOnly.length, 2, "a dress with shoes lays out without separates");
  assert.equal(sandbox.window.qa.layout([]).length, 0);
}
{
  sandbox.window.qa.reset();
  click({ wardrobeSource: "sample" });
  for (const id of ["demo-cream-merino-knit", "demo-indigo-jeans", "demo-rust-blazer", "demo-brown-leather-loafers"]) {
    click({ selectPiece: id });
  }
  const before = writes;
  let html = run("renderBuilder()");
  assert.equal((html.match(/data-board-piece=/g) || []).length, 4);
  assert(!html.includes("flatlay-pin"), "no pin marks on the board; pin state is in the menu and list");
  assert(!html.includes("flatlay-menu"));
  click({ boardPiece: "demo-rust-blazer" }, [".flatlay-piece"]);
  assert.equal(state().boardMenu, "demo-rust-blazer");
  html = run("renderBuilder()");
  assert(html.includes('id="piece-menu-title">Rust tailored blazer<'));
  assert(html.includes('data-board-piece="demo-rust-blazer" aria-label="Rust tailored blazer, pinned. Options" aria-haspopup="true" aria-expanded="true"'));
  click({ pinPiece: "demo-rust-blazer" }, [".flatlay-menu"]);
  assert(!state().draft.pins.includes("demo-rust-blazer"), "Unpin from the menu");
  assert(state().draft.items.some((i) => i.id === "demo-rust-blazer"), "Unpin keeps the piece");
  assert.equal(state().boardMenu, "demo-rust-blazer", "menu stays open after Unpin");
  for (const r of listeners.get("keydown")) r.h({ key: "Escape" });
  assert.equal(state().boardMenu, null, "Escape closes the menu");
  // Swap keeps the pin state and changes only that piece.
  const others = state().draft.items.filter((i) => i.id !== "demo-cream-merino-knit").map((i) => i.id);
  click({ boardPiece: "demo-cream-merino-knit" }, [".flatlay-piece"]);
  click({ swapPiece: "demo-cream-merino-knit" }, [".flatlay-menu"]);
  const swapped = state().draft.items.find((i) => i.type === "top");
  assert(swapped && swapped.id !== "demo-cream-merino-knit", "a different top was swapped in");
  assert(state().draft.pins.includes(swapped.id), "swapped piece keeps the pin");
  assert(!state().draft.pins.includes("demo-cream-merino-knit"));
  assert.deepEqual(state().draft.items.filter((i) => i.type !== "top").map((i) => i.id), others);
  assert.equal(state().boardMenu, swapped.id, "menu follows the swapped piece");
  assert.equal(state().draft.items.length, 4);
  // A dress with no other dress available reports that and changes nothing.
  click({ selectPiece: "demo-emerald-slip-dress" });
  click({ confirmReplace: "" });
  const dressLook = JSON.stringify(state().draft.items);
  assert.equal(sandbox.window.qa.swap("demo-emerald-slip-dress"), null);
  assert.equal(JSON.stringify(state().draft.items), dressLook);
  assert(state().notice.includes("No other dress"));
  // Remove from the menu clears the piece and closes the menu.
  click({ boardPiece: "demo-emerald-slip-dress" }, [".flatlay-piece"]);
  click({ removePiece: "demo-emerald-slip-dress" }, [".flatlay-menu"]);
  assert(!state().draft.items.some((i) => i.id === "demo-emerald-slip-dress"));
  assert.equal(state().boardMenu, null);
  // Source change closes any menu; nothing above wrote storage.
  click({ boardPiece: state().draft.items[0].id }, [".flatlay-piece"]);
  click({ wardrobeSource: "owned" });
  assert.equal(state().boardMenu, null);
  assert.equal(writes, before, "board actions never write storage");
  // Saved-look and lookbook boards are not interactive.
  assert(!run("board(['demo-cream-merino-knit','demo-indigo-jeans'].map(window.qa.sample))").includes("data-board-piece"));
  sandbox.window.qa.reset();
}

console.log(
  "PASS: flat-lay order/scale/menu/swap; week strip; tap/pin/unpin/remove; confirmed conflicts; pinned completion; source isolation; no implicit preference writes; dated draft round trips; save failure/retry/update/read-only; undated retention; local dates; image parity; account draft reset.",
);
