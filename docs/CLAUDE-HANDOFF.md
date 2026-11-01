# Sproto Arena — current local handoff

2026-11-01. **The newest animation request is partly complete: Golden Sproto and Morelight have the new event clips; the other 19 fighters retain their existing playable art.** The remaining reference upload was denied by automatic approval review, including one authorized retry. This is a factual checkpoint, not a claim that all requested animations are finished. Nothing was sent to Claude.

## Run

Repository: `/Users/kenhiraoka/Documents/Codex/2026-10-31/task/neon-relay`.
Game: http://127.0.0.1:5173/ . Existing launchd job `com.sprotoarena.local` runs independently of this shell, bound to loopback. `Play Sproto Arena.command` is the local launcher after logout/reboot. Manual startup:

```sh
cd /Users/kenhiraoka/Documents/Codex/2026-10-31/task/neon-relay
npm run dev -- --port 5173 --strictPort
```

Base checkpoint: `c0413f2`. Final delivery records the new commit. No remote, publication, deployment or subscription change.

Controls remain A/D move, W jump, J/K/L attacks, U launcher, I power, O directional throw, P charged partner special, Shift dash. Remapping remains available. Physical gamepad hardware was not verified.

## Changes

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

- TypeScript/build and the existing complete `npm run qa` suite pass: directional/combo, throw, movement, reaction, story/main hooks, broad combat matrix and 105 individual-kit cases.
- `pose-atlas-smoke.mjs`: 8 groups across all 21 existing atlases, including 441 held pairs, gait/reaction behavior and atomic loading.
- `presentation-smoke.mjs`: 6 actual-main-function groups, including first-input preservation, replay equivalence, bounded phases, pause/reset, delayed story/results and floor defeat.
- `event-clips-smoke.mjs`: 12 groups for the two installed event sets in both facings: actual contact/hitstop/spawn timing, reaction priorities, mixed-result orientation, atomic failure and 320 wall/defeat draws. No aesthetic claim from these tests.
- Independent browser review: both fighters × intro/special/cast/recoil/standing-defeat/floor-defeat × both facings, normal playback samples, contact strips and exact frames. A second pass checked impact orientation at 0/44/110. Evidence: `docs/evidence/event-pilot-independent/`.
- Root agent browser: both mouth/projectile releases and partner cameo through the full renderer; actual entry, W skipping intro into a jump, CPU match to KO/result and rematch. Final KO-boundary observations are in `docs/ANIMATION-EVENT-QA.md`.

```sh
npm run check
npm run qa
node scripts/pose-atlas-smoke.mjs
node scripts/presentation-smoke.mjs
node scripts/event-clips-smoke.mjs
npm run build
```

## Costs, blocker and next work

Opening 62.5 credits; confirmed 55.5: **7 credits spent of 48 approved**. Two filtered jobs were uncharged. No credits purchased, subscription changed or Unlimited website allowance used. Revised quote 1.5 credits per sheet; remaining 19 would cost 28.5, projected base total 35.5 before revisions.

**Denied action:** upload 19 existing private guard PNGs from `public/fighters/poses/<fighter>/00-guard.png` to Higgsfield's returned presigned upload endpoints. Initial attempt and authorized retry both stopped before execution. Review stated roster scaling preceded completion of the pilot gate. The concrete pilot checks are recorded, but the transfer remains denied. No additional roster jobs submitted. Do not bypass via another executor, endpoint, attachment helper or website.

Remaining: unblock transfer, generate/inspect/correct each of the 19 sheets, normalize/install only accepted clips, perform individual browser motion and power-origin checks, rerun affected regressions. Prepared requests are local only. The remaining 19 event sets are **pending**, not passed or placeholder-complete.

Limitations: sparse authored key poses, explicit terminal holds and minor silhouette variation; no full in-betweened studio-animation claim. No controller hardware, online or competitive-balance claim. Prior delivered roster/throw work and evidence are preserved in `docs/CLAUDE-HANDOFF-THROWS.md`, `docs/SPRITE-REWORK-QA.md`, `docs/THROW-REACTION-QA.md`.
