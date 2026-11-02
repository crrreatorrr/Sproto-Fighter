# Sproto Arena — local combat prototype

Original browser-based, side-view 2D fighter in TypeScript + Canvas 2D. No game engine. This is an offline prototype with **102 installed fighters**, recruited through a 100-encounter story route, each with its original supplied image on the selection screen and a fighting animation set. The roster has individual attack profiles, powers and contact timing; see [fighter kits](docs/FIGHTER_KITS.md). Seven story locations now use static stage panoramas; story text and cutscenes remain explicit placeholders. The original pixel-art **Amber Ranch** remains a free-play bonus.

The selection screen follows the supplied reference's compact arcade composition: centered **MEMBER SELECT**, opposing fighters, side statistics and a dense portrait grid in red, blue and yellow, with a code-drawn pixel frame, square buttons and a locally bundled Pixelify Sans font across menus, dialogs and the combat HUD. **Stage selection and Start fight sit above the fighter preview and roster**, with keyboard/gamepad routes matching that order. It retains random fighter/stage choices. The font and its SIL Open Font License are bundled under public/fonts; runtime font loading needs no external service. See [pixel menu QA](docs/PIXEL-MENU-NOV02-QA.md). Selecting a stage changes the preview and the next match's arena. All rounds are untimed and end on knockout. See the [latest layout verification](docs/MENU-REFERENCE-REVISION.md) and [prior menu/gameplay checks](docs/MENU-QA.md).

The original Sproto Duo and the new twin/triple selections use separate animated bodies with shared health and controls. The November 2 expansion adds all 47 folder references and the subsequent named submissions. [Expansion verification and limitations](docs/SPROTOS-EXPANSION-QA.md).

**November 2 roster update:** reference-based core, guarded movement and event animation sets are installed for the expansion. Twins receive additional dash, jump, heavy, aerial and victory drawings. See [expansion QA](docs/SPROTOS-EXPANSION-QA.md) for exact coverage and corrections. Earlier dated reports below describe prior builds.

**Pissing Sproto update:** #3152 now has 32 dedicated assist drawings and partners with 34 Sprotos, including #2322. [Partner animation QA](docs/PISSING-SPROTO-ASSIST-QA.md).

**Partner relay:** 34 Sprotos, including #2322, now coordinate Pissing Sproto, Vmudream screen lasers, the small #3181 yellow strike and the large stomach-creature finisher. [Relay QA](docs/PARTNER-RELAY-QA.md).

## Run

On this Mac, double-click **Play Sproto Arena.command** in this project folder. It opens the browser if the game is already running; otherwise it starts the local server and opens the game. Keep its Terminal window open while playing. Control-C stops a server started by the launcher.

Manual alternative (Node.js 22+; dependencies already installed):

```sh
cd /Users/kenhiraoka/Documents/Codex/2026-10-31/task/neon-relay
npm run dev -- --port 5173 --strictPort
```

Open **http://127.0.0.1:5173/** in Chrome, Safari or Edge on this same Mac. Choose your fighter, CPU rival, stage and rival behavior, then click **START FIGHT**. The URL only works while the local server is running; it is not a published website. The new menu was checked in Chrome and the in-app browser on November 1. No full cross-browser compatibility suite was performed.

The current recovery session runs under macOS launchd job `com.sprotoarena.local`, independent of the assistant's temporary shell. It remains available for this login session; after logout/reboot use the launcher above. To stop that background job deliberately, run `launchctl remove com.sprotoarena.local` in Terminal. Its logs are `/tmp/sproto-arena-server.log` and `/tmp/sproto-arena-server-error.log`. No boot/login startup file or external hosting was installed.

`npm run build` checks TypeScript and creates the production bundle. `npm run qa` repeats the current-update checks. `node scripts/pose-atlas-smoke.mjs` checks pose playback and loading failures; `python3 art/pose-atlases/verify_pose_assets.py` checks the installed image contract.

For selection and stage regressions, run `node scripts/selection-menu-smoke.mjs` and `node scripts/stage-preview-smoke.mjs`.

