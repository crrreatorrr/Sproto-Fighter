# Jump and attack source-pixel scale repairs

Completed in the isolated `sproto-combined-readiness` candidate. The manifest was changed only by `sprite_scale_diagnosis`, using the sidecars below. This task did not use generation, credits, Git, browser automation, or sibling-main assets.

14 bodies received 375 new, distinct RGBA cells. Every original source cell remains in place. All 32 unique drawings in each of the 11 optional motion sheets were retained, including dash and victory; all eight Sproto102 ranged drawings and their sparks were retained. No fallback or reduced-unique-frame sequence was installed.

## Confirmed causes

Two independent source-art problems were present at the same fixed runtime scale of 1.25:

- Motion extraction establishes a sheet scale from the first opaque height. The implementation in `art/sprotos-expansion/process.py` defaults to `128/(b-t)`, while these motion sheets start in a crouch. For Sproto3235, the core sheet's standing source cel is 320 pixels high and uses 0.4; its motion sheet's crouched first cel is 237 pixels high and uses 0.540084388. This enlarged head and torso landmarks throughout the sheet. Equal 128-pixel envelopes concealed the error. Other source-sheet anatomy differences made per-body calibration necessary.
- Fat Head Dave and $BitcoinObama have authored scale variation between core poses and alternate kick art. A shared extraction scale did not make their head, eye, shoulder, and torso features consistent. Dave's air-kick source cels were particularly small. For Sproto102, the optional ranged sheet was internally coherent but larger than its core body.

No adjustment was calculated from the whole alpha bounding box. The fixes use one uniform transform for the entire complete-body cel, based on inspected head/eye and shoulder/torso landmarks. Uniform scaling preserves each drawing's internal proportions, tucks, leans, limb extension, and effects. No body parts were re-rigged or stretched independently.

## Installed correction scope

| Body | Source-pixel multiplier | Changed states / cells | Unique drawings after |
|---|---:|---|---:|
| bront / Fat Head Dave | 1.10–1.42, per inspected pose | Core 8, 9, 16–19, 22, 23, 29–31 | 11 changed, all 32 core retained |
| sproto832 | 0.86 | dash, jump, heavy, airKick, victory | 32/32 |
| sproto832-companion | 0.83 | same five motion states | 32/32 |
| sproto3235 | 0.71 | same five motion states | 32/32 |
| sproto3235-companion | 0.82 | same five motion states | 32/32 |
| sproto3224 | 0.82 | same five motion states | 32/32 |
| sproto3224-companion | 0.87 | same five motion states | 32/32 |
| sproto1499-companion | 0.88 | same five motion states | 32/32 |
| sproto1625-companion | 0.81 | same five motion states | 32/32 |
| gryph-companion | 0.80 | same five motion states | 32/32 |
| godmod3d | 0.79 | same five motion states | 32/32 |
| nosmileclown | 0.84 | same five motion states | 32/32 |
| sproto102 | 0.88 | ranged | 8/8 |
| guest12 / $BitcoinObama | 8: 1.28; 9: 1.17; 22/23: 1.33 | four core air poses | 4 changed, all 32 core retained |

Dave's exact per-slot factors: 8=1.10, 9=1.12, 16/17/18=1.12, 19=1.08, 22/23=1.42, 29=1.12, 30/31=1.22. Light and uppercut cels already have compatible visible eye and shoulder dimensions, so they were retained. Arm occlusion makes red-head area invalid for slots 30/31; their visible eyes and shoulder patches were used instead.

## Landmarks and per-state assessment

Source-pixel examples below are measurements of identifiable anatomical or costume features, not the complete silhouette. Their positions change with the pose; the common world root does not.

| Body / feature | Core or idle | Before offending cel | Corrected measurement / assessment |
|---|---|---|---|
| Dave red head, airRise 8 | 50×39 | 45×36 | 50×40 |
| Dave red head, airFall 9 | 50×39 | 44×34 | 49×38 |
| Dave red head, airKick 22 / 23 | 50×39 | 36×27 / 36×26 | 51×38 / 51×37 |
| Dave near eye | 16×11 | airKick: 11×8 | both air-kick cels: 16×11 |
| Dave yellow shoulder | 20×17 | airRise: 18×16 | airRise: 20×17; airFall: 21×17 |
| Dave near eye, special 30 / 31 | 16×11 | 13×8 / 13×9 | 16×9 / 16×11; occlusion and tilt retained |
| Sproto3235 blue head, jump 0 | 53×45 | 77×64 | 55×46 |
| Sproto3224 companion goggles | 41×21 | 47×25 | 41×22 |
| Gryph companion blue head | 58×57 | 76×68 | 60×54 |
| Godmod3d blue head | 53×42 | 70×49 | 55×39 |
| Nosmileclown blue head | 86×45 | about 102–105×51–53 | selected corrected jump: 86×43 |
| Sproto832 near eye, jump 2 | 21×23 | 24×27 | 0.86 calibration accepted against head and bean torso |
| Sproto832 companion crown | 30×29 | 36×35 | 0.83 calibration accepted against crown, lower face, and chest |
| Sproto1499 companion near eye | 22×21 | heavy: 26×23 | 0.88 calibration accepted against eyes and central blue torso |
| Sproto1625 companion near eye | 17×16 | heavy: 21×20 | 0.81 calibration accepted against eyes and chest costume |
| Sproto102 near eye | 18×18 | ranged: 21×20 | 0.88 calibration accepted against eye, hair, black shirt, and limbs |
| Guest12 blue head width | 43 | airRise 31; airKick 34/36 | about 40; 45/48; neckline posture retained |

