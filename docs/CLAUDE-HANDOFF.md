# Sproto Arena — factual local handoff

Prepared 2026-11-01 after implementation, individual sprite checks and the throw/reaction follow-up. This records checks already performed, not work delegated to Claude. No message, source or assets have been sent to Claude or another external recipient.

## Run and local checkpoint

Repository: `/Users/kenhiraoka/Documents/Codex/2026-10-31/task/neon-relay`

Verified ordinary game URL: **http://127.0.0.1:5173/** on this Mac. The browser was left with Big Swole against Morelight in standing practice. Click the game to focus, then A/D move, W jumps, J/K/L attacks, U launches, I casts, O grabs, P uses a charged Team Special and Shift dashes. Controls/remapping are in the interface.

The GUI-domain launchd job `com.sprotoarena.local` is running as PID 72746, listening only on 127.0.0.1:5173. It is independent of this task's shell and remains available in this login session. No boot/login startup file was installed; after logout/reboot, double-click `Play Sproto Arena.command`. If that launcher starts a server, keep its Terminal window open. Manual startup:

```sh
cd /Users/kenhiraoka/Documents/Codex/2026-10-31/task/neon-relay
npm run dev -- --port 5173 --strictPort
```

Base checkpoint for this follow-up: **17 b 7 c 1 b — Replace cutout fighters with whole-pose animation and tune movement**. The final delivery message records the follow-up commit; `git log -2 --oneline` identifies both. No remote, deployment, publication or merge was created.

## Implemented scope

- 21 selectable player/opponent fighters with the original supplied images on selection and individual complete-body combat art.
- Individual mechanical attack/power profiles and Team Special timings. Halloween 2008 throws pumpkins; VAMP uses broken-heart waves with temporary slow. Other kits include returns, pulls, drain, ground shots and advancing specials. These are distinct data-driven mechanics, not 21 bespoke animation systems.
- Fixed-step ground/air combat, W jump, directional melee/powers, launcher chase, combo buffering/cancels and finite route limits; three qualifying finisher combos earn the three-pip partner special. There is no passive recharge or tag switching.
- Four directional catches/throws, guard, recoil, launch/fall and knockdown/recovery. Keyboard/gamepad polling and remapping, CPU/standing/guard practice, pause/restart/KO/timeout.
- Amber Ranch plus four selectable placeholder stages: yacht/beach, bar, castle, retrofuturistic. Story/world selector, static scene/progression placeholders, free-play level selector and back paths. No final story or cutscene animation.
- Offline only. No local second player, audio, online matchmaking/network/rollback, multi-round sets or competitive balance validation.

Exact roster/reference mapping and appearance requirements: `art/roster-manifest.json`, `docs/ROSTER.md`, `src/originalPortraits.ts`. Supplied originals were inspected before the art work; the rejected rigging image was excluded. All requested names, including Golden Sproto, Morelight, Jahon, Virtuagram and $Bitcoin Obama, remain mapped to their exact references.

## Sprite/movement baseline already completed

The old runtime limb-cutout method produced baked duplicate arms, hidden limbs and poor joint anatomy. All installed fighters now use **complete-body frame playback**. Runtime arm/leg segmentation is bypassed for the declared roster; a declared asset failure stops loading rather than silently reverting to cutouts.

Each fighter has 32 main pose slots and eight locally baked guarded-step frames. Four main walk slots duplicate selected step frames:840 installed entries, not 840 independent drawings or generated animation clips. Higgsfield source sheets, authorized originals, correction baselines and failed AutoSprite attempts are preserved.

Specific corrections included Morelight's connected limbs, Juicy's arm duplication/mouth, Jahon's neck/open coat, identity/footwear details and restored consistent kick proportions where replacement cells were worse. Kick recovery retracts/chambers/plants rather than immediately deep-squatting. Signed gait phase reverses walking, hitstop freezes playback and idle restarts at guard.

November 1 walking repairs covered Morelight, Fat Head Dave, Yoyo, Sprotel Bitcoin, $Bitcoin Obama, Jahon, Bitcoin Mandela and Big Swole. Central spikes/notches, sheared calves and stretched thighs were repaired by preserving the inspected pelvis/coat join and retaining each fighter's leg shading/feet. The two user walk screenshots are preserved in `art/rework-references/nov01-bugs/`.

Movement is 15% faster than the prior build, with two-frame acceleration/reversal/braking, dash speed 15 (Morelight 13) and cooldown 28. The existing firm neutral jump arcs are 31–35 frames; Golden Sproto measures 134 px. Air steering retains takeoff momentum. Downward aerial attacks begin diving at their active frame; all 21 ordinary-jump regression cases pass. These values and the baseline movement review are in `docs/MOVEMENT-TUNING.md` and `docs/SPRITE-REWORK-QA.md`.

## Latest throw, reaction and spit revision

