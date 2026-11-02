# Sprite scale and registration review

Run this gate for **every body of every new character**, including companions and summoned partners, before adding the character to the selectable roster. Also run it after changing the atlas importer, renderer, anchors, dimensions, collision rules, or installed images. A clean numerical audit is necessary; anatomical and contact review remains necessary too.

## Repeatable audit

From this repository, with Node dependencies installed and Python 3 + Pillow available:

```sh
npm run sprite-scale-qa -- --out /tmp/sproto-scale-before
# Make the intended change, then compare against the captured evidence.
npm run sprite-scale-qa -- --out /tmp/sproto-scale-after --baseline /tmp/sproto-scale-before/report.json
```

The audit reads local source and installed PNGs. It does not edit art, metadata, game source, or Git state. `--out` writes only its requested report directory. Exit status is nonzero for a hard failure. Baseline changes and artwork heuristics are review items rather than automatic failures: intentional artwork replacement is allowed, but each unexpected changed body or state must be explained.

Outputs:

- `summary.md`: complete body inventory, declared scales, walking-envelope comparisons, floor offsets, and failures.
- `report.json`: audit/source/manifest hashes; every body and sequence; actual runtime coverage and composed scale/pivot-offset ranges; every cell's image hash, source dimensions, anchor, decoded alpha bounds and source-oriented world envelope; advisory flags and baseline changes.
- `frames.csv`: the same per-cell geometry and image identity for sorting or filtering.

The audit automatically discovers the roster and all installed body atlases. It checks both facings of every installed main, walk and event cell, including older installed clips shadowed by richer clips. It separately exercises the real runtime selection and drawing path: all ages of all moves and four aims; walk/backstep, dash, jump, crouch, block; reactions at center and both edges; entrance, defeat and victory; frozen/ghost drawing; paired bodies and real assist placement.

Hard checks cover decoded image dimensions, transparent padding, nonempty RGBA art, finite geometry, opaque-bounds enclosure, contact-hull extent registration against actual alpha, valid source anchors, the full composed Canvas draw matrix, uniform atlas scale without shear, authored facing, source-anchor registration, floor-rest support, and hand/torso metadata agreement with the core's throw grips for each facing's front body. Rendered/control simulations then compare complete combat states each tick across contact, whiff, guard, ranged, special and forward/back throw scenarios for every playable character and facing. This includes positions, reactions, active move data, projectile origin/velocity, damage and meter. Rendering must not alter them.

Direct cell sampling invokes the actual renderer's private paint function through a test-only in-memory export. No source file is changed. Actual runtime selection is tested separately and its coverage count is reported, so drawing a superseded asset does not imply the game selects it. The audit also rejects a run if the source or manifest changes while it is running.

## Authoring contract

`public/fighters/pose-atlas.json` and `src/poseAtlas.ts` define the runtime contract. A body supplies exactly one positive `scale`, or `worldHeight / canonical atlas height`. This canonical source-pixel-to-world scale applies to **all** its main, gait and event drawings. A per-cell canvas height is not a request to resize its body. Per-cell `scale` and `worldHeight` are unsupported.

An independently drawn source sheet can have a different pixel density or root origin. A reviewed `clipRegistration` entry may correct that source geometry with a constant `pixelScale` and `[x,y]` `anchorOffset` for the entire clip. The renderer applies the same calibration to its image dimensions, bounds, contact hull and anchor. Keep the PNG and raw metadata in original source coordinates; the audit records both the calibration and resulting world geometry. This is not permission to fit individual poses to their opaque bounding boxes. Use head/torso landmarks and neutral support positions, retain before/after evidence, and document any remaining proportion differences that one uniform transform cannot fix. Clips from the same sheet should share their measured calibration unless independently justified. The loader rejects unknown clips, nonfinite values and densities outside 0.5–2.

Choose the body's scale from an approved neutral reference using anatomical landmarks, then keep the head, torso, joints and limb thickness consistent across drawings. Preserve intentional perspective and foreshortening. Do not independently normalize each sheet or pose to its total opaque height or width: a taller weapon, raised arm, hair, flying debris or a low kick can change that envelope without changing body size. If the weapon needs more room, expand the transparent canvas and update its source anchor, dimensions, bounds and contact hull together.

The source `anchor` is the authored foot/root registration point. Without an intentional motion offset or reaction rotation, the renderer maps it to the rounded simulation `(fighter.x, fighter.y)` using the body's fixed scale and authored facing. A crop must compensate its anchor by the same source-pixel crop translation. Recompute opaque bounds and contact hull from the final PNG; stale geometry can cause bad floor or wall placement during knockdown even when normal standing art looks correct.

