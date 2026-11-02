# Stage floor alignment — 2026-11-02

The user requested that Verse Gate's bridge sit through the middle of the fight, and that every arena place combat on a sensible part of its environment.

All ten installed backgrounds and all ten combat views were visually inspected with Golden Sproto and Morelight. Three arenas needed corrections:

| Arena | Finding | Correction |
| --- | --- | --- |
| Verse Gate | Original deck ended at y=570, putting the y=578 foot line on the bridge lip/fascia. | Reframe the existing deck from y=480–570 into y=480–676. Fighters now stand on its center line, 98 pixels from either depth edge. Portal, approach islands and skyline retain their framing. |
| Tidebreak Marina | Right-hand foreground was water; the pier covered only the left half. | Extend timber sampled from the original pier across the entire foreground, y=532–720, with a rear trim. Both fighters and both corners are on the dock. Native 1376×768 source coordinates are normalized correctly. |
| Moonkeep Castle | Contact line landed on the rear curb instead of the courtyard. | Reframe the paving from y=596–692 into y=520–704, moving the curb behind the fighters and keeping the foreground lip below their shadows. Native 1376×768 source coordinates are normalized correctly. |

The remaining seven stages already have plausible full-width combat surfaces: mud in Mudline Trenches; paved plaza in Circuit Gate; stone forecourt below the throne in Crown Relay Chamber; wooden apron in Last Light Bar (existing correction retained); rooftop in Neon Tomorrow; alien courtyard in The Hatchery; and compacted farmyard at Sproto Ranch.

Corrections live in `src/stage.ts` and apply equally to thumbnails, selection previews and combat. Original Higgsfield PNGs are unchanged. Combat geometry remains y=578, with the same movement, corners, roster, stage IDs and seven-stage story route. No additional image generations or credits were used.

Validation passed: `npm run check`, `npm run build`, `node scripts/story-stages-smoke.mjs`, `git diff --check`. The stage smoke check now verifies floor contact/shadow margins, a continuous full-width floor, center alignment on the Verse bridge, and valid native-size source sampling. It also retains asset, story route, preview and Ranch fallback coverage.

Browser evidence lives in `docs/evidence/stage-floor-alignment/`: ten combat screenshots, left/right movement screenshots for all three corrected arenas, an all-stage review sheet and a corrected-corners sheet. All screenshots were visually inspected. This is a stage placement review with two representative fighters; it is not an all-roster combat or full-campaign playthrough. Existing right-edge body overlap during push was not changed by this scenery task.

Work remains isolated on `codex/hatchery-ranch-detail`. Do not merge to main while the concurrent work is still in progress. Integrate the narrow stage commits after the existing roster/combat/progression changes, preserving their ownership.
