# Sprite body-scale diagnosis and corrections

Candidate: `/Users/kenhiraoka/Documents/Codex/2026-10-31/task/sproto-combined-readiness`.

## Exact cause

Jessica is `sproto1815` (`src/core.ts:141`). The atlas renderer has one stable source-pixel scale per body. `loadAtlas` resolves `cfg.scale` once, and `paint` draws each full image through that same scale. Per-frame bounds affect floor reactions/formation geometry, not body fitting. There is no runtime pose-dependent resize causing this defect.

`art/sprotos-expansion/process.py` independently derives a common normalization for each source sheet from the complete first silhouette. It includes held weapons and effects in that silhouette, and can further reduce the whole sheet to fit its widest pose. This preserves within-sheet proportions but does not establish consistent anatomical size between independently generated sheets.

Jessica demonstrates why alpha height cannot prove anatomical consistency: idle and original walk both occupy 128 vertical pixels, but the walking halberd extends above the head. The blue head changes from 48×54 pixels to 27–30×34–36 pixels. Main attacks retain approximately the idle head size; returning from the small walk makes attacks appear to grow. The original walk also has different head-to-leg proportions, so uniform enlargement cannot reconcile all landmarks.

## Installed corrections

- Jessica walk now uses the four existing complete main poses 2–5. These are an actual near/pass/far/pass loop holding the halberd horizontally. There are four unique drawings; no claim of eight unique frames. `walkCycleDistance:112` and the renderer's signed travel phase remain unchanged. Backward movement reverses the same loop. The original optional eight drawings are retained on disk.
- Jessica's 32 event drawings use one inspected factor, 1.28, around the old foot root. This is based on the unoccluded blue-head and body-crown landmarks, excluding the halberd: event intro head40/body101 versus main head54/body127. Corrected intro is head51/body129. All frames use the same factor, including lunges, swings, recoil, and lying poses; there is no per-pose height fitting.
- Corrected event images are new files under `public/fighters/events/sproto1815/scale-body-128/`. Their 384×384 canvas and explicit anchor `[160,300]` preserve the full weapon/effect footprint. Original 256×256 images remain unchanged. All opaque source colors survive the nearest-neighbor upscale, and alpha bounds/contact hulls were recalculated from the actual corrected pixels.
- Jessica's main poses and identity entrance/death/ranged drawings remain unchanged; their anatomy is already much closer to main. They were reviewed in `jessica-all-installed.png` and the correction contact sheet.
- Sun god (`sproto2616`) had a similarly undersized optional walk. Its supposed eight-key walk also contains thrust, overhead, sweep and aerial attack drawings. The existing main poses2–5 are a coherent walking loop at main-body size, so they replace that optional sequence. All original files remain on disk.
- Retainer (`sproto2789`) also has four non-walking drawings in the optional eight: staff thrust, overhead swing, downward staff and jump. Its existing main2–5 form a coherent stride at main-body proportions, so they now provide the four-key walk. Original eight drawings remain on disk.
- Both Double Take bodies (`duo`, `duo-blue`) use their coherent original cast4 drawings across the existing ranged8 timing slots as `[0,0,1,1,2,2,3,3]`. These are four unique drawings with intentional holds. The old identity-ranged drawings disproportionately enlarge the head and shorten the legs; a uniform scale cannot correct that anatomy. Original identity images remain on disk. The active release still occupies ranged phase4.
- The same independently generated Double Take identity sheet also changes entrance and death anatomy (and recolors the blue face yellow). Entrance8 now holds each coherent intro4 drawing twice. Death16 uses the six unique complete drawings already in the existing defeat sequence, held over the original timing phases, with lying rest from phase8 onward. `duo-identity-review.png` and `duo-blue-identity-review.png` show the full comparison. These are not claimed as eight/sixteen unique drawings.
- Double Take's original walk drawings are preserved. Enlarged inspection and eye landmarks reject a scale defect: red left eye is12×13 pixels in both guard and walk; blue left eye is14×12 in both. The greater total walking height comes from a straighter stride relative to the bent-knee guard. A provisional fallback remap was reverted before completion.

