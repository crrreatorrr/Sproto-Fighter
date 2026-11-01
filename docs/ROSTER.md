# Roster scope — Build 01

Latest instruction replaces the shared-kit shortcut with individual attacks, powers and animations for all 21 fighters. Every submitted character is selectable as player or opponent. [FIGHTER_KITS.md](FIGHTER_KITS.md) records implemented mechanical differences and special schedules.

Each fighter now has a Higgsfield-derived complete-body pose atlas and eight locally authored guarded-step frames. The 32 main slots use shared phase selection with individual art; this is not a full bespoke animation sheet for every directional move. Original images remain in character selection. Current visual findings and limitations are in [SPRITE-REWORK-QA.md](SPRITE-REWORK-QA.md); older cutout-rig audits are historical.

| Reference | Working label | Actual art status | Requirement |
| --- | --- | --- | --- |
| 1 | Golden Sproto | Original image; whole-pose atlas + 8 steps | Yellow body, reference face/clothing |
| 2 | Morelight | Original image; whole-pose atlas + 8 steps | Blue body, no clothes |
| 3 | Fat Head Dave | Original image; whole-pose atlas + 8 steps | Buff, muscular |
| 4 | Halloween 2008 | Original image; whole-pose atlas + 8 steps | Omit mini pumpkin; bouncing pumpkin projectiles and Harvest Moon special |
| 5 | Yannix | Original image; whole-pose atlas + 8 steps | Indigo head, yellow collar, buttoned vest |
| 6 | Bongraker | Original image; whole-pose atlas + 8 steps | Unusual double face, blue head, black jacket |
| 7 | Juicy | Original image; whole-pose atlas + 8 steps | Reference features retained |
| 8 | Yoyo | Original image; whole-pose atlas + 8 steps | Reference features retained |
| 9 | Red Kev | Original image; whole-pose atlas + 8 steps | Ignore red background; head + similar clothing |
| 10 | Sprotel Bitcoin | Original image; whole-pose atlas + 8 steps | Keep Christmas hat  |
| 11 | Chode Adoration | Original image; whole-pose atlas + 8 steps | Individual design retained  |
| 12 | $Bitcoin Obama | Original image; whole-pose atlas + 8 steps | Individual design retained  |
| 13 | Jahon | Original image; whole-pose atlas + 8 steps | Individual design retained  |
| 14 | Virtuagram | Original image; whole-pose atlas + 8 steps | Individual design retained  |
| 15 | Dumpstar | Original image; whole-pose atlas + 8 steps | Face and attire only; omit objects above shoulders |
| 16 | Crapto | Original image; whole-pose atlas + 8 steps | Bare blue body, yellow goggles/red irises, red lips |
| 17 | VAMP | Original image; whole-pose atlas + 8 steps | Blue feline face, narrow eyes, black jacket/yellow collar |
| 18 | Alpha 777 | Original image; whole-pose atlas + 8 steps | Olive skin, blue goggles, red scarf, striped shirt |
| 19 | Bitcoin Mandela | Original image; whole-pose atlas + 8 steps | Ignore white/black backdrop; face and attire |
| 20 | Big Swole | Original image; whole-pose atlas + 8 steps | White eyes, red nose/neck ring, crescent earring |
| 21 | Little Foot Nate | Original image; whole-pose atlas + 8 steps | Blue face, yellow spikes/hood, red grin |

All exact Library IDs, local images, and constraints are in `art/roster-manifest.json`. All twenty-one references were materialized and inspected. Every roster entry now has individual reference-based sprites, with no generic numbered placeholder bodies. Internal IDs are stable; confirmed user names appear in the menu. All roster entries now use supplied names.
