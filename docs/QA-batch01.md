# Rig visual QA — batch 01

Reviewed: Fat Head Dave (`bront`), Halloween 2008 (`zephyr`), Yannix (`mox`), Bongraker (`rune`), Juicy (`guest07`), Yoyo (`guest08`).

## Evidence and exact coverage

Runtime revision inspected: `22f98f73aabbd9f3`, as recorded in `art/higgsfield/processed/runtime/audit.json`. The sheets were rendered by the actual compiled `src/higgsfieldRig.ts` using native Canvas. This review visually inspected every cell of both `{id}-poses.png` and `{id}-mirrored.png` for all six fighters: **384 pose/orientation snapshots**. The harness's reported 1,344 successful renders covers the full roster; that number is not a visual pass by itself.

Per fighter, both orientations include these 32 snapshots:

- Idle 0; walk 4, 12, 20; jump 12; fall 25; crouch 20; dash 10.
- Light startup/active/recovery samples; medium, heavy and launcher active samples.
- Bolt level, up, up-forward and down active samples.
- Air light, air medium and air heavy active samples; grab active; hit 15; block 12.
- Special frames 12, 27, 42 and 65.
- Throw hold/release and victim hold/release samples at frame 6.

Also inspected original reference pixels, generated source pixels, 15-part contact sheets, transparent bind composites, source alpha statistics, and all six segmentation configs. Each config has 15 nonempty polygons with source-bounded coordinates and valid 128-grid pivots.

## Per-fighter record

| Fighter | Original-reference checks | Runtime findings and recheck |
| --- | --- | --- |
| Fat Head Dave | Red/blue split face, asymmetric yellow eyes, blue lower face/red grin, yellow shoulder accent and vertical yellow/red beads retained. | Both 32-state sheets inspected. Face and bead shapes remain intact. Shoulder pads follow the arm segments; no obviously detached elbow/knee or duplicate central fist in inspected poses. Source lower-body muscles are generated interpretation because the supplied reference is a bust. |
| Halloween 2008 | Blue swept spines, half-lidded yellow eyes/red irises, red smile, red outfit/yellow collar and green/white chest detail retained. Separate mini pumpkin deliberately absent. | Both sheets inspected. Original guard fist was removed from torso before this revision. Raised arm, kick and special samples show clean chest, connected limbs, intact collar/emblem. Conjured pumpkin game effects are outside this isolated rig review. |
| Yannix | Blue-purple head, narrow yellow eyes, black nose, fangs, beard, yellow collar and black torso stripe/white spots retained. | Both sheets inspected. Guard hand and shared arm outline removed from torso. Thin arms/legs remain connected in sampled extensions and air poses. Beard stays part of the intact head; chest spots remain on torso. |
| Bongraker | Both faces remain one coherent head: side white eyes/open red mouth and forward yellow eyes/red lips; black suit, cream collar and red tie retained. | Both sheets inspected. Folded hand removed from suit torso. Both faces and tie survive raised-arm and victim-rotation samples. Short legs and suit are distinct from the tall fighters, not stretched into another character's proportions. |
| Juicy | Blue wrinkled head/neck, yellow eyes, layered red lips and unclothed blue body retained. | **User-reported baked arm defect reproduced in source cutout and repaired.** First hand subtraction removed the fist center but left a dark guard-arm arc. Explicit erase of source region x371–524/y520–686 plus exact sampled blue fill removes that arc. Rechecked enlarged current torso and every runtime cell in both orientations: no stationary torso fist/guard outline when arms lift, extend, recoil or enter throw poses. Face wrinkles remain intact. |
| Yoyo | Yellow spines/skin, yellow round glasses, yellow eyes, red muzzle with spaced white teeth, white scarf and red outfit retained. | Both sheets inspected. Glasses/teeth/scarf remain intact; hands and feet attach during kick, launcher, guard and victim rotation. Yellow shoe shapes remain separate terminal parts. |

## Repairs and source limitations

All six sources have RGBA alpha, but their nonzero foreground alpha is partial rather than 255, and faint glow reaches image edges. Preprocessing uses the original alpha threshold plus semantic masks, not the source glow as a cutout. No source-character edge clipping was seen. Bind and runtime composites show no rectangular glow background.

Guard poses occlude torso pixels. Torso source contamination from head/arms/hands is subtracted, with small flat fills sampled from visible skin or garment colors underneath. These are documented hidden-surface repairs; missing original details cannot be recovered. Juicy's head/face and pelvis do not contain the original central fist; the persistent defect was in the torso cutout.

## Remaining coverage before an unrestricted “all animations passed” claim

The original 32-state review has now been supplemented as recorded below. Coverage remains sampled rather than every animation frame.

These are deterministic snapshots, not continuous browser playback. The parent owns browser movement, transition, planted-foot, gameplay effect, and sustained throw verification. This child has no browser available (`browsers: []`), so it does not claim browser motion verification.

## Interactive reproduction tool

`/art/higgsfield/quality-lab.html` displays all roster rigs in 260×240 cells with pose, aim, facing, actual-frame scrub, per-fighter startup/active/recovery samples, animation pause, optional skeleton overlay, light/dark backgrounds and grid PNG export. It includes low/sweep/air attacks, hit/fall/dash, all special stages, and paired hold/release throw samples in forward/back/up/down directions. Inline module syntax was checked with `node --check`.

## Expanded combat and throw inspection — revision 059eb829aa8792c0

