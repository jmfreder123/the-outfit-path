// Private diary storage: record checks, account-scoped storage, clearing one
// account only, and the photo pipeline (type, size, dimensions, screening
// before anything is drawn or stored, re-encoded JPEG, decoded images
// released). Uses an in-memory stand-in for IndexedDB and synthetic photos;
// the real browser path is checked separately with Playwright.
const fs = require("node:fs"),
  vm = require("node:vm"),
  assert = require("node:assert/strict");

// Minimal in-memory IndexedDB: one database, one object store, string keys.
function fakeIndexedDB() {
  const rows = new Map();
  let failWrites = false;
  const later = (f) => setTimeout(f, 0);
  const store = (tx, mode) => ({
    put(value, key) {
      if (mode !== "readwrite") throw Error("read-only");
      tx.pending.push(() => {
        if (failWrites) throw Object.assign(Error("QuotaExceededError"), { name: "QuotaExceededError" });
        rows.set(key, structuredClone(value));
      });
    },
    delete(key) {
      tx.pending.push(() => rows.delete(key));
    },
    openCursor() {
      const request = {};
      const keys = [...rows.keys()].sort();
      let i = 0;
      const step = () =>
        later(() => {
          if (i >= keys.length) {
            request.result = null;
            request.onsuccess?.();
            tx.settle();
            return;
          }
          const key = keys[i++];
          tx.open++;
          request.result = {
            key,
            value: structuredClone(rows.get(key)),
            delete() {
              tx.pending.push(() => rows.delete(key));
            },
            continue() {
              tx.open--;
              step();
            },
          };
          request.onsuccess?.();
        });
      tx.open++;
      step();
      return request;
    },
  });
  const database = {
    objectStoreNames: { contains: () => true },
    createObjectStore() {},
    transaction(_name, mode) {
      const tx = {
        pending: [],
        open: 0,
        settle() {
          tx.open--;
          if (tx.open <= 0) tx.commit();
        },
        commit() {
          if (tx.done) return;
          tx.done = true;
          later(() => {
            try {
              for (const f of tx.pending) f();
              tx.oncomplete?.();
            } catch (error) {
              tx.error = error;
              tx.onerror?.();
            }
          });
        },
        objectStore: () => store(tx, mode),
      };
      // Commit once the caller's synchronous requests are queued and no
      // cursor is still running.
      later(() => {
        if (tx.open <= 0) tx.commit();
      });
      return tx;
    },
  };
  return {
    rows,
    setFail(v) {
      failWrites = v;
    },
    open() {
      const request = {};
      later(() => {
        request.result = database;
        request.onupgradeneeded?.();
        request.onsuccess?.();
      });
      return request;
    },
  };
}

