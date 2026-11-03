# The Hatchery — stage QA

Completed November 2, 2026.

Added **The Hatchery** as a playable side-view stage from the user's environment screenshot. The visual reference supplied the central brown/orange organic hatchery with yellow-green growths, dark navy/purple terrain, segmented perimeter architecture and blue crystal clusters. The generated environment was visually inspected: source text, names, currencies, badges, health bars, interface panels and selection markers are absent. The game's own runtime HUD remains separate from the background.

Higgsfield GPT Image 2.5 Sunburst generated a 3840×2160 image. The raw result, original reference, prompt, completed job record and production image metadata are retained under art/hatchery-stage. The installed background is public/stages/higgsfield/hatchery.png (1280×720, crisp 2px display grid). This is static background scenery; no combat geometry or hazards were added.

The Hatchery follows Verse Gate in the canonical STORY_STAGE_IDS route as chapter7 and is directly selectable in free play. The catalog now contains ten stages. Story counts and navigation are dynamic. A matching procedural fallback was added for image-load failure. The separate persistent-story/unlock work can derive encounter blocks from the exported ordered route; no merge or boss-gauntlet implementation is claimed by this art task. Integration details are in docs/STAGE-ROUTE-COORDINATION.md and docs/STAGE-ROUTE-INTEGRATION.json.

Checks passed: all ten stages and the seven-stage story order, nine successful raster background loads, distinct 1280×720 generated arenas, shared thumbnail/preview/combat rendering, 21 story/navigation/controller checks including advance/retry/ending/restart and all ten free-play launches, and TypeScript/Vite production build.

Browser QA selected The Hatchery from the real stage rail, launched standing-dummy practice, sampled walking and punching, inspected the left-wall fighting position and crystal placement, confirmed the seventh world card, and launched World7 through its scene/start flow. No browser warnings/errors were captured. These are sampled visual checks rather than a manual end-to-end campaign win.

Evidence: the-hatchery-background.png (text-free stage art), the-hatchery-in-game.png, the-hatchery-corner-qa.png and the-hatchery-full-game.png.
