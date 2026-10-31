# Articulated sprite audit — guest09–guest14

Scope: six fighters, actual compiled `src/higgsfieldRig.ts` rendered into native Canvas contact sheets. This is visual inspection of sampled runtime poses, not a claim that every animation frame or browser transition was examined. Parent task owns continuous browser motion checks.

Evidence lives in `art/higgsfield/processed/runtime/{id}-poses.png` and `{id}-mirrored.png`. The initial inspected render revision was `22f98f73aabbd9f3` (`audit.json`); the generator reported 1,344 draws and zero renderer errors across all 21 fighters. Those automated totals do not imply this reviewer visually audited the other 15 fighters.

## Exact sampled coverage

Each sheet contains these 32 labeled cases, inspected in reading order in both orientations:

- idle 0; walk 4, 12, 20; jump 12; fall 25; crouch 20; dash 10.
- light 0, 1, 2; medium 1; heavy 1; launcher 1; bolt-level 1; bolt-up 1.
- bolt-upForward 1; bolt-down 1; airLight 1; airMedium 1; airHeavy 1; grab 1; hit 15; block 12.
- special 12, 27, 42, 65; throw-hold 6; throw-release 6; victim-hold 6; victim-release 6.

Inspection focused on stationary baked hands/arms remaining on the chest or hips while articulated limbs move; head/neck connection; clipped faces, clothing and distinguishing accessories; visibly detached wrists, elbows, hips and feet. The medium/airMedium samples expose the kick leg; launcher/bolt-up expose the raised arm; the three walk samples expose alternate leg positions.

| Fighter | Coverage inspected | Findings |
| --- | --- | --- |
| guest09 — Red Kev | 32 right + 32 left | No stationary yellow fist remains on shirt/hips in inspected strikes, overhead poses, throws or movement. Red spikes, yellow eyes/collar, shirt graphics and gold shoe trim retained. Shirt graphics reverse when facing left, as expected from mirroring the source art. |
| guest10 — Sprotel Bitcoin | 32 right + 32 left | Santa hat, trim and pom retained in every sample. Blue fists move clear of the red torso without a second chest fist. Collar and neck remain joined in jump, crouch, kick, raised-arm and thrown poses. Bulky bent rear arm remains readable as one upper arm/forearm/hand. |
| guest11 — Chode Adoration | 32 right + 32 left | Split-color head, side ornament and green brooch retained. No residual yellow hand on red shirt or blue pelvis visible when the hand lifts or extends. Shoes stay connected in walk, kick, airborne and throw-release samples. |
| guest12 — $Bitcoin Obama | 32 right + 32 left | Reported blue fist on red torso is absent. Rear shoulder placement [48,66] keeps the arm attached; the long blue neck and yellow rear spikes remain intact through tilt and raised arms. No extra static hand appears in the waist during bolt-down or kick. |
| guest13 — Jahon | 32 right + 32 left, rerender revision `059eb829aa8792c0` | Rechecked after neck extension and pivot correction. Long blue neck now continues into robe collar through idle, walk, jump, fall, crouch, dash, strikes, kick, launcher, projectiles, guard, specials and throw poses. No floating jaw or static blue fist visible on robe. Yellow collar and red robe tails retained. |
| guest14 — Virtuagram | 32 right + 32 left | Four pupils, white muzzle/collar, orange brooch and white gloves retained. No stationary white glove remains on black torso/pelvis when arms lift or punch. Neck/head remain attached; shoes and legs remain connected in sampled kicks and jumps. |

## Mask changes and anatomy correction

All six configs remove the original overlapping head/arms/hands from the torso cutout and fill the newly exposed hidden garment area with a source-palette color. These fills reconstruct concealed areas from one source pose; they are not newly recovered garment detail. Torso, head and pelvis were checked visually in the samples above. No additional pelvis/head limb subtraction was applied without a visible overlap defect.

Jahon (`guest13.json`) receives a targeted extra correction: extend the head mask down the actual blue neck to source y508, move the head/neck pivot from grid [65,52] to [68,61], synchronize the torso endpoint, and add a small clipped blue underfill at the collar. This preserves the long neck rather than rotating a jaw-only head above the robe. The reported duplicate chest fist is removed by the torso child subtraction.

Final Jahon evidence uses `guest13-poses.png` and `guest13-poses-mirrored.png` from the expanded renderer output. Total reviewed coverage for this batch: 384 pose/orientation samples across six fighters (plus Jahon pre-fix inspection). The expanded combat/throw sheets are not included in this count.

## Limits

Native Canvas samples exercise the actual rig renderer, but do not prove all inter-frame blending or live browser motion. Browser acquisition in this subtask timed out; the parent explicitly took responsibility for that independent check. No gameplay/core changes are part of this audit. No claim of all-frame coverage is made.

## Supplemental expanded audit by ranch_art

Revision `059eb829aa8792c0`: visually inspected combat sheets in both orientations for guest09–guest14, all 57 cells each (684 additional snapshots). Coverage is startup/contact/recovery for all twelve moves, plus up/up-forward/down contact for light, medium, heavy, launcher and all three aerial normals. Corrected special-phase cells show distinct stages.

| Fighter | Expanded combat finding |
| --- | --- |
| Red Kev | Shirt graphic and shoe trim intact under kick/aim changes; no stationary yellow fist in torso. Mirrored graphic reverses with source. |
| Sprotel Bitcoin | Christmas hat and pom remain attached; blue hands separate cleanly from red torso, neck stays continuous. |
| Chode Adoration | Split-color face, side ornament and brooch remain intact; red sleeve/yellow fist and blue trouser/shoe joints remain joined. |
| $Bitcoin Obama | Long neck remains continuous; rear spikes intact; red shirt has no residual blue guard fist when arms extend. |
| Jahon | Corrected neck remains connected during all sampled attacks; robe edges and yellow trim retained. |
| Virtuagram | Four pupils, collar and brooch intact; gloves leave torso cleanly, black limbs stay attached through kicks. |

