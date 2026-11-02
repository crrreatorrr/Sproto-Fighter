# Sproto Arena — factual handoff, 2 November 2026

This records work and checks already performed, not checks delegated to Claude.
No external reviewer was contacted. Earlier export documentation is preserved
in `archive/CLAUDE-HANDOFF-22-fighter-export.md`.

## Current integrated scope

102 fighter owners / 118 body atlases; original portraits; individual mechanical
profiles; assigned partners; ground/air/directional attacks; bounded combos;
recoil/knockdown; directional grabs; untimed CPU and practice matches. Pairs
share combat state while their complete bodies animate separately. Menu
standing-height normalization leaves fight size unchanged. Sparse/repeated
poses remain: these are not continuous generated animation videos.

100 interactive encounter nodes use stable save IDs and persistent recruitment.
Ten base stages remain available in free play; 24 approved variations appear in
regional story blocks. Bar/Hatchery retain their detailed originals. The final
Morelight/Vaudream gauntlet and immediate Settings testing mode are installed.
God Mode testing does not grant story progress. Scene panels remain placeholders
pending script approval; this integration generated no video or paid artwork.

All task tips, including final partner `c4263cb8`, appear in
[INTEGRATION-CHECKPOINT.md](INTEGRATION-CHECKPOINT.md). Shared tracked and
untracked project work was captured at `366c82a2`. All source worktrees and
backup branches remain. Integration is local; no push/deployment in this update.

## Changed areas and rationale

- `src/poseAtlas.ts`: whole-gait envelopes eliminate packing drift. Complete
  dash envelopes stabilize pair spacing; a conservative locomotion camera
  envelope reserves room before wide drawings appear. Final packing is also
  bounded during reactions/specials. Rendering never mutates simulation;
  throw leadership, collision roots and hand contact remain unchanged.
- `src/main.ts`: actual story launch loads the mapped variant, free play clears
  it; toggling testing God Mode after KO resumes a new round when Settings
  closes, rather than leaving the old result overlay.
- `src/campaignMap.ts`, `campaignMapLayout.ts`, `campaignMap.css`: keyboard
  focus, region jumps, zoom and rival preview on a real 100-button map. Narrow
  viewports now have an explicit map height; previously the grid expanded to
  the full 1,688 px map image and initially showed only empty ocean.
- `src/stageVariants.ts`, `activeStoryLocation.ts`, `stage.ts`: 24 unchanged
  approved PNGs, deterministic regional mapping, verified floor placement and
  base-stage fallback; original assets retained.
- `src/selectionMenu.ts`: final twin sizing and story locks preserved; lazy
  offscreen portraits reduce startup contention.
- `vite.config.ts`: excludes tens of thousands of static/archive files from
  watching and scans only index.html. Application code still reloads. Reload
  explicitly after static art changes. Three old preview imports now use the
  current exported animation names.
- `scripts/paired-wall-motion-smoke.mjs`: both dashes, recoveries, both facings
  and both walls for every pair. Duo checks now validate actual installed
  entrance/death clips instead of stale legacy names or global image numbers.
  Story checks cover toggling God Mode from a completed-round overlay.

## Checks actually completed

Production build and TypeScript passed. Broad QA passed after final partner
integration: 102 combo routes, 15 throw groups, 24 movement groups, eight reaction
and 43 spit groups; six broad core groups (11,236,320 simulation frames); 510
per-fighter cases across 102 profiles. After the final renderer/UI changes,
relevant checks were rerun:

- 13 duo groups including CPU approach/blue kick recovery; nine pose groups;
  32 stable gait/facing scenarios; 13,440 pose-clearance probes; 6,400 wall-motion
  frames with zero bleed and no combat-state mutation.
- 612 partner facing/position cases, 32 twin cases and 78 expanded-kit cases;
  both twin bodies attack across 840 captured simulation/render frames.
