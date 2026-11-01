# Whole-pose sprite rework and current-update QA

Updated: 2026-11-01. This ledger supersedes visual acceptance statements in the older cutout-rig audits. The game is a playable local prototype; this pass does **not** establish production animation quality or competitive balance.

## Installed result

All 21 supplied fighters have a complete-body Higgsfield pose atlas mapped to the correct original reference. Each declares 32 main slots and eight locally derived guarded-step frames, for 840 installed frame entries. Four main walk slots duplicate selected step images. These are not 40 independently drawn poses or generated animation clips. Original supplied images remain on the selection screen. The withdrawn rigging diagram is excluded.

The installed roster bypasses runtime limb segmentation. Each rendered frame contains one complete body, so the old stationary arm beneath a separately rotated arm cannot reappear through that path. Missing/broken declared assets stop loading rather than silently reverting to the old rig. Original references, raw generation results, normalized frames and correction baselines are retained.

Combat simulation remains fixed-step, serializable and independent of rendering. The November1 follow-up increases pace and repairs downward-air attack timing; exact values are in MOVEMENT-TUNING.md. Individual powers, directional attacks, combo rules, throws, story framework and stages remain installed.

## Defects fixed during this pass

| Finding | Change and actual recheck |
|---|---|
| Baked duplicate arms, detached cutout joins and occluded limbs | Replaced installed cutout playback with whole-body frames. All 21 sheets inspected; per-fighter browser attack, reaction and movement samples inspected in normal/mirrored panels. No claim that every possible overlap is eliminated. |
| Several correction sheets changed head/body proportions during kicks | Restored consistent original ground kick cells for Golden Sproto, Dave, Yannix, Bongraker, Yoyo and Obama; restored ground/air cells for VAMP, Nate and Virtuagram where replacements were worse. Rechecked transition images and browser contacts. |
| Golden Sproto/Yannix airborne heads shrank dramatically | Enlarged only isolated head pixels around authored neck pivots in slots 22/23; original fists and body preserved. Native/3× and browser frames 15/20/24 rechecked in both panels. |
| Wrong footwear and missing identity marks | Targeted Bongraker/VAMP shoe corrections; Virtuagram four pupils; Yannix fangs; Yoyo teeth/nose; Juicy mouth/creases. Baselines and explicit correction regions retained. |
| Deep squat after every medium kick | Recovery now retracts, briefly chambers, plants and returns to guard. All 21 final recovery checkpoints rechecked. Move startup/active/recovery durations unchanged. |
| Player-one attacking arm hidden behind opponent | Main renderer paints the active attacker/holder last. Main-game contact and special screenshots inspected. |
| Unsupported forward hold overlap | Uses reaching pose 26 with individually inspected hand/torso points and a bounded victim presentation offset. Forward offset fades over eight release frames; other directions retain core arcs. No limb deformation or simulation mutation. Main Morelight hold/release checked; per-group post-fix checks recorded below. |
| Immediate different-hand pose on stopping | Idle phase now starts at guard after locomotion/actions, instead of jumping directly to a breathing pose based on global match time. Post-fix stop samples recorded below. |
| Reported November1 walking artifacts | Preserved whole pelvis/coat contours and pinned the leg displacement at individually inspected joins for Morelight, Fat Head Dave, Yoyo, Sprotel Bitcoin, $Bitcoin Obama, Jahon, Bitcoin Mandela and Big Swole. All eight affected gait frames and normal-speed reversal/stop samples rechecked. Includes the two exact user Morelight screenshots. |
| Dive landing during startup | Downward aerial kicks now start their dive at the first active frame. All21 real-jump regression cases passed; Big Swole's slow heavy hit for132damage in actual browser play. |
| Rejected flat/needle-shaped walking legs | Replaced flat-polygon draft with eight full-body frames retaining each fighter’s original leg shading and feet. Full lower body is removed before baking each replacement; no old leg remains underneath. Source cut lines are individually configured, including Jahon’s coat hem. |

