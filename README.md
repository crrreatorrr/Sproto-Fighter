# Sproto Arena — local combat prototype

Original browser-based, side-view 2D fighter in TypeScript + Canvas 2D. No game engine. This is an offline first slice, with a pixel-art **Amber Ranch** stage and animated pixel sprites based on all supplied references. The latest scope includes **21 selectable fighters**, each with its original supplied image on the selection screen and a fighting animation set. All 21 have individual attack profiles, powers and contact timing; see [fighter kits](docs/FIGHTER_KITS.md). Four selectable story worlds use static placeholder scenes and stages; the ranch remains a free-play bonus.

**Latest animation update: 2 of 21 new event sets are installed.** Golden Sproto and Morelight now have new intro, special, cast, recoil and defeat frames, with separate presentation timing and a visible defeat sequence before results. The other 19 retain their existing playable art; their new generation is blocked by reference-upload approval. See [current event QA](docs/ANIMATION-EVENT-QA.md) and [handoff](docs/CLAUDE-HANDOFF.md) for exact coverage, cost and limitations.

## Run

On this Mac, double-click **Play Sproto Arena.command** in this project folder. It opens the browser if the game is already running; otherwise it starts the local server and opens the game. Keep its Terminal window open while playing. Control-C stops a server started by the launcher.

Manual alternative (Node.js 22+; dependencies already installed):

```sh
cd /Users/kenhiraoka/Documents/Codex/2026-10-31/task/neon-relay
npm run dev -- --port 5173 --strictPort
```

Open **http://127.0.0.1:5173/** in Chrome, Safari or Edge on this same Mac, then click **Enter the arena**. The URL only works while the local server is running; it is not a published website. Chrome was verified earlier; the ordinary game was reloaded and played in the in-app browser on November1. No full cross-browser compatibility suite was performed.

The current recovery session runs under macOS launchd job `com.sprotoarena.local`, independent of the assistant's temporary shell. It remains available for this login session; after logout/reboot use the launcher above. To stop that background job deliberately, run `launchctl remove com.sprotoarena.local` in Terminal. Its logs are `/tmp/sproto-arena-server.log` and `/tmp/sproto-arena-server-error.log`. No boot/login startup file or external hosting was installed.

`npm run build` checks TypeScript and creates the production bundle. `npm run qa` repeats the current-update checks. `node scripts/pose-atlas-smoke.mjs` checks pose playback and loading failures; `python3 art/pose-atlases/verify_pose_assets.py` checks the installed image contract.