- 12 stub-DOM/gamepad selection/controller groups; 30 story/persistence/God Mode
  groups; 100 bounded, separated map nodes; all 24 scene hashes and route
  mappings; final production build.

Actual browser review used isolated port 5187, Chrome and earlier in-app checks:

- All 16 paired selections individually in both facings after the partner merge:
  96 group screenshots / 384 individual samples of walk, kick, forward throw
  hold/release, special and heavy reactions. Every contact sheet was viewed.
  Earlier frozen review sampled 27 scenarios including all directional throws
  and aerial attacks. The CSV distinguishes these passes.
- Final dash-wall correction: eight new screenshots, every pair/both edges,
  viewed after the fix. Additional 1x captures show walking and post-dash
  recovery for every pair. Active dash shapes were frame-stepped separately.
  These are sampled real-time screenshots, not continuous video approval.
- All 13 expanded partner kits / 16 body contacts in both facings with the actual
  renderer; both twin identities and effect silhouettes inspected. This gallery
  is a controlled three-pip fixture, not earned-meter human play.
- Actual menu with a full-size Duo CPU preview, Bar launch, CPU approach and KO,
  Settings God Mode from the result screen, resumed fresh round and visible
  keyboard kick contact. Earlier actual-game checks cover W jump, aerial moves,
  grabs, Yannix beam in both facings/air and Team Special activation.
- Desktop map region jumps, locked nodes, Find next fight, placeholder scene
  and first real story fight on the drainage-floodgate variant. At 390×844,
  map height/focus are correct and Challenge opens the correct scene.

The wall probe initially failed on 71 frames, worst overflow 81.27 world pixels;
now all 6,400 are bounded. The isolated dev server previously timed out after
15 seconds serving a 3.1 MB manifest. After restart/static-watch exclusion it
served the same file in 0.006 sec. This is one local observation, not a general
benchmark. Temporary viewport overrides were restored.

Evidence is under `docs/evidence/final-integration/`, plus
[PAIRED-QA-COVERAGE.csv](PAIRED-QA-COVERAGE.csv),
[CAMPAIGN-MAP-QA.md](CAMPAIGN-MAP-QA.md) and
[STAGE-VARIANTS-QA.md](STAGE-VARIANTS-QA.md).
Full-page menu captures may show unloaded offscreen lazy portraits; these load
on scroll. A capture originally named air kick was renamed
`combined-ground-kick-contact.png`: it is a ground kick, not aerial evidence.
The first final selection command used a nonexistent script name; corrected
`selection-menu-smoke.mjs` passed all 12 groups. Initial duo failures were stale
fixture expectations for new clips and were corrected as described above.
No unresolved failing check is silently counted as passing.

## Run and review

Root README and Play Sproto Arena.command describe launch. Main uses 5173;
isolated integration uses 5187. Saves are origin-specific. Add `?qa` for visible
state/freeze/step controls. Labs: `/art/paired-review.html`,
`/art/pose-atlas-lab.html`, `/art/partner-expansion-lab.html`,
`/art/twin-menu-qa.html`.

Run `npm run build`, `npm run qa`, `npm run partners-qa`, plus the focused scripts
listed in README. No physical controller test, per instruction. No new generation,
credit spending, remote push or hosting. Script approval remains required before
cutscene video generation; final cinematic content is not claimed complete.

## Honest limitations

All 102 fighters are mechanically covered, but this pass does not claim a fresh
visual audit of every frame of all 102. Imported identity work and its evidence
are documented in IDENTITY-ACTIONS-QA.md. Final combined visual checks focus on
all 16 paired selections, new assists, campaign/UI and representative live
fights. Earlier fighter/roster reports remain available. Physical controllers,
long sessions, every matchup/transition, a full manual 100-win campaign,
subjective player acceptance and systematic cross-browser performance remain
unverified. There is no online/rollback-readiness claim. The retained authoring
archive is large; review contents before any future public push.