For the new event pilot, run `node scripts/presentation-smoke.mjs` and `node scripts/event-clips-smoke.mjs`. The [event review lab](http://127.0.0.1:5173/art/animation-event-lab.html) shows both facings, frame stepping, normal playback and full combat rendering; missing new clips are labeled. It is a development fixture, not a normal match.

## Play

Start with Golden Sproto or Fat Head Dave. Defeat each story rival to unlock that fighter permanently for P1; the CPU rival picker supports the complete installed roster. Each selection describes its attack and power style. Use **P1 / Your fighter** and **CPU / Your rival** to choose either side, or use **Random fighter** for the selected side. **Random stage** picks from all ten stages. Random P1 selection uses recruited fighters only. Common controls and combo rules make it easy to switch fighters, while attack profiles, projectile behavior and specials differ. See the fighter-kit guide for the full roster.

In selection, use arrows to move focus, Enter to select and Tab to change sections. On a controller, stick/D-pad navigate, A selects, B returns to the player side, X switches side and Start focuses the launch button. Release menu inputs before entering combat. **Fighter select** returns from a match without automatically starting another round. The header also opens the seven-location story route and standalone level selector.

| Action | Keyboard | Standard gamepad |
| --- | --- | --- |
| Move / hold away to block | A / D | Left stick / D-pad |
| Jump | W | D-pad up / stick up (including diagonals) |
| Crouch / low guard | S | Down |
| Light / crouching low | J | South (0) |
| Medium | K | West (2) |
| Finisher / crouching sweep | L | East (1) |
| Launcher | U | North (3) |
| Ranged power (ground / air) | I | Right bumper (5) |
| Ground grab | O | Left bumper (4) |
| Team Special | P | Right trigger (7) |
| Dash | Left Shift | Left trigger (6) |
| Pause | Escape | Start (9) |

**Controls & remapping** changes keyboard bindings and gamepad attack buttons. Duplicate assignments swap. Settings persist in browser localStorage. Movement stays on the gamepad stick/D-pad; Start remains pause. Escape cancels a remap; Tab and Enter remain reserved for interface navigation. Keyboard and controller can both drive the same player. W jumps once per press; holding it through landing does not jump again. Diagonal direction + W also jumps. There is no local second-player mode.

### First routes to try

Select **Practice · standing dummy**, walk close, then tap J → K → L as each hit connects (roughly 0.18–0.22 seconds apart). Don't press all three simultaneously. Confirmed hits or blocks allow ascending attack cancels. Light can also chain to a second light or crouching light. Attacks buffer for 14 simulation frames; hit-stop adds a short impact pause.

Try U → W → J → K → L for a four-hit aerial route. The launcher can cancel into a chase jump after connecting. Jump input also buffers through hit-stop. Light, medium, and finisher become distinct aerial attacks when airborne. Crouching light and sweep provide low options. Horizontal spit can be ducked. Ground throws beat guard at close range, but cannot throw a target already in hit/block stun or in the air. O catches and holds the opponent, then releases a throw: neutral/forward sends them forward; hold back to switch sides; W lifts upward; S slams down. Direction is captured when pressing O. Damage happens on release, and incoming projectiles can interrupt the hold. Controller directions + left bumper use the same variations.

### Directional attacks and routes

- W jumps; tap it again only after releasing. Holding W through landing never repeats the jump. Controller stick/D-pad up follows the same rule, including diagonals.
- Press W + J together for a rising strike. W + forward (D when facing right, A when facing left) + K gives an upward diagonal strike. U is the dedicated rising-strike shortcut. A two-frame chord window gives the attack priority over jumping; W by itself jumps.
- S + J/K gives low attacks, S + L sweeps. In the air, S + K/L chambers in the jump arc, then dives on the first active strike frame; L remains a finisher.
- I casts the selected fighter’s ranged power. Golden Sproto, Morelight, Juicy, Jahon and Crapto always spit horizontally, including in the air and while holding a direction. Other powers retain directional aiming and their own trajectories, including Halloween 2008’s arcing pumpkins. Directions are captured on press, so buffered attacks retain their intended aim.
- After a damaging hit, Shift can cancel the attack into one dash per combo. Then continue with another move. Repeating light is limited to two hits per combo; other moves can connect once per route. Damage scales down as the combo grows.

Verified routes, timed on contact: J → J → S+J → K → L; J → K → I → L at close range; U → W → J → K → L in the air. One dash cancel per combo and input retention through hit-stop also pass focused checks.

### Throws and hit reactions

O catches at close range. Hold forward/neutral for a forward toss, back for an overhead side-switch, W for a high lift, or S for a short downward slam. The four-frame catch settles the hand against the opponent before the contact pause; damage occurs once at release. Back throws first lift the victim clear of the holder. A miss recovers normally. An opponent projectile can interrupt the holder; simultaneous grabs break without damage. Up + O chooses the throw and suppresses a jump.

Ordinary hits recoil and push the opponent back. Launchers send them upward into a fall; finishers and the last Team Special contact cause a knockdown. The floor phase lasts 14 simulation frames and get-up lasts six, with damage protection during both and brief throw protection afterward. These limits prevent immediate floor/regrab loops while allowing movement as recovery ends. Throws and reactions use complete-body poses; the fall/get-up drawings remain a prototype limitation.

### Relay charge

A combo is consecutive damaging hits before the opponent exits hit-stun. **At least three hits, with the final damaging hit a designated finisher**, earn one pip when the combo ends. Heavy, sweep, and aerial heavy are finishers (grab is designated too, but cannot grab out of hit-stun). At three pips, P consumes all charge to call a brief teammate cameo and the selected fighter’s attack sequence. There is no tag switch or teammate player. Team Specials cannot earn their own charge. No passive recharge, chip damage, blocked-hit charge, or whiff charge.

The Team Special has a forward range and can miss or be blocked. The partner enters, joins the fighter’s contact sequence, then exits during recovery. The art uses complete pose frames and Canvas effects, not a generated animation video. Each fighter has an individual contact schedule, range, trajectory or status effect and matching choreography. All specials use the same readable charge rule.

CPU and practice rounds have no timer or timeout result. A knockout ends the round; a simultaneous knockout draws. Practice restores dummy health periodically outside a combo. Restart resets health and meter. Pause also happens when the window loses focus. Selection changes take effect when explicitly launching a fresh match.

## Implementation

- `src/core.ts`: serializable combat state, move data, deterministic CPU, and `step(state, [p1Mask, p2Mask])` at 60 Hz. No wall clock, DOM, renderer, or random calls.
- `src/main.ts`: keyboard/gamepad input, fixed-step accumulator, menus, control storage, and frame-indexed recording. Pauses while hidden; catches up at most 100 ms after a delayed animation callback.
- `src/selectionMenu.ts`: player/rival choices, original portrait grid, combat-data statistics, stage previews, randomization and keyboard/controller menu focus. Selection state is separate from the deterministic match.
- `src/render.ts`: HUD, impact effects, and teammate cue.
- `src/poseAtlas.ts`: complete-body pose playback, optional eight-frame footwork sequences, signed gait phase, foot anchors and atomic asset loading.
- `src/higgsfieldRig.ts`: superseded cutout renderer retained for provenance/undeclared-art fallback; the installed 21-fighter manifest takes priority.
- `src/originalPortraits.ts`: explicit mapping of the 21 original references used by character selection.
- `art/pose-atlases/`: source sheets, connected-component importer, targeted identity/footwear corrections and reproducible guarded-step authoring.
- `src/stage.ts`: original ranch plus nine static Higgsfield stage images, shared between previews and combat. Procedural labeled fallbacks remain available if optional stage images fail to load. `src/storyMode.ts` controls world selection and placeholder scene/progression panels.
- `src/style.css` / `index.html`: combat/menu shell; `src/arcadeSelection.css` supplies the latest reference-led selection composition and mobile overrides.

Development console helpers: `neonRelay.snapshot()` returns a copied state, `neonRelay.replay()` returns initial configuration + input masks, and `neonRelay.verifyReplay()` re-simulates recorded input and compares state. This structure makes later rollback exploration easier; it does **not** establish cross-browser determinism or online readiness. There is no transport, matchmaking, synchronization, rollback, or remote input handling yet.

## Scope and next steps

Implemented: 21 selectable player/opponent slots; CPU and standing/guard practice; ground/air chains; launcher chase; grabs; ranged attacks; dash; blocking; combo-earned Team Special; keyboard/gamepad polling; remapping; pause/restart; original ranch stage.

All 21 fighters now use complete-body pose atlases generated through Higgsfield from their original references, with local pixel corrections. Each has 32 main pose slots and eight additional guarded-step frames derived from its neutral art. Four main walk slots duplicate selected step frames; these are not 40 independently hand-drawn poses. Runtime limb cutouts are bypassed for the installed roster. This is a substantial prototype art rework, but sparse attack in-betweens, direction-specific paired throws and some air-pose proportions remain limited. Do not treat successful loading or tests as artistic approval.

Character selection uses the original submitted images with preserved aspect ratio. The withdrawn rigging diagram and bug screenshots are excluded. Halloween 2008 throws bouncing pumpkins; VAMP uses broken-heart waves that temporarily slow movement. Other kits include returning shots, ground attacks, pulls, drain and advancing specials. The whole-pose audit is recorded in [SPRITE-REWORK-QA.md](docs/SPRITE-REWORK-QA.md), with the later throw/reaction and horizontal-spit pass in [THROW-REACTION-QA.md](docs/THROW-REACTION-QA.md). Earlier ART_QA and MOVEMENT-RIG-QA documents describe the superseded cutout implementation, not acceptance of this rework.

Deferred: sound, physical-controller verification, local versus, online 1v1, multi-round sets, final story/cutscenes and competitive balance. The deterministic core is a foundation for later networking exploration, not proof of online readiness.

## Story and stage selection

**Story worlds** follows the canonical route in `src/stage.ts`: Trenches → Circuit Gate → Yacht → Crown Relay → Last Light Bar → Verse portal → Hatchery. The first five locations contain encounters 1–82. Paired Sprotos guard the portal in encounters 83–98, ending with the red/blue Sproto Duo. Later story locations open only after prior encounters are cleared. All ten arenas remain available for standalone free play.

Encounters 99–100 form one final gauntlet in the Hatchery: **Morelight → full health refill → Vaudream** (runtime IDs `vela` and `vaudream`). Defeat both in a single sitting without dying. A defeat, draw, reload, return to fighter select or restart during Vaudream requires fighting Morelight again. Morelight's fighter unlock survives, but there is no saved checkpoint between the bosses. The normal early encounters save immediately at KO. Replaying cleared locations keeps all earned unlocks.

Progress and recruits use browser storage (`sproto-arena-story-v1`) and survive reloads on the same origin/browser profile. If saving is blocked, story panels explicitly report session-only progress. After all 100 encounters, **God Mode** becomes available in fighter select for free play: P1 cannot lose health and has unlimited Team Special charge. The earned reward is off on reload and applies to free play. For immediate testing in any mode, open **Settings → Testing → God Mode for testing**. That setting requires no unlock; changing it restarts the current round, and test matches do not award story progress or recruit fighters. The testing setting also starts off on reload. Pauses and controls work normally. Cutscene panels remain placeholders pending approval of the separate script; no videos were generated. See [implementation and validation](docs/STORY-PROGRESSION-QA.md).


## Current-update verification

`npm run build` checks TypeScript and the production bundle. `npm run qa` runs combat, direction, throw, movement, story and per-fighter power checks. The broad scripted matrix covers all 441 player/opponent pairings in three behavior modes for 360 frames each (476,280 interaction frames). This is systematic coverage, not every possible input sequence or matchup outcome.

Cumulative browser checks cover all 21 player selections, per-fighter motion samples, representative keyboard movement/combos/throws/specials, original portraits, stages, story entry/back and controls. See the dated reports for which checks were repeated in each update. Opponent combinations, progression/ending and retry/result branches also have systematic core/controller checks; the campaign was not won end-to-end manually. The current no-timeout rule is covered by long-round core checks. Physical controller hardware, a systematic cross-browser suite, network play and long-duration performance remain unverified. The visual reports distinguish static sheets, stepped browser frames and sampled normal-speed playback; they do not claim continuous human playtesting of every frame.

## Sprite assets and roster references

`art/pose-atlases/raw/` preserves the new Higgsfield whole-pose sheets and focused correction sheets. `public/fighters/pose-atlas.json` selects 32 local full-body PNGs plus eight footwork PNGs per fighter, all on a 256×256 canvas. `art/pose-atlases/processed/` contains normalized art, authoring metadata and review evidence. The [whole-pose review lab](http://127.0.0.1:5173/art/pose-atlas-lab.html) runs the real combat core with stepping, looping scenarios and mirrored facing views. See [sequence format](docs/pose-atlas-sequences.md).

`art/higgsfield/`, its older rig labs, and `art/exports/` preserve superseded artwork and implementation for provenance. They are not the currently installed whole-pose renderer. The running game loads only local assets and needs no image-generation service.

`art/roster-manifest.json` preserves all 21 exact Library reference IDs, local paths, appearance constraints and names. No remote repository, deployment, publication or merge was created.

### Current movement and rig repair

See [current movement tuning](docs/MOVEMENT-TUNING.md) and [current sprite QA](docs/SPRITE-REWORK-QA.md). The older [cutout ledger](docs/MOVEMENT-RIG-QA.md) and old movement lab describe the prior rig. Use the whole-pose review lab linked above for current sprite evidence. Add `?qa` to the main game URL for visible status, freeze and single-frame controls. Normal play does not show these controls.

The November1 update repairs eight observed walking-frame defects and increases walk speed15%, with faster starts/reversals and a shorter dash cooldown. All21 fighters received individual current movement checks, including the repaired downward aerial attacks. [Detailed factual handoff](docs/CLAUDE-HANDOFF.md) records changed files, evidence and residual limits.

- Yannix uses a horizontal mind beam from his forehead instead of spit. It stays attached during the jump arc, reaches 520 world pixels, and hits once per cast. Standing guard blocks it and crouching ducks it.
