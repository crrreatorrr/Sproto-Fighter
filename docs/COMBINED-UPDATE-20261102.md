# Combined campaign, matchup and sprite update — 2 November 2026

This is a factual review record, not a checklist delegated to Claude. No external reviewer was contacted and no remote push was performed. It supersedes older counts in the preserved handoffs. The final local integration commit and working-tree verification are recorded separately in `INTEGRATION-CHECKPOINT-20261102.md`.

## Result and current scope

- 131 selectable fighter owners, 150 body atlases. High Sproto is the default starter; Fat Head Dave is also retained as a starter. Locked portraits remain inspectable; the P1 fight-start gate still requires recruitment. CPU choices remain available for testing.
- 129 distinct story rivals in 126 encounters, seven regions, an expanded fitted map, and persistent version3 saves. The 150-owner target remains **19 supplied fighters short**. No missing user characters were invented.
- The last part of the route is Golden Sproto, Artdude→Artchick at the end of Verse, then **Nick→Juicy** and **Morelight→VMU** in the Hatchery. Each pair is sequential. Both bouts must be won without losing, restarting or leaving; health refills between bouts. Each victory recruits its opponent, and the completed pair opens the next encounter. Previously earned recruits survive a failed second bout.
- Older individual Nick/Juicy victories migrate to a cleared pair only when both recorded encounter wins exist. An unlocked portrait alone never counts as a win. Other earned saves and future valid IDs survive merging and roster expansion.
- God Mode wins use the same recruitment/progression path. Settings testing mode is invulnerable with special charge, without erasing progression. No physical controller testing was performed, as requested.
- Every match and sequential boss bout has a dynamic versus card using the selector's original PFPs and exact names. Long names wrap; twin identity is retained. The four originals with unused right halves use the selector's reviewed left-square crop.
- **3, 2, 1, FIGHT!** follows the versus card. Each numeral lasts60 presentation frames. CPU, combat, damage and replay remain frozen until FIGHT at frame180. The fight itself remains untimed. Pause suspends the introductions; skip keys require release and controller skipping requires neutral before combat.
- Main-menu stage selection now chooses a zone, then a variation. The preview, actual arena, random selection, and return-to-selection state agree. Keyboard/controller navigation retains the two rows and Back returns to their parent zone.
- 46 selectable free-play stages and61 story scenery assets are installed, including the completed Bar reference revisions and Blue Terrace Bar. The present126-node route visits58 scenery variants; only two Hatchery nodes exist, so three additional Hatchery variants are not selected by that route. All variants remain preserved.

## Integration and architecture

Work was isolated in `sproto-combined-readiness` on `codex/combined-readiness-20261102`, with separate preview/QA ports5194/5195. Three immutable captures preserved the live checkout without staging or altering its working files: `41be5642`, `146ab4ff`, and `a654cac8`. The second capture was taken after all seven inspected roster chats were idle or had completed their last task. It includes Buddhashadow, Vitalik's Ethereum projectile/caption, Michael's KO icon, Reverend Cloud's revised portrait, and the new stage work.

The third capture preserves the completed zone→variation menu follow-up. Its selection/controller test conflict was reconciled with the all-roster lock checks and earned-God-Mode save handling; both behaviors remain tested. The other chat’s CSS additions coexist with the readable-name and narrow-screen rules.

The campaign branch was integrated at `7fef6c1c`. The subsequent capture merge deliberately combined generic all-bout asset preloading with Vitalik's power-art preload. The minified atlas conflict was resolved structurally: retain every reviewed correction and add the new Buddha body/revision. No global renderer resizing, combat hitbox change, or bulk re-import was used for the scale repairs.

Key files:

