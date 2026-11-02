# Local twin-fix handoff — November 2, 2026

The follow-up is implemented and checked locally in `codex/twin-fixes`, based on public snapshot `f1c43baca8a9199283aeeadbc7f8fc9cfae28d0c`. The user explicitly stopped further pushes and physical-controller testing. Neither was performed. No message or files were sent to Claude; this document is for the user's later review.

## What changed in this follow-up

| Files | Change and reason |
| --- | --- |
| `src/core.ts` | CPU ordinary movement/attack decisions subtract both formation spreads from root separation. This fixes walking into wide-body collision without attacking. Special decisions still use root-based range and the opponent's spread. These are the only two core hunks. |
| `public/fighters/pose-atlas.json`, `art/new-fighter-22/install_duo.py` | Blue core slot 19 now reuses 16 for a bent-knee recovery; blue 22 reuses tucked 8 for airborne startup. Revision `duo-full-body-review-8`. Source images preserved; no new generated frames. |
| `scripts/duo-smoke.mjs` | Added CPU contact checks over 172 cases, special range checks, and ground/air kick-selection contracts. Total 13 groups. |
| `scripts/throw-smoke.mjs` | Retains formation-aware initial placement from the authoring checkout and strengthens initial/per-tick bounds. The former two failing fixtures now pass without changing runtime throw code. |
| `art/pose-atlas-lab.html`, `art/animation-event-lab.html` | Correct pair spacing and legal wall placement for review fixtures. Event lab adds center/left-wall/right-wall selection for full-render cameo checks. |
| `src/teamSpecial.ts` | The duo's partner cameo stays outside the complete two-body silhouette. Near a wall it uses an inset elevated lane, avoiding both twins and HUD; the lane is retained for the attack to prevent a vertical position jump. Other fighters retain their existing cameo placement. |
| `src/selectionMenu.ts`, `src/arcadeSelection.css` | Removed the twin-only 0.60 scale reduction. Each body and its rival use one preview scale. Wide formations have stats below the actors and stage text above. Paired detection uses `bodySpread`, so an expanded roster can reuse the layout once integrated. Combat renderer/scale untouched. |
| `docs/DUO-QA.md`, `docs/TWIN-INTEGRATION.md`, `docs/evidence/duo-followup/` | Current findings, coverage matrix, integration boundaries, sampled screenshots/readouts and passing command output. |

The throw-fixture correction existed in the shared checkout at resume; sole authorship is not claimed. An unrelated roster-expansion helper block accidentally copied during initial isolation was removed from this branch only. The shared original was preserved.

## Existing architecture retained

The game has a fixed 60 Hz TypeScript combat core and frame-indexed input, separate Canvas presentation, CPU/practice modes, combo-earned three-pip Team Specials, directional ground/air attacks, recoil/launch/knockdown and synchronized throws. This structure does not make the game online-ready.

The baseline contains 22 selectable fighters and 23 complete-body atlases. Sproto Duo has one input, health and meter state but two render bodies; it is not two independent combat simulations. `src/poseAtlas.ts` preserves body identity, gait phase and throw leadership, alternates special contacts and applies silhouette clearance. This follow-up does not change that renderer or global combat scaling.

Each duo body has 32 pose slots, four walk keys and intro/special/cast/recoil/defeat mappings. Some slots and holds reuse drawings. They are complete-body drawings, not a separated-limb rig or continuously generated animation. The 19 other proposed event-animation upgrades remain stopped.

The baseline also retains original menu portraits, five stages, untimed rounds, and the older four-world story placeholders. The separate new 100-encounter story/God Mode and roster-expansion chats are not integrated in this worktree.

## Checks actually performed

`npm run build`, `npm run qa`, and focused duo, pose, event, presentation, selection, stage-preview and image-contract scripts passed. The full mechanics run included all 15 throw groups, 172 focused duo CPU contact cases, 522,720 broad scripted frames and 110 fighter cases. See [DUO-QA.md](DUO-QA.md) for exact script boundaries; some older pose/event tests cover the original 21 fighters or the first two event sets, not every new set.

Actual browser work used http://127.0.0.1:5184/ and the two review labs. Both twin bodies were inspected during walking, reversals, stop, dash, jump/landing, ground/air kicks, four-direction hold/release sequences in both facings, wall victim recovery, recoil, special and defeat samples. Keyboard play verified W jump, movement/dash, actual kick contact, forward grab and return to control, combo charging through three earned pips, special spending, a CPU duo mirror KO, result, rematch, pause/back and fresh launch.

The final menu was inspected as duo versus Morelight and duo versus duo, plus 600px and 375px responsive previews. The latest full-game kick screenshots show move tick 7 extension, tick 14 rechamber, tick 20 plant and neutral return. Final cameo placement was checked with the full combat renderer at center and both walls, including normal-speed samples. Browser warnings/errors were empty at the last sampled checkpoint.

This is sampled frame and normal-speed observation, not continuous video or every-frame approval. Four-key stepping, repeated holds, simplified paired throws, some shared directional drawings and possible close-range opponent occlusion remain. Final airHeavy, every matchup's visual overlap, long sessions, input latency and a cross-browser matrix were not individually reviewed. Earlier all-roster visual work is historical; this pass focused on the twins. No fresh independent-reviewer signoff is claimed.

## Run locally

```sh
cd /Users/kenhiraoka/Documents/Codex/2026-10-31/task/sproto-twin-fixes
npm ci
npm run dev -- --port 5184 --strictPort
```

Dependencies are already installed in this checkout; `npm ci` is only needed for a fresh installation. Open http://127.0.0.1:5184/. Add `?qa` for visible pause/frame/readout controls. Review fixtures are `/art/pose-atlas-lab.html` and `/art/animation-event-lab.html`.

The Vite process was running on 5184 during final verification. It is a development process, not an installed startup service; restart with the command above if it stops. Port 5173 belongs to the separate authoring build; 5174 was occupied by an unrelated app and was left alone.

Useful commands:

```sh
npm run build
npm run qa
node scripts/duo-smoke.mjs
node scripts/pose-atlas-smoke.mjs
node scripts/event-clips-smoke.mjs
node scripts/presentation-smoke.mjs
node scripts/selection-menu-smoke.mjs
node scripts/stage-preview-smoke.mjs
python3 art/pose-atlases/verify_pose_assets.py
```

## Integration, spending and outstanding ownership

Use [TWIN-INTEGRATION.md](TWIN-INTEGRATION.md) before integrating. The original `neon-relay` checkout has concurrent roster changes; do not replace its whole core, manifest or menu file. Preserve expansion entries and story/God Mode logic, applying only missing twin hunks. No merge or push was performed here.

The story owner must support **100 Sproto encounters** and obtain story-script approval before generating videos. This branch does not implement that map, unlock campaign or God Mode. The story checkout was not independently identified, so its completeness cannot be certified.

This follow-up used **zero Higgsfield credits** and generated no assets. Historical duo spending was 35.5 credits across 16 jobs; the prior menu image used two separate credits. No purchase/subscription change or retry of blocked uploads occurred in this follow-up.
