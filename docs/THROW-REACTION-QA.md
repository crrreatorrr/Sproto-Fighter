# Throw, recoil and horizontal-spit follow-up

Completed local implementation and verification on 2026-11-01, after baseline commit `17b7c1b`. This is the requested one-time follow-up; it is not a permanent exhaustive-QA policy. The final local commit is reported in the delivery message. No publication or external handoff occurred.

## What changed and why

| Observed or reproduced defect | Current correction |
|---|---|
| Grip placement differed between the simulation and the visible victim; the catch froze while bodies still overlapped. | Per-fighter hand/torso grip points are now part of deterministic core placement. Catch eases for four frames, then pauses at settled contact. Renderer applies no second victim-position offset. |
| Release could snap position, and a back throw could fail to cross the holder. | Release removes the old side-switch teleport (a grounded victim can receive a one-pixel vertical physics offset). Forward toss, overhead back throw, high lift and down slam have distinct trajectories. Back throw first lifts vertically for six frames before moving behind the holder. Air-reaction friction preserves travel instead of immediately braking it. |
| Interrupted holds, simultaneous grabs, buffered inputs or a result could leave bad state. | Explicit hold/release/recovery lifecycle, single damage event, projectile interruption, simultaneous break, late recovery buffer and KO/timeout cleanup. Held victims reject incidental damage. |
| Strong hits looked like ordinary stun, with no sustained falling/recovery state. | Recoil, launch and knockdown are separate serializable states. Finishers and final special contacts enter flight, 14-frame down and six-frame rise phases. Grounded recovery rejects damage; a short throw-grace window prevents immediate regrab loops. |
| A braced hit drawing looked as though it was balancing on its hands after a throw. | After initial hit recoil, knockdowns use the relaxed whole-body fall drawing. Opaque bounds, authored lean and convex contact hull determine the rotation and floor contact. This improves the sampled result but is not a newly drawn prone/get-up sequence. |
| A fallen body covered the standing fighter or disappeared beneath it near a wall. | Held attacker has foreground priority; otherwise standing actors draw over downed actors. Near-floor knockdowns get more floor space. Descending-body collision correction is capped at eight pixels per actor per tick to avoid a one-frame landing shove. |
| Spit could travel up/down, arc or wave when directional input was held. | Golden Sproto, Morelight, Juicy, Jahon and Crapto always emit horizontal spit with zero vertical speed/acceleration. Other projectile types retain their previous directional behavior. |

The independent reviewer reproduced the back-throw/friction failure, wall tie-direction failure, floating timeout victim, awkward original floor pose and landing collision pop. These were fixed and rechecked. Final independent probes for Morelight→Little Foot Nate at the left wall and Big Swole→Little Foot Nate at the right wall found maximum holder displacement 8px/tick, zero release displacement, one damage event (HP885), finite coordinates and cleared throw/reaction/stun. Final separation settled at about 113.6/114.3px; nominal floor spacing is 115px.

## Per-fighter browser coverage

Each row below received five paused samples in **both actual simulation facings**, not only a mirrored preview: catch as holder, back-throw flight as victim, down as victim, rise as victim, and upward release as holder. This is 210 sampled checkpoints. After changing the floor drawing, all 84 flight/down images were replaced and inspected again, including independent review. Each fighter also received a separate 1× back-throw playback run with discrete screenshots from flight through recovery. The table gives the run's actual starting facing and sample count; it does not claim continuous video observation or two 1× runs per fighter.

All sampled complete-body frames remained connected, with no old cutout arm underneath another moving arm. Ground contact/camera bounds were checked. The shared floor/get-up limitations below still apply to every fighter. This follow-up supplements, rather than repeats, the individually recorded walk/reversal/dash/jump/kick/attack/special checks in [the baseline ledger](SPRITE-REWORK-QA.md) and its three group reports.

