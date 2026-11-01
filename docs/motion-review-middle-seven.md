# Middle-seven live browser review

Date:2026-10-31. Fighters: guest08 Yoyo, guest09 Red Kev, guest10 Sprotel Bitcoin, guest11 Chode Adoration, guest12 $Bitcoin Obama, guest13 Jahon, guest14 Virtuagram. Browser: separate Chrome tab1760303247, `http://127.0.0.1:5173/art/pose-atlas-lab.html`. All interactions used the visible UI. No fighter state was injected or mutated by the reviewer. The lab advances persistent real combat-core state; the second panel mirrors that same state rather than simulating a second match.

## Coverage and interpretation

Each fighter was selected individually and checked using current loaded assets. The selected-fighter value was asserted before captures after a development hot reload interrupted Sprotel's initial playback. Screenshots contain both normal and mirrored panels. Readouts are recorded in `docs/evidence/middle-seven/coverage.json` with exact scenario/core frame, move time, freeze count, selected pose and gait phase.

For every fighter, frame-stepped checkpoints cover:

| Scenario | Actual core/scenario frames captured |
|---|---|
| Medium kick | 3,10,25; final renderer recheck25 |
| Light punch | 8 |
| Launcher/uppercut | 14 |
| Air medium | 18 active; Yoyo/Red Kev additionally22 recovery |
| Hit / block | 8 each |
| Attacker grab | 12 hold,22 release/freezetime |
| Victim throw | 12 hold,22 release/freezetime |
| Special | 35,70 (character-specific move times in JSON) |
| Updated walk | 24 initially; exhaustive gait-index follow-up below |

Playback speed selector was set to¼× during targeted frame stepping. Clicking Step advances exactly one simulation frame regardless of playback speed; this is **not a claim of continuous quarter-speed video viewing**. Normal-speed full-review playback was launched per fighter and sampled at recorded checkpoints. Some reached a second loop; others were stopped for detailed inspection. Sprotel's first loop was interrupted by HMR and restarted. Do not interpret an unobserved intervening scenario as visually approved merely because simulation advanced through it. Browser background scheduling also prevents an assertion of constant60fps.

Evidence consists of actual browser screenshots, not regenerated source contact sheets. `guestXX-review.jpg` combines targeted screenshots for reading; underlying full-width JPGs preserve detail. Initial medium25 captures show the former deep crouch and are historical. `recovery-recheck.jpg` and `guestXX-medium-revised25.jpg` supersede that recovery verdict.

## Per-fighter findings

### Yoyo — guest08

Inspected all listed attack/reaction/throw/special checkpoints in both panels. Working limbs remain connected. Active air-medium18 shows the corrected extended leg; earlier22 capture was recovery and was not used to claim contact. Corrected airborne face is slightly narrower than original rise/fall poses; source comparison suggests modest5–10% variation, not the previous severe VAMP-style size jump. Red suit/white neck band, yellow head and retouched face remain recognizable. Grab hold overlaps the ghost opponent heavily; no anatomically registered hand-to-opponent grip is established by this test. Final medium25 is planted and no longer deep-crouched.

### Red Kev — guest09

Medium10 shows a complete extended black trouser leg and yellow foot; punch8 and launcher14 retain attached arms. Active air-medium18 has a visible extended leg;22 was recovery. Yellow chest curls remain variable between drawings, a known identity-detail limitation. Hit/throw recoil keeps head attached. Special35/70 provides visible poses but does not establish rich choreography or correct projectile/effect presentation. Final medium25 planted recheck passed the specific crouch-removal check.

### Sprotel Bitcoin — guest10

Christmas hat, white brim and pom-pom remain attached through sampled kicks, uppercut, air attack, recoil, throws and special. Blue hands and red sleeves stay connected; no missing toe or clipped hat observed in these browser checkpoints. Original oversized nose is still simplified relative to reference. Initial normal-speed loop was interrupted by HMR; targeted checks restarted correctly and a later1× loop was launched again. Final medium25 is planted.

### Chode Adoration — guest11

Split yellow/pale-blue face, spiral ear ornament, pendant and red/white shoes remain visible. Ground and airborne kicks have complete shoes and connected legs. No detached spiral mistaken for an arm was observed. Paired hands crowd together during hold; this is a readability/grip limitation, not a newly observed third arm. Final medium25 is planted. Mirroring reverses the whole split face, as expected for the mirrored-panel test; separately authored left-facing identity art was not tested.

