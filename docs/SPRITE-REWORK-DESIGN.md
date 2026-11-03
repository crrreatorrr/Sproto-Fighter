# Full-roster sprite rework: reference-led design brief

## Evidence and scope

Inspected the actual pixels of all 21 original character files listed below individually on 2026-10-31; mapping checked against `ROSTER.md` and `art/roster-manifest.json`. Also inspected all 21 prior standalone Higgsfield bodies in `art/higgsfield/raw/` together, plus the earlier runtime rig audit (12 fighters, 2,136 sampled poses; final targeted four-fighter follow-up, 712 samples). Originals were neither edited nor uploaded. This document specifies fresh complete-body pose atlases, not another segmented cutout rig.

The supplied art is predominantly head/bust imagery. Legs, shoes, body proportions below the crop, and exact material construction are usually NOT evidenced. Proposed completions below are art-direction choices, not claims that the original contains those details. Do not let previous generated trousers, gloves, shoes, musculature or symbols silently become canonical. Use the original as primary visual authority; user-specific overrides take precedence.

## Shared atlas requirements

Create one consistent pixel-art character per atlas, transparent background, 32 whole-body cells on a fixed grid. Maintain identical pixel scale, palette, proportions, face construction and floor baseline across cells. Include the entire body, ears/spikes, hat, hands, feet and clothing; leave padding for extended limbs. No backdrop, scenery, captions, grid lines, shadows baked into the character, extra characters, anatomical diagrams or body-part cutouts. No shoulder props unless explicitly retained below. Each cell is an authored complete pose: hands/feet must have visible anatomical connections, no duplicated resting limbs beneath moving limbs, no floating neck, no pasted head on a different body.

The current production target is a 32-frame whole-body atlas. The architect appends the authoritative ordered 32-frame grid/state contract to each character brief; this document does not invent a competing slot order. Include a genuine changing-leg walk cycle, connected attack anticipation/contact/recovery, and distinct power-charge, power-release and special gestures. The first 16-frame Morelight pilot failed walk/fidelity review and is not an accepted completion. Thirty-two frames still do not by themselves certify smooth transitions or cover every directional attack/throw variation: integration needs an explicit slot/state mapping and practical playback review. Check each active pose against actual reach/hit timing. Author visible rear hands, separated guard and kicking leg, and a readable face; do not simply enlarge or rotate a hand across the eyes. Preserve facial asymmetry deliberately when choosing left-facing art or mirroring.

## Character briefs

### 01 — Golden Sproto (`rivet`)
- **Original:** `art/references/rivet.png`. Golden-yellow spiky feline head with pointed ears, one black inner-ear wedge; green heavy eyelids/eye surrounds; white eyes with large black pupils and white highlights; round black nose; broad deep-red curved lips. Yellow throat, red scarf/neck band, black formal jacket, yellow pointed shirt collar, red tie.
- **Required:** all exposed body yellow; retain green eye surrounds and red lips rather than recoloring the entire face yellow. Continue formal black clothing, yellow shirt and red tie. Matching black trousers/shoes are a reasonable completion, not visible original facts.
- **Prior correction:** standalone body broadly retained the palette and suit. Segmented motion must not compromise jacket/shoulder connections or turn the face into a generic blue/red fighter. Preserve sleepy broad-eyed expression and rounded muzzle, not just yellow spikes.

### 02 — Morelight (`vela`)
- **Original:** `art/references/vela.png`. Rounded cobalt-blue head/body with swept pointed rear outline, thin arched brows, round yellow eyes with black highlighted pupils, exceptionally broad red smiling lips. Lower crop visibly contains another red lip-like two-lobed shape above a yellow patch.
- **Required:** NO CLOTHES. Bare blue cartoon body, blue hands/feet; retain the original's unusual red/yellow torso motif as a body marking, never a shirt, shorts, bra, belt or accessory. Avoid assigning unsupported anatomical meaning to that motif. Keep the broad soft body silhouette distinct from lean Crapto.
- **Prior correction:** prior full body included red chest motif/yellow belly, which is reference-backed, but its precise belly extent is an extrapolation. Do not remove that motif as a supposed generation artifact or add clothing to solve it. Rebuild complete poses so torso detail cannot become a detached or duplicated limb.