| Fighter / runtime ID | Paused five states, R + L | 1× run: facing / samples | Evidence strip |
|---|---|---|---|
| Golden Sproto / rivet | Inspected | R / 12 | [motion](evidence/2026-11-01-throws/live-strip-rivet.jpg) |
| Morelight / vela | Inspected | R / 9 | [motion](evidence/2026-11-01-throws/live-strip-vela.jpg) |
| Fat Head Dave / bront | Inspected | R / 9 | [motion](evidence/2026-11-01-throws/live-strip-bront.jpg) |
| Halloween 2008 / zephyr | Inspected | R / 12 | [motion](evidence/2026-11-01-throws/live-strip-zephyr.jpg) |
| Yannix / mox | Inspected | R / 9 | [motion](evidence/2026-11-01-throws/live-strip-mox.jpg) |
| Bongraker / rune | Inspected | R / 10 | [motion](evidence/2026-11-01-throws/live-strip-rune.jpg) |
| Juicy / guest07 | Inspected | R / 9 | [motion](evidence/2026-11-01-throws/live-strip-guest07.jpg) |
| Yoyo / guest08 | Inspected | L / 11 | [motion](evidence/2026-11-01-throws/live-strip-guest08.jpg) |
| Red Kev / guest09 | Inspected | L / 10 | [motion](evidence/2026-11-01-throws/live-strip-guest09.jpg) |
| Sprotel Bitcoin / guest10 | Inspected | L / 9 | [motion](evidence/2026-11-01-throws/live-strip-guest10.jpg) |
| Chode Adoration / guest11 | Inspected | L / 10 | [motion](evidence/2026-11-01-throws/live-strip-guest11.jpg) |
| $Bitcoin Obama / guest12 | Inspected | L / 9 | [motion](evidence/2026-11-01-throws/live-strip-guest12.jpg) |
| Jahon / guest13 | Inspected | L / 9 | [motion](evidence/2026-11-01-throws/live-strip-guest13.jpg) |
| Virtuagram / guest14 | Inspected | L / 11 | [motion](evidence/2026-11-01-throws/live-strip-guest14.jpg) |
| Dumpstar / dumpstar | Inspected | R / 11 | [motion](evidence/2026-11-01-throws/live-strip-dumpstar.jpg) |
| Crapto / crapto | Inspected | R / 10 | [motion](evidence/2026-11-01-throws/live-strip-crapto.jpg) |
| VAMP / vamp | Inspected | R / 10 | [motion](evidence/2026-11-01-throws/live-strip-vamp.jpg) |
| Alpha 777 / alpha777 | Inspected | R / 8 | [motion](evidence/2026-11-01-throws/live-strip-alpha777.jpg) |
| Bitcoin Mandela / mandela | Inspected | R / 10 | [motion](evidence/2026-11-01-throws/live-strip-mandela.jpg) |
| Big Swole / bigswole | Inspected | R / 10 | [motion](evidence/2026-11-01-throws/live-strip-bigswole.jpg) |
| Little Foot Nate / nate | Inspected | R / 8 | [motion](evidence/2026-11-01-throws/live-strip-nate.jpg) |

Full records: [coverage.json](evidence/2026-11-01-throws/coverage.json), [1× frame numbers](evidence/2026-11-01-throws/live-runs.json). Files `{id}-{facing}-{catch,flight,down,rise,up-release}.png/.txt` hold the exact paused samples. `final-falls-1..7.jpg` and regenerated `review-*.jpg` show the installed floor pose. `superseded-braced-fall/` is historical evidence only. Running AX readout and screenshot may differ by a few simulation frames.

The final collision-cap change affects crowded wall landings. It was visually rechecked with Morelight→Nate and Big Swole→Nate using 1× playback samples: [left wall](evidence/2026-11-01-throws/vela-wall-final-strip.jpg), [right wall](evidence/2026-11-01-throws/bigswole-wall-final-strip.jpg). Earlier files named `wall-smooth-*` precede the final cap; `wall-final-*` are current. The entire 21-fighter center run was not repeated after this corner-only correction; automated wall cases were rerun for all 21 attackers.

## Actual main-game input checks

Used native keyboard events through the browser, with the visible `?qa=1` freeze/step controls for repeatable timing. No hidden state injection or meter grant was used in these match checks. [Main-game records](evidence/2026-11-01-throws/match/coverage.json) contain 91 observations.

