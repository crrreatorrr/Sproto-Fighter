# Campaign expansion and name readability — 2 November 2026

This records completed implementation and checks, with final integration explicitly pending. No remote push, deployment, paid generation, story video or external review was performed.

## Checkouts and integration boundary

- Shared game: `/Users/kenhiraoka/Documents/Codex/2026-10-31/task/neon-relay`, local `main`, serving `http://127.0.0.1:5173/`.
- Stable QA source: sibling `story-expansion-20261102`, copied source/scripts with shared asset directories; production preview at `http://127.0.0.1:5193/`. This origin has separate test saves. The preview remains available while its server process runs.
- Independent checkpoint: sibling `campaign-checkpoint-20261102`, branch `codex/campaign-expansion150-review`, based on `17f35080`. It contains only this task's source, tests, map and documentation. It deliberately does not capture the other chats' uncommitted roster/assets.
- Final merge to main is deferred until all open tasks finish, per the user's latest instruction. The larger stage-variation scope and the missing roster entries remain unresolved. Do not treat this branch as the completed combined150-fighter release.

The stable preview was built against127 registered roster entries. The committed base has 102. Both are supported by the new dynamic route. The checkpoint removes a dependency on the concurrent `isFreePlayAddition` core export: all installed non-starters belong to the campaign and require recruitment. During final integration retain the new roster, identities, combat/art changes and campaign locks; do not reintroduce the old unrestricted additions shortcut. No existing saves are reset.

## Implemented behavior

- A route is derived from actual `PLAYABLE_FIGHTERS`, with stable encounter IDs and no fabricated opponents. High Sproto and Fat Head Dave are starters. Golden is late; Satoshi Sprototo, Xalt and Poto Cai Cai are placed immediately before Golden when those IDs are registered.
- Artdude then Artchick share the last node of the Verse region. Morelight then VMU share the final Hatchery node. Each is two sequential matches with fresh health for each match, one persistent node clear only after both wins, immediate recruitment of the first defeated fighter, and no saved midpoint.
- Losing, drawing, leaving, restarting, reloading, or changing testing mode during the second bout restarts that encounter from its first opponent. Readiness failures, double launch requests and failed second-wave asset loads cannot award a clear.
- Normal and testing God Mode wins recruit and advance identically. God Mode prevents health loss and supplies special charge; free-play wins do not advance story. The completion reward remains earned even after new rivals are inserted.
- v1/v2 saves migrate to `sproto-arena-story-v3` without deleting old keys. Recruits, later clears, and earned rewards survive route growth. `nextIndex` identifies the first uncleared encounter instead of assuming `cleared.length` is a cursor. Stale saves merge wins rather than dropping newer valid records.
- Locked fighters remain clickable for preview, with an explanatory launch gate. Genuinely recruited fighters can launch immediately and after reload. CPU choice remains unrestricted.
- The approved 3840×2160 pixel map is integrated as a lossless WebP. The source PNG and previous map are retained. Roads are traced per region; markers do not use straight connecting lines across water. Overview fit, density-aware detail zoom, region jumps, keyboard node navigation and Fit reset remain available.
- Desktop has a rival sidebar, giving the map more space. Narrow phones show the full map directly below a compact toolbar; regions, instructions and rival details remain reachable by scrolling.
- Main-menu fighter names use a local/system sans-serif face with original casing, while arcade frames and surrounding labels remain pixel styled. Long names wrap, mobile panels grow to fit, very narrow stat units wrap below values, and small-phone single previews have added headroom. Combat scale is unchanged.

## Roster and asset limits

At the inspected127-entry roster, there are 125 distinct rivals in 123 nodes. The target is 150 selectable entries:148 rivals in146 nodes with two starters and two double-opponent nodes.At that snapshot, 23 more entries/assets were required; none were invented. The live checkout subsequently reached 130 registered cards after Solana Del Ray, sprot.eth and Dano Crypto landed. That leaves 20 registered slots to 150; Solana Del Ray was still undergoing visual refinements at the latest status check. The later three were not included in the frozen 127-fighter browser QA. A separate synthetic 150-node geometry test exercises map density beyond the planned146 nodes.

