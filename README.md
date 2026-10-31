# Neon Relay — local combat prototype

Original browser-based, side-view 2D fighter in TypeScript + Canvas 2D. No game engine. This is an offline first slice, with a pixel-art **Amber Ranch** stage and animated pixel sprites based on the first two supplied references. The latest scope includes **15 selectable fighters**: seven reference-based pixel sprite sets and eight clearly labeled generic placeholders. Fighters 3–15 use the shared Golden Sproto combat kit.

## Run

Requires Node.js 22+ and npm. Dependencies are already installed in this checkout.

```sh
cd /Users/kenhiraoka/Documents/Codex/2026-10-31/task/neon-relay
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://127.0.0.1:5173). Click **Enter the arena**. `npm run build` checks TypeScript and creates `dist/`; `npm run preview` serves that build locally. The dev server binds only to loopback.

## Play

Choose **Golden Sproto** (faster movement and dash), **Morelight** (faster, stronger projectile), or any later roster slot using the shared Golden Sproto powers. Choose the opponent explicitly or use Auto matchup for the other fighter. The roster shares a foundation move set; full individual move lists remain future work.

| Action | Keyboard | Standard gamepad |
| --- | --- | --- |
| Move / hold away to block | A / D | Left stick / D-pad |
| Jump | Space | Up |
| Crouch / low guard | S | Down |
| Light / crouching low | J | South (0) |
| Medium | K | West (2) |
| Finisher / crouching sweep | L | East (1) |
| Launcher | U | North (3) |
| Bolt (also usable in air) | I | Right bumper (5) |
| Ground grab | O | Left bumper (4) |
| Team Special | P | Right trigger (7) |
| Dash | Left Shift | Left trigger (6) |
| Pause | Escape | Start (9) |

**Controls & remapping** changes keyboard bindings and gamepad attack buttons. Duplicate assignments swap. Settings persist in browser localStorage. Movement stays on the gamepad stick/D-pad; Start remains pause. Escape cancels a remap; Tab and Enter remain reserved for interface navigation. Keyboard and controller can both drive the same player. There is no local second-player mode.

### First routes to try

Select **Practice · standing dummy**, walk close, then tap J → K → L as each hit connects (roughly 0.18–0.22 seconds apart). Don't press all three simultaneously. Confirmed hits or blocks allow ascending attack cancels. Attacks buffer for 10 simulation frames; hit-stop adds a short impact pause.

Try U → Space → J → K → L for a four-hit aerial route. The launcher can cancel into a chase jump after connecting. Jump input also buffers through hit-stop. Light, medium, and finisher become distinct aerial attacks when airborne. Crouching light and sweep provide low options. High bolts can be ducked. Ground throws beat guard at close range, but cannot throw a target already in hit/block stun or in the air.

### Relay charge

A combo is consecutive damaging hits before the opponent exits hit-stun. **At least three hits, with the final damaging hit a designated finisher**, earn one pip when the combo ends. Heavy, sweep, and aerial heavy are finishers (grab is designated too, but cannot grab out of hit-stun). At three pips, P consumes all charge to call a brief teammate silhouette and three attack waves. There is no tag switch or teammate player. Team Specials cannot earn their own charge. No passive recharge, chip damage, blocked-hit charge, or whiff charge.

The Team Special has a forward range and can miss or be blocked. The teammate currently provides a visual relay cue; the three waves use one simplified combat hitbox. Full unique tag choreography is deferred.

CPU mode has a 99-second round and a result/restart screen. Practice has no timer and restores dummy health periodically outside a combo. A knockout still ends the practice round; Restart resets health and meter. Pause also happens when the window loses focus. Changing fighter or opponent behavior starts a fresh round.

## Implementation

- `src/core.ts`: serializable combat state, move data, deterministic CPU, and `step(state, [p1Mask, p2Mask])` at 60 Hz. No wall clock, DOM, renderer, or random calls.
- `src/main.ts`: keyboard/gamepad input, fixed-step accumulator, menus, control storage, and frame-indexed recording. Pauses while hidden; catches up at most 100 ms after a delayed animation callback.
- `src/render.ts`: HUD, impact effects, and teammate cue.
- `src/fighterArt.ts` / `src/velaArt.ts`: separate menu portraits and cached combat sprite animation frames.
- `src/stage.ts`: original ranch pixel-art environment, inspired by the supplied reference after inspecting its pixels.
- `src/style.css` / `index.html`: responsive combat-lab shell.

Development console helpers: `neonRelay.snapshot()` returns a copied state, `neonRelay.replay()` returns initial configuration + input masks, and `neonRelay.verifyReplay()` re-simulates recorded input and compares state. This structure makes later rollback exploration easier; it does **not** establish cross-browser determinism or online readiness. There is no transport, matchmaking, synchronization, rollback, or remote input handling yet.

## Scope and next steps

Implemented: 15 selectable player/opponent slots; CPU and standing/guard practice; ground/air chains; launcher chase; grabs; ranged attacks; dash; blocking; combo-earned Team Special; keyboard/gamepad polling; remapping; pause/restart; original ranch stage.

Golden Sproto and Morelight preserve the first two references: Golden Sproto has yellow skin with the requested face/clothing; Morelight has blue skin and no clothes. Fat Head Dave is visibly muscular. Zephyr omits the mini pumpkin companion and uses pumpkin-themed sprite poses. Yannix (internal ID `mox`) and Bongraker (`rune`) retain their own reference features. Dumpstar uses his supplied face and attire, omitting the objects above his shoulders. All seven authored fighters have separate menu and combat sprites, animated movement/defense states, and startup/active/recovery attack phases. Later fighter abilities and animation timing reuse the Golden Sproto kit, including Zephyr; there is no unique pumpkin gameplay system or double-jump in this shared-kit build.

**Slots 07–14 are playable generic numbered placeholders, not finished interpretations of their references.** Their exact images and requirements are preserved for replacing the art. In particular, reference 09 must omit the red backdrop and retain similar clothing, and reference 10 must retain its Christmas hat when illustrated. The placeholders do not yet satisfy those appearance details.

Deferred: finished sprite art for 07–14, unique powers, richer animation choreography, sound, physical-controller verification, local versus, online 1v1, multi-round sets, balance work, formal tests, and formal reviews. Next: play the current build, tune feel, then replace labeled placeholders with reference-based sprites.

## Development verification

Practical checks were run without creating a formal testing/review workstream:

- TypeScript compilation and Vite production build passed.
- Ground three-hit finisher routes for the original 14 selectable slots earned one pip; the added Dumpstar route also passed with three hits and one pip.
- Buffered launcher → jump → air light → air medium → air finisher produced four hits and one pip.
- Three completed qualifying combos charged three pips; Team Special consumed them and did not refill itself.
- Blocked chains, whiffs, and single-hit finishers granted zero charge; an uncharged special did not activate.
- Ground grab beat a stationary guard dummy; bolts hit standing opponents and missed crouching ones.
- An 8,000-input simulation/replay produced identical serialized state, a resolved round, and finite positions.
- Browser keyboard play visibly produced a three-hit / 173-damage combo. Control remapping changed J to H, then defaults were restored. No warning/error console entries were captured during that check.
- Browser checks also covered Bront/Zephyr, Mox/Rune, and Fighter 14 versus Fighter 07; the placeholder matchup visibly produced a three-hit / 173-damage combo. No warning/error console entries were captured.
- Dumpstar’s shared move data and three-hit charge route passed; his selected portrait and combat sprite were verified in the running browser with no warning/error logs. See `docs/dumpstar-match.jpg`.
- No physical gamepad was available for hands-on verification; controller support is implemented but hardware behavior remains unverified.

## Sprite assets and roster references

`art/exports/` contains transparent menu, combat-idle, and animation-sheet PNGs for Golden Sproto (`rivet`), Morelight (`vela`), Fat Head Dave (`bront`), Zephyr, Yannix (`mox`), Bongraker (`rune`), and Dumpstar. Each has a dev-server preview at `/art/<name>-preview.html` with PNG download links. Atlas rows follow the exported `*_ANIMATIONS` maps. These are compact authored pose animations, not hand-painted in-between animation for every simulation frame. The game creates and caches the same pixel frames at runtime; there are no external art/network dependencies.

`art/roster-manifest.json` preserves all fifteen exact Library reference IDs, local readable image paths, and appearance constraints. `art/references/` also includes the ranch reference. All have been visually inspected. User-specified names are mapped to exact reference IDs in the manifest; other names remain working project labels. References 07–14 still use clearly labeled placeholder sprites.

`docs/ROSTER.md` records the latest scope. `docs/playable-build.jpg` shows the actual browser build. No remote repository, deployment, publication, or merge was created.
