# Independent atlas review — middle seven

Date: 2026-10-31. Reviewed actual pixels of all 32 cells in each of `art/pose-atlases/raw/{guest09,guest10,guest11,guest12,guest13,guest14,dumpstar}-32.png` individually, alongside the corresponding original images `art/references/reference-09.png` through `reference-14.png` and `art/references/dumpstar.png`. Read the seven corresponding identity briefs in `art/pose-atlases/character-briefs.json`.

Coverage: 224 raw full-body poses, right-facing. This is a static atlas anatomy/identity audit, not normalized-import, alpha-mask, mirrored, in-game contact, anchor, timing or motion acceptance. Background glows visible in raw sheets must be excluded during import. No assets changed by this review. Slot numbers are zero-based in row-major order, four columns.

## Shared verdict

The complete-pose bodies are materially better than the previous segmented cutouts: no obvious dislocated arm scraps, triangular support strips or open neck/torso holes were visible in these raw sheets. That is not approval of every animation. **Reject slots 2–5 as a complete walk cycle in every reviewed fighter:** they show variants of the same forward leg/trailing leg arrangement, not opposite contact plus distinct passing poses. Some arm positions vary, but leg support does not alternate. Repeating them will not establish credible locomotion. All seven need actual opposite-leg/passing drawings and subsequent persistent-simulation checks.

Anatomical allowance below means the outline and attached limbs are usable in a prototype, not that proportions exactly match the original or movement is finished. Shared move rows also remain very similar across characters; unique powers require additional choreography/effect review.

## guest09 — Red Kev

Identity: red spiky head, yellow eyes, broad toothed grin, yellow neck wrap and black/yellow attire are recognizable. The original decorative curved chest motif is reduced to number-like marks, varying between forms resembling 33, 30 and curls; original white motif accents are mostly lost. Do not present these as faithful text or a stable logo.

Coverage: cells 0–31 inspected. Guard/breathe, dash, jump/landing, punch, uppercut, crouch/sweep, hit, grab and power rows have coherent attached anatomy at sheet scale. Kicks 16–19 form a clear bent/partly open/extended/retracted leg sequence; air 22–23 show lifted limbs and an extended air kick. No obvious third arm or missing foot observed. Yellow shoulder pattern in uppercut 15 is clothing detail, not automatically an extra fist.

Rejects: walk 2–5 as above. Chest graphics need a consistency pass across all frames if intended to retain the original motif. Other cells provisionally usable anatomically, subject to extraction and motion review.

## guest10 — Sprotel Bitcoin

Identity: Christmas hat with white brim and pom-pom persists throughout all 32 cells, including jump/hit; yellow collar, blue face and red outfit coherent. The original very large red nose and narrow closed smile are reduced in relative prominence; expression is rounder and younger. This is recognizable but simplified.

Coverage: cells 0–31 inspected. Kicks 16–19 show complete hip-to-foot silhouettes and recoil. Air 22–23 include distinct tuck/extension. Grabs 26–28 retain two connected arms; no static duplicate glove visible. Hit 24 keeps hat attached. Both raised hands in special 31 are attached to sleeves.

Rejects: walk 2–5. Conditional identity acceptance only; compare nose-to-mouth proportions at final gameplay scale. No additional severe raw-anatomy rejection found.

## guest11 — Chode Adoration

Identity: yellow/pale-blue-gray split face, black nose, strained white-tooth/red-mouth expression, yellow spiral ornament, blue neck band and green pendant retained. The face is smaller/simpler, but its defining split and anxious expression remain distinct. Both hands are consistently yellow in this completion; the original crop did not establish a split hand palette.

Coverage: cells 0–31 inspected. Full kick 18 has a connected straight trouser leg and complete red/white shoe; 16,17,19 are readable raised-knee variants, though 17 adds little extension. Air 22–23 have visible complete shoes. Grab 26 open palms distinguishable, 27 paired fists close together, 28 lowered reach coherent. Ornament stays next to head, not treated as a detached limb.

Rejects: walk 2–5. Kick 17 is weak as an intermediate, not a disconnected-anatomy failure. Other cells provisionally usable pending anchor/motion review.

## guest12 — $Bitcoin Obama

Identity: long continuous blue neck, swept head with yellow rear inserts/ear, yellow eyes, broad red lips and red shirt retained. Neck varies with compression but no obvious detached head hole visible.

