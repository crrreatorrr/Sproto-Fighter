# Sproto Arena

A local TypeScript / Canvas 2D fighting game with **131 installed fighters**,
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

This local checkpoint has 131 installed entries: 129 distinct rivals across
126 encounters, including three two-opponent encounters. Nineteen additional roster
entries and their assets are still needed for the requested 150. The route grows
from registered fighters without inventing characters; at 150 entries it has 148
rivals across 145 encounters. The map also passes a synthetic 150-node fixture.
The last zone opens with Nick → Juicy, followed by Morelight → VMU. Previous
Nick/Juicy wins and recruits are retained when their old encounters regroup.
Scenes remain placeholders pending script approval. No videos or paid generations
were made by this integration. Completed work is checkpointed on local main;
the remaining roster and full live animation review are still open.

The non-story selector groups all **70 installed backgrounds** into eight zones,
including every approved story panorama. Ranch has its original arena plus the
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

| Action | Keyboard | Standard gamepad |
| --- | --- | --- |
| Move / hold away to block | A / D | Stick / D-pad |
| Jump / crouch | W / S | Up / down |
| Light / medium / finisher | J / K / L | South / west / east |
| Launcher | U | North |
| Ranged power | I | Right bumper |
| Grab | O | Left bumper |
| Team Special | P | Right trigger |
| Dash / pause | Left Shift / Escape | Left trigger / Start |

Settings supports remapping. W jumps once per press. W+J gives a rising strike;
W+forward+K gives a diagonal strike. S+J/K gives low attacks, S+L sweeps, and
S+K/L in the air dives. O plus forward/back/W/S selects a directional throw.
Three damaging hits ending in a finisher earn one pip when the combo ends;
three pips enable the Team Special. Blocks and misses grant no charge.

Try J → K → L close to a standing dummy, or U → W → J → K → L for an air route.
Attacks buffer for 14 simulation frames, with hit/block cancels and bounded
juggles. Organic spit travels horizontally even when crouching or airborne.
Yannix emits a horizontal forehead mind beam. Other projectiles retain their
own trajectories. All rounds are untimed.

## Architecture and verification

- `src/core.ts`: fixed-step 60 Hz combat, frame-indexed inputs, attacks, CPU,
  throws/reactions, God Mode, fighter profiles and assigned partner mechanics.
- `src/poseAtlas.ts`: complete-body frame playback, paired identities, stable
  formations, camera clearance and event presentation. Paired menu
  normalization does not change fight scale. `pose-atlas.json` is the single
  source of frame data; the dev server and builds also publish it split per
  body under `/fighters/pose-atlas/` so a match loads only its own bodies.
- `src/storyProgress.ts`, `storyMode.ts`, `campaignMap.ts`: saves, progression,
  placeholder scenes and a real 100-node map. `stageVariants.ts` maps approved
  scenes without changing opponent/save identities.
- `src/selectionMenu.ts`, `arcadeSelection.css`: original portraits, stats,
  full-height twin previews, random choices and stage selection.
- `src/teamSpecial.ts`: partner appearances and attack choreography.
- `public/`: local runtime art/fonts; no generation service is needed to play.

### Checks

```sh
npm run check      # TypeScript
npm run test:all   # vitest, then every check under scripts/ in parallel
npm run test:fast  # the same without the three slow roster-wide audits
node scripts/run-all.mjs throw duo   # only checks whose name matches
```

GitHub Actions runs the typecheck, vitest, the build and every check on each
push to main and each pull request. The older grouped commands (`npm run qa`,
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

No physical-controller test, per user instruction. A full manual 100-match
campaign, every frame/matchup, long sessions and systematic cross-browser
performance remain unverified. There is no online-readiness claim. This
integration adds no purchases, generation calls, remote push or hosting.


## Metaverse Hub integration

The optional hub adapter comes from the published `claude/sweet-newton-l4tjnh` work. A linked visit can return to the hub, earn 20 Tickets for an unassisted CPU win, and earn the Tidebreaker Belt after completing the first story chapter. Losses, draws, practice and God Mode award no hub rewards. God Mode still saves local story progression normally.

Five fighters come only from hub Relics and are not in story mode:

| Relic (game) | Unlocks |
| --- | --- |
| Tinubu's Crown (Sproto Duel) | Captain Sproto |
| Cone's Tip (NOBU: Saviour Dog) | Pissing Sproto |
| HPOS10I Core (HPOS10I) | Sun God |
| Genesis Block Shard (The People's Bitcoin) | Captain Green |
| All four of the above | Error 333 |

Every other fighter, including the earlier Relic picks (Halloween 2008, $Bitcoin Obama, Big Swole, Bongraker, Sproto Duo), is recruited in story mode. The mapping is `src/hub/roster.ts`; the story campaign leaves out the same five (`RELIC_ONLY_RECRUITS` in `src/storyProgress.ts`, kept equal by `tests/hub-roster.test.ts`). Locked fighters remain previewable and usable as CPU opponents. A save that already recruited one of the five in an older campaign keeps it.

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
