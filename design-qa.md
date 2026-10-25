# Genderless Redesign QA

## Reference and implementation

- Approved reference: `../library-redesign/extracted/approved-genderless-desktop-reference.png`
- Mobile reference: `../library-redesign/extracted/mobile-reference.png`
- Local implementation: `http://127.0.0.1:4173/`
- Branch: `codex/genderless-redesign`

The browser QA session can render and display implementation captures, but the connected browser API exposes screenshot bytes for inline display only and provides no supported filesystem export path. Its screenshot guidance confirms JPEG output but does not add a save-to-file method. A formal source-vs-implementation artifact comparison is therefore blocked on materializing a browser-rendered screenshot file. The observations below come from direct desktop and mobile browser inspection and are not a substitute for the missing evidence artifact.

## Implemented screen inventory

- 18+ gate followed by invite-only authentication.
- Password recovery, invitation setup, and optional TOTP flows remain in the existing protected shell.
- Outfit Builder: responsive editorial shell, wardrobe browser, Occasion selector, optional Style selector, six-step choice flow, result, swap, rating, save, print, and restart controls.
- My Closet: existing search, filters, item editing, manual item entry, and the current item-photo scanner.
- Lookbook: existing private saved/generated looks only. The requested full-outfit photo diary is designed in `PHOTO-FLOWS-BACKLOG.md` but is not implemented.
- My Style: existing local learning explanation and controls.
- Settings and Privacy: existing local export/import and optional manual cloud backup controls.

## Desktop inspection — 1488 × 1058

- PASS: charcoal/cream split, dark editorial header, serif hierarchy, wardrobe grid, garment composition, selectors, and six-step card match the selected direction.
- PASS: supplied fictional garment imagery is restricted to starter display mappings. User items and photos are untouched.
- PASS: real user-added pieces are ordered before demo samples in the compact wardrobe pane.
- PASS: the default demo preview is a curated cross-category set rather than the first nine seed rows; it now covers a colorful slip dress, patterned skirt, rust blazer, cobalt hoodie, indigo jeans, sport leggings, chunky sneakers, black ankle boots, and a black crossbody bag.
- PASS: Accessories is directly filterable alongside Tops, Bottoms, Dresses, Layers, and Shoes.
- PASS: fictional demos remain outside `data.items` until the person chooses **Add sample to closet** and confirms the modal. Cancelling the inspected modal left the closet count at 42.
- PASS: Occasion and optional Style are visibly separate.
- PASS: Feminine, Masculine, Androgynous, and No preference remain open to everyone and never filter the wardrobe.
- PASS: left wardrobe heading no longer wraps prematurely at the reference viewport after reducing it to a 40–46 px range.
- PASS: decision content continues below the viewport naturally without overlap.

## Mobile inspection — 390 × 844

- PASS: stage precedes the wardrobe, selectors stack, outfit art remains legible, and the primary navigation becomes a persistent bottom bar.
- PASS: the six choices retain readable labels and touch-sized controls.
- PASS: wardrobe cards become a two-column grid.
- PASS: filter chips remain horizontally scrollable rather than shrinking to illegibility.
- PASS: accessibility structure contains a named main navigation, named selector controls, one level-one page heading per section, the six-step decision group, and named wardrobe cards.

## Interaction checks

- PASS: builder starts at Step 1 of 6 with Continue disabled until a choice is made.
- PASS: a starting-shape choice advances to Step 2.
- PASS: changing optional Style updates the builder direction without hiding wardrobe pieces.
- PASS: Start over returns to the initial builder state.
- PASS: Lookbook remains reachable and retains its existing private saved-look behavior.
- PASS: switching among No preference, Feminine, Masculine, and Androgynous leaves the same wardrobe-piece IDs visible. Style adds an optional learning context feature; it does not create a gender taxonomy or a garment eligibility filter.
- PASS: the right-side outfit composer now uses the same `garmentArt` path as wardrobe cards and selected-piece rows. Generated catalog assets and account-scoped user photos therefore render consistently instead of falling back to flat vector art.
- PASS: changing Occasion recomputes the unsaved preview. A live local click-through produced six visibly different sets: Business (black blazer, white shirt, black trousers, loafers, crossbody, watch); Business Casual (rust blazer, cream knit, indigo jeans, loafers, crossbody); Everyday (cobalt hoodie, indigo jeans, loafers, crossbody); Evening (rust blazer, emerald dress, loafers, crossbody, watch); Sporty (cobalt hoodie, sport leggings, chunky sneakers, crossbody); and Streetwear (rust blazer, cobalt hoodie, indigo jeans, chunky sneakers, crossbody).
- PASS: changing optional Style recomputes the suggestion when suitable choices exist. Under Business Casual, the live local preview changed from cream knit + indigo jeans (No preference), to emerald slip dress (Feminine), cream knit + black trousers (Masculine), and cobalt hoodie + sport leggings (Androgynous). These are suggestion weights only; the visible wardrobe catalog remains unchanged.
- PASS: the preview explicitly labels fictional catalog output as a demo. Once at least one real user-added item exists, the preview uses only real available pieces from that account and reports missing categories instead of filling gaps with unowned samples.
- PASS: selector changes after generating a result create a new unsaved suggestion. They do not rewrite an existing saved Lookbook record.
- PASS: the live Sporty source truthfully reports when Feminine, Masculine, or Androgynous has no suitable alternative and leaves the composition unchanged instead of manufacturing variety. The same live session confirmed meaningful Style changes under Business Casual, where relevant candidates exist.
- PASS: **Choose myself** shows only explicitly selected available closet pieces. **Suggest a look** uses local wardrobe rules and the existing optional on-device rating model. **Mix & match** preserves locked user choices and fills only open slots. The UI does not describe these rule-based suggestions as generative AI.
- PASS: native desktop drag/drop source and target events are covered by a DOM regression that validates garment categories. **Use in look** supplies the same action for touch and keyboard users; the connected browser passed live keyboard selection and removal, and hybrid pieces can be locked or unlocked.
- BLOCKED for a live automated pointer-drag proof: the connected browser controller's coordinate drag did not emit an HTML5 `drop` event. It also left the composition unchanged, so no false pass is recorded. A human pointer-drag remains the one manual interaction check; the fully tested Use button is the supported fallback.
- PASS: an explicitly added fictional demo becomes one labeled closet copy. Unadded demos cannot be dragged or manually selected, and no mode silently imports the catalog.
- PASS: the wardrobe panel shown in the user-supplied reference is ordinary builder UI, not an age/auth/MFA gate. It now has an obvious close button, closes with Escape, returns focus to **Open wardrobe**, and preserves the unsaved composition.
- PASS: planner and Lookbook now include previous/next day, Today, and a calendar picker. Dates are built from the browser's local calendar fields rather than UTC string slicing. Date navigation does not save or overwrite a look; new saves carry their selected planning date, multiple looks may share a date, and old undated looks remain explicitly undated.