The floor-offset report is `(actual alpha bottom − source anchor Y) × scale`. Zero is useful for a grounded support pose. It is not a universal rule for jumping, hovering, lifted feet, recoil or authored effects. Inspect the relevant planted foot or intended support surface, not merely the lowest opaque pixel. The script checks that the renderer honors the authored anchor; it cannot decide whether an artist chose the right anchor.

The rotated floor-rest check decodes the actual alpha hull and measures complete pixel squares. Installed contact hulls use both pixel-origin and pixel-boundary conventions, so the allowed penetration is one transformed source-pixel footprint plus half a world pixel of translation rounding; visible clearance may not exceed that half-pixel rounding. This is a numerical raster-registration tolerance, not permission for a visibly hovering pose. The report retains the measured `visibleFloorDelta` ranges.

Every provided contact hull's coordinate extents must also agree with decoded opacity within one source pixel, accommodating those two conventions. This detects hulls left in an old canvas or scale after a PNG is resized/re-anchored. The baseline comparison includes `contactHull`. The extent check does not prove that every interior edge of a hand-authored polygon is correct; regenerated hulls should be checked against actual alpha, and floor behavior remains independently tested.

Reaction rotation/pivots, a hovering ram's travel, assist choreography and paired-body spacing deliberately translate or rotate complete bodies. The scale gate allows these while rejecting deformation. Effects have independent sizes and are omitted from the body-scale assertion. Selection portraits deliberately fit their display area and are not a world-scale reference.

## Required visual and contact evidence

Before acceptance, retain the approved neutral reference, source images, import settings, before/after hashes, the numerical report and a compact review record for every new or changed body. The record must identify the reviewed frame/sequence, facing, intended pose/effect change, and reviewer conclusion. There is no universal automated anatomical approval.

1. At fixed runtime zoom and a visible floor line, compare neutral ↔ first/last gait frame, forward/back walking, stop-to-guard, dash recovery, jump/landing and crouch transitions. Inspect head and torso size, neck/hip position and supporting foot in both facings. Do not judge body size from a portrait fitted to a box.
2. Inspect every attack from windup through active contact and recovery, including ground/air versions, directional aims, casts and special contacts. Compare unoccluded head/torso landmarks, allowing actual lean, rotation and foreshortening. A kick's reach, a weapon's sweep or a spell's extent is not evidence of a size change.
3. Play entrances, recoil, throws, knockdowns, get-up, defeat/victory and assists at normal speed, then step suspicious transitions. Verify floor registration, wall handling, stable companion identities/spacing, hitstop and return to guard. Retain intentional event transformations explicitly in the record.
4. Verify visual contact against the real simulation at startup, first/last active frame and recovery, with near/far opponents, standing/crouching guard, both facings and edge positions. Confirm projectile release landmarks and throw hand/torso contact. Repeat for each companion and partner involved in the action.

The existing `/art/pose-atlas-lab.html` supports Full motion review, facing, arena position, aims, opponent choice, normal/slow playback and frame stepping. Its mirrored panel and main-slot gallery help inspect registration. It does not replace actual match review of event presentation and team choreography. “Review complete” means the scenarios played; it is not visual approval.

The combat core currently uses numerical range/vertical conditions, `bodySpread`, and projectile radii. It does not derive per-pixel hitboxes or hurtboxes from sprite alpha. Passing replay equality proves the renderer cannot change those rules. It does **not** prove that a painted fist or blade visually aligns with every contact threshold. Review contact explicitly; do not resize a whole fighter to make one extended weapon match a range rule, and do not silently alter combat geometry as an art correction.

After fixing a finding, rerun the audit and the relevant existing movement, reaction, throw, paired or projectile checks, then `npm run check` and `npm run build`. Compare reports to ensure unrelated bodies/states did not change. Inspect at actual game scale again. Record unresolved artwork limitations plainly; do not mark anatomical continuity approved from numerical passes alone.

## Admission into the character creation pipeline

Use an isolated candidate for new characters. Capture the current installed report before importing. Assemble the candidate's complete body manifest and roster registration, run the numerical gate there, and review its anatomical/contact evidence before integrating the candidate. Every selectable ID and assigned partner must resolve to installed body atlases; the gate fails on missing bodies. An unselected newly staged body still receives the complete installed-cell checks, but it does not receive playable simulation coverage until registered in the candidate roster.

The package command `sprite-scale-qa` runs the audit, and the normal `qa` acceptance command includes it. Preserve a report with `npm run sprite-scale-qa -- --out <directory> --baseline <prior-report.json>`. A successful import or installer message alone is not acceptance. The `qa` command plus type/build checks is the automated integration gate; the visual record establishes which anatomical and contact decisions were actually reviewed.

