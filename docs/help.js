"use strict";

// Instructions: a short introduction the first time the app opens in a
// browser (skippable, and reopenable from How it works), and the How it
// works page itself.
(() => {
  const SEEN_KEY = "outfit-path-intro-v1";
  const STEPS = [
    {
      title: "Welcome to The Outfit Path",
      body: "Plan what to wear from the clothes you own, one day at a time. Your wardrobe is private to your account.",
    },
    {
      title: "Add your clothes",
      body: "In Closet, scan a photo of a piece or add it by hand. Photos are checked on this device and stay on it.",
    },
    {
      title: "Plan a day",
      body: "In Plan, pick a day and an occasion. Tap pieces to add them, or choose Suggest a look. Tap a piece on the board to pin, swap or remove it. Pinned pieces stay when you ask for more suggestions.",
    },
    {
      title: "Save and rate",
      body: "Save a look to its day. In Saved looks, rate looks with Love it or Not for me, and suggestions lean toward what you love.",
    },
    {
      title: "Keep a diary",
      body: "In Diary, log what you actually wore with a photo and a note. Not ready to add your own clothes? In Plan, choose Samples to try the app first.",
    },
  ];
  let step = 0;

  const seen = () => {
    try {
      return localStorage.getItem(SEEN_KEY) === "done";
    } catch {
      return true; // Without storage, don't show it on every visit.
    }
  };
  const markSeen = () => {
    try {
      localStorage.setItem(SEEN_KEY, "done");
    } catch { /* The introduction can still be reopened from How it works. */ }
  };

  function dialog() {
    let d = document.querySelector("#intro-dialog");
    if (d || typeof document.createElement !== "function") return d;
    d = document.createElement("dialog");
    d.id = "intro-dialog";
    d.className = "intro-dialog";
    d.setAttribute("aria-labelledby", "intro-title");
    d.addEventListener("close", markSeen);
    document.body.append(d);
    return d;
  }

  function drawStep() {
    const d = dialog();
    if (!d) return;
    const s = STEPS[step];
    const last = step === STEPS.length - 1;
    d.innerHTML = `<p class="intro-count">${step + 1} of ${STEPS.length}</p><h2 id="intro-title">${s.title}</h2><p class="intro-body">${s.body}</p><div class="intro-dots" aria-hidden="true">${
      STEPS.map((_, i) => `<span class="${i === step ? "on" : ""}"></span>`).join("")
    }</div><div class="intro-actions">${
      step ? '<button class="diary-secondary" data-intro="back">Back</button>' : '<button class="diary-secondary" data-intro="skip">Skip</button>'
    }<button class="diary-primary" data-intro="${last ? "done" : "next"}">${last ? "Start" : "Next"}</button></div>${
      last ? '<p class="intro-more">You can see this again, and more detail, under How it works.</p>' : ""
    }`;
    if (!d.open) d.showModal();
    d.querySelector('[data-intro="next"], [data-intro="done"]')?.focus?.();
  }

  function openIntro() {
    step = 0;
    drawStep();
    markSeen();
  }

  // Show once per browser, only once the wardrobe is actually visible (not
  // behind the age gate, sign-in or authenticator screens).
  function maybeIntro() {
    if (seen() || document.querySelector("#intro-dialog")?.open) return;
    const body = document.body?.classList;
    if (!body || body.contains("account-pending") || body.contains("age-pending")) return;
    if (document.querySelector("#auth-entry-gate")?.open || document.querySelector("#age-gate")?.open) return;
    if (document.querySelector("#modal")?.open) return;
    openIntro();
  }

  const SECTIONS = [
    ["Getting started", [
      "Add the clothes you own in Closet. Until you do, Plan can show the Samples: 16 made-up pieces you can try the app with. Samples never mix with your own clothes.",
      "The app works in this browser. If you sign in on another device, your closet there starts separately unless you use the cloud copy (see Your data).",
    ]],
    ["Closet", [
      "Scan a piece: take or choose a photo. It is checked for explicit content on this device first; photos that don't pass, or can't be checked, aren't saved. Then choose Recognize this piece to have the app suggest the type and color (the first time, it downloads its recognition files, which can take a few minutes), or enter the details yourself.",
      "Add by hand: enter a name, type, color, style and season.",
      "Mark not available keeps a piece in your closet but leaves it out of new suggestions, for example while it's at the cleaner.",
    ]],
    ["Plan", [
      "Choose a day in the week strip, or Today. Choose an occasion. Refine lets you set an optional style.",
      "Open wardrobe shows your pieces (My wardrobe) or the Samples. Tap a piece to add it to the board; pieces you add are pinned.",
      "Suggest a look fills the board. If you already added pieces, Suggest the rest keeps them and completes the outfit.",
      "Tap a piece on the board to Pin or Unpin it, Swap it for another piece of the same kind, or Remove it.",
      "Save look saves it to that day. Looks made from Samples save as sample ideas instead, kept apart from your own looks. An unsaved draft only lasts until you close the app.",
    ]],
    ["Saved looks", [
      "Your looks are listed by day: the day you picked, then upcoming and earlier days. Opening a look is read only until you choose Edit.",
      "Rate a look with Love it or Not for me. Ratings gently steer future suggestions; the occasion and pinned pieces always matter more. Style learning, under Refine in Plan, shows what the app has learned and lets you turn it off or clear it.",
    ]],
    ["Diary", [
      "Log an outfit with a photo, the date you wore it, an optional note and the pieces you wore. Photos are checked like closet photos and saved without location or camera details.",
      "Diary entries stay in this browser only. They aren't in backups or the cloud copy.",
    ]],
    ["Your data", [
      "Your closet, looks and ratings are saved in this browser, separately for each account.",
      "Settings, Export wardrobe backup saves a file with your pieces, looks, ratings and closet photos. Import backup restores one. The file isn't encrypted, so keep it private.",
      "Settings, Upload this account copy keeps a cloud copy of your pieces, looks and ratings (no photos), which you can download on another device. Deleting the cloud copy isn't available yet.",
      "Reset everything clears this account's closet, looks, ratings, sample ideas and diary in this browser.",
    ]],
    ["Your account", [
      "The app is invite-only and for adults 18 and over.",
      "Forgot password on the sign-in screen sends a reset link. In Settings you can add an authenticator app for a second step at sign-in.",
    ]],
  ];

  function helpPage() {
    return `<div class="saved-page help-page"><div class="saved-head"><h1>How it works</h1><p>A short guide to each part of the app.</p></div><button class="diary-secondary help-intro" data-intro="open">Show the introduction again</button>${
      SECTIONS.map(([title, lines]) =>
        `<section class="help-section"><h2>${title}</h2>${lines.map((l) => `<p>${l}</p>`).join("")}</section>`
      ).join("")
    }<p class="help-more">More on what is stored and where: <a href="privacy.html">Privacy notice</a>.</p></div>`;
  }

  const previous = renderLearn;
  renderLearn = () => (view === "help" ? helpPage() : previous());

  const baseRender = render;
  render = function renderWithIntro(...args) {
    const out = baseRender.apply(this, args);
    queueMicrotask(maybeIntro);
    return out;
  };

  document.addEventListener("click", (event) => {
    const b = event.target.closest?.("button");
    const action = b?.dataset?.intro;
    if (!action) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const d = document.querySelector("#intro-dialog");
    if (action === "open") openIntro();
    else if (action === "next" && step < STEPS.length - 1) {
      step++;
      drawStep();
    } else if (action === "back" && step > 0) {
      step--;
      drawStep();
    } else if (action === "skip" || action === "done") d?.close();
  }, true);

  // Sign-in finishes after this file loads, so check again until the
  // introduction has been shown once.
  if (!seen() && typeof setInterval === "function") {
    const timer = setInterval(() => {
      if (seen()) clearInterval(timer);
      else maybeIntro();
    }, 1000);
  }
  queueMicrotask(maybeIntro);

  globalThis.outfitPathHelp = Object.freeze({ openIntro, STEPS, SECTIONS });
})();
