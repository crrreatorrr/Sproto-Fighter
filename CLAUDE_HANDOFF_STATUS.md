# Handoff status: `CLAUDE_HANDOFF_OPTIMIZATION.md` in Sproto-Fighter

Branch `claude/happy-pasteur-0dhfzp`. Each handoff item is marked **done** (commit), **partial**
(what remains), **skipped** (why) or **blocked** (on what). Every item was checked against the code
first; where the handoff was wrong, the line says so.

## Roster and stage guard

`scripts/dist-content-check.mjs` enumerates the roster from `src/core.ts` (`PLAYABLE_FIGHTERS`,
every body and Team Special partner body), the stages from `src/stage.ts`, the story sceneries from
`src/stageVariants.ts` and the combat clips from `src/combatSfx.ts`, and checks that each one's
files exist in a built `dist/`: atlas body file, sprite sheet with a cell for every frame (or the
frames themselves), standing preview, both portraits, background, menu preview, Team Special
recording, plus every root-relative asset path written in the built JS, CSS and HTML. It runs in
`run-all` (skips when there is no `dist/`) and fails if the roster drops below 254 or the stages
below 121.

| When | Fighters | Bodies | Stages | Story sceneries | Result |
| --- | --- | --- | --- | --- | --- |
| Before (main, packed release build) | 254 | 274 | 121 | 112 | all resolve |

## Items

### Part A

- **A1** (delete `public/arcade/`): **skipped**. Not referenced by game code, but it is a documented
  feature: the README's "Sproto Arcade" section tells players to open `/arcade/index.html` (three
  games), and `dist/arcade/` (76 MB, 673 files) ships it with every build the hub fetches. Removing
  a playable feature is the owner's call; listed under repo hygiene below.
- **A2** (4 orphaned companion folders): **done** (685e202d). Verified: none of the four ids is in
  `PAIRED_BODY_IDS` or the manifest, and `art/sprotos-expansion/install.py` pops them from the
  manifest on purpose. 416 PNGs removed via the A3 script.
- **A3** (unreferenced backup and duplicate frames): **done** (685e202d), with a correction.
  `scripts/prune-unreferenced-fighter-frames.mjs` (dry run by default, `--list`, `--delete`) keeps
  a frame if the manifest names it, if `src/`/`scripts/`/`tests/` or a JSON file they read names it
  (for example the reviewed source hashes in `art/identity-actions/audit.json`), or if an `art/`
  authoring script names its folder. It removed 964 files (18.2 MB): the four companions, the named
  duplicates of numbered frames in guest09, guest10, mox and vamp, and superseded motion/identity
  drafts. The handoff's "407 `scale-fix/` backups" is wrong: almost every `scale-fix/` and
  `scale-body-128/` frame is the live frame in the manifest; only 13 are unreferenced, and they sit in
  folders `art/scale-consistency-20261102/build_repairs.py` reads, so they stay. A first, looser rule
  (manifest only) deleted frames that `hly3-blue-motion-smoke` hashes through a review JSON; that was
  reverted before committing, which is why the rule now covers JSON files the checks read.
- **A4** (superseded maps, `ko_02.mp3`, manifests): **done differently** (c3811c08). Every one of
  these files is read by a check (`campaign-map-smoke` asserts both old maps exist, the README says
  the original maps are retained, `tests/combat-sfx.test.ts` reads `ko_02.mp3` and `manifest.csv`,
  `tests/audio-events.test.ts` reads the music JSONs, `portraits-smoke`, `fighter-budget-qa`,
  `stage-previews-smoke`, `stage-variants-smoke`, `stage-catalog-smoke` and
  `selection-menu-smoke` read the image and stage manifests). Deleting or moving them would mean
  rewriting those checks for no runtime gain, so they stay in `public/` and a `DIST_EXCLUDE` list in
  `vite.config.ts` keeps them out of `dist/` (about 42 MB). No file moved.
- **A5** (archive ~5.5 GB of `art/` and `docs/evidence/`): **skipped** as instructed: nothing
  deleted. Neither folder is copied into `dist/` (Vite copies only `public/`), so there is no leak
  to exclude. Proposal below.

### Part B

