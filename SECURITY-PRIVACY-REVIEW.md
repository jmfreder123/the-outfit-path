# The Outfit Path — Security and Privacy Review

Review date: 2026-10-24; stage 7 audit added 2026-10-26
Scope: local branch `codex/supabase-wardrobe`; no public deployment, push, or security-setting mutation
Status: pre-launch review, not a certification or guarantee

The stage 7 section below is the current state. The sections after it are the October 24 review, kept as the record of what was checked then.

## Stage 7 audit, 2026-10-26

Scope: the current code on the Mac (`wardrobe-supabase`, including the redesign, sample ideas, style learning, on-device screening and the diary), the database migrations, the security headers, and read-only checks of the live site and the live Supabase project. No push, deployment, account setting, database or DNS change was made. No account was created and no email was sent.

### Verdict

Not ready for a beta with people other than John. The code-level problems found are fixed locally. The remaining blockers need John's decisions or owner-only actions; they are the High rows under "Still open".

### What is live right now

- theoutfitpath.com is served by Cloudflare and runs an older build: navigation reads Outfit builder / My closet / Lookbook / My style. None of the work from the redesign onward is live, including explicit-content screening, the diary and the fixes below. In the live build, item photos are saved without the explicit-content check.
- Live headers (checked 2026-10-26): CSP with frame-ancestors 'none', X-Frame-Options DENY, nosniff, Referrer-Policy no-referrer, Permissions-Policy. No Strict-Transport-Security and no Cross-Origin-Opener-Policy.
- Direct sign-up through the Auth API, with John's permission, using a made-up example.com address (2026-10-26): refused with HTTP 422 `signup_disabled` ("Signups not allowed for this instance"). No user was returned or created.
- Unknown paths (/.git/HEAD, /_headers, /README.md, /supabase/migrations/) return the app page, not repository files.
- Live Supabase, read with the public key only: public signup disabled, email confirmation required, anonymous sign-ins off, email is the only provider. Anonymous read of wardrobe_documents is refused (HTTP 401, 42501). No storage buckets are visible anonymously. The schema listing requires a secret key.
- `CLOUDFLARE-DEPLOYMENT.md` still describes the domain as parked; that is out of date.

### Fixed in this stage (local commits, not deployed)

| Severity | Problem | Fix | Commit |
|---|---|---|---|
| Medium | The security policy let the page run any script hosted on cdn.jsdelivr.net, so an injected script tag pointing at any package there would run. | Only the pinned Supabase file and the pinned recognition runtime folder are allowed. A script from another jsDelivr package was refused in the browser test. | 5e0dde4 |
| Medium (broken feature) | With the production headers, the recognition worker could not compile WebAssembly, so Recognize would fail after the model downloaded. Reproduced with a minimal module under the same headers. | Added 'wasm-unsafe-eval', which allows WebAssembly but not eval(). The worker then compiled WebAssembly and loaded the pinned runtime. The full model was not run (Hugging Face is not reachable from the test machine). | 5e0dde4 |
| Medium | Settings showed a password form to any signed-in account. It changed the password without the current one, so anyone at an unlocked, signed-in browser could take over the account. | Removed. Passwords are set only from an invitation or reset link. | c5d9cb8 |
| Medium | Importing a backup stored its photos without the explicit-content check. | Every photo in a backup is checked before the import can be confirmed; a refusal or an unavailable check stops the import with nothing changed. Browser-tested for all three cases. | 9b89a45 |
| Low | No Strict-Transport-Security or Cross-Origin-Opener-Policy header. | Added (one year, this host only, not preloaded; same-origin). | e711e7f |
| Medium | Adding "#type=recovery" to the address of an already signed-in browser opened the "Choose a new password" screen, which changed the password without the current one. Found by the independent review. | Setup opens only when the session came from the link's own access token or Supabase reports a recovery sign-in. Covered by test-callback.cjs. | 18106ec |
| Low | A backup import could be confirmed into a different account if someone switched accounts while its photos were being checked. Found by the independent review. | The import stops if the account changed. Browser-tested. | facac5b |
| Low | Settings said the wardrobe and cloud row could not be opened without the authenticator. Data already in the browser is not encrypted, and the database rule is not applied. Found by the independent review. | Wording now says what the app does. | d8d5818 |
| Low | Stored photo addresses were the one value written into the page unescaped. Not exploitable, since only checked JPEG data is stored. | Escaped. | 8d120b8 |

