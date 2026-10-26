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
    }</p></div><div class="closet-actions"><button data-edit="${esc(i.id)}" aria-label="Edit ${
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
    if (!b || b.dataset.closetGroup === undefined) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    group = GROUPS.some(([id]) => id === b.dataset.closetGroup) ? b.dataset.closetGroup : "all";
    if (b.dataset.closetClear !== undefined) search = "";
    render();
    document.querySelector(`[data-closet-group="${group}"]`)?.focus?.();
  }, true);
})();
