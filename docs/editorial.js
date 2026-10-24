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
    return pool.filter(predicate).sort((a, b) => pieceScore(b, answerSet) + bonus(b) - pieceScore(a, answerSet) - bonus(a) || a.id.localeCompare(b.id))[0];
  }

  function previewContext(answerSet = answers) {
    const actual = data.items.filter(item => item.available && !item.id.startsWith('starter-') && !item.id.startsWith('demo-'));
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

  previewItems = function editorialPreviewItems() {
    return previewContext().items;
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

  function wardrobeCard(item) {
    const sample = item.id.startsWith('starter-') || item.id.startsWith('demo-');
    if (item.catalogSample) return `<article class="editorial-piece editorial-demo">
      <span class="editorial-piece-art">${garmentArt(item)}</span>
      <span class="editorial-piece-copy"><strong>${esc(item.name)}</strong><small>Demo · ${esc(TYPES[item.type] || item.type)}</small></span>
      <button class="editorial-demo-add" data-demo-add="${esc(item.id)}">Add sample to closet</button>
    </article>`;
    return `<button class="editorial-piece ${item.available ? '' : 'is-unavailable'}" data-edit="${esc(item.id)}" aria-label="Edit ${esc(item.name)}">
      <span class="editorial-piece-art">${garmentArt(item)}</span>
      <span class="editorial-piece-copy"><strong>${esc(item.name)}</strong><small>${sample ? 'Sample · ' : ''}${esc(TYPES[item.type] || item.type)}</small></span>
    </button>`;
  }

  function wardrobePane() {
    const storedIds = new Set(data.items.map(item => item.id));
    const stored = data.items.filter(item => item.available && filterMatch(item));
    const demos = demoCatalog.filter(item => filterMatch(item) && !storedIds.has(item.id));
    const available = displayOrder([...stored, ...demos]);
    const shown = available.slice(0, 9);
    return `<section class="editorial-wardrobe" aria-labelledby="wardrobe-heading">
      <div class="editorial-wardrobe-heading">
        <h1 id="wardrobe-heading">Your wardrobe. Your rules.</h1>
        <p>Explore every style.</p>
      </div>
      <div class="editorial-filter-row" role="group" aria-label="Filter wardrobe pieces">
        ${wardrobeFilters.map(([value, label]) => `<button data-editorial-filter="${value}" class="${editorialFilter === value ? 'active' : ''}" aria-pressed="${editorialFilter === value}">${label}</button>`).join('')}
      </div>
      <div class="editorial-piece-grid">${shown.map(wardrobeCard).join('')}</div>
      ${available.length > shown.length ? `<button class="editorial-view-all" data-view="closet">Open My Closet · ${data.items.length} pieces</button>` : ''}
      ${shown.length ? '' : '<p class="editorial-empty">No available pieces in this category. Try another filter or open My Closet.</p>'}
      <p class="editorial-sample-note">Demo and Sample pieces are fictional catalog examples. A Demo joins only this browser closet after you choose Add; nothing is silently imported or uploaded as a photo.</p>
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
    const preview = previewContext();
    return `<section class="editorial-stage" aria-labelledby="look-heading">
      <div class="editorial-stage-top">
        <div><h1 id="look-heading">A look for today</h1><p>${esc(outfitSubtitle())}</p></div>
        <button class="editorial-secondary" data-action="restart">Start over</button>
      </div>
      ${selectorMarkup()}
      <div class="editorial-canvas" aria-label="Current outfit preview">${board(preview.items)}</div>
      <p class="editorial-preview-note ${preview.mode === 'demo' ? 'is-demo' : ''}">${esc(preview.message)}</p>
      ${decisionCard()}
    </section>`;
  }

  renderBuilder = function editorialBuilder() {
    if (result) return renderResult();
    answers.occasionTheme ||= 'business-casual';
    answers.occasion ||= occasionToPath[answers.occasionTheme];
    answers.stylePreference ||= 'none';
    return `<div class="editorial-shell">${stagePreview()}${wardrobePane()}</div>`;
  };

  renderResult = function editorialResult() {
    const answerSet = result.answers;
    answerSet.occasionTheme ||= answers.occasionTheme || 'business-casual';
    answerSet.stylePreference ||= answers.stylePreference || 'none';
    const saved = data.looks.some(look => look.id === result.id);
    return `<div class="editorial-shell result-state">
      <section class="editorial-stage" aria-labelledby="look-heading">
        <div class="editorial-stage-top">
          <div><h1 id="look-heading">A look for today</h1><p>${esc(outfitSubtitle(answerSet))}</p></div>
          <div class="editorial-result-buttons">
            <button class="editorial-primary" data-action="savelook">${saved ? 'Saved to Lookbook' : 'Save this look'}</button>
            <button class="editorial-secondary" data-action="shuffle">Shuffle</button>
          </div>
        </div>
        ${selectorMarkup(answerSet)}
        <div class="editorial-canvas editorial-result-canvas">${board(result.items)}</div>
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
      ${wardrobePane()}
    </div>`;
  };

  document.addEventListener('click', event => {
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
      data.items.push({...copy});
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
    if (event.target.name === 'editorial-occasion') {
      answers.occasionTheme = event.target.value;
      answers.occasion = occasionToPath[event.target.value] || 'everyday';
      if (result) {
        const saved = data.looks.some(look => look.id === result.id);
        const nextAnswers = {...result.answers, occasionTheme: answers.occasionTheme, occasion: answers.occasion, stylePreference: answers.stylePreference || result.answers.stylePreference || 'none'};
        const nextResult = generate(nextAnswers);
        if (nextResult) {
          result = nextResult;
          answers = {...nextAnswers};
          toast(saved ? 'New suggestion started. Your saved look is unchanged.' : 'Suggestion updated for the new occasion.');
        }
      }
      render();
    }
    if (event.target.name === 'editorial-style') {
      answers.stylePreference = event.target.value;
      if (result) {
        const saved = data.looks.some(look => look.id === result.id);
        const nextAnswers = {...result.answers, stylePreference: answers.stylePreference, occasionTheme: answers.occasionTheme || result.answers.occasionTheme || 'business-casual'};
        const nextResult = generate(nextAnswers);
        if (nextResult) {
          result = nextResult;
          answers = {...nextAnswers};
          toast(saved ? 'New suggestion started. Your saved look is unchanged.' : 'Suggestion updated for the new style preference.');
        }
      }
      render();
    }
  });

  render();
})();
