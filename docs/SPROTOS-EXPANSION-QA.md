# SPROTOS expansion and character corrections — November 2, 2026

All 47 supplied folder references and 18 named submissions are playable. Original reference PNG bytes are preserved. The current shared project has 102 selections and 118 body atlases. Other chats are also updating this project; these counts describe this verified build.

## Installed behavior and artwork

Each expansion body has 32 core pose slots, eight guarded movement drawings and 32 event drawings: intro, special, cast, recoil and defeat. Twins have separate bodies, independent gait phases and additional dash, jump, heavy, aerial and victory clips, sharing one health pool and one damage schedule. Yannix also received these dynamic clips. Match art loads on demand with a bounded recent-body cache.

Named additions: UNC Master Flex, Gryph, vitalik.eth, urmom.eth, Chaton von Sproto, LoadTheBags, SISMA, Captain Howdy, Sproto Sales, Sprog, Jasper, Aaron, Brain Sprot, GodMod3D.eth, Sober, Nosmileclown, ol’ no name and Great Charly.eth. Captain Howdy has one selection. Gryph, GodMod3D.eth and Nosmileclown are paired selections; the pink clown renders at .55 scale against the blue actor's 1.25. Sprog, LoadTheBags and ol’ no name remain single bodies with their unusual facial anatomy.

Latest requested corrections include:

- #651 is Sproto Picasso; #837 is Bitcoin Robin Williams with a stranger projecting muzzle and reference-shaped ears/eyes.
- #313 is one connected body with two faces and four visible pupils. #999 is one connected body with stacked faces. #1870 is one legless floating body.
- #1335 has very long thin yellow zigzag arms; #943 and #1668 are women.
- #1011, #2616 and #2789 use staff attacks; #2789's staff is enlarged. #1815 carries a hooked red/steel halberd and attacks with it.
- #2531 has boxing gloves, sharp eyes and a white collar; #2177's collar is white. #2381's eyes are sharp; #2101's face stays blue; #1414's lower circles are blue.
- LoadTheBags attacks with a microphone. SISMA fires a pixel-lettered RETAIN projectile; its text remains readable in either travel direction. Sproto Sales uses mechanical arms and feet.
- Yannix has a clearer feline muzzle, black nose, fang teeth and dynamic movement. Red Kev has the broad curved open smile. Sprotel Bitcoin has a full Santa suit. VAMP's outfit has attached metal spikes. BIMBA wears a full-length red robe. Bitcoin MLK's skin is closer to the source indigo blue.

The latest #2344 request in this chat was withdrawn and was not used for a new revision here. Separate user-directed work in the shared project is preserved. In particular, newer instructions in the parallel chat define #3181 as two independently moving bodies with the small dark creature attached to the main blue stomach; this supersedes the earlier three-body interpretation.

## Verification

Passed on the installed shared build:

- Production build and TypeScript check.
- `npm run qa`: gameplay smoke, directional input, throw lifecycle, movement, reactions, story/navigation, game and individual fighter checks; the per-fighter stage reported 510 cases, 102 distinct mechanical profiles and eight projectile interaction checks.
- Expansion QA: 20 contract groups, all 47 source hashes, every required animation asset, requested single-body topology, small companion scale, horizontal RETAIN shots and bounded loading through all 72 managed selections/revisions.
- 13 paired-body contract groups and eight pose playback/asset failure groups.
- Asset validator: 9,064 frame entries across 118 body atlases; paths, dimensions, anchors, hard alpha and transparent padding.

Browser samples used the real combat core and mirrored views: independent Nosmileclown attacks and normal-speed walking; #1870 hovering; staff and microphone contacts; #1335's extended zigzag punch; #999's single-body movement; Yannix's dynamic finisher and normal-speed scenario playback. The actual main game was launched with SISMA, and its flying RETAIN word was inspected with visible QA controls. Source/contact sheets were reviewed separately from simulation checks.

## Provenance and limits

Higgsfield GPT Image 2.5 Sunburst, high quality, was selected after a style comparison. Nano Banana 2.1 was used where it preserved unusual anatomy better or completed a legitimate cartoon sheet rejected by the other model. Requests, media receipts, job IDs, rejected versions and source-job markers remain under `art/sprotos-expansion/`.

Sparse attack in-betweens and direction-specific paired throw art remain prototype limitations. Tests verify assets and mechanics, not perfect artwork in every frame. #1345's eight guarded steps were locally authored from its Higgsfield neutral pose using the existing roster's footwork method after repeated generation rejections. #2075's final resting defeat drawings reuse the held floor silhouette. Original and rejected sheets remain archived. Physical controller hardware was not tested in this pass.

No deployment, commit or push was performed. Play locally at http://127.0.0.1:5173/.
