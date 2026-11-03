# Three new Sproto Ranch maps

Added November 2, 2026: Dawn Orchard (`ranch-orchard`), Stormwind Mill (`ranch-windmill`) and Moonlit Creek Crossing (`ranch-creek`). All three appear under The Ranch in stage select, bringing that family to seven choices. They also appear in contiguous blocks in the dedicated Ranch chapter after the Yacht. The final combined campaign has eight chapters; this asset integration preserves encounter IDs and save rules.

Higgsfield GPT Image 2.5 Sunburst, high quality, 4K generated three new locations using the existing Ranch art as a style reference. The cost quote was 4.25 credits each. Complete prompts, reference job, job IDs and source URLs are saved in `art/ranch-nov02/generation.json` and `jobs.json`. Original 3840×2160 PNGs are retained in `raw/`; runtime copies are 1280×720 nearest-neighbor PNGs in `public/stages/higgsfield/`. `install_art.py` reproduces installation; `art-report.json` records hashes.

Validation passed:

- TypeScript/Vite production build.
- Stage catalog: all 73 installed stages selectable exactly once, all 64 story images load, preview and match use the same images, scoped loads deduplicate/retry. All three new Ranch images occur on the actual campaign route.
- Variations: dimensions/hashes verified, contiguous deterministic mapping across a synthetic 240-encounter route, original opponent/save IDs retained.
- Selection/controller: 18 integration groups. Campaign: expansion and migration checks, 27 controller/main groups, three-recruit lock/win/reload and stale-save checks.
- Campaign map: 126 actual encounter targets separated and bounded, five responsive sizes, 150-target synthetic route; Ranch markers follow the farm district, expanded Hatchery markers follow the cave approach.
- Chrome built preview: selected each new Ranch stage and launched an actual practice match. Each has clear ground at the unchanged y=578 contact line, with scenery behind the fighters; Creek water stays behind the dry lane. All three story assignments were inspected in the actual campaign map. No console errors.

Browser story samples: Bitcoin Sheriff uses Dawn Orchard, UNC Master Flex uses Stormwind Mill, and Chaton von Sproto uses Moonlit Creek Crossing. These UI checks inspected locked entries without awarding progress; recruitment and persistence were tested in-memory. No claim of manually clearing the complete campaign.

Evidence: `ranch-stage-selector.png`, `ranch-orchard-in-game.png`, `ranch-windmill-in-game.png`, `ranch-creek-in-game.png`, `ranch-story-orchard.png`, `ranch-story-creek.png` in the chat outputs.
