# Roster scope — Build 01

Latest instruction replaces the shared-kit shortcut with individual attacks, powers and animations for all 21 fighters. Every submitted character is selectable as player or opponent. [FIGHTER_KITS.md](FIGHTER_KITS.md) records implemented mechanical differences and special schedules.

Each Higgsfield combat image is segmented into 15 parts and posed at runtime with individual guards, strike/kick/cast combinations and special choreography. These are not generated animation sheets. Character selection uses original submitted images. Visual QA coverage is recorded in [ART_QA.md](ART_QA.md).

| Reference | Working label | Actual art status | Requirement |
| --- | --- | --- | --- |
| 1 | Golden Sproto | Original selection image; Higgsfield combat rig | Yellow body, reference face/clothing |
| 2 | Morelight | Original selection image; Higgsfield combat rig | Blue body, no clothes |
| 3 | Fat Head Dave | Original selection image; Higgsfield combat rig | Buff, muscular |
| 4 | Halloween 2008 | Original selection image; Higgsfield combat rig | Omit mini pumpkin; bouncing pumpkin projectiles and Harvest Moon special |
| 5 | Yannix | Original selection image; Higgsfield combat rig | Indigo head, yellow collar, buttoned vest |
| 6 | Bongraker | Original selection image; Higgsfield combat rig | Unusual double face, blue head, black jacket |
| 7 | Juicy | Original selection image; Higgsfield combat rig | Reference features retained |
| 8 | Yoyo | Original selection image; Higgsfield combat rig | Reference features retained |
| 9 | Red Kev | Original selection image; Higgsfield combat rig | Ignore red background; head + similar clothing |
| 10 | Sprotel Bitcoin | Original selection image; Higgsfield combat rig | Keep Christmas hat  |
| 11 | Chode Adoration | Original selection image; Higgsfield combat rig | Individual design retained  |
| 12 | $Bitcoin Obama | Original selection image; Higgsfield combat rig | Individual design retained  |
| 13 | Jahon | Original selection image; Higgsfield combat rig | Individual design retained  |
| 14 | Virtuagram | Original selection image; Higgsfield combat rig | Individual design retained  |
| 15 | Dumpstar | Original selection image; Higgsfield combat rig | Face and attire only; omit objects above shoulders |
| 16 | Crapto | Original selection image; Higgsfield combat rig | Bare blue body, yellow goggles/red irises, red lips |
| 17 | VAMP | Original selection image; Higgsfield combat rig | Blue feline face, narrow eyes, black jacket/yellow collar |
| 18 | Alpha 777 | Original selection image; Higgsfield combat rig | Olive skin, blue goggles, red scarf, striped shirt |
| 19 | Bitcoin Mandela | Original selection image; Higgsfield combat rig | Ignore white/black backdrop; face and attire |
| 20 | Big Swole | Original selection image; Higgsfield combat rig | White eyes, red nose/neck ring, crescent earring |
| 21 | Little Foot Nate | Original selection image; Higgsfield combat rig | Blue face, yellow spikes/hood, red grin |

All exact Library IDs, local images, and constraints are in `art/roster-manifest.json`. All twenty-one references were materialized and inspected. Every roster entry now has individual reference-based sprites, with no generic numbered placeholder bodies. Internal IDs are stable; confirmed user names appear in the menu. All roster entries now use supplied names.