### Preview deployment checked, 2026-10-26

John pushed `claude/flat-lay` (df58dcc). Cloudflare built a preview at https://claude-flat-lay.the-outfit-path.pages.dev; production stayed on dc42d5b. Checked in Chrome on the preview:

- Headers: the narrowed script policy with 'wasm-unsafe-eval', Strict-Transport-Security max-age=31536000, Cross-Origin-Opener-Policy same-origin, X-Frame-Options DENY, X-Robots-Tag noindex.
- Signed out: the 18+ gate, then the invite-only sign-in screen. The Supabase library loaded with its integrity check under the narrowed policy.
- Signed in (John signed in himself; no password was entered by Claude): Plan suggested a sample look; a diary entry with a made-up photo was saved, opened and deleted; an item scan reached the review screen; Recognize downloaded the pinned model and suggested "Cream sweater" in about 16 seconds, which confirms the WebAssembly fix; the item was not saved. Settings showed no password form and the authenticator as enabled.
- Opening the preview with `#type=recovery` while signed in showed the wardrobe, not the password-setup screen.
- Nothing was uploaded to the cloud copy.

### Checked and found sound

- Text from people (piece names, notes, look and idea names, diary notes, email addresses, dates) is escaped before it is placed in the page, in editorial.js, diary.js, scanner.js and supabase-sync.js.
- Imported backups and downloaded cloud copies are validated before they replace anything; IDs are limited to letters, digits and hyphens.
- Each account's wardrobe, photos, sample ideas and diary are stored under that account's scope. Switching accounts hides the previous account's data at once (tested for the diary, ideas and wardrobe).
- The cloud copy sends only a fixed list of fields. Photos, photo IDs, diary entries and sample ideas are never included.
- Sign-in, recovery and authenticator errors use generic wording. Recovery redirects only to the approved local test address or https://theoutfitpath.com/.
- Removing an authenticator requires a current two-step session and a second confirmation.
- The database policies allow each signed-in account only its own row, with no access for anonymous visitors and no delete. The prepared authenticator policy matches Supabase's documented pattern.
- The self-hosted screening files match their recorded checksums.

An independent review by a separate agent, given the code but not these findings, found no injection, cross-account exposure, policy hole or cloud over-sharing it could demonstrate. Its three concrete findings are fixed above.

### Still open

| Severity | Item | Who |
|---|---|---|
| High | Deploy the current build. Until then the live site lacks screening and today's fixes. | John approves; then deploy and re-check headers live |
| Done 2026-10-26 | The authenticator database policy is applied (`20261026200000_fix_aal2_policy_lookup.sql`). The prepared version blocked every account's cloud copy and was replaced the same day; see `MFA-2FA-HANDOFF.md`. | — |
| High | No way to delete a cloud copy or an account. | John decides: build deletion, or keep real personal data out of the beta |
| High | Privacy notice still lacks postal address, jurisdiction, legal basis, transfer and retention terms. | John, ideally with a lawyer |
| Done 2026-10-26 | Custom email through Resend from jack@mail.theoutfitpath.com; invitations reach outside addresses. See `INVITE-ONLY-BETA.md`. | — |
| Medium (accepted 2026-10-26) | Checked 2026-10-26 in Authentication, Email: minimum password length is 6, "Secure password change" is off, "Require current password when updating" is on, leaked-password protection is off. The app asks for 12 characters, but a password set through the API directly can be as short as 6. John chose to leave the minimum at 6. | Revisit before a wider beta |
| Medium | Styles still allow 'unsafe-inline'. Scripts do not. | Later code work |
| Medium | Recognition downloads its runtime and model from third parties at use time. | Later: self-host, as was done for screening |
| Medium | Cloud copy is last-write-wins with no conflict check. | Later code work |
| Low | The cloud copy has no size limit in the database. Only invited accounts can write. | Optional SQL constraint, John runs |
| Low | The 18+ gate is a self-attestation. | Disclosed; legal advice for anything stronger |
| Low | The old GitHub Pages copy (jmfreder123.github.io/the-outfit-path) ignores `_headers`, so it can be framed by other sites. | Keep it out of invitations; retiring it is a repository change for John to approve |
| Low | connect-src still allows all of huggingface.co, *.hf.co and cdn.jsdelivr.net for the model download. After any future injection, those could be used to send data out. | Later: narrow once the model is self-hosted |
| Low | Data saved in the browser (wardrobe, photos, diary) is not encrypted and stays after sign-out. | Disclosed in the privacy notice and Settings; an optional "remove this account's data from this browser on sign-out" is possible later |
| Low | Diary entries and sample ideas are not in backups, so clearing site data or changing device loses them. | Disclosed in the privacy notice and Reset warning |

