# Private Photo Flows — Staged Implementation Plan

Status: design and security backlog only. The current app does **not** yet provide verified content screening, garment cutout editing, or a full-outfit photo diary.

Update (stage 6a): item scans are now screened on the device before review with NSFWJS 4.4.0 (MIT) and its MobileNetV2 model, self-hosted in `docs/vendor/nsfwjs` with recorded checksums. Rule: Porn + Hentai at or above 0.40 is rejected, 0.25 to 0.40 is treated as unclear and not saved, and screening that cannot run fails closed. The thresholds are a starting point, not validated on real outfit photos; NSFWJS reports about 90% accuracy for this model, which is the vendor's figure. `test-screening.cjs` uses synthetic score vectors only.

Update (stage 6b): diary storage exists but has no screen yet. `docs/diary-store.js` keeps entries in a separate IndexedDB database (`outfit-path-diary`), keyed by the normalized account scope, with a fixed record shape (date, note up to 500 characters, up to 20 linked piece IDs, a JPEG photo, size, timestamps). A chosen photo is type- and size-checked, decoded upright, screened, then redrawn and saved as a new JPEG of at most 2048 px; nothing is stored until the caller saves. Checked in Chromium with a synthetic photo carrying EXIF orientation 6, camera make/model and GPS: the saved JPEG was upright and had no EXIF (APP1) segment, camera or GPS data; it keeps the browser's colour profile (APP2). Reset everything clears the current account's diary only. Diary data is not referenced by cloud sync, export or the item scanner. Not yet checked on Safari/iOS or with HEIC files.

## Two distinct photo flows

| Flow | User intent | Saved image | Recognition behavior |
| --- | --- | --- | --- |
| Item scan | Add one wardrobe piece | Accepted item image, optionally with a user-approved cutout | Suggest garment details only; never infer identity, gender, body shape, or measurements |
| Outfit diary | Remember a complete outfit being worn | Accepted full clothed photo kept intact | No person or body analysis. Linking wardrobe pieces is optional and user-controlled |

The two flows must have separate copy and controls. Item-scan instructions must never tell someone to crop a person out of an outfit diary photo, and outfit-diary photos must not be sent through garment-category recognition as though the person were a closet item.

## Lookbook design

Extend the existing private Lookbook with two views:

1. **Saved combinations** — the existing generated and favorited looks.
2. **Outfit diary** — chronological full-outfit photos with:
   - date worn (defaults to today, editable),
   - optional private note,
   - optional links to wardrobe pieces,
   - month/list browsing and an empty-state action, “Log today’s outfit.”

There is no public profile, discovery, following, commenting, sharing, or social feed. Do not imply that diary entries are visible to anyone else.

## Required local image pipeline

1. Accept a camera or library file only after the person chooses it. Never accept the camera permission prompt for them.
2. Decode the selected file into memory and validate its type, byte size, pixel dimensions, and orientation. Nothing is persisted yet.
3. Run a local safety screen **before** IndexedDB persistence, cutout processing, or recognition.
4. If screening is unavailable, errors, or is inconclusive, fail closed and offer retake/cancel. Do not claim a model guarantees safety.
5. For ordinary clothed outfit photos, proceed to review without garment cutout or body analysis. Explicit content is rejected.
6. Re-encode an accepted image locally to normalize orientation and remove EXIF/GPS/device metadata. “Original” means the accepted full composition, not the raw metadata-bearing file.
7. Persist only after the person confirms Save.

Rejected, cancelled, or failed images must be released from memory and never enter a backup, cloud payload, cache owned by the app, or IndexedDB.

## Item scan review

After a photo passes screening, an item scan can proceed to target selection and optional local segmentation:

- user selects the intended garment/accessory,
- cutout preview appears beside the full accepted image,
- manual restore, erase, retake, and keep-original controls remain available,
- no recoloring, fabricated hidden details, or generated replacement fabric,
- saving always requires explicit confirmation.

SlimSAM is a research candidate for local segmentation, not a committed dependency. NSFWJS is only a research candidate for one signal and is not proven anatomical or explicit-content detection. BRIA’s noncommercial terms do not fit a production commercial app; NudeNet’s AGPL obligations require a separate license review. No model should be integrated until accuracy, browser performance, privacy, license, and failure behavior are tested with lawful non-explicit fixtures.

## Storage and account isolation

- Add a dedicated IndexedDB store for diary images and metadata rather than mixing full-outfit photos with item-photo records.
- Prefix every record with the existing normalized account scope (`guest` or the authenticated Supabase user ID).
- An account switch, sign-out, expired session, invitation callback, or reload must hide the previous scope immediately.
- Guest entries remain a separate recoverable local copy. Importing them into an account must be an explicit confirmed copy, never an automatic move.
- Outfit photos, item photos, diary notes, and local photo identifiers must never enter Supabase cloud JSON. The current allowlisted cloud projection is the required boundary and needs regression coverage for the new fields.
- Exporting a full local backup may include diary images only after a clear warning that the file is private and unencrypted.

## Acceptance tests before release

- clothed full-outfit fixture is allowed into review and saved intact;
- explicit-content fixtures are represented only by approved synthetic/model test vectors and are rejected before persistence;
- unavailable/inconclusive safety model fails closed;
- rejected and cancelled files leave no IndexedDB record;
- EXIF, GPS, and device metadata are absent from the saved accepted image;
- item scan and outfit diary route to different review experiences;
- date, notes, and optional piece links survive reload in the same account only;
- account A, account B, and guest records never appear in one another’s views;
- no diary image or metadata reaches the cloud backup request body;
- export/import remains explicit and scope-safe;
- keyboard, screen-reader, camera-denied, storage-full, and reduced-motion paths work.

## Release gate

Do not describe item cutout, content screening, or the outfit diary as available until the implementation and the tests above exist. Production rollout also remains blocked on the already identified live backend MFA-policy verification and two-account authorization tests.
