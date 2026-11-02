# Current-build handoff — November 2, 2026

The user requested publishing this current snapshot immediately, before the remaining QA and fixes. **This is not a fully accepted or fully verified release.** No hosting deployment is included.

## Implemented scope

- 22 selectable fighters, original reference portraits, individual mechanical kits and combo-charged Team Specials. Sproto Duo is one selectable fighter containing two independently animated red/blue bodies.
- Fixed-step 60 Hz TypeScript combat separated from Canvas rendering, frame-indexed input and replay helpers. Offline CPU and practice modes; no online play or local second player.
- Ground/air/directional attacks, launchers, dive attacks, projectiles, guard, recoil/knockdown, directional grabs, dash cancels and bounded combos.
- Red/blue/yellow arcade selection, actual kit stats, random fighter/stage, five arenas and untimed rounds. Four story worlds have selectable, explicitly placeholder scenes and progression.
- The new approved menu image is installed. Duo uses generated complete-body pose atlases rather than separated limb puppets. Existing artwork for the other21 fighters is retained; the other19 proposed event-animation upgrades were stopped by the user.

## Current changes and architecture

`src/core.ts` adds the duo's roster entry, attacks, power, four-contact special and wider deterministic collision/contact geometry. `bodySpread()` and `fighterWall()` account for its two bodies. One health/meter state and one hit transaction prevent duplicate damage. The two-entity design is not two independent combat simulations.

`src/poseAtlas.ts` creates stable red/blue render identities, offsets their gait phases, chooses a lead body for ordinary attacks, latches throw leadership across back-throw facing changes, and alternates bodies during the special. Bounds-based visual spacing prevents the two bodies from merging in floor, recoil and special poses. This visual spacing is separate from simplified core collision geometry.

`src/render.ts` adds two shadows; `src/powerArt.ts` draws the duo's ribbon power. `src/originalPortraits.ts` maps the exact original duo image. `src/selectionMenu.ts`, `src/arcadeSelection.css` and `index.html` handle the larger roster and smaller paired preview.

`public/fighters/pose-atlas.json` has23 body atlases for22 fighters. Each duo body has32 main pose slots, four authored walking keys and intro/special/cast/recoil/defeat mappings. Some slots and terminal holds repeat images. Installed images use256×256 RGBA canvases, binary alpha and nearest-neighbor rendering. Walk cadence is travel-based at176 world pixels per cycle, with half-cycle separation between bodies. The fixed normal formation is144 world pixels between roots; wider floor/special poses receive extra visual clearance.

`art/new-fighter-22/import_duo.py`, `assemble_walk.py` and `install_duo.py` preserve the authoring logic. Their raw generation sources and receipts remain in the original local authoring checkout and are not needed to run the game. `art/pose-atlas-lab.html` and `art/animation-event-lab.html` are developer fixtures using the actual core/renderer.

## Confirmed unfinished work

1. **CPU approach bug for the duo.** In an actual duo-versus-duo match, the rival repeatedly walked toward the player at roughly194px root separation without attacking. The wider pair collision stops approach while `cpuInput()` still uses single-body distance thresholds (105/125px). This was reproduced in the browser, not fixed before the immediate push. Adjust CPU decision distance using the body's spread, then check both player/opponent roles and all silhouettes.
2. **Blue kick recovery.** Blue core slot19 plants both feet instead of visibly rechambering. The independent reviewer recommended reusing coherent slot16 for19. That mapping was not applied; the installed manifest is `duo-full-body-review-6`. Verify the complete kick transition in both actual facings after correction.
3. **Throw test fixtures.** Two throw-test groups fail because their initial positions use the old single-body wall/gap constants. A temporary corrected fixture using `fighterWall()` and both `bodySpread()` values passed all15 groups, but that correction is not in the published source. The shipped test failure must not be presented as a passed suite.
4. **Final visual review incomplete.** The reviewer stopped at an account usage limit. Final special spacing/alternating-contact, recoil clearance, revised blue kick, and last air/hold-to-floor transition checks remain incomplete. Earlier source, frame-step and normal-speed sample coverage is detailed in [DUO-QA.md](DUO-QA.md).
5. Four-key walking remains visibly stepped. There is no world-space foot locking or continuous generated animation. Floor recovery can visibly reform the duo's spacing. Some directions share attack drawings; mirrored art is not separately authored left-facing art.

## Validation and honest limits

The production build/TypeScript check and nine duo-specific automated groups passed on the export. The current throw suite has13 passing groups and2 failing groups described above. Earlier pose/event/selection/story checks are recorded in the authoring checkout; they are not a substitute for final visual acceptance.

Actual browser checks included the final paired menu fit and original portrait, stage selection, duo mirror combat, W jump, an air kick, reversal/dash, forward grab hold/release and knockdown, guarding, ground and aerial combos, earned meter, special activation, story entry and back navigation. Current browser logs were empty at the sampled checkpoint. Screenshots/readouts under `docs/evidence/` are sampled observations, not continuous-video or every-frame coverage.

The previous21-fighter review was completed in earlier passes with per-fighter ledgers. It was not repeated in full during this duo update. Physical gamepad hardware, full campaign completion by hand, systematic cross-browser coverage, long sessions, every inter-character overlap and subjective player acceptance remain unverified.

## Run and reproduce

```sh
npm ci
npm run dev -- --port 5173 --strictPort
```

Open http://127.0.0.1:5173/. Add `?qa` for visible state/freeze/step controls. Use the two labs listed above for reproducible pose scenarios. `npm run build` creates the production bundle; `npm run qa` includes the known failing throw fixture groups. See README for all focused commands and controls.

## Asset spending and publication scope

The duo used35.5 existing Higgsfield credits across16 jobs, including rejected grids and targeted repairs. The last recorded balance was12. The approved menu image used2 separate credits. No purchases or subscription changes were made. The19 stopped reference transfers were not retried or rerouted.

This public repository starts with a clean source snapshot. It includes source, installed combat/menu/stage assets,22 runtime original portraits, tests, review labs, authoring scripts and selected evidence. Raw generation archives, provider/account/Library receipts, rejected drafts, bulk historical QA captures, local dependency/build caches and original private authoring history stay in the local checkout. Public metadata omits the Library/provider identifiers. No credentials or account tokens are required to run the game.