- **B1** (stop shipping loose PNGs and the monolithic manifest): **done** (e651ced7, d4ae4238).
  1. Standing previews: `build-sheets.py` writes `dist/fighters/previews/<id>.webp` for all 274
     bodies (3.6 MB in all) and repoints the split index. They are frame 0 at full size and lossless
     and exact, not trimmed as the handoff suggested: `ensurePosePreviews` rejects a preview whose
     size differs from the metadata, and full size keeps the menu pixel-identical.
  2. `--strip-frames` removes `dist/fighters/{poses,events,motion,identity,walk,assist}/` (29,285
     files) and `dist/fighters/pose-atlas.json`, refusing if any body lacks a sheet or preview. On an
     already packed dist it only strips, so CI strips after `run-all` (`sheet-render-qa` compares
     sheets with frames) instead of packing twice.
  3. Production already reads only sheets and split files; `?atlas=frames` and the per-frame
     fallback now only work in development and unstripped builds (README says so).
  4. CI: `dist-content-check --release` after the strip fails on any loose frame folder, the full
     manifest, a body without a sheet, a preview that is not the WebP copy, or `dist/` over
     `DIST_BUDGET_MB` (700). The handoff's 180/150 MB budget is not reachable: the lossless sprite
     sheets alone are 395 MB (pixel-exact, required by `sheet-render-qa`), and `dist/arcade/` is
     76 MB (A1). No `dist/arcade/` assertion, since A1 was skipped.
  5. (optional follow-up, committing sheets as source) **skipped**: owner decision, listed below.
- **B2** (stage, animation, UI, font and voice formats): **done** for stages, animations, menu art,
  power sprites and the font (82e0d4be); **skipped** for the voice.
  - Approach differs from the handoff: the PNG/TTF originals stay in `public/` (more than ten checks
    hash or read them) and `scripts/build-images.py` writes a copy next to each, recorded with its
    source hash in `scripts/manifests/media-copies.json`; `media-copies-smoke` fails on a missing
    or stale copy; the runtime loads the copies; `DIST_EXCLUDE` drops the originals from `dist/`.
  - Stages: 121 backgrounds, WebP quality 95 at their original size, 230.1 MB -> 55.7 MB. Not
    resized to 1920 or 1280 as the handoff proposed: the arena draws backgrounds nearest-neighbour
    from their own size, and a smaller source picks different pixels (measured PSNR 30 vs 37 at
    1280x720 for a 2688x1520 panorama); q89 visibly softened the pixel-art speckle at 3x zoom, q95
    did not. Spot check in Chromium, each copy drawn as the arena draws it against its original:
    sizes identical, PSNR median 35.8 dB, worst 29.5 dB (`nov04-bar-2`, indistinguishable at 2x
    zoom).
  - 26 story animation sheets, 6 menu images and 7 power sprites: lossless exact WebP,
    24.6 MB -> 14.6 MB, pixel-identical in Pillow; in Chromium composited over a background they
    differ by at most 1/255 (decoder rounding of semi-transparent pixels).
  - Font: `PixelifySans.woff2` (80 KB -> 30 KB), preloaded in `index.html`.
  - `retain.wav` -> MP3: **skipped**. 32 KB, loaded on demand, and lossy for no measurable gain.
  - Stage cache: `stageImages` keeps at most 6 decoded backgrounds (never the active one),
    `STAGE_IMAGE_CACHE` in `src/stage.ts`; three checks updated to that contract.
- **B3** (boot audio): **partial** (2834c8f9, 764bc9b2).
  1. Tiered loading: **done**. Boot loads the menu theme, the click and the shared combat clips;
     the match's theme loads with its art (`prepareBed` in `launchSelection` and `beginOnline`),
     each fighter's own Team Special clip when picked (`prepareFighters`, shared clip stands in
     until it arrives). Idle long themes now drop their file bytes too, so at most two are held.
  2. `<audio loop>` streaming: **skipped**. The themes rely on sample-accurate `loopStart`/`loopEnd`
     that trim MP3 encoder padding (README: menu 57.6 s, Trenches 360 s, ...); a media element
     cannot loop at those points, so the loops would audibly change.
  3. Re-encoding to 128 kbps: **skipped**: audible change and it shifts encoder padding the loop
     points depend on. With lazy loading only one theme is downloaded per match anyway.
  4. `audio-smoke` updated: shared clips decoded before a fight, no theme downloaded at boot, at
     most two themes held during a fight.
- **B4** (boot and match entry): **partial** (639ae850).
  1. Menu readiness on standing previews: **done**; the full default bodies still load (Resume needs
     them) but no longer gate the menu.
  2. Boot stage previews: **done**, the 8 zone previews instead of 46; the open zone's stages load
     with the menu as before.
  3. `<img>` thumbnails instead of 129 canvases: **skipped**. `drawStagePreview` reframes Verse and
     Castle depth bands and patches the Yacht pier, and crops to the button; a plain `<img>` of the
     preview would change those thumbnails. It is GPU memory, not network.
  4. One parallel load phase in `launchSelection`: **done**; the base stage background is skipped
     when story scenery replaces it, and loaded if the scenery fails.

