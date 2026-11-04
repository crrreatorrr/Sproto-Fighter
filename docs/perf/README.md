# Fighter-art loading: measurements

Measured with `scripts/perf-baseline.mjs` on 4 November 2026, headless Chromium
(software rendering) on a Linux container, network throttled to 20 Mbit/s with
40 ms latency, fresh cache. Same eight rival picks in both builds. Raw output:
[before.json](before.json), [after.json](after.json).

| Step | Before (main 322e333a) | After |
|---|---|---|
| Boot: page load until START FIGHT is ready | 31.9 s | 5.4 s |
| Browse: 8 rival picks 150 ms apart, until ready | 80.8 s, 16.8 MB | 2.2 s, 1.4 MB |
| Settle: re-pick the default rival, wait 2 s | 18.8 s (earlier loads still running) | 2.1 s (the wait itself) |
| Start: press START FIGHT until the fight shows | 0.79 s | 0.82 s |
| Decoded fighter art held afterwards | about 359 MB, 14 bodies (estimated) | 23 MB, 4 bodies (game counter) |

Both builds download the same 11 MB at boot. The boot difference is processing:
the old loader cut each body's sheet into 100-170 separate full-size bitmaps,
the new one decodes one trimmed sheet per body. Absolute times on real hardware
with GPU rendering will be lower for both; the comparison is like for like.

"Before" memory is estimated as 256 x 256 x 4 bytes per frame of every body the
old build fetched (it kept up to 16), which is how that loader stored frames.

## What changed

- **Trimmed sprite sheets** (`scripts/build-sheets.py`). Each frame keeps only its
  visible pixels plus 4 transparent pixels; cells record where the rectangle sat
  in the frame. All 248 bodies decode to 1,588 MB instead of 6,488 MB (24%).
  Median body 6.6 MB, largest 16 MB. Frame metadata (anchors, bounds, hulls,
  throw contact points) is untouched, and gameplay never reads art.
- **One decoded bitmap per body**, drawn by region, instead of one bitmap per frame.
- **Selection menu** loads each pick's standing pose only (one ~20 KB image);
  full bodies load after a pick has settled for 300 ms, and only for the latest pick.
- **Cache**: the bodies of the match in play are pinned; others are released
  (bitmaps closed) past 16 bodies or 160 MB.
- `?atlas=frames` ignores sheets and loads each frame PNG, for field debugging.

## How it is verified

- `build-sheets.py --verify`: every one of the 25,502 frames is byte-identical
  inside its trimmed rectangle and fully transparent outside it; every body file
  equals the source manifest apart from `sheet`.
- `scripts/sheet-render-qa.mjs`: renders the sheets and the frame PNGs in Chromium
  and compares every pixel: all frames of a body at four transforms (including
  the smallest in-game scale, rotation and the defeat break-apart), menu poses,
  and 300 frames of CPU matches. With `--all` (every body, 1,302 images,
  862 million drawn pixels): 99.64% identical, 0.36% nearest-pixel sampling ties,
  0 wrong. A planted one-pixel offset fails it on every image.
- `scripts/fighter-budget-qa.mjs` blocks a body over 176 frames or about 16 MB
  trimmed, or a portrait over budget; the packer blocks a sheet over 20 MB.
- `tests/sim-isolation.test.ts` keeps the sim and netcode from importing art.

## Not done

Replacing the hit-flash `brightness()` filter with an additive second draw was
about twice as fast, but in Chromium a sheet region drawn with `lighter`
samples differently from a whole PNG, so it changed flash pixels.
`sheet-render-qa` caught it and the filter stays.
