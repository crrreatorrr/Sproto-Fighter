# Sproto Arena

A local TypeScript / Canvas 2D fighting game with **254 installed fighters**,
CPU/practice opponents, 70 selectable arenas and a campaign that grows with the installed roster.
No game engine, multiplayer transport or deployment.

**Satoshi Sprototo, Xalt and Poto Cai Cai** are campaign opponents with 104 drawings each, including custom entrance8, mouth-spit8 and death16 sequences. Defeat each in the Verse to recruit them for play. [Animation and combat QA](docs/LATE-NAMED-NOV02-QA.md).

**Three new Ranch maps:** Dawn Orchard, Stormwind Mill and Moonlit Creek Crossing are selectable under The Ranch and appear in its story chapter. The Ranch now has seven stage choices. Artwork and prompts: `art/ranch-nov02/`.

## Play locally

Requires Node.js 22+. On macOS you can double-click **Play Sproto Arena.command**;
otherwise, from the repository folder:

```sh
npm ci # first time, or after dependencies change
npm run dev -- --port 5173 --strictPort
```

Open **http://127.0.0.1:5173/** and keep the server terminal open. If the
Metaverse Hub dev server already uses 5173 on your machine, pick another port
(for example `--port 5200`). Saves belong to the browser origin, so each port
keeps its own progression. This is not a hosted website.

The full repository is several GB, mostly authoring art and QA history under
`art/` and `docs/evidence/`. To play or run the checks you only need a partial
clone; see `.github/ci-checkout-paths.txt` for the three commands.

## Campaign and testing

**Story worlds** opens the expanded illustrated world, fully fitted on first
open. Select a rival or region for detail; **Fit map** restores the overview.
The route grows from actual registered fighters, without inventing opponents.
High Sproto starts the campaign; Fat Head Dave is also available. Golden Sproto
is a late rival. Every story win, including a God Mode win, recruits the defeated
fighter and opens the next encounter. Locked fighters can be previewed but
cannot be P1 until recruited; CPU rival selection is unrestricted.

The first rival plays at CPU skill 2 and the route rises to 10 (`STORY_START_SKILL`
in `src/difficulty.ts`). Every third cleared encounter also recruits one fighter
from far down the route (never from the last two chapters, a gauntlet or a
Relic-only fighter), so the roster opens faster than one fighter per win; that
fighter still has to be beaten to clear their own encounter. The bonus comes
with the win itself, so loading an existing save recruits nobody. The last standard rival of each chapter fights under
that chapter's rule (double meter, low gravity, specials only, sudden death or
reflected projectiles) with a 60-second clock; the transformed bosses keep their
own rules.

The route runs Trenches → City → Yacht → Castle → Bar → Verse → Hatchery,
using the existing approved stage variations. The end of Verse is a sequential
Artdude → Artchick encounter. The final encounter is Morelight → VMU. Each
refills health for its second bout. Losing, restarting, leaving or reloading
restarts that encounter from its first opponent; the first fighter's earned
recruitment is retained. There is no saved halfway checkpoint.

Saves migrate by fighter identity into `sproto-arena-story-v3`, retaining the
original v1/v2 keys, completed encounters, recruits and previously earned God
Mode. Newly installed rivals create new gaps to clear without erasing old wins.
Continue selects the first uncleared encounter, not the number of old wins.

**Settings → Testing → God Mode for testing** is immediately available. It
prevents health loss and refills Team Special charge; changing it restarts the
current encounter. Story wins persist in either mode; free-play wins do not.
Testing mode turns off on reload. Completing the campaign also grants a durable
God Mode selection reward. God Mode does not bypass P1 recruitment locks.

The curated campaign contains exactly **250 distinct rivals across 247 encounters**,
including Artdude → Artchick, Nick → Juicy, and Morelight → VMU as sequential
pairs. The 254 registered fighters include two starters and two additional
Hub-only fighters outside the campaign. Captain Green, Sun God and Pissing Sproto
are new guardians at the ends of the Marina, Castle and Bar chapters; defeating
them advances the story while their player selection still requires the matching
Hub Relic. Existing earned recruits, wins, and God Mode rewards remain valid.
The fixed campaign order is independent of menu registration order.

The expanded 3840 × 2160 Higgsfield map uses the existing world as its reference.
All 247 encounter markers follow newly traced roads across the same eight regions;
region shortcuts and “Find next fight” zoom to readable detail. Original map
assets are retained. Boss animation sequences and the Nick/Juicy pre-fight scene
remain in their established order.