- Morelight: O / back+O / W+O / S+O catches, hand-to-torso contact, releases, different arcs and finite recovery. Each release dealt 115 once; up+grab kept the holder grounded. Down impact and subsequent guard were visually inspected.
- Distant O whiff: no latch/damage and normal recovery. Heavy against guard: HP1000 and no combo/pip; then O caught the guarding opponent and dealt 115 on release.
- Golden Sproto: three keyboard J→K→L routes earned pips 0→1→2→3. P spent 3→0, showed the partner cameo and four contacts, ending in knockdown. No special self-charge.
- Golden U→W→J→K→L: four airborne hits, 216 damage and one pip. Corner draw-order fix rechecked with the standing attacker visibly in front of the downed victim.
- All five spit fighters: ground W+I and aerial W then S+I. Two samples eight simulation frames apart showed identical projectile Y and zero vertical speed for each; visual [comparison](evidence/2026-11-01-throws/match/horizontal-spit-review.jpg). This browser check used one actual facing; automated checks cover both and nine direction masks.
- Halloween 2008 W+forward+I still produced a diagonal pumpkin arc, observed moving upward with gravity changing its vertical velocity. The spit restriction did not flatten it.
- Final ordinary URL (without QA controls): Big Swole against Morelight in standing practice. Actual D movement, W+D jump, dash into K contact (HP1000→940), L contact (HP868), and restart were observed. Restart restored both HP1000, positions and empty meter. No error/warning entries were present in the sampled game/lab browser logs.

The browser launch, title, local assets and inputs were verified in the in-app browser. [Ready-to-play screenshot](evidence/2026-11-01-throws/ready-to-play.png). The tab was left at `http://127.0.0.1:5173/` with the ordinary game visible. An older tab handle could not be rebound; verification continued in a working tab rather than waiting indefinitely. This did not block gameplay.

## Automated checks after the final code changes

All commands exited successfully:

| Command | Observed coverage / log |
|---|---|
| `npm run check` | TypeScript, [log](evidence/2026-11-01-throws/checks/typecheck.txt). |
| `npm run qa` | Combat/replay; 18 directional groups including 180 horizontal-spit combinations; 15 throw groups; 24 movement checks; eight reaction groups; 17 story/navigation checks; seven broad groups; 105 fighter-kit cases and eight power interactions. [Log](evidence/2026-11-01-throws/checks/combat-qa.txt). |
| `node scripts/pose-atlas-smoke.mjs` | Eight contract/playback groups: all 21 grips agree with metadata, 441 actual-core held pairs have no second render offset, all reaction transforms remain bounded/floor-safe in both facings, atomic invalid-asset failures. [Log](evidence/2026-11-01-throws/checks/pose-checks.txt). |
| `python3 art/pose-atlases/verify_pose_assets.py` | 840 frame entries / 21 fighters: paths, dimensions, anchors, hard alpha and padding. [Log](evidence/2026-11-01-throws/checks/assets.txt). |
| `npm run build` | TypeScript and Vite production bundle, 32 modules. [Log](evidence/2026-11-01-throws/checks/build.txt). |
| `git diff --check` | No whitespace errors after authored documentation/evidence cleanup. |

The throw matrix checks 441 pairs × four directions × two facings × three positions = 10,584 cases. Additional 84 flush-wall cases cover all attackers, both player indices and both walls, including the eight-pixel correction limit. Tests also cover airborne/stunned misses, projectile interruption, held-victim protection, simultaneous/opposed input, early/late buffer rules, KO flight, timeout during hold and replay determinism. Reaction checks cover all 21 heavy finishers in both facings and every final special contact. The broad interaction matrix is 476,280 scripted frames; it is not every possible game sequence.

## Limits and remaining quality work

- Whole-body fall slot9 is rotated into flight/down poses; rise reuses a crouch then guard. Some silhouettes rest on an arm/head and the six-frame get-up is abrupt. No dedicated direction-specific paired throw, prone or get-up drawings were authored in this follow-up. It improves lifecycle/contact but is not finished animation production.
- Existing guarded-step footwork, sparse attack in-betweens, some generated proportion changes, and weaker kick extension for Virtuagram/Nate remain documented in the baseline. No claim of natural running, fully locked feet or commercial-quality animation.
- All fighters were individually sampled, but not all 441 pairings or every intermediate frame were visually inspected. Continuous video capture and human subjective feel acceptance were not performed. The automated cap measures displacement; it does not certify that every landing looks natural.
- Projectile interruptions, simultaneous grabs, throw KO and held-timeout were tested systematically in the core, not recreated manually in the final browser pass. Full story progression/ending uses controller tests; the campaign was not won end-to-end manually.
- Physical controller hardware, a systematic cross-browser suite and long-duration performance remain unverified. No online/network system exists.
- No current permission or asset-access blocker remains. Earlier failed Higgsfield AutoSprite jobs are recorded in the baseline; this follow-up used existing whole-pose assets and did not generate or upload new character art.
