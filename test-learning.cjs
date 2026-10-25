// Style learning: rating saved looks, valid stored ratings, bounded influence
// on suggestions, the on/off setting, plain explanations and clearing.
const fs = require("node:fs"),
  vm = require("node:vm"),
  assert = require("node:assert/strict");

let writes = 0, fail = false;
const elements = new Map(), listeners = new Map();
const el = (k) =>
  elements.get(k) ||
  elements.set(k, {
    innerHTML: "",
    textContent: "",
    open: false,
    classList: { add() {}, toggle() {}, remove() {} },
    focus() {},
    showModal() {
      this.open = true;
    },
    close() {
      this.open = false;
    },
  }).get(k);
const sandbox = {
  console,
  crypto: require("node:crypto").webcrypto,
  queueMicrotask,
  Date,
  setTimeout,
  clearTimeout,
  localStorage: {
    getItem() {
      return null;
    },
    setItem() {
      if (fail) throw Error("full");
      writes++;
    },
  },
  window: { addEventListener() {} },
  document: {
    body: { classList: { add() {} } },
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
vm.runInContext(fs.readFileSync("docs/app.js", "utf8"), sandbox);
let src = fs.readFileSync("docs/editorial.js", "utf8");
// Test-only observation interface; no testing hooks ship in the application.
src = src.replace(
  /\}\)\(\);\s*$/,
  `window.qa={state:()=>clone({draft,notice}),nudge:learningNudge,reset:resetSession,open:openSaved,defaults};})();`,
);
vm.runInContext(src, sandbox);
const run = (s) => vm.runInContext(s, sandbox);
const state = () => JSON.parse(JSON.stringify(sandbox.window.qa.state()));
function click(dataset) {
  let stop = false;
  const target = {
    dataset,
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
  const rows = listeners.get("click");
  for (const r of [...rows.filter((r) => r.c), ...rows.filter((r) => !r.c)]) {
    if (stop) break;
    r.h(e);
  }
}

// Own pieces and saved looks (synthetic).
run(`data.items=[
  {...seed()[15],id:'shirt',ownedCopy:true},
  {...seed()[6],id:'trousers',ownedCopy:true},
  {...seed()[20],id:'boots',ownedCopy:true},
  {...seed()[5],id:'denim',ownedCopy:true},
  {...seed()[13],id:'tee',ownedCopy:true},
  {...seed()[27],id:'trainers',ownedCopy:true}];
  data.looks=[
    {id:'work',name:'Work',plannedDate:'2026-10-20',items:[data.items[0],data.items[1],data.items[2]],answers:{...window.qa.defaults(),occasionTheme:'business'},created:'2026-10-01T09:00:00Z'},
    {id:'casual',name:'Casual',plannedDate:'2026-10-21',items:[data.items[3],data.items[4],data.items[5]],answers:{...window.qa.defaults(),occasionTheme:'everyday'},created:'2026-10-02T09:00:00Z'}];`);

// Cards and the read-only view offer rating; sample ideas do not.
assert(run("renderLooks()").includes('data-rate-look="work"'));
sandbox.window.qa.open("work");
assert(run("renderBuilder()").includes('aria-label="Rate this saved look"'));
assert(!run("renderLooks()").match(/data-open-idea[^]*data-rate-look/), "ideas are not rated");

// Rating stores one record per look, valid for backup and cloud copy.
const w0 = writes;
click({ rateLook: "work", rateValue: "1" });
assert.equal(writes, w0 + 1);
assert.deepEqual(JSON.parse(run("JSON.stringify(data.ratings.map(r=>[r.id,r.y]))")), [["work", 1]]);
assert.equal(run("data.looks.find(l=>l.id==='work').rating"), 1);
run("validateBackup(JSON.parse(JSON.stringify(data)))");
const keys = JSON.parse(run("JSON.stringify(Object.keys(data.ratings[0].features))"));
assert(keys.every((k) => /^(bias|item:|type:|color:|style:|context:)/.test(k)));
assert(keys.includes("style:pair:classic+classic") || keys.some((k) => k.startsWith("style:pair:")));
assert(keys.includes("context:business:classic"));
assert(!keys.some((k) => k.startsWith("weather:")), "weather is not used by this builder");
assert(run("Object.values(data.ratings[0].features).every(v=>Math.abs(v)<=2)"));

// Same button again clears; the other button replaces.
click({ rateLook: "work", rateValue: "1" });
assert.equal(run("data.ratings.length"), 0);
assert.equal(run("data.looks.find(l=>l.id==='work').rating"), null);
click({ rateLook: "work", rateValue: "1" });
click({ rateLook: "work", rateValue: "0" });
assert.deepEqual(JSON.parse(run("JSON.stringify(data.ratings.map(r=>[r.id,r.y]))")), [["work", 0]]);

// Storage failure changes nothing.
fail = true;
click({ rateLook: "casual", rateValue: "1" });
fail = false;
assert.equal(run("data.ratings.length"), 1);
assert.equal(run("data.looks.find(l=>l.id==='casual').rating"), undefined);
click({ rateLook: "missing", rateValue: "1" });
assert.equal(run("data.ratings.length"), 1, "unknown looks are not rated");

// Influence is bounded and grows with more ratings.
run("data.ratings=[];train()");
const formal = "[data.items[0],data.items[1],data.items[2]]";
const relaxed = "[data.items[3],data.items[4],data.items[5]]";
assert.equal(run(`window.qa.nudge(${formal})`), 0, "no ratings, no nudge");
click({ rateLook: "work", rateValue: "1" });
const one = run(`window.qa.nudge(${formal})`);
for (let k = 0; k < 8; k++) {
  run(`data.looks.push({id:'w${k}',name:'W',items:${formal},answers:{...window.qa.defaults(),occasionTheme:'business'},created:'2026-10-03T09:00:00Z'})`);
  click({ rateLook: `w${k}`, rateValue: "1" });
  run(`data.looks.push({id:'c${k}',name:'C',items:${relaxed},answers:{...window.qa.defaults(),occasionTheme:'everyday'},created:'2026-10-03T09:00:00Z'})`);
  click({ rateLook: `c${k}`, rateValue: "0" });
}
const many = run(`window.qa.nudge(${formal})`), away = run(`window.qa.nudge(${relaxed})`);
assert(one > 0 && many > one, "more ratings, more weight");
assert(many <= 1.5 && away >= -1.5, "nudge capped at 1.5 points");
assert(away < 0, "looks rated Not for me are nudged down");

// The Suggest notice says when ratings are used; the setting turns them off.
click({ wardrobeSource: "owned" });
click({ newDraft: "" });
click({ suggest: "" });
assert(state().notice.includes("using your ratings"));
run("data.learning=false");
assert.equal(run(`window.qa.nudge(${formal})`), 0, "learning off, no nudge");
click({ newDraft: "" });
click({ suggest: "" });
assert(!state().notice.includes("using your ratings"));
run("data.learning=true");

// Style learning page: counts and plain, escaped wording.
run("data.items[0].name='<b>Shirt</b>'");
run("train()");
let page = run("renderLearn()");
assert(page.includes("Learning from 17 rated looks"));
assert(page.includes("Leaning toward") && page.includes("Leaning away from"));
assert(page.includes("Classic") || page.includes("classic"));
assert(!page.includes("<b>Shirt</b>") , "item names are escaped");
assert(page.includes('id="learning" checked') && page.includes('data-action="resetlearning"'));

// Clear all ratings uses the app's existing confirmed reset.
click({ action: "confirmresetlearning" });
assert.equal(run("data.ratings.length"), 0);
page = run("renderLearn()");
assert(page.includes("No ratings yet"));
console.log(
  "PASS: rate saved looks only; one valid, backup-safe rating per look; clear/replace; storage failure rollback; bounded, growing nudge; notice and off setting; plain escaped explanations; clear all ratings.",
);
