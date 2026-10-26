// Messages show inside the Settings window while it is open (an open dialog
// sits above the page, so a message outside it would be hidden behind it),
// and move back to the page when the window closes.
const fs = require("node:fs"),
  vm = require("node:vm"),
  assert = require("node:assert/strict");

const listeners = new Map();
function node(id) {
  return {
    id,
    parentNode: null,
    textContent: "",
    innerHTML: "",
    open: false,
    children: [],
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    append(child) {
      if (child.parentNode) child.parentNode.children = child.parentNode.children.filter((c) => c !== child);
      child.parentNode = this;
      this.children.push(child);
    },
    addEventListener() {},
    focus() {},
    showModal() {
      this.open = true;
    },
    close() {
      this.open = false;
      for (const h of listeners.get("close") || []) h({ target: this });
    },
  };
}
const body = node("body");
const elements = new Map();
const el = (k) => elements.get(k) || elements.set(k, node(k.replace("#", ""))).get(k);
body.append(el("#toast"));
body.append(el("#modal"));
const sandbox = {
  console,
  crypto: require("node:crypto").webcrypto,
  queueMicrotask,
  Date,
  setTimeout,
  clearTimeout,
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  window: { addEventListener() {} },
  document: {
    body,
    querySelector: el,
    querySelectorAll: () => [],
    addEventListener(t, h) {
      listeners.set(t, [...(listeners.get(t) || []), h]);
    },
  },
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync("docs/app.js", "utf8"), sandbox);
const toastEl = el("#toast"), modal = el("#modal");

sandbox.toast("No window open.");
assert.equal(toastEl.parentNode, body, "with no window open, the message stays on the page");
assert.equal(toastEl.textContent, "No window open.");

modal.showModal();
sandbox.toast("Shown above Settings.");
assert.equal(toastEl.parentNode, modal, "with Settings open, the message is placed inside it");
assert.equal(toastEl.textContent, "Shown above Settings.");

modal.close();
assert.equal(toastEl.parentNode, body, "closing Settings moves the message back to the page");
assert.equal(toastEl.textContent, "Shown above Settings.", "and it is still readable");

modal.showModal();
modal.close();
sandbox.toast("Cloud copy downloaded to this browser.");
assert.equal(toastEl.parentNode, body, "a message after the window closes shows on the page");

console.log("PASS: messages show inside the Settings window while it is open and move back to the page when it closes.");
