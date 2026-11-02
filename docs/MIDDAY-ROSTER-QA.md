# New reference fighters — 2 November 2026

22 new playable roster entries, drawn with Higgsfield GPT Image 2.5 Sunburst (high quality). The 24 independent bodies contain 1,856 installed full-body drawings. Main combat and event sources are 4K; guarded walking sources are 2K. Source backgrounds are excluded from the playable sprites. WILLUMINATI's tiny gnome is excluded.

| Fighter | Bodies | Drawings |
| --- | ---: | ---: |
| Reverend Cloud | 1 | 72 |
| H.E. ZEPUMP | 2 | 208 |
| Sprotopotamus | 1 | 72 |
| WILLUMINATI | 1 | 72 |
| P\| RATΞ | 1 | 72 |
| prim | 1 | 72 |
| Benjamin Button | 1 | 72 |
| Max Biggums | 1 | 72 |
| Xav | 1 | 72 |
| 0xEmix0 | 1 | 72 |
| 0xPeterPan | 2 | 208 |
| ANNI niM.A.T. | 1 | 72 |
| pinewaffle | 1 | 72 |
| Rainman_four20 | 1 | 72 |
| wifebeater.eth | 1 | 72 |
| FIAT FUDDER | 1 | 72 |
| MoonShiller | 1 | 72 |
| GodEther.eth | 1 | 72 |
| Aleksander | 1 | 72 |
| cyberviber | 1 | 72 |
| RealityArchitect.eth | 1 | 72 |
| MrGoldRobe.eth | 1 | 72 |

Sproto #282 is now **hly3**, retaining its existing two-body mechanics and animations.

Each body has 32 combat poses, eight walking drawings and 32 event drawings: entrance (4), special (8), ranged cast (4), recoil (4), death/collapse/rest (12). Entrances use individual gestures such as Cloud adjusting his clock tie, Benjamin adjusting his collar, Aleksander tilting his attached 3 ornament and Xav stretching sleepily. Mouth-spit drawings have inhale, puffed-cheek anticipation, open-mouth release and recovery. Death drawings preserve each face, body, outfit and accessories through a complete side-lying rest.

Each of the four twin bodies also has 32 additional motion drawings: dash (6), jump (6), heavy kick (8), aerial kick (6), victory (6). Separate atlases keep the partners distinct, with shared health and alternating special contacts. Mouth emission points are measured from release drawings; twins use different anchors for the front body in each facing.

P| RATΞ winds up and throws a rotating cream-white skull and crossbones. Its Jolly Roger kit adds a returning shot and a four-contact boarding finish. The skull's eyes, nose, teeth and two crossed bones are drawn as a single pixel object.

## Verification

- `node scripts/midday-roster-smoke.mjs`: **550** cases pass across all 22 fighters. Checks eight-frame gait in both facings; dash, jump, landing and recovery; five attacks; six directional spit inputs; confirmed projectile impacts in both facings; eight directional throws; four special contacts; actual custom entrance/cast/death clip selection; free-play access; twin bodies; hly3 name.
- `node scripts/fighter-qa.mjs`: **635** cases across **127** unique mechanical profiles, plus eight trajectory/power interactions, pass at this review snapshot.
- `node scripts/paired-wall-motion-smoke.mjs`: **7,200** checks pass, zero silhouette bleed past either arena edge.
- `node scripts/selection-menu-smoke.mjs`: **15** selection/controller integration groups pass.
- `node scripts/story-smoke.mjs`: **40** story, persistence and God Mode groups pass.
- `npm run build`: passes.
- All 1,856 installed sprites validate as 256×256 RGBA, binary alpha and unclipped bounds. All 24 core, walking and event sheets and all four twin motion sheets received visual review. An incomplete PeterPan event grid was replaced before installation.
- 72 asset-family routes (core, walk and event for all 24 bodies) return PNG images from the user dev server on port 5173. The server's cached public-file inventory initially missed new paths; restarting it resolved the load failure.

Actual browser checks: pirate and Cloud entrances; skull rotation at frames 19 and 23 and a single 56 HP impact at frame 52; both separated twin teams in one match; ZEPUMP's front-body mouth release at frame 15; twin jump/air-heavy state at frame 55; cyberviber's four eyes and custom spit release. Ongoing edits from other chats caused page resets, so final visual samples used a separate port with live reload disabled. No warning/error was recorded from that final QA origin. Browser screenshots are retained with the chat outputs.

New additions are immediately available in free play and as opponents. The saved campaign retains its established encounter route. Installation preserves other chats' source changes and existing art. The two new pair registrations live outside the bulk expansion's generated blocks so later bulk art installs retain them. The bulk installer now replaces only its owned roster IDs, preserving Sprotopotamus and other separately added names.

## Provenance and evidence

`art/named-midday-nov02/plan.json`, `uploads.json`, request files, `jobs.json`, `gallery-shown.json`, `mouth-origins.json`, `install-report.json`, and each body's own `art/<id>/identity.json`, `jobs.json`, raw sheets and processed reports retain source and generation provenance. Failed and superseded generations remain identified in the ledger; accepted assets alone are installed.

Chat outputs: `new-roster-overview.png`, `reverend-pirate-entrance.png`, `pirate-skull-throw.png`, `pirate-skull-rotation.png`, `new-twins-entrance.png`, `zepump-spit.png`, `new-twins-motion.png`, `cyberviber-spit.png`, `new-fighters-in-game.png`.
