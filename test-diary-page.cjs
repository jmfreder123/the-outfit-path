// Diary page: list by month for the current account only, escaped text,
// the log form (photo required, only own pieces linked, past dates only,
// storage failure keeps the form), delete with confirmation, account switch
// and Reset everything hiding entries. Uses a stand-in diary store; the
// store itself is covered by test-diary.cjs and the browser by Playwright.
const fs = require("node:fs"),
  vm = require("node:vm"),
  assert = require("node:assert/strict");

const elements = new Map();
const el = (k) => {
  if (!elements.has(k)) {
    const handlers = {};
    elements.set(k, {
      innerHTML: "",
      textContent: "",
      open: false,
      disabled: false,
      scrollTop: 0,
      classList: { add() {}, toggle() {}, remove() {}, contains: () => false },
      focus() {},
      addEventListener(t, h) {
        (handlers[t] ||= []).push(h);
      },
      showModal() {
        this.open = true;
      },
      close() {
        const was = this.open;
        this.open = false;
        if (was) for (const h of handlers.close || []) h();
      },
    });
  }
  return elements.get(k);
};
const listeners = new Map();
const tick = () => new Promise((r) => setTimeout(r, 0));

// Stand-in store, keyed by scope.
const rows = new Map();
const calls = { list: 0, put: [], remove: [], clear: [] };
let putFails = false, nextPhoto = null;
const fakeStore = {
  LIMITS: { note: 500, items: 20 },
  validDate: (d) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d)),
  async list(scope) {
    calls.list++;
    return [...(rows.get(scope) || new Map()).values()].sort((a, b) => b.date.localeCompare(a.date));
  },
  async put(scope, entry) {
    if (putFails) throw Error("QuotaExceededError");
    calls.put.push([scope, entry]);
    if (!rows.has(scope)) rows.set(scope, new Map());
    rows.get(scope).set(entry.id, entry);
  },
  async remove(scope, id) {
    calls.remove.push([scope, id]);
    rows.get(scope)?.delete(id);
  },
  async clearScope(scope) {
    calls.clear.push(scope);
    rows.delete(scope);
  },
  async preparePhoto() {
    return nextPhoto;
  },
};
const photo = new Blob(["jpeg"], { type: "image/jpeg" });
const entry = (o) => ({
  note: "",
  itemIds: [],
  photo,
  width: 600,
  height: 800,
  created: "2026-10-01T09:00:00.000Z",
  updated: "2026-10-01T09:00:00.000Z",
  ...o,
});
rows.set("guest", new Map([
  ["g1", entry({ id: "g1", date: "2026-10-24", note: '<img src=x onerror="alert(1)">', itemIds: ["own-shirt", "gone"] })],
  ["g2", entry({ id: "g2", date: "2026-09-12" })],
]));
rows.set("user:bob", new Map([["b1", entry({ id: "b1", date: "2026-10-20", note: "Bob only" })]]));

let urls = 0, revoked = 0;
const sandbox = {
  console,
  crypto: require("node:crypto").webcrypto,
  queueMicrotask,
  Date,
  Blob,
  setTimeout,
  clearTimeout,
  Uint8Array,
  URL: {
    createObjectURL: () => `blob:qa/${++urls}`,
    revokeObjectURL: () => revoked++,
  },
  FormData: class {
    constructor(form) {
      this.v = form.values;
    }
    get(k) {
      return this.v[k] ?? null;
    }
    getAll(k) {
      return [].concat(this.v[k] ?? []);
    }
  },
  localStorage: {
    m: new Map(),
    getItem(k) {
      return this.m.get(k) ?? null;
    },
    setItem(k, v) {
      this.m.set(k, String(v));
    },
    removeItem(k) {
      this.m.delete(k);
    },
  },
  indexedDB: undefined,
  storePhotos: async () => {}, // item photos (scanner.js); not under test here
  window: { addEventListener() {} },
  document: {
    body: { classList: { add() {} } },
    activeElement: null,
    querySelector: el,
    querySelectorAll() {
      return [];
    },
    addEventListener(t, h, o) {
      const list = listeners.get(t) || [];
      list.push({ h, c: o === true });
      listeners.set(t, list);
    },
  },
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync("docs/app.js", "utf8"), sandbox);
vm.runInContext(fs.readFileSync("docs/editorial.js", "utf8"), sandbox);
sandbox.outfitPathDiary = fakeStore;
vm.runInContext("globalThis.outfitPathDiary = outfitPathDiary;", sandbox);
vm.runInContext(fs.readFileSync("docs/diary.js", "utf8"), sandbox);
const run = (s) => vm.runInContext(s, sandbox);
const main = () => el("#main").innerHTML;
const modal = () => el("#modal-body").innerHTML;
function fire(type, target) {
  let stop = false;
  const e = {
    type,
    target,
    preventDefault() {},
    stopImmediatePropagation() {
      stop = true;
    },
  };
  const rows = listeners.get(type) || [];
  for (const r of [...rows.filter((r) => r.c), ...rows.filter((r) => !r.c)]) {
    if (stop) break;
    r.h(e);
  }
}
const click = (dataset) =>
  fire("click", {
    dataset,
    disabled: false,
    closest(s) {
      return s === "button" ? this : null;
    },
  });

