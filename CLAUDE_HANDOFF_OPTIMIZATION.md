# Claude Code Implementation Handoff — `Sproto-Fighter` (Sproto Arena)

**Branch:** `claude/lightening-fast-load-handoff`  
**Scope:** Dramatically lighten the repository (~7.2 GB / 62,487 files → <250 MB), shipped `dist/` build (>1.0 GB / ~31,800 files → ~100–140 MB), cold-boot download (~80+ MB → ~2–4 MB), match-entry time (6–10 MB sequential → 1.2–2.5 MB parallel), and peak RAM (~400 MB → ~150 MB) **WITH ZERO GAMEPLAY CHANGES AND ALL 254 PLAYABLE FIGHTERS (274 BODIES), 121 STAGES, AND 247 STORY ENCOUNTERS 100% PRESERVED**.

---

## 0. Hard Invariants (DO NOT VIOLATE)

- **Zero gameplay changes:** Do **not** alter `src/sim/` combat math, hitboxes, frame data, or `SIM_VERSION`. All golden state hashes (`tests/golden-state-hashes.test.ts`) and sim isolation tests (`tests/sim-isolation.test.ts`) must remain bit-exact identical.
- **Zero roster/content reduction:** All **254 playable fighters** (`PLAYABLE_FIGHTERS`/`ROSTER` in `src/sim/roster.ts`), **22 paired companions** (274 active body atlases), **121 selectable stages** (`src/stage.ts`), **247 story encounters**, **8 cutscenes**, and **6 story bosses** must remain 100% playable and visually intact.
- **Repo scale awareness:** Use narrow/sparse checkout (`.github/ci-checkout-paths.txt`) if working on a fresh clone. Never push directly to `main`; open a PR after running checks.

---

## 1. Part A — Safe Immediate Deletions (0 Runtime, 0 Gameplay, 0 Roster Impact)

Execute these deletions in clean, verifiable commits (verify zero references before removing each group):

### A1. Delete Dead `public/arcade/` Sub-App (~673 files, ~150–300 MB saved from repo + `dist/`)
- **Target:** `public/arcade/` (`Box Barrage/` 330 files, `Campaign/` 239 files, `Tidebreak Marina/` 103 files, `index.html`).
- **Why safe:** Legacy copy of `Sproto-Arcade` with **zero references** anywhere in `src/`, `scripts/`, or `tests/`, yet Vite blindly copies the entire directory into every `dist/arcade/` release artifact.
- **Verification:** `rg "public/arcade|/arcade/" src scripts tests` returns zero runtime/test hits; delete `public/arcade/`.

### A2. Delete 4 Orphaned Fighter Companion Directories (416 PNGs, ~8–10 MB)
- **Targets** under `public/fighters/{poses,events,motion,walk}/`:
  - `sproto1870-companion`
  - `sproto313-companion`
  - `sproto3181-companion2`
  - `sproto999-companion`
- **Why safe:** None of these 4 IDs exist in `PAIRED_BODY_IDS` (`src/sim/roster.ts`) or `public/fighters/pose-atlas.json`. Cross-check against `pose-atlas.json` programmatically before `git rm -r`.

### A3. Delete Unreferenced Backup & Duplicate Frame PNGs in `public/fighters/` (~550–600 PNGs, ~10–15 MB)
- **Targets:**
  - 407 `scale-fix/` and `scale-body-128/` backup PNGs across 14 fighter directories.
  - Duplicate numbered vs named frame files (`00.png..31.png` alongside `00-guard.png..31-special.png`) and duplicate `poses/<id>/walk/` dirs overlapping `walk/<id>/` in `guest09`, `guest10`, `mox`, `vamp`.
- **Safe Scripted Approach:** Write a one-time audit script `scripts/prune-unreferenced-fighter-frames.mjs` that parses `public/fighters/pose-atlas.json` to collect the exact set of referenced relative paths, verifies 100% of all 274 active body IDs in `src/sim/roster.ts` remain covered, and deletes ONLY files under `public/fighters/{poses,events,motion,identity,walk,assist}/` not in that referenced set.

### A4. Delete Superseded Campaign Maps & Dead `public/` Audio/Manifests (17 files, ~3–8 MB)
- **Delete:**
  - `public/story/campaign-map.webp` and `public/story/campaign-map-expanded.webp` (`src/campaignMap.ts:19` loads only `campaign-map-250.webp`).
  - `public/audio/sfx/combat/ko_02.mp3` (explicitly marked `"Shipped, not played"` in `src/combatSfx.ts:10`).
  - `public/audio/sfx/combat/manifest.csv`
  - 9 `public/audio/music/*.json` metadata files
  - `public/stages/nov04/manifest.json` and `public/stages/variations-v2/manifest.json`