The shared normalizer is `art/sprotos-expansion/process.py`; several named-character processors import it. Its historical `128 / first opaque height`, optional `scaleFromFrame`, and later whole-sheet fit can produce different anatomical sizes between independently generated core, walk and event sheets. Its `report.json` retains `uniformSourceScale` and now adds `scaleReview`: requested/applied source scale, fit ratio, canvas limit, scale basis, reference frame, calibration status and the outstanding anatomical-review requirement. Equal raw scale factors across different source drawings do not prove matching bodies. Inspect the designated head/torso reference for each sheet. Upright stance versus guarded stride, crouching and perspective are separate pose decisions, so a taller total envelope alone must never trigger a shrink.

For calibrated new imports, retain the intended anatomical source scale and its reference landmarks. An explicit numeric `scale` in the corresponding `anchors.json` entry is now protected against later fit reduction. Existing `scaleFromFrame` precedence is retained; mark an inspected frame-based choice with `"calibratedScale": true` to protect it too. If padding or a weapon would require reducing that calibrated scale, the processor raises an error with the requested scale, proposed fit and ratio **before writing normalized frames**. Expand/re-register the canvas in the import workflow or explicitly revise the inspected calibration; do not remove the flag merely to silence the error. Uncalibrated estimated imports retain their historical fit behavior and remain marked for anatomical review. Existing cached outputs are not automatically reprocessed, and no blanket art rewrite is performed.

Installers are not one shared transaction: expansion, named batches and identity actions have separate scripts, some of which copy public images before changing the manifest and roster source. Do not run historical bulk installers merely to exercise this gate: they can overwrite later targeted corrections. Integrate and test the staged candidate as one reviewed change, retain originals, and use report hashes/baseline changes to identify any unrelated replacement.

## Known diagnostic example: Jessica

Jessica is `sproto1815`. Her runtime uses the same declared source-pixel scale for idle, movement and attacks. The investigated artwork nevertheless showed a much smaller blue head in walking frames: approximately 27–30 × 34–36 source pixels versus 48 × 54 in neutral. The upright halberd made both whole silhouettes roughly 128 pixels tall, concealing the body difference from a total-height comparison.

The report includes a narrowly scoped Jessica blue-head diagnostic: alpha > 128, blue > red + 40, blue > green + 20, then the largest 8-connected component. It reports component area and bounds relative to the neutral frame. This is an advisory reproducible cue for her unoccluded neutral/gait drawings. Rotation, occlusion, detached components and color changes can invalidate it; inspect the images. It must not be generalized into a normalization rule for other bodies or effects. The captured report, not these historical example measurements, describes the currently installed files.

The original Double Take walk is the opposite example: its taller stride envelope initially looked suspicious, but an inspected red-body eye stayed 12 × 13 pixels in guard and gait. That pose change was preserved. A different ranged sheet enlarged the same eye to 18 × 19 and required correction. Named anatomical landmarks distinguish these cases; a blanket opaque-height threshold cannot.

## Verify the review fixture itself

`npm run motion-review-smoke` exercises the atlas lab's actual 52-scenario itinerary for every registered fighter in both simulation facings. It checks that named attacks really start, guard demonstrations actually block, directional grabs actually catch, held jump does not repeat, and each scenario recovers. This prevents a whiff or an omitted aerial move being mistaken for reviewed behavior. It is a fixture/functional check, not visual approval; real-match entrances, KO/victory and full partner effects remain separate.

For the reviewed Gryph/Nosmileclown contact-cel correction, `npm run aerial-kick-art-smoke` checks the real renderer through preparation, both active phases and recovery. It pins the visually inspected full-kick sources. A six-slot clip may deliberately reuse a drawing for a contact hold; document its number of distinct drawings instead of calling it six newly authored frames. If those source images change, inspect them again and update the review record deliberately.

The additive `/art/motion-roster-lab.html` runs four independent copies of those real-core fixtures at a fixed camera scale. Use actual facing controls to inspect both twin leads. `node scripts/motion-roster-lab-smoke.mjs` verifies fixture equivalence; it does not approve the images. Record captured versus actually inspected samples separately, and retain unobserved transitions as gaps. Use an isolated checkout and disable development-server hot reload during a long review so another task's file writes cannot reset the scenario or facing unnoticed.

For the November 2 reviewed repairs, run `npm run motion-fix-smoke`. It validates installed mappings and source hashes through actual renderer phases; it does not certify visual quality. `npm run motion-visual-coverage` summarizes the explicitly recorded individual browser observations and gaps in [the current review](MOVEMENT-LIVE-REVIEW-20261102.md).