### $Bitcoin Obama — guest12

Current active air-medium18 now displays an extended leg: the earlier original-atlas missing-kick23 defect is corrected. Long neck remains continuous in the sampled punch, uppercut, hit, block and throw poses. Corrected airborne poses have a modestly smaller/narrower head (approximately10–15% apparent difference against original rise/fall in a separate current-PNG comparison); retain as a proportion limitation, not a detached-head failure. Isolated head rescaling was not attempted. Final medium25 is planted.

### Jahon — guest13

Specifically checked neck-to-open-coat connection during kick, punch, uppercut, airborne kick, hit, block and both throw roles. No return of the prior severed-neck/torso gap was visible. Yellow coat edges remain attached; long coat overlaps the supporting leg legitimately. Contact/recovery body drawings remain coarse animation, not hand-drawn in-betweens. Final medium25 is planted.

### Virtuagram — guest14

Current browser sprites retain the local four-pupil correction; face and white/yellow eye surrounds remain attached during the sampled states. Restored original ground-kick proportions avoid the small replacement head. Air-medium18 uses the intentionally restored original pose: leg extension is less emphatic than some other fighters and is not approved as a precise foot/hitbox match. Black outfit remains readable on the lab checkerboard; final ranch-stage contrast requires separate main-game review. Final medium25 is planted.

## Shared verdict and remaining scope

No new detached-limb, open-neck or missing-torso blocking defect was found in the specifically inspected browser checkpoints. No asset edits were made in this review. This is a bounded finding, not an all-animation quality pass.

The final recovery change removes the visibly excessive crouch after a normal kick in all seven sampledframe25 rechecks. Remaining concerns include coarse pose transitions, modest corrective-air proportion differences, generic victim recoil and poorly registered throw grips. The lab draws the opponent ghosted, so visibility here cannot prove foreground layering in the normal game. Forward throws were checked explicitly; all-direction throw contact was not exhaustively inspected here. Parent owns main-game throw proof.

Walking follow-up is in progress; do not apply earlier stale flat-polygon or same-leading-leg findings to the newly installed eight-frame gait without current checks. No continuous-motion or overall smoothness approval is granted.

## Walking follow-up method (current eight-frame gait)

The actual `walk` scenario was advanced through150coreframes using visible Step controls. Every observed `Sequence walk` index0–7 was captured once during forward input (frames1–60) and once during backward input (61–120). Additional capture points60/61 and120/121 bracket direction/input changes;150 records the settled stop. The normal and mirrored panels are both included for every index. `guestXX-gait-review.jpg` crops and arranges those actual browser screenshots at native size; it does not draw source PNGs or simulate poses separately.

Yoyo and Red Kev completed this coverage before the subsequent throw-positioning renderer change. Their gait sheets show connected, source-textured legs/feet and a stable guarded upper-body silhouette. The motion remains a shallow stance shuffle with little foot clearance and limited upper-body counter-motion. This is an honest quality limitation, not proof of detached anatomy or automatic rejection of fighting-game guard steps. No claim of foot-slip elimination is made from discrete screenshots.

A later throw-contact renderer update is being coordinated at a safe pause. Earlier grab/victim screenshots must be treated as pre-update evidence until explicitly rechecked.

## 2026-11-01 reconnection follow-up (supersedes incomplete status above)

Preserved the previous screenshots and `coverage.json` without overwriting them. The interruption left complete, readable guest08 and guest09 `final-grab-9`, `final-dash-3`, and `final-bolt-13` JPEGs with corresponding metadata; guest08 additionally saved `final-walk-stop` at149. A saved file alone was not treated as visual approval. Fresh replacement evidence was collected separately after reconnection.

The prior session actually completed all seven eight-frame forward/back gait inspections and all seven 22-scenario 1× sampled reviews before disconnecting. Each `guestXX-gait-review.jpg` and `guestXX-live-review.jpg` was visually inspected. The historical partial walking status above was not updated before environment loss. The 22 scenarios cover idle, forward/back walking, dash, jump, punch, kick, sweep, launcher, bolt, air-medium, hit, block, four attacker throw directions, four victim throw directions, and special. They used explicit visible UI action/direction selections and real core progression; normal-speed snapshots are discrete samples, not continuous video approval. Some late dash samples showed guard, which motivated the new exact dash3 checks.