1. **One authoritative contact position.** `THROW_GRIPS` in the core agrees with installed per-fighter hand/torso metadata. A four-frame eased catch settles before the three-frame contact pause. Renderer-side victim offsets were removed. Pair placement clamps together at walls.
2. **Explicit lifecycle and four trajectories.** Twelve-frame hold, single 115 damage release, eighteen-frame holder recovery. Release removes the old side-switch teleport; a grounded victim can receive a one-pixel vertical physics offset. Back throw lifts vertically for six frames before crossing behind; forward toss, up lift and down slam differ. Late recovery input buffers; early hold presses cannot leak out as delayed attacks.
3. **Interrupt/result safety.** An opponent projectile can interrupt the holder, even if away is held. Held victims reject incidental projectile damage. Simultaneous grabs break, opposed directions cancel, misses/airborne/stunned targets recover without latching. KO waits for flight to land; timeout clears a held victim to the floor without phantom damage.
4. **Visible hit response.** Serializable recoil/launch/knockdown states; ordinary pushback, launcher ascent/fall, finisher and final-special knockdowns. Fourteen-frame down plus six-frame rise reject damage, followed by brief throw protection. Air-reaction friction preserves flight; combo restrictions remain finite.
5. **Whole-body falling and layer order.** Opaque bounds, body lean and convex contact hulls support rotated fall poses and actual floor contact. Holder draws in front; standing fighters draw in front of downed bodies. Wider near-floor spacing prevents wall overlap; descending-body separation is capped at 8 px per fighter/tick, fixing the one-frame landing shove found by independent review.
6. **Horizontal spit only.** Golden Sproto, Morelight, Juicy, Jahon and Crapto emit zero-Y-velocity spit regardless of ground/air/directional input. Gravity/wave/bounce/ground-follow behavior is suppressed for these spit attacks. Other powers, including Halloween's pumpkin arcs, remain directional. Controls and kit descriptions were updated.

No new character PNGs or generated animations were created in this follow-up. Existing fall/hit metadata and runtime pose selection changed. The current atlas revision is `whole-pose-throw-reaction-6`.

## Architecture and changed files

| File or area | Role / current change |
|---|---|
| `src/core.ts` | Serializable 60 Hz simulation; frame-indexed masks; deterministic CPU; individual move data. Added throw grip/lifecycle, reaction phases, horizontal-spit rule, collision/recovery fixes. No DOM/wall-clock/random dependency. |
| `src/poseAtlas.ts` | Atomic image/metadata loader, complete-body pose mapping, signed gait, anchors and playback. Added validated bounds/lean/contact hulls, release/recovery poses and whole-body reaction transform; removed secondary victim offset. |
| `public/fighters/pose-atlas.json` | 32+8 image entries per fighter, anchors/scales/contacts. Added bounds/lean/hulls for fall/hit slots 9/24 for all 21; no image replacement in this follow-up. |
| `art/pose-atlases/update_reaction_bounds.py` | Reproducible opaque bounds, lean and convex hull metadata authoring from installed PNGs (Python/Pillow/numpy). |
| `src/render.ts` | HUD/effects/partner context and hold/standing/down/attacker layering. |
| `src/main.ts`, `index.html` | Input/menu/fixed-step host; visible QA diagnostics for throw/reaction/projectile coordinates; updated ranged-power help. Normal play has no QA controls. |
| `art/pose-atlas-lab.html` | Actual-core fixture with fighter/opponent, actual facing, corners/flush walls, frame stepping, 1×/¼× playback, paired preview and diagnostics. No separate physics simulation. |
| `scripts/throw-smoke.mjs`, `reaction-smoke.mjs` | Lifecycle, direction, contact, interruption, recovery, wall, result and reaction checks. |
| `scripts/directional-smoke.mjs`, `fighter-qa.mjs`, `pose-atlas-smoke.mjs`, `package.json` | Spit/other-power distinction, per-kit regressions, core/art contract and reaction placement checks. Reaction checks included in `npm run qa`. |
| `README.md`, `docs/FIGHTER_KITS.md`, `docs/SPRITE-REWORK-QA.md`, `docs/THROW-REACTION-QA.md` | Current controls/scope, corrected kit copy, baseline audit plus precise follow-up coverage. |
| `docs/evidence/2026-11-01-throws/` | Paused/browser playback samples, readouts, per-fighter records, main-game keyboard evidence, independent review, final checks and playable screenshot. |

Other architecture is unchanged: `spriteRoster.ts` prioritizes whole poses, `powerArt.ts`/`teamSpecial.ts` draw power effects, `stage.ts` draws stages, `storyMode.ts` controls placeholder progression. `higgsfieldRig.ts` and old labs remain provenance/fallback for undeclared future art; they are not the installed 21-fighter path. Frame-indexed replay is useful groundwork, not evidence of cross-browser determinism or online readiness.

## Verification actually performed

After final code changes, all passed:

```sh
npm run check
npm run qa
node scripts/pose-atlas-smoke.mjs
python3 art/pose-atlases/verify_pose_assets.py
npm run build
git diff --check
```

