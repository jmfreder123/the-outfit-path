'use strict';

(() => {
  const SESSION_KEY = 'outfit-path-age-18-session';
  const gate = document.querySelector('#age-gate');
  const content = document.querySelector('#age-gate-content');
  const accept = document.querySelector('#age-accept');
  const decline = document.querySelector('#age-decline');
  let starting = false;

  document.body.classList.add('age-pending');
  gate.addEventListener('cancel', event => event.preventDefault());

  const addScript = ({ src, integrity }) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    if (integrity) {
      script.integrity = integrity;
      script.crossOrigin = 'anonymous';
      script.referrerPolicy = 'no-referrer';
    }
    script.addEventListener('load', resolve, { once: true });
    script.addEventListener('error', reject, { once: true });
    document.body.append(script);
  });

  async function startApp() {
    if (starting) return;
    starting = true;
    try {
      for (const script of [
        { src: 'app.js' },
        { src: 'editorial.js' },
        { src: 'scanner.js' },
        { src: 'supabase-config.js' },
        {
          src: 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.76.1/dist/umd/supabase.min.js',
          integrity: 'sha384-E5rUTHDRUm1TnfCJj1VyMaNq7zE7vCkjW4KJxzdA4YVj11kqsx+5dY3gUioXdGsP'
        },
        { src: 'supabase-sync.js?v=7' }
      ]) await addScript(script);
      gate.close();
      gate.remove();
      document.body.classList.remove('age-pending');
    } catch {
      content.innerHTML = '<div class="age-declined"><h1>The app could not start.</h1><p>Your wardrobe and cloud copy were not changed. Please reload and try again.</p><p><a href="privacy.html">Privacy notice</a></p></div>';
      starting = false;
    }
  }

  accept.addEventListener('click', () => {
    try { sessionStorage.setItem(SESSION_KEY, 'yes'); } catch { /* Continue without persistence. */ }
    startApp();
  });

  decline.addEventListener('click', () => {
    content.innerHTML = '<div class="age-declined"><div class="eyebrow">ADULTS ONLY</div><h1>This app is not available to you.</h1><p>The Outfit Path is limited to adults age 18 and over. No wardrobe, account, or cloud scripts were loaded.</p><p><a href="privacy.html">Read the privacy notice</a> or close this tab.</p></div>';
  });

  let alreadyConfirmed = false;
  try { alreadyConfirmed = sessionStorage.getItem(SESSION_KEY) === 'yes'; } catch { /* Ask again. */ }
  if (alreadyConfirmed) startApp();
  else {
    if (gate.open) gate.close();
    gate.showModal();
  }
})();
