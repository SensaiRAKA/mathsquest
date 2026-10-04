# Study Hub (mathsquest) - working rules for Claude

Static site: single-file HTML quests, no build step, deployed to GitHub Pages
from `main` by `.github/workflows/deploy-pages.yml`. Live URL:
https://sensairaka.github.io/mathsquest/

## Shipping a module (handoff zips, new quests, index changes)

This is zero-impact work on a personal study site. Always take it all the way live:

1. Do the work on the session branch, commit with a clear message.
2. Merge the branch into `main` with a merge commit (`git merge --no-ff`),
   matching the existing history, and push `main`. Do not stop at the branch
   and do not wait for a PR review - there is none.
3. Watch the "Deploy to GitHub Pages" workflow run for that push until it
   succeeds, then smoke test the live URL at phone width (390px) and report
   the live link. Local-only testing is not "done". For a synced quest, also
   confirm the live `parent-dashboard.html` shows its card in the right group
   (see Conventions).
4. Report anything that deviated from the handoff notes.

## Conventions

- `index.html` is the root page. Its subject cards live in `GROUPS`, the
  sub-sections of the Class 4 Learning Hub (`wt1` Weekly Test 1, `wt2` Weekly
  Test 2, `mid` Mid-Term Preparation, `sp` Special Classes), each rendered as a
  collapsible `<details>`. A new module is one entry in the right group's
  `items` plus one `TESTS` row carrying that group's `id` in its `group` key.
  The sub-section holding the next upcoming test is the one that opens on load,
  so the `group` key is what makes the hub land on the right place - do not
  leave it off. Add a sub-section only when a new exam cycle needs one
  (copy a whole `{id, icon, name, note, items}` block and give it a
  `border-left-color` rule); otherwise do not restructure the page.
- Every quest that should sync across devices loads, in `<head>`, in this order:
  the two Firebase compat SDK scripts, `firebase-config.js`, then `sync.js`.
  A quest with only `sync.js` silently runs local-only - add the missing tags.
- The parent dashboard (`parent-dashboard.html`, not linked from the hub) finds
  modules on its own: it reads `index.html`'s `GROUPS` on every load, reads each
  new page once for its `sync.js` tag and its `STORE_KEY` / `STORAGE_KEY` / `KEY`
  constant, and shows every key in her progress document. So a new quest needs
  no dashboard edit, as long as (a) it is in `GROUPS`, (b) `GROUPS` stays a
  plain array literal declared as `const GROUPS = [`, and (c) the quest declares
  its storage key as one of those three constants with a quoted literal value.
  `KNOWN` in the dashboard is only a shortcut that skips fetching pages.
- The dashboard reads progress fields by name: points in `xp`/`stars`/`points`;
  streak in `streak`, or a `days` map of `"YYYY-MM-DD": number`; mistakes in
  `wrong` (object), `mistakes` (array), `totalWrong` or `mist` (object); last
  active in `lastDay`/`lastPlayed`/`lastPractice`, or epoch ms in `updatedAt`/`t`;
  mock scores in `boss.a`/`boss.b` as `{got, max}`. If a new quest uses other
  names, add a fallback reader after the existing ones so no other card changes.
  That edit is allowed despite "do not touch other files" below. Bump the
  dashboard's `BUILD` string on any change to it, because that is what makes a
  cached copy reload itself.
- Each quest owns one localStorage key (`diksha_<subject>_v1` style). Confirm
  it is unused by any other file before shipping.
- Do not touch other quests, `sync.js`, or `firebase-config.js` when adding a module.
- Verify with the handoff's own suites if provided (`node qa.js`, `node soak.js`,
  need `npm i jsdom` in a scratch dir), plus a Playwright walk of the module's
  tabs at 390px using the preinstalled Chromium.
