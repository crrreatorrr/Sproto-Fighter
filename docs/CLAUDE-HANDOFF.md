# Sproto Arena — factual local handoff

Prepared 2026-11-01 after implementation and individual browser checks. This is a record of work performed, not a request for Claude to do the checks instead. No message or project has been sent to Claude or another external recipient.

## Location and startup

Repository: `/Users/kenhiraoka/Documents/Codex/2026-10-31/task/neon-relay`

Game: **http://127.0.0.1:5173/** on this Mac. Click Enter the arena, choose a fighter and CPU/practice mode. W jumps; A/D move; J/K/L light/medium/finisher; U launcher; I ranged power; O grab; P Team Special; Shift dash. Direction+attack selects rising/diagonal/low options. Direction+O selects throw outcome. Controls/remapping are in the UI.

The existing launchd job `com.sprotoarena.local` was verified as PID 72746, listening on127.0.0.1:5173 with HTTP 200. It is independent of the task shell and survives this task, but not logout/reboot. Double-click `Play Sproto Arena.command` to restart locally when needed; keep its Terminal window open if that launcher starts a new server. Manual alternative:

```sh
cd /Users/kenhiraoka/Documents/Codex/2026-10-31/task/neon-relay
npm run dev -- --port 5173 --strictPort
```

No remote repository, deployment or publication exists. Base commit before this latest replacement: `8779496`. Use `git log -1 --oneline` for the final local rework commit; the delivery message records it.

## What exists in the game

21 selectable player/opponent fighters; original submitted images in selection; individually generated combat pose sets; distinct attack/power profiles; fixed-step ground/air combat; W jump; directional melee/ranged inputs; launcher/air routes; buffered/cancelled combos; four directional throw outcomes; guard/hit reactions; combo-earned three-pip Team Special with partner cameo; keyboard/gamepad polling/remapping; CPU and standing/guard practice; restart/pause/KO/timeout; original ranch and four selectable placeholder stages; story/world selector with static scene/progression placeholders.

Halloween2008 throws pumpkins. VAMP has broken-heart waves with a temporary slow. Each fighter has distinct mechanical data in `COMBAT_STYLES`; the common whole-pose action vocabulary is still shared. These are not21 completely bespoke motion-design systems. There is no online play, local second player, sound, final narrative or animated cutscene production.

## Latest sprite/animation changes

The earlier cutout approach could leave a resting arm in the torso, hide moving limbs and create distorted kicks/neck joins. All installed fighters now use **complete-body frame playback**, with no runtime arm/leg segmentation for the declared roster.

- 21 Higgsfield whole-pose atlases,32 main slots each, sourced from the authorized original references. All originals were inspected; the rejected rigging diagram was excluded.
- 8 additional locally baked guarded-step frames per fighter retaining its own leg shading and feet. Four main walk slots duplicate selected step frames.840 installed frame entries total; not840 independently hand-drawn poses and not generated animation videos.
- Consistent original kick cells restored when focused replacements shrank the entire body/head. Targeted shoe, pupil, mouth/teeth and isolated air-head fixes preserve identity. Jahon’s neck/open coat and Juicy’s formerly duplicated arms were specifically inspected.
- Ground kick recovery now retracts/chambers/plants instead of dropping into a deep crouch. Idle returns through guard before breathing. Signed travel phase reverses gait correctly; hitstop freezes playback. World translation is pixel-rounded.
- Main draw order puts the active attacker/holder in front. Forward holds use reaching hands plus bounded per-fighter hand/torso contact correction; the release offset blends back to the core path. No simulation positions or collision rules changed for this correction.
- Declared asset failures are atomic and visible; no silent fallback to the old cutout rig.

The November1 resume also repaired eight fighters’ walking artifacts: Big Swole/Mandela/Dave central spikes, Morelight’s squeezed/stretched thighs, Yoyo/Sprotel dangling seams, Obama’s waist notch and Jahon’s sheared calves. Source pelvis/coat contours now stay intact while displacement starts at zero at the inspected join. Other13 gaits were individually checked; no matching defect was established. The two latest user screenshots are preserved and identified under `art/rework-references/nov01-bugs/`.

Movement is15% faster than the previous build, with2-frame start/reversal,2-frame stop, dash15/13 and cooldown28. Neutral jump height/timing stays fixed. A live-play defect in down-air heavies was fixed by delaying the dive impulse until the active frame; all21 real-jump regression cases passed and Big Swole’s132damage airborne hit was observed in browser. Loading now explicitly says “Loading fighter sprites…” until entry is enabled.

## Main changed files

| Path | Responsibility |
|---|---|
| `src/poseAtlas.ts` | New loader, metadata validation,32-slot mapping, optional gait sequences, state-keyed playback, idle/recovery timing, bounded throw contact transform. |
| `src/core.ts` / `scripts/directional-smoke.mjs` / `scripts/movement-smoke.mjs` | Faster movement/reversal/dash, air steering and active-frame dive; measured regression coverage. |
| `src/main.ts` | Loads whole poses first; only loads old rigs for undeclared fighters; readiness/error path. |
| `src/spriteRoster.ts` | Whole-pose priority and declared-art no-fallback gate. |
| `src/render.ts` | Supplies actual throw state; attacker-aware foreground order. |
| `public/fighters/pose-atlas.json` / `poses/` | Current32+8 local images per fighter; dimensions/anchors/scales/revision and contact points. |
| `art/pose-atlases/` | Preserved generation sheets, normalization, correction baselines/scripts, guarded-step authoring and failed AutoSprite records. Read its README before rerunning importers. |
| `art/rework-references/` | Verified local originals used in this rework and Morelight’s actual bug screenshots, including both November1 walk reports. |
| `art/pose-atlas-lab.html` | Real-core UI fixture:21 fighters,32-slot gallery, frame stepping,1×/¼×,22 action scenarios and mirrored facing panels. |
| `scripts/pose-atlas-smoke.mjs` | Playback/asset failure/contact bounds tests with fake image loading; no visual-quality claim. |
| `docs/SPRITE-REWORK-QA.md` | Current coverage, fixed defects, remaining limits and main-game evidence. |
| `docs/motion-review-*.md` / `docs/evidence/` | Three independent seven-fighter visual reports, exact frames/readouts/screenshots and final rechecks. |
| `README.md`, `docs/ROSTER.md`, `art/roster-manifest.json` | Current run/scope/roster documentation. Exact reference IDs and requirements retained. |