### Part C

- **C1** (READY barrier): **done** (4c3a12ff, 37cfa4e5). Each side sends `{kind:'ready'}` on the
  existing `OP.SIGNAL` channel after loading; the versus card is skipped once the peer is ready and
  2.5 s have passed, or 6 s after loading without a READY (older client). The hub relays SIGNAL
  opaquely and reliably once a match is `playing` (set before START), so no hub change is needed;
  6 s stays under its 10 s input-stall forfeit (`STALL` in `sproto_duel.ts`).
- **C2** (preload during versus / ICE): **done**: `beginOnline` already runs on START beside ICE
  gathering; it now also starts the theme and the Team Special clips there.
- **C3** (TURN): **done** (4c3a12ff, 37cfa4e5). `parseIceServers` validates entries, requires
  username/credential for turn:/turns:, accepts one object or an array, falls back to STUN;
  `tests/online-ready.test.ts`; README documents the variable with a TURN example and the warning
  that the value is public.
- **Hub protocol check** (read `metaverse-hub` `server/modules/src` at its default branch): op codes
  match (HELLO 1, START 2, SIGNAL 3, RELAY 4, OUTCOME 6, CANCEL 7, INPUTS 8); `main.ts` registers
  `sproto_duel`; the vendored `sproto-sim.pin.json` has `simVersion` `21168f77260c4c3c`, the same as
  this branch (`src/sim/` is unchanged, and `build-sim-bundle.mjs` reproduces it), so no bundle
  refresh. Gaps: the hub has no READY op of its own (not needed); it never verifies a TURN setup;
  its pin names fighter commit `5b9244ab`, which predates this branch but has the same simulation.

## Checks

| Phase | Command | Result |
| --- | --- | --- |
| 0 | `npm run check` | pass |
| 0 | `npm run test:fast` | pass: vitest 34 files / 380 tests; 70/70 checks |
| 0 | `node scripts/run-all.mjs sprite-scale-qa game-qa throw-smoke` (slow roster audits) | pass, 3/3 |
| 0 | `npm run build` + `node scripts/dist-content-check.mjs` | pass: 254 fighters, 274 bodies, 121 stages, 112 sceneries resolve |
| 1-2 | `npm run check` | pass |
| 1-2 | `npm run test:fast` | pass: vitest 35 files / 387 tests; 71/71 checks (d4ae4238) |
| 1-2 | `npm run build:release` (build, pack with `--verify`, strip, `dist-content-check --release`) | pass: 254 fighters, 274 bodies (274 sheets, 274 previews), 121 stages, 112 sceneries; 669.0 MB |
| 1-2 | `node scripts/build-sim-bundle.mjs` | `21168f77260c4c3c`, unchanged |
| 3 | `npm run build` + `build-sheets.py dist` (unstripped, for `sheet-render-qa`) + `npm run test:all` | pass: vitest 35 files / 387 tests; 75/75 checks including `sheet-render-qa`, `sprite-scale-qa`, `game-qa`, `throw-smoke` (at 57c0956f) |
| 3 | `python3 scripts/build-sheets.py dist --verify` rerun on that packed dist | pass, every frame verified (after the fix in the final commits) |
| final | `npm run check`, `npm run build`, `npm run test:fast` | pass: 387 tests; 71/71 checks (d4f5c529 and the status commit after it) |

Not run here: `hub-duel-smoke` and `online-browser-smoke` need a local hub (Nakama and Postgres;
`NAKAMA_URL`, `HUB_DATABASE_URL`), and `determinism-smoke` across Firefox and WebKit needs those
browsers (CI installs them). `src/sim/` is unchanged and the golden hashes pass.

## Review

- `/code-review` (medium) on the branch diff: eight findings. Fixed in 58a8eb8d and 57c0956f: story
  world cards used the excluded stage PNGs (and `media-copies-smoke` now catches that class of
  bug), a hidden boot art failure, a failed launch pinning its theme, a failed theme download never
  retried, a released theme's PCM kept after decoding, `stuns:` URLs, `--strip-frames --verify`
  skipping the verify. The pre-existing "arena draws the menu preview" finding is recorded above.
