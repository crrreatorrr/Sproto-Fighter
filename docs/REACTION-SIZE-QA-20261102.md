# Hit-reaction size audit — 2 November 2026

Fat Head Dave's impact drawing had a smaller anatomical scale than his neutral and falling drawings. A fixed renderer scale did not prevent that source-art mismatch. This pass corrects 14 standalone impact drawings, audits all 131 selectable fighters / 150 installed bodies, and preserves the original PNGs. No generation or Higgsfield credits were used.

## Changes

`src/poseAtlas.ts` accepts a reviewed `poseRegistration` entry for a named standalone pose. It uniformly calibrates image dimensions, anchor, bounds and contact hull together. The correction is fixed when the atlas loads; there is no silhouette-fitting zoom during play. Invalid pose names, offsets and densities are rejected.

`public/fighters/pose-atlas.json` records the following corrections to `hit` (slot 24). Head, torso and limb landmarks were compared with neutral and fall; total opaque height alone was not used. Crouches, lean, rotation and facial expression retain their authored shape.

| Fighter | Hit drawing density |
| --- | ---: |
| Fat Head Dave | 1.22 |
| Juicy | 1.24 |
| Bitcoin Mandela | 1.16 |
| Big Swole | 1.12 |
| Alpha 777 | 1.14 |
| Chode Adoration | 1.14 |
| Virtuagram | 1.08 |
| Dumpstar | 1.12 |
| Crapto | 1.08 |
| Golden Sproto | 1.10 |
| Morelight | 1.08 |
| Halloween 2008 | 1.12 |
| Yoyo | 1.10 |
| Bongraker | 1.10 |

`src/core.ts` updates those fighters' held-torso landmarks to match the corrected art. It also clamps the interpolated throw positions to the existing arena bounds. Testing found a fractional grip could otherwise produce `79.99999999999999` at the `80` wall. Damage, attack timing, speed, projectile behavior and hit-range rules are unchanged. Throw contact positions deliberately change to match the art.

## Actual visual coverage

All 33 browser batches were individually inspected: **131 fighters, both facings, 2,620 phase cells**, including both bodies of all **19 pairs**. Each row contains neutral, light impact, late recoil, launcher impact, apex, falling, heavy-hit tumble, floor rest, get-up and recovered. These come from actual damaging contacts through the combat core and the installed renderer. All rows captured all ten phases with zero crop warnings. Bongraker's batch was recaptured and inspected after its final correction.

The browser fixture uses a constant camera density per fighter and only translates a drawing to keep its silhouette visible. This establishes phase-to-phase size comparisons, not world-root continuity. It is **phase sampling, not continuous human inspection of every frame or every attack animation**.

- [Per-fighter coverage matrix](../art/reaction-size-qa-20261102/per-fighter-coverage.csv) names every fighter, its bodies, both facings and its evidence image.
- [Visual findings](../art/reaction-size-qa-20261102/visual-review.json) distinguish fixes, retained expressions, and additional checks.
- [Evidence index and hashes](../art/reaction-size-qa-20261102/browser-evidence.json) identifies the inspected screenshots and simulation snapshots.
- [Calibration decisions and source hashes](../art/reaction-size-qa-20261102/calibrations.json) pin the exact reviewed PNGs.

Additional fixed-floor browser playback and stepped samples covered Dave, Juicy, Bongraker and Big Swole: launch in both facings, and left-facing heavy-hit flight, floor rest, rise and recovery. Candles, hly3, H.E. ZEPUMP and Solana Del Ray were sampled during launch in both facings, with both bodies visible. The same density was used for neutral and the reacting body. No extra uniform density defect was confirmed in those samples.

Dave's forward victim-throw catch was inspected at center, and Juicy's catch at the left wall with the opposite actual facing. The throw lab's second panel mirrors the same simulation; it is not a separate facing test. Both catches stayed connected to the torso and inside the arena. Automated tests cover the wider throw combinations below.

The normal game at port 5199 was also used: Dave selected against Morelight CPU on Sproto Ranch, versus screen and intro, repeated projectile damage and pushback, left-wall recoil, lethal hit, KO result, and rematch. This is an actual match check in addition to the diagnostic fixtures. An attempted jump/air-medium during repeated hitstun did not establish those controls as checked in that match. A separate standing-dummy run then verified D movement, the W+K upward-medium chord, and W followed by K after takeoff: the actual state showed `airMedium` at y446.7. This was an aerial attack initiation/whiff check, not a successful aerial damage check.

## Automated verification

Passed on the final calibrated core and renderer:

