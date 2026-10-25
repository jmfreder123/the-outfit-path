# Genderless Redesign QA

## Current pass — discoverable samples and neutral mannequin, 2026-10-25

Supersedes the body-free canvas and source-dropdown description in the previous pass. My wardrobe and Sample wardrobe are now visible source buttons with exact available counts. Empty owned scopes initially show the separate 16-item sample catalog; choosing My wardrobe explicitly still shows its empty state. Existing owned pieces remain the default for nonempty accounts. Source changes preserve each session draft and never add a sample to stored personal items.

Added an original neutral SVG mannequin as a visual planning guide. The existing add/pin, confirmed replacement, Suggest, Unpin and Remove actions place faithful cutouts at category anchors on the same figure. No new drag controls, body inference, photo processing, 3D model or fit prediction. Accessories remain alongside the figure, and product-photo viewing angles remain unchanged. The UI explicitly labels the arrangement illustrative. Add an item now has a dark background and cream text on the wardrobe pane. Sample selections use preview wording rather than claiming a savable personal draft.

Browser evidence: isolated synthetic fixture `http://127.0.0.1:4174/fixture.html?empty`, in-app browser; the user's signed-in and recovery tabs were not refreshed or edited. Actual clicks and keyboard Enter verified all 16 sample cards, empty My wardrobe count 0, sample source restoration, pinned dress + Suggest completion, confirmed dress-to-shirt replacement, jeans placement, layer removal and Unpin retention. The fixture's 42 untouched legacy starter records remained unchanged and no test look was saved. Captured and directly inspected inline full-page desktop and narrow screenshots for a dress and for hoodie/jeans/sneakers. The latter shows the entire approved sneaker image after fixing grid intrinsic sizing that initially clipped it. Picture and image rectangles now match the 166.39 × 86.39 footwear container; object-fit is contain. All displayed images loaded. At 390px and 320px, document width equals viewport width; no horizontal overflow. Browser error/warning log was empty. Physical touch hardware was not tested.

All eight automated suites and Deno static checks pass. New checks assert automatic sample discovery, 16 cards/count, mannequin asset presence, explicit source buttons, and personal-source default when actual owned pieces exist. All previous pin/date/save/account/privacy checks remain. No approved garment image files were edited; only the original mannequin SVG was added. Screenshot evidence is inline browser capture; a persistent screenshot-file export remains unavailable through this controller. Formal pixel-artifact comparison is not claimed.

Remaining limits: only 16 approved photographic catalog items, original product-photo angles rather than retargeted/fitted garments, no physical-device test, and existing backend MFA/live account-isolation release checks remain separate. This local update does not deploy itself.

## Current pass — tap-first builder, 2026-10-25

This section supersedes the older mode/drag/six-step observations below. Those sections remain as historical evidence, not the current interaction contract.

References: Library `libfile_83fe9c7e2b6081919e6a5db22e608a31` and `libfile_f356243944fc8191910b895cd6503620` were read in full. Mobile pack `libfile_0223cc664ce8819197644b1486bf5dd1` materialized with Library metadata into `../simple-builder-references/`; its README was read and actual empty, pinned, saved and confirmation PNGs were inspected. No Figma call was made.

Implemented: one composition canvas; button cards add and pin idempotently; distinct Pin/Unpin/Remove; explicit confirmation before replacing pinned conflicts; Suggest fills compatible missing roles while retaining pins; Occasion and collapsed Refine/Style affect the next explicit Suggest. Manual/AI/hybrid mode panels, six-step workflow and drag/drop targets/handlers are removed from the builder. Suggestions are synchronous local rules, so no asynchronous suggestion can overwrite a later action. Save dialogs bind to the exact draft, date, source and account and reject stale submissions.

Drafts are held in session memory by date and explicit wardrobe source, and reset on account/copy/replace transitions. Date navigation does not write data. Save supports partial looks, rollback on storage failure, update of only the explicitly edited saved ID, and a fresh new look on the same date. Saved looks open read-only with Edit; undated legacy records remain undated. Opening a save over a dirty session draft requires a discard/keep choice. Unsaved session drafts warn before refresh/close.

My wardrobe and fictional sample previews use separate pools. Untouched legacy starter records remain intact in My Closet, but do not imply ownership in the builder. Customized starter records and deliberately added samples remain usable. Sample previews are not saved into owned Lookbook records. All 16 approved photographic assets remain available in the sample pool (four exact starter matches and twelve separate demos). A changed item never borrows a mismatching sample photo; actual user photos take priority. Missing/broken images use a named Image unavailable placeholder rather than flat garment substitutes. No image or wardrobe migration occurred.

Browser evidence: in-app browser, isolated loopback fixture at `127.0.0.1:4174/fixture.html`, synthetic data only; never the user's account or real wardrobe. Desktop/default 1280px and responsive 390px/320px layouts inspected directly with screenshots and DOM geometry. Actual button click/keyboard Enter selected the emerald dress; Suggest retained its pin and added blazer/boots/bag; skirt selection showed the named replacement confirmation; Cancel left the dress; next-day/back restored the exact composition with zero saved looks; explicit naming/Save produced a read-only look with Edit and disabled selection. Refine retained Androgynous and did not rebuild the outfit until Suggest. Mobile screenshot inspection caught inherited heights; fixed canvas now contains all images and action bar follows its bottom. DOM image checks confirmed all four displayed cutouts loaded. No horizontal overflow at 390px or 320px. This is browser click/keyboard testing at mobile dimensions, not a physical touch-device test.

Automated: all eight `test*.cjs` suites pass under Deno, with existing age/auth/invitation/MFA/account/photo/cloud/privacy checks retained. Updated redesign scenarios cover selection idempotence, pins, unpin retention, removal, base conflicts/cancel, pinned completion, styles reaching ranking, preference changes leaving current items intact, source separation/no writes, customized starter ownership, date round trips, partial save failure/retry, duplicate submit, exact update, multiple looks/day, dirty-draft conflict, stale form/date rejection, legacy undated retention, date boundaries, photo priority, mismatched-photo fallback, and session reset. Deno static checks and `git diff --check` pass.

Not run: physical-device touch; live account switching/login/MFA/RLS against Supabase; formal exported-file pixel comparison. Screenshot API captures were directly inspected, but no supported local screenshot export path was exposed. The local app preview remains `http://127.0.0.1:4173/`; authentication/18+ gates are unchanged. Production backend MFA enforcement remains the pre-existing outstanding user action. No push/deployment/account/security/DNS changes.

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
