# Campaign map and scenery integration — 2026-11-02

The approved existing map is retained unchanged at `art/story-map/approved-map.png`. Its runtime derivative is a nearest-neighbor 1920 × 1080 lossless WebP. No new generation, video, credit charge or script approval occurred in this pass.

`campaignMapLayout.ts` supplies stable geographic positions for the canonical 100 encounter IDs. `campaignMap.ts` provides an inspectable numbered map, region jumps, zoom, keyboard navigation, current-rival portrait and gated challenge/replay controls. The UI is injected through `storyMode.ts` hooks so progression remains independent of browser art loading. The seven progression regions are Trenches, City, Yacht, Castle, Bar, Verse, and the two-boss Hatchery finale. The map artwork ends at the portal; the final two markers represent the separate zone beyond it.

`stageVariants.ts` maps the approved 24 backgrounds to successive regional blocks. `main.ts` waits for the chosen scene and uses the existing stage if loading fails; free-play selection clears the story scenery. `render.ts` uses that optional backdrop without changing the 60 Hz combat state, collision geometry or floor height. Cutscenes remain explicitly labeled placeholders awaiting script approval.

## Checks actually completed

- Type check and production build passed; broad `npm run qa` passed before partner integration.
- 29 story/persistence/God Mode groups passed, including all 100 victories, locked gates, retries, reload recovery, same-session finale, invulnerability, asset errors and actual main-launch hooks.
- Map geometry: 100 unique bounded nodes; nearest pair 33.879 px at default zoom; 24 px targets remain separated at minimum zoom. An initial overlap between region-boundary markers was found and corrected.
- All 24 scenes map to the actual canonical route; Bar/Hatchery keep their existing art; encounter IDs and order are unchanged.
- Actual browser: all seven region views individually inspected; locked encounter 2 inspected using ArrowRight and remained unlaunchable; region jump, Find next fight, first challenge and placeholder scene entry observed. The map initially scrolled the whole dialog and hid the challenge; it now pans only the map while the rival/action/Back remain visible at 1280 × 720.
- Actual first story match: Golden Sproto vs Halloween 2008 on Drainage floodgate, with testing God Mode. Native keyboard input produced W jump, horizontal movement, air light, medium contact, ranged hit and Team Special contact. Diagnostics recorded player HP 1000, enemy HP 832, three contacts and recoil. This is a sampled manual play check, not a full 100-match manual playthrough.
- Screenshots are in `docs/evidence/campaign-integration/`.

## Remaining coverage / limits at this checkpoint

Mobile viewport, final partner merge and final combined-regression rerun remain. Physical controller testing is deliberately skipped per user instruction. No cutscene videos were generated. The 24 backdrop images have all had center/wall placement inspection; only the first has been played here through the actual story entry. Large local asset transfers can delay first loading.