## Reference fidelity and remaining gaps

- The app now includes nine inspected transparent assets matching the approved varied reference: emerald slip dress, floral midi skirt, rust blazer, cobalt hoodie, indigo jeans, black sport leggings, off-white chunky sneakers, black ankle boots, and black crossbody bag.
- The earlier neutral pack was audited for label fidelity. Only charcoal trousers, white button-down, black blazer, and the new black ankle boots map directly to matching starter records. The plain merino knit, brown loafers, black leather tote, and leather-strap watch are separate fictional demo records rather than false mappings to cable-knit, black-loafer, canvas-tote, or jewelry records.
- The first nine cards now closely represent the approved broad visual direction. Additional demo cards remain available through category filters, and all real user-added items continue to sort ahead of demos.
- The 42 original starter records remain unchanged and still use simpler vector art where no exact approved raster exists. Catalog depth is therefore improved but not yet at the longer-term multi-example target for every garment family, color, pattern, and accessory.
- Demo cards are labeled, require explicit confirmation before copying one record into the current browser closet, and never overwrite user items or import the full catalog. Images remain bundled application assets, not user photos.

## Static image delivery

- All 16 generated catalog PNG originals remain intact as transparent fallbacks.
- Deterministic local `cwebp` lossless encoding with exact transparent RGB preservation produced paired WebP files. The WebP set is 13,390,662 bytes versus 22,842,488 bytes for PNG, saving 9,451,826 bytes (41.4%) when supported.
- Decoding each WebP and PNG to RGBA produced identical SHA-256 pixel hashes for all 16 pairs; there is no semantic edit, recolor, crop, resize, or alpha change.
- `<picture>` prefers local WebP while retaining local PNG fallback. Lazy loading, asynchronous decoding, `object-fit: contain`, and existing tile padding remain in place. CSP is unchanged because both formats load from the same origin.

## Cloud boundary note

The redesigned client now constructs an explicit allowlisted cloud projection. Regression coverage asserts that common photo/image/base64 fields are absent from that client payload. This is a client-side privacy boundary, not server-side JSON schema validation. Database-side enforcement of the accepted document shape remains separate work and must be reviewed and applied by the user before it can be claimed.

## Console

No app-origin exception was observed. Two identical asynchronous-listener errors were emitted by the browser extension layer, with no application stack or functional impact in the local page.

## Root-cause correction

- The initial redesign mapped rich assets only in catalog cards; the right-side board retained the older flat-art path and omitted layers and jewelry. The board now renders every supported slot through the shared image/photo renderer.
- Occasion and Style previously updated copy and metadata without replacing the preview's selected item IDs. The preview now uses deterministic, occasion-aware ranking, and generated results request a fresh unsaved suggestion on selector change.
- Business and Business Casual had shared the same legacy `work` value. A separate presentation-level occasion theme now supplies distinct ranking biases while preserving the existing six-step answer and learning model.
- The user's inert-Style report was reproduced specifically under Sporty. Its eligible source contained only one suitable top, bottom, and shoe combination, so every preference correctly converged on the same item IDs. The prior UI gave no feedback and looked broken. It now distinguishes “ranking changed” from “no different suitable pieces,” while preserving strict occasion suitability and never introducing unowned items.

## Automated checks

- `test.cjs`
- `test-age-gate.cjs`
- `test-invite-only.cjs`
- `test-account-isolation.cjs`
- `test-cloud.cjs`
- `test-mfa.cjs`
- `test-privacy-security.cjs`
- `test-redesign.cjs`

All passed under Deno before the final visual pass. They must be rerun after any additional implementation changes.

## Final result

**BLOCKED for formal pixel-artifact comparison only:** implementation behavior and inspected desktop/mobile layouts pass, but a local browser screenshot file is not yet available to attach beside the reference. This does not authorize a push or deployment.