- A fresh, independent subagent review of the full diff: confirmed no runtime request for any
  excluded or stripped file, `src/sim` and `tests/fixtures` untouched, and that
  `dist-content-check` resolves 254 fighters, 274 bodies (274 sheets, 274 previews) and 121 stages
  plus 112 sceneries. Two bugs fixed in the final commits: the last match's theme was never released
  (`preparedBed`), and `build-sheets.py` refused to re-pack a dist it had packed. Coverage gaps
  closed: `dist-content-check` now checks the story animation and boss sheets, and `audio-smoke`
  again checks the fighters' own Team Special clips. Noted, not changed: an old online client starts
  at 2.5 s while a new one opposite it waits up to 6 s for a READY that never comes; a sprite sheet
  that fails mid-session now fails the launch with a retry message instead of falling back to loose
  frames, in stripped builds only.

## Measurements

`dist/` from `npm run build` (unpacked: no sprite sheets) and from a packed release build
(`build-sheets.py dist --verify`, what CI uploads). Boot measured with `scripts/boot-payload.mjs`
(local server, Chromium, empty cache, no throttling): "ready" is when START FIGHT is enabled; "idle"
adds everything fetched until the network has been quiet for 6 s after one click; "fight" is what
pressing START FIGHT with the defaults then downloads.

| Build | dist | files | ready | boot requests / MB (ready) | idle requests / MB | first fight |
| --- | --- | --- | --- | --- | --- | --- |
| main, unpacked | 1043.1 MB | 32,098 | | | | |
| main, packed release | 1439.8 MB | 32,372 | 1.5 s | 331 / 84.8 MB | 332 / 84.8 MB (audio 71.4 MB in 49 requests) | 9 / 2.9 MB |
| after Phase 0, unpacked | 1001.2 MB | 30,869 | | | | |
| after Phase 1, unpacked | 821.7 MB | 31,117 | | | | |
| after Phases 1-2, release (stripped) | 669.0 MB | 2,379 | 0.6 s | 258 / 7.4 MB | 263 / 12.1 MB (audio 1.6 MB) | 12 / 10.2 MB (theme 8.9 MB) |

The first fight now downloads its own theme (8.9 MB) instead of boot downloading all eight. Of the
boot requests, 205 are portrait thumbnails of the roster grid (1.7 MB); lazy-loading those was not
in the handoff.

Repository: Phase 0 removed 964 PNGs (18.2 MB); Phase 1 added 161 generated copies (70.3 MB) beside
their originals.

Observation (not changed): when a stage's 640x360 menu preview is loaded, the arena draws that
preview rather than the full background (`drawStagePreview` prefers `previewImages`), so most free
fights show the upscaled preview and the downloaded full background is only a fallback; story
scenery always draws full size. Worth a look by the owner; changing it would change what fights look
like.

## Repo-hygiene proposals for the owner (nothing here was deleted)

- `public/arcade/` (76 MB, 673 files; A1): the legacy Sproto Arcade copy. If the standalone
  Sproto-Arcade repo now serves those games, delete the folder and the README's "Sproto Arcade"
  section; until then it ships in every build.
- `art/` (~23k files) and `docs/evidence/` (~6.6k files) (A5): move raw generations, `before/`
  backups, contact sheets and `.job-id` files to an archive (tag, separate repo, bucket or LFS),
  keeping what `.github/ci-checkout-paths.txt` lists (portraits and references, small JSON/config
  read by checks, `docs/evidence/movement-followup-20261102/`). Removing them from `HEAD` does not
  shrink clones; that needs a history rewrite, which is the owner's decision.
- `docs/balance/*.gz` (historical tournament dumps): archive out of `main`.
- B1.5: once the stripped builds have run in CI for a while, commit the sheets and previews as
  source and archive the 29k loose frame PNGs out of the tree.

## Cross-repo follow-ups

- metaverse-hub: no re-vendor or re-pin needed; `src/sim/` is unchanged and its pin
  (`21168f77260c4c3c`) matches. If a later change touches `src/sim/`, run
  `node scripts/build-sim-bundle.mjs --out <hub>/server/modules/vendor/sproto-sim.js` and update
  `sproto-sim.pin.json`.
- metaverse-hub deploy: set `VITE_ICE_SERVERS` with a TURN server for the hosted build (short-lived
  credentials), and confirm the hub fetches the stripped `web-build` artifact (no loose frames, no
  `fighters/pose-atlas.json`, `fighters/previews/`).
- hub-sdk: not re-vendored, as instructed.
