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

## Checks

| Phase | Command | Result |
| --- | --- | --- |
| 0 | `npm run check` | pass |
| 0 | `npm run test:fast` | pass: vitest 34 files / 380 tests; 70/70 checks |
| 0 | `node scripts/run-all.mjs sprite-scale-qa game-qa throw-smoke` (slow roster audits) | pass, 3/3 |
| 0 | `npm run build` + `node scripts/dist-content-check.mjs` | pass: 254 fighters, 274 bodies, 121 stages, 112 sceneries resolve |

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

## Cross-repo follow-ups
