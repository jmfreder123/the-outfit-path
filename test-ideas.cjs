// Sample ideas: separate storage, sample-only contents, account isolation,
// failure handling and confirmed deletion. Uses an in-memory localStorage.
const fs = require("node:fs"),
  vm = require("node:vm"),
  assert = require("node:assert/strict");

const store = new Map();
let failWrites = false, writeLog = [];
const elements = new Map();
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
const listeners = new Map();
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
    getItem(k) {
      return store.has(k) ? store.get(k) : null;
    },
    setItem(k, v) {
      if (failWrites) throw Error("full");
      writeLog.push(k);
      store.set(k, String(v));
    },
    removeItem(k) {
      store.delete(k);
    },
  },
  window: { addEventListener() {} },
  // scanner.js is not loaded here; the reset only needs photo clearing to resolve.
  storePhotos: async () => {},
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
let src = fs.readFileSync("docs/editorial.js", "utf8");
// Test-only observation interface; no testing hooks ship in the application.
src = src.replace(
  /\}\)\(\);\s*$/,
  `window.qa={state:()=>clone({draft,planningDate,source,notice}),load:loadIdeas,key:ideasKey,reset:resetSession,shift:shiftDate};})();`,
);
vm.runInContext(src, sandbox);
const run = (s) => vm.runInContext(s, sandbox);
const qa = () => sandbox.window.qa;
const state = () => JSON.parse(JSON.stringify(qa().state()));
const ideas = () => JSON.parse(JSON.stringify(qa().load()));
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
function submit(id, value) {
  let stop = false;
  for (
    const r of [
      ...listeners.get("submit").filter((r) => r.c),
      ...listeners.get("submit").filter((r) => !r.c),
    ]
  ) {
    if (stop) break;
    r.h({
      target: { id, value },
      preventDefault() {},
      stopImmediatePropagation() {
        stop = true;
      },
    });
  }
}
const guestKey = "outfit-path-ideas-v1:guest";
const dataKey = "outfit-path-v2:guest";

// Building a sample look and saving it as an idea.
click({ wardrobeSource: "sample" });
click({ selectPiece: "demo-emerald-slip-dress" });
click({ selectPiece: "demo-rust-blazer" });
assert(run("renderBuilder()").includes("data-save-idea >Save as idea"));
const looksBefore = run("JSON.stringify(data.looks)");
writeLog = [];
click({ saveIdea: "" });
assert(el("#modal").open, "save opens the name form");
assert(el("#modal-body").innerHTML.includes("never added to your closet"));
submit("simple-idea-form", "Gallery night");
assert.deepEqual(writeLog, [guestKey], "only the ideas key is written");
assert.equal(run("JSON.stringify(data.looks)"), looksBefore, "saved looks untouched");
assert(!store.has(dataKey), "owned data record not written");
let saved = JSON.parse(store.get(guestKey));
assert.equal(saved.length, 1);
assert.deepEqual(saved[0].itemIds, ["demo-emerald-slip-dress", "demo-rust-blazer"]);
assert(!JSON.stringify(saved).includes("photo"), "no photo fields stored");
assert(!JSON.stringify(saved).includes("hex"), "no copied item records, only IDs");
assert.equal(saved[0].name, "Gallery night");
assert.equal(state().draft.readOnly, true);
assert(state().notice.includes("Saved to Sample ideas"));
assert(run("renderBuilder()").includes("<b>Sample idea</b>"));
const ideaId = saved[0].id;

// Saved looks page lists it apart from owned looks; the week strip marks it.
run("view='looks'");
let looksHtml = run("renderLooks()");
assert(looksHtml.includes("Sample ideas") && looksHtml.includes("Gallery night"));
assert(looksHtml.includes(`data-open-idea="${ideaId}"`));
assert(run("renderBuilder()").includes("has a sample idea"));

// Opening, editing and updating keeps one idea with the same ID.
click({ newDraft: "" });
click({ openIdea: ideaId });
assert.equal(state().draft.ideaId, ideaId);
assert.equal(state().draft.readOnly, true);
assert.equal(state().source, "sample");
click({ editSaved: "" });
assert(state().notice.includes("Only Update idea saves"));
click({ selectPiece: "demo-off-white-chunky-sneakers" });
assert(run("renderBuilder()").includes(">Update idea<"));
click({ saveIdea: "" });
submit("simple-idea-form", "Gallery night");
saved = JSON.parse(store.get(guestKey));
assert.equal(saved.length, 1, "update does not duplicate");
assert.equal(saved[0].id, ideaId);
assert.equal(saved[0].itemIds.length, 3);

// Duplicate submit while saving, and an account/date change before submit.
click({ editSaved: "" });
click({ saveIdea: "" });
const next = qa().shift(state().planningDate, 1);
click({ gotoDate: next });
submit("simple-idea-form", "Should not save");
assert(state().notice.includes("changed"), "stale form is refused");
assert.equal(JSON.parse(store.get(guestKey)).length, 1);
click({ today: "" });

