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
   confirm the live `parent-dashboard.html` lists it (see Conventions).
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
- Every synced quest must also be listed on the parent dashboard
  (`parent-dashboard.html`, not linked from the hub). It reads only the keys in
  its `REGISTRY`, so a quest left out is invisible there even though its sync
  works. Add one entry `{ key, icon, name, href }` to the group matching the
  quest's hub sub-section: `key` is the quest's own storage key, and `icon`,
  `name`, `href` copy its `index.html` entry. Then check that the dashboard can
  read the quest's saved state. It looks for points in `xp`/`stars`; streak in
  `streak`, or a `days` map of `"YYYY-MM-DD": number`; mistakes in `wrong`
  (object), `mistakes` (array), `totalWrong` or `mist` (object); last active in
  `lastDay`/`lastPlayed`/`lastPractice`, or epoch ms in `updatedAt`/`t`; mock
  scores in `boss.a`/`boss.b` as `{got, max}`. If the quest names a field
  differently, add a fallback reader after the existing ones, so other cards
  never change. Editing the dashboard this way is the one allowed exception to
  "do not touch other files" below. Done means the live dashboard renders the
  new card with real-shaped data (stub `sync.js` in Playwright) and every other
  card is unchanged. A quick audit check: every `*.html` that loads `sync.js`,
  apart from the dashboard itself, has its storage key in `REGISTRY`.
- Each quest owns one localStorage key (`diksha_<subject>_v1` style). Confirm
  it is unused by any other file before shipping.
- Do not touch other quests, `sync.js`, or `firebase-config.js` when adding a module
  (the parent-dashboard `REGISTRY` entry above is required, not optional).
- Verify with the handoff's own suites if provided (`node qa.js`, `node soak.js`,
  need `npm i jsdom` in a scratch dir), plus a Playwright walk of the module's
  tabs at 390px using the preinstalled Chromium.
