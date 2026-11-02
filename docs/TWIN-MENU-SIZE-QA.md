# Twin menu size and spacing revision

Branch: `codex/twin-menu-size`. Isolated worktree: `/Users/kenhiraoka/Documents/Codex/2026-11-02/task-7/sproto-twin-menu`. Base: `aa4e4960` (the roster/paired integration checkpoint). Review server: `http://127.0.0.1:5207/`. No main merge, push, asset generation, or changes to the shared authoring checkout.

## Root causes and changes

The actual browser route `http://127.0.0.1:5173/hub/` still serves `actorScale = scale / (1 + (bodyCount - 1) * .67)`, making a two-body team about 60% of a single fighter. Confirmed by reading the route's script entry and its served menu module; see `evidence/twin-menu-size/active-hub-code.txt`. This route has not been switched to this branch.

The base integration checkpoint had already replaced that factor with `drawSelectionPose`, but its narrow width fit could still shrink teams, and older single atlases without bounds were framed using their whole transparent 256-pixel canvas. Menu rendering now measures and caches actual opaque standing bounds, normalizes every body's standing height, and packs both bodies with a six-unit gap. Combat atlas scales and anchors remain untouched.

When either selection is paired, the menu places stat readouts below the sprite area. Desktop gives each team half of the preview; mobile stacks the two selected teams in full-width rows. Single-versus-single retains its compact arrangement. Viewport classification now follows the CSS viewport breakpoint rather than the narrower canvas width. The same renderer handles either side and discovers the current bodies through `bodyAtlasIds`.

The user's follow-up also requests reviewing the reduced space between twins. The previous fight renderer still left about 18–60 world units between standing silhouettes. Supporting bodies can now move inward by up to 60 units toward a standing-silhouette target, capped by the current opaque silhouette and the complete special envelope. Broad strikes open the supporting body only enough to avoid crossing. Most standing gaps now measure about 7 units; the largest is about 16.5. The lead position, in-fight body scale, simulation state, collision, damage, throw geometry, and input remain unchanged. Supporting-body offsets can vary with extending limbs; complete per-fighter motion playback remains a further visual review item.

## Verification

- `npm run build`: passed (TypeScript plus production Vite build).
- `npm run check`: passed after final source edits.
- `node scripts/selection-menu-smoke.mjs`: all 8 groups passed; the fixture now stubs the renderer actually imported by the menu.
- `node scripts/duo-smoke.mjs`: all 13 groups passed.
- `node scripts/throw-smoke.mjs`: all 15 groups passed.
- `node scripts/twin-spacing-probe.mjs`: 13,440 full-manifest probes across all 16 registered pairs, both facings, standing, forward/back walking, light, medium, heavy, and special. Checks finite silhouettes, clear ordering, tight standing gaps, and no simulation mutation. These are deterministic geometry checks rather than visual approval.
- Browser: every one of the 16 registered teams selected on BOTH P1 and CPU sides at 320, 390, 768, and 1280 viewport pixels (128 team-side/viewport combinations). All four displayed bodies in each case have matching visible heights and remain inside their canvas. At 390 they are 176 px high; at 1280 they are 244 px. At 320 the widest team fits at 174.27 px; other teams remain 176 px. At 768 they are 192 px. Raw measurements are in `browser-metrics.json`, summarized by `browser-checks.json`.
- Direct twin-versus-single browser comparison: both twin members and Golden Sproto measure 176 px at 390, and 244 px at 1280. See the two `single-comparison` PNGs/JSON.
- Browser motion samples: Duo and #2344 standing and walking in both facings, using the production formation renderer and real neutral/walk frames. Screenshots are included. Full visual playback of every paired fighter through attacks, grabs, special, reactions and edges is not claimed.

The menu-only fixture `art/twin-menu-qa.html` uses the actual selection controller, production CSS and renderer, and actual standing PNGs. Its manifest wrapper aliases unused animation frames to the standing image and omits clips/walks to avoid decoding thousands of irrelevant combat cels. It does not test combat playback. The separate `art/twin-spacing-qa.html` retains real neutral and walk frames and omits unused event/attack art. Full-manifest Node probes exercise the real geometry for those other poses.

## Integration coordination and remaining scope

Preserve the ongoing story/unlock controls and roster/partner changes. Apply only the menu framing hunks in `src/selectionMenu.ts`, the paired-preview rules appended to `src/pixelUI.css`, and the `duoLayout`/`drawSelectionPose` hunks in `src/poseAtlas.ts`. Do not replace whole files: story changes also own `selectionMenu.ts`, and directional-spit/paired work also owns `poseAtlas.ts`. No edits to core roster IDs, `specialPartnerIds`, manifest assets, stages, progression, or the other worktrees were made.

The two overview sheets and per-team PNGs show all registered pairs. Any future roster additions to `PAIRED_BODY_IDS` use the generic production rendering paths automatically and should be added to the browser review. Main/live hub remain unchanged until the coordinated integration gate is satisfied.