## Per-fighter visual coverage

Every row has original-reference comparison, all 32 main-cell inspection, and current browser samples of ground kick, punch, launcher, airborne attack, hit, guard, throw roles and special poses. The mirrored panel checks rendering orientation; it is **not** an independent left-facing input simulation. Main-game keyboard checks and core tests supply separate input evidence.

The group reports contain exact frame numbers, screenshot names and limitations. A running screenshot is a discrete sample; it does not prove that every intervening frame was viewed or that browser playback maintained60 fps. Paused frame captures are exact; running AX readouts may precede their screenshot by a few frames.

| Fighter | Current specific findings / corrections | Detailed evidence |
|---|---|---|
| Golden Sproto | Yellow exposed body, black/red attire; original ground proportions restored; isolated air-head correction verified. | [First seven, current](motion-review-first-seven-2026-11-01.md) |
| Morelight | Bare blue body/yellow belly preserved; whole connected kick; planted recovery and main-game hand-to-torso grip verified. | [First seven, current](motion-review-first-seven-2026-11-01.md), [main hold](evidence/main-play/morelight-contact-current.png) |
| Fat Head Dave | Muscular silhouette and attached limbs; restored ground kicks. Air-pose proportions remain less consistent than the neutral sheet. | [First seven, current](motion-review-first-seven-2026-11-01.md) |
| Halloween 2008 | Main character only; red outfit and pumpkin kit retained; sampled limbs connected. | [First seven, current](motion-review-first-seven-2026-11-01.md) |
| Yannix | Fangs retouched; original ground proportions restored; isolated air-head correction verified. Profile simplification remains. | [First seven, current](motion-review-first-seven-2026-11-01.md) |
| Bongraker | Intentional fused face retained; ground kick/sweep footwear corrected. Air head/neck proportions still vary modestly. | [First seven, current](motion-review-first-seven-2026-11-01.md) |
| Juicy | Lip ridge/creases retouched; no resting duplicate arm underneath the moving pose in inspected cells/states. | [First seven, current](motion-review-first-seven-2026-11-01.md) |
| Yoyo | Three rounded teeth/red nose retouched; attached kicks. Air face remains slightly narrower than rise/fall. | [Middle seven](motion-review-middle-seven.md) |
| Red Kev | Red background excluded from combat art; black/yellow attire retained. Chest motifs vary between drawings. | [Middle seven](motion-review-middle-seven.md) |
| Sprotel Bitcoin | Christmas hat/brim/pom-pom retained through sampled extremes. Nose simplified relative to original. | [Middle seven](motion-review-middle-seven.md) |
| Chode Adoration | Split face, spiral ornament and pendant retained. Mirroring reverses the asymmetry; no separately drawn left-facing set. | [Middle seven](motion-review-middle-seven.md) |
| $Bitcoin Obama | Long continuous neck; corrected extended air leg. Air head remains roughly 10–15% narrower in reviewed comparisons. | [Middle seven](motion-review-middle-seven.md) |
| Jahon | Red brow and neck/open-coat connection checked; no old gap seen. Coat retained during guarded steps. | [Middle seven](motion-review-middle-seven.md) |
| Virtuagram | Four pupils restored throughout; ground proportions restored. Air leg extension remains less emphatic than other fighters. | [Middle seven](motion-review-middle-seven.md) |
| Dumpstar | Face/attire retained, shoulder props omitted; connected shirt/hand/leg poses. | [Last seven, current](motion-review-last-seven-2026-11-01.md) |
| Crapto | Bare lean body, goggles/red irises retained; connected neck and limbs. Thin foot has limited visual weight. | [Last seven, current](motion-review-last-seven-2026-11-01.md) |
| VAMP | Deadpan face and black/yellow outfit; kick ends in a corrected shoe rather than blue hand-like pixels. | [Last seven, current](motion-review-last-seven-2026-11-01.md) |
| Alpha 777 | Green face, blue goggles, scarf and stripes retained; no checkerboard gaps in sampled limbs. | [Last seven, current](motion-review-last-seven-2026-11-01.md) |
| Bitcoin Mandela | Original background excluded; radial spikes, collar and yellow feet retained. | [Last seven, current](motion-review-last-seven-2026-11-01.md) |
| Big Swole | White eyes/crescent earring retained; broad connected body. Special31 reuses 30 after original sheet had an extra cell. | [Last seven, current](motion-review-last-seven-2026-11-01.md) |
| Little Foot Nate | Blue face/pale-blue teeth/yellow surround retained. Original consistent kicks restored; half-extension is relatively weak. | [Last seven, current](motion-review-last-seven-2026-11-01.md) |

