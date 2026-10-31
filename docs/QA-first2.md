# Distinct-kit animation follow-up

Current renderer revision: `24495940b540c6d6`. This supersedes the shared-kit animation baseline below.

All 21 fighters now have authored per-ID guard positions, gait lift/stride, primary strike, kick and casting combinations, plus explicit Team Special choreography. Specials read their exact contact frames from core `COMBAT_STYLES`; no duplicate timing table is maintained in the renderer. Bront has a one-handed rising knee/hammer, distinct from Big Swole's two-handed overhead lift/slam. Other examples include Golden Sproto alternating strikes, Morelight's two-hand beam stance, Yoyo's outward/return sweep, and Mandela's pull/release motion. IK geometry and source-derived joint supports remain unchanged.

New visual inspection: **278 first-two combat/special samples** (57 combat × 2 fighters × 2 facings, plus 14 Golden Sproto and 11 Morelight special samples × 2 facings). Special samples cover anticipation, each actual contact at -3/exact/+3 frames, and recovery. No newly disconnected joints or stationary baked fists were observed. Also reviewed all 21 idle/first/middle/final special contact overviews; these overviews are a spot-check, not an exhaustive all-roster visual audit. Other batch owners review the remaining detailed sheets. The regenerated Bront special sequence was additionally inspected after separating its choreography from Big Swole.

The new `runtime/audit.json` records **4,896 snapshots**, zero draw errors, and validated core-driven forward/back/up/down throws. `runtime/motion-checks.json` confirms all 21 still update to contact before freezing through eight sampled hitstop frames. Golden Sproto stance-foot maximum drift is approximately 0.00000245 pixels over 85 comparisons; Morelight's new shorter stride produces approximately **0.15530 pixels** over 85 comparisons. Both are below one world pixel. `npm run check` passed.

Evidence: `runtime/{id}-specials[-mirrored].png`, `runtime/{id}-combat[-mirrored].png`, and `runtime/choreography-group{1,2,3}.png`, all under `art/higgsfield/processed`. Contact sheets verify sampled pose appearance; live animation feel and gameplay balance require the integrating agent's browser checks. Single-view cutout texture limitations described below remain. No access blocker.

---

## Historical shared-kit baseline

# Golden Sproto / Morelight rig audit

Renderer and asset revision: `b4f2374b071f3eec`. Internal fighter IDs: `rivet`, `vela`.

Visually inspected the final actual-renderer contact sheets for both fighters in both orientations: 32 movement/defense/attack/special samples, 57 combat samples, and 16 paired throw samples per orientation. Total: **420 sampled rendered states**. Evidence is under `art/higgsfield/processed/runtime/{rivet,vela}-{poses,combat,throws}[-mirrored].png`.

The 57 combat samples include startup/contact/recovery for all 12 shared moves (including low and sweep), plus up/upForward/down variations for seven directional non-projectile attacks. The base samples also cover all four projectile aims and special frames 12, 27, 42, and 65. The 16 throw samples cover attacker and victim, hold and release, for forward/back/up/down. Throw scenes advance the real combat core and assert its selected direction; other pose samples deliberately set combat state to inspect the renderer.

Observed in these samples: source faces and defining costume/body colors remain intact; no stationary source guard fist remains painted into either torso; necks, shoulders, elbows, hips, knees, and wrists remain visibly connected. Extended attacks have an identifiable reach, kick poses separate from punches, and directional throw releases differ. Hidden-source palette fills can show texture transitions during extreme bends, particularly across dark clothing outlines. These are articulated cutouts from one generated view, not individually painted multi-view animation frames.

## Motion checks

`runtime/motion-checks.json` records checks using the actual renderer:

- All 21 fighters change from anticipation to the active contact pose on the first hitstop frame, then retain byte-identical rendered pixels through the remaining frozen frames (eight sampled frozen frames per fighter).
- Golden Sproto: 85 consecutive planted-foot comparisons; maximum world-space joint drift approximately 0.00000245 pixels.
- Morelight: 86 comparisons; maximum drift approximately 0.03734 pixels.

These foot measurements inspect the transformed stance-foot attachment, not every antialiased edge pixel. The gait uses world travel distance and source leg proportions.

## Reproduction and scope

Run `python3 art/higgsfield/processed/build_rigs.py`, compile the rig/core into `/tmp/higgsfield-rig-qa/build` with TypeScript, then run `node art/higgsfield/processed/render_rig_qa.cjs` and `node art/higgsfield/processed/check_rig_motion.cjs`. The temporary native Canvas dependency lives in `/tmp/higgsfield-rig-qa`; it is not a game dependency. `npm run check` passed after the final visual inspection.

`runtime/audit.json` records 4,410 rendered snapshots for all 21 fighters, with zero draw errors. This document claims visual inspection only for the first two; the remaining fighters are covered by the other batch audit notes. Earlier audit harness bugs (special phase indices treated as raw frames, and throw direction pressed after the grab) were corrected before these final sheets. Contact sheets sample selected times and do not establish every possible transition or hardware/browser behavior. Live browser/gameplay verification is recorded separately by the integrating agent. No outstanding access blocker.