### 03 — Fat Head Dave (`bront`)
- **Original:** `art/references/bront.png`. Head split with red spiky left/top area and blue right forehead/lower head; large asymmetrical yellow eyes, black pupils; broad red muzzle/lips; blue lower face/neck; thin red neck ring. Yellow shoulder region and vertical yellow/red rounded ornaments on image-right edge.
- **Required:** explicitly buff and muscular; broad shoulders, thick arms, powerful chest/legs. Retain head color split, eye asymmetry and side ornaments. Blue muscular body with reference yellow shoulder detail is a coherent completion; no extra armor system or new symbols.
- **Prior correction:** prior asset fulfilled muscle request, but avoid smoothing the asymmetrical face into a symmetrical generic hero or treating original edge ornaments as extra detached fists during motion. Keep ornaments attached to costume/side design, not floating.

### 04 — Halloween 2008 (`zephyr`)
- **Original:** `art/references/zephyr.png`. Swept cobalt spikes, long blue chin/throat, half-lidded yellow eyes with RED irises, thin raised brows, red curved grin. Red top with thick yellow rounded collar and small white oval/green center on chest.
- **Required:** main character only; OMIT small pumpkin companion at image-right. Pumpkin-related attacks can have separate pumpkin effects/projectiles, not a permanent extra character. Continue red clothing and yellow collar into a simple full-body outfit; preserve languid eyes.
- **Prior correction:** previous body retained core colors but generic red legs/boots are completion choices. Do not make every cast frame a plain blue fist; provide a clear pumpkin-cast gesture while keeping the companion absent.

### 05 — Yannix (`mox`)
- **Original:** `art/references/mox.png`. Muted indigo furry feline head, pointed ears, shaggy cheek/chin tufts, narrow uneven yellow eyes, black bulb nose with descending line; dark-red open mouth with a few separated white pointed teeth. Slim indigo arms; yellow neck band, dark buttoned vest with large white oval buttons.
- **Required:** lanky/angular posture; indigo palette distinct from saturated blue roster. Preserve wary half-lidded expression, sparse teeth and shaggy jaw. Continue narrow limbs and vest; do not invent bulky boxing gloves.
- **Prior correction:** previous raw body was reasonably faithful but bare lower legs were extrapolated. Ensure vest buttons remain clothing details rather than floating white patches as torso bends.

### 06 — Bongraker (`rune`)
- **Original:** `art/references/rune.png`. ONE fused blue head carrying TWO distinct faces: image-left protruding red nose/mouth with white eyes and yellow surround, image-right round yellow eyes with small dark pupils, blue small nose and large closed red lips. Brow wrinkles and swept blue spikes. Black jacket and pale-yellow collar with small red details at lower crop.
- **Required:** preserve fused double-face geometry, both eye pairs and both mouths in every pose. This is intentional, not duplication to clean up. One body, two arms, two legs. Black formal clothing/pale-yellow collar; lower outfit is extrapolated.
- **Prior correction:** prior raw retained two faces, but tiny atlas cells risk collapsing one into a cheek ornament. Budget more head pixels; do not reduce to one familiar mascot face or spawn a second body.

### 07 — Juicy (`guest07`)
- **Original:** `art/references/reference-07.png`. Blue elongated wrinkled head/throat, swept rear spikes; large yellow eyes with glossy black pupils; many curved forehead and cheek creases. Angular red projecting muzzle with layered protruding lips and a distinct central nose ridge. No clothing visible.
- **Required:** preserve long expressive wrinkled head and heavy angular lips; slim blue body is a reasonable completion, with no unsupported costume. Do not replace lips with a round nose and smooth grin.
- **Prior correction:** previous body kept broad motifs but reduced nuanced lip folds/creases. Previously reported arm overlap makes complete shoulder-to-hand posing essential; no resting fist baked into chest.

