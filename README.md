# Sproto Arena

A local TypeScript / Canvas 2D fighting game with **102 installed fighters**,
CPU/practice opponents, ten base arenas and a linear 100-encounter campaign.
No game engine, multiplayer transport or deployment.

## Play locally

Double-click **Play Sproto Arena.command**, or run:

```sh
cd /Users/kenhiraoka/Documents/Codex/2026-10-31/task/neon-relay
npm ci # only if dependencies are missing or after a fresh clone
npm run dev -- --port 5173 --strictPort
```

Open **http://127.0.0.1:5173/** on this Mac. Keep the server terminal open.
The existing background service serves this main checkout for the current
login session. After logout/reboot use the launcher again. The isolated
integration preview uses port 5187. Saves belong to their browser
origin: 5173 and 5187 have separate progression. This is not a hosted website.

## Campaign and testing

**Story worlds** opens an illustrated, scrollable map with 100 numbered rivals.
Start with Golden Sproto or Fat Head Dave. Each normal story victory permanently
recruits that rival on this browser and opens the next encounter. Arrow keys
move between map nodes; Enter selects. Region buttons jump across the map;
**Find next fight** returns to the next available rival.

The route runs through Trenches → City/Circuit Gate → Yacht → Castle/Crown Relay
→ Bar → Verse → Hatchery. The 24 approved variations appear in regional blocks;
Bar and Hatchery retain their detailed originals. Encounters 83–98 face paired
Sprotos. The last two form one gauntlet: Morelight, then a health refill and
Vaudream. Losing, reloading or leaving this pair requires starting again from
Morelight; his fighter unlock is retained. Scenes remain placeholders pending
script approval. No cutscene videos were generated during integration.

**Settings → Testing → God Mode for testing** is immediately available. It
prevents health loss and refills special charge. Choose any CPU rival in the
menu. Changing this setting restarts the match; testing victories never recruit
fighters or advance the campaign. It turns off on reload. Finishing all 100
encounters also unlocks a separate free-play God Mode reward.

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
  formations, camera clearance and event presentation. Installed art bypasses
  runtime limb cutouts. Paired menu normalization does not change fight scale.
- `src/storyProgress.ts`, `storyMode.ts`, `campaignMap.ts`: saves, progression,
  placeholder scenes and a real 100-node map. `stageVariants.ts` maps approved
  scenes without changing opponent/save identities.
- `src/selectionMenu.ts`, `arcadeSelection.css`: original portraits, stats,
  full-height twin previews, random choices and stage selection.
- `src/teamSpecial.ts`: partner appearances and attack choreography.
- `public/`: local runtime art/fonts; no generation service is needed to play.

Run `npm run build`, `npm run qa`, `npm run partners-qa` and
`node scripts/selection-menu-smoke.mjs`. Focused formation checks are
`paired-spacing-probe.mjs`, `paired-wall-motion-smoke.mjs`, `duo-smoke.mjs`;
map/stage checks are `campaign-map-smoke.mjs` and `stage-variants-smoke.mjs`
(all under `scripts/`). Add `?qa` to the game URL for visible diagnostics.

The dev server excludes the large static `art/`, `docs/` and `public/` archives
from watching. Reload after installing static assets. Application source still
reloads normally; dependency scanning starts at `index.html`.

See [the factual handoff](docs/CLAUDE-HANDOFF.md) for integrated branches,
checks and limitations, and [per-pair coverage](docs/PAIRED-QA-COVERAGE.csv).
Older dated reports and authoring sources are preserved as history.

No physical-controller test, per user instruction. A full manual 100-match
campaign, every frame/matchup, long sessions and systematic cross-browser
performance remain unverified. There is no online-readiness claim. This
integration adds no purchases, generation calls, remote push or hosting.
