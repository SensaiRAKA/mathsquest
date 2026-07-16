"use strict";
/* =====================================================================
   Diksha's Study Hub — shared cross-device progress sync.

   Optional and additive: if window.DIKSHA_FIREBASE_CONFIG (see
   firebase-config.js) is empty, or the Firebase SDK failed to load
   (offline, blocked, not configured yet), every function here is a
   harmless no-op and each quest behaves exactly as it did before —
   localStorage only, single device.

   How it works: each device generates a short, memorable "sync code"
   (like TIGER-4271) stored in localStorage. Entering the same code on
   another device links it to the same cloud document. There is no
   login — the code itself is the shared secret, like a room code.
   Each quest's state is stored as an opaque JSON blob keyed by that
   quest's own STORAGE_KEY, so this file never needs to know the shape
   of any quest's data.
   ===================================================================== */
var DikshaSync = (function () {
  var CODE_KEY = "dikshaSyncCode_v1";
  var WORDS = ["Tiger","Panda","Eagle","Lotus","Comet","Falcon","Maple","Robin",
    "Otter","Cobra","Cedar","Ember","Frost","Gecko","Hawk","Ibis","Koala","Lynx","Nova","Opal"];
  var db = null;
  var ready = false;
  /* Pushes are held back until arm() is called — normally right after the
     first pull()'s merge decision on page load. Without this gate, the
     unconditional saveState() that every quest's boot sequence fires
     (e.g. dailyReset()'s "new day" check) would push a fresh device's
     blank state to Firestore in a race BEFORE the pull has a chance to
     bring down existing progress, clobbering it. */
  var armed = false;

  function randomCode() {
    var w = WORDS[Math.floor(Math.random() * WORDS.length)];
    var n = Math.floor(1000 + Math.random() * 9000);
    return w.toUpperCase() + "-" + n;
  }
  function getCode() {
    var c = null;
    try { c = localStorage.getItem(CODE_KEY); } catch (e) {}
    if (!c) {
      c = randomCode();
      try { localStorage.setItem(CODE_KEY, c); } catch (e) {}
    }
    return c;
  }
  function setCode(c) {
    c = String(c || "").trim().toUpperCase();
    if (!c) return false;
    try { localStorage.setItem(CODE_KEY, c); } catch (e) {}
    return true;
  }

  function init() {
    if (ready) return true;
    var cfg = window.DIKSHA_FIREBASE_CONFIG;
    if (!cfg || !cfg.apiKey || typeof firebase === "undefined") return false;
    try {
      if (!firebase.apps.length) firebase.initializeApp(cfg);
      db = firebase.firestore();
      try { db.enablePersistence({ synchronizeTabs: true }).catch(function () {}); } catch (e) {}
      ready = true;
    } catch (e) { ready = false; }
    return ready;
  }

  /* Returns a Promise resolving to the remote state object for `appKey`, or null. */
  function pull(appKey) {
    if (!ready) return Promise.resolve(null);
    return db.collection("progress").doc(getCode()).get().then(function (doc) {
      if (!doc.exists) return null;
      var data = doc.data();
      return (data && data[appKey]) ? data[appKey] : null;
    }).catch(function () { return null; });
  }

  /* Fire-and-forget push of `stateObj` under `appKey`. Safe to call often —
     Firestore queues writes offline and syncs when back online. */
  function push(appKey, stateObj) {
    if (!ready || !armed) return;
    var payload = {};
    payload[appKey] = stateObj;
    db.collection("progress").doc(getCode()).set(payload, { merge: true }).catch(function () {});
  }

  /* Call once the initial pull() has resolved and the merge decision (keep
     local vs. adopt remote) has been made. Until then, push() is a no-op. */
  function arm() { armed = true; }

  return {
    init: init,
    getCode: getCode,
    setCode: setCode,
    randomCode: randomCode,
    pull: pull,
    push: push,
    arm: arm,
    isReady: function () { return ready; }
  };
})();

/* ---------- shared footer UI: wires up #syncRow / #syncCodeLabel / #syncChangeBtn
   if present on the page. Call DikshaSync.attachUI() once DOM is ready. ---------- */
DikshaSync.attachUI = function (onCodeChanged) {
  var row = document.getElementById("syncRow");
  var label = document.getElementById("syncCodeLabel");
  var changeBtn = document.getElementById("syncChangeBtn");
  if (!row || !label || !changeBtn) return;
  if (!DikshaSync.isReady()) return;

  row.style.display = "flex";
  label.textContent = "Sync code: " + DikshaSync.getCode();
  label.onclick = function () {
    var code = DikshaSync.getCode();
    var copied = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code);
        copied = true;
      }
    } catch (e) {}
    if (copied) {
      var was = label.textContent;
      label.textContent = "Copied! " + code;
      setTimeout(function () { label.textContent = was; }, 1500);
    } else {
      window.prompt("Your sync code (copy it):", code);
    }
  };
  changeBtn.onclick = function () {
    var input = window.prompt("Enter the sync code from her other device (e.g. TIGER-4271):");
    if (!input) return;
    if (DikshaSync.setCode(input)) {
      window.alert("Linked! Reloading to bring in progress from that code...");
      window.location.reload();
    }
  };
};