### 08 — Yoyo (`guest08`)
- **Original:** `art/references/reference-08.png`. Bright yellow spiky head with small side ear/spiral detail, huge rounded yellow eyes and black pupils, multiple arched brow lines. Large red muzzle with small triangular red nose, dark cheek spots, cheerful open grin and THREE prominent separated white teeth. Thick white neck scarf, red upper garment, yellow visible arm.
- **Required:** keep three-tooth gap pattern, giant eyes, white scarf and yellow skin. Red torso can continue to red lower outfit, but exposed hands should remain yellow unless gloves are deliberately approved as a new completion.
- **Prior correction:** prior raw used red boxing-glove-like hands and red full-body clothing; those are not established by original yellow exposed arm. Rework must not make hand color a silent identity change. Keep scarf white, not generic yellow collar.

### 09 — Red Kev (`guest09`)
- **Original:** `art/references/reference-09.png`. Red spiky round head on red backdrop; yellow oval eyes, large black pupils, tiny dark nose, wide black open grin with rounded white teeth. Thick yellow neck wrap; black top with large curling yellow graphics, white accents and yellow sleeve/shoulder shapes.
- **Required:** IGNORE red background; retain red head. Similar black/yellow patterned clothing, yellow neck wrap. Pattern is a decorative curled motif, not reliably readable text: do not impose a new slogan or numeric logo. Yellow hands/lower clothing were not fully specified by crop.
- **Prior correction:** prior raw rendered chest motif like “233”; avoid claiming that exact numeral is canonical. Preserve red outline separate from transparent background, not a red rectangle. No duplicated yellow chest fist when arms move.

### 10 — Sprotel Bitcoin (`guest10`)
- **Original:** `art/references/reference-10.png`. Blue swept-spike head with round yellow eyes, tiny dark pupils and expressive brow wrinkles; very large round RED nose and thin red closed smiling lips. Red Christmas hat with white scalloped brim and white pom-pom. Yellow collar visible at shoulders.
- **Required:** KEEP CHRISTMAS HAT in every cell, including jumps and hurt; no cropped pom-pom. Preserve oversized red nose relative to narrow mouth. Blue skin; yellow collar. Red outfit/boots in prior art are inferred completions, not visible evidence.
- **Prior correction:** hat survived previous rig; raised fists repeatedly obscured eyes/nose. New uppercut/cast poses should leave the big nose and at least one full eye readable. Neutral rear arm now improved; preserve that readability in authored poses.

### 11 — Chode Adoration (`guest11`)
- **Original:** `art/references/reference-11.png`. Starburst spiked head divided vertically: yellow image-left, pale blue-gray image-right; mismatched yellow eyes with small dark pupils, expressive curled cheek lines, black teardrop nose. Red muzzle, strained white rectangular-tooth grin. Large yellow spiral ear/ornament at image-right; blue neck band, red shirt with green/white pendant design.
- **Required:** exact split palette and anxious asymmetry; do not turn pale blue-gray into saturated cobalt. Preserve spiral ornament and green pendant. Red top and plausible simple lower clothing; hands should follow chosen split-body completion consistently.
- **Prior correction:** previous raw broadly matched face but simplified pendant and chose blue trousers/red sneakers. Those choices may remain only as intentional completions. Guard and high-knee poses previously crowded face/chest; separate them.

### 12 — $Bitcoin Obama (`guest12`)
- **Original:** `art/references/reference-12.png`. Long cobalt head and especially long narrow blue neck; swept spikes with yellow rear inserts and yellow circular ear. Large upright yellow eyes, black highlighted pupils; broad rounded red upper/lower lips. Red round-neck top.
- **Required:** preserve long continuous neck and gentle wide-eyed smile. Red shirt, blue body/hands; lower body is not supplied. Do not shorten neck to ordinary roster proportions or replace rear yellow shapes with random accessories.
- **Prior correction:** earlier rig had baked blue fist on red chest; later removed. New atlas must have exactly two posed arms and clean red shirt, no chest hand. Neck/head attachment must remain continuous across every lean and launcher.

### 13 — Jahon (`guest13`)
- **Original:** `art/references/reference-13.png`. Violet-blue swept spikes, yellow elongated pointed ear, half-lidded yellow eyes with black pupils, distinctive thick RED joined brow arch, wide red muzzle/sly lips, cheek crease. Long blue lower head/throat. Red coat with yellow edge trim and high sweeping collar; oval pale medallion with red center at chest.
- **Required:** elegant long head/neck, relaxed eyes and red brow arch; maintain neck down into open coat. Preserve yellow edging/medallion. Red trousers are a plausible completion, not visible fact.
- **Prior correction:** old rig showed floating-looking head/neck gap and arm duplication; final audited rig repaired continuity. Do not reintroduce gap, conceal it with raised collar, or bake a fist into coat. Upward fist still hides one eye in current samples; move striking arm outside face silhouette.