Existing architecture remains: `core.ts` has serializable 60 Hz simulation, deterministic CPU, input masks and individual combat data. `main.ts` handles browser input/recording; `render.ts`, `powerArt.ts`, `teamSpecial.ts` and `stage.ts` handle presentation. `storyMode.ts` controls placeholder navigation/progression. The November1 follow-up also tuned movement and downward aerial-attack timing; see MOVEMENT-TUNING.md. `higgsfieldRig.ts` and old labs remain for provenance; they are not the active 21-fighter render path.

## What was actually verified

Commands passed:

```sh
npm run qa
npm run build
node scripts/pose-atlas-smoke.mjs
python3 art/pose-atlases/verify_pose_assets.py
git diff --check
```

Core checks include 441 matchups × 3 modes × 360 frames,105 per-fighter power cases, direction/throw/movement/combos/replay, KO/timeout and story-controller paths. Pose checks cover840 valid image entries, all 21 gait/stop behaviors, all 441 bounded/non-mutating contact transforms and loading failures. These checks do not establish artistic quality or physical controller latency.

After reconnection all21 received fresh walk/reversal/stop, jump/dash and attack/pose checks. All eight gait cells per fighter were inspected; affected join corrections were rechecked in browser. See `motion-review-first-seven-2026-11-01.md`, the November1 sections of `motion-review-middle-seven.md`, and `motion-review-last-seven-2026-11-01.md`. All21 also received a final down-air-heavy startup/extension/landing browser recheck after the last core repair. Interrupted middle-group captures were verified before consolidation.

Each fighter was individually inspected against its reference and in paused browser attack/reaction states and running playback samples. Every eight-frame gait was reviewed. The group reports distinguish exact stepped frames, normal-speed samples, mirrored facing previews and historical pre-fix evidence. An independent reviewer found the kick-recovery squat, air-head shrink and stop-pose jump; fixes were applied and affected states rechecked.

Fresh November1 main-game evidence is in `docs/evidence/2026-11-01-main/`, with actual keyboard ground/air combos, earned3-pip special, four grabs, directional melee/ranged inputs and Big Swole’s repaired dive. The normal localhost game was reloaded and played in the in-app browser; the launchd listener was independently reverified as127.0.0.1:5173/PID72746. No files were reset during reconnection.

Main-game keyboard evidence includes Morelight movement/jump/upward attack/forward throw, Golden Sproto three completed combos earning0→1→2→3pips then spending them on the partner special, original portrait selections, all four placeholder stages/ranch, story openings/back, restart and remapping restored toW. Halloween’s pumpkin and VAMP’s broken-heart projectile were visually checked; VAMP contact dealt 45 damage and displayed the slow cue. See the QA ledger for exact limits.

## Known residual limits — do not call these complete

- The gait remains guarded stance footwork, with shallow clearance and limited upper-body counter-motion. World-space foot locking and natural running animation are not established.
- Sparse whole-pose drawings still produce coarse attack transitions. Some generated head/body proportions vary. Virtuagram/Nate have weaker kick extension in some retained cells. Full frame-by-frame commercial animation quality is not approved.
- Forward grab contact is improved. Back/up/down still reuse the release drawing and generic victim reaction; there is no complete direction-specific paired throw atlas.
- Mirrored panels reverse asymmetrical designs. They do not constitute independent left-facing input runs or separately authored left-facing art. Every possible overlap/hitbox-to-sprite combination was not visually checked.
- Continuous-video inspection of every intermediate frame, human feel acceptance, physical controller hardware, a systematic cross-browser suite, long-duration performance and online determinism remain unverified. The campaign was not won end-to-end manually; progression/result logic has automated coverage.
- Three Higgsfield AutoSprite animation attempts failed without a returned reason or usable output. No output from those jobs is installed. Successful whole-pose generation is separate. Exact IDs are in the QA ledger/`autosprite-attempts.json`. Reference-upload permission was resolved and is not a current blocker.

Do not resurrect the old limb rig to fill missing animation. Do not overwrite corrected PNGs with an unreviewed bulk import. Original source sheets and explicit correction baselines are preserved; a clean one-command art rebuild is not provided. This handoff records the completed implementation/checks and remaining quality gaps honestly; it is not a blanket claim that animation now meets the user’s final bar.

## Delivery checkpoint

After the final changes the ordinary URL was opened again, Big Swole selected against Morelight in standing practice, and actual keyboard movement verified. The tab was left visible as a deliverable. `docs/evidence/2026-11-01-main/ready-to-play.png` shows that running build; the sampled browser error/warning log was empty. The verified background server remains PID72746 on localhost only. The local Git checkpoint contains this report, source, asset baselines and the per-fighter evidence; its hash is reported in the final delivery message. No pending or denied operation blocks local play.

Raw AX/CSV evidence retains its original whitespace and line endings. `.gitattributes` limits whitespace exceptions to those captured evidence formats; source and authored documentation retain normal whitespace checks.