### Not tested

- Physical phones, Safari on iPhone, HEIC photos, and camera capture with the current Permissions-Policy.
- The explicit-content thresholds on real outfit photos.
- The authenticator policy, recovery email delivery, and rate limits on the live project.

# October 24 review

## Executive summary

The app is local-first. It stores wardrobe details in account-scoped `localStorage`, photos in account-scoped IndexedDB keys, and optionally sends an authenticated, photo-free JSON copy to Supabase after an explicit upload. Guest data is a separate namespace. The live Supabase project has RLS enabled and forced, with authenticated-only INSERT/SELECT/UPDATE policies scoped to `auth.uid() = user_id`. Anonymous REST access is denied.

Public launch is not recommended yet. The highest-priority gaps are a missing cloud/account deletion workflow, incomplete legal/retention decisions, unapplied MFA backend enforcement, and the bypassability of a browser-only age gate. The current two-account RLS checks passed with synthetic data, public signup is verified off, anonymous sign-ins are off, and email confirmation is on. John M. Fredericks is the confirmed individual operator and `jfredericks4@gmail.com` is the confirmed privacy contact. This code/security work did not enroll factors, collect identity documents, integrate an age-verification vendor, relax policies, or change persistent security settings.

## Verified dataflow inventory

| Source | Data | Destination | Trigger | Notes |
|---|---|---|---|---|
| Closet forms | names, categories, colors, style, season, availability, notes | browser `localStorage`, separated into guest and authenticated-user namespaces | save/edit | The untouched legacy `outfit-path-v1` value is retained as a migration fallback; the live guest copy is stored separately. |
| Ratings and saved looks | choices, item snapshots, ratings/features | account-scoped browser `localStorage`; optional Supabase JSON | local save; explicit cloud upload | Upload is manual and rejected if the visible local namespace does not match the authenticated user ID. |
| Camera/file picker | image pixels | resized JPEG in IndexedDB database `outfit-path-photos`, keyed by guest/authenticated-user namespace; exported JSON files | explicit selection | Existing unprefixed photo keys remain readable only as guest data. Metadata is removed by canvas re-encoding. |
| Cloud backup | items, looks, ratings, preferences | `public.wardrobe_documents.data` in Supabase | authenticated “Upload browser copy” | `photoId` and photo data are removed before upload. |
| Auth form | email and password submission | Supabase Auth over HTTPS | invited-user sign-in/password setup | App does not store the password; Supabase client persists the session in browser storage. |
| Password recovery | invited-account email | Supabase Auth email service | explicit **Email password-reset link** submission | Generic response does not disclose whether an account exists. Only the approved loopback or production origin can be used as the redirect. No recovery email was sent during implementation. |
| Optional authenticator app | private QR enrollment secret and six-digit TOTP code | Supabase Auth and the user's authenticator app | explicit enrollment/challenge | QR secret is held only in the pending modal and is not written to wardrobe storage or logs. The app implements no recovery codes. |
| Operator invitation | approved adult tester's email | Supabase Auth and its email provider | John M. Fredericks selects Dashboard **Send invitation** | Admin action; not available in the frontend. No invitation was sent in this review. |
| Age gate | yes-only 18+ confirmation | this tab's `sessionStorage` | explicit “I am 18 or older” click | Loaded before app/auth/cloud scripts; no birth date or ID; not uploaded or exported. Decline saves no age value and loads no app/auth/cloud scripts. Initial hosting request metadata is unavoidable. |
| Recognition | resized pixels | local Web Worker only | explicit Recognize action | Runtime/model downloads come from jsDelivr/Hugging Face; pixels are not intentionally uploaded. |
| Export/import | full JSON including referenced photos | user's filesystem | explicit Export/Import | Export is not encrypted; import is size/type/structure validated. |
| Hosting/service requests | IP, user agent, timestamps, URLs and similar request metadata | hosting provider, Supabase, jsDelivr, Hugging Face/CDNs | network request | No vendor retention promise was verified. |

No app analytics, ad trackers, hosted AI inference API, automatic cloud sync, Storage bucket, or photo upload was found.

## Security controls verified