The non-story selector groups all **121 installed backgrounds** into eight zones,
including every approved story panorama and 48 new Higgsfield variations (six per zone). Story encounter previews offer a scenery chooser; the default follows contiguous regional scenery blocks. Choices are session-only and leave opponent order, combat rules and saves unchanged. Ranch has its original arena plus the
lantern-lit barn, green paddock and dusty farmhouse yard. Story scenery advances
between sequential boss bouts while preserving their order and saves. The current
route uses 60 of 61 story locations; Pearl Incubation Chamber is available in free
play, with only four Hatchery bouts currently installed.

See the [stage catalogue checkpoint](docs/STAGE-CATALOGUE-20261102.md) for exact
counts, file mappings, checks and browser-verification limits.

See [campaign expansion and browser QA](docs/CAMPAIGN-EXPANSION-UPDATE.md) for
exact coverage, isolated preview commands and pending integration work.

## Match introductions

Every fight opens with both fighters' original profile pictures and names,
including twins and each bout of the sequential story bosses. The versus preview
waits for Enter, the Continue button or gamepad A. Space and gamepad Start do not dismiss it.
A **3, 2, 1, FIGHT!** countdown follows. Entrances play during the countdown;
combat starts on FIGHT. Escape pauses either introduction. Rounds have no time limit.

## Controls

| Action | Keyboard | Controller (standard mapping) |
| --- | --- | --- |
| Move / hold away to block | A / D | Left stick / D-pad |
| Jump / crouch | W / S | Up / down |
| Light / medium / finisher | J / K / L | X / Y / B |
| Launcher | U | A |
| Ranged power | I | RB |
| Grab | O | LB |
| Team Special | P | RT |
| Dash | Left Shift | LT |
| Pause / resume | Escape | Start (either controller in local versus) |
| Send feedback | N twice | **Send feedback** in the pause menu |

| Menus | Keyboard | Controller |
| --- | --- | --- |
| Move focus | Arrow keys or W A S D (Tab also works) | D-pad or left stick (holding repeats) |
| Confirm | Enter or Space | A |
| Back / close | Escape | B |
| Fighter select: jump to Start Fight / switch P1 and rival tabs | — | Start / X |
| Partner picker: continue | Enter on Continue | Start |

The controller layout follows four-button tag fighters: Light → Medium →
Finisher rolls clockwise over X → Y → B so a chain is one thumb sweep, and the
Launcher sits on A like those games' launcher button. The left index finger
dashes on LT while the right thumb keeps attacking, so dash cancels never take
the thumb off the face buttons. Ranged power and Grab are the bumpers and the
Team Special is RT. Movement is the stick or D-pad (radial deadzone 0.2).
The pause menu has **Resume**, **Restart**, **Fighter select**, **Send feedback**
and, when the game was opened from the hub, **Return to hub**; the fighter select reaches the
header (Story worlds, Settings, Return to hub) by moving up past Random Stage.
Fight-screen prompts follow the device you used last. On the keyboard, player 1
stays on W A S D with the attacks under the right hand; the arrow keys belong to
player 2 in local versus (the story-boss forms and menus accept both).

**N twice: send feedback.** Pressing N twice (within 400 ms) freezes a local
match and opens a small feedback window with a screenshot from just before it;
closing it (Esc) puts the game back exactly where it was — fighting, paused or in a
menu. Online matches cannot pause, so there the match keeps running behind the
window. Notes go to the hub, so the window only sends when the game was opened
from the hub while signed in; standalone play shows a one-line message instead.
N cannot be bound to an action. The adapter is `src/feedback.ts`.

Plug in a controller at any time; the browser shows it after its first press.
Buttons held while a controller appears (such as the A that entered the game
from the hub) are ignored until released. Unplugging a player's controller
mid-round pauses the round. The first controller is player 1 and drives the
menus, the second is player 2; a player who reconnects keeps their side.

In a transformed story-boss form the fight controls carry over: Light or
Ranged fires the beam, Medium throws the ball, Finisher raises the shield and
Launcher (or up) jumps. The original boss keys still work: C beam, V ball, X
shield, R retry, and the arrow keys also move.

**Local versus:** choose *Local versus · Second player* as the rival behavior,
then pick player 2's fighter on the rival tab. Player 2 uses the arrow keys,
`,` `.` `/` (light, medium, finisher), `;` (launcher), `'` (ranged), `[`
(grab), `]` (Team Special) and Right Shift (dash), or a second controller (the
first controller stays player 1 and drives the menus). Local versus never
earns hub rewards and has no God Mode.

