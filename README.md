# Study Quest

A small collection of gamified, self-contained practice quests for Class 4 —
stars, day streaks, a mistakes bank, and daily goals. Each quest is a single
static HTML file with no build step or dependencies.

- **`index.html`** — landing page linking to all quests, split into "My
  Subjects" (regular syllabus) and "Special Classes" (extra coaching)
- **`mathsquest.html`** — Maths Quest: addition, subtraction, multiplication,
  division, place value, Roman numerals, and word problems
- **`sanskritquest.html`** — Sanskrit Quest: gender (लिंग), number (वचन),
  days of the week, domestic animals, and verbs, based on the Class 4,
  Unit-1 (2026-27) school worksheet
- **`special-classes-maths.html`** — Maths Special Class (July): a short
  concept lesson followed by practice for each topic — big numbers &
  place value (Indian/International systems), factors & multiples
  (divisibility rules), HCF & LCM (prime factorization, word problems),
  fractions (proper/improper/mixed, simplifying, add/subtract/multiply/
  divide, fraction BODMAS), Roman numerals, and simplification (BODMAS)
  — based on the school's special-class worksheet packets. Lessons
  include tap-through worked examples and visual fraction bars, and a
  Quick Games section adds three arcade-style modes: Match Pairs,
  True-or-False rounds, and a timed Quick 10 challenge. Games earn
  💎 diamonds (a separate currency); ⭐ stars and the daily goal come
  only from real practice questions.

Open `index.html` in a browser to get started, or open any quest file
directly. Progress for each quest is saved separately in the browser's
local storage.

## Cross-device sync (optional)

By default all progress lives only in the browser it was earned in. To let
Diksha use the same progress on more than one device, this repo has an
optional, no-login sync layer (`sync.js` + `firebase-config.js`), backed by
a free Firebase project. It's off by default — every quest works exactly
as described above until you turn it on — and there's no signup/account
for Diksha, just a short auto-generated code (like `TIGER-4271`) she can
enter on a second device to link it to the first.

**Setup (about 5 minutes, one-time):**

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
   and create a free project (Spark plan — no billing required).
2. In the project, click **Build → Firestore Database → Create database**.
   Choose **Production mode** and any nearby region.
3. Go to Firestore's **Rules** tab and replace the rules with:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /progress/{code} {
         allow read, write: if code.size() >= 6;
       }
     }
   }
   ```
   This lets any device read/write a progress document *only if it already
   knows the exact code* — there's no listing/browsing of other codes, and
   codes have enough entropy (a word + 4 digits, e.g. `TIGER-4271`) that
   guessing one isn't practical. It's appropriately low-security for "sync
   a kid's quiz scores across her own devices," not for anything sensitive.
4. In Project Settings (gear icon) → **General**, scroll to "Your apps",
   click the **</>** (Web) icon, register an app (nickname doesn't matter,
   no Firebase Hosting needed), and copy the `firebaseConfig` object it
   shows you.
5. Paste those six values into `firebase-config.js` in this repo, commit,
   and push. That's it — sync turns on for every quest automatically.

These config values are not secret keys (Firebase's own docs say so) —
they identify the project, not grant access; access is controlled by the
Firestore rules above. It's fine for this file to be public in the repo.

**How it works day to day:** the first time a quest loads with sync
configured, it shows a small "Sync code: WORD-1234" pill in the footer
(tap it to copy). Entering that same code under Settings/footer on another
device (via "Use a different code") links the two — from then on, progress
made on either device shows up on both within a page reload. If Firestore
is unreachable (offline, blocked network), everything silently falls back
to local-only, exactly like before sync existed.