- **Relocate out of `public/`** (so Vite stops copying QA-only JSONs to `dist/`):
  - Move `public/portraits/manifest.json` and `public/stages/previews/manifest.json` to `scripts/manifests/` and update `scripts/portraits-smoke.mjs` and `scripts/stage-previews-smoke.mjs` to read from the new path.

### A5. Archive Non-Runtime Authoring & QA Bloat Out of Main Git Tree (~29,700+ files, ~5.5–6.0 GB)
- **Targets (already excluded from `.github/ci-checkout-paths.txt`):**
  - `art/` (**23,373 files**): Keep ONLY the 254 reference portrait PNGs read by `src/originalPortraits.ts` / `scripts/build-images.py` / `portraits-smoke.mjs` (relocated cleanly to `portrait-sources/` or kept minimal) plus any tiny JSON/config files referenced by active scripts; move raw Higgsfield generations, `before/` backups, contact sheets, and `.job-id` files to an archival tag/repo or R2/S3 bucket (or Git LFS).
  - `docs/evidence/` (**6,640 files**, 3,822 PNGs + 983 JPGs + 1,730 TXTs): Keep ONLY the 76 files under `docs/evidence/movement-followup-20261102/` referenced by `scripts/motion-fix-smoke.mjs` & `movement-visual-coverage.mjs` (or move those JSON fixtures into `tests/fixtures/`); archive the rest.
  - `docs/balance/*.gz` (61 historical tournament dumps): Archive out of `main`.
- **Important:** Coordinate with repo owner before rewriting Git history (`git filter-repo`); removing from `HEAD` first in this PR is non-destructive and immediately stops future checkouts/CI from touching them.

---

## 2. Part B — Shipped `dist/` Diet, Format Conversion & Boot/Load Optimization

### B1. Stop Shipping ~29,000 Loose Fighter PNGs & Monolithic `pose-atlas.json` in `dist/` (-550–650 MB in `dist/`)
- **Files:** `scripts/build-sheets.py`, `vite.config.ts` (`poseAtlasSplit()` lines `16–48`), `src/poseAtlas.ts:172-200`, `.github/workflows/web-build.yml`
- **Current Problem:** `scripts/build-sheets.py` ALREADY packs every body into a trimmed lossless WebP sprite sheet (`dist/fighters/sheets/<id>.webp`, 1 HTTP request/body, ~24% decoded RAM). However:
  1. `vite.config.ts:26-28` still points `/fighters/pose-atlas/index.json` standing previews at raw loose `frames[0]` PNGs (`ensurePosePreviews`).
  2. `dist/` retains all ~29,000 loose PNGs + the monolithic multi-MB `public/fighters/pose-atlas.json` even though production only reads `sheets/<id>.webp` + split `/fighters/pose-atlas/<id>.json`.
- **Exact Changes:**
  1. Extend `scripts/build-sheets.py` to emit **274 trimmed lossless WebP standing-pose previews** (`dist/fighters/previews/<id>.webp`, ~5–12 KB each) extracted directly from frame 0 of each body, and update `dist/fighters/pose-atlas/index.json` preview URLs to `/fighters/previews/<id>.webp`.
  2. Add a `--strip-frames` flag to `scripts/build-sheets.py` (or a post-QA CI step in `.github/workflows/web-build.yml` *after* `sheet-render-qa.mjs` compares sheets against loose frames) that removes:
     - `dist/fighters/{poses,events,motion,identity,walk,assist}/`
     - `dist/fighters/pose-atlas.json` (monolithic fallback; keep split `dist/fighters/pose-atlas/index.json` and `dist/fighters/pose-atlas/<id>.json`)
  3. Ensure `src/poseAtlas.ts` cleanly uses `sheets/<id>.webp` + `previews/<id>.webp` in production builds (retain `?atlas=frames` only in `import.meta.env.DEV`).
  4. Add a CI assertion failing the build if `dist/arcade/` exists, if any loose PNGs remain under `dist/fighters/{poses,events,motion,identity,walk,assist}/`, or if `dist/` exceeds `180 MB` (tighten to `150 MB` after B2+B3).
  5. *(Optional follow-up PR)*: Once WebP sheets + previews are battle-tested in CI, commit `public/fighters/sheets/*.webp` + `previews/*.webp` + split JSONs as canonical repo source and archive the 30,249 loose PNGs out of Git.

