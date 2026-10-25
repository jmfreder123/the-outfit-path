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
  // An approved photo is shown only for an unedited sample or starter record.
  function assetFor(item) {
    const original = item.id.startsWith("starter-")
      ? seed().find((i) => i.id === item.id)
      : demoCatalog.find((i) => i.id === item.id);
    const faithful = original &&
      ["name", "type", "color", "hex"].every((key) =>
        original[key] === item[key]
      );
    return (!item.photoId && faithful && catalogAssets[item.id]) || null;
  }
  garmentArt = function editorialGarmentArt(item) {
    const asset = assetFor(item);
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

  // Flat-lay board. Each approved photo has one approximate laid-flat size in
  // cm (the other side comes from the photo's own proportions) and the
  // garment's bounds inside the 1254px source image. The bounds trim only
  // transparent margin; no garment detail is cropped, stretched or recoloured.
  const SOURCE_PX = 1254;
  const assetShape = {
    "ankle-boots": { w: 32, box: [218, 306, 1052, 971] },
    "blazer": { w: 58, box: [109, 64, 1146, 1184] },
    "charcoal-trousers": { h: 104, box: [336, 37, 919, 1216] },
    "chunky-sneakers": { w: 36, box: [9, 98, 1246, 1145] },
    "cobalt-hoodie": { w: 66, box: [54, 37, 1208, 1199] },
    "cream-knit": { w: 60, box: [59, 129, 1195, 1146] },
    "crossbody-bag": { h: 46, box: [323, 128, 1054, 1118] },
    "emerald-slip-dress": { h: 118, box: [301, 32, 971, 1228] },
    "indigo-jeans": { h: 104, box: [317, 43, 938, 1210] },
    "loafers": { h: 30, box: [197, 82, 1057, 1163] },
    "patterned-midi-skirt": { h: 80, box: [61, 64, 1193, 1205] },
    "rust-blazer": { w: 64, box: [42, 90, 1212, 1170] },
    "sport-leggings": { h: 92, box: [389, 41, 865, 1214] },
    "tote": { h: 44, box: [120, 64, 1134, 1190] },
    "watch": { h: 24, box: [505, 34, 763, 1222] },
    "white-shirt": { w: 62, box: [99, 90, 1155, 1168] },
  };
  // Tap area for each approved photo: the garment's outline sampled at 17
  // heights, so transparent corners never block a piece underneath.
  const assetHit = {
    "ankle-boots": "52.8% 0.0%, 38.1% 6.2%, 37.8% 12.5%, 37.2% 18.6%, 36.5% 25.0%, 35.4% 31.1%, 33.5% 37.4%, 30.9% 43.6%, 27.9% 49.9%, 24.2% 56.2%, 18.8% 62.4%, 11.5% 68.7%, 5.2% 74.9%, 0.8% 81.2%, 0.2% 87.4%, 23.6% 93.7%, 26.6% 99.8%, 50.8% 99.8%, 72.1% 93.7%, 75.8% 87.4%, 98.8% 81.2%, 99.9% 74.9%, 99.9% 68.7%, 99.9% 62.4%, 99.6% 56.2%, 99.4% 49.9%, 97.7% 43.6%, 95.9% 37.4%, 94.5% 31.1%, 94.1% 25.0%, 94.4% 18.6%, 95.2% 12.5%, 90.0% 6.2%, 65.6% 0.0%",
    "blazer": "41.5% 0.0%, 31.4% 6.2%, 17.8% 12.5%, 14.6% 18.8%, 11.9% 25.0%, 9.2% 31.2%, 6.6% 37.5%, 4.1% 43.8%, 1.8% 50.0%, 0.2% 56.2%, 0.1% 62.5%, 0.7% 68.8%, 1.5% 75.0%, 2.4% 81.2%, 3.4% 87.5%, 14.6% 93.8%, 30.6% 99.9%, 68.6% 99.9%, 85.0% 93.8%, 96.3% 87.5%, 97.4% 81.2%, 98.4% 75.0%, 99.3% 68.8%, 99.9% 62.5%, 99.8% 56.2%, 98.2% 50.0%, 95.9% 43.8%, 93.4% 37.5%, 90.8% 31.2%, 88.1% 25.0%, 85.3% 18.8%, 82.1% 12.5%, 68.6% 6.2%, 58.7% 0.0%",
    "charcoal-trousers": "13.2% 0.0%, 11.0% 6.2%, 8.6% 12.5%, 7.0% 18.7%, 6.0% 24.9%, 5.3% 31.2%, 4.8% 37.5%, 4.5% 43.7%, 3.9% 50.0%, 3.4% 56.2%, 3.1% 62.4%, 2.6% 68.7%, 2.1% 75.0%, 1.5% 81.2%, 1.0% 87.4%, 0.5% 93.7%, 11.1% 99.9%, 88.5% 99.9%, 99.7% 93.7%, 99.1% 87.4%, 98.6% 81.2%, 98.1% 75.0%, 97.6% 68.7%, 97.1% 62.4%, 96.7% 56.2%, 96.2% 50.0%, 95.9% 43.7%, 95.4% 37.5%, 94.9% 31.2%, 94.2% 24.9%, 93.1% 18.7%, 91.6% 12.5%, 89.2% 6.2%, 87.0% 0.0%",
    "chunky-sneakers": "57.5% 0.0%, 51.7% 6.2%, 37.9% 12.4%, 31.5% 18.7%, 29.5% 24.9%, 26.0% 31.2%, 21.6% 37.4%, 16.6% 43.7%, 10.8% 50.0%, 5.0% 56.2%, 2.1% 62.5%, 0.1% 68.7%, 2.4% 75.0%, 14.1% 81.2%, 27.6% 87.5%, 33.5% 93.7%, 48.6% 99.9%, 59.5% 99.9%, 72.8% 93.7%, 78.0% 87.5%, 80.7% 81.2%, 83.0% 75.0%, 94.7% 68.7%, 98.9% 62.5%, 100.0% 56.2%, 99.6% 50.0%, 97.8% 43.7%, 95.2% 37.4%, 94.1% 31.2%, 92.3% 24.9%, 93.4% 18.7%, 89.2% 12.4%, 63.0% 6.2%, 60.1% 0.0%",
    "cobalt-hoodie": "47.8% 0.0%, 38.1% 6.2%, 33.2% 12.5%, 32.8% 18.7%, 31.5% 25.0%, 22.7% 31.2%, 17.9% 37.4%, 14.1% 43.7%, 10.6% 50.0%, 7.5% 56.2%, 4.8% 62.5%, 2.8% 68.7%, 1.2% 75.0%, 0.3% 81.2%, 0.1% 87.4%, 2.7% 93.7%, 8.7% 99.9%, 91.8% 99.9%, 97.1% 93.7%, 99.7% 87.4%, 99.8% 81.2%, 98.6% 75.0%, 97.0% 68.7%, 95.1% 62.5%, 92.4% 56.2%, 89.0% 50.0%, 85.3% 43.7%, 81.4% 37.4%, 76.4% 31.2%, 67.5% 25.0%, 66.7% 18.7%, 66.5% 12.5%, 61.5% 6.2%, 52.1% 0.0%",
    "cream-knit": "38.6% 0.0%, 26.7% 6.2%, 19.0% 12.5%, 15.5% 18.7%, 12.3% 25.0%, 9.5% 31.2%, 6.8% 37.5%, 4.5% 43.7%, 2.5% 50.0%, 0.9% 56.2%, 0.3% 62.4%, 0.2% 68.7%, 1.3% 74.9%, 3.3% 81.2%, 6.2% 87.4%, 11.0% 93.7%, 72.4% 99.9%, 75.4% 99.9%, 89.3% 93.7%, 93.8% 87.4%, 96.6% 81.2%, 98.7% 74.9%, 99.8% 68.7%, 99.9% 62.4%, 98.9% 56.2%, 97.4% 50.0%, 95.2% 43.7%, 92.9% 37.5%, 90.1% 31.2%, 87.2% 25.0%, 84.2% 18.7%, 80.6% 12.5%, 73.0% 6.2%, 61.7% 0.0%",
    "crossbody-bag": "64.2% 0.0%, 45.8% 6.2%, 35.2% 12.4%, 23.0% 18.7%, 13.3% 24.9%, 9.0% 31.2%, 4.8% 37.5%, 0.8% 43.7%, 0.3% 50.0%, 2.1% 56.2%, 3.6% 62.4%, 4.9% 68.7%, 4.2% 74.9%, 4.5% 81.2%, 3.8% 87.5%, 6.2% 93.7%, 51.6% 99.9%, 67.0% 99.9%, 78.9% 93.7%, 80.4% 87.5%, 80.0% 81.2%, 80.0% 74.9%, 81.3% 68.7%, 79.2% 62.4%, 72.2% 56.2%, 42.7% 50.0%, 37.2% 43.7%, 83.9% 37.5%, 95.1% 31.2%, 99.0% 24.9%, 100.0% 18.7%, 98.6% 12.4%, 93.7% 6.2%, 79.5% 0.0%",
    "emerald-slip-dress": "27.8% 0.0%, 28.1% 6.2%, 26.9% 12.5%, 25.8% 18.7%, 28.4% 25.0%, 28.8% 31.2%, 26.0% 37.5%, 23.4% 43.7%, 21.5% 50.0%, 19.4% 56.2%, 17.0% 62.5%, 14.8% 68.7%, 12.4% 75.0%, 8.8% 81.2%, 3.0% 87.5%, 6.0% 93.7%, 48.8% 99.9%, 66.7% 99.9%, 96.6% 93.7%, 96.0% 87.5%, 89.9% 81.2%, 86.1% 75.0%, 83.7% 68.7%, 81.2% 62.5%, 79.0% 56.2%, 76.7% 50.0%, 74.6% 43.7%, 72.1% 37.5%, 68.5% 31.2%, 68.4% 25.0%, 70.7% 18.7%, 69.4% 12.5%, 67.3% 6.2%, 67.6% 0.0%",
    "indigo-jeans": "16.4% 0.0%, 13.7% 6.2%, 10.5% 12.4%, 8.2% 18.7%, 6.6% 24.9%, 5.5% 31.2%, 4.7% 37.4%, 4.2% 43.7%, 3.5% 50.0%, 3.1% 56.2%, 2.4% 62.5%, 1.8% 68.7%, 1.3% 75.0%, 0.8% 81.2%, 0.5% 87.5%, 0.0% 93.7%, 12.9% 99.9%, 87.8% 99.9%, 100.0% 93.7%, 99.7% 87.5%, 99.4% 81.2%, 98.9% 75.0%, 98.4% 68.7%, 97.9% 62.5%, 97.3% 56.2%, 96.6% 50.0%, 96.0% 43.7%, 95.5% 37.4%, 94.7% 31.2%, 93.6% 24.9%, 91.9% 18.7%, 89.7% 12.4%, 86.5% 6.2%, 83.7% 0.0%",
    "loafers": "24.2% 0.0%, 16.2% 6.2%, 11.6% 12.5%, 9.3% 18.7%, 8.1% 25.0%, 7.3% 31.2%, 6.4% 37.5%, 5.1% 43.7%, 3.3% 50.0%, 0.9% 56.2%, 0.0% 62.4%, 0.3% 68.7%, 1.9% 74.9%, 4.3% 81.2%, 7.4% 87.4%, 11.6% 93.7%, 21.3% 99.9%, 78.3% 99.9%, 87.8% 93.7%, 92.2% 87.4%, 95.5% 81.2%, 98.0% 74.9%, 99.7% 68.7%, 100.0% 62.4%, 99.1% 56.2%, 96.9% 50.0%, 94.9% 43.7%, 93.6% 37.5%, 92.6% 31.2%, 91.5% 25.0%, 90.5% 18.7%, 88.3% 12.5%, 84.0% 6.2%, 77.1% 0.0%",
    "patterned-midi-skirt": "32.8% 0.0%, 31.3% 6.2%, 29.0% 12.4%, 27.3% 18.7%, 25.7% 25.0%, 24.2% 31.2%, 22.5% 37.4%, 20.8% 43.7%, 18.8% 50.0%, 16.7% 56.2%, 14.2% 62.5%, 11.3% 68.7%, 8.0% 74.9%, 3.9% 81.2%, 0.1% 87.5%, 12.3% 93.7%, 40.5% 99.9%, 68.1% 99.9%, 88.6% 93.7%, 100.0% 87.5%, 96.1% 81.2%, 92.3% 74.9%, 89.0% 68.7%, 86.3% 62.5%, 83.9% 56.2%, 81.8% 50.0%, 79.8% 43.7%, 78.0% 37.4%, 76.1% 31.2%, 74.5% 25.0%, 72.8% 18.7%, 71.1% 12.4%, 68.7% 6.2%, 67.1% 0.0%",
    "rust-blazer": "43.0% 0.0%, 34.8% 6.2%, 23.7% 12.5%, 20.9% 18.7%, 18.7% 25.0%, 16.5% 31.2%, 14.4% 37.5%, 12.1% 43.7%, 10.1% 50.0%, 8.4% 56.2%, 6.8% 62.5%, 5.0% 68.7%, 3.2% 75.0%, 1.4% 81.2%, 0.6% 87.5%, 14.6% 93.7%, 30.8% 99.9%, 67.0% 99.9%, 84.8% 93.7%, 99.5% 87.5%, 98.7% 81.2%, 96.8% 75.0%, 95.0% 68.7%, 93.3% 62.5%, 91.5% 56.2%, 89.8% 50.0%, 87.9% 43.7%, 85.6% 37.5%, 83.4% 31.2%, 81.3% 25.0%, 79.1% 18.7%, 76.3% 12.5%, 65.0% 6.2%, 57.2% 0.0%",
    "sport-leggings": "13.4% 0.0%, 9.2% 6.2%, 4.8% 12.4%, 1.5% 18.7%, 0.2% 25.0%, 0.2% 31.2%, 1.7% 37.4%, 4.4% 43.7%, 7.6% 50.0%, 9.5% 56.2%, 9.0% 62.5%, 6.1% 68.7%, 5.3% 74.9%, 6.7% 81.2%, 8.6% 87.5%, 10.1% 93.7%, 11.3% 99.9%, 87.6% 99.9%, 89.3% 93.7%, 91.0% 87.5%, 93.1% 81.2%, 94.5% 74.9%, 94.1% 68.7%, 91.0% 62.5%, 90.5% 56.2%, 92.4% 50.0%, 95.6% 43.7%, 98.3% 37.4%, 99.8% 31.2%, 100.0% 25.0%, 98.5% 18.7%, 95.4% 12.4%, 90.8% 6.2%, 86.8% 0.0%",
    "tote": "46.8% 0.0%, 39.2% 6.2%, 35.9% 12.4%, 33.5% 18.7%, 32.1% 25.0%, 30.9% 31.2%, 29.6% 37.5%, 0.1% 43.7%, 0.9% 50.0%, 2.1% 56.2%, 3.3% 62.4%, 4.4% 68.7%, 5.4% 75.0%, 6.4% 81.2%, 7.4% 87.5%, 8.7% 93.7%, 10.9% 99.9%, 88.2% 99.9%, 90.5% 93.7%, 91.6% 87.5%, 92.8% 81.2%, 94.0% 75.0%, 95.2% 68.7%, 96.4% 62.4%, 97.8% 56.2%, 99.1% 50.0%, 100.0% 43.7%, 70.6% 37.5%, 69.6% 31.2%, 68.4% 25.0%, 66.9% 18.7%, 64.6% 12.4%, 61.2% 6.2%, 53.7% 0.0%",
    "watch": "27.5% 0.0%, 24.4% 6.2%, 25.2% 12.5%, 28.3% 18.7%, 27.5% 25.0%, 26.4% 31.2%, 15.9% 37.5%, 0.8% 43.7%, 3.9% 50.0%, 20.9% 56.2%, 26.7% 62.5%, 27.9% 68.7%, 28.3% 75.0%, 28.7% 81.2%, 28.7% 87.5%, 29.1% 93.7%, 43.0% 99.9%, 51.9% 99.9%, 65.9% 93.7%, 66.3% 87.5%, 65.9% 81.2%, 66.3% 75.0%, 66.7% 68.7%, 67.8% 62.5%, 74.0% 56.2%, 90.7% 50.0%, 94.6% 43.7%, 78.7% 37.5%, 68.6% 31.2%, 67.4% 25.0%, 66.3% 18.7%, 69.8% 12.5%, 70.5% 6.2%, 67.4% 0.0%",
    "white-shirt": "41.6% 0.0%, 34.2% 6.2%, 20.2% 12.4%, 15.5% 18.7%, 11.9% 25.0%, 8.6% 31.2%, 5.5% 37.5%, 2.9% 43.7%, 1.0% 50.0%, 0.1% 56.2%, 0.1% 62.4%, 0.6% 68.7%, 1.2% 75.0%, 2.7% 81.2%, 3.7% 87.5%, 24.4% 93.7%, 40.1% 99.9%, 60.5% 99.9%, 75.2% 93.7%, 96.4% 87.5%, 97.6% 81.2%, 99.0% 75.0%, 99.5% 68.7%, 99.9% 62.4%, 99.9% 56.2%, 99.0% 50.0%, 97.0% 43.7%, 94.1% 37.5%, 90.9% 31.2%, 87.4% 25.0%, 83.7% 18.7%, 79.5% 12.4%, 66.0% 6.2%, 58.0% 0.0%",
  };
  // Pieces without an approved photo use a square tile sized by category.
  const typeSize = {
    top: { w: 60 },
    layer: { w: 62 },
    dress: { h: 112 },
    skirt: { h: 80 },
    pants: { h: 102 },
    bag: { h: 42 },
    jewelry: { h: 24 },
  };
  const roleOf = (item) =>
    item.type === "dress"
      ? "dress"
      : ["skirt", "pants"].includes(item.type)
      ? "bottom"
      : SHOES.includes(item.type)
      ? "shoes"
      : ["top", "layer", "bag", "jewelry"].includes(item.type)
      ? item.type
      : "";
  function shapeOf(item) {
    const asset = assetFor(item);
    const key = asset && asset[0].replace(/^.*\//, "").replace(/\.png$/, "");
    const known = key && assetShape[key];
    const shape = known ||
      {
        ...(typeSize[item.type] ||
          (SHOES.includes(item.type) ? { w: 32 } : { w: 40 })),
        box: [0, 0, SOURCE_PX, SOURCE_PX],
      };
    const [x0, y0, x1, y1] = shape.box,
      ratio = (x1 - x0) / (y1 - y0);
    const w = shape.w || shape.h * ratio, h = shape.h || shape.w / ratio;
    return { ...shape, w, h, photo: Boolean(known), hit: known ? assetHit[key] : "" };
  }
  // Arranges an outfit head to toe down a centre line, with the layer to the
  // left and the bag, accessory and shoes to the right. Units are cm.
  function flatLayout(items) {
    const first = (role) => items.find((i) => roleOf(i) === role);
    const dress = first("dress"),
      top = dress ? null : first("top"),
      bottom = dress ? null : first("bottom");
    const layer = first("layer"),
      shoes = first("shoes"),
      bag = first("bag"),
      jewelry = first("jewelry");
    const placed = [];
    const put = (item, cx, cy, z, rot = 0) => {
      const s = shapeOf(item);
      placed.push({
        item,
        s,
        x: cx - s.w / 2,
        y: cy - s.h / 2,
        z,
        rot,
      });
      return s;
    };
    let width = 0, bodyBottom = 0;
    if (dress) {
      const s = put(dress, 0, shapeOf(dress).h / 2 + 4, 3);
      width = s.w * 1.3;
      bodyBottom = s.h + 4;
    } else if (top || bottom) {
      let y = 0;
      if (top) {
        const s = put(top, 0, shapeOf(top).h / 2, 4);
        width = s.w;
        y = bottom ? s.h * 0.8 : s.h;
      }
      if (bottom) {
        const s = shapeOf(bottom);
        put(bottom, 0, y + s.h / 2, 2);
        width = Math.max(width, s.w);
        y += s.h;
      }
      bodyBottom = y;
    }
    if (layer) {
      const s = shapeOf(layer);
      if (width) {
        put(layer, -width * (dress ? 0.28 : 0.42), s.h / 2 - 2, dress ? 5 : 3, -6);
      } else {
        put(layer, 0, s.h / 2, 3);
        width = s.w;
        bodyBottom = s.h;
      }
    }
    const right = width / 2 + 4;
    let sideY = 2;
    if (bag) {
      const s = shapeOf(bag);
      put(bag, right + s.w / 2 + 2, sideY + s.h / 2, 6, 4);
      sideY += s.h + 6;
    }
    if (jewelry) {
      const s = shapeOf(jewelry);
      put(jewelry, right + s.w / 2 + (bag ? 10 : 4), sideY + s.h / 2, 6, 8);
    }
    if (shoes) {
      const s = shapeOf(shoes);
      if (bodyBottom) {
        put(shoes, width * (dress ? 0.35 : 0.3) + s.w / 2, bodyBottom - s.h * 0.55, 7, -4);
      } else put(shoes, 0, s.h / 2 + Math.max(sideY, 0), 7);
    }
    return placed;
  }
  const pct = (n) => `${Math.round(n * 1000) / 10}%`;
  // interactive: board pieces become buttons that open the piece menu.
  function flatLay(items, { interactive = false, pins = [], menu = null } = {}) {
    const placed = flatLayout(items);
    if (!placed.length) return `<div class="flatlay flatlay-empty"></div>`;
    const x0 = Math.min(...placed.map((p) => p.x)),
      y0 = Math.min(...placed.map((p) => p.y));
    const W = Math.max(...placed.map((p) => p.x + p.s.w)) - x0,
      H = Math.max(...placed.map((p) => p.y + p.s.h)) - y0;
    const pieces = placed.map((p) => {
      const pinned = pins.includes(p.item.id);
      const style = `left:${pct((p.x - x0) / W)};top:${pct((p.y - y0) / H)};width:${
        pct(p.s.w / W)
      };height:${pct(p.s.h / H)};z-index:${p.z};--rot:${p.rot}deg`;
      const [bx0, by0, bx1, by1] = p.s.box, bw = bx1 - bx0, bh = by1 - by0;
      const art = p.s.photo
        ? `<span class="flatlay-photo" style="width:${pct(SOURCE_PX / bw)};height:${
          pct(SOURCE_PX / bh)
        };left:${pct(-bx0 / bw)};top:${pct(-by0 / bh)}">${garmentArt(p.item)}</span>`
        : `<span class="flatlay-tile">${garmentArt(p.item)}</span>`;
      const label = `${p.item.name}${pinned ? ", pinned" : ""}`;
      return interactive
        ? `<button class="flatlay-piece" style="${style}" data-board-piece="${
          esc(p.item.id)
        }" aria-label="${esc(label)}. Options" aria-haspopup="true" aria-expanded="${
          menu === p.item.id
        }">${art}<span class="flatlay-hit" aria-hidden="true"${
          p.s.hit ? ` style="clip-path:polygon(${p.s.hit})"` : ""
        }></span></button>`
        : `<span class="flatlay-piece" style="${style}" role="img" aria-label="${
          esc(p.item.name)
        }">${art}</span>`;
    }).join("");
    return `<div class="flatlay" style="--ar:${(W / H).toFixed(4)}">${pieces}</div>`;
  }
  // Options for the piece chosen on the board, docked along the board's bottom.
  function pieceMenu(id) {
    const item = id && draft.items.find((i) => i.id === id);
    if (!item || draft.readOnly) return "";
    const pinned = draft.pins.includes(id);
    return `<section class="flatlay-menu" role="group" aria-labelledby="piece-menu-title"><h2 id="piece-menu-title">${
      esc(item.name)
    }</h2><p>${
      pinned
        ? "Pinned. Suggestions will keep it."
        : "Not pinned. Suggestions may replace it."
    }</p><div class="flatlay-menu-actions"><button data-pin-piece="${
      esc(id)
    }">${pinned ? "Unpin" : "Pin"}</button><button data-swap-piece="${
      esc(id)
    }">Swap</button><button data-remove-piece="${
      esc(id)
    }">Remove</button></div><button class="flatlay-menu-close" data-close-menu aria-label="Close options for ${
      esc(item.name)
    }">×</button></section>`;
  }
  board = function editorialBoard(items) {
    return `<div class="flatlay-frame flatlay-small">${flatLay(items)}</div>`;
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
    ideaId: null,
    readOnly: false,
    variant: 0,
  });
  let planningDate = localDateKey(),
    draft = fresh(),
    drafts = new Map(),
    source = "owned";
  let sourceChosen = false;
  let wardrobeOpen = true,
    editorialFilter = "all",
    notice = "",
    pendingReplacement = null,
    refineOpen = false,
    boardMenu = null,
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
  // Sample ideas: looks built from fictional samples. They live under their
  // own per-account key, never in data.looks, never in cloud backup, and
  // hold only sample item IDs (no owned clothes, photos or notes).
  const IDEAS_PREFIX = "outfit-path-ideas-v1:";
  const ideasKey = () =>
    IDEAS_PREFIX + encodeURIComponent(normalizeScope(activeDataScope));
  const sampleIds = () => new Set(samples().map((i) => i.id));
  const validIdea = (x, ids) =>
    x && typeof x.id === "string" && /^[a-zA-Z0-9_-]{1,64}$/.test(x.id) &&
    typeof x.name === "string" && x.name.length <= 80 &&
    (x.plannedDate === null || dateFromKey(x.plannedDate)) &&
    Array.isArray(x.itemIds) && x.itemIds.length <= 12 &&
    x.itemIds.every((id) => typeof id === "string" && ids.has(id));
  // Returns { ok, ideas, all }. ok is false when stored ideas exist but
  // cannot be read; callers must not overwrite them in that case. "all" is
  // every stored entry, including ones this version does not recognise;
  // writes edit "all" so unrecognised entries are kept as they are.
  function loadIdeas() {
    let raw = null;
    try {
      raw = localStorage.getItem(ideasKey());
    } catch {
      return { ok: false, ideas: [] };
    }
    if (raw === null || raw === undefined) return { ok: true, ideas: [], all: [] };
    try {
      const parsed = JSON.parse(raw), ids = sampleIds();
      if (!Array.isArray(parsed)) return { ok: false, ideas: [] };
      return {
        ok: true,
        all: parsed,
        ideas: parsed.filter((x) => validIdea(x, ids)).map((x) => ({
          id: x.id,
          name: x.name,
          plannedDate: x.plannedDate,
          itemIds: x.itemIds.slice(),
          answers: {
            occasionTheme: String(x.answers?.occasionTheme || "everyday"),
            stylePreference: String(x.answers?.stylePreference || "none"),
          },
          created: String(x.created || ""),
        })),
      };
    } catch {
      return { ok: false, ideas: [] };
    }
  }
  function storeIdeas(list) {
    try {
      localStorage.setItem(ideasKey(), JSON.stringify(list));
      return true;
    } catch {
      return false;
    }
  }
  const ideaItems = (idea) =>
    idea.itemIds.map((id) => samples().find((i) => i.id === id)).filter(Boolean);
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
    boardMenu = null;
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
  // Swap replaces one piece with the next compatible piece from the current
  // wardrobe. It keeps the piece's pin state and never touches other pieces.
  function swapItem(id) {
    if (draft.readOnly) return null;
    const current = draft.items.find((i) => i.id === id);
    if (!current) return null;
    const slot = slotOf(current), inLook = new Set(draft.items.map((i) => i.id));
    const sameKind = (i) =>
      slotOf(i) === slot &&
      (slot !== "shape" || (i.type === "dress") === (current.type === "dress"));
    const candidates = pool().filter((i) => sameKind(i) && !inLook.has(i.id));
    if (!candidates.length) {
      notice = `No other ${
        slot === "shape" ? (current.type === "dress" ? "dress" : "bottom") : slotName[slot]
      } in this wardrobe to swap in. Your look is unchanged.`;
      return null;
    }
    const ranked = [...candidates, current].sort((a, b) =>
      pieceScore(b, draft.answers) - pieceScore(a, draft.answers) ||
      a.id.localeCompare(b.id)
    );
    const next = ranked[(ranked.indexOf(current) + 1) % ranked.length];
    draft.items = draft.items.map((i) => i.id === id ? clone(next) : i);
    if (draft.pins.includes(id)) {
      draft.pins = draft.pins.map((p) => p === id ? next.id : p);
    }
    changed(`Swapped ${current.name} for ${next.name}.`);
    return next.id;
  }
  function filterMatch(i) {
    return editorialFilter === "all" ||
      editorialFilter === "bottoms" && ["pants", "skirt"].includes(i.type) ||
      editorialFilter === "shoes" && SHOES.includes(i.type) ||
      editorialFilter === "accessories" &&
        ["bag", "jewelry"].includes(i.type) ||
      i.type === editorialFilter;
  }
  // Week strip: the seven days (Monday to Sunday) around the selected date,
  // previous/next week, a month-and-year date picker and Today. A dot marks
  // days that already have a saved look. Moving between days never saves.
  function weekDays(key) {
    const d = dateFromKey(key);
    const monday = shiftDate(key, -((d.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => shiftDate(monday, i));
  }
  function dateControls() {
    const today = localDateKey(), selected = dateFromKey(planningDate);
    const saved = new Set(data.looks.map((l) => l.plannedDate).filter(Boolean));
    const ideaDays = new Set(
      loadIdeas().ideas.map((x) => x.plannedDate).filter(Boolean),
    );
    const days = weekDays(planningDate).map((key) => {
      const d = dateFromKey(key), isSel = key === planningDate;
      const full = d.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
      const label = `${full}${key === today ? ", today" : ""}${
        saved.has(key) ? ", has a saved look" : ""
      }${ideaDays.has(key) ? ", has a sample idea" : ""}`;
      return `<button class="week-day${isSel ? " selected" : ""}${
        key === today ? " today" : ""
      }" data-goto-date="${key}" aria-label="${esc(label)}"${
        isSel ? ' aria-current="date"' : ""
      }><span>${
        esc(d.toLocaleDateString(undefined, { weekday: "short" }))
      }</span><b>${d.getDate()}</b><i class="${
        saved.has(key) ? "saved" : ideaDays.has(key) ? "idea" : ""
      }" aria-hidden="true"></i></button>`;
    }).join("");
    const month = selected.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
    return `<div class="week-strip" role="group" aria-label="Choose a day"><button class="week-step" data-day="-7" aria-label="Previous week">‹</button><div class="week-days">${days}</div><button class="week-step" data-day="7" aria-label="Next week">›</button><div class="week-tools">${
      planningDate === today ? "" : "<button class=\"week-today\" data-today>Today</button>"
    }<label class="week-picker"><span aria-hidden="true">${
      esc(month)
    }</span><input type="date" name="simple-date" aria-label="Choose a date" value="${
      esc(planningDate)
    }"></label></div></div>`;
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
    return `<div class="simple-preferences plan-prefs"><label class="plan-occasion"><span class="plan-sr">Occasion</span><select name="simple-occasion">${
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
        }</select></label><p>Every style is open to everyone. Used for your next suggestion.</p><button data-refine>Done</button><button data-view="learn">Style learning</button></section>`
        : ""
    }</div></div>`;
  }
  function chooseSource(next) {
    if (draft.readOnly) return;
    remember();
    source = next === "sample" ? "sample" : "owned";
    sourceChosen = true;
    draft = clone(drafts.get(draftKey()) || fresh());
    pendingReplacement = null;
    notice = "";
    boardMenu = null;
    editorialFilter = "all";
  }
  function figureBoard(items) {
    return `<div class="flatlay-frame flatlay-stage">${
      items.length
        ? flatLay(items, {
          interactive: !draft.readOnly,
          pins: draft.pins,
          menu: boardMenu,
        }) + pieceMenu(boardMenu)
        : `<p class="flatlay-empty-note">${
          pool().length
            ? "Your outfit will appear here."
            : "No personal clothes yet."
        }</p>`
    }</div>`;
  }
  // Untouched starter records stay in Closet but are not counted as the
  // person's own clothes until edited or deliberately added.
  function starterNote() {
    const starters = data.items.filter((i) =>
      i.id.startsWith("starter-") && !owned().some((o) => o.id === i.id)
    ).length;
    return starters
      ? `Only your own pieces are suggested here. Closet also keeps ${starters} starter example${
        starters === 1 ? "" : "s"
      }; they count as yours once you edit one or add your own.`
      : "Only your available pieces are suggested.";
  }
  function wardrobePane() {
    const list = pool().filter(filterMatch);
    const inLook = (id) => draft.items.some((p) => p.id === id);
    return `<section class="editorial-wardrobe plan-wardrobe" aria-labelledby="wardrobe-heading"><div class="editorial-wardrobe-heading plan-wardrobe-head"><div><h2 id="wardrobe-heading">Wardrobe</h2><p>${
      draft.readOnly
        ? draft.ideaId
          ? "Sample ideas are read only. Choose Edit this idea to make changes."
          : "Saved looks are read only. Choose Edit this look to make changes."
        : "Tap a piece to add it. Tap it on the board to pin, swap or remove."
    }</p></div><button class="plan-close" data-close-wardrobe aria-label="Close wardrobe panel">×</button></div><div class="wardrobe-source-tabs plan-source" role="group" aria-label="Wardrobe source">
      <button data-wardrobe-source="owned" aria-pressed="${
      source === "owned"
    }" ${
      draft.readOnly ? "disabled" : ""
    }>My wardrobe <span>${owned().length}</span></button>
      <button data-wardrobe-source="sample" aria-pressed="${
      source === "sample"
    }" ${
      draft.readOnly ? "disabled" : ""
    }>Samples <span>${samples().length}</span></button>
    </div><div class="editorial-filter-row plan-chips" role="group" aria-label="Filter wardrobe">${
      wardrobeFilters.map(([id, label]) =>
        `<button data-simple-filter="${id}" aria-pressed="${
          editorialFilter === id
        }" class="${editorialFilter === id ? "active" : ""}">${label}</button>`
      ).join("")
    }</div><div class="editorial-piece-grid plan-grid" role="list" aria-label="Wardrobe pieces">${
      list.map((i) =>
        `<div role="listitem"><button class="editorial-piece simple-card plan-card${
          inLook(i.id) ? " in-look" : ""
        }" data-select-piece="${
          esc(i.id)
        }" ${draft.readOnly ? "disabled" : ""} aria-label="Add and pin ${
          esc(i.name)
        }" aria-describedby="state-${
          esc(i.id)
        }"><span class="editorial-piece-art">${garmentArt(i)}</span>${
          inLook(i.id) ? '<span class="plan-in-look" aria-hidden="true">✓ In look</span>' : ""
        }<strong>${
          esc(i.name)
        }</strong><small id="state-${esc(i.id)}">${
          inLook(i.id)
            ? draft.readOnly
              ? "Saved item"
              : draft.pins.includes(i.id)
              ? "In this look · Pinned"
              : "In this look · Suggested"
            : source === "sample"
            ? "Sample"
            : i.ownedCopy
            ? "Deliberately added sample"
            : "Your piece"
        }</small></button></div>`
      ).join("")
    }</div>${
      !list.length
        ? `<p class="plan-empty">${
          source === "owned" && !owned().length
            ? "No clothes of your own yet. Add an item, or try the samples."
            : "Nothing in this category."
        }</p>`
        : ""
    }${
      draft.readOnly
        ? ""
        : '<button class="editorial-secondary plan-add" data-action="additem">Add an item</button>'
    }<p class="editorial-sample-note plan-note">${
      source === "sample"
        ? "Samples are fictional and stay separate from your closet. Looks made from them save as sample ideas, apart from your own saved looks."
        : starterNote()
    }</p></section>`;
  }
  function renderSimpleBuilder() {
    if (!sourceChosen) {
      source = owned().length ? "owned" : "sample";
      sourceChosen = true;
    }
    const partial = !draft.items.some((i) => i.type === "dress") &&
        !(draft.items.some((i) => i.type === "top") &&
          draft.items.some((i) => ["pants", "skirt"].includes(i.type))) ||
      !draft.items.some((i) => SHOES.includes(i.type));
    const heading = dateFromKey(planningDate).toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const pinCount = draft.pins.filter((id) =>
      draft.items.some((i) => i.id === id)
    ).length;
    const statusMain = draft.readOnly && draft.ideaId
      ? `<b>Sample idea</b> · ${
        draft.sourceDate ? esc(dateLabel(draft.sourceDate)) : "date not recorded"
      } · read only`
      : draft.readOnly
      ? `<b>Saved look</b> · ${
        draft.sourceDate ? esc(dateLabel(draft.sourceDate)) : "date not recorded"
      } · read only`
      : source === "sample"
      ? `<b>Sample preview</b>${pinCount ? ` · ${pinCount} pinned` : ""}`
      : draft.dirty
      ? `<b>Unsaved changes</b>${pinCount ? ` · ${pinCount} pinned` : ""}`
      : "<b>Unsaved draft</b>";
    const statusNote = draft.readOnly
      ? ""
      : source === "sample"
      ? "Sample looks save as ideas, kept apart from your own saved looks."
      : `${
        partial && draft.items.length ? "Partial look; you can save it as it is. " : ""
      }Drafts last for this session only. Save before closing.`;
    return `<div class="editorial-shell simple-builder plan-layout ${
      wardrobeOpen ? "" : "wardrobe-closed"
    }"><section class="editorial-stage plan-stage" aria-labelledby="look-heading">${dateControls()}<div class="plan-head"><h1 id="look-heading">${
      esc(heading)
    }</h1>${preferences()}${
      wardrobeOpen ? "" : '<button class="plan-open" data-open-wardrobe>Open wardrobe</button>'
    }</div><div class="editorial-canvas" role="group" aria-label="Outfit board"><span class="plan-source-tag">${
      source === "sample" ? "Sample wardrobe · fictional" : "My wardrobe"
    }</span>${
      notice
        ? `<div class="editorial-status plan-notice" role="status">${
          esc(notice)
        } <button class="plan-dismiss" data-dismiss aria-label="Dismiss message">×</button></div>`
        : ""
    }${figureBoard(draft.items)}${
      pendingReplacement
        ? `<section class="simple-confirm plan-confirm" role="region" aria-labelledby="replace-question"><h2 id="replace-question" tabindex="-1">Replace ${
          esc(pendingReplacement.conflicts.join(" and "))
        } with ${
          esc(pool().find((i) => i.id === pendingReplacement.id)?.name)
        }?</h2><p>Pinned pieces stay until you confirm. This may leave a partial look.</p><div class="plan-confirm-actions"><button data-cancel-replace>Cancel</button><button class="editorial-primary" data-confirm-replace>Replace</button></div></section>`
        : ""
    }</div>${
      !draft.items.length && !draft.readOnly
        ? `<p class="mannequin-help plan-help">${
          pool().length
            ? "Tap a piece in the wardrobe to add it, or choose Suggest a look. Tap a piece on the board to pin, swap or remove it."
            : "No personal clothes added yet. Choose Samples to explore, or add an item."
        }</p>`
        : ""
    }<div class="plan-bar"><p class="plan-status">${statusMain}${
      draft.readOnly ? "" : " · Suggestions use local rules"
    }${statusNote ? `<br><span>${statusNote}</span>` : ""}</p><div class="simple-actions">${
      draft.readOnly
        ? `<button data-new-draft>New look for this date</button><button class="editorial-primary" data-edit-saved>${
          draft.ideaId ? "Edit this idea" : "Edit this look"
        }</button>`
        : `<button data-suggest ${!pool().length ? "disabled" : ""}>${
          draft.items.length ? "Suggest the rest" : "Suggest a look"
        }</button>${
          source === "sample"
            ? `<button class="editorial-primary" data-save-idea ${
              !draft.items.length || saving ? "disabled" : ""
            }>${draft.ideaId ? "Update idea" : "Save as idea"}</button>`
            : `<button class="editorial-primary" data-save-draft ${
              !draft.items.length || saving ? "disabled" : ""
            }>${draft.sourceId ? "Update saved look" : "Save look"}</button>`
        }`
    }</div></div><p class="mannequin-caption plan-caption">Laid out flat at approximate scale. Not a fit or try-on preview.</p>${
      draft.items.length
        ? `<details class="simple-selected plan-pieces"><summary><h2 tabindex="-1" id="selected-heading">Pieces in this look (${draft.items.length})${
          draft.readOnly ? " · read only" : ""
        }</h2></summary>${
          draft.items.map((i) =>
            `<div class="simple-selected-row"><span><strong>${
              esc(i.name)
            }</strong><small>${
              draft.readOnly
                ? "Saved item"
                : draft.pins.includes(i.id)
                ? "Pinned"
                : "Not pinned"
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
        }</details>`
        : '<h2 class="plan-sr" tabindex="-1" id="selected-heading">No pieces in this look</h2>'
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
    data.looks.filter((l) => !l.plannedDate).map(card).join("") +
    ideasSection();
  function ideasSection() {
    const { ok, ideas } = loadIdeas();
    if (!ok) {
      return `<section class="ideas-section"><h2>Sample ideas</h2><p>Sample ideas in this browser could not be read. Nothing was changed.</p></section>`;
    }
    const today = ideas.filter((x) => x.plannedDate === planningDate);
    return `<section class="ideas-section" aria-labelledby="ideas-heading"><h2 id="ideas-heading">Sample ideas</h2><p class="ideas-note">Looks built from fictional samples. Kept apart from your saved looks and not added to your closet. Stored in this browser only.</p>${
      today.length
        ? today.map((x) =>
          `<article class="look-card idea-card">${board(ideaItems(x))}<h3>${
            esc(x.name)
          }</h3><p>${esc(dateLabel(x.plannedDate))} · Sample idea</p><button data-open-idea="${
            esc(x.id)
          }">Open idea</button><button data-delete-idea="${
            esc(x.id)
          }" aria-label="Delete sample idea ${esc(x.name)}">Delete</button></article>`
        ).join("")
        : "<p>No sample ideas for this date.</p>"
    }</section>`;
  }
  function openIdea(id, discard = false) {
    const { ok, ideas } = loadIdeas();
    const idea = ok && ideas.find((x) => x.id === id);
    if (!idea) return;
    const date = idea.plannedDate || planningDate;
    const current = date === planningDate && source === "sample"
      ? draft
      : drafts.get(`sample:${date}`);
    if (current?.dirty && !discard) {
      openModal(
        "Keep your unsaved draft?",
        `<p>A sample draft already exists for this date. Keep it, or discard that session draft to open the idea.</p><button data-action="close">Keep draft</button><button data-discard-open-idea="${
          esc(id)
        }">Discard draft and open</button>`,
      );
      return;
    }
    remember();
    planningDate = date;
    source = "sample";
    sourceChosen = true;
    const items = ideaItems(idea);
    draft = {
      ...fresh(),
      items: clone(items),
      pins: items.map((i) => i.id),
      answers: { ...defaults(), ...idea.answers },
      ideaId: idea.id,
      sourceDate: idea.plannedDate,
      readOnly: true,
    };
    result = null;
    pendingReplacement = null;
    notice = items.length < idea.itemIds.length
      ? "Some sample pieces in this idea are no longer available."
      : "";
    boardMenu = null;
    view = "builder";
    remember();
    repaint();
  }
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
    sourceChosen = true;
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
    boardMenu = null;
    view = "builder";
    remember();
    repaint();
  }
  document.addEventListener("click", (event) => {
    const closeRefine = refineOpen && !event.target.closest(".simple-refine");
    if (closeRefine) refineOpen = false;
    const closeMenu = boardMenu &&
      !event.target.closest(".flatlay-menu, .flatlay-piece");
    const menuWas = boardMenu;
    if (closeMenu) boardMenu = null;
    const target = event.target.closest("button");
    if (!target) {
      if (closeRefine || closeMenu) repaint(closeMenu ? `[data-board-piece="${menuWas}"]` : "");
      return;
    }
    const d = target.dataset;
    const handled = [
      "wardrobeSource",
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
      "boardPiece",
      "swapPiece",
      "closeMenu",
      "gotoDate",
      "saveIdea",
      "openIdea",
      "discardOpenIdea",
      "deleteIdea",
      "confirmDeleteIdea",
    ].some((k) => d[k] !== undefined) ||
      ["newlook", "restart", "savelook", "shuffle", "editpath"].includes(
        d.action,
      );
    if (!handled) {
      if (closeRefine || closeMenu) repaint();
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    if (target.disabled) return;
    let after = "";
    if (d.openIdea) {
      openIdea(d.openIdea);
      return;
    }
    if (d.discardOpenIdea) {
      $("#modal").close();
      openIdea(d.discardOpenIdea, true);
      return;
    }
    if (d.deleteIdea) {
      const idea = loadIdeas().ideas.find((x) => x.id === d.deleteIdea);
      if (!idea) return;
      openModal(
        "Delete this sample idea?",
        `<p>${esc(idea.name)} will be removed from this browser. Your saved looks and closet are not affected.</p><button data-action="close">Keep it</button><button data-confirm-delete-idea="${
          esc(idea.id)
        }">Delete idea</button>`,
      );
      return;
    }
    if (d.confirmDeleteIdea) {
      const { ok, all } = loadIdeas();
      $("#modal").close();
      if (!ok || !storeIdeas(all.filter((x) => x?.id !== d.confirmDeleteIdea))) {
        toast("The idea could not be deleted. Nothing was changed.");
        return;
      }
      if (draft.ideaId === d.confirmDeleteIdea) draft.ideaId = null;
      render();
      return;
    }
    if (d.saveIdea !== undefined) {
      if (draft.readOnly || !draft.items.length || source !== "sample") return;
      saveTicket = {
        draft,
        scope: activeDataScope,
        date: planningDate,
        source,
      };
      const existing = loadIdeas().ideas.find((x) => x.id === draft.ideaId);
      openModal(
        draft.ideaId ? "Update sample idea" : "Save sample idea",
        `<form id="simple-idea-form"><label>Idea name<input name="name" maxlength="80" required value="${
          esc(existing?.name || "Sample idea")
        }"></label><p>${esc(dateLabel(planningDate))} · ${draft.items.length} sample pieces</p><p class="muted">Uses fictional sample clothes. Saved in this browser, apart from your own looks, and never added to your closet.</p><button type="submit" class="btn primary">${
          draft.ideaId ? "Update idea" : "Save idea"
        }</button><p role="status" id="simple-save-error"></p></form>`,
      );
      return;
    }
    if (d.openlook) {
      openSaved(d.openlook);
      return;
    }
    if (d.discardOpen) {
      $("#modal").close();
      openSaved(d.discardOpen, true);
      return;
    }
    if (d.wardrobeSource) {
      chooseSource(d.wardrobeSource);
      after = `[data-wardrobe-source="${source}"]`;
    }
    if (d.selectPiece) {
      boardMenu = null;
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
    if (d.boardPiece && !draft.readOnly) {
      boardMenu = boardMenu === d.boardPiece ? null : d.boardPiece;
      after = boardMenu
        ? `[data-pin-piece="${d.boardPiece}"]`
        : `[data-board-piece="${d.boardPiece}"]`;
    }
    if (d.closeMenu !== undefined) {
      after = `[data-board-piece="${boardMenu}"]`;
      boardMenu = null;
    }
    if (d.swapPiece && !draft.readOnly) {
      const next = swapItem(d.swapPiece);
      if (next && boardMenu === d.swapPiece) boardMenu = next;
      after = `[data-swap-piece="${next || d.swapPiece}"]`;
    }
    if (d.pinPiece && !draft.readOnly) {
      draft.pins = draft.pins.includes(d.pinPiece)
        ? draft.pins.filter((id) => id !== d.pinPiece)
        : [...draft.pins, d.pinPiece];
      changed("Pin updated. The item remains in your look.");
      after = `[data-pin-piece="${d.pinPiece}"]`;
      if (boardMenu && boardMenu !== d.pinPiece) boardMenu = null;
    }
    if (d.removePiece && !draft.readOnly) {
      draft.items = draft.items.filter((i) => i.id !== d.removePiece);
      draft.pins = draft.pins.filter((id) => id !== d.removePiece);
      changed("Piece removed from this draft. Your wardrobe is unchanged.");
      if (boardMenu === d.removePiece) boardMenu = null;
      after = "#selected-heading";
    }
    if (d.suggest !== undefined) {
      boardMenu = null;
      suggest();
      after = "[data-suggest]";
    }
    if (d.dismiss !== undefined) notice = "";
    if (d.day !== undefined) {
      navigateDate(shiftDate(planningDate, Number(d.day)));
      after = `[data-day="${d.day}"]`;
    }
    if (d.gotoDate) {
      navigateDate(d.gotoDate);
      after = `[data-goto-date="${planningDate}"]`;
    }
    if (d.today !== undefined) {
      navigateDate(localDateKey());
      after = `[data-goto-date="${planningDate}"]`;
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
      boardMenu = null;
      draft = fresh();
      notice = "New unsaved look for this date. Existing saves are unchanged.";
      remember();
    }
    if (d.editSaved !== undefined) {
      boardMenu = null;
      draft.readOnly = false;
      draft.pins = draft.items.map((i) => i.id);
      notice = draft.ideaId
        ? "Editing this idea. Only Update idea saves your changes."
        : "Editing a copy. Only Update saved look commits your changes.";
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
  // The month label sits over the date input; open the picker on click
  // where the browser supports it (desktop Chrome otherwise only focuses).
  document.addEventListener("click", (event) => {
    const input = event.target.closest?.('input[name="simple-date"]');
    try {
      input?.showPicker?.();
    } catch { /* Picker not available; the input still accepts typing. */ }
  });
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
    if (event.target.id !== "simple-idea-form") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (saving || draft.readOnly || source !== "sample") return;
    if (
      !saveTicket || saveTicket.draft !== draft ||
      saveTicket.scope !== activeDataScope ||
      saveTicket.date !== planningDate || saveTicket.source !== source
    ) {
      $("#modal").close();
      notice = "The draft or account changed. Review this idea and save again.";
      repaint();
      return;
    }
    const name = new FormData(event.target).get("name")?.trim().slice(0, 80);
    if (!name) return;
    const ids = sampleIds();
    const itemIds = draft.items.map((i) => i.id).filter((id) => ids.has(id));
    if (itemIds.length !== draft.items.length) {
      $("#simple-save-error").textContent =
        "Only sample pieces can be saved as an idea. Nothing was saved.";
      return;
    }
    const { ok, ideas, all } = loadIdeas();
    if (!ok) {
      $("#simple-save-error").textContent =
        "Sample ideas in this browser could not be read, so nothing was saved.";
      return;
    }
    saving = true;
    const existing = ideas.find((x) => x.id === draft.ideaId);
    const idea = {
      id: existing?.id || uid().replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64),
      name,
      plannedDate: existing ? existing.plannedDate : planningDate,
      itemIds,
      answers: {
        occasionTheme: draft.answers.occasionTheme,
        stylePreference: draft.answers.stylePreference,
      },
      created: existing?.created || new Date().toISOString(),
    };
    const next = existing
      ? all.map((x) => x?.id === existing.id ? idea : x)
      : [...all, idea];
    if (!storeIdeas(next)) {
      saving = false;
      $("#simple-save-error").textContent =
        "Could not save. Your draft is intact; try again.";
      return;
    }
    saving = false;
    draft.ideaId = idea.id;
    draft.sourceDate = idea.plannedDate;
    draft.dirty = false;
    draft.readOnly = true;
    remember();
    $("#modal").close();
    notice = "Saved to Sample ideas.";
    repaint("[data-edit-saved]");
  }, true);
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
    if (boardMenu) {
      const id = boardMenu;
      boardMenu = null;
      repaint(`[data-board-piece="${id}"]`);
    } else if (pendingReplacement) {
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
    sourceChosen = false;
    pendingReplacement = null;
    refineOpen = false;
    boardMenu = null;
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
  // "Reset everything" in Settings (app.js) clears this account's wardrobe,
  // looks, ratings and photos; this listener runs after it and also removes
  // this account's sample ideas. Other accounts' ideas are untouched.
  document.addEventListener("click", (event) => {
    const b = event.target.closest?.("button");
    if (b?.dataset?.action !== "confirmresetall" || b.disabled) return;
    try {
      localStorage.removeItem(ideasKey());
    } catch { /* Clearing site data in the browser removes it. */ }
    resetSession();
  });
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
