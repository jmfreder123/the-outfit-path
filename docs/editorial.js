'use strict';

(() => {
  const starterAssets = {
    'starter-6': ['assets/design3/charcoal-trousers.png', 'Black tailored trousers'],
    'starter-13': ['assets/design3/cream-knit.png', 'Cream cable-knit sweater'],
    'starter-15': ['assets/design3/white-shirt.png', 'White button-down'],
    'starter-25': ['assets/design3/loafers.png', 'Black leather loafers'],
    'starter-33': ['assets/design3/blazer.png', 'Black tailored blazer'],
    'starter-38': ['assets/design3/tote.png', 'Canvas everyday tote']
  };
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
    ['shoes', 'Shoes']
  ];
  let editorialFilter = 'all';

  const baseGarmentArt = garmentArt;
  garmentArt = function editorialGarmentArt(item) {
    const asset = !item.photoId && starterAssets[item.id];
    if (!asset) return baseGarmentArt(item);
    return `<span class="photo-frame demo-photo" data-demo-piece="true"><img class="garment-photo" src="${asset[0]}" alt="${esc(asset[1])}" loading="lazy" decoding="async"></span>`;
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

  function filterMatch(item) {
    if (editorialFilter === 'all') return true;
    if (editorialFilter === 'bottoms') return ['skirt', 'pants'].includes(item.type);
    if (editorialFilter === 'shoes') return SHOES.includes(item.type);
    return item.type === editorialFilter;
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
    const sample = item.id.startsWith('starter-');
    return `<button class="editorial-piece ${item.available ? '' : 'is-unavailable'}" data-edit="${esc(item.id)}" aria-label="Edit ${esc(item.name)}">
      <span class="editorial-piece-art">${garmentArt(item)}</span>
      <span class="editorial-piece-copy"><strong>${esc(item.name)}</strong><small>${sample ? 'Sample · ' : ''}${esc(TYPES[item.type] || item.type)}</small></span>
    </button>`;
  }

  function wardrobePane() {
    const available = data.items.filter(item => item.available && filterMatch(item));
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
      ${available.length > shown.length ? `<button class="editorial-view-all" data-view="closet">View all ${available.length} pieces</button>` : ''}
      ${shown.length ? '' : '<p class="editorial-empty">No available pieces in this category. Try another filter or open My Closet.</p>'}
      <p class="editorial-sample-note">Items marked Sample are starter examples. They are never silently copied into another account or uploaded as photos.</p>
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
    return `<section class="editorial-stage" aria-labelledby="look-heading">
      <div class="editorial-stage-top">
        <div><h1 id="look-heading">A look for today</h1><p>${esc(outfitSubtitle())}</p></div>
        <button class="editorial-secondary" data-action="restart">Start over</button>
      </div>
      ${selectorMarkup()}
      <div class="editorial-canvas" aria-label="Current outfit preview">${board(previewItems())}</div>
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
    const button = event.target.closest('[data-editorial-filter]');
    if (!button) return;
    editorialFilter = button.dataset.editorialFilter;
    render();
  });

  document.addEventListener('change', event => {
    if (event.target.name === 'editorial-occasion') {
      answers.occasionTheme = event.target.value;
      answers.occasion = occasionToPath[event.target.value] || 'everyday';
      if (result) result.answers = {...result.answers, occasionTheme: answers.occasionTheme, occasion: answers.occasion};
      render();
    }
    if (event.target.name === 'editorial-style') {
      answers.stylePreference = event.target.value;
      if (result) result.answers = {...result.answers, stylePreference: answers.stylePreference};
      render();
    }
  });

  render();
})();
