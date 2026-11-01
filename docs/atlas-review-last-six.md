# Independent review: last six whole-pose atlases

**Disposition: not approved as finished movement sets.** This is a raw-art review, not a runtime animation, extraction, foot-anchor, transparency-cleanup, or gameplay approval. No art assets were edited.

## Exact coverage

Opened the actual pixels of all six source atlases at `art/pose-atlases/raw/{crapto,vamp,alpha777,mandela,bigswole,nate}-32.png`, each 2336 × 3504 pixels. Compared their faces and attire with the actual original references `crapto.png`, `vamp.png`, `alpha777.png`, `bitcoin-mandela.png`, `big-swole.png`, and `little-foot-nate.png` under `art/references`.

Inspected every visible pose in each complete source sheet: 32 in five sheets and **33 in Big Swole**, for 193 visible whole-body poses. Checked all requested slot positions 0–31 and the extra Big Swole final-row pose. Reopened enlarged details for VAMP's extended kick, all five Big Swole final-row poses, Mandela's spike silhouette, and Nate's teeth. References and selected details were also composited on a light background to distinguish dark anatomy from the raw dark/glow presentation.

An initial diagnostic equal-cell crop produced neighboring feet at cell tops and clipped legs at cell bottoms. That was a review-crop artifact: the full raw sheets show those bodies intact. Consequently **do not treat naive equal 4 × 8 slices as verified extraction boundaries**. Root's extraction/anchor review remains necessary.

## Defects requiring action

| Fighter | Identity / anatomy observations | Walk 2–5 | Kick 16–19 and air 22–23 | Grab 26–28 / power observations |
|---|---|---|---|---|
| Crapto | Blue unclothed body, yellow goggles with red pupils and red lips remain recognizable. Complete shoulders, torso and two legs are visible in the source poses; no floating cutout joints observed. | Four variants retain essentially the same rightward leading-leg silhouette. Missing a clear passing pose and opposite-leg contact. **Needs replacement walk sequence.** | Ground chamber, partial extension, full kick and retraction are distinguishable. Air chamber/extension are distinct. Bare blue foot at full extension is very simplified but continuous with the leg. | Reach, inward hold and forward release are distinguishable. Charge, spit posture and arms-wide special are distinct. This does not verify held-victim placement in the game. |
| VAMP | Sleepy yellow eyes, blue face, dark-red mouth, yellow collar/cuffs and black outfit preserved. The source reference's facial expression remains readable. | Same leading-leg repetition; no convincing near/far passing alternation. **Needs replacement.** | **Slot 18 fails footwear/anatomy continuity:** the black trouser limb terminates in a blue clenched-hand-like shape, with no black shoe/yellow trim. Enlarged pixels confirm this is not merely a reduced thumbnail. Slot 17's terminal form is also weak/rounded. Slot 23 does show a yellow-trimmed shoe, making the ground-kick inconsistency clearer. Require a corrected authored ground kick, particularly 18. | Reach/hold/release differ. Slot 31 is very close to a neutral arms-down stance; it provides little distinct special-action silhouette beyond the power-wave gesture in 30. Flag as a weak semantic fit, not a unique finished special animation. |
| Alpha 777 | Green face, blue eyeglass/eye surrounds, yellow eyes, red nose and scarf, striped shirt, dark trousers and red shoes preserved. Whole torso/limbs remain connected. | Leading foot remains on the same side across all four poses; arms vary more than leg contacts. **Needs replacement.** | Chamber, partial extension, full red-shoe kick and retraction are visibly distinct; air kick also changes chamber to extension. Striped sleeve continuity is authored into each whole pose, without the old disjointed stripe-cutout problem in these raw views. | Reach/open hands, closed hold, and forward release are distinct. Charge, pointing release and arms-wide special provide separate silhouettes. |
| Mandela | **Black radial spikes remain around the upper/back head**, rather than being reduced to a plain hood. Blue face, yellow slit pupils, red nose/lips, yellow mouth ring/collar and pendant motif persist. The spike silhouette was confirmed on a light composite. | Same forward leading leg in 2–5; insufficient pass/contact alternation. **Needs replacement.** | Chamber, half extension, full yellow-foot kick and recovery are distinguishable; air chamber/extension retain both legs. | Reach/hold/release differ. Crossed-arm charge and forward/upward palm releases are distinguishable. Dark spike visibility and alpha after extraction must be rechecked against dark stages. |
| Big Swole | **White eyes with black pupils and gold earring are retained** throughout the raw sequence; red nose/collar, blue broad muscular chest/arms/legs remain recognizable. No detached torso/limb component observed. | Same leading-foot pattern despite arm changes. **Needs replacement.** | Chamber, half-extension, full kick and recovery exist, and air chamber/extension differ. The terminal blue foot in 18 is quite blocky/fist-like; less categorical than VAMP because this character is barefoot, but it deserves a toe/ankle silhouette review at runtime. | **Sheet has 33 poses:** final row contains throw release, low charge, forward two-arm thrust, overhead raised fists, and low ground slam (five bodies). Slot 31 cannot be assigned by an unchecked 4-column grid. Root must explicitly choose and document a 32-frame mapping or replace the sheet. A possible reviewed mapping would omit the redundant forward thrust and retain overhead raise/ground slam as 30/31; this suggestion is not an asset edit or approval. |
| Little Foot Nate | Yellow suit/radial points, round blue face, yellow eyes, black nose and red lips retained. **Pale-blue/cyan teeth are visible**, verified in an enlarged source detail. Compact full-body proportions remain consistent. | Same rightward lead leg throughout; no authored passing/opposite-contact sequence. **Needs replacement.** | **16 and 17 are near-identical chamber poses**, so the requested kick-half frame is missing in practice. 18 is extended and 19 retracts; air 22/23 are distinct. Needs an actual intermediate extension at 17, not a duplicate chamber. | Reach/open hands, closed hold and release differ. Low charge, pounce-like release and low special posture exist. The last two are subtle variations, so their readability must be judged in timed playback. |

## Required follow-up

1. Replace the walk quartet for all six with an explicit near contact → near passing → far contact → far passing guide, retaining body/face proportions. Do not approve matching forward-leg poses because they occupy different slots.
2. Correct VAMP's kick footwear, author Nate's missing half-extension, and resolve Big Swole's 33-to-32 frame mapping explicitly.
3. After extraction, play persistent real-core walk, dash, jump, every attack phase, grab/throw, hit/block and specials in both facings. Check foot contact/scale consistency and actual source-slot ordering. This raw review does not establish any of those runtime results.
4. Recheck Mandela's black spikes after transparency cleanup and on the ranch background; preserve white eyes/earring for Big Swole and cyan teeth for Nate throughout any replacements.

The whole-pose construction avoids the previous runtime limb-cutout seams in these raw images, but that improvement does not resolve the listed pose/animation defects. No blanket anatomy or animation pass is given.

## Reviewed source fingerprints

SHA-256 prefixes identify the exact source bytes inspected; later replacements require review.

| File | SHA-256 prefix |
|---|---|
| `crapto-32.png` | `273715b77a09c917` |
| `vamp-32.png` | `dbf68463c5940a6f` |
| `alpha777-32.png` | `8f337213c0d5d564` |
| `mandela-32.png` | `2f65c3ae8e1f12a0` |
| `bigswole-32.png` | `e65f917f43e50fc9` |
| `nate-32.png` | `668312791ac3329f` |
