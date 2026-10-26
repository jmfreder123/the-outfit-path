"use strict";

// Closet page: the clothes the person owns in this account. Adding, editing
// and availability use the app's existing actions (app.js and scanner.js).
(() => {
  const GROUPS = [
    ["all", "All", () => true],
    ["tops", "Tops", (i) => i.type === "top"],
    ["bottoms", "Bottoms", (i) => i.type === "pants" || i.type === "skirt"],
    ["dresses", "Dresses", (i) => i.type === "dress"],
    ["layers", "Layers", (i) => i.type === "layer"],
    ["shoes", "Shoes", (i) => SHOES.includes(i.type)],
    ["accessories", "Accessories", (i) => i.type === "bag" || i.type === "jewelry"],
  ];
  const TYPE_NAMES = {
    skirt: "Skirt",
    pants: "Pants",
    dress: "Dress",
    top: "Top",
    boots: "Boots",
    heels: "Heels",
    flats: "Flats",
    sneakers: "Sneakers",
    sandals: "Sandals",
    layer: "Layer",
    bag: "Bag",
    jewelry: "Jewelry",
  };
  let group = "all";
  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
  const cap = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1);

  function card(i) {
    return `<li class="closet-card${i.available ? "" : " is-away"}"><div class="closet-art">${
      garmentArt(i)
    }${
      i.available ? "" : '<span class="closet-away">Not available</span>'
    }</div><div class="closet-body"><h3>${esc(i.name)}</h3><p>${esc(cap(i.color))} · ${
      esc(TYPE_NAMES[i.type] || i.type)
    }</p></div><div class="closet-actions">${
      i.photoId ? "" : `<button data-closet-photo="${esc(i.id)}" aria-label="Add a photo of ${esc(i.name)}">Add a photo</button>`
    }<button data-edit="${esc(i.id)}" aria-label="Edit ${
      esc(i.name)
    }">Edit</button><button data-toggle="${esc(i.id)}" aria-label="${
      i.available ? "Mark not available" : "Mark available"
    }: ${esc(i.name)}">${i.available ? "Mark not available" : "Mark available"}</button></div></li>`;
  }

  function examplesNote() {
    const n = globalThis.outfitPathPlan?.exampleCount?.() || 0;
    return n
      ? `<p class="closet-examples">${plural(n, "example piece")} from an earlier version of the app ${
        n === 1 ? "is" : "are"
      } still in this closet. They aren't used for suggestions until you edit them. <button class="plan-link" data-remove-examples>Remove examples</button></p>`
      : "";
  }

  function closetPage() {
    const items = data.items;
    const head = `<div class="saved-head closet-head"><div><h1>Closet</h1><p>The clothes you own. Plan suggests looks from the pieces marked available.</p></div><div class="closet-add"><button class="diary-log" data-action="scan">Scan a piece</button><button class="diary-secondary" data-action="additem">Add by hand</button></div></div>`;
    if (!items.length) {
      return `<div class="saved-page closet-page">${head}<section class="diary-empty closet-empty"><h2>Your closet is empty</h2><p>Add the clothes you own, one piece at a time. Scan a photo and the app suggests the type and color, or enter the details yourself. Photos stay on this device.</p><p>To try the app first, open Plan and choose Samples.</p><div class="diary-actions"><button class="diary-log" data-action="scan">Scan a piece</button><button class="diary-secondary" data-action="additem">Add by hand</button><button class="diary-secondary" data-view="builder">Go to Plan</button></div></section></div>`;
    }
    const match = GROUPS.find(([id]) => id === group)?.[2] || (() => true);
    const term = String(search || "").trim().toLowerCase();
    const list = items.filter((i) => match(i) && (!term || i.name.toLowerCase().includes(term)));
    const available = items.filter((i) => i.available).length;
    return `<div class="saved-page closet-page">${head}${examplesNote()}<div class="closet-tools"><label class="closet-search"><span class="plan-sr">Search your closet</span><input id="search" type="search" placeholder="Search by name" value="${
      esc(search || "")
    }" autocomplete="off"></label><p class="closet-count">${plural(items.length, "piece")} · ${available} available</p></div><div class="plan-chips closet-chips" role="group" aria-label="Filter closet">${
      GROUPS.map(([id, label]) =>
        `<button data-closet-group="${id}" aria-pressed="${group === id}" class="${group === id ? "active" : ""}">${label}</button>`
      ).join("")
    }</div>${
      list.length
        ? `<ul class="closet-grid-new">${list.map(card).join("")}</ul>`
        : `<p class="saved-empty">No pieces match. <button class="plan-link" data-closet-group="all" data-closet-clear>Show all</button></p>`
    }<p class="closet-hint">Pieces marked not available stay here but aren't used in new suggestions. Saved looks keep the pieces as they were.</p></div>`;
  }

  // app.js decides which page to draw; only the Closet page is replaced.
  renderCloset = closetPage;

  // Add a photo to a piece that has none. The photo is checked for explicit
  // content on this device, reduced like a scanned photo, and stored only
  // after it passes. Nothing changes if any step fails.
  let photoFor = null;
  function askPhoto(id) {
    const item = data.items.find((i) => i.id === id);
    if (!item || item.photoId) return;
    photoFor = { id, scope: activeDataScope };
    openModal(
      "Add a photo",
      `<p>Take or choose a photo of ${esc(item.name)} on its own, against a plain background. It is checked on this device and stays on it.</p><div class="diary-pick-row"><label class="diary-pick diary-camera"><input class="closet-file" type="file" accept="image/*" capture="environment">Take a photo</label><label class="diary-pick"><input class="closet-file" type="file" accept="image/*">Choose a photo</label></div><p id="closet-photo-status" class="diary-status" role="status" aria-live="polite"></p>`,
    );
  }
  async function receivePhoto(input) {
    const file = input.files?.[0];
    input.value = "";
    const target = photoFor;
    if (!file || !target) return;
    const status = (text) => {
      const el = document.querySelector("#closet-photo-status");
      if (el) el.textContent = text;
    };
    for (const i of document.querySelectorAll(".closet-file")) i.disabled = true;
    status("Checking this photo on your device… The first check can take a few seconds.");
    const enable = () => {
      for (const i of document.querySelectorAll(".closet-file")) i.disabled = false;
    };
    const screening = globalThis.outfitPathScreening;
    const checked = screening ? await screening.screenFile(file) : { ok: false, reason: "unavailable" };
    if (photoFor !== target) return;
    if (!checked.ok) {
      enable();
      status(screening ? screening.message(checked) : "Photo checking isn't available right now, so photos can't be saved.");
      return;
    }
    let photo;
    try {
      photo = (await preparePhoto(file)).photo;
    } catch (error) {
      if (photoFor !== target) return;
      enable();
      status(error?.message || "This photo couldn't be opened.");
      return;
    }
    const item = data.items.find((i) => i.id === target.id);
    if (photoFor !== target || target.scope !== activeDataScope || !item || item.photoId) return;
    const photoId = uid();
    try {
      await storePhotos({ [photoId]: photo });
    } catch {
      enable();
      status("The photo couldn't be saved. Free some device storage and try again.");
      return;
    }
    if (photoFor !== target || target.scope !== activeDataScope) return;
    item.photoId = photoId;
    if (!save()) {
      delete item.photoId;
      enable();
      status("The photo couldn't be saved. Nothing was changed.");
      return;
    }
    photoCache.set(photoId, photo);
    photoFor = null;
    $("#modal").close();
    render();
    toast("Photo added.");
  }
  document.addEventListener("change", (event) => {
    if (event.target?.classList?.contains("closet-file")) receivePhoto(event.target);
  });
  document.querySelector("#modal")?.addEventListener?.("close", () => {
    photoFor = null;
  });

  // Availability: same action as before, but a failed save is undone.
  function toggleAvailable(id) {
    const item = data.items.find((i) => i.id === id);
    if (!item) return;
    item.available = !item.available;
    if (!save()) {
      item.available = !item.available;
      toast("This change could not be saved. Nothing was changed.");
    }
    render();
    if (/^[\w-]+$/.test(id)) document.querySelector(`[data-toggle="${id}"]`)?.focus?.();
  }

  document.addEventListener("click", (event) => {
    const b = event.target.closest?.("button");
    if (b?.dataset?.toggle && view === "closet") {
      event.preventDefault();
      event.stopImmediatePropagation();
      toggleAvailable(b.dataset.toggle);
      return;
    }
    if (b?.dataset?.closetPhoto) {
      event.preventDefault();
      event.stopImmediatePropagation();
      askPhoto(b.dataset.closetPhoto);
      return;
    }
    if (!b || b.dataset.closetGroup === undefined) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    group = GROUPS.some(([id]) => id === b.dataset.closetGroup) ? b.dataset.closetGroup : "all";
    if (b.dataset.closetClear !== undefined) search = "";
    render();
    document.querySelector(`[data-closet-group="${group}"]`)?.focus?.();
  }, true);
})();