No renderer, moves, physics, damage, collision boxes, or combat timing changed. The atlas scale remains1.25 for both fighters.

## Pixel evidence

| Character / pose | Before head dimensions | After head dimensions | Main idle reference |
|---|---:|---:|---:|
| Jessica walk | 27–30 × 34–36 | 47–49 × 53–54 | 48 × 54 |
| Jessica event intro0 | 36 × 40 | 46 × 51 | 48 × 54 |
| Jessica special thrust2 | 38 × 38 | 48 × 49 | 48 × 54 |
| Sun god walk | ~34–35 × 38 median | 44–47 × 49–55 | 46 × 52 |

The diagnostic head metric is character-specific: alpha>128, B>R+40, B>G+20, then largest connected blue component. It reliably isolates unoccluded blue heads in these two characters; hands/shaft occlusion and rotation can change its dimensions, so it is not a universal automated acceptance rule. Contact sheets were inspected as well as measurements. Crouched/lunging body height and weapon extension are intentional.

Double Take red provides an independent eye landmark: main guard eye12×13 pixels, original walk eye12×13, distorted identity release eye18×19, replacement cast release eye12×13. The measured yellow-eye area grows from102 to241 pixels in the rejected ranged drawing, then returns to109 in the coherent replacement. This separates a real anatomy change from the intentional taller walking stance. `duo-ranged-before-after.png` shows both corrected bodies and facings.

All corrected Jessica event images have alpha bottom300 matching anchor300; grounded corrected walk images have alpha bottom210 matching anchor210. The full halberd and effects fit inside the new image margins. Both-facing sheet: `corrected-two-fighters-both-facings.png`. Since left-facing is the same full canvas mirrored around the authored anchor, the scale/foot registration is identical in either direction.

## Broader sampling

Inspected representative varied body types include Rivet, Bront, Nate, sun god, the hovering sproto1870, Vaudream, the sproto3181 lead body, tiny nosmileclown companion, Sir Sproto, retainer, sproto1345, sproto943, sproto3215, sproto3152, Captain, High Sproto, Nick, Erik, sproto834, sproto1187, Bimba, GPM, Leviosa and LoadTheBags.

The strongest confirmed defects in this visual sample were Jessica, sun god, Retainer and Double Take's ranged drawings. Sir Sproto (`sproto1011`) has a smaller concern: its walk/event head appears roughly10–14% larger than idle (blue-head idle55×49; walk median60×54). Its full main/walk/event sheet remains coherent and was preserved instead of normalizing minor stylistic/pose variation. Other visible envelope changes include deliberate lean, kicks, cape/weapon extension, hover rotation, and the attached sproto3181 stomach creature; these were not automatically normalized. This is representative visual sampling, not a claim that all149 atlas bodies have been individually approved.

## Verification and changed files

`node scripts/sprotos-expansion-qa.mjs` passes all21 expansion groups, covering retained reference bytes, complete asset load/metadata, two-body playback, both facings, contact damage, bounded lazy loading and expansion-specific mechanics.

The contract now explicitly expects4 walk frames for Jessica, sun god and Retainer and8 for every other expansion body. It asserts the corrected walks equal the reviewed main2–5 sequence, Jessica's unchanged atlas scale, and each event's padded image dimensions, anchor and unclipped bounds. Double Take remains on its original four unique walk keys.

Changed candidate files:

- `public/fighters/pose-atlas.json`: sproto1815, sproto2616, sproto2789, duo and duo-blue values were replaced in place; bytes outside each object were preserved during its edit. Subsequent attack-repair sidecars may add other IDs, separately recorded.
- `public/fighters/events/sproto1815/scale-body-128/00.png` through `31.png`: new corrected event files.
- `scripts/sprotos-expansion-qa.mjs`: explicit per-body walk contracts and Jessica event calibration checks.

Calibration/source hashes, before/after configs, scripts and contact sheets are stored in this diagnostic directory. No model generation, network call, credit spending, upload, Git mutation or shared-main edit was performed.
