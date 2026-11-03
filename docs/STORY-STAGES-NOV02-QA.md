# Story stages and Morelight egg spit — QA

Completed November 2, 2026.

Four new playable arenas were created from the location plan in docs/STORY-SCRIPT-DRAFT.md (Out of the Trenches):

- Mudline Trenches: muddy maintenance trench, broken work lamps and the distant city above.
- Circuit Gate: the city challenge gate, four challenge lights and the yacht invitation display.
- Crown Relay Chamber: the castle throne/relay engine, chains and the hidden violet route below.
- Verse Gate: the fractured star horizon, crew-colored paths and the colossal portal.

The story selector now follows six primary chapter arenas in order: Trenches → Circuit Gate → Tidebreak Marina → Crown Relay Chamber → Last Light Bar → Verse Gate. All six can be entered directly. Wins advance; losses/draws retry; completion/restart counts use six chapters. Free play also retains Neon Tomorrow, Moonkeep Castle and Amber Ranch for nine total stages. The stage rail scrolls across the complete collection, its count is dynamic, and story/free-play cards now display the actual scenery.

Higgsfield GPT Image 2.5 Sunburst produced four 3840×2160 environment images. Raw results, prompts and completed job records are preserved under art/story-stages-nov02. Installed 1280×720 PNGs use a sharp 2px display grid. All four were reviewed for a flat unobstructed combat floor, readable fighters and accessible corners. Scenery does not change combat physics. Stage-specific procedural fallbacks remain available if an image fails to load.

Morelight (vela) now spits tumbling cream/white pixel eggs from his existing mouth cast. The egg appears at frame11, moves horizontally at 12px/frame, uses the existing 62HP damage and recovers normally. Directional inputs do not redirect organic spit; guard blocks it and crouch ducks it. Browser freeze QA inspected its first emission frame and observed one 62HP impact at frame46. Native Canvas pixel art follows the existing projectile motif system.

Validation:

21 story/navigation checks passed (controller + actual main hooks; DOM stub, no browser claim).

PASS: 510 per-fighter cases, 102 unique mechanical profiles, 8 trajectory/power interaction checks.

Build: ✓ built in 4.88s

The stage asset test verifies nine distinct catalog IDs, the ordered six-chapter route, eight successful raster background loads, four different 1280×720 new images and shared rendering for thumbnails, selection and combat. Six round-presentation integration groups pass. Morelight's focused test passes 36 ground/air/facing/aim cases, hit/block outcomes, crouch evasion, repeated casts and egg rendering.

Browser QA launched and sampled movement/attacks in all four new arenas, inspected the illustrated six-chapter selector and launched World6 into the actual Verse Gate match. These are sampled manual checks, supplemented by controller progression tests rather than a claim of manually winning the campaign end-to-end. Story scene text and cutscenes remain placeholders/draft; no cutscene videos were generated.

Evidence: new-story-stages-in-game.png combines four actual gameplay screenshots; originals are stage-trenches-in-game.png, stage-circuit-in-game.png, stage-throne-in-game.png and stage-verse-in-game.png. Also saved story-six-chapter-route.png and morelight-egg-spit.png.