// Storage failure keeps the draft and saves nothing.
click({ newDraft: "" });
click({ selectPiece: "demo-cobalt-hoodie" });
failWrites = true;
click({ saveIdea: "" });
submit("simple-idea-form", "Will fail");
failWrites = false;
assert(el("#simple-save-error").textContent.includes("Could not save"));
assert.equal(state().draft.readOnly, false, "draft stays editable");
assert(state().draft.items.some((i) => i.id === "demo-cobalt-hoodie"));
assert.equal(JSON.parse(store.get(guestKey)).length, 1);

// Unreadable stored ideas are never overwritten.
const good = store.get(guestKey);
store.set(guestKey, "{not json");
click({ saveIdea: "" });
submit("simple-idea-form", "Blocked");
assert(el("#simple-save-error").textContent.includes("could not be read"));
assert.equal(store.get(guestKey), "{not json", "corrupt value left as found");
assert(run("renderLooks()").includes("could not be read"));
store.set(guestKey, good);

// Tampered entries: owned or unknown IDs are hidden on load; names escaped.
store.set(
  guestKey,
  JSON.stringify([
    ...JSON.parse(good),
    { id: "bad1", name: "Owned", plannedDate: null, itemIds: ["owned-white-shirt"] },
    { id: "bad2", name: "Unknown", plannedDate: null, itemIds: ["x"] },
    {
      id: "esc1",
      name: "<img src=x onerror=alert(1)>",
      plannedDate: state().planningDate,
      itemIds: ["demo-black-crossbody"],
    },
  ]),
);
assert.deepEqual(ideas().ideas.map((x) => x.id).sort(), [ideaId, "esc1"].sort());
looksHtml = run("renderLooks()");
assert(!looksHtml.includes("<img src=x"), "idea names are escaped");
assert(looksHtml.includes("&lt;img src=x"));

// A starter ID in an idea always shows the sample version, never a person's
// edited record with the same ID.
run("data.items=seed(); data.items.find(i=>i.id==='starter-15').name='My edited shirt'");
store.set(guestKey, JSON.stringify([{ id: "st1", name: "Starter", plannedDate: state().planningDate, itemIds: ["starter-15"] }]));
click({ openIdea: "st1" });
assert(el("#modal-body").innerHTML.includes("Discard draft and open"), "a dirty draft is not replaced silently");
assert(state().draft.items.some((i) => i.id === "demo-cobalt-hoodie"), "draft kept until a choice is made");
click({ discardOpenIdea: "st1" });
assert.equal(state().draft.items[0].name, "White button-down");
store.set(guestKey, JSON.stringify([
  ...JSON.parse(good),
  { id: "bad1", name: "Owned", plannedDate: null, itemIds: ["owned-white-shirt"] },
  { id: "esc1", name: "x", plannedDate: state().planningDate, itemIds: ["demo-black-crossbody"] },
]));

// Deleting needs confirmation and removes only that idea.
click({ deleteIdea: "esc1" });
assert(el("#modal-body").innerHTML.includes("Delete idea"));
assert.equal(ideas().ideas.length, 2, "nothing deleted before confirming");
click({ confirmDeleteIdea: "esc1" });
assert.deepEqual(ideas().ideas.map((x) => x.id), [ideaId]);
assert(store.get(guestKey).includes("bad1"), "only the confirmed idea was removed from storage");
store.set(guestKey, good);

// Account isolation: another account sees none of these ideas, and its own
// ideas stay under its own key.
(async () => {
  await run("outfitPathCloud.switchScope('acct_b')");
  assert.equal(qa().key(), "outfit-path-ideas-v1:user%3Aacct_b");
  assert.equal(ideas().ideas.length, 0, "other account starts with no ideas");
  assert.equal(state().draft.items.length, 0, "draft reset on account change");
  click({ wardrobeSource: "sample" });
  click({ selectPiece: "demo-indigo-jeans" });
  click({ saveIdea: "" });
  submit("simple-idea-form", "B idea");
  assert.equal(JSON.parse(store.get("outfit-path-ideas-v1:user%3Aacct_b")).length, 1);
  assert.equal(JSON.parse(store.get(guestKey)).length, 1, "guest ideas unchanged");
  await run("outfitPathCloud.switchScope(null)");
  assert.deepEqual(ideas().ideas.map((x) => x.name), ["Gallery night"]);
  // Reset everything clears only the active account's ideas.
  click({ action: "confirmresetall" });
  assert.equal(store.get(guestKey), undefined, "guest ideas removed by reset everything");
  assert.equal(JSON.parse(store.get("outfit-path-ideas-v1:user%3Aacct_b")).length, 1, "other account's ideas untouched");
  assert.equal(run("data.items.length"), 0, "the app's reset leaves an empty closet");
  // Ideas are not part of the data record that cloud backup projects.
  assert(!run("JSON.stringify(data)").includes("itemIds"));
  console.log(
    "PASS: sample ideas save to their own per-account key with sample IDs only; update without duplicates; stale form, storage failure and unreadable data handled; unrecognised entries hidden but kept on write; names escaped; confirmed deletion; account isolation.",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
