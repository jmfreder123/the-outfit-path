"use strict";

// Diary page: private photos of outfits the person wore. Storage and photo
// checks are in diary-store.js. Entries belong to the account scope that was
// active when they were saved, and only that scope's entries are shown.
(() => {
  const store = globalThis.outfitPathDiary;
  const ID_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
  // What the page is showing. Object URLs are made per entry and revoked
  // when the list is replaced, the account changes, or everything is reset.
  let cache = { scope: null, status: "idle", stale: false, entries: [], urls: new Map() };
  let loadTicket = 0;
  // The open log/edit form, if any.
  let form = null;
  let formTicket = 0;

  const today = () => localDateKey();
  function localDateKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const fromKey = (key) => {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  const longDate = (key) =>
    fromKey(key).toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  const shortDate = (key) =>
    fromKey(key).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const monthLabel = (key) =>
    fromKey(`${key}-01`).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
  function newId() {
    const bytes = crypto.getRandomValues(new Uint8Array(20));
    return "d" + [...bytes].map((b) => ID_CHARS[b % ID_CHARS.length]).join("");
  }

  // The person's own pieces: everything in the closet except starter records
  // they have never changed. Sample pieces are never in data.items.
  function ownPieces() {
    const starters = new Map(seed().map((s) => [s.id, s]));
    return data.items.filter((i) => {
      if (!i.id.startsWith("starter-") || i.ownedCopy) return true;
      const original = starters.get(i.id);
      return original &&
        ["name", "type", "color", "hex", "style", "season", "notes", "photoId"]
          .some((key) => (i[key] || "") !== (original[key] || ""));
    });
  }

  function clearCache(status = "idle") {
    for (const url of cache.urls.values()) URL.revokeObjectURL(url);
    cache = { scope: null, status, stale: false, entries: [], urls: new Map() };
    loadTicket++;
  }

  async function load() {
    const scope = activeDataScope;
    const ticket = ++loadTicket;
    cache.scope = scope;
    cache.stale = false;
    // A list already on screen stays there until the new one is ready.
    if (cache.status !== "ready") cache.status = "loading";
    let entries;
    try {
      if (!store) throw Error("Diary storage did not load.");
      entries = await store.list(scope);
    } catch {
      if (ticket !== loadTicket || scope !== activeDataScope) return;
      cache.status = "error";
      repaint();
      return;
    }
    if (ticket !== loadTicket || scope !== activeDataScope) return;
    for (const url of cache.urls.values()) URL.revokeObjectURL(url);
    cache.urls = new Map(entries.map((e) => [e.id, URL.createObjectURL(e.photo)]));
    cache.entries = entries;
    cache.status = "ready";
    repaint();
  }

  function repaint() {
    if (view === "diary") render();
  }

  function ensureLoaded() {
    if (cache.scope !== activeDataScope) {
      clearCache();
      load();
    } else if (cache.status === "idle" || cache.stale) {
      load();
    }
  }

  const findEntry = (id) =>
    cache.scope === activeDataScope ? cache.entries.find((e) => e.id === id) : undefined;

  function entryCard(e) {
    const linked = e.itemIds.length;
    return `<li><button class="diary-card" data-diary-open="${esc(e.id)}" aria-label="Open diary entry for ${
      esc(longDate(e.date))
    }"><span class="diary-card-photo"><img src="${esc(cache.urls.get(e.id) || "")}" alt="" width="${
      e.width
    }" height="${e.height}" loading="lazy" decoding="async"></span><span class="diary-card-body"><span class="diary-card-date">${
      esc(shortDate(e.date))
    }</span>${e.note ? `<span class="diary-card-note">${esc(e.note)}</span>` : ""}${
      linked ? `<span class="diary-card-meta">${plural(linked, "piece")} linked</span>` : ""
    }</span></button></li>`;
  }

  function renderDiary() {
    ensureLoaded();
    const head = `<div class="saved-head diary-head"><div><h1>Diary</h1><p>Photos of outfits you wore, kept only in this browser. They aren't included in backups or cloud copies.</p></div>${
      cache.status === "ready" && cache.entries.length
        ? `<button class="diary-log" data-diary-log="">Log an outfit</button>`
        : ""
    }</div>`;
    let body;
    if (cache.status === "error") {
      body = `<p class="saved-empty" role="alert">Your diary couldn't be opened in this browser. Nothing was changed.</p>`;
    } else if (cache.status !== "ready") {
      body = `<p class="saved-empty" role="status">Opening your diary…</p>`;
    } else if (!cache.entries.length) {
      body = `<section class="diary-empty"><h2>No diary entries yet</h2><p>Log an outfit to keep a private photo of what you wore, with an optional note and the pieces from your closet.</p><button class="diary-log" data-diary-log="">Log today's outfit</button></section>`;
    } else {
      const months = new Map();
      for (const e of cache.entries) {
        const key = e.date.slice(0, 7);
        if (!months.has(key)) months.set(key, []);
        months.get(key).push(e);
      }
      body = [...months].map(([key, list]) =>
        `<section class="saved-group diary-month" aria-labelledby="diary-${key}"><h2 id="diary-${key}">${
          esc(monthLabel(key))
        }</h2><ul class="diary-grid">${list.map(entryCard).join("")}</ul></section>`
      ).join("");
    }
    return `<div class="saved-page diary-page">${head}${body}</div>`;
  }

  // Entry view (read only).
  function openEntry(id) {
    const e = findEntry(id);
    if (!e) return;
    endForm();
    const own = new Map(ownPieces().map((i) => [i.id, i]));
    const pieces = e.itemIds.map((pid) => own.get(pid)).filter(Boolean);
    const missing = e.itemIds.length - pieces.length;
    showDialog(
      esc(longDate(e.date)),
      `<div class="diary-view"><img class="diary-view-photo" src="${esc(cache.urls.get(e.id) || "")}" alt="Outfit photo from ${
        esc(longDate(e.date))
      }" width="${e.width}" height="${e.height}">${
        e.note ? `<p class="diary-view-note">${esc(e.note)}</p>` : ""
      }${
        pieces.length
          ? `<h3 class="diary-sub">Pieces</h3><ul class="diary-chips">${
            pieces.map((i) => `<li>${esc(i.name)}</li>`).join("")
          }</ul>`
          : ""
      }${
        missing
          ? `<p class="diary-hint">${plural(missing, "linked piece")} ${missing === 1 ? "is" : "are"} no longer in your closet.</p>`
          : ""
      }<div class="diary-actions"><button class="diary-primary" data-diary-edit="${esc(e.id)}">Edit</button><button class="diary-secondary" data-diary-delete="${
        esc(e.id)
      }">Delete</button></div></div>`,
    );
  }

  // Log or edit form. Nothing is stored until Save.
  function startForm(id = null) {
    const existing = id ? findEntry(id) : null;
    if (id && !existing) return;
    endForm();
    const selected = globalThis.outfitPathPlan?.selectedDate?.();
    const date = existing?.date ||
      (store?.validDate(selected) && selected <= today() ? selected : today());
    form = {
      ticket: ++formTicket,
      scope: activeDataScope,
      id: existing?.id || null,
      existing,
      photo: null, // { blob, width, height, url } once a new photo passes
      busy: false,
      saving: false,
    };
    const chosen = new Set(existing?.itemIds || []);
    const pieces = ownPieces();
    const pieceList = pieces.length
      ? `<details class="diary-pieces"${chosen.size ? " open" : ""}><summary>Link pieces from your closet <span>(optional)</span></summary><div class="diary-piece-list">${
        pieces.map((i) =>
          `<label><input type="checkbox" name="piece" value="${esc(i.id)}"${chosen.has(i.id) ? " checked" : ""}> ${
            esc(i.name)
          }</label>`
        ).join("")
      }</div></details>`
      : `<p class="diary-hint">Add pieces to your closet to link them to diary entries.</p>`;
    showDialog(
      existing ? "Edit diary entry" : "Log an outfit",
      `<form id="diary-form" class="diary-form" novalidate><div class="diary-photo">${photoPreview()}</div><div class="diary-pick-row"><label class="diary-pick diary-camera"><input class="diary-file" type="file" id="diary-camera" accept="image/*" capture="environment">${
        existing ? "Retake photo" : "Take a photo"
      }</label><label class="diary-pick"><input class="diary-file" type="file" id="diary-library" accept="image/jpeg,image/png,image/webp,image/heic,image/heif">${
        existing ? "Choose a different photo" : "Choose a photo"
      }</label></div><p id="diary-photo-status" class="diary-status" role="status" aria-live="polite">${
        existing ? "" : "Photos are checked on this device before they can be saved, and saved without location or camera details."
      }</p><label class="diary-field">Date worn<input type="date" name="date" value="${esc(date)}" max="${
        esc(today())
      }" required></label><label class="diary-field"><span class="diary-label">Note <span>(optional)</span></span><textarea name="note" maxlength="${
        store?.LIMITS.note ?? 500
      }" rows="3">${esc(existing?.note || "")}</textarea><small id="diary-note-count" aria-live="polite">${
        (existing?.note || "").length
      } / ${store?.LIMITS.note ?? 500}</small></label>${pieceList}<p id="diary-form-error" class="diary-error" role="alert"></p><div class="diary-actions"><button type="submit" class="diary-primary" id="diary-save"${
        existing ? "" : " disabled"
      }>Save entry</button><button type="button" class="diary-secondary" data-action="close">Cancel</button></div></form>`,
    );
  }

  // The dialog is reused, so each diary dialog starts at its top.
  function showDialog(title, body) {
    openModal(title, body);
    const dialog = $("#modal");
    if (dialog) dialog.scrollTop = 0;
  }

  function photoPreview() {
    const url = form?.photo?.url || (form?.existing && cache.urls.get(form.existing.id));
    return url
      ? `<img src="${esc(url)}" alt="Selected outfit photo">`
      : `<span class="diary-photo-empty">No photo yet</span>`;
  }

  // Drops an unsaved form and the photo it prepared.
  function endForm() {
    if (form?.photo?.url) URL.revokeObjectURL(form.photo.url);
    form = null;
    formTicket++;
  }

  function setBusy(busy) {
    if (!form) return;
    form.busy = busy;
    for (const input of document.querySelectorAll("#diary-form .diary-file")) input.disabled = busy;
    for (const label of document.querySelectorAll("#diary-form .diary-pick")) {
      label.classList.toggle("disabled", busy);
    }
    const save = document.querySelector("#diary-save");
    if (save) save.disabled = busy || form.saving || !(form.photo || form.existing);
  }

  async function receivePhoto(input) {
    if (!form || form.busy || form.saving) return;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    const ticket = form.ticket;
    const status = document.querySelector("#diary-photo-status");
    if (status) status.textContent = "Checking this photo on your device… The first check can take a few seconds.";
    setBusy(true);
    const result = store
      ? await store.preparePhoto(file)
      : { ok: false, message: "Diary storage didn't load. Reload and try again." };
    if (!form || form.ticket !== ticket || form.scope !== activeDataScope) return;
    setBusy(false);
    const now = document.querySelector("#diary-photo-status");
    if (!result.ok) {
      if (now) now.textContent = result.message;
      return;
    }
    if (form.photo?.url) URL.revokeObjectURL(form.photo.url);
    form.photo = {
      blob: result.blob,
      width: result.width,
      height: result.height,
      url: URL.createObjectURL(result.blob),
    };
    const frame = document.querySelector("#diary-form .diary-photo");
    if (frame) frame.innerHTML = photoPreview();
    if (now) now.textContent = "Photo ready. It will be saved without location or camera details.";
    setBusy(false);
  }

  async function submitForm(el) {
    if (!form || form.busy || form.saving) return;
    const error = document.querySelector("#diary-form-error");
    const fail = (text) => {
      if (error) error.textContent = text;
    };
    if (form.scope !== activeDataScope) {
      fail("The account changed. Nothing was saved.");
      return;
    }
    const values = new FormData(el);
    const date = String(values.get("date") || "");
    const note = String(values.get("note") || "").trim();
    const own = new Set(ownPieces().map((i) => i.id));
    const itemIds = [...new Set(values.getAll("piece").map(String))].filter((id) => own.has(id));
    const photo = form.photo || (form.existing && {
      blob: form.existing.photo,
      width: form.existing.width,
      height: form.existing.height,
    });
    if (!photo) return fail("Add a photo first.");
    if (!store?.validDate(date)) return fail("Choose the date you wore this.");
    if (date > today()) return fail("Choose today or an earlier date.");
    if (note.length > store.LIMITS.note) return fail(`Keep the note under ${store.LIMITS.note} characters.`);
    if (itemIds.length > store.LIMITS.items) return fail(`Link up to ${store.LIMITS.items} pieces.`);
    const stamp = new Date().toISOString();
    const entry = {
      id: form.id || newId(),
      date,
      note,
      itemIds,
      photo: photo.blob,
      width: photo.width,
      height: photo.height,
      created: form.existing?.created || stamp,
      updated: stamp,
    };
    const ticket = form.ticket;
    const scope = form.scope;
    form.saving = true;
    setBusy(false);
    fail("");
    try {
      await store.put(scope, entry);
    } catch {
      if (form?.ticket === ticket) {
        form.saving = false;
        setBusy(false);
        fail("This entry couldn't be saved. The browser may be out of storage space. Nothing was saved.");
      }
      return;
    }
    const editing = Boolean(form?.existing);
    if (form?.ticket === ticket) {
      endForm();
      $("#modal").close();
    }
    toast(editing ? "Diary entry updated." : "Saved to your diary.");
    if (scope === activeDataScope) {
      view = "diary";
      cache.stale = true;
      render();
    }
  }

  function askDelete(id) {
    const e = findEntry(id);
    if (!e) return;
    endForm();
    showDialog(
      "Delete this diary entry?",
      `<p>The photo and note from ${esc(longDate(e.date))} will be removed from this browser. This can't be undone.</p><div class="diary-actions"><button class="diary-secondary" data-action="close">Keep it</button><button class="diary-danger" data-diary-confirm-delete="${
        esc(e.id)
      }">Delete entry</button></div>`,
    );
  }

  async function confirmDelete(id) {
    const scope = activeDataScope;
    if (!findEntry(id)) return;
    $("#modal").close();
    try {
      await store.remove(scope, id);
    } catch {
      toast("The entry could not be deleted. Nothing was changed.");
      return;
    }
    toast("Diary entry deleted.");
    if (scope === activeDataScope) {
      cache.stale = true;
      repaint();
    }
  }

  // The app's page switch (app.js render) shows Style learning for any page
  // it does not know; the Diary page is added here.
  const learnPage = renderLearn;
  renderLearn = () => (view === "diary" ? renderDiary() : learnPage());

  document.addEventListener("click", (event) => {
    const b = event.target.closest?.("button");
    const d = b?.dataset;
    if (!d) return;
    if (d.action === "confirmresetall" && !b.disabled) {
      // Editorial.js clears this account's diary; this reloads after it.
      endForm();
      clearCache();
      repaint();
      return;
    }
    const keys = ["diaryLog", "diaryOpen", "diaryEdit", "diaryDelete", "diaryConfirmDelete"];
    if (!keys.some((k) => d[k] !== undefined)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (b.disabled) return;
    if (d.diaryLog !== undefined) startForm();
    else if (d.diaryOpen) openEntry(d.diaryOpen);
    else if (d.diaryEdit) startForm(d.diaryEdit);
    else if (d.diaryDelete) askDelete(d.diaryDelete);
    else if (d.diaryConfirmDelete) confirmDelete(d.diaryConfirmDelete);
  });
  document.addEventListener("change", (event) => {
    if (event.target?.classList?.contains("diary-file")) receivePhoto(event.target);
  });
  document.addEventListener("input", (event) => {
    if (event.target?.name !== "note" || !event.target.closest?.("#diary-form")) return;
    const count = document.querySelector("#diary-note-count");
    if (count) count.textContent = `${event.target.value.length} / ${store?.LIMITS.note ?? 500}`;
  });
  document.addEventListener("submit", (event) => {
    if (event.target?.id !== "diary-form") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    submitForm(event.target);
  });
  // Closing the dialog any way (Cancel, ×, Escape) drops an unsaved form.
  document.querySelector("#modal")?.addEventListener("close", () => {
    if (!form?.saving) endForm();
  });

  // Account changes: hide the previous account's entries at once.
  if (globalThis.outfitPathCloud) {
    for (const method of ["switchScope", "copyGuestToUser", "replaceData"]) {
      const base = globalThis.outfitPathCloud[method];
      if (typeof base !== "function") continue;
      globalThis.outfitPathCloud[method] = (...args) => {
        if (form || document.querySelector("#modal .diary-view")) $("#modal").close();
        endForm();
        clearCache();
        return base(...args);
      };
    }
  }
})();