- Supabase table has RLS enabled and forced.
- INSERT, SELECT, and UPDATE policies apply only to `authenticated` and require `auth.uid() = user_id`; UPDATE checks both old and new row ownership.
- `anon` has no table access. Live anonymous REST read returned HTTP 401 / PostgreSQL `42501`.
- Frontend uses only a publishable key and rejects known `sb_secret_` and legacy `service_role` key forms.
- Photos/photo identifiers are stripped from cloud JSON.
- Imported JSON and embedded photo data URLs are validated and bounded; item fields have length/type restrictions.
- User-provided values are escaped before insertion into generated HTML; cloud email/error text is not inserted raw.
- Cloud download requires a confirmation before replacing the browser copy.
- Sign-out is scoped to the current browser.
- Login, logout, account changes, invitation callbacks, reload, and expired-session handling switch or hide the visible local namespace before cloud actions are allowed.
- After the 18+ gate, signed-out and expired sessions see a blocking invite-only sign-in screen; valid invite/recovery callbacks require password setup before wardrobe access. Existing verified sessions proceed directly to their isolated namespace.
- The preserved guest wardrobe can be copied only through an account-specific confirmation. It is copied, not moved; the action does not upload or delete anything.
- Supabase browser library is version-pinned and protected with Subresource Integrity.
- A restrictive meta CSP and `no-referrer` policy were added. Google Fonts were removed.
- Model/runtime versions are pinned; model revision is content-addressed by a fixed commit.
- A fail-closed 18+ gate is statically present in HTML. App, scanner, Supabase configuration, auth, and sync scripts load only after an affirmative self-attestation. Escape/cancel does not dismiss the modal.
- Public self-signup UI and all `signUp()` calls were removed. Invited users get sign-in plus an authenticated password-setup control; no admin credential is present in the frontend.
- Password recovery starts only after an explicit user submission, uses a generic anti-enumeration response, and routes a valid recovery session through password update before account/MFA access.
- A verified TOTP factor causes the browser to retain the guest scope and keep the wardrobe hidden until Supabase reports AAL2. Enrollment, verification, recent-AAL2 removal, reload, recovery, and lost-device sign-out paths are implemented locally.

## Findings and actions

