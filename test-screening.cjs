// On-device screening: decision rule (synthetic score vectors only, no
// images), fail-closed behaviour, pinned self-hosted files, and the item
// scanner checking photos before review.
const fs = require("node:fs"),
  vm = require("node:vm"),
  crypto = require("node:crypto"),
  assert = require("node:assert/strict");

const sandbox = {
  console,
  Number,
  Array,
  Object,
  document: {
    querySelector() {
      return null;
    },
    createElement() {
      const handlers = {};
      return {
        dataset: {},
        addEventListener(t, h) {
          handlers[t] = h;
        },
        fire(t) {
          handlers[t]?.();
        },
      };
    },
    head: {
      append(script) {
        // Simulate the vendor file failing to load.
        queueMicrotask(() => script.fire("error"));
      },
    },
  },
  queueMicrotask,
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync("docs/screening.js", "utf8"), sandbox);
const S = sandbox.outfitPathScreening;
const v = (o) =>
  ["Drawing", "Hentai", "Neutral", "Porn", "Sexy"].map((c) => ({
    className: c,
    probability: o[c] ?? 0,
  }));

// Decision rule.
assert.equal(S.decide(v({ Neutral: 0.96, Drawing: 0.03, Sexy: 0.01 })).ok, true, "ordinary photo allowed");
assert.equal(S.decide(v({ Sexy: 0.9, Neutral: 0.1 })).ok, true, "swimwear-style score alone is allowed");
assert.equal(S.decide(v({ Drawing: 0.9, Neutral: 0.1 })).ok, true);
assert.equal(S.decide(v({ Porn: 0.5, Neutral: 0.5 })).reason, "explicit");
assert.equal(S.decide(v({ Hentai: 0.3, Porn: 0.15, Neutral: 0.55 })).reason, "explicit", "porn and hentai combine");
assert.equal(S.decide(v({ Porn: 0.4, Neutral: 0.6 })).reason, "explicit", "limit is inclusive");
assert.equal(S.decide(v({ Porn: 0.3, Neutral: 0.7 })).reason, "unsure", "unclear results are not saved");
assert.equal(S.decide(v({ Porn: 0.24, Neutral: 0.76 })).ok, true);
// Malformed output fails closed.
assert.equal(S.decide(null).reason, "unavailable");
assert.equal(S.decide([]).reason, "unavailable");
assert.equal(S.decide(v({ Porn: NaN })).reason, "unavailable");
assert.equal(S.decide(v({ Porn: 1.5 })).reason, "unavailable");
assert.equal(S.decide(v({}).slice(0, 4)).reason, "unavailable", "a missing class fails closed");
// Messages.
assert(S.message({ ok: false, reason: "explicit" }).includes("can't be saved"));
assert(S.message({ ok: false, reason: "unsure" }).includes("wasn't saved"));
assert(S.message({ ok: false, reason: "unavailable" }).includes("can't be saved"));
assert.equal(S.message({ ok: true }), "");

(async () => {
  // Model files failing to load: fail closed.
  assert.equal((await S.screen({})).reason, "unavailable");
  // No image decoding available: fail closed.
  assert.equal((await S.screenFile({})).reason, "unavailable");

  // Self-hosted files are present and unmodified.
  const readme = fs.readFileSync("docs/vendor/nsfwjs/README.txt", "utf8");
  for (const file of S.FILES) {
    const rel = file.replace("vendor/nsfwjs/", "");
    const hash = crypto.createHash("sha256").update(fs.readFileSync("docs/" + file)).digest("hex");
    assert(readme.includes(`${hash}  ${rel}`), `checksum recorded for ${rel}`);
  }
  assert(fs.existsSync("docs/vendor/nsfwjs/LICENSE-nsfwjs.txt"));
  assert(fs.existsSync("docs/vendor/nsfwjs/LICENSE-tensorflowjs-apache-2.0.txt"));

  // Security policy: no eval, scripts only from self and the pinned CDN files.
  for (const policy of [fs.readFileSync("docs/index.html", "utf8"), fs.readFileSync("docs/_headers", "utf8")]) {
    assert(!policy.includes("'unsafe-eval'"));
    assert(/script-src 'self' 'wasm-unsafe-eval' https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\//.test(policy));
  }

  // Loaded after the age gate, before the item scanner.
  const gate = fs.readFileSync("docs/age-gate.js", "utf8");
  assert(gate.indexOf("'screening.js'") > 0 && gate.indexOf("'screening.js'") < gate.indexOf("'scanner.js'"));

  // Item scanner: screening runs before the photo is prepared for review,
  // and a refusal returns before anything is shown or saved.
  const scanner = fs.readFileSync("docs/scanner.js", "utf8");
  const body = scanner.slice(scanner.indexOf("async function receivePhoto"));
  const at = (t) => body.indexOf(t);
  assert(at("screenFile(file)") > 0 && at("screenFile(file)") < at("preparePhoto(file)"));
  assert(at("if(!screened.ok)") < at("openModal("));
  assert(body.includes("{ok:false,reason:'unavailable'}"), "no screening module means no photo");
  console.log(
    "PASS: decision rule on synthetic vectors (allow ordinary and swimwear-style scores, reject explicit, refuse unclear), fail closed on bad output, missing model or decoding, pinned unmodified files and licences, CSP unchanged, scanner screens before review.",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