| Area | Files and behavior |
|---|---|
| Route and saves | `src/storyProgress.ts`, `src/storyMode.ts`: roster-derived route, stable IDs, three gauntlets, God Mode, migration and save-safe gating |
| Map | `src/campaignMap.ts`, `.css`, `campaignMapLayout.ts`, `art/story-map/expanded/`: fitted expanded art, overview/detail navigation and portrait framing |
| Match introductions | `src/versusScreen.ts`, `.css`, `fightCountdown.ts`, `main.ts`: original portraits, pause/skip/neutral gating, countdown independent of combat ticks |
| Zone menu | `src/stageGroups.ts`, `selectionMenu.ts`, `mysticUI.css`: eight zones, filtered variations, preserved preview/launch identity and input navigation |
| Other completed work | `core.ts`, `powerArt.ts`, `render.ts`, `stage.ts`, `stageVariants.ts`, original portraits and retained source/runtime assets |
| Sprite repair | `public/fighters/pose-atlas.json`,407 new correction PNGs, `art/scale-consistency-20261102/`, `art/buddhashadow/registration.py` |
| Admission checks | `scripts/sprite-scale-qa.mjs`, `art/sprotos-expansion/process.py`, `docs/SPRITE-SCALE-WORKFLOW.md` |

## Sprite defects and fixes

Two different causes were verified. Independently normalized sheets used first-opaque-height fitting, which can size a body from a weapon or crouched pose. Some main drawings also had genuine head/body scale drift. Runtime Canvas transforms already retained the same atlas scale; the fix therefore belongs in artwork calibration and registration.

Nineteen existing body atlases received407 new PNGs or coherent sequence mappings. Original PNGs remain present. This includes Fat Head Dave's jump and aerial kick, $Bitcoin Obama's aerial poses, Jessica's walk/events, eleven complete optional motion sheets and Collector's ranged sheet. All352 drawings in those eleven motion sheets and all8 Collector ranged drawings are retained. Contact hulls were recomputed with changed canvases; final review caught and fixed eight Collector hulls that initially retained their old coordinates.

Jessica, sun god and retainer use four coherent existing main-walk drawings instead of their incompatible optional gait sheets. Candles keeps its original four-frame walks: the taller stride is intentional, as checked using eye landmarks. Its inconsistent identity clips now use coherent whole-body source poses: entrance8 timing slots/4 drawings, ranged8/4 and death16/6. These are deliberate repeated holds, not newly generated full animation sheets.

The newly integrated Buddhashadow exposed a separate root snap in live idle→walk playback. Eight walk anchors now compensate a30-source-pixel sheet translation. Twenty-three standing-event anchors compensate16 pixels. Nine floor-rest event cells retain their separate centered registration. All104 source images, scale, core poses, throw grips and gameplay positions remain unchanged. Its installer preserves the reviewed mapping.

The importer now refuses to silently shrink an explicitly calibrated source scale to fit a canvas, recording requested/applied scale and its basis. It does not reprocess historical art automatically. The workflow requires anatomical comparison and motion/contact review for new additions; machine success is not an aesthetic verdict.

## Verification actually performed

The final frozen atlas SHA-256 is `293a4aa1abf69cadd25b5dc055f7ca8fb954848d3fa60feb467f5271792a46bf`.

**Automated:** typecheck/production build; broad combat/movement/reaction/throw suites;131-fighter mechanical checks; story migration/controller/main integration; actual-main versus/countdown/restart boundaries; selection controls; map geometry/fit; stage registration/loading; focused Buddha, Vitalik and Michael checks. The broad suite exercised18,533,880 scripted frames and655 per-fighter cases. This is finite scenario coverage, not exhaustive mathematical proof.

The final scale audit covered150 bodies,15,444 cel entries,30,888 facing checks,14,726 supplied-hull registrations,524 grip checks,2,449,546 composed draws including assists, and2,882 replay scenarios/360,250 ticks, with zero hard failures. Rendered/control combat-state comparisons ensure rendering does not alter health, range rules, projectiles, meter or movement. Numerical advisories remain documented rather than blindly normalized away.

Two stale integration fixtures were updated deliberately: the renderer now accepts the presentation-only KO rotation clock; the old map test expected24 scenes and no Bar/Hatchery variants. Revised tests validate the actual current renderer path and all seven region mappings.

