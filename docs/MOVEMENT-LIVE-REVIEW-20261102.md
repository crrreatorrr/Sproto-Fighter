# Live movement review and local handoff — 2 November 2026

This continues the earlier browser-blocked checkpoint. Browser access recovered. All **131 selectable owners** now have individual sampled browser records in both actual facings: **112 single-body fighters and 19 pairs / 150 body atlases**. This is an extensive sampled review, **not every-frame approval of every animation or every normal-match effect**. The 150 distinct playable-owner goal remains 19 entries/assets short.

## Repairs

The new changes correct **28 ground/aerial action clips**, one Virtuagram core aerial pose, and source-sheet registration for four bodies. The previously committed Gryph/Nosmileclown aerial-contact fixes remain installed and were inspected in browser. Original PNGs are preserved; no assets were generated, no credits were spent, and no new animation-sheet authorship is claimed.

The main contact defect was a wrong drawing in an active timing slot: the leg retracted into a tucked/guard pose before the hit window ended. The repairs hold the existing forward extension through that interval and retain anticipation and recovery afterward. Source hashes and before/after clip metadata are recorded in `art/movement-followup-20261102/`. Both twins are checked using actual simulation facing; mirroring the same lead would miss half the pair.

| Fighter | Confirmed repair |
|---|---|
| hly3 | Blue member's optional sheet uses constant 0.86 density and +35px source-anchor correction; heavy and air contact holds. Red member's second active air kick also corrected. |
| bill and John | Main optional sheet uses constant 0.90 density and +31px source-anchor correction; main heavy/air and companion air contact holds. |
| Suburban Couple | Main optional sheet uses constant 0.90 density and +31px source-anchor correction; companion heavy/air contact holds. |
| 0xPeterPan | Yellow member's optional origin corrected by +33px, with density unchanged. Backward/tucked contact drawings replaced with its existing forward kick. |
| Dancing Partners, schizos, Tartarian Soldiers | Individually repaired the affected heavy and aerial active slots for main/companion bodies. |
| Frog and Tonic | Main aerial contact remains extended throughout the hit window. |
| Comedy Club, Cyclops and Joey | Repaired the individually confirmed second active slots and retained recovery. |
| GodMod3D.eth, H.E. ZEPUMP | Existing extended aerial drawing used for both active slots. |
| Virtuagram | Core aerial-heavy pose used a walking/guard-like drawing; now selects its existing extended kick. |

Jessica's observed jump/kick/attack and walking samples showed no new confirmed whole-body size change. The automated blue-head walk area ratio is 0.9992–1.0074 of neutral; that measure alone does not prove anatomy. Fat Head Dave's neutral head measured 50×40 source pixels versus 49×40 in the installed rise/fall drawings. The wider airborne silhouette comes from his arms. Those findings preserve the repaired assets already in the checkpoint rather than shrinking intentional poses. Big Swole's eight installed walk PNGs were individually inspected; no new between-leg stray shape was found in this pass.

## Architecture and changed files

- `src/poseAtlas.ts`: optional constant `clipRegistration` calibration. Image dimensions, anchor, opaque bounds and contact hull receive the same transform. Invalid/unknown calibration entries are rejected. This is not per-frame silhouette normalization, and combat state/hitboxes do not read it.
- `public/fighters/pose-atlas.json`: reviewed pose mappings, four body calibrations and cache revision.
- `scripts/sprite-scale-qa.mjs`: audit understands the same source calibration.
- `art/motion-roster-lab.html`: four independent real-core fixtures, fixed camera scale, explicit actual facing, frame stepping and normal playback. It does not change saves or combat behavior.
- `scripts/motion-fix-smoke.mjs` and its targeted checks: source hashes, actual renderer timing, both body identities, recovery, calibration validation and combat-state nonmutation.
- `scripts/movement-visual-coverage.mjs`: emits the individual coverage matrix from explicit reviewer records. It does not turn automated/captured-only runs into visual passes.
- `docs/SPRITE-SCALE-WORKFLOW.md`: documents the source-sheet contract, anatomical comparison and isolated browser review workflow for later characters.

No movement speeds, attack timing, damage, progression, collision or input mappings were changed in this follow-up. The purpose is to make the existing animation agree with those mechanics.

## Coverage and evidence

The [per-fighter CSV](evidence/movement-followup-20261102/live-coverage.csv) and [structured matrix](evidence/movement-followup-20261102/live-coverage.json) list all owners, body identities, actual facings, observed state labels, evidence records and gaps. Counts use different explicit units and must not be summed as comparable animation frames.

| Reviewer scope | Actual bounded visual coverage |
|---|---|
| Singles A | 41 owners, both facings; movement, jump, ground/air attacks, casts, reactions, throws and special body samples. Virtuagram repair retested. Four owners also received successive 1× playback screenshots. |
| Singles B | 33 owners, both facings; 2,032 inspected phase/sample observations, including Jessica. Standard walking samples do not certify every reversal/stop; standard air-light frame20 is recovery, not active contact. |
| Singles C | 38 owners, both facings; 1,370 owner/scenario/facing samples and 1,514 phase observations. LoadTheBags microphone and SISMA scream identities were retained. |
| Root pairs | Five owners / ten bodies; 181 inspected browser screenshots, including exact first/last contact and subsequent normal-speed recovery in both facings. Selected edge grabs/dashes and full screenshots supplement body crops. |
| Pairs B | Ten owners / twenty bodies; 140 browser captures inspected, 18 normal-speed samples, 80 separately inspected active-source slots. One duplicate capture excluded. |
| Pairs C | Four owners / eight bodies; all 52 center scenarios sampled in both actual facings, 14 edge scenarios at both walls/both facings, 30 exact post-fix frames and six normal-speed replays. Ten repaired clips rechecked. Unseen intermediate frames remain gaps. |