**Settings → Controls** has a tab for each player, with separate keyboard and
controller mappings. A key can belong to only one action across both players:
binding a key the other player uses swaps it. Player 2's controller buttons
are remapped from the second connected controller; Start cancels a controller
remap. Mappings save in the browser, and a saved mapping is kept as it is when
the defaults change. The online multiplayer plan is in [docs/MULTIPLAYER-PLAN.md](docs/MULTIPLAYER-PLAN.md). W jumps once per press. W+J gives a rising strike;
W+forward+K gives a diagonal strike. S+J/K gives low attacks, S+L sweeps, and
S+K/L in the air dives. O plus forward/back/W/S selects a directional throw.
Three damaging hits ending in a finisher earn one pip when the combo ends;
three pips enable the Team Special. Blocks and misses grant no charge.

Try J → K → L close to a standing dummy, or U → W → J → K → L for an air route.
Attacks buffer for 8 simulation frames, with hit/block cancels and bounded
juggles. Organic spit travels horizontally even when crouching or airborne.
Yannix emits a horizontal forehead mind beam. Other projectiles retain their
own trajectories. All rounds are untimed.

Gameplay changes are being evaluated in staged drafts described in
[the gameplay plan](docs/GAMEPLAY-PLAN-20261105.md) and [measurement notes](docs/balance/README.md).
Free fights have Easy, Normal, Hard and Expert CPU choices (Normal by default).
Story difficulty follows the actual 247-encounter route and offers an optional
easier retry after three losses on an encounter.

The fighter select's **Rules** choice switches CPU and local versus fights between
Classic (one untimed round) and **Best of 3**: best of three round wins, a
60-second combat clock, counter-hits, defense meter and just-defend. **Rival
behavior** also offers the **Tutorial** (six guided lessons on the practice dummy:
move and block, chain to a finisher, throw and tech, dash cancel, jump cancel and
quick rise, Team Special) and **Training** (exact collision rectangles,
input/advantage readouts and route recording on a standing dummy). Pausing lists
the current fighter's moves with your bindings. `/?matchDepth` and `/?training`
still switch these on by URL. Online play stays on classic rules.
[Options and validation limits](docs/MATCH-DEPTH-EXPERIMENT.md).

Sound is Web Audio (`src/audio.ts`). The main menu, character select, options
and the other front-end menus share one recorded loop
(`public/audio/music/menu_theme_loop.mp3`, 30 bars at 125 BPM). Every menu
press plays `public/audio/sfx/ui_select.mp3`. Trenches, the City, the Yacht,
the Castle, the Verse and the Bar each play a recorded fight theme on every
level in that zone, in Story and in Level Select. The theme fades in when the
fight starts and fades out when it ends or the player leaves. Loop points trim
MP3 encoder padding: the menu wraps at 57.6 seconds, Trenches at 45.000687
seconds, and Yacht, City, Castle, Verse and Bar on the 61.44 second bar (32 bars
at 125 BPM).
The yacht master is about 0.4 dB quieter, so that theme plays a little hotter.
Hits, guard, throws, projectiles, K.O. and the other fight and story music are
synthesised. Playback starts after the first key, click or button press.
Settings has master, effects and music volume.

The CPU guards a projectile in place and walks in between shots, punishes a move
it has guarded twice in three seconds, holds guard as it gets up, and stop-hits a
rival who walks in swinging. `tests/cpu-exploits.test.ts` keeps three scripted
exploits (projectile spam, walk-in mashing, crouch-and-sweep) inside win-rate
bands that must fall as difficulty rises.

## Architecture and verification

- `src/core.ts`: the public entry to the combat simulation. Import from here.
  The simulation itself is in `src/sim/` and has no DOM, clock or randomness:
  `constants.ts` (arena, physics, input bits), `roster.ts` (fighters, kits,
  grips, pair spacing; art installers edit marked blocks here), `data/*.json`
  (generated per-fighter action timing), `types.ts`, `combat.ts` (state,
  throws, damage, move selection), `cpu.ts` and `step.ts` (the fixed 60 Hz
  step, deterministic math and `hashState`). It produces identical results in
  every browser engine; `scripts/determinism-smoke.mjs` checks this.
  `tests/golden-state-hashes.test.ts` (in `npm test`) also replays the same
  scripted scenario and three long seeded CPU-vs-CPU matches and compares
  every `hashState` checkpoint with `tests/fixtures/golden-state-hashes.json`,
  both through `src/core` and through the hub's ES2015 server bundle. A
  refactor that leaves the stored state's shape alone (code renames, moves,
  derived selectors) can prove it did not change the game. The hash is taken
  over the state's JSON, so renaming, adding or reordering state fields
  changes every hash even when behaviour is identical. A deliberate
  behaviour change regenerates it locally with `UPDATE_GOLDENS=1 npx vitest run
  tests/golden-state-hashes.test.ts` (refused when `CI` is set).
