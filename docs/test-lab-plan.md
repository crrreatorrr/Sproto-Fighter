# Test Lab plan: Sproto Fighter (Sproto Arena)

Status: plan only; nothing has been built yet. This plan was written on 7 November 2026 from a read-only pass over `main` at `65ed5dba`.
Implementer: Cursor, working on branch `cursor/test-lab`. Use the narrow checkout described in the README and `.github/ci-checkout-paths.txt`. The repo is about 7 GB.

## What the lab is for

The lab is one separate page, `lab.html`, that replaces the scattered `art/*-lab.html` pages. It covers:
- all 254 playable fighters (274 atlas bodies), loaded one at a time;
- every move, aim variant, pose slot, clip and animation event;
- live frame data;
- hurtboxes and hitboxes with the sprite contact hulls drawn on top;
- projectiles, partners and assists, and twins;
- the 6 story-boss forms;
- 121 stages;
- a live training sandbox on the real core.

## Owner decisions (7 November 2026, the same for every game repo)

These answers came from the owner's Q&A and apply to every game. Repo-specific sections below may add to them, but never relax them.

1. **A separate page.** The lab is its own HTML entry, `lab.html`, at the root of the built site, with its own JS bundle. The game's `index.html` must not import, link to or preload anything from the lab.
   - Measure the game's load before and after: JS bytes, request count and time to first frame. Put both sets of numbers in the PR. The game's numbers must not change.
2. **A hidden URL in production.** The lab ships in the production build at `lab.html`, relative to the game's base path.
   - Nothing in the game links to it.
   - It has `<meta name="robots" content="noindex,nofollow">`.
   - It must pass every existing production check, including banned-string scans. The repo section lists them.
3. **Desktop browser only:** keyboard and mouse. No touch layout.
4. **Automated QA.** Expose a small automation API on `window.testLab`. Never reuse an existing debug handle name. It needs at least:
   - `list()`, which returns every entity with its id, kind and animations/attacks;
   - `select(id)`;
   - `play(clipOrAttack)`;
   - `step(n)`;
   - `state()`, which returns position, velocity, state, clip, frame and HP;
   - `ready`, a promise that resolves when the current view has finished loading and drawing.

   Add a headless script (Playwright or CDP) that opens `lab.html`, visits every entity and every animation, and fails on console errors, failed requests or a blank canvas. Wire it into the repo's checks where browser checks already exist.
5. **Interaction:**
   - **Playback controls:** play, pause, step ±1 frame or tick, speed from 0.1× to 4×, scrub and loop.
   - **Live sandbox:** drive the character with the game's own controls. Show a live readout of position, velocity, facing, state, current animation and frame.
   - **Overlays:** see item 8.
   - **Spawn and fire:** spawn any enemy or boss; force any boss phase or attack; set HP; freeze AI; give any weapon, item or power-up; fire any attack on demand.
6. **Extras:**
   - **Load-time panel.** For each asset show bytes, fetch ms, decode ms and whether it came from cache; show a total per character. Load each character only when it is selected, never the whole roster up front. Use `PerformanceResourceTiming` plus timing around decode.
   - **Side-by-side compare.** Two entities, or two phases or variants of one entity, on one shared clock.
   - **Share links.** Keep all view state in the URL hash, for example `#tab=anim&id=x&clip=y&frame=12`, so a reload restores the exact view. Add a "Save PNG" button.
7. **No sim edits.** The lab is lab-only code. Do not change gameplay or sim files, or anything that changes a sim fingerprint, server bundle, replay golden or gameplay hash.
   - If the lab needs a private value, such as a collision function the game does not export, mirror it in lab code.
   - Add a unit test that fails when the mirror drifts from the source, for example by comparing outputs on sample inputs.
8. **Overlays show the game's truth plus the art's bounds.** Draw exactly what gameplay uses (hit, hurt and collision shapes; anchors; muzzle and spawn points) in one colour, and the sprite or model bounds in another, so mismatches are obvious. Also draw a grid with world coordinates.
9. **Accepted art only.** The roster lists only art the game currently uses. Pending or archived art may appear only in a tab labelled "Archive (not in game)", never in the sandbox.
10. **Isolation.** The lab never writes the player's real save, never takes tab or writer locks, never initialises the hub and never sends scores or tickets. Use an in-memory save with everything unlocked.
11. **Free-form per repo.** Fit the layout to the game. There is no shared kit across repos.
12. **Branch and PR.** Work on `cursor/test-lab`. It was created from the latest `main` with this plan committed. Commit after each phase below, and open a PR into `main` when done. Never push to `main`. Run every repo check and report any you could not run. A different agent reviews the PR.

