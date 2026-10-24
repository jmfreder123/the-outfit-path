'use strict';

(() => {
  const config = globalThis.SUPABASE_CONFIG || {};
  const callbackParams = new URLSearchParams(String(globalThis.location?.hash || globalThis.location?.search || '').replace(/^[#?]/, ''));
  const callbackType = callbackParams.get('type');
  let setupMode = callbackType === 'recovery' ? 'recovery' : callbackType === 'invite' ? 'invite' : null;
  let passwordSetupRequired = Boolean(setupMode);
  const hasPlaceholder = value => !value || /YOUR_|PLACEHOLDER/i.test(value);
  const decodeRole = key => {
    try {
      const payload = key.split('.')[1];
      if (!payload) return '';
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))).role || '';
    } catch {
      return '';
    }
  };
  const isSecretKey = key => /^sb_secret_/i.test(key || '') || decodeRole(key) === 'service_role';
  const configured = !hasPlaceholder(config.url) && !hasPlaceholder(config.publishableKey);
  const safeConfig = configured && !isSecretKey(config.publishableKey);
  const client = safeConfig && globalThis.supabase?.createClient
    ? globalThis.supabase.createClient(config.url, config.publishableKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      })
    : null;

  let pendingCloudCopy = null, pendingGuestUser = null, pendingMfaEnrollment = null, pendingMfaRemoval = null, identityRevision = 0;
  const html = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
  const panel = () => document.querySelector('#cloud-sync-panel');
  const message = text => { if (typeof toast === 'function') toast(text); };
  const closeAndScrubMfaModal = () => {
    document.querySelector('#modal')?.close();
    const body = document.querySelector('#modal-body');
    if (body) body.innerHTML = '';
  };
  const authGate = () => {
    let gate = document.querySelector('#auth-entry-gate');
    if (gate || typeof document.createElement !== 'function') return gate;
    gate = document.createElement('dialog');
    gate.id = 'auth-entry-gate';
    gate.className = 'auth-entry-gate';
    gate.addEventListener('cancel', event => event.preventDefault());
    document.body.append(gate);
    return gate;
  };
  const showAuthGate = user => {
    const gate = authGate();
    if (!gate) return;
    const callbackProblem = passwordSetupRequired && !user
      ? '<p class="warning">This invitation or password-reset link could not be completed. It may be invalid or expired. Request a new password link below, or ask John M. Fredericks for a new invitation.</p>'
      : '';
    gate.innerHTML = user && passwordSetupRequired
      ? setupMode === 'recovery'
        ? `<div class="eyebrow">PRIVATE PASSWORD RECOVERY</div><h1>Choose a new password.</h1><p>Your recovery link is valid. Set a new password before opening your private wardrobe.</p><form id="account-setup-form" class="cloud-form"><label>New password<input type="password" name="password" autocomplete="new-password" minlength="12" required></label><button class="btn primary" type="submit">Set password and continue</button></form><p class="hint">Your password goes directly to Supabase Auth. The Outfit Path does not store it.</p><div id="auth-entry-status" class="warning" role="status" aria-live="polite"></div>`
        : `<div class="eyebrow">INVITED ADULT ACCOUNT</div><h1>Finish setting up your account.</h1><p>Your invitation is valid. Choose a password before opening your private wardrobe.</p><form id="account-setup-form" class="cloud-form"><label>New password<input type="password" name="password" autocomplete="new-password" minlength="12" required></label><button class="btn primary" type="submit">Set password and continue</button></form><p class="hint">Your password goes directly to Supabase Auth. The Outfit Path does not store it.</p><div id="auth-entry-status" class="warning" role="status" aria-live="polite"></div>`
      : `<div class="eyebrow">INVITE-ONLY · ADULTS 18+</div><h1>Sign in to your private wardrobe.</h1><p>This beta has no public signup. Only adults invited by John M. Fredericks can finish account setup and sign in.</p>${callbackProblem}<form id="auth-entry-form" class="cloud-form"><label>Email<input type="email" name="email" autocomplete="email" required></label><label>Password<input type="password" name="password" autocomplete="current-password" minlength="12" required></label><button class="btn primary" type="submit">Sign in</button><button class="text-btn" type="button" data-auth-action="forgot-password">Forgot password?</button></form><form id="password-recovery-form" class="cloud-form recovery-form" hidden><p>Enter the email address for an existing invited account. The response will not reveal whether an account exists.</p><label>Email<input type="email" name="email" autocomplete="email" required></label><div class="result-actions"><button class="btn primary" type="submit">Email password-reset link</button><button class="text-btn" type="button" data-auth-action="cancel-recovery">Cancel</button></div></form><p class="hint">Opening a valid invitation or password-reset link after confirming you are 18 or older will show the account-setup screen. Do not share these links.</p><div id="auth-entry-status" class="warning" role="status" aria-live="polite"></div>`;
    if (!gate.open) gate.showModal();
  };
  const hideAuthGate = () => document.querySelector('#auth-entry-gate')?.close();
  const authGateMessage = text => { const target = document.querySelector('#auth-entry-status'); if (target) target.textContent = text; };
  const showMfaGate = (user, factors) => {
    const gate = authGate();
    if (!gate) return;
    const choices = factors.map(factor => `<option value="${html(factor.id)}">${html(factor.friendly_name || 'Authenticator app')}</option>`).join('');
    gate.innerHTML = `<div class="eyebrow">TWO-STEP VERIFICATION</div><h1>Enter your authenticator code.</h1><p>${html(user.email || 'This account')} has an authenticator app enrolled. Your wardrobe stays locked until the second factor is verified.</p><form id="mfa-challenge-form" class="cloud-form">${factors.length > 1 ? `<label>Authenticator<select name="factorId" required>${choices}</select></label>` : `<input type="hidden" name="factorId" value="${html(factors[0]?.id || '')}">`}<label>6-digit code<input type="text" name="code" autocomplete="one-time-code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required></label><button class="btn primary" type="submit">Verify and open wardrobe</button></form><p class="hint">Lost your authenticator? Sign out and contact John M. Fredericks. Supabase TOTP does not provide recovery codes in this app; factor removal requires separate identity verification.</p><button class="text-btn" type="button" data-cloud-action="signout">Sign out of this browser</button><div id="auth-entry-status" class="warning" role="status" aria-live="polite"></div>`;
    if (!gate.open) gate.showModal();
  };
  const publicWardrobe = () => {
    const copy = globalThis.outfitPathCloud.getData();
    for (const item of copy.items || []) delete item.photoId;
    for (const look of copy.looks || []) for (const item of look.items || []) delete item.photoId;
    return copy;
  };

  async function currentUser() {
    if (!client) return null;
    const { data: { user }, error } = await client.auth.getUser();
    if (error) {
      if (/session missing|jwt expired|invalid jwt/i.test(error.message || '')) return null;
      throw error;
    }
    return user || null;
  }

  async function mfaStatus() {
    if (!client?.auth?.mfa) return { currentLevel: 'aal1', nextLevel: 'aal1', verified: [] };
    const [{ data: assurance, error: assuranceError }, { data: factors, error: factorError }] = await Promise.all([
      client.auth.mfa.getAuthenticatorAssuranceLevel(),
      client.auth.mfa.listFactors()
    ]);
    if (assuranceError) throw assuranceError;
    if (factorError) throw factorError;
    return {
      currentLevel: assurance?.currentLevel || 'aal1',
      nextLevel: assurance?.nextLevel || 'aal1',
      verified: (factors?.totp || []).filter(factor => factor.status === 'verified')
    };
  }

  async function syncIdentity(user, requestedRevision = ++identityRevision) {
    if (user && !passwordSetupRequired) {
      const status = await mfaStatus();
      if (requestedRevision !== identityRevision) return false;
      if (status.nextLevel === 'aal2' && status.currentLevel !== 'aal2' && status.verified.length) {
        await globalThis.outfitPathCloud.switchScope(null);
        if (requestedRevision !== identityRevision) return false;
        document.body?.classList?.add('account-pending');
        showMfaGate(user, status.verified);
        return true;
      }
      await globalThis.outfitPathCloud.switchScope(user.id);
      if (requestedRevision !== identityRevision) return false;
      hideAuthGate();
      document.body?.classList?.remove('account-pending');
    } else {
      await globalThis.outfitPathCloud.switchScope(null);
      if (requestedRevision !== identityRevision) return false;
      document.body?.classList?.add('account-pending');
      showAuthGate(user);
    }
    return true;
  }

  async function refreshIdentity() {
    const revision = ++identityRevision;
    const user = await currentUser();
    if (revision !== identityRevision) return { stale: true, user: null };
    const applied = await syncIdentity(user, revision);
    return { stale: !applied, user: applied ? user : null };
  }

  async function requireMatchingScope(user) {
    if (!user || !globalThis.outfitPathCloud.matchesUser(user.id)) {
      throw Object.assign(Error('The local wardrobe does not belong to the signed-in account.'), { code: 'scope_mismatch' });
    }
    return user;
  }

  async function renderPanel() {
    const target = panel();
    if (!target) return;
    if (!configured) {
      target.innerHTML = '<h3>Optional cloud backup</h3><p class="muted">Cloud backup is prepared but not configured yet. Your wardrobe remains only in this browser.</p>';
      return;
    }
    if (!safeConfig) {
      target.innerHTML = '<h3>Optional cloud backup</h3><p class="warning">Cloud backup is disabled because the configuration contains a secret key. Use a publishable or legacy anon key instead.</p>';
      return;
    }
    if (!client) {
      target.innerHTML = '<h3>Optional cloud backup</h3><p class="warning">Cloud backup could not load. Your browser copy is unchanged.</p>';
      return;
    }
    try {
      const identity = await refreshIdentity();
      if (identity.stale) return;
      const user = identity.user;
      if (!user) {
        target.innerHTML = `<h3>Invite-only cloud backup</h3><p class="muted">This private beta has no public signup. If John M. Fredericks invited you and you completed the invitation, sign in to keep one private cloud copy of clothing details, looks, and ratings. Photos stay on this device.</p><form id="cloud-auth-form" class="cloud-form"><label>Email<input type="email" name="email" autocomplete="email" required></label><label>Password<input type="password" name="password" autocomplete="current-password" minlength="12" required></label><div class="result-actions"><button class="btn primary">Sign in</button></div></form><p class="hint">Need access? Contact John M. Fredericks. Do not share an invitation link.</p>`;
        return;
      }
      const guest = globalThis.outfitPathCloud.guestSummary();
      const status = await mfaStatus();
      const factor = status.verified[0];
      const mfaControls = factor
        ? `<details><summary>Authenticator app: enabled</summary><p class="muted">This account must complete a second-factor challenge before its wardrobe or cloud row can be opened. Removing the factor requires an AAL2 session and explicit confirmation.</p><button class="btn" data-cloud-action="request-mfa-unenroll" data-factor-id="${html(factor.id)}">Remove authenticator app</button></details>`
        : `<details><summary>Add an authenticator app (optional)</summary><p class="muted">Have an authenticator app ready before setup. Common options include Google Authenticator, Microsoft Authenticator, and Authy. Apple Passwords can also store verification codes on supported Apple devices.</p><ol><li>Open the authenticator app on your phone.</li><li>Tap <strong>Add account</strong> or the <strong>+</strong> button.</li><li>Choose <strong>Scan QR code</strong> inside the authenticator app—not the phone's ordinary Camera app.</li><li>Then select setup below. After scanning, enter the app's current six-digit code and enable the factor.</li></ol><p class="hint">The setup QR is private. Do not screenshot, save, or share it.</p><button class="btn" data-cloud-action="begin-mfa-enrollment">Set up authenticator app</button></details>`;
      target.innerHTML = `<h3>Invite-only cloud backup</h3><p class="muted">Signed in as ${html(user.email || 'your account')}. This browser wardrobe is isolated to that account. Upload and download are manual; photos stay on this device.</p><div class="result-actions"><button class="btn primary" data-cloud-action="upload">Upload this account copy</button><button class="btn" data-cloud-action="download">Download this account's cloud copy</button><button class="text-btn" data-cloud-action="signout">Sign out of this browser</button></div>${mfaControls}<details><summary>Copy the preserved guest wardrobe</summary><p class="muted">The separate guest copy currently has ${guest.items} pieces, ${guest.looks} saved ${guest.looks===1?'look':'looks'}, and ${guest.ratings} style ${guest.ratings===1?'rating':'ratings'}. Copying is optional, keeps the guest copy intact, and does not upload anything.</p><button class="btn" data-cloud-action="copy-guest">Review guest copy</button></details><details><summary>Finish invitation password setup</summary><form id="cloud-password-form" class="cloud-form"><label>New password<input type="password" name="password" autocomplete="new-password" minlength="12" required></label><button class="btn" type="submit">Set password</button></form><p class="hint">Only use this after opening John M. Fredericks' invitation link in this browser.</p></details><p class="hint">Cloud and account deletion are not available in this preview. <a href="privacy.html">Read the draft privacy notice.</a></p>`;
    } catch (error) {
      await syncIdentity(null);
      target.innerHTML = '<h3>Optional cloud backup</h3><p class="warning">Cloud backup is temporarily unavailable. Signed-in account data is hidden; the separate guest copy is shown until the session can be verified.</p>';
    }
  }

  async function authenticate(form) {
    const values = new FormData(form);
    const email = String(values.get('email') || '').trim();
    const password = String(values.get('password') || '');
    const { data: signedIn, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await syncIdentity(signedIn.user);
    message('Signed in.');
    await renderPanel();
  }

  const approvedRecoveryRedirect = () => {
    const origin = String(globalThis.location?.origin || '');
    if (origin === 'http://127.0.0.1:4173' || origin === 'https://theoutfitpath.com') return `${origin}/`;
    return null;
  };

  async function requestPasswordRecovery(form) {
    const email = String(new FormData(form).get('email') || '').trim();
    const redirectTo = approvedRecoveryRedirect();
    if (!redirectTo) {
      authGateMessage('Password recovery is available only from the approved local test address or the production app.');
      return;
    }
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
    form.reset();
    authGateMessage(error
      ? 'The recovery request could not be processed. Try again later or contact John M. Fredericks.'
      : 'If this email belongs to an invited account, a password-reset link will arrive shortly. Check spam too.');
  }

  async function updatePassword(form) {
    const password = String(new FormData(form).get('password') || '');
    if (password.length < 12) throw Error('Password is too short.');
    const { error } = await client.auth.updateUser({ password });
    if (error) throw error;
    form.reset();
    message('Password set for your invited account.');
  }

  async function finishAccountSetup(form) {
    await updatePassword(form);
    passwordSetupRequired = false;
    setupMode = null;
    if (globalThis.history?.replaceState && globalThis.location?.pathname) {
      globalThis.history.replaceState(null, '', globalThis.location.pathname);
    }
    await syncIdentity(await currentUser());
  }

  async function verifyMfa(form) {
    const values = new FormData(form);
    const factorId = String(values.get('factorId') || '');
    const code = String(values.get('code') || '').trim();
    if (!/^[0-9]{6}$/.test(code)) throw Object.assign(Error('Invalid authenticator code format.'), { code: 'mfa_invalid' });
    const status = await mfaStatus();
    if (!status.verified.some(factor => factor.id === factorId)) throw Object.assign(Error('Authenticator factor changed.'), { code: 'mfa_invalid' });
    const { data: challenge, error: challengeError } = await client.auth.mfa.challenge({ factorId });
    if (challengeError) throw challengeError;
    const { error: verifyError } = await client.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
    if (verifyError) throw verifyError;
    form.reset();
    message('Two-step verification complete.');
    await syncIdentity(await currentUser());
    if (panel()) await renderPanel();
  }

  async function beginMfaEnrollment() {
    const user = await requireMatchingScope(await currentUser());
    const status = await mfaStatus();
    if (status.verified.length) throw Object.assign(Error('An authenticator is already enrolled.'), { code: 'mfa_exists' });
    const { data, error } = await client.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'The Outfit Path' });
    if (error) throw error;
    const qrCode = String(data?.totp?.qr_code || '');
    if (!/^data:image\/svg\+xml(?:;[^,]*)?,/i.test(qrCode)) {
      await client.auth.mfa.unenroll({ factorId: data.id });
      throw Object.assign(Error('Authenticator QR data was invalid.'), { code: 'mfa_invalid' });
    }
    pendingMfaEnrollment = { userId: user.id, factorId: data.id };
    openModal('Set up an authenticator app', `<p>Use Google Authenticator, Microsoft Authenticator, Authy, or another TOTP app. Apple Passwords can also store verification codes on supported Apple devices.</p><ol><li>Open that app first.</li><li>Tap <strong>Add account</strong> or <strong>+</strong>.</li><li>Choose <strong>Scan QR code</strong> inside the authenticator app—not the phone's ordinary Camera app.</li><li>Scan the private QR below.</li><li>Enter the current six-digit code shown by the authenticator, then select <strong>Enable authenticator app</strong>.</li></ol><p class="warning">Keep this QR private. Do not screenshot, save, or share it.</p><img class="mfa-qr" src="${html(qrCode)}" alt="Private authenticator enrollment QR code"><form id="mfa-enrollment-form" class="cloud-form"><label>Current 6-digit code<input type="text" name="code" autocomplete="one-time-code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required></label><div class="panel-actions"><button class="btn" type="button" data-cloud-action="cancel-mfa-enrollment">Cancel setup</button><button class="btn primary" type="submit">Enable authenticator app</button></div></form><p class="hint">The QR secret exists only for this pending setup and is never written to wardrobe storage or logs.</p>`);
  }

  async function finishMfaEnrollment(form) {
    const user = await requireMatchingScope(await currentUser());
    if (!pendingMfaEnrollment || pendingMfaEnrollment.userId !== user.id) throw Object.assign(Error('Authenticator setup expired.'), { code: 'mfa_invalid' });
    const code = String(new FormData(form).get('code') || '').trim();
    if (!/^[0-9]{6}$/.test(code)) throw Object.assign(Error('Invalid authenticator code format.'), { code: 'mfa_invalid' });
    const factorId = pendingMfaEnrollment.factorId;
    const { data: challenge, error: challengeError } = await client.auth.mfa.challenge({ factorId });
    if (challengeError) throw challengeError;
    const { error: verifyError } = await client.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
    if (verifyError) throw verifyError;
    pendingMfaEnrollment = null;
    closeAndScrubMfaModal();
    message('Authenticator app enabled.');
    await syncIdentity(user);
    await renderPanel();
  }

  async function cancelMfaEnrollment() {
    if (!pendingMfaEnrollment) return;
    const user = await currentUser();
    if (!user || pendingMfaEnrollment.userId !== user.id) throw Object.assign(Error('The signed-in account changed.'), { code: 'scope_mismatch' });
    const { error } = await client.auth.mfa.unenroll({ factorId: pendingMfaEnrollment.factorId });
    if (error) throw error;
    pendingMfaEnrollment = null;
    closeAndScrubMfaModal();
    message('Authenticator setup cancelled.');
  }

  async function requestMfaRemoval(factorId) {
    const user = await requireMatchingScope(await currentUser());
    const status = await mfaStatus();
    if (status.currentLevel !== 'aal2' || !status.verified.some(factor => factor.id === factorId)) {
      throw Object.assign(Error('Recent two-step verification is required.'), { code: 'mfa_required' });
    }
    pendingMfaRemoval = { userId: user.id, factorId };
    openModal('Remove authenticator app?', '<p>This lowers the account to password-only protection. It does not delete wardrobe data.</p><div class="panel-actions"><button class="btn" data-action="close">Keep authenticator</button><button class="btn primary" data-cloud-action="confirm-mfa-unenroll">Remove authenticator</button></div>');
  }

  async function confirmMfaRemoval() {
    const user = await requireMatchingScope(await currentUser());
    const status = await mfaStatus();
    if (!pendingMfaRemoval || pendingMfaRemoval.userId !== user.id || status.currentLevel !== 'aal2' || !status.verified.some(factor => factor.id === pendingMfaRemoval.factorId)) {
      throw Object.assign(Error('Recent two-step verification is required.'), { code: 'mfa_required' });
    }
    const { error } = await client.auth.mfa.unenroll({ factorId: pendingMfaRemoval.factorId });
    if (error) throw error;
    pendingMfaRemoval = null;
    await client.auth.refreshSession();
    document.querySelector('#modal')?.close();
    message('Authenticator app removed.');
    await syncIdentity(user);
    await renderPanel();
  }

  async function upload() {
    const user = await currentUser();
    if (!user) throw Error('Sign in before uploading a cloud copy.');
    await requireMatchingScope(user);
    const { error } = await client.from('wardrobe_documents').upsert({
      user_id: user.id,
      data: publicWardrobe(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
    if (error) throw error;
    message('Private cloud copy uploaded. Photos stayed on this device.');
  }

  async function requestDownload() {
    const user = await currentUser();
    if (!user) throw Error('Sign in before downloading a cloud copy.');
    await requireMatchingScope(user);
    const { data: row, error } = await client.from('wardrobe_documents').select('data,updated_at').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    if (!row) throw Error('No cloud copy exists yet. Upload this browser first.');
    pendingCloudCopy = { data: row.data, userId: user.id };
    openModal('Replace this browser copy?', `<p>The private cloud copy from ${html(new Date(row.updated_at).toLocaleString())} will replace clothing details, saved looks, and ratings in this browser.</p><p class="muted">Photos are not part of cloud backup. Export a full backup first if you need to preserve them.</p><div class="panel-actions"><button class="btn" data-action="close">Cancel</button><button class="btn primary" data-cloud-action="confirm-download">Replace browser copy</button></div>`);
  }

  async function requestGuestCopy() {
    const user = await requireMatchingScope(await currentUser());
    const guest = globalThis.outfitPathCloud.guestSummary();
    pendingGuestUser = { id: user.id, email: user.email || 'this account' };
    openModal('Copy the preserved guest wardrobe?', `<p>This will replace only the browser copy for <strong>${html(pendingGuestUser.email)}</strong> with the separate guest copy: ${guest.items} pieces, ${guest.looks} saved looks, and ${guest.ratings} ratings.</p><p class="muted">The guest copy and its photos remain intact. Nothing is uploaded, moved, or deleted. You can cancel and export either copy first.</p><div class="panel-actions"><button class="btn" data-action="close">Cancel</button><button class="btn primary" data-cloud-action="confirm-copy-guest">Copy into this account</button></div>`);
  }

  async function handle(action, source) {
    if (action === 'upload') await upload();
    if (action === 'download') await requestDownload();
    if (action === 'copy-guest') await requestGuestCopy();
    if (action === 'begin-mfa-enrollment') await beginMfaEnrollment();
    if (action === 'cancel-mfa-enrollment') await cancelMfaEnrollment();
    if (action === 'request-mfa-unenroll') await requestMfaRemoval(String(source?.dataset?.factorId || ''));
    if (action === 'confirm-mfa-unenroll') await confirmMfaRemoval();
    if (action === 'confirm-copy-guest') {
      const user = await requireMatchingScope(await currentUser());
      if (!pendingGuestUser || pendingGuestUser.id !== user.id) throw Object.assign(Error('The signed-in account changed.'), { code: 'scope_mismatch' });
      await globalThis.outfitPathCloud.copyGuestToUser(user.id);
      pendingGuestUser = null;
      document.querySelector('#modal')?.close();
      message('Guest wardrobe copied into this account on this browser. Nothing was uploaded.');
    }
    if (action === 'confirm-download') {
      if (!pendingCloudCopy) return;
      const user = await requireMatchingScope(await currentUser());
      if (pendingCloudCopy.userId !== user.id) throw Object.assign(Error('The signed-in account changed.'), { code: 'scope_mismatch' });
      globalThis.outfitPathCloud.replaceData(pendingCloudCopy.data);
      pendingCloudCopy = null;
      document.querySelector('#modal')?.close();
      message('Cloud copy downloaded to this browser.');
    }
    if (action === 'signout') {
      if (pendingMfaEnrollment) {
        const user = await currentUser();
        if (user && pendingMfaEnrollment.userId === user.id) {
          await client.auth.mfa.unenroll({ factorId: pendingMfaEnrollment.factorId });
        }
        pendingMfaEnrollment = null;
        closeAndScrubMfaModal();
      }
      const { error } = await client.auth.signOut({ scope: 'local' });
      if (error) throw error;
      await syncIdentity(null);
      message('Signed out.');
      await renderPanel();
    }
  }

  document.addEventListener('submit', async event => {
    if (!['cloud-auth-form', 'cloud-password-form', 'auth-entry-form', 'account-setup-form', 'password-recovery-form', 'mfa-challenge-form', 'mfa-enrollment-form'].includes(event.target.id)) return;
    event.preventDefault();
    event.target.querySelectorAll('button').forEach(button => { button.disabled = true; });
    try {
      if (['cloud-auth-form', 'auth-entry-form'].includes(event.target.id)) await authenticate(event.target);
      else if (event.target.id === 'password-recovery-form') await requestPasswordRecovery(event.target);
      else if (event.target.id === 'mfa-challenge-form') await verifyMfa(event.target);
      else if (event.target.id === 'mfa-enrollment-form') await finishMfaEnrollment(event.target);
      else if (event.target.id === 'account-setup-form') await finishAccountSetup(event.target);
      else await updatePassword(event.target);
    } catch (error) {
      const signIn = ['cloud-auth-form', 'auth-entry-form'].includes(event.target.id);
      const recovery = event.target.id === 'password-recovery-form';
      const mfa = ['mfa-challenge-form', 'mfa-enrollment-form'].includes(event.target.id);
      const text = signIn
        ? 'Sign-in could not be completed. Check your invitation, password, and email confirmation status.'
        : recovery
          ? 'The recovery request could not be processed. Try again later or contact John M. Fredericks.'
        : mfa
          ? 'Authenticator verification could not be completed. Check the current 6-digit code and try again.'
        : 'Password setup could not be completed. Reopen the invitation link or request a new invitation.';
      if (event.target.id === 'auth-entry-form' || event.target.id === 'account-setup-form' || event.target.id === 'mfa-challenge-form' || recovery) authGateMessage(text);
      else message(text);
      event.target.querySelectorAll('button').forEach(button => { button.disabled = false; });
    }
  });

  document.addEventListener('click', async event => {
    const authButton = event.target.closest('[data-auth-action]');
    if (authButton?.dataset?.authAction) {
      const recoveryForm = document.querySelector('#password-recovery-form');
      const signInEmail = document.querySelector('#auth-entry-form input[name="email"]');
      if (authButton.dataset.authAction === 'forgot-password' && recoveryForm) {
        recoveryForm.hidden = false;
        const recoveryEmail = recoveryForm.querySelector('input[name="email"]');
        if (recoveryEmail && signInEmail?.value) recoveryEmail.value = signInEmail.value;
        recoveryEmail?.focus();
      }
      if (authButton.dataset.authAction === 'cancel-recovery' && recoveryForm) recoveryForm.hidden = true;
      return;
    }
    const button = event.target.closest('[data-cloud-action]');
    if (!button || button.disabled) return;
    button.disabled = true;
    try {
      await handle(button.dataset.cloudAction, button);
    } catch (error) {
      message(error?.code === 'scope_mismatch'
        ? 'Cloud action blocked because the local wardrobe does not match the signed-in account.'
        : error?.code === 'mfa_required'
          ? 'Complete two-step verification before changing the authenticator.'
          : 'The account action could not be completed. Your wardrobe is unchanged.');
      button.disabled = false;
    }
  });

  client?.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      pendingMfaEnrollment = null;
      pendingMfaRemoval = null;
      closeAndScrubMfaModal();
    }
    if (event === 'PASSWORD_RECOVERY') {
      setupMode = 'recovery';
      passwordSetupRequired = true;
    }
    queueMicrotask(async () => {
      await syncIdentity(session?.user || null);
      if (panel()) await renderPanel();
    });
  });
  globalThis.wardrobeCloud = { renderPanel };

  (async () => {
    try { await refreshIdentity(); }
    catch { await syncIdentity(null); }
  })();
})();