State-specific checks were performed for every installed changed cel in both facings:

- **Jump:** head width, eyes or crown, shoulder/chest mass and limb thickness remain compatible with core. Tucked knees reduce the envelope; extended legs and a long neck can make the rise pose taller. Neither was normalized away.
- **Heavy:** head/eye and torso mass were compared to core kick 18. The extended striking leg is allowed to increase width; knee chamber and recovery are allowed to shorten height.
- **Air kick:** chamber and extended poses retain distinct articulation. Dave and Guest12 keep the source's intended lift above the root, rather than forcing a foot onto the ground.
- **Dash:** the same per-body multiplier applies throughout the source sheet. Head, shoulders and torso remain compatible despite the forward lean. All six drawings survive.
- **Victory:** eye/head and chest mass match the body while raised hands, crown and extended stance retain their larger envelope. All six drawings survive.
- **Ranged:** Sproto102 retains all eight phases, hand sparks, arm reach and recovery. Eye, hair and shirt landmarks match core.

The numeric component masks are deliberately character-specific. Blue head masks that join a neck/body and red head masks occluded by an arm are not treated as universal size estimators. The complete decoded component records for Dave and Guest12, and the reviewers' reports, retain this distinction.

## Root, floor, clipping and preservation checks

Every corrected cel uses a padded 416×336 transparent canvas and anchor `[176,274]`. The complete-image nearest-neighbor affine transform is applied around the original `[112,210]` root; the runtime atlas scale remains 1.25. This changes source anatomy scale without moving the world root. Bounds are decoded from the result. Any existing contact hull is regenerated from the corrected alpha; `fallLean` remains appropriate under a uniform transform.

- All 360 motion/ranged cels have exactly zero pixel floor delta relative to their anchor.
- Dave's two aerial kick cels retain a 17-pixel lift after their 1.42 enlargement; the source had a 12-pixel lift. Guest12's aerial kick lift is 16 pixels after 1.33, from 12 before. These are intentional source airborne offsets, not ground drift.
- Other changed cels have floor delta 0 or -1 pixel, matching normal raster edge rounding.
- Every new source cell has at least 62 pixels of transparent edge padding. No corrected alpha touches a canvas boundary.
- All 375 new cells have distinct decoded RGBA content. All recorded original source hashes still match. No original file was replaced.
- Main hit (24), grab reach (26), hold contacts, atlas scale and gameplay rules were not edited by this task.

`repair-validation.json` records every new cell's dimensions, bounds, floor delta, padding, original SHA-256 and corrected RGBA hash. `bront-correction-metrics.json`, `motion-correction-metrics.json` and `guest12-correction-metrics.json` retain source/factor information. `repair-inputs.json` freezes original source URLs and decoded original geometry; the builder helpers read these original inputs, so reproduction does not double-scale already corrected paths.

## Review and evidence

Roster A independently accepted Dave, Sproto832 and companion, Sproto1499 companion, Sproto1625 companion, Sproto102 ranged, and Guest12 after viewing their complete affected states in both facings. Roster B independently accepted all 32 corrected cels for each of its seven bodies in both facings (448 corrected cel views). Its numerical corroboration is in `../roster-b/repair-review.json` and `../roster-b/repair-review.md`. No reviewer requested a scale-driven fallback or further factor change.

Evidence files:

- `bront-jumps-candidate-compact.png`, `bront-attacks-candidate-compact.png` and `bront-jump-attacks-candidate-both-facings.png`. Final sheets have enough space for the long kick tips; the earlier compact-preview crop was a sheet-only issue and has been removed.
- `{body}-all-motion-candidate-compact.png` compares representative source and corrected action cels with core landmarks.
- `{body}-all-motion-after-right.png` and `{body}-all-motion-after-left.png` show all 32 corrected cels for each motion body at fixed world scale and root.
- `sproto102-ranged-scaled-candidate.png` and `sproto102-ranged-after-{right,left}.png` show all eight phases and sparks.
- `guest12-jump-airKick-candidate-compact.png` and `guest12-jump-airKick-scaled-candidate.png` show the four corrected air poses alongside core and both facings.
- Original references were inspected directly; `additional-original-reference-contact.png` records the later five-body reference set. The sources in `art/references`, `art/rework-references/roster` and `art/sprotos-expansion/references` remain unchanged.

The authoritative sidecars are `manifest-patch.json` (Dave only), `motion-manifest-patch.json` (12 bodies), and `guest12-preview-patch.json` (four Guest12 cels). A supplemental metadata-only `sproto102-hull-metadata-patch.json` regenerated eight ranged contact hulls after the original merge; the main motion sidecar and builder now include those corrected hulls too. All 362 changed entries that carry contact hulls were compared exactly against the decoded corrected alpha hull. The earlier Sproto3235 preview sidecar is superseded by the motion patch and should not be applied separately.

This is source-pixel and static framing acceptance. Root owns runtime/browser verification. Existing Gryph companion and Nosmileclown airKick timing/pose-semantic quirks were observed separately: one active source cel resembles a punch/recoil rather than a kick. Their size is corrected here; their original distinct drawings were preserved. No claim is made that uniform scaling fixes that separate action-semantics issue.

Final merged manifest verification: `c69138664410cb24409c0bf10944e29230ef677b1fe4715a89d5bde1e0f3d249`. All 424 supplied frame/clip entries exactly match their sidecars, including unchanged core entries; all 362 corrected hull-bearing entries match their decoded alpha hull. Pixel reproduction passed for all 375 new cells.
