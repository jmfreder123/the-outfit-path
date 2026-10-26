# The Outfit Path

A playful, browser-local wardrobe tool: six outfit decisions, a customizable 42-piece starter closet, saved looks, and preference learning.

## What it does

- Choose skirt, pants, dress, or surprise; then footwear, occasion, weather, mood/colors, and finishing details.
- Generate complete outfits from available pieces. Dresses omit a separate top; separates require one.
- Swap individual pieces, rate outfits, save named looks, and print an outfit.
- Add/edit/delete closet pieces; customize names, categories, shades, style, season, and notes. Mark laundry/unavailable pieces out of rotation.
- Export and import JSON backups, pause personalization, or reset preferences.

## Learning and privacy

A regularized logistic regression model runs in JavaScript in the visitor's browser. Outfit ratings update item, color, style, occasion/style, and weather/category features. The latest 200 ratings train the model; learned scores influence candidate ranking alongside style heuristics. Required silhouette, footwear, and availability constraints take precedence. Cold starts use heuristics and variety. Ratings are preference signals, not evidence of predictive accuracy.

There is no paid AI API, app analytics, or automatic sync. The preview is adults-only and its cloud beta is invite-only; there is no public self-signup UI. After the 18+ self-attestation, signed-out visitors see a blocking sign-in screen rather than a wardrobe. Valid invite/recovery callbacks require password setup before access; password recovery gives a generic response that does not disclose whether an account exists. Authenticator-app TOTP is optional: accounts that enroll it remain locked until the session reaches AAL2. Closet data, ratings, saved looks, and IndexedDB photo thumbnails are separated into guest and authenticated-user namespaces on each browser. A legacy wardrobe is preserved as hidden guest data rather than silently assigned to a signed-in account. Optional manual Supabase backup can store clothing details, saved looks, and ratings after an invited adult signs in, but never photos; upload is blocked if the visible local namespace does not match the authenticated user ID. System fonts are used. The hosting provider and explicitly listed service providers receive ordinary web requests; see `docs/privacy.html`, `INVITE-ONLY-BETA.md`, `MFA-2FA-HANDOFF.md`, and `SECURITY-PRIVACY-REVIEW.md`.

**Moving domains or devices:** export from Preferences & data on the old site, open the new site, and import the backup. Browser storage does not automatically follow a site to a new origin. Do not commit personal backup files to the repository.

## Scan clothes with a phone

Open **My closet → Scan a piece → Take a photo** or **Choose a photo**. Photograph one item against a plain contrasting background. Tap **Recognize this piece**, review the suggested category and sampled color, and edit the name, style, and season before saving. Camera capture uses the phone's native file picker; desktop browsers generally show a file chooser. JPEG/PNG/WebP and other browser-decodable formats work; unsupported HEIC files need conversion or a fresh camera photo.