### B2. Convert 121 Stage PNGs, 26 Story-Animation PNGs, 13 UI/Power PNGs, Font & Voice to WebP/WOFF2/MP3
- **Files:** `src/stage.ts` (`STAGES`, `stageImages` line `318`), `src/stageVariants.ts`, `src/storyAnimationManifest.json`, `src/storyBoss.ts:384,391`, `src/powerArt.ts:21-27`, `src/characterVoice.ts:9`, `src/{arcadeSelection,mysticUI,fullscreen,versusScreen}.css`, `index.html:2`, `scripts/build-images.py`
- **Current Problem:**
  - All **121 full-res stages** (`public/stages/{higgsfield,nov04,variations-v2}`) are opaque **PNGs** totaling **~250–350 MB** (24 `variations-v2` panoramas are `2688×1520` = 105.5 MiB for a `1280×720` canvas!). Each stage download takes 2–5 MB on match entry and leaks ~16 MB decoded RGBA in `stageImages` forever.
  - All **26 `public/story-animations/*.png`** (up to `5760×1536` / `5120×3360`) are raw PNGs.
  - 6 `public/menu/higgsfield/*.png`, 7 `public/fighters/powers/*.png`, `public/fonts/PixelifySans.ttf`, and `public/fighters/voices/retain.wav` are uncompressed formats.
- **Exact Changes:**
  1. Write/update a conversion script (`scripts/optimize-media.py` using Pillow/cwebp) to convert:
     - All **121 stage PNGs** → **WebP q=89** resized to max `1920×1080` (or `1280×720` matching canvas — zero visual quality loss on the 720p arena, shrinks **250–350 MB → ~15–25 MB**, **~120–250 KB/stage**, 10–20× faster match entry!). Update `.png` → `.webp` paths in `src/stage.ts` and `src/stageVariants.ts` (and remove old stage PNGs).
     - All **26 `public/story-animations/*.png`** → **lossless WebP (`lossless=True, exact=True`)** (bit-identical pixels, 30–50% smaller). Update `src/storyAnimationManifest.json` and `src/storyBoss.ts:384,391` (`${key}-attacks.webp` / `${key}-projectiles.webp`).
     - 6 `public/menu/higgsfield/*.png` → WebP (update CSS `url(...)` references) and 7 `public/fighters/powers/*.png` → lossless WebP (update `src/powerArt.ts:21-27`).
     - `public/fonts/PixelifySans.ttf` → `PixelifySans.woff2` (update `index.html:2` & `@font-face`).
     - `public/fighters/voices/retain.wav` → `retain.mp3` (update `src/characterVoice.ts:9`).
  2. **Cap `stageImages` Cache (`src/stage.ts:318`):** Turn `stageImages` into a simple LRU Map capped at **6 entries** (evicting oldest decoded `HTMLImageElement`/`ImageBitmap` entries not currently active) so long play sessions cannot leak unbounded stage VRAM.

### B3. Kill the ~70+ MB Boot Audio Stampede & 142 MB PCM RAM Spike
- **Files:** `src/audio.ts:371-409, 431, 712`, `src/combatSfx.ts`, `src/main.ts:135`, `scripts/audio-smoke.mjs:26`
- **Current Problem:** `createAudio()` synchronously calls `requestSamples()` at page boot (`audio.ts:712`), firing **50 parallel fetches (~70+ MB)**: all 8 five-to-six-minute fight MP3s (**~68.8 MB**: `trenches` 8.6 MB, `city/yacht/ranch/castle/verse/hatchery` 8.8 MB ea, `bar` 7.4 MB) + all 40 combat SFX (27 are fighter-specific Team Specials). This chokes cold boot, pins 69 MB of raw `ArrayBuffer`s permanently, and decodes the active track into **118–142 MB of uncompressed Float32 PCM RAM** (`audio.ts:431`).
- **Exact Changes:**
  1. **Tiered Lazy Audio Loading in `src/audio.ts` & `src/combatSfx.ts`:**
     - **Boot (`requestSamples()`):** Fetch ONLY `menu_theme_loop.mp3`, `ui_select.mp3`, and the **13 shared combat SFX MP3s** (or trigger on first user gesture/`unlock()`).
     - **On Stage/Zone Selection or Match Launch:** Add `ensureZoneMusic(zoneId)` to fetch ONLY the selected zone's fight MP3. Evict raw `row.bytes` / `AudioBuffer` of previously loaded long fight tracks when switching zones (keep max 1 fight track decoded).
     - **On Fighter Selection / Match Launch:** Add `ensureFighterAudio(fighterIds)` to fetch ONLY the active fighters' Team Special MP3s from `FIGHTER_SPECIAL_FILES` (eliminating 27 unneeded boot fetches).
  2. **Eliminate 142 MB PCM Decode Spike:** Stream long background music tracks (`menu_theme_loop` + 8 fight themes) via `<audio loop>` (routed into WebAudio `MediaElementAudioSourceNode` for existing volume/mute gain control) instead of `decodeAudioData()` into giant Float32 PCM buffers—drops music RAM from **~142 MB → ~0 MB** AND starts playback immediately via progressive HTTP range streaming without waiting for full download!
  3. **Compress Fight Music:** Re-encode the 8 fight MP3s at `128 kbps` (and optionally tighten 6-min tracks to seamless ~2.5–3 min musical loops) to cut `public/audio/music/` from **~69 MB → ~15–22 MB**.
  4. Update `scripts/audio-smoke.mjs:26` to verify shared clips load on boot and per-fighter/per-zone audio loads on selection.