| Severity | Finding | Status | Required mitigation |
|---|---|---|---|
| High | No self-service cloud-copy deletion or account deletion. Signing out does not delete either. | Open; accurately disclosed in UI/privacy draft. | Choose and implement an authenticated deletion workflow, then add and test the minimum DELETE policy or an approved server-side process. Define retention and support handling before launch. |
| High | Backend public signup had been enabled. Hiding signup in the browser would not have blocked direct Auth API calls. | Mitigated: John M. Fredericks disabled **Allow new users to sign up**; after reload it remained off. Anonymous sign-ins were off and confirm email was on. Local UI also has no signup. | Keep this configuration under change control and test a direct uninvited signup attempt before beta data is used. |
| High | Cross-user isolation had not been proven with two real accounts. | Mitigated for the current schema on October 24, 2026: ASU and Gmail each wrote/read a distinct labeled synthetic row using ordinary authenticated sessions; Gmail's foreign-row SELECT and UPDATE probes returned zero rows. The local account/photo scopes also remained separate. | Retain the synthetic rows until an approved cleanup procedure exists. Repeat these checks after applying the MFA restrictive policy and before public launch. |
| High | The original preview used one shared `outfit-path-v1` value and unscoped IndexedDB photo IDs, so a second signed-in account on the same browser saw the prior browser wardrobe and could have uploaded it under the wrong user ID. | Fixed and live-tested locally on October 24, 2026. The 43-item legacy wardrobe remains an untouched fallback plus a recoverable guest copy; ASU and Gmail each opened a separate 42-item starter scope. Upload and cloud-download replacement reject a mismatched local/auth user namespace. | Never auto-import guest data. Repeat account switching and RLS negative tests after auth, storage, or policy changes. |
| High | Postal address, jurisdiction, legal basis, age position, transfer mechanism, and retention periods are undecided. | Open launch blocker. Operator and privacy contact are confirmed. | Owner/legal reviewer must complete and approve `docs/privacy.html`; do not publish placeholders. |
| High | The 18+ control is browser-only self-attestation. A visitor can lie, alter JavaScript/session storage, call the public Auth/API endpoints directly, or use an unsupported client. It does not prove age or provide a legal safe harbor. | Locally implemented and accurately disclosed; stronger enforcement open. | Obtain jurisdiction-specific legal advice. If proportionate, evaluate a privacy-preserving age-assurance provider or server-issued eligibility token, including vendor security, accuracy, accessibility, bias, retention, international transfers, incident response, contracts, and a no-raw-ID-storage design. Do not integrate a vendor or collect ID/DOB without separate approval and privacy review. |
| Medium | GitHub Pages cannot guarantee all desired response headers from repository files. Meta CSP cannot provide protections such as `frame-ancestors`, HSTS, COOP, or full Permissions-Policy. | Partially mitigated with meta CSP. | At deployment, configure host-level CSP, HSTS, `X-Content-Type-Options: nosniff`, Referrer-Policy, frame protection, Permissions-Policy, and COOP/COEP only after compatibility testing. |
| Medium | Existing rendering uses inline presentation styles for progress, colors, and layout, so the style policy currently allows `'unsafe-inline'`. Script execution remains restricted; `script-src` does not allow inline scripts. | Disclosed compatibility tradeoff. | Replace inline styles with classes or safe DOM/CSS primitives, then remove `'unsafe-inline'` from `style-src` and regression-test the UI. |
| Medium | Optional recognition still downloads executable/runtime assets and a large model from third parties. Module imports do not support SRI in the current design. | Open/accepted for preview; versions pinned. | Consider vendoring the Transformers runtime, record checksums, maintain an update process, and re-test. Keep recognition opt-in. |
| Medium | The hardened CSP originally allowed the recognition runtime under `script-src` but not under `worker-src`, so the module worker failed before inference began. | Fixed locally and reproduced in the actual browser: the narrowly scoped, versioned jsDelivr worker path now loads and the pinned model completed a diagnostic inference. | Keep the worker allowance restricted to the pinned Transformers.js path; re-test after CSP or dependency changes. Vendoring remains preferable for stronger supply-chain control. |
| Medium | Password recovery and optional TOTP UI are implemented locally, but no live reset was sent, no factor was enrolled, and the restrictive AAL2 RLS policy has not been applied. Redirect/email delivery, rate limits, abuse handling, lost-device identity verification, and live factor recovery remain unverified. | Partially mitigated; launch blocker. | Owner completes the Gmail recovery flow, then reviews and runs the prepared restrictive policy only after the UI is deployed and isolation tests pass. Test AAL1 denial/AAL2 access with synthetic data. Do not claim MFA enforcement before that policy is verified. |
| Medium | Cloud sync is last-write-wins and has no conflict detection. A manual download replaces the browser copy after confirmation. | Open product/data-integrity risk. | Add version/updated-at comparison and a conflict choice; keep export guidance. |
| Low | Raw authentication errors could enable account enumeration or expose provider details. | Mitigated locally with generic user messages. | Log only minimal non-sensitive diagnostics in a future controlled observability system. |
| Low | Full JSON exports can contain sensitive wardrobe photos and are not encrypted. | Disclosed. | Warn users near Export and consider optional encrypted exports in a later design. |

## XSS and dependency review

The app uses substantial `innerHTML` rendering, so XSS remains the primary client-side risk. Current user-controlled item names, notes, colors, look names, imported backups, and displayed account email pass through escaping or strict validation. Cloud data is validated again before replacing local state. No `eval`, `new Function`, or `document.write` was found. These controls reduce risk but should be regression-tested whenever rendering changes.

Runtime dependencies are pinned. The main Supabase UMD bundle now has SRI. The recognition worker imports a pinned Transformers.js module and pinned model revision, but this path still relies on third-party delivery and should be considered a residual supply-chain risk.

## Authentication and session review

Supabase Auth owns credentials. The app submits email/password directly to Supabase, persists the session using the Supabase browser client, and signs out locally. RLS—not client-provided `user_id`—enforces row ownership. Persistent browser sessions raise the impact of XSS; CSP, SRI, strict rendering, and dependency review therefore remain important.

No users currently exist in the project. After John M. Fredericks' setting change, the actual Dashboard showed public signup disabled after reload, confirm-email enabled, anonymous sign-ins disabled, Email as the only enabled provider, and other listed OAuth providers disabled. The Users page offered **Send invitation** and **Create new user**. Local code exposes only invited-user sign-in and authenticated password setup; it contains no `signUp()` call or admin key.