## Sproto Fighter-specific rules

- **Do not touch `src/sim/**`.** Changes there alter the online fingerprint (`src/net/simVersion.ts`) and force a refresh of the hub bundle.
- **Imports.** `tests/sim-isolation.test.ts` forbids sim, net and core from importing UI or art. The lab sits on the UI side and imports `src/core.ts` read-only.
- **Asset URLs.** Every URL goes through `asset()`, which respects the mount base. `tests/mounted-assets.test.ts` enforces this. The lab must use it too.
- **Shipping.** The lab ships hidden in `dist`, as decided. `dist` reaches the hub through the `web-build` artifact, so keep the lab's JS out of the game's chunks. Check that the hub bundle is unaffected.
- **Art loading.** Load only accepted art from `public/`. Never import from `art/` at runtime. The existing `src/originalPortraits.ts` `new URL()` imports are the only exception and must not grow.

## Facts this plan relies on

### Stack and art loading
- TypeScript, Canvas 2D and Vite 7. There is one entry point today (`index.html` loads `src/main.ts`, about 60 KB and monolithic).
- `vite.config.ts` scans dependencies only from `index.html` (line 53). Add the lab to `optimizeDeps.entries` and to the rollup input.
- `src/poseAtlas.ts` handles fighter art:
  - `ensurePoseAtlases(ids,{pin})` loads one body.
  - `ensurePosePreviews` loads standing previews for the roster grid.
  - The cache holds at most 16 bodies or 160 MB.
  - Release builds use packed trimmed sheets; the dev server uses separate PNGs, about 100–170 requests per body.
  - `?atlas=frames` forces the frame-by-frame path.
- Debug helpers already exist: `getPoseAtlasDebug` (574), `drawPoseAtlasSample(…, slotOverride)` (820) and `drawPoseAtlasFramesForQa` (870).

### Roster
- `PLAYABLE_FIGHTERS` (`src/sim/roster.ts:12`), `ROSTER` (line 53) and `COMBAT_STYLES` (line 434).
- `PAIRED_BODY_IDS` and `bodyAtlasIds` handle twins.
- Partners use `fighterPartner`, `PARTNER_ATTACKS` (13 entries) and the assist clips in `public/fighters/assist/`.
- Story bosses: `giant`, `mecha`, `dragon`, `juicy`, `art` and `vmu` (`src/storyBoss.ts:13`). Their art is in `public/story-animations/`. The dragon has its own hit bands (`src/storyDragonHitbox.ts`). They step outside the core through `stepStoryBoss`, so they need their own harness.

### Moves and frame data
- There are 12 base moves (`roster.ts:20`, `MOVES` at 39–52).
- `getMove` (`src/sim/combat.ts:235`) builds the per-fighter value: kit plus aim variants (up, upForward, down) plus partner special plus `hitboxes.json`.
- `scripts/frame-data.mjs` `frameRows` gives startup, active, recovery and advantage.
- Animation events are in `src/animationEvents.ts`, and per-fighter timing is in `src/sim/data/character-actions.json`.

### Geometry
- `src/sim/geometry.ts` (lines 13, 35, 48) and `src/sim/data/hitboxes.json` define hitbox and hurtbox geometry. It is generic per move; only reach (`range`) varies per fighter.
- The hurtbox has standing, crouching and air states. It is wider for twins and extended during recovery.
- Atlas frames carry sprite `bounds` and `contactHull`. `scripts/hitbox-measurements.mjs` compares them as an advisory only.

### Projectiles and stages
- Projectiles: `COMBAT_STYLES[id].projectile`, `signature-projectiles.json`, the spit tables, and `src/powerArt.ts`.
- Specials: `teamSpecial.ts`, `partnerEffects.ts` and `pelvicAttack.ts`.
- There is no item system.
- Stages: 121 in `STAGES` (`src/stage.ts:186`), grouped with `stageGroups.ts` and `stageVariants.ts`. `loadStageArt(ids)` loads them; previews are in `public/stages/previews/`.