- `src/poseAtlas.ts`: complete-body frame playback, paired identities, stable
  formations, camera clearance and event presentation. Paired menu
  normalization does not change fight scale. `pose-atlas.json` is the single
  source of frame data; the dev server and builds also publish it split per
  body under `/fighters/pose-atlas/` so a match loads only its own bodies.
  Loading: the selection menu loads only each pick's standing pose, and the
  full bodies once a pick has settled for 300 ms. Released builds pack each body
  into one sprite sheet with every frame's transparent margin trimmed
  (`scripts/build-sheets.py`), about a quarter of the decoded memory; frame
  metadata is never changed, and `?atlas=frames` loads the individual PNGs
  instead. The bodies of the match being played are pinned; other bodies are
  released past 16 bodies or 160 MB. See [loading measurements](docs/perf/README.md).
- `src/storyProgress.ts`, `storyMode.ts`, `campaignMap.ts`: saves, progression,
  placeholder scenes and a real 100-node map. `stageVariants.ts` maps approved
  scenes without changing opponent/save identities.
- `src/selectionMenu.ts`, `arcadeSelection.css`: original portraits, stats,
  full-height twin previews, random choices and stage selection.
- `src/teamSpecial.ts`: partner appearances and attack choreography.
- `public/`: local runtime art/fonts; no generation service is needed to play.
  The menu uses small generated WebP copies (`public/portraits/`,
  `public/stages/previews/`) instead of the 1000 px portrait PNGs and full
  stage backgrounds; a fight loads only its own background. After adding or
  changing a portrait or stage, run `python3 scripts/build-images.py`
  (needs Pillow); `portraits-smoke` and `stage-previews-smoke` catch stale copies.

### Checks

```sh
npm run check      # TypeScript
npm run test:all   # vitest, then every check under scripts/ in parallel
npm run test:fast  # the same without the four slow roster-wide audits
node scripts/run-all.mjs throw duo   # only checks whose name matches
```

GitHub Actions runs the typecheck, vitest, the build and every check on each
push to main and each pull request. Two checks guard art loading:
`fighter-budget-qa` fails a body over 176 frames or about 16 MB decoded once
trimmed, or a portrait over budget; `sheet-render-qa` needs a packed `dist/`
(`npm run build && python3 scripts/build-sheets.py dist`) and renders the
sheets against the frame PNGs in Chromium. The older grouped commands (`npm run qa`,
`npm run partners-qa`, `npm run versus-smoke`, ...) still work. Add `?qa` to
the game URL for visible diagnostics.

The dev server excludes the large static `art/`, `docs/` and `public/` archives
from watching. Reload after installing static assets. Application source still
reloads normally; dependency scanning starts at `index.html`.

Start with [the docs index](docs/README.md), which separates current
references from dated reports. See [the factual handoff](docs/CLAUDE-HANDOFF.md) for integrated branches,
checks and limitations, and [per-pair coverage](docs/PAIRED-QA-COVERAGE.csv).
The latest progression, preview-lock and responsive-map changes are recorded in
[the story/UI update](docs/STORY-UI-UPDATE.md).
Older dated reports and authoring sources are preserved as history.

No physical-controller test, per user instruction: controller support is checked with stubbed `navigator.getGamepads` only. A full manual 100-match
campaign, every frame/matchup, long sessions and systematic cross-browser
performance remain unverified. Online play is tested against a local hub only; it has
not run against a deployed hub or through a TURN server. This
integration adds no purchases, generation calls, remote push or hosting.


## Online play

Pick **Online · Find an opponent** or **Online · Wager 10 Tickets** in the
fighter select. Online play needs the hub session, so open the game from the
hub's arcade cabinet. Matches use rollback netcode over a direct WebRTC
connection, falling back to the hub relay. The hub runs the same simulation
from both players' inputs and decides the result, so wagers are paid only on
a result the server verified. Tickets have no real-money value.

- Settings → Online sets the input delay (2 frames by default; raise it on
  unstable connections).
- The status line shows the link (DIRECT or RELAY), ping and rollback frames.
- After a match, **Rematch →** pairs you with the same opponent if they choose
  it too.