### 14 — Virtuagram (`guest14`)
- **Original:** `art/references/reference-14.png`. Blue spiky feline head, pointed yellow inner ears; yellow spectacle-like eye surrounds. TWO black pupils in EACH white eye: FOUR total. Round black nose, white muzzle with tiny dark cheek dots, thin red smile; thick white neck wrap, black formal jacket and white chest shapes with small orange/red clasp.
- **Required:** four pupils remain deliberate and legible, not an error to normalize. White muzzle and neck wrap, black outfit, clasp accent; white gloves are plausible continuation but not fully evidenced in crop.
- **Prior correction:** prior raw retained four pupils but small render can merge them. Allocate enough face pixels; keep white scarf separate from white hands so guard does not look like an extra mouth or missing neck.

### 15 — Dumpstar (`dumpstar`)
- **Original:** `art/references/dumpstar.png`. Blue swept head with mild forehead/cheek wrinkles, large yellow eyes, black pupils, distinct small red central nose continuous with red smiling muzzle. Pale-yellow pointed-collar shirt and narrow red tie.
- **Required:** face and attire ONLY; OMIT miniature objects/characters above and behind shoulder. Continue pale-yellow shirt, red tie, simple trousers (brown was prior completion). Bare blue hands, unless intentionally changed.
- **Prior correction:** prior raw correctly omitted shoulder extras. Runtime rear cuff read as a detached blue square because shoulder was hidden; use complete arm silhouette and natural sleeve opening. Do not add shoulder companions to fill empty atlas space.

### 16 — Crapto (`crapto`)
- **Original:** `art/references/crapto.png`. Lean blue bare upper body, swept pointed head; oversized yellow circular goggle/eye rings with RED irises, dark pupils and white highlights; small green temple piece. Very long horizontal red lips with slightly raised right corner. Narrow neck/shoulder transition; no clothes.
- **Required:** bare blue body, no costume; preserve goggles/red irises, broad thin lips and small green temple accent. Lean build, not Morelight's rounded torso or Big Swole's muscles.
- **Prior correction:** previous raw retained motifs, but all-blue arms merged with torso in rig. Separate limbs through silhouette and small coherent shadow tones, not invented gloves/clothes. Upward fist must not replace an iris or hide both goggle circles.

### 17 — VAMP (`vamp`)
- **Original:** `art/references/vamp.png`. Broad deep-blue feline head, yellow inner pointed ears, swept rear tufts; extremely narrow horizontal yellow eyes behind blue angular rims. Small black nose, dark burgundy angular downturned lips, separate thick black horizontal lower-mouth/chin mark. Large yellow neck band; black zip-front jacket with yellow accents.
- **Required:** deadpan narrow-eyed expression, heavy broad muzzle; no cheerful round eyes/red smile. Continue black/yellow jacket into simple dark trousers, preserving blue exposed hands. Do not lose black chin mark against jacket.
- **Prior correction:** prior raw matched main palette but compressed the already narrow eyes; keep enough face resolution to distinguish eyes, burgundy lips and black chin. Black costume must retain silhouette on dark stages without a baked background.

### 18 — Alpha 777 (`alpha777`)
- **Original:** `art/references/alpha777.png`. Olive/light sage-green head with short swept pointed back, forehead creases; thick BLUE goggles surrounding yellow eyes, small dark pupils. Large red nose; wide yellow muzzle outline, red mouth and rectangular yellowish teeth. Red scarf, black/white striped shirt at crop.
- **Required:** green skin and blue goggles, red scarf, striped shirt. Preserve asymmetrical grin and yellow muzzle. Dark trousers/red shoes are prior completion choices.
- **Prior correction:** prior body shortened proportions and used tiny pupils; keep original face dominant. Striped sleeves previously merged into striped torso; author clear elbow/hand silhouette, consistent stripe direction, no extra stripe fragments masquerading as arms.