### B4. Unblock Boot, Replace 129 Menu Canvases With Lazy `<img>`, & Parallelize Match Entry
- **Files:** `src/main.ts:381-404, 1388-1390`, `src/selectionMenu.ts:48-49, 75, 82`
- **Current Problem:**
  1. `main.ts:1388` blocks `START FIGHT` on `ensurePoseAtlases(['highsproto', 'vela'], { pin: true })`, which via `expandBodies()` downloads & decodes **4 full bodies** (~4–8 MB download / ~23 MB decoded) before the menu is ready.
  2. `main.ts:1390` eagerly fetches **46 stage preview WebPs** (`STAGES.filter(stage => !stage.parent)`) at boot.
  3. `selectionMenu.ts:48-82` creates **129 `<canvas width="256" height="110">` elements** (~14.5 MB GPU backing store) and redraws all visible thumbnails on every fighter click, stage click, and resize.
  4. `launchSelection()` (`main.ts:381-404`) runs **4 sequential `await` phases** (`loadStageArt` → `ensurePoseAtlases`+`ensurePowerArt` → `loadStoryLocation` → `loadStoryBossArt`+`storyAnimation.load`), even fetching base stage art when `scenery` overrides it!
- **Exact Changes:**
  1. At `main.ts:1388`, call `ensurePosePreviews(['highsproto', 'vela'])` (~40 KB total across 4 WebP previews) and enable `START FIGHT` immediately; let the existing 300 ms settle prefetch (`prepareSelectionArt`) fetch full sheets in the background.
  2. At `main.ts:1390`, preload ONLY the **8 zone main previews** (`STAGE_ZONES.map(z => z.id)`) + the active zone's variations; lazy-load other zones when clicked.
  3. In `src/selectionMenu.ts`, replace all 129 thumbnail `<canvas>` elements with `<img src="/stages/previews/${id}.webp" width="256" height="110" loading="lazy" decoding="async">`, deleting the redundant `drawImage` redraw loops on click/resize.
  4. In `launchSelection()` (`main.ts:381-404`), determine whether story `scenery` overrides `setup.stage` upfront (skipping the unused stage fetch!) and kick off stage/scenery, `ensurePoseAtlases`, `ensurePowerArt`, `ensureZoneMusic`, `ensureFighterAudio`, `loadStoryBossArt`, and `storyAnimation.load` inside **one parallel `Promise.all([...])`**.

---

## 3. Part C — Multiplayer Launch Readiness

- **Files:** `src/main.ts:1078-1104`, `src/net/hubDuel.ts`, `src/net/peer.ts:26-32`, `src/net/protocol.ts`
- **Exact Changes:**
  1. **Pre-Match `READY` Sync Barrier:** Replace the fixed local `2500ms` `setTimeout` in `beginOnline()` (`main.ts:1078-1104`) with an explicit `OP.READY` peer handshake once both clients finish `Promise.all([ensurePoseAtlases, loadStageArt, ensureFighterAudio])` (with a safety timeout fallback), preventing asymmetric-load frame stalls/rollbacks at round start.
  2. **Preload During Versus / ICE Gather:** Kick off opponent sheet + WebP stage + audio loading immediately upon receiving `OP.START` in parallel with WebRTC ICE negotiation.
  3. **TURN Config:** Verify `VITE_ICE_SERVERS` JSON parsing in `src/net/peer.ts:26-32` supports TURN credentials cleanly and document required env var for production deploys once `metaverse-hub` merges `claude/sproto-online-duels`.

---

## 4. Verification Checklist

Run before opening PR (from `AGENTS.md`):
```bash
npm run check
npm run test:fast
npm run build:release   # tsc --noEmit && vite build && python3 scripts/build-sheets.py dist --verify
npm run test:all
```
Verify explicitly:
- All **254 fighters** (`ROSTER.length === 254`) & **121 stages** (`STAGES.length === 121`) render with zero missing textures or 404s.
- `tests/golden-state-hashes.test.ts` and `tests/sim-isolation.test.ts` pass with **unchanged `SIM_VERSION`**.
- Measure cold boot network transfer in Playwright/DevTools: confirm **<4 MB** (down from ~80+ MB) and `dist/` total size **<150 MB** (down from >1.0 GB) with zero `dist/arcade/` and zero loose PNGs under `dist/fighters/{poses,events,motion,identity,walk,assist}/`.