On November1 a fresh independent Chrome tab loaded all21 atlases. For **each** of guest08, guest09, guest10, guest11, guest12, guest13 and guest14, visible Step controls produced and saved these exact scenario frames: grab9/22/30, dash3, light8/18, medium10/16/25. Each of the63 captures includes original and mirrored panels. The selected fighter, scenario, core frame, pose slot and throw state are recorded in `evidence/middle-seven/coverage-2026-11-01.json`. No old evidence was overwritten. Each new `guestXX-nov01-review.jpg` was visually inspected against these readouts.

| Fighter | Nov1 observed anatomy/contact result |
|---|---|
| Yoyo | Complete red kick leg and attached extended punch; forward reach hands meet opponent torso more plausibly. Dash is a complete leaning pose. Kick recovery planted. |
| Red Kev | Attached yellow fists/feet and complete black trouser leg; no open inner-thigh hole in sampled attack/dash poses. Chest decoration still varies by authored pose. |
| Sprotel Bitcoin | Christmas hat/brim/pom-pom preserved; blue hands remain attached through reach, punch and release; complete red kick leg. |
| Chode Adoration | Split face and spiral detail retained, complete shoes and kick silhouette; paired reaching hands remain visually crowded but no third arm observed. |
| $Bitcoin Obama | Continuous elongated neck through punch, reach, release and kick; both blue legs complete. This grounded supplement does not resolve the previously documented air-head proportion variation. |
| Jahon | Neck joins coat/body in all nine checks; coat borders intact through extended punch/kick. Long coat partly conceals supporting leg naturally. |
| Virtuagram | Four pupils/eye surrounds survive the new captures; white hands attached and full black kick leg visible. No replacement small-head regression in the inspected grounded kicks. |

Grab9 is actual hold t0 with reaching pose26. Grab22 is release pose28 with hitstop;30 shows subsequent victim travel. This improves initial hand-to-torso registration, but shared release art remains static while the victim travels and does not establish convincing direction-specific wrestling/grip animation. Light8 shows extended pose12;18 shows recover13. Medium10/16 show full kick18 and25 planted recover13. The recovery is no longer deeply crouched, but remains an abrupt transition between a small number of authored poses. These checks found no new detached limbs or arm/torso holes; they do not grant a broad animation-quality pass.

Yoyo additionally ran fresh1× walk forward/back/stop captures at22/77/150. Its sampled inner-leg contours showed no obvious needle-like crotch spike. Final gait rechecks for the remaining fighters are held pending the parent's announced gait-baker correction and movement tuning; the earlier October31 gait evidence is retained as a baseline, not represented as validation of a future revision.

### Enlarged gait defect audit — November1, before corrective rebuild

A separate nearest-neighbor enlargement of **all56 current installed gait PNGs** found defects missed at normal sprite size. This is source-pixel inspection, not new browser motion approval. Evidence: `nov01-gait-pelvis-detail.png` and `nov01-pelvis-source-coordinates.png` in the same evidence directory.

- Yoyo: small downward hooked crotch edge in frames0/1, with distorted inner-leg contour also visible around4. Guard source has a clean joined pelvis. Recommended preserving through source row182 before distributing leg displacement below it.
- Sprotel: thin dangling red/black groin spur in0/1/6/7; it is introduced by gait splitting, not an anatomical crease. Guard source is clean. Preserve pelvis through182.
- Obama: an unmistakable transparent vertical notch starts near row170 at the shirt hem and cuts through the blue pelvis in all eight frames. This is a blocking authored-gait defect. Preserve whole source waist/pelvis through181, with deformation beginning below that join.
- Jahon: forced row190 split creates horizontally sheared red lower-leg slabs and gray slits below the coat, most evident0/2/6/7. Preserve coat/source legs through192; begin displacement at zero at193 and ramp to sole208 using original row extents.
- Red Kev and Virtuagram: no comparable central bag/transparent waist notch found in these eight-frame zooms.
- Chode: narrow dark inner-thigh crease visible, but no comparably detached spur or transparent waistband opening identified in these zooms.

These findings override any implication that a normal-size screenshot established clean gait joins. Parent was notified with exact row guidance; fixes/rechecks pending below.

### Final corrected gait recheck — whole-pose-pelvis-4, November1