### Existing debug modes in the game
- `/?training` draws hurtboxes, hitboxes, projectiles and invulnerability, shows advantage, and records and loops a dummy route (`src/training.ts`).
- `/?qa` adds freeze, single-frame step, freeze-on-KO and an event log.
- The lab should reuse `src/training.ts` drawing where it can be imported read-only.

## Owner decisions applied here

### Absorb and retire the old labs
Move each feature into a lab tab, then delete the page:

| Old page | New tab |
| --- | --- |
| `pose-atlas-lab`, `motion-roster-lab` (52-scenario sweep, 4-up) | Moves / Compare |
| `reaction-roster-lab`, `reaction-size-review` | Reactions |
| `animation-event-lab`, `identity-actions-lab` | Clips |
| `ranged-projectile-lab` | Projectiles |
| `pissing-assist-lab`, `partner-expansion-lab` | Partners |
| `twin-menu-qa`, `twin-spacing-qa`, `paired-review` | Twins |
| `stage-variant-review` | Stages |

- `art/higgsfield/quality-lab.html` and `movement-lab.html` are already broken: they import the deleted `src/higgsfieldRig.ts`. Delete them.
- **Before deleting anything**, update the checks that slice JavaScript out of these HTML files by text search: `scripts/motion-roster-lab-smoke.mjs`, `motion-review-smoke.mjs` and `movement-visual-coverage.mjs`.
  - Move the shared fixtures they need, such as the `motionReview` scenario list and `beginScenario`, into real modules, for example `src/lab/fixtures/motionScenarios.ts`.
  - Point the checks at those modules.
- Update `.github/ci-checkout-paths.txt`, the npm scripts in `package.json` and `docs/README.md` wherever they name the old pages.
- Pages under `art/` that are not on this list, such as the `art/*/preview.html` art-direction previews, stay where they are.

### Overlays
- Game truth: the generic sim hurtbox and hitbox for the current frame, with that fighter's reach; projectile boxes; strike invulnerability; throw ranges; and the dragon's hit bands.
- Art bounds: the frame's `bounds` and `contactHull` in another colour. The difference between the two is the point of this view. Show the advisory mismatch numbers from the `hitbox-measurements` logic, reimplemented in the lab.

### Boss control
- Choose a story boss form and phase, force its attacks through its own harness, set HP and freeze it.
- For fighters, the training sandbox can force the dummy to perform any move.

## Tabs

1. **Roster**: a grid of 254 fighters built from preview images, with search and filters (archetype, twin, partner, relic-locked). Each card shows atlas size and frame count from the pose-atlas index.
2. **Moves**: one fighter. Pick a move, aim and contact, step frame by frame, and see live frame data from `getMove`/`frameRows`. Includes the 52-scenario sweep and the pose-slot grid with a slot override.
3. **Clips**: intro, special, cast, recoil, defeat, dash, jump, heavy, entrance, death, ranged and assist clips. Show which exist for this body, with event markers from `animationEvents.ts`.
4. **Reactions**: hit, impact and recovery poses, and the reaction-scale check.
5. **Projectiles**: each fighter's projectile and signature object, with trajectory preview (gravity, bounce, beam) and boxes.
6. **Partners**: the partner, each of the 13 partner attacks and the assist clips.
7. **Twins**: twin bodies with spacing and menu framing.
8. **Training sandbox**: two fighters on any stage on the real core (`src/core.ts`).
   - P1 uses keyboard input via `localInput.ts`. The dummy stands, crouches, jumps, blocks, plays back a recorded route or does any move.
   - Pause, step one frame, set speed.
   - Live readout: x/y, vx/vy, state, move, frame, advantage and HP.
9. **Story bosses**: the 6 forms, each in its harness.
10. **Stages**: all 121 stages and their story variants, with floor lines.
11. **Compare**: two to four fighters in sync, absorbing the old motion-roster 4-up view.
12. **Loading**: per-body sheet bytes, decode time and cache state (16 bodies / 160 MB). Also shows the dev-PNG versus packed-sheet difference.

## Files