The running 5173 browser contained all25 recent additions and their loaded portraits in the bottom roster rows: Satoshi Sprototo, Xalt, Poto Cai Cai, Reverend Cloud, H.E. ZEPUMP, Sprotopotamus, WILLUMINATI, P| RATΞ, prim, Benjamin Button, Max Biggums, Xav,0xEmix0,0xPeterPan, ANNI niM.A.T., pinewaffle, Rainman_four20, wifebeater.eth, FIAT FUDDER, MoonShiller, GodEther.eth, Aleksander, cyberviber, RealityArchitect.eth and MrGoldRobe.eth. The cards use lazy-loaded portraits. This visibility check is not a fresh animation audit of all new fighters.

Map source: Library `libfile_a298a00fdb9c819192fb54eabf3f0ae2`, materialized through the Library workflow and inspected. Original SHA256: `64e976565eade643db3e32d15e49fb44c0cf10cb449e2f9c13c8b1969ede4ed7`; runtime WebP: `1798925fb10e4778d1f29dd5a02f4a16669373fd046c5d145aa905169a9233a8`.

Name-font reference: Library `libfile_7aa64dee0308819195909d0f15046dd7`, materialized and inspected. It showed RealityArchitect.eth forced uppercase and broken mid-handle in the old chunky font. No reference image was sent to a generator during this work.

## Files and architecture

- `src/storyProgress.ts`: v3 saves, dynamic route, migration/merge, sequential run state, durable reward and roster counts.
- `src/storyMode.ts`: scene/map/launch/result flow, wave transitions, failure/restart safeguards and truthful dynamic copy. Scenes stay placeholders pending script approval.
- `src/main.ts`: launch gates, all-bout asset preparation, fresh combat state per bout, testing/reward handling and HUD labels.
- `src/selectionMenu.ts`: current-save gates and preview behavior. Existing measured summary heights keep the canvas clear of growing mobile text panels.
- `src/campaignMap.ts`, `campaignMapLayout.ts`, `campaignMap.css`: approved map, traced roads, marker sizing/zoom, two-opponent previews and responsive layout.
- `src/mysticUI.css`: readable names and responsive panel/headroom corrections.
- `scripts/story-expansion-smoke.mjs`, `story-flow-smoke.mjs`, `story-smoke.mjs`, `selection-menu-smoke.mjs`, `campaign-map-smoke.mjs`: targeted progression, actual controller/main-hook integration, selection and geometry coverage.
- `art/story-map/expanded/`: original source and 127-roster inspection provenance. Route coordinates are runtime computed, not loaded from the inspection JSON. `public/story/campaign-map-expanded.webp` is the runtime map.

## Verification actually performed

Automated, passing against the 127-entry stable copy and the independent 102-entry committed-base checkpoint (98 nodes / 100 rivals). Baseline fixtures explicitly supply valid v3 gaps where there are no newly inserted rivals:

- TypeScript check and production build.
- 16 progression groups: registered baseline/current/synthetic 150 rosters, distinct opponents, both gauntlets, all 101 v1/v2 historical prefix positions, stale-tab merging, unavailable storage, reward persistence and actual normal/God combat knockouts.
- 26 controller/main-hook groups: full route in both modes, normal/God recruitment, both gauntlets, loss/draw/restart/reload, readiness and asset failures, double launch, locks and recruited launch, scene variants, Settings transitions and deterministic replay. Browser/canvas I/O is stubbed; these are not visual claims.
- 16 selection/controller groups, including every installed rival's preview/lock behavior and simulated gamepad focus/confirm/release. No physical controller was tested.
- Map fit at five viewport sizes, all 123 current markers and synthetic 150-node geometry, approved24-stage mapping and retained original map. The synthetic 150-node minimum separation is 21.96px at 3000px detail width.

Browser observations on the stable production preview:

- Fresh High Sproto selection, locked previews and disabled launch; all seven region previews and loaded full-map overview. All123 marker centers were also inspected on regional overlays; individual browser clicks were representative rather than every marker.
- Artdude was defeated in God Mode; Artchick launched automatically with the same hero, stage and full health. Restart returned to Artdude. Returning to selection showed Artdude playable and Artchick still locked. This session deliberately restarted instead of completing both art bouts; both-bout completion and persistence are covered by controller/main tests.
- Morelight was defeated; VMU launched as bout2. VMU was then defeated, the completion message appeared, and after reload VMU remained playable and the earned God Mode checkbox remained enabled.
- A completed v2 test save migrated to 98 cleared nodes out of 123, preserving the reward and old recruits while Continue targeted the first newly inserted gap (Reverend Cloud). No user 5173 save was modified for these tests.
- Desktop 1024×700 map and name panels;390×844 and320×740 phone layout. Found and fixed a long-name/stat overflow at 320px and the initial map below the fold. Retests show long-name content inside panels, and full initial map bounds within both phone viewports. Region zoom and Fit reset worked on mobile.
- RealityArchitect.eth, Michael D. Sproto - Chad Dev,0xPeterPan and H.E. ZEPUMP were inspected as selection examples; all rendered roster name elements had no text overflow at the measured narrow widths.