### 19 — Bitcoin Mandela (`mandela`)
- **Original:** `art/references/bitcoin-mandela.png`. Elongated oval blue face, yellow irises within WHITE sclera and thin blue round spectacle rims; enormous rounded red nose. Yellow ring around two red puckered lips; yellow collar with central pointed fastening/pendant. Black radial spikes with blue triangular details directly around head; small red ear/side detail.
- **Required:** ignore backdrop colors/shapes beyond character; preserve the head's connected radial black/blue spiky silhouette and thin spectacles, not just an oval bald head. Blue attire/body with yellow collar, central fastening. Do not replace collar with a generic loose gold chain. Lower body and footwear are completion choices.
- **Prior correction:** prior standalone kept spikes, but runtime reduced them to a dark rear edge; neckline became chain-like and yellow footwear was invented. New complete poses should preserve radial head outline and exact collar/mouth-ring distinction, not import white/black background pixels.

### 20 — Big Swole (`bigswole`)
- **Original:** `art/references/big-swole.png`. Bright blue long-necked head with swept rear spikes, HUGE WHITE eyes with small black highlighted pupils (not yellow eyes), round bright red nose, long curved red smile. Large yellow crescent earring attached by small red loop; thick red neck ring. Blue shoulders, no garment visible in crop.
- **Required:** white eyes and crescent earring are primary identifiers. Blue body and red neck ring; athletic/muscular full-body completion is reasonable from name/prior art but the explicit buff user instruction was for Dave, not evidence of this cropped body's musculature. Keep Dave visually distinct.
- **Prior correction:** previous raw added very defined bodybuilding anatomy. Do not let muscle detail consume sprite readability or obscure the red ring/earring. Raised blue arm previously covered eye; separate gesture from eyes.

### 21 — Little Foot Nate (`nate`)
- **Original:** `art/references/little-foot-nate.png`. Large blue rounded face ringed by yellow outward spikes, asymmetric huge yellow eyes/small black pupils, small black vertical nose/stem. Broad red grin with PALE-BLUE rectangular teeth. Thick yellow hood/collar and yellow torso at lower crop.
- **Required:** preserve pale-blue teeth, black nose and contrasting blue face/yellow surround. Compact full body in yellow clothing is a reasonable completion; do not turn face yellow or remove hood/spikes. Smaller feet may express name without sacrificing connected readable kicks.
- **Prior correction:** previous rig's yellow boot and glove blended at chest during kicks; latest extension improved it. Fresh poses need visible hip-to-knee-to-boot connection and guard above/outside kicking leg. No glove pasted over grin, no extra stationary yellow fist on torso.

## Acceptance and remaining limits

For each atlas compare idle and every extreme pose with its original: eye count/color, nose, mouth shape/teeth, head outline, ear/hat/ornament, neck/collar, costume, skin color. Check both-facing previews; asymmetrical designs require deliberate mirroring decisions. Verify 32 cells contain exactly one complete consistent fighter each and no clipping, baked extra limbs, background fragments or missing accessories. Inspect menu portrait separately at display size. Then play actual movement/attack transitions with background contrast and effects enabled; still-sheet inspection alone cannot certify animation smoothness.

Prior-art comparison is direct visual inspection of all 21 raw standalone assets plus the documented runtime subset, not a claim that every prior animation frame was reviewed. No external generation, private upload, publication, reference mutation or atlas production happened during this brief. The earlier private-reference-upload permission blocker is resolved: the parent relayed the user’s explicit “yes go for it” authorization for original references, excluding rigging. The parent owns Higgsfield uploads/generation. This task performs no upload or generation. The 32-frame Morelight replacement is in progress according to the parent; neither it nor the remaining roster is claimed complete. Machine-readable per-character identity and gameplay-aligned gesture prompts are in `art/pose-atlases/character-briefs.json`; the parent appends the shared ordered 32-frame contract.


## Implementation status after the brief

The text above records the pre-generation brief. All21 complete-pose atlases have since been generated through Higgsfield using the authorized original references and installed with local corrections. The earlier ownership/no-generation statements describe the brief author’s work only. Current installed scope, actual verification and unresolved quality limits are in [SPRITE-REWORK-QA.md](SPRITE-REWORK-QA.md); use that ledger for acceptance rather than this design target.