Reloaded the page and clicked Reload assets after the parent announced the corrected gait and movement tuning. All21 atlases reported ready. Inspected all **56 installed gait PNGs** (eight per middle-seven fighter) enlarged in `nov01-pelvis4-detail.png`. The four specific defects above are repaired: Yoyo/Sprotel groin spurs are gone; Obama's blue waist is continuous under the shirt; Jahon's coat-to-lower-leg joins no longer form horizontal sheared slabs. Red Kev, Chode and Virtuagram show no new comparable gap. These eight-frame checks are source-pixel inspections; the browser samples below provide separate runtime evidence.

Each of the seven fighters ran the actual walk scenario at1× with samples during forward travel, backward travel after reversal, and settled stop. Each also ran jump and dash at1×. Because UI sampling can miss the very short dash pose, every fighter additionally received an exact three-step dash inspection. Original and mirrored panels were captured. Actual selected frames, not requested times, are listed below.

| Fighter | Forward / backward / stop scenario frames | Jump | Dash playback sample / exact launch |
|---|---|---|---|
| Yoyo |22 /83 /149|22|16 /3|
| Red Kev |22 /82 /148|16|16 /3|
| Sprotel |22 /78 /151|15|15 /3|
| Chode |22 /81 /150|16|17 /3|
| Obama |21 /82 /147|21|16 /3|
| Jahon |29 /82 /148|16|16 /3|
| Virtuagram |22 /78 /149|15|14 /3|

Every exact dash3 showed dash pose6 with x539.8; later playback samples were already guard recovery with x620.6. Stops settled at x499.0 with guard pose0, rather than jumping immediately into the breathing pose. Jump samples showed complete rise/fall silhouettes in both facing panels. No missing feet, renewed waist holes or detached coat/boot joins were observed in these corrected runtime samples.

Current evidence is indexed separately in `coverage-pelvis4.json` with immutable revision-prefixed copied screenshots. `nov01-pelvis4-walk-both.jpg` and `nov01-pelvis4-jump-dash.jpg` retain both panels; `nov01-pelvis4-runtime-review.jpg` enlarges the grounded samples but its jump crops omit the upper body, so jump anatomy was assessed using the separate full-panel jump evidence. The earlier same-day walk screenshot filenames were reused during rerun; use the revision index for current frame-to-file correspondence and the previous assembled review image for the earlier Yoyo sample. October31 evidence was not overwritten.

Verdict: the reported pelvis/inner-leg defects are specifically corrected in these seven fighters. Movement responds through forward/reverse/stop and dash/recovery in the actual core. The gait still reads as a guarded ankle shuffle with little torso counter-motion; this review does not establish polished hand-drawn locomotion or continuous60fps smoothness. Playback was sampled and paused through CUA, not recorded as uninterrupted video. Neutral jump input drift, directional air steering, projectile effects, main-stage contrast and all-pair throw grips are outside this final supplement. Earlier documented sparse attack transitions, shared throw-release art and modest corrective-air proportion variation remain limitations.

### Downward air-heavy active-phase dive retest — November1

After the targeted core correction, opened a fresh lab tab and reloaded assets. For each guest08–guest14 selected `airHeavy` and `down`, inspected exact scenario frames12,20,25,40, then restarted and ran the same action at1× through landing. All35 new captures include both facing panels; exact records are in `coverage-dive-active.json`. Reviewed the full-panel montage `nov01-down-airheavy-review.jpg` and enlarged active-frame crops. The detail montage is stretched for visibility and must not be used for proportion measurement.

All seven show startup chamber22 at frame12 (move t3, y468.9), active full-air-kick23 at frame20 (t11, y475.8), airborne recovery/fall9 at25 (t16, y541.3), and grounded guard0 with no remaining move at40 (y578). Thus the inspected active strike visibly occurs before landing, correcting the specific early-dive failure. Each separate1× run reached grounded guard again; exact sampled landing/recovery ages are retained in the JSON. These are settled-land samples, not a frame-by-frame determination of the first ground-contact instant.

Per-fighter active silhouettes remain attached: Yoyo red boot/leg, Red Kev yellow boot, Sprotel red leg and Christmas hat, Chode red/white shoes, Obama's long neck and blue extended leg, Jahon's neck/coat/leg connection, and Virtuagram's black limbs/white hands. No new detachments or missing active pose observed. Virtuagram's original air-kick silhouette remains relatively bent/weakly extended; direction-specific downward strike art is still shared rather than an individually authored dive pose. This targeted timing result does not alter the previous limitations on animation smoothness, aerial proportion consistency or hitbox-to-visible-foot precision.
