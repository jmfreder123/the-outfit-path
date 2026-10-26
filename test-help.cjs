// Instructions: the first-visit introduction (only once the wardrobe is
// visible, once per browser, skippable, reopenable), the How it works page,
// where it is linked, and the Saved looks tip.
const fs = require("node:fs"),
  vm = require("node:vm"),
  assert = require("node:assert/strict");

const store = new Map();
const elements = new Map(), listeners = new Map();
let bodyClasses = new Set(["account-pending"]);
let intro = null;
const el = (k) => {
  if (k === "#intro-dialog") return intro;
  return elements.get(k) ||
    elements.set(k, {
      innerHTML: "",
      textContent: "",
      open: false,
      classList: { add() {}, toggle() {}, remove() {} },
      focus() {},
      addEventListener() {},
      showModal() {
        this.open = true;
      },
      close() {
        this.open = false;
      },
    }).get(k);
};
const sandbox = {
  console,
  crypto: require("node:crypto").webcrypto,
  queueMicrotask,
  Date,
  setTimeout,
  clearTimeout,
  setInterval: () => 0, // checks are triggered by hand below
  clearInterval() {},
  localStorage: {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  },
  window: { addEventListener() {} },
  document: {
    body: {
      classList: {
        add: (c) => bodyClasses.add(c),
        remove: (...c) => c.forEach((x) => bodyClasses.delete(x)),
        contains: (c) => bodyClasses.has(c),
      },
      append(node) {
        intro = node;
      },
    },
    createElement() {
      const handlers = {};
      return {
        innerHTML: "",
        open: false,
        setAttribute() {},
        addEventListener(t, h) {
          handlers[t] = h;
        },
        querySelector() {
          return null;
        },
        showModal() {
          this.open = true;
        },
        close() {
          if (!this.open) return;
          this.open = false;
          handlers.close?.();
        },
      };
    },
    querySelector: el,
    querySelectorAll() {
      return [];
    },
    addEventListener(t, h, o) {
      const rows = listeners.get(t) || [];
      rows.push({ h, c: o === true });
      listeners.set(t, rows);
    },
  },
};
vm.createContext(sandbox);
for (const f of ["app.js", "editorial.js", "closet.js"]) vm.runInContext(fs.readFileSync(`docs/${f}`, "utf8"), sandbox);
vm.runInContext(fs.readFileSync("docs/help.js", "utf8"), sandbox);
const run = (s) => vm.runInContext(s, sandbox);
const tick = () => new Promise((r) => setTimeout(r, 0));
function click(dataset) {
  let stop = false;
  const target = {
    dataset,
    disabled: false,
    closest(s) {
      return s === "button" ? this : null;
    },
  };
  const e = {
    target,
    preventDefault() {},
    stopImmediatePropagation() {
      stop = true;
    },
  };
  const rows = listeners.get("click") || [];
  for (const r of [...rows.filter((r) => r.c), ...rows.filter((r) => !r.c)]) {
    if (stop) break;
    r.h(e);
  }
}

(async () => {
  // Not while signing in.
  run("render()");
  await tick();
  assert.equal(intro, null, "no introduction behind the sign-in screen");

  // Shown once the wardrobe is visible.
  bodyClasses = new Set();
  run("render()");
  await tick();
  assert(intro?.open, "introduction opens");
  assert(intro.innerHTML.includes("1 of 5") && intro.innerHTML.includes("Welcome to The Outfit Path"));
  assert(intro.innerHTML.includes('data-intro="skip"'));
  assert.equal(store.get("outfit-path-intro-v1"), "done", "remembered as shown");
  click({ intro: "next" });
  assert(intro.innerHTML.includes("2 of 5") && intro.innerHTML.includes('data-intro="back"'));
  click({ intro: "back" });
  assert(intro.innerHTML.includes("1 of 5"));
  for (let i = 0; i < 4; i++) click({ intro: "next" });
  assert(intro.innerHTML.includes("5 of 5") && intro.innerHTML.includes('data-intro="done"'));
  assert(intro.innerHTML.includes("under How it works"));
  click({ intro: "done" });
  assert.equal(intro.open, false);

  // Not again.
  run("render()");
  await tick();
  assert.equal(intro.open, false, "shown only once per browser");

  // How it works page, reachable from the header and Settings.
  click({ view: "help" });
  const page = el("#main").innerHTML;
  assert(page.includes("<h1>How it works</h1>"));
  for (const h of ["Getting started", "Closet", "Plan", "Saved looks", "Diary", "Your data", "Your account"]) {
    assert(page.includes(`<h2>${h}</h2>`), h);
  }
  assert(page.includes('data-intro="open"'));
  click({ intro: "open" });
  assert(intro.open && intro.innerHTML.includes("1 of 5"), "reopened from How it works");
  click({ intro: "skip" });
  assert.equal(intro.open, false);
  const index = fs.readFileSync("docs/index.html", "utf8");
  assert(/<button class="header-help" data-view="help"[^>]*>/.test(index));
  assert(fs.readFileSync("docs/app.js", "utf8").includes('<button class="btn" data-view="help">How it works</button>'));
  click({ view: "closet" });
  assert(!el("#main").innerHTML.includes("<h1>How it works</h1>"));
  click({ view: "learn" });
  assert(el("#main").innerHTML.includes("Style learning"), "other pages unaffected");

  // Saved looks explains how to save when there are none.
  click({ view: "looks" });
  assert(el("#main").innerHTML.includes("To save a look, build one in Plan and choose Save look."));
  run("data.looks=[{id:'l1',name:'x',items:[],answers:{},created:'2026-10-01T00:00:00Z'}]; render()");
  assert(!el("#main").innerHTML.includes("To save a look, build one in Plan"));

  // Loaded after diary.js, before the scanner.
  const gate = fs.readFileSync("docs/age-gate.js", "utf8");
  assert(gate.indexOf("'diary.js'") < gate.indexOf("'help.js'") && gate.indexOf("'help.js'") < gate.indexOf("'scanner.js'"));
  console.log("PASS: introduction only when the wardrobe is visible, once per browser, with back, skip and start; How it works page with every section; header and Settings links; reopen; Saved looks tip.");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
