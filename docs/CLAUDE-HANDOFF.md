# Sproto Arena — current local handoff

**Latest local update: selection now follows the supplied reference's compact arcade composition more closely.** It has a centered MEMBER SELECT masthead, narrow stat panels, selected-name bars, two-row portrait grid and red/blue/yellow framing. Desktop/mobile browser review, all 21 player selections and focused regressions pass; a mobile label overlap was fixed and independently rechecked. See [MENU-REFERENCE-REVISION.md](MENU-REFERENCE-REVISION.md) for exact coverage. One additional Nano Banana 2.1 menu background is quoted at **2 credits, awaiting separate approval**; no generation was submitted or new credits spent in this revision. Nothing was sent to Claude.

The prior [menu/no-timer update](MENU-QA.md) remains installed: original portrait images, opposing fighter previews, real combat stats, random fighter/stage selection and five scenery choices shared by menu and arena.

2026-11-01. **The newest animation request is partly complete: Golden Sproto and Morelight have the new event clips; the other 19 fighters retain their existing playable art.** After the user explicitly approved all 19 transfers, the latest retry passed automatic approval but every storage PUT returned HTTP 403. No new uploads were confirmed or generation jobs submitted. This is a factual checkpoint, not a claim that all requested animations are finished. Nothing was sent to Claude.

## Run

Repository: `/Users/kenhiraoka/Documents/Codex/2026-10-31/task/neon-relay`.
Game: http://127.0.0.1:5173/ . Existing launchd job `com.sprotoarena.local` runs independently of this shell, bound to loopback. `Play Sproto Arena.command` is the local launcher after logout/reboot. Manual startup:

```sh
cd /Users/kenhiraoka/Documents/Codex/2026-10-31/task/neon-relay
npm run dev -- --port 5173 --strictPort
```

Base checkpoint: `c0413f2`; integrated pilot checkpoint: `84b0521`; upload-blocker checkpoint: `c3b7955`; first menu/no-timer checkpoint: `bc45fc7`. The reference-layout revision checkpoint is reported in the delivery message and Git log. No remote, publication, deployment or subscription change.

Controls remain A/D move, W jump, J/K/L attacks, U launcher, I power, O directional throw, P charged partner special, Shift dash. Remapping remains available. Physical gamepad hardware was not verified.

## Changes

Current menu update:

- `src/selectionMenu.ts` owns setup state, original portrait buttons, both fighter previews, real statistics, random controls, and keyboard/controller focus. It only launches through an explicit callback. `index.html` and `src/style.css` supply the shell; `src/arcadeSelection.css` adds the latest reference-led composition and responsive overrides.
- `src/main.ts` applies the chosen fighter, rival, mode and stage at launch; returning stops combat. Dialogs and result/pause overlays have controller navigation; menu inputs must be released before combat. Existing story and remapping hooks are retained.
- `src/core.ts` no longer contains a round clock or expiry outcome. `src/render.ts` removes the timer and improves HUD contrast. KO/double-KO and presentation duration remain.
- `src/stage.ts` shares five-stage rendering across menus and arena, with aspect-preserving previews and optional-image fallback. Four static images are under `public/stages/higgsfield/`; raw generation provenance is in `art/menu-art/`. A code-drawn floor apron prevents the bar's booth art from occupying the fighting groundline.
- `scripts/selection-menu-smoke.mjs` and `scripts/stage-preview-smoke.mjs` are focused regressions. Existing story/presentation/combat tests were updated for selection-first entry and no timeouts. README run/play instructions and the current menu QA record are updated.

Prior event pilot, preserved:

- Two new reference-based Higgsfield complete-body event sets: 4 intro, 8 special, 4 cast, 4 recoil and 12 defeat slots each. Terminal slots deliberately repeat accepted rest drawings. Each pilot currently uses 26 distinct accepted source cels; generated sheets contain 32 cells, but bad drawings are not activated.
- All 21 original-selection portraits, existing main poses/walks, individual kits, throws, combo-meter rules and story/stage framework remain. No limb-cutout rig was reintroduced. Existing walks/kicks were not regenerated in this event update.
- `src/animationEvents.ts`: presentation timing separated from replay/combat. Intro: 52 ticks, skippable with the exact triggering input preserved; outro: 96 ticks before result/story handoff.
- `src/main.ts`: integrates presentation clocks; combat/replay stop during intro/outro; pause preserves phase and restart resets it. Optional visible `?qa` controls include exact stepping and default-off freeze at KO for inspection.
- `src/poseAtlas.ts`: atomic optional clip loading, dimensions/count validation, actual contact/reaction-clock sampling and correct throw/block/air/knockdown priority. Authored recoil/defeat bypass rigid-body rotation. Floor defeat follows impact direction, detects prone losers individually in mixed draws, and keeps opaque bounds inside the camera without moving combat positions.
- `src/teamSpecial.ts`: stable partner object identity and owner-contact timing replace reconstructing the partner each draw with a mismatched three-frame offset.
- `src/render.ts`: presentation context plus start/KO cues. `src/core.ts`: only two cast origins changed to measured mouth positions, Golden 44 forward / 109 high and Morelight 59 forward / 103 high. Horizontal trajectories, damage, move timings and other projectile types remain.
- Cast release remains visible at least 4 simulation ages, even when the projectile spawn window is 1 tick. This does not move creation/hit timing.

## Assets and provenance

