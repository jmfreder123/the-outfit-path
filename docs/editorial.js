"use strict";

(() => {
  COLORS.rust ||= "#a64b2d";
  COLORS.indigo ||= "#324a70";

  const catalogAssets = {
    "starter-6": [
      "assets/design3/charcoal-trousers.png",
      "Black tailored trousers",
    ],
    "starter-15": ["assets/design3/white-shirt.png", "White button-down"],
    "starter-33": ["assets/design3/blazer.png", "Black tailored blazer"],
    "starter-20": ["assets/design3/ankle-boots.png", "Black ankle boots"],
    "demo-emerald-slip-dress": [
      "assets/design3/emerald-slip-dress.png",
      "Emerald satin slip dress",
    ],
    "demo-patterned-midi-skirt": [
      "assets/design3/patterned-midi-skirt.png",
      "Floral patterned midi skirt",
    ],
    "demo-rust-blazer": [
      "assets/design3/rust-blazer.png",
      "Rust tailored blazer",
    ],
    "demo-cobalt-hoodie": [
      "assets/design3/cobalt-hoodie.png",
      "Cobalt oversized hoodie",
    ],
    "demo-indigo-jeans": [
      "assets/design3/indigo-jeans.png",
      "Indigo straight-leg jeans",
    ],
    "demo-black-sport-leggings": [
      "assets/design3/sport-leggings.png",
      "Black sport leggings",
    ],
    "demo-off-white-chunky-sneakers": [
      "assets/design3/chunky-sneakers.png",
      "Off-white chunky sneakers",
    ],
    "demo-black-crossbody": [
      "assets/design3/crossbody-bag.png",
      "Black leather crossbody bag",
    ],
    "demo-cream-merino-knit": [
      "assets/design3/cream-knit.png",
      "Cream merino crewneck",
    ],
    "demo-brown-leather-loafers": [
      "assets/design3/loafers.png",
      "Brown leather loafers",
    ],
    "demo-black-leather-tote": [
      "assets/design3/tote.png",
      "Black leather tote",
    ],
    "demo-black-leather-watch": [
      "assets/design3/watch.png",
      "Black leather-strap watch",
    ],
  };
  const demoCatalog = [
    {
      id: "demo-emerald-slip-dress",
      name: "Emerald satin slip dress",
      type: "dress",
      color: "green",
      hex: "#075742",
      style: "romantic",
      season: "mild",
      available: true,
      notes: "Fictional catalog sample.",
      catalogSample: true,
    },
    {
      id: "demo-patterned-midi-skirt",
      name: "Floral patterned midi skirt",
      type: "skirt",
      color: "cream",
      hex: "#e5d7b7",
      style: "bold",
      season: "mild",
      available: true,
      notes: "Fictional catalog sample.",
      catalogSample: true,
    },
    {
      id: "demo-rust-blazer",
      name: "Rust tailored blazer",
      type: "layer",
      color: "rust",
      hex: "#a64b2d",
      style: "classic",
      season: "mild",
      available: true,
      notes: "Fictional catalog sample.",
      catalogSample: true,
    },
    {
      id: "demo-cobalt-hoodie",
      name: "Cobalt oversized hoodie",
      type: "top",
      color: "blue",
      hex: "#1456d8",
      style: "relaxed",
      season: "cool",
      available: true,
      notes: "Fictional catalog sample.",
      catalogSample: true,
    },
    {
      id: "demo-indigo-jeans",
      name: "Indigo straight-leg jeans",
      type: "pants",
      color: "indigo",
      hex: "#324a70",
      style: "relaxed",
      season: "all",
      available: true,
      notes: "Fictional catalog sample.",
      catalogSample: true,
    },
    {
      id: "demo-black-sport-leggings",
      name: "Black sport leggings",
      type: "pants",
      color: "black",
      hex: "#202120",
      style: "relaxed",
      season: "all",
      available: true,
      notes: "Fictional catalog sample.",
      catalogSample: true,
    },
    {
      id: "demo-off-white-chunky-sneakers",
      name: "Off-white chunky sneakers",
      type: "sneakers",
      color: "cream",
      hex: "#ede6d6",
      style: "bold",
      season: "all",
      available: true,
      notes: "Fictional catalog sample.",
      catalogSample: true,
    },
    {
      id: "demo-black-crossbody",
      name: "Black leather crossbody bag",
      type: "bag",
      color: "black",
      hex: "#242423",
      style: "classic",
      season: "all",
      available: true,
      notes: "Fictional catalog sample.",
      catalogSample: true,
    },
    {
      id: "demo-cream-merino-knit",
      name: "Cream merino crewneck",
      type: "top",
      color: "cream",
      hex: "#eee7d7",
      style: "classic",
      season: "cool",
      available: true,
      notes: "Fictional catalog sample.",
      catalogSample: true,
    },
    {
      id: "demo-brown-leather-loafers",
      name: "Brown leather loafers",
      type: "flats",
      color: "brown",
      hex: "#4f2e20",
      style: "classic",
      season: "all",
      available: true,
      notes: "Fictional catalog sample.",
      catalogSample: true,
    },
    {
      id: "demo-black-leather-tote",
      name: "Black leather tote",
      type: "bag",
      color: "black",
      hex: "#222221",
      style: "classic",
      season: "all",
      available: true,
      notes: "Fictional catalog sample.",
      catalogSample: true,
    },
    {
      id: "demo-black-leather-watch",
      name: "Black leather-strap watch",
      type: "jewelry",
      color: "black",
      hex: "#262625",
      style: "classic",
      season: "all",
      available: true,
      notes: "Fictional catalog sample.",
      catalogSample: true,
    },
  ];
  const occasionOptions = [
    ["business", "Business"],
    ["business-casual", "Business Casual"],
    ["everyday", "Everyday"],
    ["evening", "Evening"],
    ["sporty", "Sporty"],
    ["streetwear", "Streetwear"],
  ];
  const styleOptions = [
    ["none", "No preference"],
    ["feminine", "Feminine"],
    ["masculine", "Masculine"],
    ["androgynous", "Androgynous"],
  ];
  const occasionToPath = {
    business: "work",
    "business-casual": "work",
    everyday: "everyday",
    evening: "date",
    sporty: "weekend",
    streetwear: "weekend",
  };
  const wardrobeFilters = [
    ["all", "All"],
    ["top", "Tops"],
    ["bottoms", "Bottoms"],
    ["dress", "Dresses"],
    ["layer", "Layers"],
    ["shoes", "Shoes"],
    ["accessories", "Accessories"],
  ];
  const featuredCatalogIds = [
    "demo-emerald-slip-dress",
    "demo-patterned-midi-skirt",
    "demo-rust-blazer",
    "demo-cobalt-hoodie",
    "demo-indigo-jeans",
    "demo-black-sport-leggings",
    "demo-off-white-chunky-sneakers",
    "starter-20",
    "demo-black-crossbody",
  ];
  const baseGarmentArt = garmentArt;
  garmentArt = function editorialGarmentArt(item) {
    const original = item.id.startsWith("starter-")
      ? seed().find((i) => i.id === item.id)
      : demoCatalog.find((i) => i.id === item.id);
    const faithful = original &&
      ["name", "type", "color", "hex"].every((key) =>
        original[key] === item[key]
      );
    const asset = !item.photoId && faithful && catalogAssets[item.id];
    if (!asset) {
      return `<span class="photo-frame" ${
        item.photoId
          ? `data-photo="${esc(item.photoId)}" data-name="${esc(item.name)}"`
          : ""
      }>${
        item.photoId && photoCache.has(item.photoId)
          ? `<img class="garment-photo" src="${
            photoCache.get(item.photoId)
          }" alt="${esc(item.name)}">`
          : `<span class="image-unavailable">${
            esc(item.name)
          }<small>Image unavailable</small></span>`
      }</span>`;
    }
    const webp = asset[0].replace(/\.png$/, ".webp");
    return `<span class="photo-frame demo-photo" data-demo-piece="true"><picture><source srcset="${webp}" type="image/webp"><img class="garment-photo" src="${
      asset[0]
    }" alt="${
      esc(asset[1])
    }" loading="lazy" decoding="async"></picture></span>`;
  };

  board = function editorialBoard(items) {
    const top = items.find((item) => ["top", "dress"].includes(item.type));
    const bottom = items.find((item) => ["skirt", "pants"].includes(item.type));
    const shoes = items.find((item) => SHOES.includes(item.type));
    const bag = items.find((item) => item.type === "bag");
    const layer = items.find((item) => item.type === "layer");
    const jewelry = items.find((item) => item.type === "jewelry");
    return `<div class="moodboard">
      ${layer ? `<div class="garment layer">${garmentArt(layer)}</div>` : ""}
      ${
      top
        ? `<div class="garment top ${top.type === "dress" ? "dress" : ""}">${
          garmentArt(top)
        }</div>`
        : ""
    }
      ${
      bottom && top?.type !== "dress"
        ? `<div class="garment bottom">${garmentArt(bottom)}</div>`
        : ""
    }
      ${shoes ? `<div class="garment shoes">${garmentArt(shoes)}</div>` : ""}
      ${bag ? `<div class="garment bag">${garmentArt(bag)}</div>` : ""}
      ${
      jewelry ? `<div class="garment jewelry">${garmentArt(jewelry)}</div>` : ""
    }
    </div>`;
  };

  const baseFeatures = features;
  features = function editorialFeatures(items, answerSet) {
    const featureSet = baseFeatures(items, answerSet);
    if (answerSet.stylePreference && answerSet.stylePreference !== "none") {
      items.forEach((item) => {
        const key =
          `context:aesthetic:${answerSet.stylePreference}:${item.style}`;
        featureSet[key] = (featureSet[key] || 0) + 1 / items.length;
      });
    }
    return featureSet;
  };

  const basePieceScore = pieceScore;
  pieceScore = function editorialPieceScore(item, answerSet) {
    let score = basePieceScore(item, answerSet);
    const theme = answerSet.occasionTheme || "business-casual";
    const themeBias = {
      business: (item.style === "classic" ? 4 : 0) +
        (item.type === "layer" ? 2 : 0) +
        (["black", "navy", "gray", "white"].includes(item.color) ? 1 : 0),
      "business-casual":
        (["classic", "relaxed"].includes(item.style) ? 2.5 : 0) +
        (["flats", "boots", "layer"].includes(item.type) ? 1 : 0),
      everyday: (item.style === "relaxed" ? 4 : 0) +
        (["sneakers", "flats"].includes(item.type) ? 2 : 0),
      evening: (["romantic", "bold"].includes(item.style) ? 4 : 0) +
        (["dress", "heels"].includes(item.type) ? 3 : 0),
      sporty: (item.style === "relaxed" ? 3 : 0) +
        (["pants", "top", "sneakers"].includes(item.type) ? 3 : 0),
      streetwear: (["bold", "relaxed"].includes(item.style) ? 3 : 0) +
        (["pants", "layer", "sneakers"].includes(item.type) ? 2 : 0),
    }[theme] || 0;
    const preference = answerSet.stylePreference || "none";
    const preferenceBias = {
      feminine: item.style === "romantic" ? 5 : item.style === "bold" ? 1 : 0,
      masculine: item.style === "classic"
        ? 5
        : item.style === "relaxed"
        ? 1
        : 0,
      androgynous: ["relaxed", "bold"].includes(item.style) ? 4 : 0,
    }[preference] || 0;
    return score + themeBias + preferenceBias;
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const slots = ["shape", "top", "shoes", "layer", "bag", "jewelry"];
  const slotName = {
    shape: "dress or bottom",
    top: "top",
    shoes: "shoes",
    layer: "layer",
    bag: "bag",
    jewelry: "jewelry",
  };
  const slotOf = (item) =>
    ["dress", "skirt", "pants"].includes(item.type)
      ? "shape"
      : SHOES.includes(item.type)
      ? "shoes"
      : slots.includes(item.type)
      ? item.type
      : "";
  function localDateKey(date = new Date()) {
    return `${date.getFullYear()}-${
      String(date.getMonth() + 1).padStart(2, "0")
    }-${String(date.getDate()).padStart(2, "0")}`;
  }
  function dateFromKey(key) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key || "")) return null;
    const [y, m, d] = key.split("-").map(Number),
      date = new Date(y, m - 1, d, 12);
    return localDateKey(date) === key ? date : null;
  }
  function shiftDate(key, amount) {
    const d = dateFromKey(key);
    d.setDate(d.getDate() + amount);
    return localDateKey(d);
  }
  function dateLabel(key) {
    return key
      ? dateFromKey(key)?.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }) || "Date not recorded"
      : "Date not recorded";
  }
  const defaults = () => ({
    shape: "surprise",
    shoes: "any",
    occasion: "everyday",
    weather: "mild",
    mood: "classic",
    palette: "neutral",
    finish: "balanced",
    occasionTheme: "everyday",
    stylePreference: "none",
  });
  const fresh = () => ({
    items: [],
    pins: [],
    answers: defaults(),
    dirty: false,
    sourceId: null,
    readOnly: false,
    variant: 0,
  });
  let planningDate = localDateKey(),
    draft = fresh(),
    drafts = new Map(),
    source = "owned";
  let wardrobeOpen = true,
    editorialFilter = "all",
    notice = "",
    pendingReplacement = null,
    refineOpen = false,
    saving = false,
    saveTicket = null;
  const owned = () =>
    data.items.filter((i) => {
      if (!i.available) return false;
      if (!i.id.startsWith("starter-") || i.ownedCopy) return true;
      const original = seed().find((s) => s.id === i.id);
      return original &&
        ["name", "type", "color", "hex", "style", "season", "notes", "photoId"]
          .some((key) => (i[key] || "") !== (original[key] || ""));
    });
  const samples =
    () => [...demoCatalog, ...seed().filter((i) => catalogAssets[i.id])];
  const pool = () => source === "sample" ? samples() : owned();
  const draftKey = () => `${source}:${planningDate}`;
  function remember() {
    drafts.set(draftKey(), clone(draft));
  }
  function navigateDate(date) {
    if (!dateFromKey(date)) return;
    remember();
    planningDate = date;
    draft = clone(drafts.get(draftKey()) || fresh());
    pendingReplacement = null;
    notice = "";
    refineOpen = false;
    result = null;
  }
  function changed(message) {
    draft.dirty = true;
    notice = message;
    pendingReplacement = null;
    remember();
  }
  function focus(selector) {
    queueMicrotask(() =>
      document.querySelector(selector)?.focus({ preventScroll: true })
    );
  }
  function repaint(selector = "") {
    render();
    if (selector) focus(selector);
  }
  function selectItem(id, confirmed = false) {
    if (draft.readOnly) return;
    const item = pool().find((i) => i.id === id);
    if (!item) return;
    const slot = slotOf(item);
    if (!slot) {
      notice = "Choose a supported clothing category first.";
      return;
    }
    const existing = draft.items.find((i) => i.id === id);
    if (existing) {
      if (!draft.pins.includes(id)) {
        draft.pins.push(id);
        changed(`${item.name} pinned.`);
      } else notice = `${item.name} is already in this look and pinned.`;
      return;
    }
    const conflicts = draft.items.filter((i) =>
      slotOf(i) === slot || item.type === "dress" && i.type === "top" ||
      item.type === "top" && i.type === "dress"
    );
    const pinned = conflicts.filter((i) => draft.pins.includes(i.id));
    if (pinned.length && !confirmed) {
      pendingReplacement = { id, conflicts: pinned.map((i) => i.name) };
      notice = "";
      return;
    }
    const removed = new Set(conflicts.map((i) => i.id));
    draft.items = draft.items.filter((i) => !removed.has(i.id));
    draft.pins = draft.pins.filter((id) => !removed.has(id));
    draft.items.push(clone(item));
    draft.pins.push(id);
    changed(`${item.name} added and pinned.`);
  }
  function suggest() {
    if (draft.readOnly) return;
    const available = pool();
    const before = clone(draft);
    try {
      const assignments = Object.fromEntries(
        draft.items.map((i) => [slotOf(i), i]),
      );
      const pinned = (slot) =>
        assignments[slot] && draft.pins.includes(assignments[slot].id);
      const theme = draft.answers.occasionTheme,
        preference = draft.answers.stylePreference;
      function pick(slot, predicate = () => true) {
        if (pinned(slot)) return assignments[slot];
        const old = assignments[slot];
        const ranked = available.filter((i) =>
          slotOf(i) === slot && predicate(i)
        ).sort((a, b) =>
          pieceScore(b, draft.answers) - pieceScore(a, draft.answers) ||
          a.id.localeCompare(b.id)
        );
        const alternatives = ranked.filter((i) => i.id !== old?.id);
        // Preference ranking is always used; variety cycles only among the best alternatives.
        return alternatives.length
          ? alternatives[draft.variant % Math.min(2, alternatives.length)]
          : old || ranked[0];
      }
      const pinnedDress = pinned("shape") && assignments.shape.type === "dress";
      const separates = pinned("top") ||
        pinned("shape") && assignments.shape.type !== "dress" ||
        !pinnedDress && assignments.shape && assignments.shape.type !== "dress";
      if (!pinned("shape")) {
        const preferDress = !separates &&
          (assignments.shape?.type === "dress" || theme === "evening" ||
            preference === "feminine");
        const candidates = available.filter((i) => slotOf(i) === "shape");
        const useDress = preferDress && candidates.some((i) =>
              i.type === "dress"
            ) || !separates && !candidates.some((i) => i.type !== "dress");
        assignments.shape = pick(
          "shape",
          (i) => useDress ? i.type === "dress" : i.type !== "dress",
        );
      }
      if (assignments.shape?.type === "dress") delete assignments.top;
      else assignments.top = pick("top");
      // Complete missing compatible roles even if every existing item is pinned.
      for (const slot of ["shoes", "layer", "bag", "jewelry"]) {
        assignments[slot] = pick(slot);
      }
      const next = slots.map((slot) => assignments[slot]).filter(Boolean);
      const changedIds = next.map((i) =>
        i.id
      ).join(",") !== draft.items.map((i) => i.id).join(",");
      draft.items = clone(next);
      draft.variant++;
      if (changedIds) {
        changed("Suggestion ready. Your pinned pieces stayed in place.");
      } else {notice = draft.items.length && draft.items.every((i) =>
            draft.pins.includes(i.id)
          )
          ? "Everything available is pinned. Unpin an item to get alternatives."
          : "No other compatible pieces in this wardrobe. You can still save this look or choose items manually.";}
    } catch {
      draft = before;
      notice =
        "Suggestion could not be completed. Your look is unchanged; try again or choose items.";
    }
  }
  function filterMatch(i) {
    return editorialFilter === "all" ||
      editorialFilter === "bottoms" && ["pants", "skirt"].includes(i.type) ||
      editorialFilter === "shoes" && SHOES.includes(i.type) ||
      editorialFilter === "accessories" &&
        ["bag", "jewelry"].includes(i.type) ||
      i.type === editorialFilter;
  }
  function dateControls() {
    return `<div class="editorial-date-nav"><button data-day="-1" aria-label="Previous day">←</button><label><span>${
      planningDate === localDateKey() ? "Today" : esc(dateLabel(planningDate))
    }</span><input aria-label="Outfit date" type="date" name="simple-date" value="${
      esc(planningDate)
    }"></label><button data-today ${
      planningDate === localDateKey() ? "disabled" : ""
    }>Today</button><button data-day="1" aria-label="Next day">→</button></div>`;
  }
  function preferences() {
    if (draft.readOnly) {
      return `<p>Occasion · ${
        esc(
          occasionOptions.find(([id]) => id === draft.answers.occasionTheme)
            ?.[1] || labels[draft.answers.occasion],
        )
      }<br>Style · ${
        esc(
          styleOptions.find(([id]) => id === draft.answers.stylePreference)
            ?.[1] || "No preference",
        )
      }</p>`;
    }
    return `<div class="simple-preferences"><label>Occasion<select name="simple-occasion">${
      occasionOptions.map(([id, label]) =>
        `<option value="${id}" ${
          draft.answers.occasionTheme === id ? "selected" : ""
        }>${label}</option>`
      ).join("")
    }</select></label><div class="simple-refine"><button data-refine aria-expanded="${refineOpen}" aria-controls="refine-panel">Refine${
      draft.answers.stylePreference !== "none"
        ? " · " + esc(
          styleOptions.find(([id]) => id === draft.answers.stylePreference)
            ?.[1],
        )
        : ""
    }</button>${
      refineOpen
        ? `<section id="refine-panel" aria-label="Refine suggestion"><label>Style (optional)<select name="simple-style">${
          styleOptions.map(([id, label]) =>
            `<option value="${id}" ${
              draft.answers.stylePreference === id ? "selected" : ""
            }>${label}</option>`
          ).join("")
        }</select></label><p>Every style is open to everyone. Used for your next suggestion.</p><button data-refine>Done</button></section>`
        : ""
    }</div></div>`;
  }
  function wardrobePane() {
    const list = pool().filter(filterMatch);
    return `<section class="editorial-wardrobe" aria-labelledby="wardrobe-heading"><div class="editorial-wardrobe-heading"><div><h2 id="wardrobe-heading">${
      source === "sample" ? "Sample wardrobe" : "Your wardrobe. Your rules."
    }</h2><p>${
      draft.readOnly
        ? "Read-only preview. Choose Edit this look to make changes."
        : "Tap a piece to add and pin it."
    }</p></div><button data-close-wardrobe aria-label="Close wardrobe panel">×</button></div><label class="simple-source">Browse<select name="simple-source" ${
      draft.readOnly ? "disabled" : ""
    }><option value="owned" ${
      source === "owned" ? "selected" : ""
    }>My wardrobe</option><option value="sample" ${
      source === "sample" ? "selected" : ""
    }>Sample wardrobe · fictional demo</option></select></label><div class="editorial-filter-row" aria-label="Filter wardrobe">${
      wardrobeFilters.map(([id, label]) =>
        `<button data-simple-filter="${id}" aria-pressed="${
          editorialFilter === id
        }" class="${editorialFilter === id ? "active" : ""}">${label}</button>`
      ).join("")
    }</div><div class="editorial-piece-grid" aria-label="Wardrobe pieces">${
      list.map((i) =>
        `<button class="editorial-piece simple-card" data-select-piece="${
          esc(i.id)
        }" ${draft.readOnly ? "disabled" : ""} aria-label="Add and pin ${
          esc(i.name)
        }" aria-describedby="state-${
          esc(i.id)
        }"><span class="editorial-piece-art">${garmentArt(i)}</span><strong>${
          esc(i.name)
        }</strong><small id="state-${esc(i.id)}">${
          draft.items.some((p) => p.id === i.id)
            ? draft.readOnly
              ? "Saved item"
              : draft.pins.includes(i.id)
              ? "In this look · Pinned"
              : "In this look · Unpinned"
            : source === "sample"
            ? "Fictional sample"
            : i.ownedCopy
            ? "Deliberately added sample"
            : "Your piece"
        }</small></button>`
      ).join("")
    }</div>${
      !list.length
        ? "<p>No clothes here yet. Add an item, or explore the separate sample wardrobe.</p>"
        : ""
    }${
      draft.readOnly
        ? ""
        : '<button class="editorial-secondary" data-action="additem">Add an item</button>'
    }<p class="editorial-sample-note">${
      source === "sample"
        ? "Fictional samples are separate from your closet. Sample previews cannot be saved as owned looks."
        : "Only your available pieces are suggested. Existing starter records are preserved in My Closet."
    }</p></section>`;
  }
  function renderSimpleBuilder() {
    const partial = !draft.items.some((i) => i.type === "dress") &&
        !(draft.items.some((i) => i.type === "top") &&
          draft.items.some((i) => ["pants", "skirt"].includes(i.type))) ||
      !draft.items.some((i) => SHOES.includes(i.type));
    return `<div class="editorial-shell simple-builder ${
      wardrobeOpen ? "" : "wardrobe-closed"
    }"><section class="editorial-stage" aria-labelledby="look-heading">${dateControls()}<div class="editorial-stage-top"><h1 id="look-heading">${
      draft.readOnly
        ? "Your saved look"
        : draft.items.length
        ? "Build around a favourite."
        : "A little direction for your day."
    }</h1>${
      wardrobeOpen ? "" : "<button data-open-wardrobe>Open wardrobe</button>"
    }</div>${preferences()}<p class="editorial-preview-note">${
      source === "sample" ? "Sample wardrobe · fictional demo" : "My wardrobe"
    }</p><div class="editorial-canvas" aria-label="Outfit canvas">${
      draft.items.length
        ? board(draft.items)
        : `<div class="simple-empty"><h2>${
          pool().length
            ? "Choose an item, or Suggest a look."
            : "Your closet starts here."
        }</h2><p>${
          pool().length
            ? "Chosen items stay pinned. Suggestions change only unpinned items."
            : "No clothes added yet. Add a clothing item or accessory."
        }</p></div>`
    }</div><p>${
      draft.readOnly
        ? `Saved${
          draft.sourceDate
            ? " for " + esc(dateLabel(draft.sourceDate))
            : " · date not recorded"
        }`
        : draft.dirty
        ? "Unsaved changes · " + draft.pins.length + " pinned"
        : "Unsaved draft"
    }${
      partial && draft.items.length && !draft.readOnly
        ? " · Partial look; you can save it as it is."
        : ""
    }</p>${
      pendingReplacement
        ? `<section class="simple-confirm" role="region" aria-labelledby="replace-question"><h2 id="replace-question" tabindex="-1">Replace ${
          esc(pendingReplacement.conflicts.join(" and "))
        } with ${
          esc(pool().find((i) => i.id === pendingReplacement.id)?.name)
        }?</h2><p>The current pieces stay pinned until you confirm. This may leave a partial look.</p><button data-cancel-replace>Cancel</button><button data-confirm-replace>Replace</button></section>`
        : ""
    }${
      notice
        ? `<div class="editorial-status" role="status">${
          esc(notice)
        } <button data-dismiss>Dismiss</button></div>`
        : ""
    }<div class="simple-actions">${
      draft.readOnly
        ? "<button data-edit-saved>Edit this look</button><button data-new-draft>New look for this date</button>"
        : `<button class="editorial-primary" data-save-draft ${
          !draft.items.length || saving || source === "sample" ? "disabled" : ""
        }>${
          draft.sourceId ? "Update saved look" : "Save look"
        }</button><button data-suggest ${!pool().length ? "disabled" : ""}>${
          draft.items.length ? "Suggest the rest" : "Suggest a look"
        }</button>`
    }</div><p class="editorial-preview-note">Local rule-based suggestions</p><section class="simple-selected" aria-label="In this look"><h2 tabindex="-1" id="selected-heading">In this look${
      draft.readOnly ? " · Read only" : ""
    }</h2>${
      draft.items.map((i) =>
        `<div class="simple-selected-row"><span><strong>${
          esc(i.name)
        }</strong><small>${
          draft.readOnly
            ? "Saved item"
            : draft.pins.includes(i.id)
            ? "Pinned"
            : "Unpinned"
        }</small></span>${
          draft.readOnly
            ? ""
            : `<button data-pin-piece="${esc(i.id)}" aria-label="${
              draft.pins.includes(i.id) ? "Unpin" : "Pin"
            } ${esc(i.name)}">${
              draft.pins.includes(i.id) ? "Unpin" : "Pin"
            }</button><button data-remove-piece="${
              esc(i.id)
            }" aria-label="Remove ${esc(i.name)}">Remove</button>`
        }</div>`
      ).join("")
    }</section>${
      !draft.readOnly
        ? '<p class="editorial-preview-note">Unsaved drafts stay for this session only. Save before refreshing or closing.</p>'
        : ""
    }</section>${wardrobeOpen ? wardrobePane() : ""}</div>`;
  }
  renderBuilder = renderSimpleBuilder;
  renderResult = renderSimpleBuilder;
  previewItems = () => draft.items;
  const card = (look) =>
    `<article class="look-card">${board(look.items)}<h3>${
      esc(look.name || "Saved look")
    }</h3><p>${
      look.plannedDate ? esc(dateLabel(look.plannedDate)) : "Date not recorded"
    }</p><button data-openlook="${esc(look.id)}">Open look</button></article>`;
  renderLooks = () =>
    heading(
      "LOOKBOOK",
      "Your saved looks.",
      "Browse dates; opening a look is read only.",
    ) + dateControls() +
    data.looks.filter((l) => l.plannedDate === planningDate).map(card).join(
      "",
    ) + `<h2>Earlier undated looks</h2>` +
    data.looks.filter((l) => !l.plannedDate).map(card).join("");
  function openSaved(id, discard = false) {
    const look = data.looks.find((l) => l.id === id);
    if (!look) return;
    const date = look.plannedDate || planningDate,
      targetSource = look.items.some((i) => i.catalogSample)
        ? "sample"
        : "owned";
    const current = date === planningDate && source === targetSource
      ? draft
      : drafts.get(`${targetSource}:${date}`);
    if (current?.dirty && !discard) {
      openModal(
        "Keep your unsaved draft?",
        `<p>A draft already exists for this date. Keep it, or discard that session draft to open the saved look.</p><button data-action="close">Keep draft</button><button data-discard-open="${
          esc(id)
        }">Discard draft and open</button>`,
      );
      return;
    }
    remember();
    planningDate = date;
    source = targetSource;
    draft = {
      ...fresh(),
      items: clone(look.items),
      pins: look.items.map((i) => i.id),
      answers: { ...defaults(), ...look.answers },
      sourceId: look.id,
      sourceDate: look.plannedDate,
      readOnly: true,
    };
    result = null;
    pendingReplacement = null;
    notice = "";
    view = "builder";
    remember();
    repaint();
  }
  document.addEventListener("click", (event) => {
    const closeRefine = refineOpen && !event.target.closest(".simple-refine");
    if (closeRefine) refineOpen = false;
    const target = event.target.closest("button");
    if (!target) {
      if (closeRefine) repaint();
      return;
    }
    const d = target.dataset;
    const handled = [
      "selectPiece",
      "pinPiece",
      "removePiece",
      "suggest",
      "saveDraft",
      "newDraft",
      "editSaved",
      "confirmReplace",
      "cancelReplace",
      "dismiss",
      "day",
      "today",
      "refine",
      "simpleFilter",
      "closeWardrobe",
      "openWardrobe",
      "openlook",
      "discardOpen",
    ].some((k) => d[k] !== undefined) ||
      ["newlook", "restart", "savelook", "shuffle", "editpath"].includes(
        d.action,
      );
    if (!handled) {
      if (closeRefine) repaint();
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    if (target.disabled) return;
    let after = "";
    if (d.openlook) {
      openSaved(d.openlook);
      return;
    }
    if (d.discardOpen) {
      $("#modal").close();
      openSaved(d.discardOpen, true);
      return;
    }
    if (d.selectPiece) {
      selectItem(d.selectPiece);
      after = pendingReplacement
        ? "#replace-question"
        : `[data-select-piece="${d.selectPiece}"]`;
    }
    if (d.confirmReplace !== undefined) {
      const id = pendingReplacement?.id;
      if (id) selectItem(id, true);
      after = `[data-select-piece="${id}"]`;
    }
    if (d.cancelReplace !== undefined) {
      after = `[data-select-piece="${pendingReplacement?.id}"]`;
      pendingReplacement = null;
      notice = "Replacement cancelled. Your look is unchanged.";
    }
    if (d.pinPiece && !draft.readOnly) {
      draft.pins = draft.pins.includes(d.pinPiece)
        ? draft.pins.filter((id) => id !== d.pinPiece)
        : [...draft.pins, d.pinPiece];
      changed("Pin updated. The item remains in your look.");
      after = `[data-pin-piece="${d.pinPiece}"]`;
    }
    if (d.removePiece && !draft.readOnly) {
      draft.items = draft.items.filter((i) => i.id !== d.removePiece);
      draft.pins = draft.pins.filter((id) => id !== d.removePiece);
      changed("Piece removed from this draft. Your wardrobe is unchanged.");
      after = "#selected-heading";
    }
    if (d.suggest !== undefined) {
      suggest();
      after = "[data-suggest]";
    }
    if (d.dismiss !== undefined) notice = "";
    if (d.day !== undefined) {
      navigateDate(shiftDate(planningDate, Number(d.day)));
      after = `[data-day="${d.day}"]`;
    }
    if (d.today !== undefined) {
      navigateDate(localDateKey());
      after = '[name="simple-date"]';
    }
    if (d.refine !== undefined) {
      refineOpen = !refineOpen;
      after = refineOpen ? '[name="simple-style"]' : "[data-refine]";
    }
    if (d.simpleFilter !== undefined) editorialFilter = d.simpleFilter;
    if (d.closeWardrobe !== undefined) {
      wardrobeOpen = false;
      after = "[data-open-wardrobe]";
    }
    if (d.openWardrobe !== undefined) {
      wardrobeOpen = true;
      after = "[data-close-wardrobe]";
    }
    if (d.newDraft !== undefined) {
      draft = fresh();
      notice = "New unsaved look for this date. Existing saves are unchanged.";
      remember();
    }
    if (d.editSaved !== undefined) {
      draft.readOnly = false;
      draft.pins = draft.items.map((i) => i.id);
      notice = "Editing a copy. Only Update saved look commits your changes.";
    }
    if (d.action === "newlook" || d.action === "restart") {
      view = "builder";
      result = null;
      notice = "Your session draft is ready.";
    }
    if (d.saveDraft !== undefined) {
      if (draft.readOnly || !draft.items.length || source === "sample") return;
      saveTicket = {
        draft,
        scope: activeDataScope,
        date: planningDate,
        source,
      };
      openModal(
        draft.sourceId ? "Update saved look" : "Save this look",
        `<form id="simple-look-form"><label>Look name<input name="name" maxlength="80" required value="${
          esc(
            data.looks.find((l) => l.id === draft.sourceId)?.name || "My look",
          )
        }"></label><p>${
          esc(dateLabel(planningDate))
        } · ${draft.items.length} pieces</p><button type="submit" class="btn primary">${
          draft.sourceId ? "Update saved look" : "Save look"
        }</button><p role="status" id="simple-save-error"></p></form>`,
      );
      return;
    }
    repaint(after);
  }, true);
  document.addEventListener("change", (event) => {
    const name = event.target.name, value = event.target.value;
    if (
      !["simple-date", "simple-source", "simple-occasion", "simple-style"]
        .includes(name)
    ) return;
    if (name === "simple-date") navigateDate(value);
    else if (name === "simple-source" && !draft.readOnly) {
      remember();
      source = value === "sample" ? "sample" : "owned";
      draft = clone(drafts.get(draftKey()) || fresh());
      pendingReplacement = null;
      notice = "";
    } else if (!draft.readOnly) {
      if (name === "simple-occasion") {
        draft.answers.occasionTheme = value;
        draft.answers.occasion = occasionToPath[value];
      } else draft.answers.stylePreference = value;
      draft.variant = 0;
      changed(
        "Used for your next suggestion. Your current pieces are unchanged.",
      );
    }
    repaint(`[name="${name}"]`);
  });
  document.addEventListener("submit", (event) => {
    if (event.target.id !== "simple-look-form") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (saving || draft.readOnly || source !== "owned") return;
    if (
      !saveTicket || saveTicket.draft !== draft ||
      saveTicket.scope !== activeDataScope ||
      saveTicket.date !== planningDate || saveTicket.source !== source
    ) {
      $("#modal").close();
      notice =
        "The draft or account changed. Review this look and choose Save again.";
      repaint();
      return;
    }
    const name = new FormData(event.target).get("name")?.trim();
    if (!name) return;
    saving = true;
    const before = data.looks.slice();
    const existing = data.looks.find((l) => l.id === draft.sourceId);
    const look = {
      id: existing?.id || uid(),
      items: clone(draft.items),
      answers: clone(draft.answers),
      created: existing?.created || new Date().toISOString(),
      rating: existing?.rating ?? null,
      name,
    };
    if (!existing || draft.sourceDate) {
      look.plannedDate = existing ? draft.sourceDate : planningDate;
    }
    data.looks = existing
      ? data.looks.map((l) => l.id === existing.id ? look : l)
      : [...data.looks, look];
    if (!save()) {
      data.looks = before;
      saving = false;
      $("#simple-save-error").textContent =
        "Could not save. Your draft is intact; try again.";
      return;
    }
    saving = false;
    draft.sourceId = look.id;
    draft.sourceDate = look.plannedDate;
    draft.dirty = false;
    draft.readOnly = true;
    remember();
    $("#modal").close();
    notice = "Saved to your lookbook.";
    repaint("[data-edit-saved]");
  }, true);
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (pendingReplacement) {
      const id = pendingReplacement.id;
      pendingReplacement = null;
      repaint(`[data-select-piece="${id}"]`);
    } else if (refineOpen) {
      refineOpen = false;
      repaint("[data-refine]");
    } else if (wardrobeOpen && !$("#modal").open) {
      wardrobeOpen = false;
      repaint("[data-open-wardrobe]");
    }
  });
  window.addEventListener?.("beforeunload", (event) => {
    if (draft.dirty || [...drafts.values()].some((d) => d.dirty)) {
      event.preventDefault();
      event.returnValue = "";
    }
  });
  function resetSession() {
    saveTicket = null;
    drafts.clear();
    draft = fresh();
    planningDate = localDateKey();
    source = "owned";
    pendingReplacement = null;
    refineOpen = false;
    notice = "";
    result = null;
  }
  if (globalThis.outfitPathCloud) {
    for (const method of ["switchScope", "copyGuestToUser", "replaceData"]) {
      const base = globalThis.outfitPathCloud[method];
      globalThis.outfitPathCloud[method] = (...args) => {
        resetSession();
        return base(...args);
      };
    }
  }
  document.addEventListener("error", (event) => {
    const img = event.target;
    if (img?.tagName !== "IMG" || !img.closest(".photo-frame")) return;
    const frame = img.closest(".photo-frame");
    frame.innerHTML = `<span class="image-unavailable">${
      esc(img.alt || "Garment")
    }<small>Image unavailable</small></span>`;
  }, true);
  render();
})();