**Independent static art review:** every one of the initial130 owners/149 bodies received sampled neutral, gait, jump, ground/air attack, power, recoil and defeat review:2,692 observations. Every corrected cel was separately inspected in both facings. Buddha's104 cels were all reviewed in both facings, alongside its portrait and four raw sheets, followed by reinspection of its40 walk/event cels with the proposed registration. Coverage CSVs state exactly what was sampled; they do not claim continuous motion review.

**Actual browser:** the isolated game was loaded, selected, played and inspected. Verified original-PFP versus screens, twins/long names at320px, pause/resume, each countdown boundary (combat frame/replay0 through3/2/1, frame1 on FIGHT), Artdude→Artchick handoff, and a complete Nick→Juicy God Mode run through both KOs, recruitment, next-opponent display and reload persistence. On the final131 build, verified the updated route and portraits, new scenery, Nick-first replay, normal defeat/retry, and the full3/2/1/FIGHT boundary again. No production-origin save was edited by test fixtures.

Sampled live playback and stepped states in the actual-core renderer lab covered the15 repaired owners plus Buddha, with both-facing views, all affected companion bodies, and extra Fat Head Dave jump/kick/landing, Jessica gait/special, twin entrance/cast/defeat, and Buddha before/after idle→walk/special/recoil transitions. The exact owner/state list is in [root-browser-coverage.csv](evidence/scale-consistency-20261102/root-browser-coverage.csv). This is not a claim that every frame of all131 fighters was manually watched in continuous gameplay.

An additional normal, non-QA practice match used Fat Head Dave against Morelight on Blue Terrace Bar. Actual keyboard W jumped; W then L entered the aerial attack; holding W through landing did not trigger another jump. Captured jump and aerial-chamber images confirm the corrected art at real game scale. The same run checked a locked Buddha preview/message, a playable starter, selected stage/actual background agreement, and return to fighter selection.

The final zone-menu merge passed typecheck/build, 17 selection/controller checks, all seven versus groups, six presentation groups, 26 campaign/controller/main checks, and the map geometry suite. In the combined browser build, choosing Bar exposed its seven variations; Blue Terrace Bar changed the preview and actual match scenery, and returning retained it. Random selected a Hatchery variation and its correct zone. The 320px view kept the document at 320px, wrapped long names/stats and kept both Solana bodies visible; decorative borders slightly overhang their containers without page overflow. The viewport was restored afterward.

## Known limits

- Nineteen more supplied fighter entries/assets are needed for150 unique owners. Existing sources have been retained; no speculative roster entries were created.
- Gryph/Nosmileclown optional air-kick sources retain some punch/recoil-like poses. Scale and registration are corrected; that does not amount to reauthoring their animation semantics.
- Some older owners retain shared or legacy event coverage. The strict “every owner has new authored identity clips” check remains unmet; it is not represented as passed. Source drawings vary stylistically.
- Combat uses numerical range/height rules, not per-pixel alpha hurtboxes. Replay/geometry checks do not prove every painted fist aligns perfectly with every collision threshold.
- No physical controller was tested, no online play was added, and no story video was generated or credits spent by this integration task. Story cutscenes remain clearly labelled placeholders pending script approval.

## Run and review

```sh
cd /Users/kenhiraoka/Documents/Codex/2026-10-31/task/neon-relay
npm install
npm run dev -- --port 5173 --strictPort
```

Open `http://127.0.0.1:5173/`. Keep the terminal running; the local server is not an installed background service. `npm run build` checks production output; `npm run preview -- --port 5194 --strictPort` serves the built output. The isolated candidate remains available at5194 while its process is running. No external deployment was created.

`npm run qa`, `npm run versus-smoke`, the focused `scripts/story-*.mjs`/selection/stage suites and `npm run sprite-scale-qa -- --out /tmp/sproto-scale-review` reproduce the automated checks. Detailed evidence is under `docs/evidence/combined-update/` and `docs/evidence/scale-consistency-20261102/`. Large raw diagnostic reports are also preserved locally under the sibling `story-ui-followup/scale-audit/` directory.
