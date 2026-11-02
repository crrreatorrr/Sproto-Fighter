# Paired fighters and integration checkpoint — 2 November 2026

This is a factual local handoff after the checks recorded below. It is not a
claim that the whole project, the concurrent story/UI work, or every frame of
the expanded roster has passed visual QA. No message was sent to Claude.

## Checkout and launch

- Working branch: `codex/integration-20261102`.
- Checkout: `/Users/kenhiraoka/Documents/Codex/2026-10-31/task/sproto-integration`.
- Integrated preview: `http://127.0.0.1:5187/`.
- Run: `npm install`, then `npm run dev -- --port 5187 --strictPort`.
- Build: `npm run build`. Type check: `npm run check`.
- The current local checkout reuses `../neon-relay/node_modules` through an
  ignored symlink. A fresh clone should install its own dependencies.
- Port 5173 remains the other chats' shared authoring build. It is not this
  isolated checkpoint. The server must be restarted if its terminal exits.

## Changes owned by this pass

- `src/poseAtlas.ts`: packed selection previews using actual opaque bounds,
  without changing combat scale; stable whole-cycle walk envelopes to avoid
  per-frame lateral packing jumps; paired special/reaction clearance; beam
  release hold while preserving newer authored action and assist clips.
- `public/fighters/pose-atlas.json`: walk-anchor corrections for ten bodies.
  Source images were not redrawn. Corrections were applied only where the
  incoming walking metadata matched the reviewed baseline.
- `src/selectionMenu.ts`, `src/arcadeSelection.css`: removed the blanket
  body-count reduction that made pairs small in selection, packed them into
  their allotted width, and reserved a central lane for the stage caption.
  The existing crop rules for Nick, Captain Sproto, High Sproto and Vaudream
  were preserved and inspected in the browser.
- `src/teamSpecial.ts`: ordinary partner cameos clear the entire paired
  formation; at the wall they use a raised lane locked for the attack. The
  newer multi-partner relay implementation was retained. Further partner
  independence work is happening on a separate branch and is not claimed
  complete here.
- `src/core.ts`, new `src/mindBeamArt.ts`, `src/render.ts`: Yannix now uses a
  horizontal purple forehead beam. It follows his airborne origin, has a
  finite reach and duration, hits once per cast, can be guarded or ducked,
  and stops if the caster is interrupted. It does not alter other powers.
- `art/paired-review.html`, `src/pairedReview.ts`: visible, deterministic
  four-fighter review page using the actual combat and rendering code.
- `scripts/yannix-smoke.mjs`, `scripts/paired-spacing-probe.mjs`: focused
  beam and formation checks. The menu test stub now uses `drawSelectionPose`.
- Completed branch `codex/directional-spit` / `d3e2360` was integrated with
  conflict resolution in `core.ts` and `poseAtlas.ts`: organic spit retains
  crouched/jumping mouth origins and horizontal travel; Yannix remains a
  separate high beam. Newer body layouts, projectile types and authored
  action clips were retained.

The ten corrected body anchors are: Sproto 2010 (-14), Sproto 2075 (-12),
Sproto 2210 companion (-14), Sproto 2344 companion (-12), Sproto 3181 (-12),
Sproto 3235 (-10), Gryph (+18), GodMod3D (+24), GodMod3D companion (-12), and
Nosmileclown (-14). Values are source-pixel horizontal shifts; floor anchors
are unchanged. Gryph and GodMod3D previously had visible lateral packing
jumps during walking. The fixed walking/reversal scenarios maintain stable
body offsets.

## What was actually inspected

The frozen review checkout on port 5186 was used to avoid hot reloads from
other chats. All 16 paired fighters were inspected individually in 27 sampled
states in both facings: idle, walk, dash, jump, light, medium/kick, heavy,
low, sweep, launcher, cast, three aerial attacks, four throw directions as
attacker, four as victim, light/heavy/launch reactions, block, and special.
This produces 32 per-fighter contact sheets from 216 browser screenshots.

The active aerial-medium and aerial-heavy samples were corrected to frames
17 and 20 respectively; earlier samples were in recovery. Both facing
directions were re-captured and inspected. Wall samples cover walk, dash,
kick, special and downward-throw victim poses at both arena ends.