November1 follow-up is complete for all21 individual gait, reversal/stop, jump and dash checks; all eight cells per fighter were inspected, with additional exact kick/attack/contact samples. The middle group’s interrupted captures were decoded and verified before new evidence was added. Current supplements: [first seven](motion-review-first-seven-2026-11-01.md), [middle seven](motion-review-middle-seven.md), [last seven](motion-review-last-seven-2026-11-01.md). All21 also received a final down-air-heavy startup/active/landing recheck after the timing fix. All eight source gait cells were inspected individually for each fighter. Browser gait evidence distinguishes each sequence index and each travel direction, with reversal/stop samples; see the group reports for completed coverage rather than inferring it from this source inspection.

## Main-game checks performed

- All 21 player-selection cards clicked; correct runtime ID, health and meter reset read from visible QA status. Original portraits and exact names visually checked in the full-page screenshot. This pass did not manually repeat all 21 opponent dropdown choices; systematic pairing tests cover all combinations.
- Morelight actual keyboard forward travel/stopping and W jump/air steering sampled. W+J entered an upward launcher while remaining grounded. O latched a nearby grounded opponent, release dealt 115 damage, and both fighters returned through recovery. Current contact/release images are under `evidence/main-play/`.
- Golden Sproto’s J→K→L was entered through actual keyboard input, with frame controls used for repeatable timing. Three completed combos earned pips 0→1→2→3. P spent3→0; partner entry, contact effects, four contacts and exit/recovery were visually checked. No meter injection in that main-game sequence. The lab separately seeds three pips as a fixture.
- All four story opening placeholders selected; fourth world CPU fight launched. All four free-play stage themes plus ranch checked. These are static placeholders as requested. Navigation/back paths and mode restoration checked. The campaign was not won end-to-end manually.
- Halloween2008’s pumpkin projectile was visually checked in the main arena. VAMP’s broken-heart projectile was checked through contact: health 1000→955 and the visible MELANCHOLY / SLOWED cue appeared.
- Restart reset health/meter/position. Keyboard remapping W→F saved, then F→W restored. Browser error/warning log was empty at the sampled checkpoint.
- Live game returned HTTP 200 at `http://127.0.0.1:5173/`. Background launchd job `com.sprotoarena.local`, PID 72746, was confirmed listening only on127.0.0.1:5173. It survives this task’s shell, not logout/reboot.

## November1 resumed browser verification

The Mac reconnected; no files were reset. The uncertain middle-group save was inspected and retained. The existing localhost server was independently rechecked: launchd PID72746, IPv4 127.0.0.1:5173 listener, HTTP200. The ordinary game opened in the ChatGPT in-app browser and accepted actual keyboard play. Specialists used their separate Chrome labs. This is not a cross-browser compatibility suite.

`evidence/2026-11-01-main/` contains fresh main-game screenshots and visible QA readouts: Morelight forward/back/up/down grabs, Golden ground3-hit and air4-hit routes, three earned charge pips and partner special, rising/diagonal/low/sweep/launcher hits, four aimed spit inputs and Big Swole’s repaired dive contact. Level/up/diagonal projectiles are visible in the captured shots; the downward shot had already reached the ground by its screenshot, so that specific image proves the action input/readout, not the projectile shape. Browser player input, simulation tests and frame-based visual checks are distinct evidence.