For the new event pilot, run `node scripts/presentation-smoke.mjs` and `node scripts/event-clips-smoke.mjs`. The [event review lab](http://127.0.0.1:5173/art/animation-event-lab.html) shows both facings, frame stepping, normal playback and full combat rendering; missing new clips are labeled. It is a development fixture, not a normal match.

## Play

Choose any of the 21 fighters; each selection describes its attack and power style. Choose an opponent explicitly or use Auto matchup. Common controls and combo rules make it easy to switch fighters, while attack profiles, projectile behavior and specials differ. See the fighter-kit guide for the full roster.

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

CPU mode has a 99-second round and a result/restart screen. Practice has no timer and restores dummy health periodically outside a combo. A knockout still ends the practice round; Restart resets health and meter. Pause also happens when the window loses focus. Changing fighter or opponent behavior starts a fresh round.

## Implementation

- `src/core.ts`: serializable combat state, move data, deterministic CPU, and `step(state, [p1Mask, p2Mask])` at 60 Hz. No wall clock, DOM, renderer, or random calls.
- `src/main.ts`: keyboard/gamepad input, fixed-step accumulator, menus, control storage, and frame-indexed recording. Pauses while hidden; catches up at most 100 ms after a delayed animation callback.
- `src/render.ts`: HUD, impact effects, and teammate cue.
- `src/poseAtlas.ts`: complete-body pose playback, optional eight-frame footwork sequences, signed gait phase, foot anchors and atomic asset loading.
- `src/higgsfieldRig.ts`: superseded cutout renderer retained for provenance/undeclared-art fallback; the installed 21-fighter manifest takes priority.
- `src/originalPortraits.ts`: explicit mapping of the 21 original references used by character selection.
- `art/pose-atlases/`: source sheets, connected-component importer, targeted identity/footwear corrections and reproducible guarded-step authoring.
- `src/stage.ts`: original ranch environment plus four clearly labeled placeholder stages; `src/storyMode.ts` controls world selection and static scene/progression panels.
- `src/style.css` / `index.html`: responsive combat-lab shell.

Development console helpers: `neonRelay.snapshot()` returns a copied state, `neonRelay.replay()` returns initial configuration + input masks, and `neonRelay.verifyReplay()` re-simulates recorded input and compares state. This structure makes later rollback exploration easier; it does **not** establish cross-browser determinism or online readiness. There is no transport, matchmaking, synchronization, rollback, or remote input handling yet.

## Scope and next steps

Implemented: 21 selectable player/opponent slots; CPU and standing/guard practice; ground/air chains; launcher chase; grabs; ranged attacks; dash; blocking; combo-earned Team Special; keyboard/gamepad polling; remapping; pause/restart; original ranch stage.

All 21 fighters now use complete-body pose atlases generated through Higgsfield from their original references, with local pixel corrections. Each has 32 main pose slots and eight additional guarded-step frames derived from its neutral art. Four main walk slots duplicate selected step frames; these are not 40 independently hand-drawn poses. Runtime limb cutouts are bypassed for the installed roster. This is a substantial prototype art rework, but sparse attack in-betweens, direction-specific paired throws and some air-pose proportions remain limited. Do not treat successful loading or tests as artistic approval.

Character selection uses the original submitted images with preserved aspect ratio. The withdrawn rigging diagram and bug screenshots are excluded. Halloween 2008 throws bouncing pumpkins; VAMP uses broken-heart waves that temporarily slow movement. Other kits include returning shots, ground attacks, pulls, drain and advancing specials. The whole-pose audit is recorded in [SPRITE-REWORK-QA.md](docs/SPRITE-REWORK-QA.md), with the later throw/reaction and horizontal-spit pass in [THROW-REACTION-QA.md](docs/THROW-REACTION-QA.md). Earlier ART_QA and MOVEMENT-RIG-QA documents describe the superseded cutout implementation, not acceptance of this rework.

Deferred: sound, physical-controller verification, local versus, online 1v1, multi-round sets, final story/cutscenes and competitive balance. The deterministic core is a foundation for later networking exploration, not proof of online readiness.

## Story and stage selection

**Story worlds** opens four directly selectable locations: Tidebreak Marina (yacht/beach), Last Light Bar, Moonkeep Castle, and Neon Tomorrow (retrofuturistic). Each opens a labeled static placeholder scene. Wins advance to the next scene; losses/draws offer retry. Progress lasts for this session only. No final story or cutscene animations have been authored. **Free-play levels** selects any of these stages or Amber Ranch without story progression. Back/Escape returns through the flow; browsing preserves pause state and leaving story restores prior practice behavior.

## Current-update verification

`npm run build` checks TypeScript and the production bundle. `npm run qa` runs combat, direction, throw, movement, story and per-fighter power checks. The broad scripted matrix covers all 441 player/opponent pairings in three behavior modes for 360 frames each (476,280 interaction frames). This is systematic coverage, not every possible input sequence or matchup outcome.

Current browser checks cover all 21 player selections, per-fighter motion samples, representative keyboard movement/combos/throws/specials, original portraits, stages, story entry/back and controls. Opponent combinations and retry/result branches also have systematic core/controller checks. Full progression/ending/timeout branches are covered by controller/core checks; the campaign was not won end-to-end manually. Physical controller hardware, a systematic cross-browser suite, network play and long-duration performance remain unverified. See the current audit for exact coverage, issues fixed and remaining animation limitations. The visual reports distinguish static sheets, stepped browser frames and sampled normal-speed playback; they do not claim continuous human playtesting of every frame.

## Sprite assets and roster references

`art/pose-atlases/raw/` preserves the new Higgsfield whole-pose sheets and focused correction sheets. `public/fighters/pose-atlas.json` selects 32 local full-body PNGs plus eight footwork PNGs per fighter, all on a 256×256 canvas. `art/pose-atlases/processed/` contains normalized art, authoring metadata and review evidence. The [whole-pose review lab](http://127.0.0.1:5173/art/pose-atlas-lab.html) runs the real combat core with stepping, looping scenarios and mirrored facing views. See [sequence format](docs/pose-atlas-sequences.md).

`art/higgsfield/`, its older rig labs, and `art/exports/` preserve superseded artwork and implementation for provenance. They are not the currently installed whole-pose renderer. The running game loads only local assets and needs no image-generation service.

`art/roster-manifest.json` preserves all 21 exact Library reference IDs, local paths, appearance constraints and names. No remote repository, deployment, publication or merge was created.

### Current movement and rig repair

See [current movement tuning](docs/MOVEMENT-TUNING.md) and [current sprite QA](docs/SPRITE-REWORK-QA.md). The older [cutout ledger](docs/MOVEMENT-RIG-QA.md) and old movement lab describe the prior rig. Use the whole-pose review lab linked above for current sprite evidence. Add `?qa` to the main game URL for visible status, freeze and single-frame controls. Normal play does not show these controls.

The November1 update repairs eight observed walking-frame defects and increases walk speed15%, with faster starts/reversals and a shorter dash cooldown. All21 fighters received individual current movement checks, including the repaired downward aerial attacks. [Detailed factual handoff](docs/CLAUDE-HANDOFF.md) records changed files, evidence and residual limits.
