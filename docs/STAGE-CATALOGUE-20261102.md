# Stage catalogue and story scenery checkpoint — 2026-11-02

The main selector previously enumerated 46 `STAGES` entries, while the 24 approved v2 panoramas existed only in `STORY_LOCATIONS`. Ranch consequently showed its original arena alone. All 70 installed runtime backgrounds now have a selectable entry and an explicit image path where needed. Existing stage IDs, fighter locks, encounter IDs and save formats are retained.

| Menu zone | Selectable backgrounds, including main stage |
| --- | ---: |
| Trenches | 9 |
| City | 13 |
| Yacht | 9 |
| Castle | 13 |
| Bar | 7 |
| Verse | 9 |
| Hatchery | 6 |
| Ranch | 4 |

Ranch offers **Sproto Ranch**, **Lantern-lit barn**, **Green paddock at midday**, and **Dusty farmhouse yard**. Every one of the 61 approved story-location images is also selectable in free play. The level dialog uses the same explicit image paths as the main menu. Random selection includes the added stages. No image was generated or changed, no credits were spent, and no raw/superseded artwork was promoted into the runtime catalogue.

Large v2 panoramas load when their zone is viewed, with shared pending requests and retry after a failed load. Match launch waits for its chosen stage and reports a failed download instead of silently fighting on a different backdrop. Initial preloading retains the existing 46 base assets rather than adding a 105.5 MiB batch. Preview and arena use the same image and existing floor coordinates.

Story scenery now counts individual bouts when mapping each region. The Hatchery sequence remains **Nick → Juicy → Morelight → VMU**, with Spore Grove → Amber Egg Cathedral → Root Reservoir → Molting Hall. All three Ranch panoramas remain the Trenches' rural outskirts. The current 126 encounters / 129 bouts visit **60 of 61** story-location assets. Pearl Incubation Chamber is preserved and selectable in free play; five Hatchery variants cannot all occur in four distinct bouts without changing the route. No extra opponent or encounter was invented. The map's detail text lists both scenes for sequential bouts.

## Verification actually completed

- `npm run build`: TypeScript and Vite production build passed.
- `node scripts/stage-catalog-smoke.mjs`: all 70 unique runtime PNGs have one catalogue entry; all 61 story images and all 24 approved panoramas are included; zone counts, approved file hashes, scoped loading/retry, preview/arena identity and unchanged saved progress passed.
- `node scripts/selection-menu-smoke.mjs`: 18 integration groups passed, including selecting all 24 additions, all four Ranch choices, zone filtering, keyboard/synthetic gamepad navigation, locked previews and unlocked launch gates. This uses a stub DOM, not a browser.
- Stage preview, story-stage and variant smoke scripts passed loading, rendering calls, fallback, floor-band checks and approved PNG dimensions/hashes.
- `npm run story-smoke`: 18 progression/migration groups, 27 controller/main integration groups and recruitment checks passed. The actual launch hook was exercised for all 70 arenas, including failed-stage retry. Normal and God Mode progression and all sequential boss orders were preserved. Canvas/browser I/O is substituted in these checks.
- `node scripts/campaign-map-smoke.mjs`: initial full-map fit, five viewport sizes, current 126-node geometry and synthetic 150-node geometry passed. Its 58-scene count describes first-bout map assignments; the complete 129-bout route uses 60.
- Individually inspected all 24 v2 panoramas on four source-image sheets with the unchanged floor and edge-position guides. They provide continuous fight lanes; these are source previews, not new browser screenshots. Existing approved PNGs are byte-for-byte unchanged.
- Isolated local Vite server: all 70 background requests returned HTTP 200 with hashes equal to disk; index and five updated modules also returned the expected code.

Evidence is in `docs/evidence/stage-catalog-20261102/`, including the full catalogue, bout-to-background mapping, source review sheets, test output and HTTP identities.

## Limits and separate work

The supported browser-control tool is unavailable. No new in-browser clickthrough, screen layout, gameplay or motion pass is claimed. Physical controller testing remains explicitly skipped. The separate twin size/registration audit remains in `sproto-motion-followup`; its unverified changes are not part of this stage checkpoint. The campaign still has 131 selectable owners, 19 short of the requested 150 unique fighters. No remote push was made.


## Completed parallel VS-screen work preserved

`Convert sproto sprites to fighters (2)` finished its latest task before integration. Its four local files were preserved at `aa039c91`, then combined with stage commit `4ee753ef` in isolated merge `f4e35072`. The changes touch different parts of `main.ts` and merged without conflict. The VS screen now waits for fresh Enter, controller A, or Continue; it retains the 3/2/1/FIGHT countdown and uses the existing home artwork for borders and button. README instructions were corrected accordingly.

The originating chat reported a live check of waiting, Space rejection and Enter transition. I independently inspected its saved screenshot (`versus-completed-peer.png`), and reran the eight versus groups / 17,161 ordered portrait mappings, presentation tests, TypeScript build, all stage/selector checks and the full story suite on the combined code. I did not perform that chat's live browser check myself. Combined logs are retained beside the stage evidence. No unfinished twin files were included.
