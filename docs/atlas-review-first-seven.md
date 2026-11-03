# First seven 32-pose atlases: independent visual review

Date: 2026-10-31. Scope: `rivet`, `bront`, `zephyr`, `mox`, `rune`, `guest07`, `guest08`. **224 complete pose cells inspected individually across seven actual raw sheets**, not inferred from a shared skeleton or a script pass. All original reference pixels were previously inspected individually for `SPRITE-REWORK-DESIGN.md`; this review compares the actual new sheets against those identities and `character-briefs.json`.

No image/reference edits or generation performed. This is raw-sheet visual review before normalization, not browser playback approval. Numbering below is **zero-based, row-major, four columns × eight rows**, matching `import_atlas.py` SLOTS. Thus slot18 is row5/column3; slot23 is row6/column4.

## Verdict

**Do not approve this seven-character batch as finished.** Connected whole-body poses substantially avoid the earlier cutout-rig detached-neck/duplicate-limb problems, but identity simplification and specific incorrectly authored action cells remain. Walking is a separate known pipeline failure: slots2–5 in every reviewed sheet show essentially the same leading-leg contact stride, not a useful near-contact/pass/far-contact/pass sequence. Minor pose differences do not constitute opposite-leg travel. Repair the walk cycle without using this finding to reject otherwise usable anatomy cells.

No clearly detached neck/head or obvious third limb was found in the inspected cells. This limited positive finding does not override the rejections below. Most raw sheets show colored halos over black in the file viewer; sampled corners have alpha0/1, so that preview alone is NOT evidence of an opaque black backdrop. Recheck actual compositing/edge alpha during normalization before accepting transparency.

## Per-character findings and rejected states

### Golden Sproto — `rivet`

**Coverage:** all slots0–31, with focused inspection16–19 and22–23. Yellow skin, green heavy eye surrounds, white eyes, black nose, red lips/scarf/tie, yellow shirt collar and black suit remain identifiable throughout. Limbs and head are connected;18 is a clearly extended grounded kick with guard separated above it.16/17/19 are distinguishable chamber/partial/recovery poses, though17 is shallow.

**Reject/repair:** slot23 `airKickFull` remains a lowered/bent leg with no strong straight striking extension; it reads more like a fall than the full active kick demanded by the slot. Slots2–5 need genuine walking as above. Identity fidelity concern (medium): original broad round eyes/large pupils have become much narrower sleepy eyes consistently across the sheet; retain more of the original eye opening and muzzle volume if revising face. This is not an eye-count or color failure.

**Other cells:** punch12, uppercut15, sweep20, grab26–28 and release30 are readable complete gestures.31 is a single advancing punch, consistent as one CROSSCURRENT contact sample; it does not prove four-punch animation coverage.

### Fat Head Dave — `bront`

**Coverage:** all slots0–31; focused16–19/22–23. Buff blue body, red/blue head split, asymmetrical yellow eyes, red muzzle/ring, yellow shoulder and red/yellow side ornaments retained. Ground kick18 extends with continuous hip-to-foot anatomy; thick arms remain distinguishable from chest. No duplicate arm or neck gap identified.

**Reject:** slot23 `airKickFull` has BOTH legs tucked/bent like another chamber; no extended kicking leg. Replace with an actual full airborne kick. Slots2–5 walk repetition.

**Other cells:**29 low squat/gather,30 upward heave and31 overhead clasp are recognizably heavy power gestures.31 is anticipation for the slam, not the downward impact; integration must not claim it is a completed impact frame. Face is simplified but retains the identifying color split/asymmetrical eyes; no whole-sheet identity rejection.

### Halloween 2008 — `zephyr`

**Coverage:** all slots0–31; focused16–19/22–23. Swept blue head, long throat, yellow eyes with red irises, red smile, yellow collar, red outfit and oval chest accent remain consistent. Mini pumpkin companion correctly absent; no baked projectile.16–19 are a coherent chamber/partial/extended/recovery chain.22 is a chamber;23 shows a connected diagonal downward extended air kick. No structural rejection in these kick cells.

**Repair:** slots2–5 walking. Face fidelity concern (medium): lower chin/throat and large lip silhouette are compressed compared with original, but primary identifying eyes/palette/collar survive.31 is a low two-handed finish rather than a whole multi-beat HARVEST MOON sequence; acceptable only as a selected endpoint, not proof of all special animation stages.

**Other cells:**15 upward launcher,20 sweep and26–28 open-hand reach/hold/release have connected anatomy;29/30 read as underhand preparation and upward lob, matching pumpkin action without baking a pumpkin.

### Yannix — `mox`

**Coverage:** all slots0–31; focused16–19/22–23. Indigo color, yellow neck band, black buttoned vest, black nose and lean body retained. Grounded kick18 is connected and separated;16/17/19 readable. No detached limbs seen.

**Identity rejection across0–31:** original broad shaggy cheek/chin construction and prominent few pointed teeth are reduced to a small smoother profile chin and tiny dot-like teeth; far eye largely collapses into the near profile. Result is recognizable by costume/palette but insufficiently faithful to the distinctive original face. Reauthor head with more cheek/chin tufts, separated fang shapes and original broad angular muzzle, without adding a second head or changing body.

**State rejection:**23 `airKickFull` is still a sharply bent knee/lower-leg pose rather than clear full extension; replace active kick. Slots2–5 walking.

