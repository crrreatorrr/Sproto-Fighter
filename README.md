# Sproto Arena

**Current work-in-progress snapshot:** published at the user's request before final QA. The duo CPU approach and blue kick recovery still need correction, and two throw-test fixture groups fail. See [the handoff](docs/CLAUDE-HANDOFF.md) for exact status.

An offline browser fighting-game prototype made with TypeScript and Canvas 2D, without a game engine. The repository is named **Sproto Fighter**; the game's visible title remains **Sproto Arena**.

There are **22 selectable fighters**, including Sproto Duo: two independently animated bodies sharing one player, health bar, input stream and combat state. The other fighters have individual attack profiles, powers and Team Specials. Character selection uses the original supplied portraits. Combat uses local complete-body pixel pose images; no generation service is needed to play.

## Run locally

Use Node.js 22 or newer:

```sh
npm ci
npm run dev -- --port 5173 --strictPort
```

Open **http://127.0.0.1:5173/** on the same computer. Keep the server terminal running. On macOS, after installing dependencies, `Play Sproto Arena.command` also starts the game and opens the browser. This repository does not deploy or host the game.

```sh
npm run build
npm run preview -- --port 4173
```

The production preview is then available at http://127.0.0.1:4173/.

## Play

Select your fighter, CPU rival, stage and rival behavior, then choose **Start fight**. Random fighter changes the selected side; random stage changes both the preview and next arena. Practice offers standing and guarding dummies. Rounds have **no timer** and end on knockout. There is no local second-player or online mode. Five fighters are locked until you own the matching hub Relics (see Hub link).

| Action | Keyboard | Standard gamepad |
| --- | --- | --- |
| Move / hold away to block | A / D | Stick / D-pad |
| Jump | W | Up, including diagonals |
| Crouch / low guard | S | Down |
| Light | J | South |
| Medium / kick | K | West |
| Finisher | L | East |
| Launcher | U | North |
| Ranged power | I | Right bumper |
| Grab | O | Left bumper |
| Team Special | P | Right trigger |
| Dash | Left Shift | Left trigger |
| Pause | Escape | Start |

Keyboard and gamepad attack buttons can be remapped in **Controls**. Settings persist in browser storage. Holding jump through landing does not jump again. A two-frame chord window lets W + attack select a directional attack instead of an accidental jump.

- W + J: rising strike; W + forward + K: upward diagonal strike.
- S + J/K: low attacks; S + L: sweep. Air S + K/L starts a dive on the first active frame.
- O catches and throws a close grounded opponent. Neutral/forward tosses, back switches sides, W lifts, S slams. Direction is captured on press; a miss recovers normally. Incoming projectiles can interrupt a hold.
- I uses the fighter's power. Golden Sproto, Morelight, Juicy, Jahon and Crapto spit horizontally even while airborne or holding a direction. Other powers retain their own trajectories, including Halloween 2008's pumpkins and VAMP's slowing broken hearts.
- After a confirmed hit, Shift permits one dash cancel per combo. Attacks buffer for 14 simulation frames. Repeated lights and move reuse are limited to prevent endless routes.

Try J → K → L close to a standing dummy, pressing each as the previous hit connects. Then try U → W → J → K → L for an aerial route. A completed combo of **at least three damaging hits ending with a finisher earns one pip**. Three pips allow P to call a partner cameo and the selected fighter's Team Special. Whiffs, blocks, time and the special itself do not charge it. There is no teammate switching or second teammate player.

## Hub link (Metaverse Hub)

