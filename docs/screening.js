"use strict";

// On-device photo screening for explicit content. Uses nsfwjs 4.4.0 and its
// bundled MobileNetV2 model, self-hosted under vendor/nsfwjs, so neither the
// photo nor any request leaves the browser. This is a safeguard, not a
// guarantee. If screening cannot run, the photo is not saved (fails closed).
(() => {
  const FILES = [
    "vendor/nsfwjs/nsfwjs.min.js",
    "vendor/nsfwjs/mobilenet_v2/model.min.js",
    "vendor/nsfwjs/mobilenet_v2/group1-shard1of1.min.js",
  ];
  const CLASSES = ["Drawing", "Hentai", "Neutral", "Porn", "Sexy"];
  // explicit = Porn + Hentai. At or above "reject" the photo is refused; between
  // "unsure" and "reject" it cannot be confirmed and is not saved either.
  // "Sexy" alone (for example swimwear or gym clothes) is allowed.
  const LIMITS = Object.freeze({ reject: 0.4, unsure: 0.25 });
  let modelPromise = null;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[data-screening="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.dataset.screening = src;
      script.addEventListener("load", resolve, { once: true });
      script.addEventListener("error", () => reject(Error("Screening files could not load.")), { once: true });
      document.head.append(script);
    });
  }

  function loadModel() {
    if (!modelPromise) {
      modelPromise = (async () => {
        for (const src of FILES) await loadScript(src);
        if (typeof globalThis.nsfwjs?.load !== "function") {
          throw Error("Screening is unavailable.");
        }
        return globalThis.nsfwjs.load();
      })().catch((error) => {
        modelPromise = null;
        throw error;
      });
    }
    return modelPromise;
  }

  function decide(predictions) {
    if (!Array.isArray(predictions)) return { ok: false, reason: "unavailable" };
    const p = {};
    for (const x of predictions) p[x?.className] = Number(x?.probability);
    const valid = CLASSES.every((name) =>
      Number.isFinite(p[name]) && p[name] >= 0 && p[name] <= 1
    );
    if (!valid) return { ok: false, reason: "unavailable" };
    const explicit = p.Porn + p.Hentai;
    if (explicit >= LIMITS.reject) return { ok: false, reason: "explicit", explicit };
    if (explicit >= LIMITS.unsure) return { ok: false, reason: "unsure", explicit };
    return { ok: true, explicit };
  }

  // source: an ImageBitmap, image, or canvas already decoded in memory.
  async function screen(source) {
    try {
      const model = await loadModel();
      return decide(await model.classify(source));
    } catch {
      return { ok: false, reason: "unavailable" };
    }
  }

  // Decodes a chosen file in memory (respecting its orientation), screens it,
  // and releases the decoded image. Nothing is stored.
  async function screenFile(file) {
    let bitmap = null;
    try {
      bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return await screen(bitmap);
    } catch {
      return { ok: false, reason: "unavailable" };
    } finally {
      bitmap?.close?.();
    }
  }

  function message(result) {
    if (result?.ok) return "";
    if (result?.reason === "explicit") {
      return "This photo can't be saved. Photos with explicit content aren't allowed.";
    }
    if (result?.reason === "unsure") {
      return "This photo couldn't be checked clearly, so it wasn't saved. Try a different photo.";
    }
    return "Photo checking isn't available right now, so photos can't be saved. Reload and try again.";
  }

  globalThis.outfitPathScreening = Object.freeze({
    screen,
    screenFile,
    decide,
    message,
    LIMITS,
    FILES,
  });
})();