Current logs are under `docs/evidence/2026-11-01-throws/checks/`. Combat QA covers 18 directional groups, 15 throw groups, 24 movement checks, 8 reaction groups, 17 story/navigation checks, 7 broad groups, 105 fighter-kit cases and 8 power interactions. Throw matrix: 10,584 pair/direction/facing/location cases plus 84 flush-wall cases. Broad matrix: 441 matchups × 3 behaviors × 360 frames = 476,280 interaction frames. Spit: five fighters × two facings × ground/air × nine direction masks = 180 trajectory cases. Asset check: 840 entries. Eight pose-contract groups include 441 actual-core hold placements and both-facing reaction floor/camera constraints. Passing these checks does not establish visual quality.

Browser coverage:

- Baseline: all 21 fighters individually checked against their references, all 32 main cells and 8 gait cells; walk/reversal/stop, jump/dash, punches/kicks, directional/air attacks, hit/guard/throw/special samples. Exact coverage and residual findings are in the three `motion-review-*` reports linked from the baseline ledger. The baseline mirrored preview was not an independent opposite-facing input run.
- Follow-up: all 21 received five paused throw/reaction checkpoints in both actual facings (210 samples), with all 84 flight/down frames rechecked after the fall-pose correction. Each also received a 1× back-throw run with 8–12 sampled screenshots through recovery. Every strip was visually inspected. The [21-row coverage matrix](THROW-REACTION-QA.md) gives exact scope and links.
- Independent review found several concrete defects and challenged the floor pose and wall landing. Final two exact wall probes had max 8 px/tick correction, zero release jump, HP 885 once and finite recovery. Main agent viewed both final 1× wall strips. The final wall-only cap was covered automatically for all 21; the entire center-run matrix was not repeated after that isolated correction.
- Main actual keyboard: Morelight all four throws, distant miss, heavy block then throw through guard; Golden ground three-hit routes earning 0→1→2→3 pips then four-contact partner special spending 3→0; launcher/W/four-hit air route; all five horizontal spitters on ground and in air; preserved diagonal pumpkin arc. Frame controls were used for repeatable combo timing; no hidden meter injection.
- Final normal URL: Big Swole vs Morelight, D movement, W+D jump, dash into K hit, L hit and restart observed. Game and lab error/warning logs were empty at the final sample. The working game tab was left visible and marked to remain open.
- Prior UI checks: all 21 player cards/original portraits, all four story openings, four free-play worlds/ranch, back paths, pause/restart and remapping restored to W. Full campaign progression/ending/timeout has controller/core coverage, not an end-to-end manual campaign win.

The official SNK/Guilty Gear references and their actual use are documented in the baseline ledger. They informed facing, reversal, trajectory and buffer scenarios; this was not side-by-side retail gameplay or a measured latency comparison. The supplied Capcom PDF was 403 and was not claimed as inspected.

## Honest residual limits and blockers

- Fall slot 9 is rotated as a complete body; get-up reuses crouch/guard over six frames. Some silhouettes appear supported by an arm/head and get-up remains abrupt. No dedicated prone/get-up or fully paired direction-specific throw sheets exist. Current catch/contact/lifecycle is improved, but finished animation production remains work.
- Guarded-step gait has shallow clearance and limited upper-body counter-motion; world-space foot locking is not established. Sparse in-betweens and some generated proportion changes remain. Virtuagram/Nate retain weaker kick extensions in some cells. No commercial-animation or human feel approval is claimed.
- Asymmetric designs mirror; there is no separately drawn left-facing atlas. Not all 441 pairs and every intermediate overlap/hitbox/frame were visually inspected. Running screenshots are discrete samples, not continuous video review.
- Physical gamepad hardware, systematic cross-browser testing, long-session performance and online determinism remain unverified. Projectile throw interruption, simultaneous grabs, KO/timeout during throw were tested systematically, not all manually reenacted in the final browser pass.
- Three earlier Higgsfield AutoSprite attempts failed with no usable result/reason; none is installed. Whole-pose generations succeeded separately. No current asset/permission blocker remains and no new external reference transfer was required here.
- One old browser tab could not be rebound; a working tab was used and the actual ordinary URL/game was verified. No blocked or uncertain command remains necessary for local play.

Do not restore the old cutout renderer to fill missing poses. Do not run an unreviewed bulk import over corrected PNGs: raw sheets and correction baselines are retained, but a fully clean one-command art rebuild is not provided. This handoff records our completed implementation and checks and the remaining quality limitations; it is not a declaration that every animation meets the user's final subjective bar.

Final browser proof: `docs/evidence/2026-11-01-throws/ready-to-play.png`. Final launchd/listener and browser-log facts: `docs/evidence/2026-11-01-throws/checks/runtime.txt`. Source and authored-documentation whitespace checks remain enabled; captured AX/CSV evidence has scoped exceptions in `.gitattributes`.
