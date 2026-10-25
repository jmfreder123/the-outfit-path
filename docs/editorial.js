'use strict';

(() => {
  COLORS.rust ||= '#a64b2d';
  COLORS.indigo ||= '#324a70';

  const catalogAssets = {
    'starter-6': ['assets/design3/charcoal-trousers.png', 'Black tailored trousers'],
    'starter-15': ['assets/design3/white-shirt.png', 'White button-down'],
    'starter-33': ['assets/design3/blazer.png', 'Black tailored blazer'],
    'starter-20': ['assets/design3/ankle-boots.png', 'Black ankle boots'],
    'demo-emerald-slip-dress': ['assets/design3/emerald-slip-dress.png', 'Emerald satin slip dress'],
    'demo-patterned-midi-skirt': ['assets/design3/patterned-midi-skirt.png', 'Floral patterned midi skirt'],
    'demo-rust-blazer': ['assets/design3/rust-blazer.png', 'Rust tailored blazer'],
    'demo-cobalt-hoodie': ['assets/design3/cobalt-hoodie.png', 'Cobalt oversized hoodie'],
    'demo-indigo-jeans': ['assets/design3/indigo-jeans.png', 'Indigo straight-leg jeans'],
    'demo-black-sport-leggings': ['assets/design3/sport-leggings.png', 'Black sport leggings'],
    'demo-off-white-chunky-sneakers': ['assets/design3/chunky-sneakers.png', 'Off-white chunky sneakers'],
    'demo-black-crossbody': ['assets/design3/crossbody-bag.png', 'Black leather crossbody bag'],
    'demo-cream-merino-knit': ['assets/design3/cream-knit.png', 'Cream merino crewneck'],
    'demo-brown-leather-loafers': ['assets/design3/loafers.png', 'Brown leather loafers'],
    'demo-black-leather-tote': ['assets/design3/tote.png', 'Black leather tote'],
    'demo-black-leather-watch': ['assets/design3/watch.png', 'Black leather-strap watch']
  };
  const demoCatalog = [
    {id:'demo-emerald-slip-dress',name:'Emerald satin slip dress',type:'dress',color:'green',hex:'#075742',style:'romantic',season:'mild',available:true,notes:'Fictional catalog sample.',catalogSample:true},
    {id:'demo-patterned-midi-skirt',name:'Floral patterned midi skirt',type:'skirt',color:'cream',hex:'#e5d7b7',style:'bold',season:'mild',available:true,notes:'Fictional catalog sample.',catalogSample:true},
    {id:'demo-rust-blazer',name:'Rust tailored blazer',type:'layer',color:'rust',hex:'#a64b2d',style:'classic',season:'mild',available:true,notes:'Fictional catalog sample.',catalogSample:true},
    {id:'demo-cobalt-hoodie',name:'Cobalt oversized hoodie',type:'top',color:'blue',hex:'#1456d8',style:'relaxed',season:'cool',available:true,notes:'Fictional catalog sample.',catalogSample:true},
    {id:'demo-indigo-jeans',name:'Indigo straight-leg jeans',type:'pants',color:'indigo',hex:'#324a70',style:'relaxed',season:'all',available:true,notes:'Fictional catalog sample.',catalogSample:true},
    {id:'demo-black-sport-leggings',name:'Black sport leggings',type:'pants',color:'black',hex:'#202120',style:'relaxed',season:'all',available:true,notes:'Fictional catalog sample.',catalogSample:true},
    {id:'demo-off-white-chunky-sneakers',name:'Off-white chunky sneakers',type:'sneakers',color:'cream',hex:'#ede6d6',style:'bold',season:'all',available:true,notes:'Fictional catalog sample.',catalogSample:true},
    {id:'demo-black-crossbody',name:'Black leather crossbody bag',type:'bag',color:'black',hex:'#242423',style:'classic',season:'all',available:true,notes:'Fictional catalog sample.',catalogSample:true},
    {id:'demo-cream-merino-knit',name:'Cream merino crewneck',type:'top',color:'cream',hex:'#eee7d7',style:'classic',season:'cool',available:true,notes:'Fictional catalog sample.',catalogSample:true},
    {id:'demo-brown-leather-loafers',name:'Brown leather loafers',type:'flats',color:'brown',hex:'#4f2e20',style:'classic',season:'all',available:true,notes:'Fictional catalog sample.',catalogSample:true},
    {id:'demo-black-leather-tote',name:'Black leather tote',type:'bag',color:'black',hex:'#222221',style:'classic',season:'all',available:true,notes:'Fictional catalog sample.',catalogSample:true},
    {id:'demo-black-leather-watch',name:'Black leather-strap watch',type:'jewelry',color:'black',hex:'#262625',style:'classic',season:'all',available:true,notes:'Fictional catalog sample.',catalogSample:true}
  ];
  const occasionOptions = [
    ['business', 'Business'],
    ['business-casual', 'Business Casual'],
    ['everyday', 'Everyday'],
    ['evening', 'Evening'],
    ['sporty', 'Sporty'],
    ['streetwear', 'Streetwear']
  ];
  const styleOptions = [
    ['none', 'No preference'],
    ['feminine', 'Feminine'],
    ['masculine', 'Masculine'],
    ['androgynous', 'Androgynous']
  ];
  const occasionToPath = {
    business: 'work',
    'business-casual': 'work',
    everyday: 'everyday',
    evening: 'date',
    sporty: 'weekend',
    streetwear: 'weekend'
  };
  const wardrobeFilters = [
    ['all', 'All'],
    ['top', 'Tops'],
    ['bottoms', 'Bottoms'],
    ['dress', 'Dresses'],
    ['layer', 'Layers'],
    ['shoes', 'Shoes'],
    ['accessories', 'Accessories']
  ];
  const featuredCatalogIds = [
    'demo-emerald-slip-dress',
    'demo-patterned-midi-skirt',
    'demo-rust-blazer',
    'demo-cobalt-hoodie',
    'demo-indigo-jeans',
    'demo-black-sport-leggings',
    'demo-off-white-chunky-sneakers',
    'starter-20',
    'demo-black-crossbody'
  ];
  let editorialFilter = 'all';
  let wardrobeOpen = true;
  let editorialMode = 'suggest';
  let manualSelection = {};
  let lockedSlots = new Set();
  let suggestionVariant = 0;
  let editorialStatus = '';
  let pendingFocus = '';

  function localDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function dateFromKey(key) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key || '');
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
    return localDateKey(date) === key ? date : null;
  }

  function shiftDate(key, days) {
    const date = dateFromKey(key) || new Date();
    date.setDate(date.getDate() + days);
    return localDateKey(date);
  }

  function dateLabel(key) {
    const date = dateFromKey(key);
    if (!date) return 'Date not recorded';
    if (key === localDateKey()) return 'Today';
    return date.toLocaleDateString(undefined, {weekday:'short', month:'short', day:'numeric'});
  }

  let planningDate = localDateKey();
  const baseGenerate = generate;
  generate = function editorialDatedGenerate(answerSet = answers) {
    const generated = baseGenerate(answerSet);
    if (generated) generated.plannedDate = planningDate;
    return generated;
  };

  const baseGarmentArt = garmentArt;
  garmentArt = function editorialGarmentArt(item) {
    const asset = !item.photoId && catalogAssets[item.id];
    if (!asset) return baseGarmentArt(item);
    const webp = asset[0].replace(/\.png$/, '.webp');
    return `<span class="photo-frame demo-photo" data-demo-piece="true"><picture><source srcset="${webp}" type="image/webp"><img class="garment-photo" src="${asset[0]}" alt="${esc(asset[1])}" loading="lazy" decoding="async"></picture></span>`;
  };

  board = function editorialBoard(items) {
    const top = items.find(item => ['top', 'dress'].includes(item.type));
    const bottom = items.find(item => ['skirt', 'pants'].includes(item.type));
    const shoes = items.find(item => SHOES.includes(item.type));
    const bag = items.find(item => item.type === 'bag');
    const layer = items.find(item => item.type === 'layer');
    const jewelry = items.find(item => item.type === 'jewelry');
    return `<div class="moodboard">
      ${layer ? `<div class="garment layer">${garmentArt(layer)}</div>` : ''}
      ${top ? `<div class="garment top ${top.type === 'dress' ? 'dress' : ''}">${garmentArt(top)}</div>` : ''}
      ${bottom && top?.type !== 'dress' ? `<div class="garment bottom">${garmentArt(bottom)}</div>` : ''}
      ${shoes ? `<div class="garment shoes">${garmentArt(shoes)}</div>` : ''}
      ${bag ? `<div class="garment bag">${garmentArt(bag)}</div>` : ''}
      ${jewelry ? `<div class="garment jewelry">${garmentArt(jewelry)}</div>` : ''}
    </div>`;
  };

  const baseFeatures = features;
  features = function editorialFeatures(items, answerSet) {
    const featureSet = baseFeatures(items, answerSet);
    if (answerSet.stylePreference && answerSet.stylePreference !== 'none') {
      items.forEach(item => {
        const key = `context:aesthetic:${answerSet.stylePreference}:${item.style}`;
        featureSet[key] = (featureSet[key] || 0) + 1 / items.length;
      });
    }
    return featureSet;
  };

  const basePieceScore = pieceScore;
  pieceScore = function editorialPieceScore(item, answerSet) {
    let score = basePieceScore(item, answerSet);
    const theme = answerSet.occasionTheme || 'business-casual';
    const themeBias = {
      business: (item.style === 'classic' ? 4 : 0) + (item.type === 'layer' ? 2 : 0) + (['black', 'navy', 'gray', 'white'].includes(item.color) ? 1 : 0),
      'business-casual': (['classic', 'relaxed'].includes(item.style) ? 2.5 : 0) + (['flats', 'boots', 'layer'].includes(item.type) ? 1 : 0),
      everyday: (item.style === 'relaxed' ? 4 : 0) + (['sneakers', 'flats'].includes(item.type) ? 2 : 0),
      evening: (['romantic', 'bold'].includes(item.style) ? 4 : 0) + (['dress', 'heels'].includes(item.type) ? 3 : 0),
      sporty: (item.style === 'relaxed' ? 3 : 0) + (['pants', 'top', 'sneakers'].includes(item.type) ? 3 : 0),
      streetwear: (['bold', 'relaxed'].includes(item.style) ? 3 : 0) + (['pants', 'layer', 'sneakers'].includes(item.type) ? 2 : 0)
    }[theme] || 0;
    const preference = answerSet.stylePreference || 'none';
    const preferenceBias = {
      feminine: item.style === 'romantic' ? 5 : item.style === 'bold' ? 1 : 0,
      masculine: item.style === 'classic' ? 5 : item.style === 'relaxed' ? 1 : 0,
      androgynous: ['relaxed', 'bold'].includes(item.style) ? 4 : 0
    }[preference] || 0;
    return score + themeBias + preferenceBias;
  };

  const previewPlans = {
    business: {shapes:['pants', 'dress', 'skirt'], shoes:['boots', 'flats', 'heels'], layer:true, jewelry:true},
    'business-casual': {shapes:['skirt', 'pants', 'dress'], shoes:['flats', 'boots', 'sneakers'], layer:true},
    everyday: {shapes:['pants', 'skirt', 'dress'], shoes:['sneakers', 'flats', 'boots']},
    evening: {shapes:['dress', 'skirt', 'pants'], shoes:['heels', 'boots', 'flats'], layer:true, jewelry:true},
    sporty: {shapes:['pants'], shoes:['sneakers'], jewelry:false},
    streetwear: {shapes:['pants', 'skirt', 'dress'], shoes:['sneakers', 'boots'], layer:true}
  };

  function rankedPick(pool, predicate, answerSet, bonus = () => 0) {
    const ranked = pool.filter(predicate).sort((a, b) => pieceScore(b, answerSet) + bonus(b) - pieceScore(a, answerSet) - bonus(a) || a.id.localeCompare(b.id));
    const limit = Math.min(2, ranked.length);
    return ranked[limit ? suggestionVariant % limit : 0];
  }

  function previewContext(answerSet = answers) {
    const actual = data.items.filter(item => item.available && (!item.id.startsWith('starter-') || item.ownedCopy));
    const exactStarterIds = new Set(['starter-6', 'starter-15', 'starter-20', 'starter-33']);
    const pool = actual.length
      ? actual
      : [...demoCatalog, ...data.items.filter(item => item.available && exactStarterIds.has(item.id))];
    const mode = actual.length ? 'closet' : 'demo';
    const theme = answerSet.occasionTheme || 'business-casual';
    const plan = previewPlans[theme] || previewPlans['business-casual'];
    const shapeOrder = answerSet.shape && answerSet.shape !== 'surprise' ? [answerSet.shape] : plan.shapes;
    const items = [];
    const shape = rankedPick(
      pool,
      item => shapeOrder.includes(item.type),
      answerSet,
      item => (shapeOrder.length - shapeOrder.indexOf(item.type)) * 0.2
    );
    const shapeType = shape?.type;
    if (shape) items.push(shape);
    if (shapeType && shapeType !== 'dress') {
      const top = rankedPick(pool, item => item.type === 'top', answerSet);
      if (top) items.push(top);
    }
    const shoeTypes = answerSet.shoes && answerSet.shoes !== 'any' ? [answerSet.shoes] : plan.shoes;
    const shoes = rankedPick(pool, item => shoeTypes.includes(item.type), answerSet);
    if (shoes) items.push(shoes);
    if (plan.layer) {
      const layer = rankedPick(pool, item => item.type === 'layer', answerSet);
      if (layer) items.push(layer);
    }
    const bag = rankedPick(pool, item => item.type === 'bag', answerSet);
    if (bag) items.push(bag);
    if (plan.jewelry) {
      const jewelry = rankedPick(pool, item => item.type === 'jewelry', answerSet);
      if (jewelry) items.push(jewelry);
    }
    const missing = [];
    if (!shape) missing.push('a dress, skirt, or pair of pants');
    if (shapeType && shapeType !== 'dress' && !items.some(item => item.type === 'top')) missing.push('a top');
    if (!shoes) missing.push('suitable shoes');
    return {
      items,
      mode,
      message: mode === 'demo'
        ? 'Demo preview · fictional catalog pieces, not your closet.'
        : missing.length
          ? `Limited closet preview · add or enable ${missing.join(' and ')} for a complete suggestion.`
          : 'Your closet preview · only available pieces from this account.'
    };
  }

  const outfitSlots = [
    ['shape', 'Dress or bottom'],
    ['top', 'Top'],
    ['shoes', 'Shoes'],
    ['layer', 'Layer'],
    ['bag', 'Bag'],
    ['jewelry', 'Jewelry']
  ];

  function slotForItem(item) {
    if (!item) return '';
    if (['dress', 'skirt', 'pants'].includes(item.type)) return 'shape';
    if (SHOES.includes(item.type)) return 'shoes';
    return ['top', 'layer', 'bag', 'jewelry'].includes(item.type) ? item.type : '';
  }

  function slotAssignments(items) {
    const assignments = {};
    items.forEach(item => {
      const slot = slotForItem(item);
      if (slot && !assignments[slot]) assignments[slot] = item;
    });
    return assignments;
  }

  function selectedClosetItem(slot) {
    return data.items.find(item => item.available && item.id === manualSelection[slot]);
  }

  function manualItems() {
    const items = outfitSlots.map(([slot]) => selectedClosetItem(slot)).filter(Boolean);
    const shape = items.find(item => slotForItem(item) === 'shape');
    return shape?.type === 'dress' ? items.filter(item => item.type !== 'top') : items;
  }

  function hybridContext(answerSet = answers) {
    const lockedShape = lockedSlots.has('shape') ? selectedClosetItem('shape') : null;
    const direction = lockedShape ? {...answerSet, shape:lockedShape.type} : answerSet;
    const suggestion = previewContext(direction);
    const assignments = slotAssignments(suggestion.items);
    lockedSlots.forEach(slot => {
      const item = selectedClosetItem(slot);
      if (item) assignments[slot] = item;
    });
    if (assignments.shape?.type === 'dress') delete assignments.top;
    const items = outfitSlots.map(([slot]) => assignments[slot]).filter(Boolean);
    return {
      items,
      mode: suggestion.mode,
      message: `Mix & match · ${lockedSlots.size} chosen piece${lockedSlots.size === 1 ? '' : 's'} locked; local rules fill the rest. ${suggestion.message}`
    };
  }

  function outfitContext(answerSet = answers) {
    if (editorialMode === 'manual') {
      const items = manualItems();
      return {items, mode:'closet', message:items.length ? 'Choose myself · only the pieces you select appear here.' : 'Choose myself · drag a closet piece into a slot or use its “Use in look” button.'};
    }
    if (editorialMode === 'hybrid') return hybridContext(answerSet);
    const suggestion = previewContext(answerSet);
    return {...suggestion, message:`Rule-based suggestion · ${suggestion.message}`};
  }

  function placeClosetItem(itemId, requestedSlot = '') {
    const item = data.items.find(candidate => candidate.id === itemId && candidate.available);
    if (!item) {
      editorialStatus = 'Add that demo to your closet before using it in an outfit.';
      return false;
    }
    const slot = slotForItem(item);
    if (!slot || requestedSlot && requestedSlot !== slot) {
      editorialStatus = requestedSlot ? `${item.name} does not fit the ${outfitSlots.find(([id]) => id === requestedSlot)?.[1]?.toLowerCase() || requestedSlot} slot.` : 'That piece cannot be placed in this outfit.';
      return false;
    }
    manualSelection[slot] = item.id;
    if (slot === 'shape' && item.type === 'dress') delete manualSelection.top;
    lockedSlots.add(slot);
    if (editorialMode === 'suggest') editorialMode = 'hybrid';
    editorialStatus = `${item.name} added to the ${outfitSlots.find(([id]) => id === slot)[1].toLowerCase()} slot.`;
    return true;
  }

  previewItems = function editorialPreviewItems() {
    return outfitContext().items;
  };

  function filterMatch(item) {
    if (editorialFilter === 'all') return true;
    if (editorialFilter === 'bottoms') return ['skirt', 'pants'].includes(item.type);
    if (editorialFilter === 'shoes') return SHOES.includes(item.type);
    if (editorialFilter === 'accessories') return ['bag', 'jewelry'].includes(item.type);
    return item.type === editorialFilter;
  }

  function displayOrder(items) {
    const realItems = items.filter(item => !item.id.startsWith('starter-') && !item.catalogSample);
    const catalogItems = items.filter(item => item.catalogSample);
    const starterItems = items.filter(item => item.id.startsWith('starter-'));
    const priority = new Map(featuredCatalogIds.map((id, index) => [id, index]));
    const samples = [...catalogItems, ...starterItems];
    if (editorialFilter === 'all') samples.sort((a, b) => (priority.get(a.id) ?? featuredCatalogIds.length) - (priority.get(b.id) ?? featuredCatalogIds.length));
    return [...realItems, ...samples];
  }

  function currentOccasion(answerSet = answers) {
    return answerSet.occasionTheme || 'business-casual';
  }

  function currentStyle(answerSet = answers) {
    return answerSet.stylePreference || 'none';
  }

  function selectorMarkup(answerSet = answers) {
    const occasion = currentOccasion(answerSet);
    const style = currentStyle(answerSet);
    return `<div class="editorial-selectors" aria-label="Outfit direction">
      <label>Occasion
        <select name="editorial-occasion">${occasionOptions.map(([value, label]) => `<option value="${value}" ${occasion === value ? 'selected' : ''}>${label}</option>`).join('')}</select>
      </label>
      <label>Style <span>(optional)</span>
        <select name="editorial-style">${styleOptions.map(([value, label]) => `<option value="${value}" ${style === value ? 'selected' : ''}>${label}</option>`).join('')}</select>
      </label>
      <p>Every style is open to everyone. These choices guide suggestions; they never hide garments.</p>
    </div>`;
  }

  function dateControls(context = 'planner') {
    return `<div class="editorial-date-nav" aria-label="${context === 'lookbook' ? 'Browse lookbook by date' : 'Plan outfit date'}">
      <button data-date-shift="-1" aria-label="Previous day">←</button>
      <label><span>${context === 'lookbook' ? 'Looking at' : result ? data.looks.some(look => look.id === result.id) ? 'Plan another date (saved look unchanged)' : 'Unsaved look for' : 'Planning for'}</span>
        <input type="date" name="planning-date" value="${esc(planningDate)}">
      </label>
      <button data-date-today ${planningDate === localDateKey() ? 'disabled' : ''}>Today</button>
      <button data-date-shift="1" aria-label="Next day">→</button>
    </div>`;
  }

  function modeControls() {
    const modes = [
      ['manual', 'Choose myself'],
      ['suggest', 'Suggest a look'],
      ['hybrid', 'Mix & match']
    ];
    return `<div class="editorial-modes" role="group" aria-label="How to build this outfit">
      ${modes.map(([id, label]) => `<button data-editorial-mode="${id}" class="${editorialMode === id ? 'active' : ''}" aria-pressed="${editorialMode === id}">${label}</button>`).join('')}
      ${editorialMode !== 'manual' ? '<button data-suggest-again class="editorial-suggest-again">Suggest another</button>' : ''}
      <p>Suggestions use local wardrobe rules${data.learning && data.ratings.length ? ' plus your on-device rating model' : ''}; they are not generative AI.</p>
    </div>`;
  }

  function slotMarkup(items) {
    const assignments = slotAssignments(items);
    return `<div class="editorial-outfit-slots" aria-label="Outfit slots">
      ${outfitSlots.map(([slot, label]) => {
        const item = assignments[slot];
        const locked = lockedSlots.has(slot) && selectedClosetItem(slot)?.id === item?.id;
        return `<div class="editorial-outfit-slot ${item ? 'has-item' : ''} ${locked ? 'is-locked' : ''}" data-outfit-slot="${slot}" tabindex="0" role="group" aria-label="${esc(label)} slot${item ? `: ${esc(item.name)}` : ', empty'}">
          <span>${esc(label)}</span>
          <strong>${item ? esc(item.name) : 'Drop or choose a piece'}</strong>
          ${item && editorialMode !== 'suggest' ? `<span class="editorial-slot-actions"><button data-remove-slot="${slot}" aria-label="Remove ${esc(item.name)}">Remove</button>${editorialMode === 'hybrid' ? `<button data-toggle-lock="${slot}" aria-pressed="${locked}">${locked ? 'Unlock' : 'Lock'}</button>` : ''}</span>` : ''}
        </div>`;
      }).join('')}
    </div>`;
  }

  function wardrobeCard(item) {
    const sample = item.id.startsWith('starter-') || item.id.startsWith('demo-');
    if (item.catalogSample) return `<article class="editorial-piece editorial-demo">
      <span class="editorial-piece-art">${garmentArt(item)}</span>
      <span class="editorial-piece-copy"><strong>${esc(item.name)}</strong><small>Demo · ${esc(TYPES[item.type] || item.type)}</small></span>
      <button class="editorial-demo-add" data-demo-add="${esc(item.id)}">Add sample to closet</button><small class="editorial-drag-note">Add first to use in a look</small>
    </article>`;
    return `<article class="editorial-piece ${item.available ? '' : 'is-unavailable'}" data-outfit-item="${esc(item.id)}" draggable="${item.available}">
      <span class="editorial-piece-art">${garmentArt(item)}</span>
      <span class="editorial-piece-copy"><strong>${esc(item.name)}</strong><small>${sample ? 'Sample · ' : 'Closet · '}${esc(TYPES[item.type] || item.type)}</small></span>
      <span class="editorial-piece-actions"><button data-use-item="${esc(item.id)}" ${item.available ? '' : 'disabled'}>Use in look</button><button data-edit="${esc(item.id)}">Edit</button></span>
    </article>`;
  }

  function wardrobePane() {
    const storedIds = new Set(data.items.map(item => item.id));
    const stored = data.items.filter(item => item.available && filterMatch(item));
    const demos = demoCatalog.filter(item => filterMatch(item) && !storedIds.has(item.id));
    const available = displayOrder([...stored, ...demos]);
    const shown = available.slice(0, 9);
    return `<section class="editorial-wardrobe" aria-labelledby="wardrobe-heading">
      <div class="editorial-wardrobe-heading">
        <div><h1 id="wardrobe-heading">Your wardrobe. Your rules.</h1>
        <p>Explore every style.</p></div>
        <button class="editorial-panel-close" data-close-wardrobe aria-label="Close wardrobe panel">×</button>
      </div>
      <div class="editorial-filter-row" role="group" aria-label="Filter wardrobe pieces">
        ${wardrobeFilters.map(([value, label]) => `<button data-editorial-filter="${value}" class="${editorialFilter === value ? 'active' : ''}" aria-pressed="${editorialFilter === value}">${label}</button>`).join('')}
      </div>
      <div class="editorial-piece-grid">${shown.map(wardrobeCard).join('')}</div>
      ${available.length > shown.length ? `<button class="editorial-view-all" data-view="closet">Open My Closet · ${data.items.length} pieces</button>` : ''}
      ${shown.length ? '' : '<p class="editorial-empty">No available pieces in this category. Try another filter or open My Closet.</p>'}
      <p class="editorial-sample-note">Drag an available closet piece into an outfit slot, or use its button for touch and keyboard access. Demo pieces must be added first; nothing is silently imported or uploaded as a photo.</p>
    </section>`;
  }

  function decisionCard() {
    const options = getOptions();
    const selected = answers[keys[step]];
    const titles = ['Choose a starting shape', 'Choose your shoes', 'Set the scene', 'Check the forecast', 'Choose a mood', 'Add the finishing details'];
    return `<section class="editorial-decision" aria-labelledby="decision-heading">
      <div class="editorial-progress"><span>Step ${step + 1} of 6</span><i style="width:${(step + 1) / 6 * 100}%"></i></div>
      <h2 id="decision-heading">${titles[step]}</h2>
      <div class="editorial-options">${options.map(([id, name, description]) => `<button class="${selected === id ? 'selected' : ''}" data-choice="${id}" aria-pressed="${selected === id}"><strong>${name}</strong><small>${description}</small></button>`).join('')}</div>
      ${step === 2 ? `<label class="editorial-check"><input type="checkbox" id="walking" ${answers.walking ? 'checked' : ''}> I’ll be on my feet a lot</label>` : ''}
      ${step === 4 ? `<div class="editorial-palette"><span>Color story</span>${['neutral', 'earth', 'color', 'mono'].map(value => `<button class="${answers.palette === value ? 'active' : ''}" data-palette="${value}" aria-pressed="${answers.palette === value}">${labels[value]}</button>`).join('')}</div>` : ''}
      <div class="editorial-decision-actions">
        <button class="editorial-secondary" data-action="back" ${step === 0 ? 'disabled' : ''}>Back</button>
        <button class="editorial-primary" data-action="next" ${!selected ? 'disabled' : ''}>${step === 5 ? 'Create this look' : 'Continue'}</button>
      </div>
    </section>`;
  }

  function outfitSubtitle(answerSet = answers) {
    const occasion = occasionOptions.find(([value]) => value === currentOccasion(answerSet))?.[1] || 'Business Casual';
    const style = styleOptions.find(([value]) => value === currentStyle(answerSet))?.[1];
    return style && style !== 'No preference' ? `${occasion} · ${style}` : occasion;
  }

  function stagePreview() {
    const preview = outfitContext();
    return `<section class="editorial-stage" aria-labelledby="look-heading">
      <div class="editorial-stage-top">
        <div><h1 id="look-heading">A look for today</h1><p>${esc(outfitSubtitle())}</p></div>
        <div class="editorial-stage-actions">${wardrobeOpen ? '' : '<button class="editorial-secondary" data-open-wardrobe>Open wardrobe</button>'}<button class="editorial-secondary" data-action="restart">Start over</button></div>
      </div>
      ${dateControls()}
      ${modeControls()}
      ${selectorMarkup()}
      <div class="editorial-canvas" aria-label="Current outfit preview">${board(preview.items)}</div>
      <p class="editorial-preview-note ${preview.mode === 'demo' ? 'is-demo' : ''}">${esc(preview.message)}</p>
      ${editorialStatus ? `<p class="editorial-status" role="status">${esc(editorialStatus)}</p>` : ''}
      ${slotMarkup(preview.items)}
      ${decisionCard()}
    </section>`;
  }

  renderBuilder = function editorialBuilder() {
    if (result) return renderResult();
    answers.occasionTheme ||= 'business-casual';
    answers.occasion ||= occasionToPath[answers.occasionTheme];
    answers.stylePreference ||= 'none';
    return `<div class="editorial-shell ${wardrobeOpen ? '' : 'wardrobe-closed'}">${stagePreview()}${wardrobeOpen ? wardrobePane() : ''}</div>`;
  };

  renderResult = function editorialResult() {
    const answerSet = result.answers;
    answerSet.occasionTheme ||= answers.occasionTheme || 'business-casual';
    answerSet.stylePreference ||= answers.stylePreference || 'none';
    const saved = data.looks.some(look => look.id === result.id);
    return `<div class="editorial-shell result-state ${wardrobeOpen ? '' : 'wardrobe-closed'}">
      <section class="editorial-stage" aria-labelledby="look-heading">
        <div class="editorial-stage-top">
          <div><h1 id="look-heading">A look for today</h1><p>${esc(outfitSubtitle(answerSet))}</p></div>
          <div class="editorial-result-buttons">
            ${wardrobeOpen ? '' : '<button class="editorial-secondary" data-open-wardrobe>Open wardrobe</button>'}
            <button class="editorial-primary" data-action="savelook" ${result.items.length ? '' : 'disabled'}>${saved ? 'Saved to Lookbook' : 'Save this look'}</button>
            <button class="editorial-secondary" data-action="shuffle">Shuffle</button>
          </div>
        </div>
        ${dateControls()}
        ${modeControls()}
        ${selectorMarkup(answerSet)}
        <div class="editorial-canvas editorial-result-canvas">${board(result.items)}</div>
        <p class="editorial-preview-note">${saved ? `Saved look · ${result.plannedDate ? `planned for ${dateLabel(result.plannedDate)}` : 'original date not recorded'}.` : `Unsaved composition · planned for ${dateLabel(result.plannedDate || planningDate)}.`}</p>
        ${editorialStatus ? `<p class="editorial-status" role="status">${esc(editorialStatus)}</p>` : ''}
        ${slotMarkup(result.items)}
        <div class="editorial-selected-list" aria-label="Selected pieces">
          ${result.items.map(item => `<div class="editorial-selected-piece">${garmentArt(item)}<span><strong>${esc(item.name)}</strong><small>${esc(item.color)} · ${esc(item.style)}</small></span><button data-swap="${esc(item.id)}">Swap</button></div>`).join('')}
        </div>
        <div class="editorial-feedback">
          <p><strong>${result.rating === null ? 'Would you wear this?' : 'Your feedback is saved.'}</strong></p>
          <button class="${result.rating === 1 ? 'selected' : ''}" data-rate="1" aria-pressed="${result.rating === 1}">Love this</button>
          <button class="${result.rating === 0 ? 'selected' : ''}" data-rate="0" aria-pressed="${result.rating === 0}">Not quite me</button>
          <button data-action="editpath">Adjust choices</button>
          <button data-action="print">Print</button>
        </div>
      </section>
      ${wardrobeOpen ? wardrobePane() : ''}
    </div>`;
  };

  const lookbookCard = look => `<article class="look-card">${board(look.items)}<h3>${esc(look.name || lookTitle(look.answers))}</h3><p>${esc(labels[look.answers.occasion])} · ${look.plannedDate ? `planned ${esc(dateLabel(look.plannedDate))}` : `saved ${new Date(look.created).toLocaleDateString(undefined, {month:'short', day:'numeric'})}`}</p><div class="item-tools"><button class="btn" data-openlook="${esc(look.id)}">Open look →</button><button class="text-btn" data-removelook="${esc(look.id)}">Remove</button></div></article>`;

  renderLooks = function editorialRenderLooks() {
    const dated = data.looks.filter(look => look.plannedDate === planningDate).slice().reverse();
    const undated = data.looks.filter(look => !look.plannedDate).slice().reverse();
    return heading('THE ONES WORTH REPEATING', `Your little <em>lookbook.</em>`, 'Plan by local calendar day. More than one look can live on the same date.', '<button class="btn primary" data-action="newlook">Build a new look →</button>')+
      dateControls('lookbook')+
      `<section class="editorial-day-looks"><div class="editorial-lookbook-heading"><div><div class="eyebrow">${esc(dateLabel(planningDate))}</div><h2>${dated.length ? `${dated.length} saved look${dated.length === 1 ? '' : 's'}` : 'No saved looks for this day'}</h2></div><button class="btn" data-action="newlook">Plan this day</button></div>
      ${dated.length ? `<div class="look-grid">${dated.map(lookbookCard).join('')}</div>` : '<p class="editorial-empty">Browse another day or build an outfit for this date. Navigating dates never saves or overwrites a look.</p>'}</section>`+
      (undated.length ? `<section class="editorial-undated"><h2>Earlier saved looks</h2><p class="muted">These were saved before date planning existed, so no historical date has been guessed.</p><div class="look-grid">${undated.map(lookbookCard).join('')}</div></section>` : '');
  };

  function rerenderWithFocus(selector = '') {
    render();
    if (selector) queueMicrotask(() => document.querySelector(selector)?.focus({preventScroll:true}));
  }

  function syncUnsavedResult(answerSet = result?.answers || answers) {
    if (!result) return;
    const context = outfitContext(answerSet);
    result = {id:uid(), items:JSON.parse(JSON.stringify(context.items)), answers:{...answerSet}, score:null, created:new Date().toISOString(), plannedDate:planningDate, rating:null};
  }

  document.addEventListener('click', event => {
    const next = event.target.closest('[data-action="next"]');
    if (!next || step !== 5 || !['manual', 'hybrid'].includes(editorialMode)) return;
    const context = outfitContext(answers);
    if (!context.items.length) {
      event.preventDefault();
      event.stopImmediatePropagation();
      editorialStatus = 'Choose at least one available closet piece before creating this look.';
      render();
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    result = {id:uid(), items:JSON.parse(JSON.stringify(context.items)), answers:{...answers}, score:null, created:new Date().toISOString(), plannedDate:planningDate, rating:null};
    render();
  }, true);

  document.addEventListener('click', event => {
    const openedLook = event.target.closest('[data-openlook]');
    if (openedLook && result?.plannedDate) {
      planningDate = result.plannedDate;
      editorialMode = 'suggest';
      editorialStatus = 'Opened the saved look on its recorded planning date.';
      render();
      return;
    }
    const resetBuilder = event.target.closest('[data-action="restart"], [data-action="newlook"]');
    if (resetBuilder) {
      manualSelection = {};
      lockedSlots.clear();
      suggestionVariant = 0;
      editorialMode = 'suggest';
      editorialStatus = 'Started a new unsaved composition.';
      render();
      return;
    }
    const closeWardrobe = event.target.closest('[data-close-wardrobe]');
    if (closeWardrobe) {
      wardrobeOpen = false;
      editorialStatus = 'Wardrobe panel closed. Your current composition is unchanged.';
      rerenderWithFocus('[data-open-wardrobe]');
      return;
    }
    const openWardrobe = event.target.closest('[data-open-wardrobe]');
    if (openWardrobe) {
      wardrobeOpen = true;
      editorialStatus = 'Wardrobe panel opened.';
      rerenderWithFocus('[data-close-wardrobe]');
      return;
    }
    const modeButton = event.target.closest('[data-editorial-mode]');
    if (modeButton) {
      editorialMode = modeButton.dataset.editorialMode;
      if (editorialMode === 'manual' && result) {
        result.items.forEach(item => {
          if (data.items.some(candidate => candidate.id === item.id)) manualSelection[slotForItem(item)] = item.id;
        });
      }
      editorialStatus = editorialMode === 'manual' ? 'Choose myself: only pieces you select will appear.' : editorialMode === 'hybrid' ? 'Mix & match: chosen pieces stay locked while local rules fill open slots.' : 'Suggest a look: local wardrobe rules choose the full composition.';
      syncUnsavedResult();
      render();
      return;
    }
    const suggestAgain = event.target.closest('[data-suggest-again]');
    if (suggestAgain) {
      suggestionVariant++;
      editorialStatus = 'A different locally ranked combination is shown where alternatives exist.';
      syncUnsavedResult();
      render();
      return;
    }
    const useItem = event.target.closest('[data-use-item]');
    if (useItem) {
      if (placeClosetItem(useItem.dataset.useItem)) syncUnsavedResult();
      render();
      return;
    }
    const removeSlot = event.target.closest('[data-remove-slot]');
    if (removeSlot) {
      const slot = removeSlot.dataset.removeSlot;
      const old = selectedClosetItem(slot);
      delete manualSelection[slot];
      lockedSlots.delete(slot);
      editorialStatus = old ? `${old.name} removed from this unsaved composition.` : 'That slot is already empty.';
      syncUnsavedResult();
      render();
      return;
    }
    const toggleLock = event.target.closest('[data-toggle-lock]');
    if (toggleLock) {
      const slot = toggleLock.dataset.toggleLock;
      if (lockedSlots.has(slot)) {
        lockedSlots.delete(slot);
        delete manualSelection[slot];
        editorialStatus = 'Slot unlocked; local rules may fill it again.';
      } else if (selectedClosetItem(slot)) {
        lockedSlots.add(slot);
        editorialStatus = 'Chosen piece locked.';
      }
      syncUnsavedResult();
      render();
      return;
    }
    const dateShift = event.target.closest('[data-date-shift]');
    if (dateShift) {
      planningDate = shiftDate(planningDate, Number(dateShift.dataset.dateShift));
      if (result && !data.looks.some(look => look.id === result.id)) result.plannedDate = planningDate;
      editorialStatus = `Viewing ${dateLabel(planningDate)}. Nothing was saved or overwritten.`;
      render();
      return;
    }
    if (event.target.closest('[data-date-today]')) {
      planningDate = localDateKey();
      if (result && !data.looks.some(look => look.id === result.id)) result.plannedDate = planningDate;
      editorialStatus = 'Returned to Today. Nothing was saved or overwritten.';
      render();
      return;
    }
    const addDemo = event.target.closest('[data-demo-add]');
    if (addDemo) {
      const sample = demoCatalog.find(item => item.id === addDemo.dataset.demoAdd);
      if (!sample) return;
      openModal('Add this fictional sample?', `<div class="editorial-demo-review">${garmentArt(sample)}</div><p><strong>${esc(sample.name)}</strong></p><p class="muted">This copies one fictional catalog sample into the current browser closet. It does not replace a real item, copy a photo, or add the rest of the demo catalog.</p><div class="panel-actions"><button class="btn" data-action="close">Cancel</button><button class="btn primary" data-confirm-demo-add="${esc(sample.id)}">Add this sample</button></div>`);
      return;
    }
    const confirmDemo = event.target.closest('[data-confirm-demo-add]');
    if (confirmDemo) {
      const sample = demoCatalog.find(item => item.id === confirmDemo.dataset.confirmDemoAdd);
      if (!sample || data.items.some(item => item.id === sample.id)) {
        $('#modal').close();
        toast('That sample is already in this closet.');
        return;
      }
      const {catalogSample, ...copy} = sample;
      data.items.push({...copy, ownedCopy:true});
      if (!save()) {
        data.items.pop();
        return;
      }
      $('#modal').close();
      render();
      toast('Fictional sample added to this browser closet.');
      return;
    }
    const button = event.target.closest('[data-editorial-filter]');
    if (!button) return;
    editorialFilter = button.dataset.editorialFilter;
    render();
  });

  document.addEventListener('change', event => {
    if (event.target.name === 'planning-date') {
      const chosen = dateFromKey(event.target.value);
      if (!chosen) {
        editorialStatus = 'Choose a valid calendar date.';
      } else {
        planningDate = localDateKey(chosen);
        if (result && !data.looks.some(look => look.id === result.id)) result.plannedDate = planningDate;
        editorialStatus = `Viewing ${dateLabel(planningDate)}. Navigation did not save or overwrite a look.`;
      }
      render();
      return;
    }
    if (!['editorial-occasion', 'editorial-style'].includes(event.target.name)) return;
    const before = (result ? result.items : outfitContext().items).map(item => item.id).join(',');
    const saved = result && data.looks.some(look => look.id === result.id);
    const nextAnswers = {...(result?.answers || answers)};
    if (event.target.name === 'editorial-occasion') {
      nextAnswers.occasionTheme = event.target.value;
      nextAnswers.occasion = occasionToPath[event.target.value] || 'everyday';
    } else {
      nextAnswers.stylePreference = event.target.value;
      nextAnswers.occasionTheme ||= answers.occasionTheme || 'business-casual';
      nextAnswers.occasion ||= occasionToPath[nextAnswers.occasionTheme] || 'everyday';
    }
    answers = {...answers, ...nextAnswers};
    suggestionVariant = 0;
    if (result) {
      if (editorialMode === 'suggest') {
        const nextResult = generate(nextAnswers);
        if (nextResult) result = nextResult;
      } else {
        result.answers = {...nextAnswers};
        syncUnsavedResult(nextAnswers);
      }
    }
    const after = (result ? result.items : outfitContext(nextAnswers).items).map(item => item.id).join(',');
    const label = event.target.name === 'editorial-style'
      ? styleOptions.find(([value]) => value === event.target.value)?.[1] || 'selected style'
      : occasionOptions.find(([value]) => value === event.target.value)?.[1] || 'selected occasion';
    if (editorialMode === 'manual') {
      editorialStatus = `${label} recorded. Choose myself mode keeps your selected pieces unchanged.`;
    } else if (before === after) {
      editorialStatus = `No different suitable ${label} pieces are available in this source, so the composition is unchanged.`;
    } else {
      editorialStatus = `${label} changed the locally ranked composition.${saved ? ' The saved Lookbook record is unchanged.' : ''}`;
    }
    render();
  });

  document.addEventListener('dragstart', event => {
    const card = event.target.closest('[data-outfit-item]');
    if (!card || card.getAttribute('draggable') !== 'true') return;
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('text/plain', card.dataset.outfitItem);
    card.classList.add('is-dragging');
  });

  document.addEventListener('dragend', event => event.target.closest('[data-outfit-item]')?.classList.remove('is-dragging'));

  document.addEventListener('dragover', event => {
    const slot = event.target.closest('[data-outfit-slot]');
    if (!slot) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    slot.classList.add('is-dragover');
  });

  document.addEventListener('dragleave', event => event.target.closest('[data-outfit-slot]')?.classList.remove('is-dragover'));

  document.addEventListener('drop', event => {
    const slot = event.target.closest('[data-outfit-slot]');
    if (!slot) return;
    event.preventDefault();
    slot.classList.remove('is-dragover');
    if (placeClosetItem(event.dataTransfer.getData('text/plain'), slot.dataset.outfitSlot)) syncUnsavedResult();
    render();
  });

  let pointerDragItem = '';
  document.addEventListener('pointerdown', event => {
    const card = event.target.closest('[data-outfit-item][draggable="true"]');
    if (!card || event.target.closest('button') || event.pointerType && event.pointerType !== 'mouse') return;
    pointerDragItem = card.dataset.outfitItem;
    card.classList.add('is-dragging');
  });

  document.addEventListener('pointermove', event => {
    if (!pointerDragItem) return;
    document.querySelectorAll('[data-outfit-slot]').forEach(slot => slot.classList.remove('is-dragover'));
    document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-outfit-slot]')?.classList.add('is-dragover');
  });

  document.addEventListener('pointerup', event => {
    if (!pointerDragItem) return;
    const itemId = pointerDragItem;
    pointerDragItem = '';
    document.querySelectorAll('[data-outfit-item]').forEach(card => card.classList.remove('is-dragging'));
    const slot = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-outfit-slot]');
    document.querySelectorAll('[data-outfit-slot]').forEach(target => target.classList.remove('is-dragover'));
    if (!slot) return;
    if (placeClosetItem(itemId, slot.dataset.outfitSlot)) syncUnsavedResult();
    render();
  });

  document.addEventListener('pointercancel', () => {
    pointerDragItem = '';
    document.querySelectorAll('.is-dragging, .is-dragover').forEach(node => node.classList.remove('is-dragging', 'is-dragover'));
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !wardrobeOpen || !document.querySelector('.editorial-wardrobe')) return;
    wardrobeOpen = false;
    editorialStatus = 'Wardrobe panel closed. Your current composition is unchanged.';
    rerenderWithFocus('[data-open-wardrobe]');
  });

  function resetEditorialSessionState() {
    editorialMode = 'suggest';
    manualSelection = {};
    lockedSlots.clear();
    suggestionVariant = 0;
    editorialStatus = '';
    planningDate = localDateKey();
  }

  if (globalThis.outfitPathCloud) {
    const baseSwitchScope = globalThis.outfitPathCloud.switchScope;
    globalThis.outfitPathCloud.switchScope = async (...args) => {
      resetEditorialSessionState();
      return await baseSwitchScope(...args);
    };
    const baseCopyGuest = globalThis.outfitPathCloud.copyGuestToUser;
    globalThis.outfitPathCloud.copyGuestToUser = async (...args) => {
      resetEditorialSessionState();
      return await baseCopyGuest(...args);
    };
    const baseReplaceData = globalThis.outfitPathCloud.replaceData;
    globalThis.outfitPathCloud.replaceData = (...args) => {
      resetEditorialSessionState();
      return baseReplaceData(...args);
    };
  }

  render();
})();