(async () => {
  run(`data.items.push({...seed()[15],id:'own-shirt',name:'White oxford shirt',ownedCopy:true});`);

  // Diary page via the main navigation.
  assert(fs.readFileSync("docs/index.html", "utf8").includes('<button data-view="diary">Diary</button>'));
  click({ view: "diary" });
  assert.equal(run("view"), "diary");
  assert(main().includes("Opening your diary"));
  await tick();
  await tick();
  assert(main().includes("October 2026") && main().includes("September 2026"), "grouped by month");
  assert(main().indexOf("October 2026") < main().indexOf("September 2026"), "newest month first");
  assert(main().includes('data-diary-open="g1"') && main().includes('data-diary-open="g2"'));
  assert(!main().includes("Bob only") && !main().includes("b1"), "other accounts' entries are not shown");
  assert(!main().includes("<img src=x"), "notes are escaped");
  assert(main().includes("2 pieces linked"));
  click({ view: "learn" });
  assert(main().includes("Style learning"), "other pages still render");
  click({ view: "diary" });
  await tick();

  // Entry view: own pieces by name; missing pieces counted; text escaped.
  click({ diaryOpen: "g1" });
  assert(el("#modal").open);
  assert(modal().includes("White oxford shirt"));
  assert(modal().includes("1 linked piece is no longer in your closet"));
  assert(!modal().includes("<img src=x"));
  assert(modal().includes('data-diary-edit="g1"') && modal().includes('data-diary-delete="g1"'));
  click({ diaryOpen: "missing" });

  // Log form: no photo yet, so Save is off and submitting asks for one.
  click({ diaryLog: "" });
  assert(modal().includes('id="diary-form"'));
  assert(/id="diary-save" disabled/.test(modal()), "Save starts disabled");
  assert(modal().includes('capture="environment"') && modal().includes('id="diary-library"'));
  const today = run("(() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); })()");
  assert(modal().includes(`value="${today}"`), "defaults to the selected day (today)");
  assert(modal().includes('value="own-shirt"') && !modal().includes('value="starter-'), "only own pieces can be linked");
  const form = { id: "diary-form", values: { date: today, note: "Hi", piece: ["own-shirt"] } };
  fire("submit", form);
  await tick();
  assert.equal(el("#diary-form-error").textContent, "Add a photo first.");
  assert.equal(calls.put.length, 0);

  // A refused photo shows the reason and still saves nothing.
  const input = (name = "x.jpg") => ({
    id: "diary-library",
    files: [{ name }],
    value: "C:\\fakepath\\" + name,
    classList: { contains: (c) => c === "diary-file" },
  });
  nextPhoto = { ok: false, message: "This photo can't be saved." };
  let i = input();
  fire("change", i);
  await tick();
  assert.equal(i.value, "", "the chosen file is let go");
  assert.equal(el("#diary-photo-status").textContent, "This photo can't be saved.");
  fire("submit", form);
  await tick();
  assert.equal(calls.put.length, 0);

  // An accepted photo; future dates and non-own pieces are refused or dropped.
  nextPhoto = { ok: true, blob: photo, width: 1536, height: 2048 };
  fire("change", input());
  await tick();
  assert(el("#diary-photo-status").textContent.startsWith("Photo ready"));
  form.values.date = "2999-01-01";
  fire("submit", form);
  await tick();
  assert.equal(el("#diary-form-error").textContent, "Choose today or an earlier date.");
  assert.equal(calls.put.length, 0);

  // Storage failure keeps the form open and says nothing was saved.
  form.values = { date: "2026-10-23", note: "  Gallery day  ", piece: ["own-shirt", "starter-1", "nope", "own-shirt"] };
  putFails = true;
  fire("submit", form);
  await tick();
  putFails = false;
  assert(el("#diary-form-error").textContent.includes("Nothing was saved"));
  assert(el("#modal").open);

  fire("submit", form);
  await tick();
  await tick();
  assert.equal(calls.put.length, 1);
  const [scope, saved] = calls.put[0];
  assert.equal(scope, "guest");
  assert.equal(saved.date, "2026-10-23");
  assert.equal(saved.note, "Gallery day");
  assert.deepEqual([...saved.itemIds], ["own-shirt"], "only own pieces, once each");
  assert.equal(saved.width, 1536);
  assert(/^[a-zA-Z0-9_-]{1,64}$/.test(saved.id));
  assert(!el("#modal").open, "dialog closes after saving");
  assert.equal(el("#toast").textContent, "Saved to your diary.");
  await tick();
  await tick();
  assert(main().includes(`data-diary-open="${saved.id}"`), "the list shows the new entry");

  // Cancelling a form with a prepared photo releases it.
  click({ diaryLog: "" });
  fire("change", input());
  await tick();
  const before = revoked;
  el("#modal").close();
  assert.equal(revoked, before + 1, "prepared photo released on cancel");

  // Edit keeps the photo and creation time, replaces note.
  click({ diaryEdit: "g2" });
  assert(!/id="diary-save" disabled/.test(modal()), "editing can save without a new photo");
  fire("submit", { id: "diary-form", values: { date: "2026-09-12", note: "Edited" } });
  await tick();
  const [, edited] = calls.put.at(-1);
  assert.equal(edited.id, "g2");
  assert.equal(edited.note, "Edited");
  assert.equal(edited.created, "2026-10-01T09:00:00.000Z");
  assert.equal(edited.photo, photo);
  assert.equal(el("#toast").textContent, "Diary entry updated.");
  await tick();

  // Delete asks first, then removes from this account.
  click({ diaryDelete: "g2" });
  assert(modal().includes("Delete this diary entry?") && modal().includes('data-diary-confirm-delete="g2"'));
  assert.equal(calls.remove.length, 0);
  click({ diaryConfirmDelete: "g2" });
  await tick();
  assert.deepEqual(JSON.parse(JSON.stringify(calls.remove)), [["guest", "g2"]]);
  assert.equal(el("#toast").textContent, "Diary entry deleted.");
  await tick();
  await tick();
  assert(!main().includes('data-diary-open="g2"'));

  // Account switch: an open entry closes and only the new account's entries show.
  click({ diaryOpen: "g1" });
  assert(el("#modal").open);
  const revokedBefore = revoked;
  await run("outfitPathCloud.switchScope('bob')");
  assert(!el("#modal").open, "open entry closed on account switch");
  assert(revoked > revokedBefore, "previous account's photo URLs released");
  click({ view: "diary" });
  assert(main().includes("Opening your diary") && !main().includes("g1"), "nothing from the previous account");
  await tick();
  await tick();
  assert(main().includes("Bob only") && !main().includes('data-diary-open="g1"'));

  // Reset everything clears this account's diary (via the store) and reloads.
  const listsBefore = calls.list;
  click({ action: "confirmresetall" });
  await tick();
  await tick();
  assert.deepEqual(calls.clear, ["user:bob"]);
  assert(calls.list > listsBefore, "reloaded after reset");
  run("view='diary'; render()");
  await tick();
  assert(main().includes("No diary entries yet"));
  assert(rows.has("guest"), "other accounts kept");

  // Even if the account changes some other way, the page checks the scope
  // before showing anything.
  rows.set("user:bob", new Map([["b2", entry({ id: "b2", date: "2026-10-21", note: "Bob again" })]]));
  run("activeDataScope='guest'; view='diary'; render()");
  await tick();
  await tick();
  assert(main().includes('data-diary-open="g1"'));
  run("activeDataScope='user:bob'; render()");
  assert(!main().includes('data-diary-open="g1"'), "previous account hidden at once");
  await tick();
  await tick();
  assert(main().includes("Bob again") && !main().includes('data-diary-open="g1"'));
  run("activeDataScope='guest'");

  // Storage that cannot open shows a plain message and changes nothing.
  fakeStore.list = async () => {
    throw Error("blocked");
  };
  await run("outfitPathCloud.switchScope(null)");
  click({ view: "diary" });
  await tick();
  await tick();
  assert(main().includes("couldn't be opened in this browser. Nothing was changed."));

  // Copy: privacy notice and reset confirmation mention the diary.
  assert(fs.readFileSync("docs/privacy.html", "utf8").includes("Diary entries"));
  assert(fs.readFileSync("docs/app.js", "utf8").includes("Backups don’t include sample ideas or diary entries."));
  const gate = fs.readFileSync("docs/age-gate.js", "utf8");
  assert(gate.indexOf("'diary-store.js'") < gate.indexOf("'diary.js'") && gate.indexOf("'editorial.js'") < gate.indexOf("'diary.js'"));
  console.log(
    "PASS: Diary tab; entries by month for this account only; escaped notes; entry view; photo required; refused photos save nothing; past dates only; only own pieces linked; storage failure keeps the form; edit keeps the photo; confirmed delete; prepared photo released on cancel; account switch and reset hide entries; storage error message; copy and load order.",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