Sproto Fighter is the fifth game in [Metaverse Hub](https://github.com/crrreatorrr/metaverse-hub). In the hub you enter it by walking up to the arcade cabinet in the **Bar** and pressing **E**. The hub opens this game with a one-time portal ticket (`#t=`), the same flow as the other games. The vendored client is `vendor/hub-sdk` (see its `VENDOR.md`); the hub game id is `sproto-fighter`.

- **Relic:** win **Story World 1 (Tidebreaker Marina)** on a hub visit to earn the **Tidebreaker Belt**. The server grants it once per player. It sits on a plinth beside the Bar's arcade cabinet.
- **Tickets:** every win against a fighting CPU (story or CPU sparring) earns 20 Tickets. Practice dummies, losses and draws earn nothing.
- **Return to hub:** the header button closes the hub session and opens `<hub>#from=sproto-fighter`, which puts you back at the cabinet.
- **Fighters unlocked by other games' Relics.** The other 17 fighters are always playable, and the CPU rival can use any fighter.

| Relic (game) | Unlocks |
| --- | --- |
| HPOS10I Core (HPOS10I) | Halloween 2008 |
| Genesis Block Shard (The People's Bitcoin) | $Bitcoin Obama |
| Cone's Tip (NOBU: Saviour Dog) | Big Swole |
| Tinubu's Crown (Sproto Duel) | Bongraker |
| All four of the above | Sproto Duo |

The Tidebreaker Belt unlocks nothing here (a Relic never unlocks things in the game that awards it). Played without the hub, the game uses the Relic list from this browser's last hub visit, so fighters locked on a fresh browser stay locked until a hub visit confirms the Relics. The mapping is `src/hub/roster.ts`.

Build settings: `VITE_HUB_URL` (hub page, default `/hub/`) and `VITE_NAKAMA_URL` (default `http://127.0.0.1:7350`). The build uses a relative base, so it runs at the site root, at the hub's dev path `/play/sproto-fighter/`, or at `https://play.<domain>/sproto-fighter/`. The `Web build` workflow uploads `dist` as the `web-build` artifact that the hub's `npm run fetch:sproto-fighter` downloads.

## Worlds and presentation

Four story worlds are selectable: Tidebreak Marina, Last Light Bar, Moonkeep Castle and Neon Tomorrow. Story text and between-level scenes are explicitly static placeholders. Wins progress; losses/draws retry. Progress lasts for the current session. Free play also offers Amber Ranch. Stage panoramas are static pixel art.

The red/blue/yellow selection screen includes original portraits, opposing combat previews, actual kit stats, stage thumbnails, random choices and keyboard/controller navigation.

## Architecture

- `src/core.ts`: fixed 60 Hz serializable combat simulation, frame-indexed input, fighter kits, throws, projectiles, combos, reactions and deterministic CPU.
- `src/main.ts`: input collection, buffering, pause/restart, menus, recording and replay helpers.
- `src/poseAtlas.ts`: full-body pose playback, travel-based gait, presentation clips and the duo's lead/support choreography and visual spacing.
- `src/render.ts` / `src/powerArt.ts`: Canvas combat, effects and stage rendering.
- `src/selectionMenu.ts` / `src/arcadeSelection.css`: character/stage selection and stats.
- `src/storyMode.ts`: four-world navigation and placeholder progression.
- `public/fighters/pose-atlas.json`: installed body frames, anchors, gait and event mappings. The duo has two body entries but one playable roster slot.

The fixed-step core supports later networking experiments; it is **not online-ready**. There is no transport, matchmaking, rollback, remote input or cross-browser determinism guarantee.

## Checks and review tools

```sh
npm run check
npm test        # Vitest: hub roster locks, round reporting, hub link
npm run qa
node scripts/duo-smoke.mjs
node scripts/pose-atlas-smoke.mjs
node scripts/event-clips-smoke.mjs
node scripts/presentation-smoke.mjs
node scripts/selection-menu-smoke.mjs
node scripts/stage-preview-smoke.mjs
python3 art/pose-atlases/verify_pose_assets.py
```

The Python asset checker additionally needs Pillow. The game and build do not.

Add `?qa` to the game URL for visible status, freeze and single-frame controls. The development pages `art/pose-atlas-lab.html` and `art/animation-event-lab.html` exercise the same runtime rendering with scenario controls. They are fixtures, not ordinary matches.

See [the factual handoff](docs/CLAUDE-HANDOFF.md), [duo verification](docs/DUO-QA.md) and [fighter kits](docs/FIGHTER_KITS.md) for actual coverage and limits.

## Prototype limits

The first 21 fighters use 32 main pose slots plus eight locally derived guarded-step frames. Golden Sproto and Morelight have additional authored event clips. The remaining 19 event upgrades were stopped at the user's request; their existing playable art is preserved.

Sproto Duo uses two complete-body atlases, four authored walking keys per body, and individual intro, special, cast, recoil and defeat clips. Some slots and terminal holds intentionally reuse drawings. These are sparse pose animations, not continuous generated video or a full joint rig. Foot locking, natural strides and attack in-betweens remain limited. The two bodies share a simplified combat envelope and can draw wider during floor/special poses.

Physical controller hardware, exhaustive cross-browser testing, long-duration performance, final story/cutscenes, audio, competitive balance and online play remain outside the verified scope. Automated checks do not establish artistic quality or subjective feel.