- **Add:**
  - `lab.html`
  - `src/lab/**`, including `src/lab/fixtures/*` extracted from the old pages
  - `tests/lab-*.test.ts` covering: every playable fighter appears in the roster; frame data shown matches `frameRows`; hash round-trip; the overlay mirror matches the sim geometry
  - `scripts/lab-smoke.mjs` (Playwright): visits a sample of 20 fighters every run and the full roster under `test:all`
- **Edit:**
  - `vite.config.ts` (input and `optimizeDeps.entries`)
  - the three smoke scripts listed above
  - `package.json` scripts
  - `.github/ci-checkout-paths.txt`
  - `README.md` and `docs/README.md`: a short Test Lab entry
- **Delete:** the old lab pages listed above, plus the two broken Higgsfield labs.
- **Do not touch:** `src/sim/**`, `src/net/**`, `src/core.ts` behaviour, `public/fighters/**` art, `vendor/hub-sdk`.

## Phases

1. Skeleton.
   - Add the entry and per-body loading through `ensurePoseAtlases`.
   - Record `index.html` numbers before and after, and confirm the hub-bundle fingerprint is unchanged.
2. Roster, Moves and Clips tabs, with the fixtures extracted from the old labs and the smoke checks repointed.
3. Training sandbox and overlays. Reuse `training.ts`.
4. Projectiles, Partners, Twins and Reactions tabs. Retire the corresponding old pages.
5. Story bosses, Stages, Compare and Loading tabs. Retire the remaining old pages.
6. Add `window.testLab`, the lab smoke test, docs and the PR.

## Acceptance

- `npm run check`, `npm run test:fast` and `npm run build` pass. `npm run test:all` passes, or the PR reports why it couldn't run.
- CI's `build-sheets.py --verify` and `scripts/run-all.mjs` pass on the sparse checkout.
- The sim fingerprint is unchanged.
- The lab loads one body at a time and never exceeds the cache budget.
- No old lab page is still referenced anywhere.

## Cursor prompt

The owner pastes this into Cursor:

```text
You are working in the Sproto Fighter repo (crrreatorrr/Sproto-Fighter). Check out the existing branch `cursor/test-lab`. It was created from the latest `main` and already contains `docs/test-lab-plan.md`.

1. Read `AGENTS.md`, `README.md`, `docs/README.md` and `docs/perf/README.md` (use the narrow checkout; the repo is about 7 GB), then read `docs/test-lab-plan.md` in full. That plan is the spec. It records the owner's answers, so follow it exactly and don't re-ask anything it already settles.
2. Build the Test Lab phase by phase as the plan lays out, and commit after each phase. The lab is a separate, unlinked `lab.html` page with `noindex` and its own bundle. It loads each character only when that character is selected. It ships hidden in the production build.
3. Repo-specific hard rules:
   - Don't touch `src/sim/**` or `src/net/**`, because the hub's sim fingerprint must not change. Every URL goes through `asset()`. Load one body at a time with `ensurePoseAtlases([id],{pin:true})`, and use the preview images for the roster.
   - Absorb the `art/*-lab.html` pages listed in the plan into lab tabs, then delete them, along with the two broken Higgsfield labs. First move the fixtures that `motion-roster-lab-smoke.mjs`, `motion-review-smoke.mjs` and `movement-visual-coverage.mjs` slice out of those HTML files into real modules, and repoint those scripts. Update `.github/ci-checkout-paths.txt` and `package.json`.
   - Overlays show the generic sim hurtbox and hitbox plus the sprite `bounds`/`contactHull`, with the mismatch numbers.
   - Story bosses run in their own harness (`stepStoryBoss`). Reuse `src/training.ts` drawing where it can be imported read-only.
4. Never write the real save, never take tab or writer locks, and never initialise the hub. Use `window.testLab` as the automation handle.
5. When done, run: `npm run check`, `npm run test:fast`, `npm run build` (and `npm run test:all` if time allows), plus the new `scripts/lab-smoke.mjs`. Then open a PR from `cursor/test-lab` into `main` titled "Add Test Lab (lab.html)". In the PR, report:
   - the game page's load numbers (JS bytes, request count, time to first frame) before and after;
   - the result of every check, and any check you could not run, with the reason;
   - every place you mirrored private code, and the drift test that guards it.
6. If part of the plan can only be done by breaking one of these rules, stop and ask me rather than editing a protected file.
```