**Other cells:**30/31 long finger-led thrust/lunge suit ECHO DRIVE. Face fidelity repair should preserve those connected body gestures.

### Bongraker — `rune`

**Coverage:** all slots0–31; focused16–19/22–23. Intentional two fused faces retained: white-eyed red-nosed side face, yellow-eyed second face and two different mouths. One body/two arms/two legs, black formal outfit and pale collar. This unusual facial duplication is correct and must NOT be removed. Head/neck remain joined, including hit24.

**Costume continuity rejection:**17 `kickHalf`,18 `kickFull`,20 `sweep` show BLUE terminal foot/toe shapes attached to black trouser legs, whereas ordinary cells and recovery19 show dark shoes with gray accents. This is a frame-to-frame footwear/skin mutation, not acceptable shading. Make footwear consistent in those cells.18's leg connection itself is good.

**State rejection:**23 `airKickFull` reads as two lowered/bent legs rather than a deliberate extended kick; replace with clear contact pose. Slots2–5 walking.

**Other cells:**29 curled palms,30 open-hand release,31 two-hand push suit NIGHT BURST at a single-sample level; no orb/partner baked in. Both faces survive these gestures.

### Juicy — `guest07`

**Coverage:** all slots0–31; focused16–19/22–23. Blue wrinkled body/head, swept spikes and yellow eyes retained. Ground kick18 and diagonal air kick23 have connected extended legs; no duplicate limbs identified.16/17/19 and22 are distinct enough for chamber/contact progression.

**Identity rejection across0–31:** original large layered angular red muzzle, clear central projecting nose ridge, heavy protruding lip folds, broad cheek and long wrinkled throat are reduced to small generic horizontal duck-like lips on a narrow head. Forehead wrinkles alone are not enough identity preservation. Reauthor head/lips at adequate pixel resolution; do not normalize to Crapto-like narrow lips or generic mascot face.

**Gesture rejection:**30 `powerRelease` reads as an extended fist/punch, not the requested forward arcing mouth-spit. The mouth stays in essentially neutral closed lip form; author a visible spit-release facial/torso gesture without baked liquid.31 rising fist/knee is appropriate for CITRUS RUSH. Slots2–5 walking.

### Yoyo — `guest08`

**Coverage:** all slots0–31; focused16–19/22–23. Yellow spikes/skin, huge eyes, white scarf and red outfit retained. Yellow exposed arms correctly replace prior unsupported red gloves. Ground kick18 has continuous anatomy;16/17/19 read as chamber/partial/recovery.

**Identity rejection across0–31:** original small triangular RED nose and THREE large separated rounded white teeth are missing/reduced; sheet has an undifferentiated red muzzle with two tiny fang-like white points. Restore nose, original tooth count/spacing/roundness and broad upper-muzzle smile. Do not substitute a two-fang creature.

**State rejection:**22 `airKickChamber` is already a full horizontal extension;23 `airKickFull` instead has lowered/bent legs. These are wrong action stages, not a valid chamber→extension. Reauthor22 as bent-knee chamber and23 as deliberate full kick (do not simply assume swapping will solve contact anchors). Slots2–5 walking.

**Other cells:**26–28 hand reach/hold/release connect;30 outward palm and31 spread arms can represent ring release/pull endpoints without a drawn ring. Full return choreography still requires playback review.

## Coverage ledger

For EACH of the seven IDs above, inspected:0 guard;1 breathe;2 walkNear;3 passNear;4 walkFar;5 passFar;6 dash;7 jumpAnticipation;8 airRise;9 airFall;10 crouchLanding;11 punchWindup;12 punchExtended;13 punchRecover;14 upperWindup;15 uppercut;16 kickChamber;17 kickHalf;18 kickFull;19 kickRecover;20 sweep;21 sweepRecover;22 airKickChamber;23 airKickFull;24 hit;25 block;26 grabReach;27 grabHold;28 throwRelease;29 powerCharge;30 powerRelease;31 special.

Only supplied right-facing raw atlases reviewed here. Mirrored gameplay, foot-anchor stability, animation timing, actual hitbox alignment, browser compositing and transitions remain for integration QA. No claim that all21 or all4896 previous rig snapshots are covered by this atlas review.

## Source provenance

SHA-256 of inspected raw files (before any later normalization/regeneration):

- `art/pose-atlases/raw/rivet-32.png`: `abdd66f9fa357328fc1b54e75df7f8099135bcfa807ad6aeab6625cc195b6d12`
- `art/pose-atlases/raw/bront-32.png`: `c2676096c7a256f607a9c5dc5b54fe3a19a8a10b0013573a3be06615305c6fc1`
- `art/pose-atlases/raw/zephyr-32.png`: `85d67bda34441e30a8c659a41d1609d7f4f80b084cebd1cf8d8ce784e4a0ac6d`
- `art/pose-atlases/raw/mox-32.png`: `786a9e4c53727f3a736f5f8830009f36b92adb95cfcdeffe4508f29b373fd8da`
- `art/pose-atlases/raw/rune-32.png`: `e5bffc5eec2382abeb28b0bf735e551b115632a0d407957a917cae69fd03b58a`
- `art/pose-atlases/raw/guest07-32.png`: `e50b0d94ae6986a5a0297c6a44b8b0fc7b31ef0cd87c393a32a8d84044392d68`
- `art/pose-atlases/raw/guest08-32.png`: `74243322e2fde05ae4f876a3b2603152201049a2840dd7485993c1ea9f49269d`