Supabase documents that disabling **Allow new users to sign up** prevents new signups while existing users can sign in, and that Dashboard invitations are an admin action. John M. Fredericks performed the account-setting change; this review verified it read-only after reload. Invitation, confirmation, recovery, MFA, token revocation, and email enumeration resistance remain unverified.

## Tests performed

- Existing automated suite: 96 decision paths, item availability/completeness, preference model behavior, backup validation, rendering, scanner color mapping, photo validation and fallback.
- Cloud static checks: RLS SQL structure, anonymous denial, no DELETE grant, secret-key guard, and photo exclusion.
- Syntax checks for application and Supabase client scripts.
- Privacy/security static checks: draft-required fields, CSP/SRI, generic auth errors, local-only sign-out, no Google Fonts, no secret-key material, and explicit launch blockers.
- Live catalog query: RLS enabled `true`, forced RLS `true`; three policies with expected roles/commands/predicates.
- Live anonymous REST read: rejected with HTTP 401 and PostgreSQL permission error.
- Local browser: configured project loads the signed-out Auth form; no account was created and no email was sent.
- Local browser after CSP hardening: app, progress indicator, Preferences dialog, export warning, and privacy page render; no app-origin console warning/error was observed. Two unrelated Zotero-extension connection errors were excluded from the app result.
- Actual Auth Dashboard inspection: zero users; after John M. Fredericks' change and a fresh reload, public signup off, confirm email on, anonymous sign-ins off; Email enabled; visible Dashboard invitation flow. No invitation was sent.
- Local age-gate browser test: before acceptance, `age-gate.js` was the only script; acceptance loaded the app/auth stack and showed invite-only sign-in with no create-account control; decline retained only `age-gate.js` and showed the unavailable message.
- Local scanner browser test: an actual selected-photo preview reproduced the immediate worker-start failure. A same-origin diagnostic proved the external module was blocked by `worker-src`; after adding only the pinned Transformers.js distribution path, the worker downloaded/cached the pinned model and returned an inference result. The selected-photo UI now reports its state explicitly instead of relying on the browser's ambiguous “No file chosen” wording.
- Local account-boundary regression: synthetic fixtures passed guest migration/preservation, separate account A/B storage, namespaced photo keys, reload, sign-out, account switch, invitation callback, expired-session hiding, explicit guest-copy confirmation, and mismatched-upload rejection. In the actual browser, the ASU session changed from the shared 43-item view (including the photographed watch) to a separate 42-item starter scope; Preferences reported a distinct preserved guest copy with 43 pieces. At that checkpoint no cloud upload/download, deletion, invitation, or account-setting change had been performed.
- Local authentication-entry regression: on a fresh browser origin, the 18+ acceptance led to a blocking “Sign in to your private wardrobe” dialog with no signup control; the existing ASU session continued to its isolated wardrobe. Static/dynamic tests cover signed-out, verified-session, invite/recovery setup, logout, account switch, reload, and expired-session behavior.
- Live ASU cloud test: the table was verified empty, then the authorized synthetic item `SECURITY TEST — ASU ONLY` was saved in the ASU local namespace and manually uploaded without photos. The same account read the row back through the app, and Table Editor showed exactly one record. No real wardrobe data was uploaded.
- Live Gmail isolation test: after password recovery, the active session was verified as `jfredericks4@gmail.com` with a separate 42-piece starter browser scope. A bounded local-only probe wrote/read `SECURITY TEST — GMAIL ONLY`, then attempted authenticated SELECT and UPDATE against every row whose `user_id` differed from Gmail's user ID. Both foreign-row operations returned zero rows. The probe uploaded no photos or real wardrobe data and was removed from the product source immediately afterward. The two labeled synthetic rows remain because deletion was not authorized.
- Password-recovery regression: mocked submission requests exactly one reset email only after explicit form submission, uses the approved loopback redirect, returns generic copy, and routes recovery callbacks to password setup. No live email was sent and no password was changed.
- TOTP MFA regression: mocked AAL1 session with a verified factor retained the guest scope and blocking dialog; a valid challenge/verify response upgraded to AAL2 and only then loaded the matching account scope. Static checks cover enrollment, factor listing, recent-AAL2 removal, secret non-logging, and the prepared restrictive RLS policy. No live factor was enrolled or removed.

## Blocked or not tested

