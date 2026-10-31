# Sproto Arena — local combat prototype

Original browser-based, side-view 2D fighter in TypeScript + Canvas 2D. No game engine. This is an offline first slice, with a pixel-art **Amber Ranch** stage and animated pixel sprites based on all supplied references. The latest scope includes **21 selectable fighters**, each with its original supplied image on the selection screen and a fighting animation set. All 21 have individual attack profiles, powers and runtime choreography; see [fighter kits](docs/FIGHTER_KITS.md). Four selectable story worlds use static placeholder scenes and stages; the ranch remains a free-play bonus.

## Run

Requires Node.js 22+ and npm. Dependencies are already installed in this checkout.

```sh
cd /Users/kenhiraoka/Documents/Codex/2026-10-31/task/neon-relay
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://127.0.0.1:5173). Click **Enter the arena**. `npm run build` checks TypeScript and creates `dist/`; `npm run preview` serves that build locally. The dev server binds only to loopback.

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
| Spit (also usable in air) | I | Right bumper (5) |
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
- S + J/K gives low attacks, S + L sweeps. In the air, S + K/L commits to a downward dive; L remains a finisher.
- I spits an original green glob from the mouth. Hold direction(s) with I to aim straight up, diagonally up/down, straight down, or horizontally. Directions are captured on press, so buffered attacks retain their intended aim.
- After a damaging hit, Shift can cancel the attack into one dash per combo. Then continue with another move. Repeating light is limited to two hits per combo; other moves can connect once per route. Damage scales down as the combo grows.

Verified routes, timed on contact: J → J → S+J → K → L; J → K → I → L at close range; U → W → J → K → L in the air. One dash cancel per combo and input retention through hit-stop also pass focused checks.

### Relay charge

A combo is consecutive damaging hits before the opponent exits hit-stun. **At least three hits, with the final damaging hit a designated finisher**, earn one pip when the combo ends. Heavy, sweep, and aerial heavy are finishers (grab is designated too, but cannot grab out of hit-stun). At three pips, P consumes all charge to call a brief articulated teammate and three attack waves. There is no tag switch or teammate player. Team Specials cannot earn their own charge. No passive recharge, chip damage, blocked-hit charge, or whiff charge.

The Team Special has a forward range and can miss or be blocked. The partner enters with a dash, joins two strikes and a final burst at combat frames 12/27/42, then exits during recovery. The art uses runtime articulated cutouts and effects, not a generated animation video. Each fighter has an individual contact schedule, range, trajectory or status effect and matching choreography. All specials use the same readable charge rule.

CPU mode has a 99-second round and a result/restart screen. Practice has no timer and restores dummy health periodically outside a combo. A knockout still ends the practice round; Restart resets health and meter. Pause also happens when the window loses focus. Changing fighter or opponent behavior starts a fresh round.

## Implementation

- `src/core.ts`: serializable combat state, move data, deterministic CPU, and `step(state, [p1Mask, p2Mask])` at 60 Hz. No wall clock, DOM, renderer, or random calls.
- `src/main.ts`: keyboard/gamepad input, fixed-step accumulator, menus, control storage, and frame-indexed recording. Pauses while hidden; catches up at most 100 ms after a delayed animation callback.
- `src/render.ts`: HUD, impact effects, and teammate cue.
- `src/higgsfieldRig.ts`: source-derived 15-part rigs, two-bone limb placement, pose transitions and combat choreography.
- `src/originalPortraits.ts`: explicit mapping of the 21 original references used by character selection.
- `art/higgsfield/processed/build_rigs.py`: reproducible alpha cleanup, masks and hidden-surface repairs.
- `src/stage.ts`: original ranch environment plus four clearly labeled placeholder stages; `src/storyMode.ts` controls world selection and static scene/progression panels.
- `src/style.css` / `index.html`: responsive combat-lab shell.

Development console helpers: `neonRelay.snapshot()` returns a copied state, `neonRelay.replay()` returns initial configuration + input masks, and `neonRelay.verifyReplay()` re-simulates recorded input and compares state. This structure makes later rollback exploration easier; it does **not** establish cross-browser determinism or online readiness. There is no transport, matchmaking, synchronization, rollback, or remote input handling yet.

## Scope and next steps

Implemented: 21 selectable player/opponent slots; CPU and standing/guard practice; ground/air chains; launcher chase; grabs; ranged attacks; dash; blocking; combo-earned Team Special; keyboard/gamepad polling; remapping; pause/restart; original ranch stage.

All 21 fighters use individual Higgsfield reference-based combat art. Each supplied generation is a single pose, segmented into 15 parts and animated in Canvas; these are **not generated animation sheets**. Faces, clothing, body proportions and special appearance requirements are preserved in individual masks. Hidden surfaces are reconstructed with nearby source palette colors because the original guard poses conceal them. This remains a prototype cutout animation system, not hand-drawn animation for every move.

Character selection uses the original submitted images with preserved aspect ratio. The withdrawn rigging diagram and bug screenshots are excluded. Halloween 2008 throws bouncing pumpkins; VAMP uses broken-heart waves that temporarily slow movement. Other kits include returning shots, ground attacks, pulls, drain and advancing specials. The current-update audit is recorded in [ART_QA.md](docs/ART_QA.md), with per-fighter findings in the linked batch reports.

Deferred: sound, physical-controller verification, local versus, online 1v1, multi-round sets, final story/cutscenes and competitive balance. The deterministic core is a foundation for later networking exploration, not proof of online readiness.

## Story and stage selection

**Story worlds** opens four directly selectable locations: Tidebreak Marina (yacht/beach), Last Light Bar, Moonkeep Castle, and Neon Tomorrow (retrofuturistic). Each opens a labeled static placeholder scene. Wins advance to the next scene; losses/draws offer retry. Progress lasts for this session only. No final story or cutscene animations have been authored. **Free-play levels** selects any of these stages or Amber Ranch without story progression. Back/Escape returns through the flow; browsing preserves pause state and leaving story restores prior practice behavior.

## Current-update verification

`npm run build` checks TypeScript and the production bundle. `npm run qa` runs combat, direction, throw, movement, story and per-fighter power checks. The broad scripted matrix covers all 441 player/opponent pairings in three behavior modes for 360 frames each (476,280 interaction frames). This is systematic coverage, not every possible input sequence or matchup outcome.

Browser checks cover all 21 player/opponent selections, representative live movement/combos/throws/specials, original portraits, stages, story entry/retry/back and controls. Full progression/ending/timeout branches are covered by controller/core checks; the campaign was not won end-to-end manually. Physical controller hardware, other browsers, network play and long-duration performance remain unverified. See the audit for exact coverage, issues fixed and cutout-art limitations.

## Sprite assets and roster references

`art/higgsfield/raw/` preserves the 21 supplied Higgsfield outputs. `public/fighters/` contains 315 segmented pixel-grid PNGs plus rig metadata. `art/higgsfield/processed/configs/` stores individual semantic masks; the first two configurations are in the builder. `art/higgsfield/quality-lab.html` previews every current rig with exact move frames, directions, facing, skeleton overlay and throw states. `art/higgsfield/processed/runtime/` contains actual-renderer pose/contact/throw audit sheets, not alternative game assets.

`art/exports/` and the older `art/*-preview.html` pages preserve the **superseded procedural artwork** for provenance; they do not represent the current Higgsfield rigs. The running game loads local assets and needs no external image service.

`art/roster-manifest.json` preserves all 21 exact Library reference IDs, local paths, appearance constraints and names. No remote repository, deployment, publication or merge was created.
