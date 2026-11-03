# Local integration — 3 November 2026

This checkpoint combines completed local game work with the published Sproto Fighter hub adapter. It does not deploy or push anything. The game still has **131 selectable fighters, 150 rendered bodies including pairs, 126 story encounters / 129 distinct rivals, and 73 selectable stages**. The requested 150 distinct-fighter target is not complete.

## Sources and preservation

- Starting local main: `2d0d3e823ebcb596ee85fad10af0b5adb205c166`.
- All 18 pre-existing local branch tips were already ancestors of main. Eleven pre-existing game worktrees were inspected; their directories and branches were preserved.
- Captured all 44 completed dirty/untracked source and asset files from main, including the eight-zone campaign layout, three new Ranch backgrounds, unlocked-first alphabetical selection, pixel versus names, and two duplicate Solana reference copies. SHA-256 checks confirmed the source files had not changed before integration.
- Isolated integration branch: `codex/merge-completed-20261103`. Capture commit: `f055c300`.
- GitHub `crrreatorrr/Sproto-Fighter` was inspected read-only. Published `main` was `f1c43bac`; `codex/twin-fixes` was `bad4b352` (older changes already incorporated/superseded locally).
- Published Claude branch `claude/sweet-newton-l4tjnh` was `4f3b59e04ef6cc6293b68d5be9a6dfa91a9ab424`. Its two authored commits, `a033aac` and `4f3b59e`, were applied as `4ce6e64c` and `90abc326`. These are adapted authored patches across the separate exported repository history, not an ancestry merge of the original hashes.
- Eleven initial overlapping files were resolved deliberately: README, HTML entry point, package manifest, presentation smoke check, selection CSS, main controller, pose loader, selection controller, stage loader, story controller and Vite config. The second patch also conflicted in README. Newer game behavior and assets were retained while the hub hooks were ported.
- The other relevant Codex tasks showed completed recent turns and idle/not-loaded status when checked. This is a time-scoped observation, not a claim about unpublished future Claude work.
- Old copied assets in `sproto-unlocks` and large untracked QA exports in `sproto-motion-followup` remain untouched. The unlock worktree had 9,002 byte-identical asset copies and 32 older `sproto1625` frames; the newer main frames were retained. Dependency caches were not imported.

## Reconciliation details

- Hub Relics provide an additional recruitment route for the five mapped fighters. They do not unlock every story-locked fighter or revoke existing recruits. Menu previews, random P1 choices, final fight-start validation and story entry use the combined rule.
- Normal CPU wins can report 20 Tickets through the optional hub adapter. The World 1 event is reported only after the chapter is cleared, including its final sequential bout. Practice, losses, offline play and God Mode do not earn hub rewards. God Mode still advances local story progress normally.
- Mounted builds resolve stage art, pose manifests/frames, rig parts, powers, voices and campaign-map images beneath their mount. Original PFP handling remains intact.
- The published vendored SDK package lacked its required `dist` files. Source was recovered from its documented exact hub commit `b06566855f9901e9e5af312e39ace65b734542bb`, not from the hub's active working tree. Source, generated runtime/declarations and reproducible `npm run build:hub-sdk` are included. No hub-server files, migrations, credentials or running hub process were changed.
- Local `.env` files are ignored. The optional connection settings and client server key are documented in README.
- The combat simulation and fighter sprite images were not replaced by the backend integration. Existing hit-reaction registration corrections remain in place.

## Checks actually run

All commands below passed on the isolated combined tree before main integration:

| Check | Observed coverage |
| --- | --- |
| `npm ci --ignore-scripts --no-audit --no-fund` | Clean locked dependency installation, including local SDK |
| `npm run check`, `npm run build` | TypeScript and production bundle |
| `npm test` | 24 hub/recruitment/reporting/mounted-asset tests in five files; network replaced by test doubles |
| `npm run smoke` | 131-fighter basic combos/replay, directional and projectile checks, 15 throw groups, 24 focused movement checks, eight reaction groups |
| `npm run reaction-size-smoke` | 131 owners, 150 bodies, 786 contact cases, 14 calibrated sources, six invalid registrations rejected; not a fresh visual approval of all frames |
| `node scripts/pose-atlas-smoke.mjs` | Nine playback/contract groups, all-roster gait/grip checks and invalid-art failure handling |
| `npm run story-smoke`, `node scripts/story-flow-smoke.mjs` | Save/progression and 27 campaign/controller/main groups for 126 nodes and 129 opponents |
| `node scripts/selection-menu-smoke.mjs` | 19 selection/controller integration groups, including lock/preview/start behavior; simulated DOM/gamepad |
| `npm run versus-smoke` | Eight versus groups, 17,161 ordered matchups, countdown/presentation/input boundaries |
| `npm run partners-qa` | 786 single-partner scenarios, 38 twin-partner cases; expanded partners: 78 facing/wall cases and 840 captured attack frames |
| `npm run stage-catalog-smoke`, `node scripts/stage-variants-smoke.mjs` | 73 arenas, 64 story locations, all 24 approved panoramas; Ranch has seven choices; 60 locations used by current 129 bouts |
| `node scripts/campaign-map-smoke.mjs` | Eight-zone layout; five desktop/mobile fit sizes, 126 current nodes and synthetic 150-node spacing |
| `git diff --check` | No whitespace errors |

## Browser observations

The actual production bundle was opened at `http://127.0.0.1:5201/play/sproto-fighter/` in the supported browser. This checks a nested path, not a mocked loader.

- Selection loaded with 131 fighters and 73 stages, with no captured browser console errors.
- Clicking locked `$Bitcoin Obama` updated the preview and unlock explanation while keeping Start disabled. Selecting recruited Fat Head Dave enabled Start.
- The story map opened fitted in full, with all eight region controls and current 126-node progression. `mounted-story-map.jpg` records the observed view.
- Moonlit Creek Crossing selected and launched with matching background and readable ground contact.
- The versus screen showed the correct original Fat Head Dave and Morelight PFPs/names. Continue entered the countdown; its `3` frame was captured.
- Keyboard movement, a kick, W jump and an actual heavy contact were exercised. The hit reduced Morelight to 880 HP and showed the hit effect/reaction. Restart returned to versus preview.
- Screenshots are in `docs/evidence/integration-20261103/`. Still images document the observed states; they are not a claim of a fresh continuous-motion review of every fighter.

## Limits and follow-up

- No authenticated live hub session, actual Ticket credit, Relic grant, return portal or backend deployment was exercised. Those require the configured running hub/server. Adapter behavior was tested with stubs and standalone browser play.
- Physical controller testing was intentionally skipped per the user's instruction. Existing simulated controller checks passed.
- Prior roster-wide art/reaction evidence remains in the project. This integration pass did not repeat every fighter's full live animation review or assert that all outstanding aesthetic issues are solved.
- The distinct-fighter goal remains 150; only 131 selectable entries currently exist. No invented characters or unapproved cutscene videos were added.
- No remote push was performed. Other worktrees and the separate hub process on port 5173 were preserved.

## Run locally

From `/Users/kenhiraoka/Documents/Codex/2026-10-31/task/neon-relay`:

```sh
npm ci --ignore-scripts
npm run dev -- --port 5200 --strictPort
```

Open `http://127.0.0.1:5200/`. Port 5173 is occupied by the separate hub project. Build with `npm run build`; run adapter tests with `npm test` and combat checks with `npm run smoke`.