- Authenticated upload/download round trip.
- Disabled-signup enforcement against a direct uninvited `signUp()` request.
- Invitation completion, authenticated password setup, link reuse/forwarding behavior, and approved-origin redirects.
- Two-account isolation and negative cross-user access.
- Live email confirmation/recovery delivery, production redirect, TOTP enrollment/removal, restrictive-policy enforcement, rate-limit, and abuse flows.
- Cloud/account deletion and retention lifecycle.
- Production hosting headers, logging, monitoring, incident response, backup recovery, and dependency-update process.
- Mobile/browser matrix and accessibility/security testing beyond the current local walkthrough.
- Server-side age enforcement and resistance to direct API/client bypass.
- Any stronger age-assurance vendor, ID/document handling, exact-date-of-birth processing, or eligibility-token design.

## 18+ control: what it does and does not enforce

The current gate prevents ordinary in-browser use before an affirmative “I am 18 or older” click. Before that click, the wardrobe code does not read local wardrobe storage, Supabase/auth code does not load, and third-party recognition/runtime requests cannot start. A decline stores no response and leaves only the initial local page resources and ordinary hosting-request metadata.

It is not identity or age verification. It can be bypassed by a technically capable visitor and does not prevent direct calls to public Supabase endpoints. The project currently has no server-side age claim, signed eligibility token, or verified age attribute. Adding any of those would change data collection and security risk and requires a separate design, legal review, user approval, and live isolation tests. No technical control can guarantee that the operator will not face a claim or lawsuit.

### Official legal context reviewed (not legal advice)

- The US FTC states that COPPA applies to child-directed services and general-audience services with actual knowledge that they collect personal information from a child under 13. Its FAQ discusses age screens and says covered operators should not collect personal information before age collection and should stop collection for visitors who identify as under 13 unless the rule's requirements are met: [FTC COPPA FAQ](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions).
- The UK ICO states that the Children's Code applies to information-society services likely to be accessed by children, even if children are not the target audience: [ICO introduction to the Children's Code](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/introduction-to-the-childrens-code/).
- GDPR Article 8 addresses conditions for a child's consent for information-society services when consent is the legal basis. It does not turn an 18+ checkbox into verified age or resolve which legal basis applies here: [official GDPR text on EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A02016R0679-20160504).

These sources show why a product age restriction and a self-attestation gate are only part of the analysis. Applicability depends on audience, actual use, jurisdiction, business model, and data practices. A qualified lawyer should review the launch plan.

## Invite-only beta boundary

The secure minimal design uses Supabase's existing Dashboard instead of building a custom admin backend: John M. Fredericks confirms a prospective tester is an adult, then uses **Authentication → Users → Add user → Send invitation**. Public signup must be disabled at the backend. No allowlist hidden in client JavaScript would be sufficient, and no secret/admin key may enter the browser.

The exact owner steps, invite procedure, and blocked test matrix are in `INVITE-ONLY-BETA.md`. Relevant official references are [Supabase general Auth configuration](https://supabase.com/docs/guides/auth/general-configuration), [Supabase user invitations](https://supabase.com/docs/guides/auth/users#inviting-users), and the [Admin API secret-key warning](https://supabase.com/docs/reference/javascript/admin-api).

## Domain and hosting boundary

The intended domain is `theoutfitpath.com`, registered at GoDaddy. A read-only inspection on 2026-10-24 showed the domain as **Idle**, the apex `A` record as **Parked**, `www` pointing to the apex, and GoDaddy nameservers `ns63.domaincontrol.com` and `ns64.domaincontrol.com`. The custom domain did not complete a normal TLS request, so no production origin is active there.

The existing GitHub Pages URL still returned HTTP 200, but its published HTML lacked the adults-only gate and invite-only Supabase client in this local branch. It is an unsecured legacy build and must not receive beta invitations or personal data. No hosting, DNS, registrar, deployment, repository, or account-setting change was made. The staged Cloudflare Pages plan and exact owner checkpoints are in `CLOUDFLARE-DEPLOYMENT.md`; the final DNS values cannot be known until a Pages project produces its real hostname and, for the apex, Cloudflare assigns zone nameservers.

## Proposed deletion design — approval required

Do not apply automatically. A minimal design would add an authenticated DELETE policy limited to `auth.uid() = user_id`, grant only DELETE on `wardrobe_documents` to `authenticated`, and add a clearly confirmed “Delete cloud copy” control. Account deletion is separate and should use a reviewed server-side process because privileged Auth administration must never run in the browser. Both require owner approval, retention decisions, user-facing copy, and live tests before adoption.