- TypeScript check; production build (also rerun after local integration).
- `reaction-size-smoke`: 786 actual light/launcher/heavy contact cases across all 131 fighters and both facings; all recovered, all ten expected phases were reached. Fourteen calibration/source-hash checks and six invalid-registration cases passed.
- `pose-atlas-smoke`: nine playback/contact/asset-contract groups passed.
- `reaction-smoke`: eight recoil, launch, knockdown, recovery and combo-charge groups passed.
- `throw-smoke`: all 15 groups passed, including 411,864 attacker/victim/direction/facing/position combinations and deterministic replay.
- `sprite-scale-qa`: 15,444 installed cells / 15,308 PNGs / 150 bodies; 30,888 cell/facing draws; 14,726 hull checks; 524 grip checks; 1,080,948 runtime samples plus 89,230 assist samples; 2,882 simulation scenarios / 360,250 ticks. **Zero hard failures.** There are 950 artwork advisories, not 950 automatically accepted visual decisions. Fourteen baseline changes correspond to the corrected poses.

The compact [numerical report](../art/reaction-size-qa-20261102/numerical-summary.json) records hashes, counts, limitations and the local full-report path. The large full JSON/CSV reports remain in the isolated checkout; they were not added to Git. `reaction-size-smoke` is now part of the normal `qa` command, and [SPRITE-SCALE-WORKFLOW.md](SPRITE-SCALE-WORKFLOW.md) documents the source-calibration and visual-review requirements for new art.

## Limits and handoff

This pass addresses hit-reaction resizing. Sparse authored pose transitions still exist. It does not certify every possible attack/contact frame, every character's KO choreography, or overall animation quality. hly3's blue companion and Solana Del Ray's blue companion have facial/hand proportion differences between drawings; inspection did not establish a uniform whole-body density error, so no blanket scale correction was applied. Bitcoin Obama's neck compresses and extends with the pose and was also retained.

Combat uses numerical range/height rules and body spread, not pixel-derived hit/hurt boxes. Render/no-render replay equality proves rendering does not mutate combat state; it does not prove every painted limb matches every numerical contact boundary. Physical controllers were not tested, as requested previously.

Work was isolated in `sproto-motion-followup` on `codex/reaction-size-qa-20261102`, based on local main `11f51fd8`. Integration preserves the other chats' existing story/stage/menu files. No backend work was edited and no remote push was performed. The read-only GitHub inspection found the old public export and twin branch, not Claude's pending backend changes; inspect those changes when they actually arrive before any remote integration.

Local main was fast-forwarded to `f7900e27` for these changes. All 44 pre-existing modified or untracked files were checked by SHA-256 before and after integration and preserved byte-for-byte. They remain separate uncommitted work; this pass did not claim or commit them.

On the combined main working tree, the production build, reaction-size and pose-atlas checks passed again. The selection suite passed 19 checks and the story-flow suite passed 27 checks using their stub DOM / in-memory-save harnesses. The stage-catalog checks verified 73 installed arenas, all 64 story locations and 24 approved panoramas in the selector, seven Ranch variants, and matching preview/fight background mappings. These automated checks are not substitutes for browser inspection.

The combined game was then opened in the actual browser at port 5200: the menu showed 131 fighters and 73 stages, with seven Ranch variants. Fat Head Dave versus Morelight CPU loaded on Dawn Orchard, passed through the versus screen and intro, and reached the KO/result screen after repeated CPU projectile damage. The final QA state was frame 805, Dave at the left boundary with zero health and Morelight as winner. The browser reported no captured console errors. The corrected Dave launch pose was also inspected in the main branch's fixed-floor comparison fixture. Evidence: [main match](evidence/reaction-size-20261102/main-5200-match.jpg), [Dave neutral versus actual launch reaction](evidence/reaction-size-20261102/main-5200-dave.jpg), and [four-fighter reaction fixture](evidence/reaction-size-20261102/main-5200-reactions.jpg).

Run locally from `/Users/kenhiraoka/Documents/Codex/2026-10-31/task/neon-relay` with `npm run dev -- --port 5200 --strictPort`, or use the already running server at **http://127.0.0.1:5200/**. Port 5173 is currently owned by a different project, `metaverse-hub`; it was left untouched. The Sproto server runs as a detached local process, was verified with HTTP 200, and should remain available after this task ends while the Mac stays running. Restart it with the command above if it stops; it is not installed as a login service. Diagnostic pages are `/art/reaction-size-review.html` and `/art/reaction-roster-lab.html`. The fixtures do not alter saved progression.
