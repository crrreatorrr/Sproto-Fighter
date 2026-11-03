# Satoshi Sprototo, Xalt and Poto Cai Cai

Added November 2, 2026 from the three supplied references. Runtime IDs: satoshi, xalt and potocaicai. Updated per the user’s unlock preference: they are three separate campaign opponents in the Verse, before Golden Sproto. Each stays locked as P1 until defeated, and recruitment persists across reloads. Existing recruits, banked historical wins and earned God Mode are preserved.

Each fighter has 104 distinct drawings: 32 combat poses, eight guarded walking frames, 32 standard event drawings and 32 additional identity drawings. The active custom presentation uses entrance8, ranged8 and death16. The existing renderer selects these clips directly; they do not require new presentation transforms or changes to combat/replay timing.

- Satoshi: narrow yellow eyes, huge red smile and yellow collar. Entrance raises a hush finger, then opens both palms and settles into guard. Spit puffs his broad cheeks before a forward mouth snap. Death loses the grin, covers the mouth, collapses and settles on his side.
- Xalt: round yellow eyes, dark red iris rings, red rear spines, red outfit and collar brooch. Entrance bounces and taps the brooch. Spit coils his neck before an open-beaked release. Death staggers, sits, rolls onto his side and closes his eyes.
- Poto Cai Cai: asymmetric coin-like eye disc, sleepy layered other eye, crown, red lips, purple jaw and segmented yellow belt. Entrance tips the attached crown. Spit thrusts his crowned head forward. Death protects the crown, collapses and settles with crown and monocle attached.

Higgsfield GPT Image 2.5 Sunburst generated all twelve high-quality sheets. Original references, source hashes, prompts, completed job IDs/URLs and normalization metadata are preserved under art/named-nov02-late and art/{satoshi,xalt,potocaicai}. Installed images live under public/fighters/{poses,walk,events,identity}. All 312 PNGs are 256×256 RGBA with binary alpha, transparent margins and no clipped silhouette. Each character has 104 distinct frame hashes. Every identity floor-rest frame is horizontal.

Reviewed mouth points in identity release cel12 (anchor112,210, scale1.25): Satoshi [160,124] → forward60/height107.5; Xalt [151,126] → forward48.75/height105; Poto [146,151] → forward42.5/height73.75. Their straight spit motifs are ring, prism and coin, with startup16/17/18, speed11/12/13 and damage59/60/61 respectively. Mouth casts retain all eight authored phases and normal recovery.

Validation:

- Focused runtime test: all three 104-frame contracts, unique clip hashes, eight entrance and sixteen death phases in both facings, floor-only death starts, eight walking phases, dash/jump/landing, five attacks, 24 directional throws and four-contact special spending/recovery.
- 108 ground/air/facing/directional-input mouth-spit cases: exact mouth origin, spawn/release synchronization, straight travel, damage, single hit/block and recovery. Presentation sampling is read-only.
- Presentation/camera regression: 105 installed owners, 210 facing-specific entrances and 1,680 death facing/wall/impact/floor cases passed. The three additions are included; this test reports only owners with complete authored identity clips.
- Full combat-profile regression passed 635 cases across the then-current 127-fighter shared workspace, plus eight power interaction checks.
- Original animation integration validation included fifteen menu/controller groups, forty then-current story/persistence/God Mode checks, six round-presentation groups and the production TypeScript/Vite build. The expanded campaign validation below supersedes the original fixed-route checks.

Visual review covered all twelve normalized contact sheets. In Chrome's actual main game, all three were selected as P1 and launched; entrances and first mouth-spit emission were inspected at exact frozen frames. Satoshi's shot hit once for59HP at frame54. Keyboard movement and a punch were sampled for Xalt. Real CPU knockouts additionally checked custom floor-rest presentation. These are sampled browser checks plus deterministic full-clock tests, not a claim that every animation transition was watched manually.

The in-app browser and the all-roster animation lab encountered local asset-loading failures, so main-game visual verification used Chrome against the built local preview. The animation lab now loads selected fighter/partner assets and recognizes identity clip names; main-game asset loading and tested frames were unaffected.

Evidence in chat outputs: new-three-custom-animations.gif and new-three-animation-preview.png assemble the installed identity drawings for review; they are sprite previews, not gameplay recordings. Actual gameplay captures include satoshi-xalt-entrance.png, xalt-poto-entrance.png, poto-crown-entrance.png, the three mouth-spit screenshots and knockout screenshots.

## Campaign recruitment follow-up

The three free-play exceptions were removed. The current dynamic campaign places Satoshi Sprototo, Xalt and Poto Cai Cai in consecutive Verse encounters before Golden and the gauntlets. They are not campaign starters. Core art, combat profiles and custom animations are unchanged.

Save revision3 reads historical revisions1/2 without overwriting their records, retains later completed encounters when new rivals are inserted, and preserves earned God Mode separately from expanded-route completion. Focused checks cover every historical checkpoint, each new recruit’s lock/win/reload behavior, replay idempotence and stale-tab merges. The dynamic campaign controller also passes its full normal/God Mode route and gauntlet tests. The earlier free-play browser evidence above records the animation verification performed before this recruitment change.


Current recruitment validation passed November 2:

- `npm run story-smoke`: 16 dynamic campaign/controller/main integration groups across the installed 123 nodes and 125 opponents, plus the focused three-recruit suite. Every v1/v2 checkpoint, each new recruit’s own victory, reload, replay and stale-tab merge is covered with in-memory storage.
- Selection/controller: 15 groups, including locked previews for all three. Map: actual node separation, five responsive sizes and synthetic 150-node layout. Production build passed.
- Animation regression: each 104-frame contract, entrance8/spit8/death16, both-facing movement, throws and special recovery; 108 mouth-spit cases and 24 directional throws passed.
- Chrome production-preview UI: Satoshi’s P1 preview showed disabled “UNLOCK IN STORY”; each of the three separate Verse entries showed the correct portrait/name and locked state. No browser console errors. This browser check inspected the entries without modifying the user’s campaign save; victory/reload behavior was verified by the runtime integration suite.

Campaign screenshots in chat outputs: satoshi-campaign-recruit.png, xalt-campaign-recruit.png and poto-campaign-recruit.png.
