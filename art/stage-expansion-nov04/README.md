# November 4 stage expansion

48 new Higgsfield images: six variations for each of Trenches, City, Marina,
Ranch, Castle, Bar, Hatchery and Verse. Existing completed stage jobs were used
as image references; `requests.json` records every prompt and reference.

The free-only submission was rejected without creating a job. The owner then
approved up to132 credits for48 images at the quoted2.75 credits each. Exactly48
paid jobs were submitted; all completed. No replacement generations were made.
The separate expanded world map has its own provenance in `../story-map-250`.

`jobs.json` records completed source URLs. Original generation PNGs are retained
outside the repository in the local task's `stage-expansion-nov04-raw` directory.
Runtime PNGs are1280×720, resized with nearest-neighbor sampling to preserve
pixel edges. `public/stages/nov04/manifest.json` records native dimensions and
both source and runtime hashes. The originals and existing stage assets were
not overwritten.

All48 images were visually reviewed, including their actual in-game presentation
with fighters and HUD; `contact-sheet.jpg` shows that review. Every new arena is
available in the main-menu zone selector. Story route defaults use contiguous
regional blocks; an encounter's scenery chooser also exposes all six new images,
including the short Verse chapter. Scenery choices are session-only and preserve
the opponent, combat stage, progression IDs, retry rules and save data.

Automated coverage: `scripts/campaign-expansion-browser.mjs` launches all48 from
the real menu and all48 through the story chooser in Chrome, checks one restart
per zone, and tests map fit/readable detail on desktop/mobile. Stage catalog and
variant smoke checks verify121 unique selectable arenas,112 story images,
hashes, loading/failure retries and preview/fight consistency. The default250-bout
route uses102 scenes; the ten remaining Verse scenes are available through the
chooser and standalone selector.