Inspected all 192 cells of the first core-driven expanded throw sheets too. Found a harness defect: all four labeled directions produced forward release poses, because direction was supplied after the initiating grab. Reported to renderer owner, who confirmed the initial grab must be chorded with direction and is adding an assertion against the actual core throwState direction. These images showed no new mask/connection defects but do not validate directional throws. Corrected rerender/reinspection completed below.

### Corrected core-driven throw recheck

Final rig revision `b4f2374b071f3eec`. Reopened and visually inspected all six fighters' corrected `-throws.png` and `-throws-mirrored.png` sheets after the direction-chord fix: 16 cases per orientation, 192 snapshots. Each includes forward/back/up/down, attacker/victim, hold/release at frame 6. The runtime harness now asserts the simulated core throw direction matches its label. Distinct overhead/backward, upward and downward releases are visible; source faces, accessories, limb connections and torso repairs remain intact in these samples. No new mask defect observed. This closes the sampled directional-throw coverage gap; it does not claim every trajectory frame or continuous browser transition.

Unique reviewed sample cases for this batch are 64 base + 114 combat + 32 throws per fighter = 210, or 1,260 across six fighters. Historical base revision and expanded revisions remain recorded above; repeat rerenders are not added to this unique-case total.

## Distinct-kit follow-up — revision 24495940b540c6d6

Visually inspected the regenerated `guest09` through `guest14` **combat and specials sheets in both facings**, after per-fighter choreography and contact timing changed. Earlier sections are historical baseline evidence; they are not substituted for this inspection. No core, rig or cutout edits were needed in this follow-up.

Files: `art/higgsfield/processed/runtime/{id}-combat.png`, `{id}-combat-mirrored.png`, `{id}-specials.png`, `{id}-specials-mirrored.png`. Revision and labels verified against `runtime/audit.json`; renderer-wide generation reported 4,896 snapshots and zero errors, independently of this review's smaller visual scope.

### Exact new coverage

For **each** of the six fighters, inspected 57 combat cases per facing (114 total):

- Phases 0, 1, 2 for light, medium, heavy, low, sweep, airLight, airMedium, airHeavy, launcher, bolt, grab and special-phase: 36 cases.
- Phase 1 with up, upForward and down directions for light, medium, heavy, launcher, airLight, airMedium and airHeavy: 21 cases.

Special sheets were inspected at every displayed frame, each in both facings:

| Fighter | Special frames inspected per facing | Combat + special samples, both facings |
| --- | --- | --- |
| guest09 | 7, 9, 12, 15, 21, 24, 27, 33, 36, 39, 54 | 136 |
| guest10 | 11, 13, 16, 19, 23, 26, 29, 33, 36, 39, 43, 46, 49, 64 | 142 |
| guest11 | 15, 17, 20, 23, 37, 40, 43, 58 | 130 |
| guest12 | 9, 11, 14, 17, 25, 28, 31, 39, 42, 45, 60 | 136 |
| guest13 | 11, 13, 16, 19, 29, 32, 35, 45, 48, 51, 66 | 136 |
| guest14 | 7, 9, 12, 15, 27, 30, 33, 45, 48, 51, 66 | 136 |

**Total newly inspected: 816 pose/orientation samples in 24 sheets** (684 combat + 132 specials). Specials include anticipation, each configured contact at -3/exact/+3 frames, and recovery. This follow-up does not claim to re-review the separate locomotion or throw sheets, continuous frame blending, combat VFX, partner presentation, or browser playback.

### Findings

- **Red Kev:** compact chest-level guard, stepping kicks and the alternating reach/close special beats remain readable. No yellow fist remains baked onto the shirt when the articulated hand moves. Collar stays joined under head tilt. Shirt lettering mirrors with facing, an existing source-mirroring limitation.
- **Sprotel Bitcoin:** face-height guard and repeated raised-arm special differ from Kev's low reach. Santa hat, white trim and pom remain intact throughout. Raised blue gloves can intentionally overlap the face; no additional stationary fist appears on the red torso, and shoulders/wrists remain connected.
- **Chode Adoration:** compact cross-body guard and the two-contact forward arm sequence read separately from the overhead caster. Split-color head, green chest brooch and sneaker soles remain intact. No yellow hand ghost appears on torso or blue pelvis during kicks and casts.
- **$Bitcoin Obama:** long-neck upright stance, extended kicks and alternating high/forward forearms remain connected. The originally reported blue fist on the red torso does not recur in either facing. Neck, collar and rear yellow spikes stay attached through directional strikes and special contacts.
- **Jahon:** the corrected long blue neck remains joined to the yellow robe collar in every newly sampled combat/special pose, including high strikes, cast lean and raised-arm contacts at 32/48. No floating jaw or extra blue fist on the robe. The loose red sleeves and robe tails remain distinct from the moving hands and feet.
- **Virtuagram:** compact white-glove strikes, forward kick silhouette and two raised hands at the middle special beat remain coherent. Four pupils, muzzle, orange brooch and white collar remain present. No stationary white glove remains on torso/hips and no detached hand, foot or head was observed.

Observed special pose sequences differ across these six fighters, but static sampled silhouettes alone do not establish whether each move feels sufficiently different during play or whether all damage contacts read clearly with live effects. No blocking anatomy/mask regression was found in the inspected revision. Parent browser/play verification remains the final check for motion and contact readability.