Coverage: cells 0–31 inspected. Ground kicks 16–19 are anatomically connected; 17 remains close to chamber16, followed by a much larger extension18. Grab 26 has two reaching arms, 27 overlaps hands; 28 retains coherent sleeves. Hit24 hand/sleeve overlap is busy and should be checked at native size.

**Reject slot 23 for `airKickFull`: it depicts forward-working arms with both legs bent/down, not an extended kick.** Slot22 is a plausible aerial knee/tuck. Do not map slot23 to a long-reaching airborne kick hitbox. Also reject walk2–5. Require a corrected full air-kick drawing; static cell23 could be reused for a different air hand attack only with deliberate mapping.

## guest13 — Jahon

Identity: half-lidded yellow eyes, red joined brow, yellow pointed ear, long blue lower face/throat, red coat with yellow edges and central medallion preserved. Long coat is a coherent completion. Crucially, **the neck is continuously drawn into the collar in all inspected cells**; the prior cutout detached-neck defect was not visible.

Coverage: cells 0–31 inspected. Punch12 and uppercut15 remain attached through sleeve/shoulder. Kicks16–19 keep coat separate from the working leg; full extension18 is legible. Slot17 nearly duplicates the chamber rather than providing a substantial halfway extension. Air22–23 clearly distinguish raised knee and extended leg. Grabs26–28 have connected sleeves/hands. Crossed arms31 are intentional overlap, not obvious duplicate arms.

Rejects: walk2–5. Conditional timing rejection for kick17 if used as the only intermediate: inspect whether16→17→18 snaps at contact. No severe raw neck/anatomy rejection found; normalized live recheck still required.

## guest14 — Virtuagram

**Identity reject:** original image and brief explicitly require two pupils in each white eye, four total. The new atlas normalizes the eyes to one central pupil per eye in visible poses. Yellow surrounds, pointed yellow inner ears, blue head, white muzzle/neck and black formal outfit survive, but the unusual four-pupil feature is a primary identifier, not optional noise.

Coverage: cells0–31 inspected. No obvious detached neck or duplicate forearm observed. Kick18 has connected black leg and highlighted shoe, but17 resembles a standing guard rather than meaningful halfway extension; sequence may jump from chamber16 through a dropped-leg pose to full18. Air22–23 show airborne tuck/extension. Dark trousers obscure exact knee boundaries at sheet scale; inspect on light and ranch backdrops after extraction. Grab26 hands distinguishable,27 overlaps at chest,28 coherent reach.

Rejects: identity across atlas until four pupils are restored; walk2–5; kick17's role as a halfway extension. These are not fixed by alignment alone.

## dumpstar — Dumpstar

Identity: blue swept head, yellow eyes, pale-yellow collared shirt and red tie retained; no miniature shoulder character/prop appears. Distinct original red central nose and mature facial creases are softened substantially, with nose largely merging into the smile. Treat face fidelity as conditional, not exact.

Coverage: cells0–31 inspected. Punch12 and uppercut15 have complete sleeves/hands. Ground kick16–19 has coherent thigh/knee/shoe progression, with full extension18 clear. Air22–23 have complete legs;23 combines a forward fist and an extended lower limb, so verify intended attack mapping. Grabs26–28: arms attach correctly;27 overlaps the fists heavily and may need clearer hand separation against a held victim. Hit24 connected, release30 connected downward reach, special31 readable extended palm.

Rejects: walk2–5. Conditional facial fidelity and grab27 hand readability. No additional severe raw-anatomy rejection found.

## Required follow-up before motion approval

1. Correct missing identity and semantically wrong poses first: Virtuagram four pupils, Obama airKickFull, all seven walk cycles.
2. Review imported individual PNGs on light/dark/ranch backgrounds: missing interior detail, fringe/glow removal, toe/hat/ear clipping and accidental alpha holes.
3. Author pelvis/support-foot anchors; do not infer stable root solely from lowest-pixel centroid. Compare neutral/breathe and support-foot placement through kicks.
4. Run persistent simulation in both facings at1x and0.25x, including movement reversal, landing, attack startup/contact/recovery and grabs against an actual victim. Compare visible hand/foot contacts to hit regions.
5. Record precise frame failures. Rendering successfully or having all32cells does not establish motion quality or reference fidelity.
