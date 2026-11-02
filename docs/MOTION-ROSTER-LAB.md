# Four-fighter motion review wall

`art/motion-roster-lab.html` is an additive development review page. It advances four independent real combat states and draws the installed full-pose body atlases. It does not alter progression, save data, core mechanics, or the normal game renderer. A twin occupies one panel and both body atlas samples are named below the canvas.

Open `/art/motion-roster-lab.html` on the development server. A specific group can be opened with `?fighters=sproto704,sproto2210,bront,sproto1815`. Optional `batch` and `scenario` are zero-based; `facing=-1` starts the actual simulation facing left; `position=right%20wall` selects an edge fixture. With a custom group, batch 0 is that group and the regular batches follow it.

Use the scenario selector or Previous/Next action for the same 52 scenarios as the single-fighter pose lab. Each scenario resets positions and gives the tested owner three pips. Play runs at the selected speed; Step 1 frame and Step 10 frames pause and advance the actual core. Run 52-action sweep advances only once every panel settles, with a 900-tick failure limit. Disable Loop to stop after one scenario or sweep. All start facing changes every panel, while each panel's Actual facing control changes its own simulation direction. It is not a mirrored screenshot.

The canvas uses a constant 0.72 world-to-pixel camera scale. The four-panel layout letterboxes each complete canvas uniformly into the available viewport; there is no per-frame silhouette fit. At narrow widths the panels stack. Use the original single-fighter lab for detailed anatomy at larger displayed size. Playback is disabled until all selected main and companion body atlases are available.

This fixture covers body animation and throw contact. It does not render the normal game's projectile graphics, partner cameo effects, entrance or defeat presentation. Those require the actual match view. Finishing a scenario or sweep never records a visual pass.

## Checks performed while adding the page

- `node scripts/motion-roster-lab-smoke.mjs`: passed 15,288 comparisons, including all 131 owners × 52 scenarios × both facings at center, plus four priority owners at four edge positions. 2,043,600 actual core frames matched the established single-fighter fixture's inputs and final states.
- `npm run check`: passed.
- Browser at `http://127.0.0.1:5196`: four owners/six bodies loaded; jump Step 10 displayed all four panels; 1× playback advanced to jump frame 18; global actual left-facing reset and independent right-facing second panel worked; right-wall forward grabs reached actual throw state for all four at frame 10. No browser console errors were recorded during those control checks.
- The compact grid was visually checked at the browser's existing 1280×720 viewport without resizing the browser. All four panels fit. Saved example: [four-panel jump](evidence/movement-followup-20261102/motion-wall/browser-four-panel-jump.jpg).

These are harness checks, not completion of the roster-wide animation quality review.