- Online rounds cannot pause. Leaving a live online match forfeits it after a
  browser confirmation that a controller cannot answer. On a controller, wait
  for the result screen, then choose Rematch or press B for fighter select.

Configuration: `VITE_NAKAMA_URL` and `VITE_NAKAMA_SERVER_KEY` as below, and
optionally `VITE_ICE_SERVERS` (a JSON array of `RTCIceServer`, e.g. with a
TURN server; the default is a public STUN server). The server side is the
`sproto_duel` match on the metaverse-hub branch `claude/sproto-online-duels`;
after changing anything under `src/sim`, run `node scripts/build-sim-bundle.mjs
--out <hub>/server/modules/vendor/sproto-sim.js` so the hub and clients share
one simulation fingerprint. Design and status:
[the multiplayer plan](docs/MULTIPLAYER-PLAN.md).

With a local hub running, these play real online matches:

```sh
NAKAMA_URL=http://127.0.0.1:7350 HUB_DATABASE_URL=postgres://... node scripts/hub-duel-smoke.mjs
NAKAMA_URL=http://127.0.0.1:7350 HUB_DATABASE_URL=postgres://... node scripts/online-browser-smoke.mjs
```

## Metaverse Hub integration

The optional hub adapter uses the vendored `@metaverse/hub-sdk` 0.7.1 (see `vendor/hub-sdk/VENDOR.md`). A linked visit can return to the hub, earn Tickets for defeating a story boss, and earn the Tidebreaker Belt after defeating the first story enemy, Halloween 2008. The client reports `fighter.boss_defeated` for the ten bosses the hub lists (`STORY_BOSSES` in `src/hub/config.ts`: the three Relic guardians, Golden Sproto, the art duo, Nick, Juicy, Morelight and VMU); the server pays 20 Tickets once per boss per day and the toast shows what it credited. Ordinary CPU wins report nothing, because the hub has no rule that pays them (its `fighter_win` ceiling is 0). CPU difficulty and first-clear travel as event data for a future per-difficulty rule. Losses, draws, practice and God Mode award no hub rewards. God Mode still saves local story progression normally.

Five fighters require Hub Relics for new player recruitment:

| Relic (game) | Unlocks |
| --- | --- |
| Tinubu's Crown (Sproto Duel) | Captain Sproto |
| Cone's Tip (NOBU: Saviour Dog) or Breakwater Coin (Sproto Arcade) | Pissing Sproto |
| HPOS10I Core (HPOS10I) | Sun God |
| Genesis Block Shard (The People's Bitcoin) | Captain Green |
| All four Four Lights Relics (Crown, Tip, Core, Shard; the Coin does not count) | Error 333 |

Every other fighter, including the earlier Relic picks (Halloween 2008, $Bitcoin Obama, Big Swole, Bongraker, Sproto Duo), is recruited in story mode. The mapping is `src/hub/roster.ts`; the story campaign includes three as guardians, while `RELIC_ONLY_RECRUITS` in `src/storyProgress.ts` preserves the same five player recruitment requirements. Locked fighters remain previewable and usable as CPU opponents. A save that already recruited one of the five in an older campaign keeps it.

Rewards are reported by the game client (`src/hub/link.ts`); the server only
caps Tickets per call and per day. A linked player with browser developer
tools could make the same calls without winning a match. Whether that matters
depends on what Tickets and Relics are worth in the hub. If it does, the server
should verify wins, for example by replaying the match's frame-indexed inputs
through `src/core.ts`, which is deterministic.

Configure `VITE_HUB_URL`, `VITE_NAKAMA_URL` and `VITE_NAKAMA_SERVER_KEY` for a hub deployment. The client server key is public configuration; never put backend secrets in Vite variables. Standalone play needs no backend. The relative build base supports the root and `/play/sproto-fighter/`; the integration does not start, migrate or deploy the hub server. Run `npm test` for hub adapter checks.

## Sproto Arcade

Run `npm run dev` and open `/arcade/index.html` to choose between three games.
For offline play, open `public/arcade/index.html` in a browser.

- **Box Barrage** is the four-boss rush ending with Bot Sales. Horizontal fire is automatic. Press C for a tracking missile (2-second cooldown) and V for a tracking bomb (3-second cooldown). Colored boxes mark projectiles and rising floor hazards.
- **The Long Way Home** is the original 99-backdrop run-and-gun campaign.
- **Tidebreak Marina** is the looping pier test with a checkpoint each lap.
