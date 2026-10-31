# Sprite QA — final seven fighters

Inspected actual-renderer sheets at asset/renderer revision `b4f2374b071f3eec`: 32 base poses, 57 combat poses, and 16 paired throw poses in **both orientations** for each of Dumpstar, Crapto, VAMP, Alpha 777, Bitcoin Mandela, Big Swole and Little Foot Nate. Total: 1,470 sampled pose/orientation cases. This is visual inspection of rendered snapshots, not a claim that every intermediate animation frame was watched.

Files: `art/higgsfield/processed/runtime/{id}-poses.png`, `-poses-mirrored.png`, `-combat.png`, `-combat-mirrored.png`, `-throws.png`, `-throws-mirrored.png`.

| Fighter | Findings and recheck |
| --- | --- |
| Dumpstar | Yellow shirt/red tie, blue face, brown trousers retained; shoulder objects absent. Original folded fist removed from shirt. Both hands extend independently; collar, waist and limbs remain joined in sampled attacks, jumps and throws. |
| Crapto | Yellow goggles/red irises, blue bare body, red mouth retained. Found neck gap in earlier live heavy/walk poses; source-color neck bridge closes it in final sheets. Torso no longer contains the original fist. Raised and extended arms, both facings and all throws remain connected. |
| VAMP | Narrow eyes, blue feline face, yellow collar/trim and black clothing retained. Earlier fragmented shoulder/elbow cutouts now have bounded underlying joints; no detached part or ghost hand in final sampled states. |
| Alpha 777 | Olive face, blue goggles, red scarf, striped shirt/red shoes retained. Earlier transparent elbow gaps closed. Stripes change orientation at the articulated joints and hidden shirt areas use flat source-color fills; those seams remain a cutout-art limitation, not duplicated hands. |
| Bitcoin Mandela | Long blue head, glasses, yellow necklace/shoes retained. Original white/black background and projecting background rays removed. Head, neck and limbs remain connected through tilt, guard and throws. |
| Big Swole | White eyes, red nose, red neck ring, crescent earring and muscular blue build retained. Two independently moving arms; no stationary chest fist. Dense source muscle/outline texture remains visible at joints but no separated limb in sampled states. |
| Little Foot Nate | Blue face, yellow hood/spikes and outfit, red grin retained. Short proportions preserved. Hood/head join and hands/feet remain attached in kick, raised-arm special, hit and paired throw snapshots. |

Coverage includes idle, three walking phases, rise/fall, crouch, dash, hit/block, all 12 move types at startup/contact/recovery, directional light/medium/heavy/launcher/air attack samples, four spit directions and three special phases. Paired throw sheets cover forward/back/up/down, attacker/victim, hold/release. Earlier throw audit sheets mislabeled every direction because the harness pressed grab before the directional chord; that **test harness defect** was caught visually, corrected with an actual-direction assertion, and all final throw sheets were re-inspected. Forward/back/up/down trajectories are now distinct in the evidence.

No new detached/duplicated limb, missing neck, lost face feature or unwanted backdrop was found in final sampled states. Flat patches under occluded hands and occasional rotated texture seams remain; a single generated guard pose cannot supply unseen clothing detail. Runtime browser motion and complete gameplay sequences are tracked in `ART_QA.md` separately.

## Individual-kit follow-up — revision 24495940b540c6d6

After individual combat profiles and choreography replaced the shared-kit shortcut, reopened all seven fighters' `combat` and `combat-mirrored` sheets (57 cases per facing), plus `specials` and `specials-mirrored`. The latter sample each fighter's own contact schedule at -3/exact/+3 frames plus anticipation/recovery: 11 each for Dumpstar/Crapto/VAMP/Mandela/Nate, 20 Alpha 777, 8 Big Swole. Total new reviewed cases: 964. Both arm chains, neck joins, leg connections and preserved appearance were checked; no new detached/duplicated limb was seen in these samples. Big Swole's overhead two-arm slam differs from VAMP's open-arm pulses, Alpha's alternating bursts, and Nate's low pounces. The original hidden-surface and rotated stripe/muscle texture limitations still apply. Earlier baseline movement/throw findings above are historical; this follow-up does not claim every intermediate frame was manually inspected.