Recognition runs in a dedicated browser worker using [Transformers.js 3.8.1](https://huggingface.co/docs/transformers.js/v3.8.1/en/index) and [Xenova/clip-vit-base-patch32](https://huggingface.co/Xenova/clip-vit-base-patch32) with quantized q8 weights pinned to model revision `4c1807b705b1d015fb032789cc4d221b23025a6f`. The first scan downloads approximately 160–200 MB of runtime/model files from jsDelivr and Hugging Face. Browser caching normally avoids repeat downloads, but storage eviction or clearing site data can require another download. Photo pixels stay on the visitor's device; the app makes no inference API request.

The model suggests clothing categories from a fixed list. Color is sampled from the central photo region; it is not garment segmentation. Style and season start as editable defaults. Results can be wrong, especially for multiple items, unusual garments, and cluttered backgrounds. A manual path remains available if the device cannot run the model. No accuracy guarantee is claimed.

Photos are resized to JPEG thumbnails before saving, which strips source-file metadata. Photos remain visible in the closet and outfits. Export/import includes referenced photos once per backup. Photos are retained for saved-look snapshots; a full wardrobe reset clears the photo store. Use a current browser and the hosted HTTPS website for scanning; a downloaded `file://` copy cannot reliably start a module worker.

## Hosting transition

The current GitHub Pages URL still serves an older public build. A direct check on 2026-10-24 returned HTTP 200, and its HTML loaded `app.js` and `scanner.js` directly without the adults-only gate or the invite-only/Supabase client. Treat that URL as an unsecured legacy build; do not use it for beta invitations or personal data.

The intended replacement is a free Cloudflare Pages static deployment at `theoutfitpath.com`. The complete staged setup and safety gates are in `CLOUDFLARE-DEPLOYMENT.md`. No Cloudflare Pages project, GitHub grant, DNS record, nameserver change, push, or deployment has been made from this branch.

Source: https://github.com/jmfreder123/the-outfit-path

## Optional Supabase cloud backup

The app can keep one private, manual cloud copy of clothing details, saved looks, and ratings per signed-in user. Browser storage remains the working copy. Photos remain only on the device and are excluded from cloud upload.

Setup deliberately requires an account owner to complete the external steps:

1. In the Supabase SQL Editor, review and run `supabase/migrations/20261024180000_create_wardrobe_documents.sql`.
2. In Project Settings → API Keys, copy the project URL and a **publishable** key (or legacy `anon` key) into `docs/supabase-config.js`.
3. Never use a `service_role`/secret key or database password in frontend code. The client refuses known secret-key formats.
4. Ensure Email authentication is enabled and add only the exact verified beta/production origin to the project's allowed redirect URLs.
5. Test with two separate users before relying on it: each user must only be able to read and update their own row.
6. After deploying the MFA UI and completing isolation tests, review and run `supabase/migrations/20261024202000_require_aal2_for_enrolled_users.sql`. This restrictive policy makes AAL2 mandatory only for users who opted into a verified MFA factor.

The migration enables and forces row-level security, denies anonymous table access, grants authenticated users only select/insert/update, and scopes every policy to `auth.uid() = user_id`. It does not create a Storage bucket or upload photos.

## Development

The website is served from `docs/`.

Run `python3 -m http.server 4173 --directory docs`, then visit `http://localhost:4173`.

Run the `test*.cjs` files with Node.js or Deno for automated checks. `test-mfa.cjs` covers the mocked AAL1 lock/AAL2 unlock and the prepared restrictive-policy handoff. `test-callback.cjs` covers invitation and reset links: the password-setup screen opens only for a session created from the link itself or a Supabase recovery sign-in. `test-screening.cjs` covers on-device photo screening: the decision rule on synthetic scores, failing closed, pinned vendor files and the unchanged CSP. `test-diary.cjs` covers private diary storage: account-scoped records, clearing one account only, and the photo steps (type, size and dimension checks, screening before anything is drawn or stored, re-encoding to a JPEG without camera details), using an in-memory stand-in for IndexedDB. `test-diary-page.cjs` covers the Diary page: entries by month for the current account only, the log and edit form (photo required, only own pieces linked, past dates only, storage failure keeps the form), confirmed deletion, and entries hidden on account switch and Reset everything. `test-learning.cjs` covers style learning: rating saved looks, backup-safe ratings, the capped effect on suggestions, the off setting and clearing. `test-suggest.cjs` covers Suggest: pins kept, optional pieces by occasion, close alternatives or a plain notice, and own pieces never filtered. `test-ideas.cjs` covers sample ideas: their own per-account storage, sample-only contents, failure handling, confirmed deletion and Reset everything. No third-party test dependencies are needed.

## Verification

- 96 combinations of silhouette, footwear, and weather.
- Outfit completeness, dress/separates distinction, required layers, unavailable pieces, and missing-category handling.
- Positive and negative feedback change model outputs in the expected direction; pausing personalization neutralizes model ranking.
- Backup structure and unsafe identifier/color rejection.
- All main screens render.
- Browser walkthrough: complete skirt/boots path; like and save a look; reload persistence; add and search a custom piece.

Responsive layouts are implemented. The browser walkthrough was performed in the desktop app's browser pane, not across a device/browser matrix.

## Practical boundaries

Weather is entered manually. Clothing illustrations are schematic. Weather suitability, waterproofing, fit, and dress codes are not verified. Suggested combinations can be adjusted freely.
