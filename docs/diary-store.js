"use strict";

// Private outfit diary: storage and photo handling. Entries live only in this
// browser's IndexedDB, in their own database (separate from item photos),
// keyed by account scope. They are never part of cloud backup or exports.
(() => {
  const DB_NAME = "outfit-path-diary";
  const STORE = "entries";
  const MAX_BYTES = 25 * 1024 * 1024;
  const MAX_EDGE = 2048; // saved photo's longest side, in pixels
  const MIN_EDGE = 200;
  const MAX_DECODE_EDGE = 12000;
  const LIMITS = Object.freeze({ note: 500, items: 20 });
  const TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
  const ID = /^[a-zA-Z0-9_-]{1,64}$/;
  const DATE = /^\d{4}-\d{2}-\d{2}$/;
  let dbPromise = null;

  const scopeKey = (scope) => encodeURIComponent(normalizeScope(scope));
  const entryKey = (scope, id) => `${scopeKey(scope)}|${id}`;
  const validId = (id) => typeof id === "string" && ID.test(id);
  const validDate = (d) => {
    if (typeof d !== "string" || !DATE.test(d)) return false;
    const [y, m, day] = d.split("-").map(Number);
    const t = new Date(Date.UTC(y, m - 1, day));
    return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === day;
  };
  const validSize = (n) => Number.isInteger(n) && n >= 1 && n <= MAX_EDGE;

  // The only record shape that is stored or shown.
  function validEntry(x) {
    return Boolean(
      x && typeof x === "object" &&
        validId(x.id) &&
        validDate(x.date) &&
        typeof x.note === "string" && x.note.length <= LIMITS.note &&
        Array.isArray(x.itemIds) && x.itemIds.length <= LIMITS.items &&
        x.itemIds.every(validId) &&
        x.photo instanceof Blob && x.photo.type === "image/jpeg" &&
        validSize(x.width) && validSize(x.height) &&
        typeof x.created === "string" && !Number.isNaN(Date.parse(x.created)) &&
        typeof x.updated === "string" && !Number.isNaN(Date.parse(x.updated)),
    );
  }

  function db() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        if (typeof indexedDB === "undefined") {
          reject(Error("Private photo storage is unavailable in this browser."));
          return;
        }
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
          if (!request.result.objectStoreNames.contains(STORE)) {
            request.result.createObjectStore(STORE);
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          dbPromise = null;
          reject(request.error || Error("Private photo storage could not open."));
        };
      });
    }
    return dbPromise;
  }

  async function run(mode, work) {
    const database = await db();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(STORE, mode);
      let result;
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error || Error("Private photo storage failed."));
      tx.onabort = () => reject(tx.error || Error("Private photo storage failed."));
      work(tx.objectStore(STORE), (value) => {
        result = value;
      });
    });
  }

  // Visits every record whose key belongs to this scope.
  function eachInScope(store, scope, visit, finish) {
    const prefix = `${scopeKey(scope)}|`;
    const request = store.openCursor();
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        finish?.();
        return;
      }
      if (typeof cursor.key === "string" && cursor.key.startsWith(prefix)) visit(cursor);
      cursor.continue();
    };
  }

  // Valid entries for one account scope, newest date first. Records that are
  // not valid are left in place but not shown.
  function list(scope) {
    return run("readonly", (store, done) => {
      const out = [];
      eachInScope(store, scope, (cursor) => {
        if (validEntry(cursor.value)) out.push(cursor.value);
      }, () => {
        out.sort((a, b) => b.date.localeCompare(a.date) || b.created.localeCompare(a.created));
        done(out);
      });
    });
  }

  function put(scope, entry) {
    if (!validEntry(entry)) return Promise.reject(Error("Invalid diary entry."));
    const record = {
      id: entry.id,
      date: entry.date,
      note: entry.note,
      itemIds: [...entry.itemIds],
      photo: entry.photo,
      width: entry.width,
      height: entry.height,
      created: entry.created,
      updated: entry.updated,
    };
    return run("readwrite", (store) => {
      store.put(record, entryKey(scope, entry.id));
    });
  }

  function remove(scope, id) {
    if (!validId(id)) return Promise.reject(Error("Invalid diary entry."));
    return run("readwrite", (store) => {
      store.delete(entryKey(scope, id));
    });
  }

  // Deletes every diary record for one account scope; other scopes are kept.
  function clearScope(scope) {
    return run("readwrite", (store) => {
      eachInScope(store, scope, (cursor) => cursor.delete());
    });
  }

  // Checks, screens and re-encodes a chosen photo in memory. Returns
  // { ok, blob, width, height } or { ok: false, message }. Nothing is stored.
  // The photo is decoded the right way up, then redrawn on a canvas and saved
  // as a new JPEG, which carries no EXIF, GPS or camera details.
  async function preparePhoto(file) {
    if (!file || !TYPES.includes(String(file.type).toLowerCase())) {
      return { ok: false, message: "Choose a JPEG, PNG, WebP or HEIC photo." };
    }
    if (!(file.size > 0)) return { ok: false, message: "This photo is empty. Choose another." };
    if (file.size > MAX_BYTES) return { ok: false, message: "Choose a photo under 25 MB." };
    let bitmap = null;
    let canvas = null;
    try {
      try {
        bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      } catch {
        return { ok: false, message: "This photo couldn't be opened. Try a JPEG or a fresh camera photo." };
      }
      if (bitmap.width < MIN_EDGE || bitmap.height < MIN_EDGE) {
        return { ok: false, message: "This photo is too small. Choose one at least 200 pixels on each side." };
      }
      if (bitmap.width > MAX_DECODE_EDGE || bitmap.height > MAX_DECODE_EDGE) {
        return { ok: false, message: "This photo is too large to open. Choose a smaller one." };
      }
      const screening = globalThis.outfitPathScreening;
      const checked = screening ? await screening.screen(bitmap) : null;
      const result = checked?.ok === true ? checked : { ok: false, reason: checked?.reason || "unavailable" };
      if (!result.ok) {
        return {
          ok: false,
          message: screening
            ? screening.message(result)
            : "Photo checking isn't available right now, so photos can't be saved. Reload and try again.",
        };
      }
      const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) return { ok: false, message: "This photo couldn't be prepared. Try again." };
      context.drawImage(bitmap, 0, 0, width, height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
      if (!blob || blob.type !== "image/jpeg") {
        return { ok: false, message: "This photo couldn't be prepared. Try again." };
      }
      return { ok: true, blob, width, height };
    } finally {
      bitmap?.close?.();
      if (canvas) canvas.width = canvas.height = 0;
    }
  }

  globalThis.outfitPathDiary = Object.freeze({
    list,
    put,
    remove,
    clearScope,
    preparePhoto,
    validEntry,
    validDate,
    entryKey,
    LIMITS,
  });
})();