All 16 also ran at normal playback speed with sampled walk and kick frames.
These are screenshots captured during 1x playback, not a continuous video
review of every frame. Walk samples cover different portions of each group
and do not prove every reversal visually. The deterministic geometry probe
separately checks walk, reverse and stop for every pair in both facings.

Before carrying the evidence into the integration branch, all 32 paired
body entries and their runtime PNGs were compared with the frozen review.
Thirty bodies had unchanged PNGs; Sproto 3181's lead had updated breathe and
sweep/recovery frames, and both 3181 bodies gained assist images. Every
paired body gained a signature-cast mapping. The integrated browser was
therefore rechecked for every pair's cast and special at center and walls,
both facings. Sproto 3181 additionally received new idle, sweep, recovery,
walk, kick, back-throw and down-throw-victim samples in both facings.
The new 3181 assist sequence is owned by the separate partner task and is
not covered by the ordinary-cameo check.

Actual game-page checks on port 5187 selected and launched Duo in practice,
used keyboard movement, kick, W jump, dash and close-range grab, and observed
the attached hand contact. A distant grab missed. The release trajectory is
covered by the controlled review scenarios, rather than claimed from the
single live catch screenshot. Yannix was then selected in the real match:
the beam visibly originated at his forehead, damaged Morelight by 52 HP,
worked facing right and left, and stayed horizontal during a jump. Browser
console inspection returned no warnings or errors for these interactions.

All 16 P1 paired selection previews were individually inspected in the
integrated menu. The second layout correction moves the previews into
separate side lanes and narrows the central caption so it cannot cover tall
hair/head silhouettes. No combat scale changed. Nick, Captain Sproto, High
Sproto and Vaudream were visually checked in the portrait grid. Desktop
screenshots establish this coverage; this pass does not claim mobile UI QA.

The full paired-fighter matrix is [PAIRED-QA-COVERAGE.csv](PAIRED-QA-COVERAGE.csv).
Representative screenshots, contact sheets, capture records and asset
comparison are under `docs/evidence/2026-11-02-paired-integration/`.

## Automated verification

- `npm run check` and `npm run build`: passed.
- `npm run qa`: passed, including 15 throw groups, 8 reaction groups,
  43 directional-spit groups, story checks, six broad scripted QA groups
  (11,236,320 simulation frames), and 510 per-fighter mechanical cases
  across the 102 installed fighters. These counts do not establish art
  quality or human game feel.
- `node scripts/pose-atlas-smoke.mjs`: nine groups passed.
- `node scripts/duo-smoke.mjs`: 13 groups passed.
- `node scripts/selection-menu-smoke.mjs`: eight stub-DOM/controller groups
  passed after correcting its stale renderer mock.
- `node scripts/yannix-smoke.mjs`: seven groups passed.
- `node scripts/paired-spacing-probe.mjs`: 32 pair/facing movement scenarios
  passed with no frame-dependent packing drift and at least six world pixels
  of silhouette clearance.
- `git diff --check`: passed before the final checkpoint.

## Limits and pending integration

This pass verifies sampled states and reported defects; it does not certify
every frame, matchup, input timing or subjective movement feel. No physical
controller test was performed, as requested. The complete 102-fighter roster
was tested mechanically but not individually re-reviewed visually in this
pass. The animation still uses authored whole-body pose sequences, with some
shared timing and Canvas transforms/effects; these are not full generated
animation videos. Small companions on 3181 and Nosmileclown are intentional.

The shared authoring checkout was preserved. Main must wait for final story,
UI, stage-lane, twin-display, partner-assist and roster deltas. The completed
100-encounter progression branch is queued, including its later testing-mode
follow-up. See [INTEGRATION-CHECKPOINT.md](INTEGRATION-CHECKPOINT.md). No merge
to main, remote push, paid generation or publication was performed here.

## Additional preservation check

The installed Sproto 943 core, walk and event assets were compared with the completed flat-trousers correction: all 72 PNG hashes matched. The three source contact sheets were inspected and no protruding crotch shape was observed. This checks those 72 assets, not later entrance/defeat frames from the separately completed roster update.

An incorrectly named live-capture record was corrected: `integration-live-group1-*` screenshots show group 1 (Duo, 282, 704, 832), not Sproto 3181. They must not be used as evidence of live 3181 sweep review. The separately recorded deterministic 3181 samples remain correctly attributed.