Earlier focused browser evidence for an actual God Mode ordinary-story win and a normal-mode free-play KO is in `STORY-UI-UPDATE.md`. This update does not claim a manual123-win campaign, fresh exhaustive fighter animation QA, every matchup, physical controller coverage or complete150-fighter art.

Temporary visible QA fixtures were installed only in the 5193 static test output. They provide fresh, pre-boss and legacy-complete saves on that test origin; they are not in this branch or the production game. Combat input and UI navigation used the actual browser. Screenshots are in `docs/evidence/campaign-expansion/` and the external `story-ui-followup/expanded-evidence/` folder.

## Reproduce and integrate later

```sh
npm run check
npm run story-smoke
node scripts/selection-menu-smoke.mjs
node scripts/campaign-map-smoke.mjs
npm run build
npm run dev -- --port 5193 --strictPort
```

For the current stable preview, the source copy is `story-expansion-20261102`; build output is `/tmp/sproto-expanded-campaign-preview`, served with `npm run preview -- --outDir /tmp/sproto-expanded-campaign-preview --port 5193 --strictPort`. Keep the server process running. Test saves are origin-specific.

When every open chat is finished, inspect their final branch tips and uncommitted files, capture each owner's work, and reconcile the overlapping `core`, `main`, selection, story, stage and renderer changes deliberately. Retain this v3 schema and gauntlet logic, all approved new art and IDs, and each chat's final requirements. Rerun the focused checks against the final roster, production build, browser map/selection, representative fight and sequential boss transitions. Merge local main only then; do not push without fresh authorization.

## Integration-readiness follow-up

After the main report was saved, a second read-only source snapshot combined this
branch's campaign/UI with the shared checkout's 130-fighter core, portrait, pose
and power definitions. It is at sibling `integration-readiness-20261102`; its
`SNAPSHOT.json` records exact source hashes. Main was not edited. TypeScript,
production build, all 58 focused groups and map tests passed: 130 roster entries,
128 rivals, 126 nodes. This is source compatibility evidence, not a completed
merge or new visual certification of the active art changes.

Latest confirmed chat status: Dano Crypto and sprot.eth are complete; the Solana
Del Ray pair is still checking its revised event drawings. Twenty registered
roster slots remain to reach 150, and the additional stage-variation scope still
requires clarification. The final local main merge remains gated on completion
of all open work. No remote push is authorized.

The eventual merge must preserve the shared checkout's current `core.ts`,
`originalPortraits.ts`, `poseAtlas.ts`, `powerArt.ts`, fighter assets, renamed
identities and owner QA scripts. Reconcile their older free-play assertions with
the new campaign recruitment rules. Use this branch's final v3 story logic,
responsive map and name typography, retaining the three Verse recruits. Before
changing main, take a stable snapshot of tracked and untracked local work, then
recheck hashes and task status to avoid committing a partial concurrent write.
Run the combined checks and browser review before final integration.

### Legacy animation checks reconciled

The current legacy event suite initially failed because its release expectation
covered only mini-Sproto projectiles, not the existing mind-beam, yellow-eight
and sun release holds. It also applied generic partner timing to fighters with
dedicated relay entrance/contact sequences. The test now respects those distinct
contracts; no runtime animation was changed to satisfy the assertions. Twelve
event groups pass against both the 102-entry checkpoint and 130-entry source
snapshot. Diagnostic failures now identify the fighter and phase.

The dedicated relay suites also pass: 780 single-partner scenarios, 38 twin-partner
cases and 78 expanded-partner facing/wall cases. The newer presentation suite
passes for 107 installed owners with entrance8/death16, covering 214 facing loops
and 1,712 defeat cases. Its optional all-authored flag fails 107/130 because 23
other owners retain the supported intro4/defeat12 format; this is not a claim
that every fighter has the same frame format. The corrected legacy suite covers
that fallback separately. No additional visual-animation certification is made.

Solana Del Ray's owning chat has now completed its final review and reports 208
drawings, separate red/blue bodies and passed movement/build checks. The other
visible local character-chat turns are also completed. Final main integration
still awaits the remaining roster target and stage clarification.