Visually inspected both `{id}-combat.png` and `{id}-combat-mirrored.png` for all six: 57 cases per orientation, 684 additional combat snapshots. These cover startup/contact/recovery for light, medium, heavy, low, sweep, airLight, airMedium, airHeavy, launcher, bolt, grab and special; plus up/up-forward/down contact samples for light, medium, heavy, launcher and all three air normals. A harness bug initially treated special phase indexes as literal frames; corrected `special-phase` cells now display distinct warmup, strike and raised-arm recovery poses.

Also inspected the original expanded `{id}-throws.png` and mirrored sheets: four directions, attacker/victim, hold/release at frame 6 (192 snapshots). These synthetic-state sheets visibly exercised distinct directional releases. Later end-to-end core-driven replacements are being checked separately; their first version had a harness input-order defect and must not be counted as a directional pass.

| Fighter | Expanded findings |
| --- | --- |
| Fat Head Dave | Shoulder accents and bead line intact; full kicks, raised hands and victim tilts stay connected. |
| Halloween 2008 | Collar/emblem remain clear when fists leave the chest; kick limbs and throw rotations remain joined. |
| Yannix | Narrow joints stay joined in kicks and raised strikes; beard, collar and white torso spots retained. |
| Bongraker | Both faces, suit lapels and tie survive directional strikes and thrown-body tilt; no extra suit fist. |
| Juicy | Repaired torso remains free of the stationary fist/guard arc through all expanded attacks, raised-arm special and synthetic directional throws, both facings. |
| Yoyo | Glasses, scarf, teeth and shoes remain intact; no extra red fist on exposed chest. |

No new source-mask correction was indicated by these inspected samples. Earlier base32 coverage remains tied to its explicitly recorded revision.

### Corrected core-driven throw recheck

Final rig revision `b4f2374b071f3eec`. Reopened and visually inspected all six fighters' corrected `-throws.png` and `-throws-mirrored.png` sheets after the direction-chord fix: 16 cases per orientation, 192 snapshots. Each includes forward/back/up/down, attacker/victim, hold/release at frame 6. The runtime harness now asserts the simulated core throw direction matches its label. Distinct overhead/backward, upward and downward releases are visible; source faces, accessories, limb connections and torso repairs remain intact in these samples. No new mask defect observed. This closes the sampled directional-throw coverage gap; it does not claim every trajectory frame or continuous browser transition.

Unique reviewed sample cases for this batch are 64 base + 114 combat + 32 throws per fighter = 210, or 1,260 across six fighters. Historical base revision and expanded revisions remain recorded above; repeat rerenders are not added to this unique-case total.

## 2026-10-31 — distinct-kit follow-up, revision 24495940b540c6d6

This is a fresh visual review of the new character-specific pose profiles, not a carry-forward of the earlier shared-kit pass. Reopened all six `-combat.png` and `-combat-mirrored.png` sheets (57 cells each, 684 snapshots), plus all six `-specials.png` and `-specials-mirrored.png` sheets (138 snapshots). **822 snapshots visually inspected at this revision.** No core or renderer edits were made during this follow-up.

Combat coverage: startup/contact/recovery samples for light, medium, heavy, low, sweep, airLight, airMedium, airHeavy, launcher, bolt, grab and special; additional up/up-forward/down contact samples for light, medium, heavy, launcher and all three air normals. Special sheets sample the individual contact schedules with nearby frames and ending recovery. Exact visible special-frame labels, each inspected in both facings:

| Fighter | Special frames | Findings |
| --- | --- | --- |
| Fat Head Dave | 13,15,18,21,37,40,43,58 | Compact raised guard and knee-led first strike change to a broad rear-arm swing and lowered forward hand. Bead line, shoulder accent, wrists and knees stay attached. |
| Halloween 2008 | 9,11,14,17,25,28,31,39,42,45,60 | Raised knee and overhead hand alternate with across-body guarding/casting poses. Red outfit, collar and chest emblem remain intact; no extra chest fist. |
| Yannix | 7,9,12,15,17,20,23,25,28,31,33,36,39,41,44,47,62 | Extended hand alternates with compact two-hand chest-level attacks; narrower upright silhouette differs from the other five. Thin wrist/elbow/leg connections remain continuous, beard and white spots intact. Pose differences are subtle in isolated contact samples; full motion cadence is not proved by these sheets. |
| Bongraker | 13,15,18,21,33,36,39,45,48,51,66 | Early tucked hand gives way to a wide two-arm gesture and raised rear hand. Both faces, cream collar and tie remain intact through these stages. |
| Juicy | 7,9,12,15,23,26,29,39,42,45,60 | High arm/knee-led strike changes into a forward chest-height extension and raised-arm return. Exposed torso stays clean: original stationary guard arc/fist does not return in either facing. |
| Yoyo | 10,12,15,18,27,30,33,42,45,48,63 | Open rear arm and extended leg alternate with closed hands near the scarf; later open-arm phase and lowered recovery are distinct. Glasses, teeth, scarf and shoe attachments survive all sampled poses. |

No new clipped face, detached joint, duplicate static torso hand, or missing accessory was found in these samples. Combat sheets visibly vary guard height, kick geometry and casting posture among the six. Some adjacent contact-minus/contact/contact-plus samples intentionally hold very similar poses; this review does not establish continuous timing quality, every animation frame, combat balance, or the visual distinction of game effects. Base movement/gait and directional throw checks above remain historical revision checks and were **not** repeated for this follow-up. Parent owns the current continuous browser and core-effect verification.