The new references `libfile_77b0bb2c5a44819194f5d5d770aacccb` and `libfile_0ad26b81a4788191828856b66953cd0e` were materialized with Library metadata and inspected. They show Morelight’s narrow leg mass and stretched wide thigh. Pinned pelvis through source row184 and reduced foot travel repaired those silhouettes without changing the belly/face.

## Automated checks

`npm run qa` passed after the whole-pose integration: combat/replay smoke, 20 directional groups, 11 throw checks, 24 movement cases, 17 story/navigation checks, 7 broader groups and 105 per-fighter power cases plus 8 interactions. The broad pairing matrix is441 pairings × 3 modes × 360 frames = 476,280 scripted interaction frames. Fresh post-tune log: [combat-qa.txt](evidence/2026-11-01-main/combat-qa.txt); the earlier log is retained separately.

`node scripts/pose-atlas-smoke.mjs` passed: all 21 gait/stop/hitstop checks; all 441 held-pair finite/bounded/floor-safe transforms without core mutation; missing-image, invalid-walk-count and invalid-contact failures reject atomically; recovery load succeeds. This uses fake image loading and tests logic, not visual quality.

`python3 art/pose-atlases/verify_pose_assets.py` passed 840 entries: files, dimensions, anchors, RGBA hard alpha and transparent edge padding. `npm run build` passed TypeScript and production bundling. Final rerun results are included with delivery.

## Fighting-game references and what was actually compared

The official [KOF XV battle-system manual](https://www.snk-corp.co.jp/webmanual/kofxv/en/howtoplay2.php) documents opponent-relative guard, directional specials and conditional cancels. These informed checks of guard facing, chord capture and hit-confirmed routes. The official [Guilty Gear Strive patch notes](https://www.guiltygear.com/ggst/en/news/post-2963/) discuss dash-direction transitions, airborne trajectory errors and input buffering; these informed reversal, landing and conflicting-input scenarios. Neither source supplies Sproto Arena’s numeric physics. The supplied Capcom PDF returned403 in this pass and was not treated as inspected evidence.

These are documentation comparisons, not firsthand side-by-side retail-game play or a measured latency comparison. The current prototype’s two-frame acceleration/reversal/braking, faster dash and retained neutral jump arcs are measured in its own core; see [MOVEMENT-TUNING.md](MOVEMENT-TUNING.md).

## Remaining quality limits and unavailable coverage

1. The eight-frame gait reads as guarded stance footwork with shallow clearance and limited upper-body counter-motion. World-space foot locking has not been established. It should not be described as a natural running cycle or polished commercial animation.
2. Attack anticipation/contact/recovery now use connected whole poses, but there are few in-between drawings. Body/face proportions vary in some generated cells. Directional attacks reuse the common pose vocabulary; individual mechanics do not mean every direction has bespoke art.
3. Forward hold contact is clearer. Back/up/down still share the release drawing and generic victim reaction. Presentation alignment is not fully authored paired throw choreography.
4. Both-facing panels are mirrors. Asymmetric designs reverse with facing. Full left-facing authored art, every sprite/hitbox alignment and every possible inter-character overlap are not validated.
5. Normal-speed playback was sampled and actual keyboard play performed; no continuous-video review of every intermediate frame or human feel approval is claimed. Physical gamepad hardware, other browsers, long sessions and online play were not verified. No online system exists.
6. Higgsfield AutoSprite jobs `ee12eef7-bdb2-4373-a2ee-300986a9d895`, `47693f50-c24c-4e5e-ba80-71d99dcd3284` and `4c0aa353-f6a8-4be5-a47a-5a1226545059` each ended **failed** with no reason/result supplied. No AutoSprite animation was installed. The successful complete-pose generations are separate. There is no current reference-access/permission blocker.

No remote repository, publication or deployment was created. QA here is the requested pass for this update, not a permanent exhaustive-QA requirement for every future change.