`art/animation-rework/` stores the exact model screenshot, identity mapping, prompts, returned jobs, raw sheets, corrections, budget and pilot assessment. `import_events.py` removes flat chroma, extracts connected complete actors and applies one anatomical scale per sheet with reviewable anchors. It never articulates limbs or invents missing drawings.

`public/fighters/events/{rivet,vela}/` holds normalized PNGs; `public/fighters/pose-atlas.json` installs accepted mappings only. Golden's shrunken-head/upright-return/opposite-facing edge cells and Morelight's alert rise/edge cells are omitted. Repeated final drawings are holds, not generated in-betweens. Originals and rejected source sheets remain intact.

`art/animation-event-lab.html` has 21 selectors, both facings, real 60 Hz event fixtures, stepping/optional looping, contact strips, original/guard comparisons and full combat-render preview. It labels fixtures, missing clips and fallbacks explicitly. Runtime manifest revision: `whole-body-events-pilot-1`.

## Verification completed

For the latest menu pass: all 21 player selections and original portrait loads; independent desktop/mobile menu review; all five actual arena selections; CPU/random/stats; story Castle entry/back and separate free-play selection; keyboard movement/W jump, projectile damage, naturally earned three-pip Team Special, forward throw release, remap/restore, pause/reset, and a live CPU KO/result/rematch. Full `npm run qa`, selection/stage tests, presentation/event regressions and production build pass. See the menu report for exact distinctions between browser and scripted coverage. This did not repeat every fighter's movement QA or unblock the 19 missing event sets.

Prior event-pilot visual coverage and repeated regression checks:

- TypeScript/build and the existing complete `npm run qa` suite pass: directional/combo, throw, movement, reaction, story/main hooks, broad combat matrix and 105 individual-kit cases.
- `pose-atlas-smoke.mjs`: 8 groups across all 21 existing atlases, including 441 held pairs, gait/reaction behavior and atomic loading.
- `presentation-smoke.mjs`: 6 actual-main-function groups, including first-input preservation, replay equivalence, bounded phases, pause/reset, delayed story/results and floor defeat.
- `event-clips-smoke.mjs`: 12 groups for the two installed event sets in both facings: actual contact/hitstop/spawn timing, reaction priorities, mixed-result orientation, atomic failure and 320 wall/defeat draws. No aesthetic claim from these tests.
- Independent browser review: both fighters × intro/special/cast/recoil/standing-defeat/floor-defeat × both facings, normal playback samples, contact strips and exact frames. A second pass checked impact orientation at 0/44/110. Evidence: `docs/evidence/event-pilot-independent/`.
- Root agent browser: both mouth/projectile releases and partner cameo through the full renderer; actual entry, W skipping intro into a jump, CPU match to KO/result and rematch. Final KO-boundary observations are in `docs/ANIMATION-EVENT-QA.md`.

```sh
npm run check
npm run qa
node scripts/selection-menu-smoke.mjs
node scripts/stage-preview-smoke.mjs
node scripts/pose-atlas-smoke.mjs
node scripts/presentation-smoke.mjs
node scripts/event-clips-smoke.mjs
npm run build
```

## Costs, blocker and next work

Opening 62.5 credits; latest confirmed 49.5: **13 credits spent total: 7 fighter pilot + 6 stage panoramas**. The user clarified that the 48-credit approval was for fighter animation sheets only. The 6 stage credits had already been spent; this was disclosed as a scope error. No further stage/menu spending is authorized. No credits purchased, subscription changed or Unlimited website allowance used. The remaining 19 fighter sheets were quoted at 28.5 credits before revisions; the ledger conservatively retains 35 credits of aggregate headroom rather than expanding the total ceiling.

**Blocked action:** upload 19 existing private guard PNGs from `public/fighters/poses/<fighter>/00-guard.png` to Higgsfield's returned presigned upload endpoints. Two earlier attempts stopped at automatic approval before execution. The user then specifically approved all 19 uploads; the latest permitted retry executed, but all 19 storage requests returned HTTP 403. No uploads were confirmed or additional roster jobs submitted. Detailed storage rejection reasons were not captured. See `art/animation-rework/transfer-blocker-2026-11-01.md` and its JSON receipts. Do not bypass via another executor, endpoint, attachment helper or website.

Remaining: resolve the storage transfer rejection, generate/inspect/correct each of the 19 sheets, normalize/install only accepted clips, perform individual browser motion and power-origin checks, rerun affected regressions. Prepared local prompts now emphasize stronger full-body anticipation, weight transfer, distinct special impacts and continuous defeat settling, following the user's request for flashier movement. These prompts have not produced new assets. The remaining 19 event sets are **pending**, not passed or placeholder-complete.

The user's “try one by one” suggestion was investigated: the failed requests already ran sequentially and individually. There was no batch-specific failure and no new upload attempt. The retained 403 receipts contain no detailed remediation instruction. Ask Higgsfield to resolve the storage access denial; do not route around it. Unrelated text-only stage generation did not fix this blocker.

Limitations: sparse authored key poses, explicit terminal holds and minor silhouette variation; no full in-betweened studio-animation claim. No controller hardware, online or competitive-balance claim. Prior delivered roster/throw work and evidence are preserved in `docs/CLAUDE-HANDOFF-THROWS.md`, `docs/SPRITE-REWORK-QA.md`, `docs/THROW-REACTION-QA.md`.
