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

There is no cloud account, paid AI API, server, analytics, or automatic sync. Closet data, ratings, and saved looks live in browser localStorage. Photo thumbnails live separately in IndexedDB. Google Fonts supplies optional typography; system font fallbacks are included. The hosting provider receives ordinary web requests.

**Moving domains or devices:** export from Preferences & data on the old site, open the new site, and import the backup. Browser storage does not automatically follow a site to GitHub Pages. Do not commit personal backup files to the repository.

## Scan clothes with a phone

Open **My closet → Scan a piece → Take a photo** or **Choose a photo**. Photograph one item against a plain contrasting background. Tap **Recognize this piece**, review the suggested category and sampled color, and edit the name, style, and season before saving. Camera capture uses the phone's native file picker; desktop browsers generally show a file chooser. JPEG/PNG/WebP and other browser-decodable formats work; unsupported HEIC files need conversion or a fresh camera photo.

Recognition runs in a dedicated browser worker using [Transformers.js 3.8.1](https://huggingface.co/docs/transformers.js/v3.8.1/en/index) and [Xenova/clip-vit-base-patch32](https://huggingface.co/Xenova/clip-vit-base-patch32) with quantized q8 weights pinned to model revision `4c1807b705b1d015fb032789cc4d221b23025a6f`. The first scan downloads approximately 160–200 MB of runtime/model files from jsDelivr and Hugging Face. Browser caching normally avoids repeat downloads, but storage eviction or clearing site data can require another download. Photo pixels stay on the visitor's device; the app makes no inference API request.

The model suggests clothing categories from a fixed list. Color is sampled from the central photo region; it is not garment segmentation. Style and season start as editable defaults. Results can be wrong, especially for multiple items, unusual garments, and cluttered backgrounds. A manual path remains available if the device cannot run the model. No accuracy guarantee is claimed.

Photos are resized to JPEG thumbnails before saving, which strips source-file metadata. Photos remain visible in the closet and outfits. Export/import includes referenced photos once per backup. Photos are retained for saved-look snapshots; a full wardrobe reset clears the photo store. Use a current browser and the hosted HTTPS website for scanning; a downloaded `file://` copy cannot reliably start a module worker.

## GitHub Pages hosting

This repository contains `docs/index.html`, `docs/style.css`, `docs/app.js`, and `docs/.nojekyll`. Upload its contents to your repository. In repository **Settings → Pages**, choose **Deploy from a branch**, select your branch (usually `main`), choose **/docs**, and save. No package installation or build command is needed. Keep `scanner.js` and `scanner-worker.js` beside the other website files.

[GitHub's official publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

The tool is suitable for public static hosting. Every visitor gets a separate wardrobe in their own browser. Source: https://github.com/jmfreder123/the-outfit-path

Website: https://jmfreder123.github.io/the-outfit-path/

## Development

The website is served from `docs/`.

Run `python3 -m http.server 4173 --directory docs`, then visit `http://localhost:4173`.

Run `node test.cjs` for automated checks. No third-party test dependencies are needed.

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