const idb = fakeIndexedDB();
let canvases = 0, closed = 0, opened = 0;
const screenCalls = [];
const sandbox = {
  console,
  Blob,
  Date,
  Number,
  Math,
  Error,
  setTimeout,
  structuredClone,
  indexedDB: idb,
  document: {
    createElement(tag) {
      assert.equal(tag, "canvas");
      canvases++;
      return {
        width: 0,
        height: 0,
        getContext() {
          return { drawImage() {} };
        },
        toBlob(done, type) {
          done(new Blob([`jpeg ${this.width}x${this.height}`], { type }));
        },
      };
    },
  },
  async createImageBitmap(file, options) {
    assert.equal(options?.imageOrientation, "from-image", "decoded the right way up");
    if (file.broken) throw Error("decode");
    opened++;
    return {
      width: file.w,
      height: file.h,
      close() {
        closed++;
      },
    };
  },
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
// The app's own scope rule, taken from app.js.
const app = fs.readFileSync("docs/app.js", "utf8");
const rule = app.match(/const normalizeScope=[^\n]*;/)?.[0];
assert(rule, "normalizeScope found in app.js");
vm.runInContext(rule.replace("const normalizeScope", "globalThis.normalizeScope"), sandbox);
vm.runInContext(fs.readFileSync("docs/diary-store.js", "utf8"), sandbox);
const D = sandbox.outfitPathDiary;

const photo = (label = "x") => new Blob([label], { type: "image/jpeg" });
const entry = (o = {}) => ({
  id: "e1",
  date: "2026-10-24",
  note: "",
  itemIds: [],
  photo: photo(),
  width: 1536,
  height: 2048,
  created: "2026-10-24T09:00:00.000Z",
  updated: "2026-10-24T09:00:00.000Z",
  ...o,
});
const file = (o) => ({ type: "image/jpeg", size: 2_000_000, w: 3024, h: 4032, ...o });

(async () => {
  // Record checks.
  assert(D.validEntry(entry()));
  assert(D.validEntry(entry({ note: "n".repeat(500), itemIds: Array(20).fill("shirt") })));
  for (const bad of [
    { id: "has space" },
    { id: "" },
    { date: "2026-02-30" },
    { date: "24/10/2026" },
    { note: "n".repeat(501) },
    { note: null },
    { itemIds: Array(21).fill("a") },
    { itemIds: ["<b>"] },
    { photo: new Blob(["x"], { type: "image/png" }) },
    { photo: "data:image/jpeg;base64,AAAA" },
    { width: 0 },
    { height: 4096 },
    { created: "not a date" },
  ]) {
    assert(!D.validEntry(entry(bad)), `rejects ${JSON.stringify(Object.keys(bad))}`);
  }
  await assert.rejects(D.put("guest", entry({ date: "2026-13-01" })), /Invalid diary entry/);
  assert.equal(idb.rows.size, 0, "invalid entries are not stored");

  // Account-scoped storage.
  await D.put("guest", entry({ id: "g1", date: "2026-10-01" }));
  await D.put("user:alice", entry({ id: "a1", date: "2026-10-02" }));
  await D.put("user:alice", entry({ id: "a2", date: "2026-10-20", note: "Dinner" }));
  await D.put("user:bob", entry({ id: "b1", date: "2026-10-03" }));
  const ids = async (scope) => JSON.parse(JSON.stringify((await D.list(scope)).map((e) => e.id)));
  assert.deepEqual(await ids("guest"), ["g1"]);
  assert.deepEqual(await ids("user:alice"), ["a2", "a1"], "newest date first");
  assert.deepEqual(await ids("user:bob"), ["b1"]);
  assert.deepEqual(await ids("user:carol"), []);
  assert([...idb.rows.keys()].every((k) => /^(guest|user%3A(alice|bob))\|/.test(k)), "keys carry the scope");
  const stored = idb.rows.get(D.entryKey("user:alice", "a2"));
  assert.deepEqual(
    [...Object.keys(stored)].sort(),
    ["created", "date", "height", "id", "itemIds", "note", "photo", "updated", "width"],
    "only known fields are stored",
  );

  // Editing replaces the same record.
  await D.put("user:alice", entry({ id: "a2", date: "2026-10-20", note: "Changed" }));
  assert.equal((await D.list("user:alice")).find((e) => e.id === "a2").note, "Changed");
  assert.equal(idb.rows.size, 4);

  // Records that are not valid are kept but not shown.
  idb.rows.set("user%3Aalice|junk", { id: "junk", date: 5 });
  assert.deepEqual(await ids("user:alice"), ["a2", "a1"]);

  // Delete one entry, then clear one account only.
  await D.remove("user:alice", "a1");
  assert.deepEqual(await ids("user:alice"), ["a2"]);
  await assert.rejects(D.remove("user:alice", "../x"), /Invalid/);
  await D.clearScope("user:alice");
  assert.deepEqual(await ids("user:alice"), []);
  assert(![...idb.rows.keys()].some((k) => k.startsWith("user%3Aalice|")), "nothing left for this account");
  assert.deepEqual(await ids("guest"), ["g1"], "other accounts kept");
  assert.deepEqual(await ids("user:bob"), ["b1"]);

  // Storage full: the write fails and nothing changes.
  idb.setFail(true);
  await assert.rejects(D.put("user:bob", entry({ id: "b2" })));
  idb.setFail(false);
  assert.deepEqual(await ids("user:bob"), ["b1"]);

  // Photo pipeline. No step stores anything.
  const before = idb.rows.size;
  const fails = async (f, text) => {
    const r = await D.preparePhoto(f);
    assert.equal(r.ok, false);
    assert(r.message.includes(text), `${text}: ${r.message}`);
  };
  await fails(null, "Choose a JPEG");
  await fails(file({ type: "image/gif" }), "Choose a JPEG");
  await fails(file({ type: "image/svg+xml" }), "Choose a JPEG");
  await fails(file({ size: 0 }), "empty");
  await fails(file({ size: 25 * 1024 * 1024 + 1 }), "under 25 MB");
  await fails(file({ broken: true }), "couldn't be opened");
  await fails(file({ w: 199, h: 800 }), "too small");
  await fails(file({ w: 12001, h: 800 }), "too large");
  assert.equal(opened, closed, "every decoded photo was released");
  assert.equal(canvases, 0, "nothing drawn before screening");

  // Screening missing: fails closed.
  await fails(file(), "isn't available");
  assert.equal(canvases, 0);

  // Screening says no: fails, nothing drawn.
  sandbox.outfitPathScreening = {
    async screen(source) {
      screenCalls.push(source);
      return this.next;
    },
    message: (r) => (r.reason === "explicit" ? "This photo can't be saved." : "Photo checking isn't available right now"),
    next: { ok: false, reason: "explicit" },
  };
  await fails(file(), "can't be saved");
  sandbox.outfitPathScreening.next = undefined;
  await fails(file(), "isn't available");
  assert.equal(canvases, 0, "refused photos are never drawn");
  assert.equal(screenCalls.length, 2, "screening sees the decoded photo");

  // Accepted: resized to at most 2048 px, re-encoded as JPEG.
  sandbox.outfitPathScreening.next = { ok: true, explicit: 0.01 };
  let r = await D.preparePhoto(file({ type: "image/png" }));
  assert.equal(r.ok, true);
  assert.equal(r.blob.type, "image/jpeg");
  assert.deepEqual([r.width, r.height], [1536, 2048]);
  assert.equal(await r.blob.text(), "jpeg 1536x2048", "the saved image is the redrawn one, not the file");
  r = await D.preparePhoto(file({ w: 900, h: 600, type: "image/webp" }));
  assert.deepEqual([r.width, r.height], [900, 600], "small photos are not enlarged");
  assert.equal(opened, closed, "every decoded photo was released");
  assert.equal(idb.rows.size, before, "preparing a photo stores nothing");
  assert(D.validEntry(entry({ photo: r.blob, width: r.width, height: r.height })), "prepared photo makes a valid entry");

  // Wiring: loads after app.js (for the scope rule) and screening; Reset
  // everything clears this account's diary; diary data never reaches cloud
  // copies or exports.
  const gate = fs.readFileSync("docs/age-gate.js", "utf8");
  const at = (s) => gate.indexOf(`'${s}'`);
  assert(at("app.js") < at("diary-store.js") && at("screening.js") < at("diary-store.js"));
  const editorial = fs.readFileSync("docs/editorial.js", "utf8");
  const reset = editorial.slice(editorial.indexOf('"confirmresetall"'));
  assert(reset.slice(0, 600).includes("clearScope(activeDataScope)"));
  for (const f of ["docs/app.js", "docs/supabase-sync.js", "docs/scanner.js"]) {
    const text = fs.readFileSync(f, "utf8");
    assert(!/outfitPathDiary|outfit-path-diary|diaryEntries/.test(text), `${f} does not touch the diary`);
  }
  console.log(
    "PASS: diary record checks; account-scoped list/edit/delete; invalid records hidden; clear one account only; storage-full leaves data unchanged; photo type/size/dimension checks; screening before drawing and fails closed; re-encoded JPEG ≤2048 px; decoded photos released; preparing stores nothing; reset and cloud/export boundaries.",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