The exact active-source inspection covered all **39 bodies with optional heavy/air-kick clips**, in addition to the broader owner review. Targeted source/frame checks caught short active windows that sparse live screenshots had missed.

The normal game was also operated through browser keyboard input: High Sproto versus hly3, practice/God Mode testing, approach, W jump and landing, horizontal ranged attack, Team Special with partner cameo, grab miss outside reach, successful close grab and release of both twin bodies. Testing invulnerability did not bypass the locked P1 selection gate. This normal-match check does not cover every owner's complete effects or every possible opponent.

Raw browser evidence remains locally in the sibling `movement-followup-20261102/` directory and the isolated checkout's evidence subdirectories. Selected proof images, review metadata and repair scripts are committed; the hundreds of redundant raw screenshots are retained locally instead of all being added to Git.

## Checks

- Production TypeScript/Vite build: passed.
- `npm run smoke`: passed, including **15 throw groups**, **24 movement checks**, directional/projectile checks and **8 hit-reaction groups**. Some legacy focused combat assertions cover the original 21-character set; the full atlas traversal below covers the current roster.
- Ten targeted motion repair suites: passed, including source hashes, active/recovery frame selection, both actual facings, calibrated geometry and no simulation mutation.
- Full sprite audit: **150 bodies, 15,444 cel entries, 15,308 distinct PNGs, 30,888 cel/facing checks, 14,726 hull-registration checks, 524 throw grips, 2,449,546 composed draws, 2,882 replay scenarios and 360,250 replay ticks**. **Zero hard failures; 950 unchanged heuristic advisories.** Advisories are not dismissed as proof of good art.
- Four-panel fixture equivalence: **15,288 comparisons / 2,043,600 core ticks** passed when the wall was added. The established 52-scenario functional itinerary passed **13,624 cases** for all 131 owners and both actual facings. Neither result is visual approval.

## Remaining limits

- Browser inspection samples real playback and paused contact phases; it is not continuous human play or every intermediate cel of all 52 scenarios for every owner. The individual matrix names missing directions and transitions.
- The wall omits normal-game projectile graphics, partner effects, entrance, defeat and victory presentation. Those are not certified roster-wide by this pass. Victory calibration is included in automated geometry checks, not full live event inspection.
- hly3 blue and Peter Pan yellow retain modest source drawing proportion differences that a uniform scale/origin correction cannot remove. No nonuniform body warping was applied to hide them.
- Tiny Nosmileclown/10Inu companions catch the opponent's lower leg; their intended small scale is preserved. Crouch-block uses the existing standing guard drawing during blockstun. Some special poses spread a pair's silhouette wider than neutral.
- Small wall images limit fine facial/hand detail. Suspicious contact sources were separately inspected at source resolution; not every source cel received that close inspection.
- No quantified hardware input-latency claim, physical controller test, remote push, publication or generated asset purchase.

## Run and reproduce

```sh
cd /Users/kenhiraoka/Documents/Codex/2026-10-31/task/neon-relay
npm run dev -- --port 5173 --strictPort
```

Open `http://127.0.0.1:5173/`. The server is a local process, not a system startup service. If the existing server owns 5173, use its URL instead of starting another process.

```sh
npm run build
npm run smoke
npm run motion-fix-smoke
npm run sprite-scale-qa -- --out /tmp/sproto-scale-review
npm run motion-visual-coverage
```

The browser review used an isolated no-HMR server on 5199 to avoid concurrent file writes resetting scenarios. Main's separate in-progress map/stage and versus-font changes are outside this motion commit and were preserved. There is no remote push.

## Final local integration

Motion source/review commit: `5becdd96`. Combined code commit on local main: `aa6ba21c`. The sole merge conflict was the package test-command list; both stage and motion commands were retained. All **42 concurrent local files were verified byte-for-byte unchanged** during the main fast-forward.

The actual main working tree passed production build, all targeted motion-repair checks, versus checks and stage-catalogue checks. The live menu showed 131 fighters and 73 stages, including the other chat's still-uncommitted stage work. Those local map/stage/font changes were not silently included in the motion commit.

Browser verification on `http://127.0.0.1:5173/` confirmed Dave versus hly3 selection, correct original-PFP versus screen, visible countdown 3, W jump, grounded approach, close heavy hit (1000→880 HP with both twin bodies airborne), a successful grab and subsequent grounded release, restart-to-versus and return to selection. High Sproto versus Morelight/CPU/Sproto Ranch was restored and START FIGHT remained enabled. No console errors were recorded. [Exact observations and limits](evidence/movement-followup-20261102/main-browser-verification.json) distinguish unobserved frames from confirmed results; [integration checks](evidence/movement-followup-20261102/checks/integrated/main-results.json) record actual exit codes.

Git's background housekeeping reported a malformed extra ref named `refs/heads/codex/persistent-story-unlocks 2`; the valid story branch still resolves normally. Local commits and integration succeeded. No ref deletion or unrelated repository cleanup was performed.
